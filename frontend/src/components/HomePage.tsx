import { Button } from "./ui/button";
import { Music, Waves, Zap } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Music className="w-10 h-10" />
          </div>

          <h1 className="text-4xl md:text-6xl">SlowedReverb</h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your audio instantly. Upload any track and apply professional slowed and reverb effects with real-time preview. Create atmospheric, dreamy versions of your favorite songs in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => onNavigate("editor")}
              className="gap-2"
            >
              <Zap className="w-5 h-5" />
              Start Creating
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate("library")}
              className="gap-2"
            >
              <Waves className="w-5 h-5" />
              View Library
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <Zap className="w-6 h-6" />
              </div>
              <h3>Instant Processing</h3>
              <p className="text-sm text-muted-foreground">
                Upload and process your audio files in real-time with no waiting
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <Waves className="w-6 h-6" />
              </div>
              <h3>Real-Time Preview</h3>
              <p className="text-sm text-muted-foreground">
                Hear changes instantly as you adjust speed and reverb levels
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <Music className="w-6 h-6" />
              </div>
              <h3>Simple & Clean</h3>
              <p className="text-sm text-muted-foreground">
                Minimalist interface designed for quick and easy audio editing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
