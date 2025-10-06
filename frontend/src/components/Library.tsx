import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Download, Music } from "lucide-react";

interface Track {
  id: string;
  name: string;
  date: string;
  speed: number;
  reverb: number;
}

const mockTracks: Track[] = [
  {
    id: "1",
    name: "Summer Vibes - Slowed",
    date: "2025-10-05",
    speed: 0.75,
    reverb: 60,
  },
  {
    id: "2",
    name: "Midnight Dreams - Reverb",
    date: "2025-10-04",
    speed: 0.85,
    reverb: 80,
  },
  {
    id: "3",
    name: "Neon Lights - Enhanced",
    date: "2025-10-03",
    speed: 0.65,
    reverb: 70,
  },
  {
    id: "4",
    name: "Ocean Waves - Atmospheric",
    date: "2025-10-02",
    speed: 0.7,
    reverb: 90,
  },
  {
    id: "5",
    name: "City Nights - Processed",
    date: "2025-10-01",
    speed: 0.8,
    reverb: 50,
  },
  {
    id: "6",
    name: "Starlight - Slowed+Reverb",
    date: "2025-09-30",
    speed: 0.6,
    reverb: 85,
  },
];

export function LibraryPage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1>Your Library</h1>
          <p className="text-muted-foreground">
            Access your previously processed tracks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTracks.map((track) => (
            <Card key={track.id} className="p-6 space-y-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0">
                  <Music className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate">{track.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(track.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-sm">
                <span className="px-2 py-1 bg-muted rounded">
                  Speed: {track.speed}x
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Reverb: {track.reverb}%
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2">
                  <Play className="w-3 h-3" />
                  Play
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-2">
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {mockTracks.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p>No tracks in your library yet</p>
              <p className="text-sm text-muted-foreground">
                Process some audio files to see them here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
