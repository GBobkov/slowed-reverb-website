import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Pause, Download, Trash, Music, X } from "lucide-react";
import { useAuth } from "../AuthContext";

interface Track {
  id: number;
  name: string;
  date: string;
  speed: number;
  reverb: number;
}

export function LibraryPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, accessToken, loading } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [deleteModalTrack, setDeleteModalTrack] = useState<Track | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchTracks = async () => {
      if (!user || !accessToken) {
        setTracks([]);
        setLoadingTracks(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}processed_tracks/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to load tracks");
        const data = await res.json();
        const mapped = data.map((t: any) => ({
          id: t.id,
          name: `${t.original_filename} - slowed`,
          date: t.created_at,
          speed: t.speed_factor,
          reverb: t.reverb_amount,
        }));
        setTracks(mapped);
      } catch (err) {
        console.error(err);
        setTracks([]);
      } finally {
        setLoadingTracks(false);
      }
    };

    fetchTracks();
  }, [user, accessToken]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handlePlayToggle = async (trackId: number) => {
    if (!accessToken) return;
    if (!audioRef.current) audioRef.current = new Audio();

    if (playingTrackId === trackId) {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}tracks/${trackId}/download/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;

      audioRef.current.onloadedmetadata = () => setDuration(audioRef.current?.duration || 0);
      audioRef.current.ontimeupdate = () => setCurrentTime(audioRef.current?.currentTime || 0);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlayingTrackId(null);
        setCurrentTime(0);
      };

      await audioRef.current.play();
      setPlayingTrackId(trackId);
      setIsPlaying(true);
      setCurrentTime(0);
    } catch (err) {
      console.error(err);
      alert("Cannot play track");
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = async (trackId: number, name: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}tracks/${trackId}/download/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Download failed");
    }
  };
  
  const handleDeleteConfirmed = async () => {
    if (!deleteModalTrack || !accessToken) return;

    try {
      const res = await fetch(`${API_URL}tracks/${deleteModalTrack.id}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete track");

      setTracks((prev) => prev.filter((t) => t.id !== deleteModalTrack.id));

      if (playingTrackId === deleteModalTrack.id && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        setIsPlaying(false);
        setPlayingTrackId(null);
        setCurrentTime(0);
      }

      setDeleteModalTrack(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Checking session...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p>You are not logged in.</p>
        <Button onClick={() => onNavigate("account")}>Go to Login / Register</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1>{user.name}'s Library</h1>
          <p className="text-muted-foreground">Access your previously processed tracks</p>
        </div>

        {loadingTracks ? (
          <p>Loading...</p>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p>No tracks in your library yet</p>
              <p className="text-sm text-muted-foreground">Process some audio files to see them here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => (
              <Card key={track.id} className="p-6 space-y-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0">
                    <Music className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate">{track.name}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(track.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-muted rounded">Speed: {track.speed}x</span>
                  <span className="px-2 py-1 bg-muted rounded">Reverb: {track.reverb}%</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handlePlayToggle(track.id)}
                    >
                      {playingTrackId === track.id && isPlaying ? (
                        <>
                          <Pause className="w-3 h-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" /> Play
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleDownload(track.id, track.name)}
                    >
                      <Download className="w-3 h-3" /> Download
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => setDeleteModalTrack(track)}
                    >
                      <Trash className="w-3 h-3" /> Delete
                    </Button>
                  </div>

                  {playingTrackId === track.id && (
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full"
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* --- Delete Modal --- */}
      {deleteModalTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <Button size="icon" variant="ghost" onClick={() => setDeleteModalTrack(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p>Are you sure you want to delete <strong>{deleteModalTrack.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteModalTrack(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirmed}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
