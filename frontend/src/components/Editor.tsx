import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Upload, Play, Pause, Download, Zap, X } from "lucide-react";
import { useAuth } from "../AuthContext";

export function EditorPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, accessToken, loading } = useAuth();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [processedTrack, setProcessedTrack] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [reverb, setReverb] = useState([0]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) setAudioFile(file);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  useEffect(() => {
    if (!audioFile) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    audioRef.current = new Audio(URL.createObjectURL(audioFile));
    audioRef.current.onloadedmetadata = () => setDuration(audioRef.current?.duration || 0);
    audioRef.current.ontimeupdate = () => setCurrentTime(audioRef.current?.currentTime || 0);
    audioRef.current.onended = () => setIsPlaying(false);

    setIsPlaying(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [audioFile]);

  const handlePlayToggle = async () => {
    if (!audioRef.current) return;

    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcess = async () => {
    if (!audioFile) return alert("Select a file");
    if (!accessToken) return alert("You must be logged in to process audio");

    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", audioFile);
      fd.append("speed_factor", String(speed[0]));
      fd.append("reverb_amount", String(reverb[0]));

      const res = await fetch(API_URL + "tracks/process/", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Processing failed");
      }

      const data = await res.json();
      setProcessedTrack(data);
      await fetchAndPlayProcessed(data.id);
    } catch (e: any) {
      alert(e.message || "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const fetchAndPlayProcessed = async (id: number) => {
    try {
      if (!audioRef.current) audioRef.current = new Audio();

      const res = await fetch(API_URL + `tracks/${id}/download/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch processed audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;

      audioRef.current.onloadedmetadata = () => setDuration(audioRef.current?.duration || 0);
      audioRef.current.ontimeupdate = () => setCurrentTime(audioRef.current?.currentTime || 0);
      audioRef.current.onended = () => setIsPlaying(false);

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.error(err);
      alert("Cannot play processed audio");
    }
  };

  const handleDownload = async () => {
    const track = processedTrack || audioFile;
    if (!track) return alert("No file to download");

    try {
      if (processedTrack) {
        const res = await fetch(API_URL + `tracks/${processedTrack.id}/download/`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Download failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = processedTrack.original_filename
          ? `${processedTrack.original_filename}_slowed.mp3`
          : "processed.mp3";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const url = URL.createObjectURL(audioFile as File);
        const a = document.createElement("a");
        a.href = url;
        a.download = (audioFile as File).name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Download failed");
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1>Audio Editor</h1>
          <p className="text-muted-foreground">Upload your audio file and adjust the effects</p>
        </div>

        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p>{audioFile ? audioFile.name : "Drag and drop your audio file here"}</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">Select File</Button>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
          </div>
        </Card>

        {audioFile && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Now Playing</p>
                <p>{audioFile.name}</p>
              </div>
              <Button size="icon" variant="outline" onClick={handlePlayToggle}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>

            <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
              <div className="flex gap-1 items-end h-16">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="w-1 bg-primary/40 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                ))}
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.01}
                value={currentTime}
                onChange={(e) => {
                  if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
                  setCurrentTime(Number(e.target.value));
                }}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">{Math.floor(currentTime)} / {Math.floor(duration)} sec</p>
            </div>
          </Card>
        )}

        {audioFile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label>Speed</label>
                  <span className="text-muted-foreground">{speed[0]}x</span>
                </div>
                <p className="text-sm text-muted-foreground">Adjust playback speed</p>
              </div>
              <div className="h-48 flex items-center justify-center">
                <Slider value={speed} onValueChange={setSpeed} min={0.5} max={1} step={0.05} orientation="vertical" className="h-full" />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0.5x</span>
                <span>1.0x</span>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label>Reverb</label>
                  <span className="text-muted-foreground">{reverb[0]}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Add atmospheric reverb</p>
              </div>
              <div className="h-48 flex items-center justify-center">
                <Slider value={reverb} onValueChange={setReverb} min={0} max={100} step={5} orientation="vertical" className="h-full" />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Dry</span>
                <span>Wet</span>
              </div>
            </Card>
          </div>
        )}

        {audioFile && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 gap-2" size="lg" onClick={handleProcess} disabled={processing}>
              <Zap className="w-4 h-4" /> {processing ? "Processing..." : "Process Audio"}
            </Button>
            <Button className="flex-1 gap-2" size="lg" variant="outline" onClick={handleDownload} disabled={!audioFile && !processedTrack}>
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
