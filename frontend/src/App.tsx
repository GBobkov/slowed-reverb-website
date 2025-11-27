import { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/Home";
import { EditorPage } from "./components/Editor";
import { LibraryPage } from "./components/Library";
import { AccountPage } from "./components/Account";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem("currentPage") || "home";
  });

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "editor":
        return <EditorPage onNavigate={setCurrentPage} />;
      case "account":
        return <AccountPage />;
      case "library":
        return <LibraryPage onNavigate={setCurrentPage} />;

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
