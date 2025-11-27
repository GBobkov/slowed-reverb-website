from rest_framework import serializers
from .models import Track, ProcessedTrack

class ProcessedTrackSerializer(serializers.ModelSerializer):
    original_filename = serializers.CharField(source="track.original_filename", read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = ProcessedTrack
        fields = ("id", "original_filename", "speed_factor", "reverb_amount", "created_at", "download_url")

    def get_download_url(self, obj):
        request = self.context.get("request")
        return f"/api/tracks/{obj.id}/download/"
