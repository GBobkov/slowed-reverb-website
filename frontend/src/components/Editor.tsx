import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Upload, Play, Pause, Download, Zap } from "lucide-react";

export function EditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [reverb, setReverb] = useState([0]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleProcess = () => {
    // Mock processing
    alert(`Processing with Speed: ${speed[0]}x and Reverb: ${reverb[0]}%`);
  };

  const handleDownload = () => {
    // Mock download
    alert("Download would start here");
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1>Audio Editor</h1>
          <p className="text-muted-foreground">
            Upload your audio file and adjust the effects
          </p>
        </div>

        {/* Upload Zone */}
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
              <p>
                {audioFile ? audioFile.name : "Drag and drop your audio file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Card>

        {/* Audio Player */}
        {audioFile && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Now Playing</p>
                <p>{audioFile.name}</p>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Waveform Placeholder */}
            <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
              <div className="flex gap-1 items-end h-16">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary/40 rounded-full"
                    style={{
                      height: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Effect Sliders */}
        {audioFile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label>Speed</label>
                  <span className="text-muted-foreground">{speed[0]}x</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adjust playback speed
                </p>
              </div>
              <div className="h-48 flex items-center justify-center">
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.5}
                  max={1}
                  step={0.05}
                  orientation="vertical"
                  className="h-full"
                />
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
                <p className="text-sm text-muted-foreground">
                  Add atmospheric reverb
                </p>
              </div>
              <div className="h-48 flex items-center justify-center">
                <Slider
                  value={reverb}
                  onValueChange={setReverb}
                  min={0}
                  max={100}
                  step={5}
                  orientation="vertical"
                  className="h-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Dry</span>
                <span>Wet</span>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {audioFile && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={handleProcess}
            >
              <Zap className="w-4 h-4" />
              Process Audio
            </Button>
            <Button
              className="flex-1 gap-2"
              size="lg"
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
