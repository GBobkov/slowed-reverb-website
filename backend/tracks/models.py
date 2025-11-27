from django.db import models
from django.conf import settings

class Track(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='tracks/originals/')
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.original_filename} ({self.user.email})"

    def latest_processed(self):
        return self.processedtrack_set.order_by('-created_at').first()


class ProcessedTrack(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    speed_factor = models.FloatField(default=1.0)
    reverb_amount = models.IntegerField(default=0)
    file = models.FileField(upload_to='tracks/processed/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.track.original_filename} - processed ({self.user.email})"
