from django.urls import path
from .views import UserProcessedTracksListAPIView, ProcessTrackAPIView, ProcessedTrackDownloadAPIView, ProcessedTrackDeleteAPIView

urlpatterns = [
    path("processed_tracks/", UserProcessedTracksListAPIView.as_view(), name="user_processed_tracks"),
    path("tracks/process/", ProcessTrackAPIView.as_view(), name="process_track"),
    path("tracks/<int:pk>/download/", ProcessedTrackDownloadAPIView.as_view(), name="processed_download"),
    path("tracks/<int:pk>/delete/", ProcessedTrackDeleteAPIView.as_view(), name="processed_delete"),
]
