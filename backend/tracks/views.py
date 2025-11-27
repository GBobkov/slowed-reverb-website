import os
from django.conf import settings
from django.http import FileResponse, Http404
from django.core.files import File
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import Track, ProcessedTrack
from .serializers import ProcessedTrackSerializer
from pydub import AudioSegment

class UserProcessedTracksListAPIView(generics.ListAPIView):
    serializer_class = ProcessedTrackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProcessedTrack.objects.filter(user=self.request.user)
        name = self.request.GET.get("name")
        if name:
            queryset = queryset.filter(track__original_filename__icontains=name)
        date_from = self.request.GET.get("date_from")
        date_to = self.request.GET.get("date_to")
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        return queryset.order_by("-created_at")


def process_audio_file(input_path: str, speed: float, reverb: int) -> str:
    audio = AudioSegment.from_file(input_path)
    if speed != 1.0:
        new_frame_rate = int(audio.frame_rate * speed)
        audio = audio._spawn(audio.raw_data, overrides={"frame_rate": new_frame_rate})
        audio = audio.set_frame_rate(44100)

    if reverb and reverb > 0:
        wet = audio - 10
        delay_ms = 50
        mix = audio
        repeats = max(1, reverb // 20)
        for i in range(1, repeats + 1):
            atten = max(6, 20 - i*3)
            copy = wet - atten
            mix = mix.overlay(copy, position=i * delay_ms)
        audio = mix

    basename = os.path.basename(input_path)
    name, ext = os.path.splitext(basename)
    out_name = f"{name}_processed_{int(speed*100)}_{reverb}{ext or '.mp3'}"
    out_path = os.path.join(settings.MEDIA_ROOT, "tracks", "processed", out_name)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    audio.export(out_path, format="mp3")
    return out_path


class ProcessTrackAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        speed = request.POST.get("speed_factor")
        reverb = request.POST.get("reverb_amount")

        if not uploaded_file:
            return Response({"detail": "File required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            speed = float(speed) if speed is not None else 1.0
        except:
            speed = 1.0
        try:
            reverb = int(reverb) if reverb is not None else 0
        except:
            reverb = 0

        track = Track.objects.create(
            user=request.user,
            original_filename=uploaded_file.name,
            file=uploaded_file
        )

        input_path = track.file.path
        processed_path = process_audio_file(input_path, speed, reverb)

        with open(processed_path, "rb") as f:
            django_file = File(f)
            processed = ProcessedTrack.objects.create(
                track=track,
                user=request.user,
                speed_factor=speed,
                reverb_amount=reverb,
            )
            filename = os.path.basename(processed_path)
            processed.file.save(filename, django_file, save=True)

        serializer = ProcessedTrackSerializer(processed, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProcessedTrackDownloadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            processed = ProcessedTrack.objects.get(pk=pk)
        except ProcessedTrack.DoesNotExist:
            raise Http404

        if processed.user_id != request.user.id:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        file_path = processed.file.path
        if not os.path.exists(file_path):
            raise Http404

        return FileResponse(open(file_path, "rb"), as_attachment=True, filename=os.path.basename(file_path))


class ProcessedTrackDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            processed = ProcessedTrack.objects.get(pk=pk)
        except ProcessedTrack.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        if processed.user_id != request.user.id:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        try:
            if processed.file and os.path.exists(processed.file.path):
                os.remove(processed.file.path)
        except Exception as e:
            return Response({"detail": f"Failed to delete file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        processed.delete()
        return Response({"detail": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
