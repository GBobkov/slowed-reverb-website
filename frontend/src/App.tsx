import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { EditorPage } from "./components/EditorPage";
import { LibraryPage } from "./components/LibraryPage";
import { AccountPage } from "./components/AccountPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "editor":
        return <EditorPage />;
      case "library":
        return <LibraryPage />;
      case "account":
        return <AccountPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}
