import { Music, Edit, Library, User } from "lucide-react";
import { Button } from "./ui/button";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2"
          >
            <Music className="w-6 h-6" />
            <span className="text-xl">SlowedReverb</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant={currentPage === "editor" ? "default" : "ghost"}
              onClick={() => onNavigate("editor")}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Editor</span>
            </Button>
            <Button
              variant={currentPage === "library" ? "default" : "ghost"}
              onClick={() => onNavigate("library")}
              className="gap-2"
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </Button>
            <Button
              variant={currentPage === "account" ? "default" : "ghost"}
              onClick={() => onNavigate("account")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
