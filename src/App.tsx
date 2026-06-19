import { useState, useEffect } from "react";
import { PuzzleCreator } from "./components/PuzzleCreator";
import { PuzzlePlayer } from "./components/PuzzlePlayer";
import { Sparkles, Heart } from "lucide-react";

export default function App() {
  // Le puzzle entier est encodé dans le fragment d'URL (#p=<token>) : aucun
  // serveur n'est nécessaire, l'app fonctionne en statique (GitHub Pages).
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    const handleRouting = () => {
      const hash = window.location.hash;
      const token = hash.startsWith("#p=") ? hash.slice(3) : null;
      setActiveToken(token);
    };

    handleRouting();
    window.addEventListener("popstate", handleRouting);
    window.addEventListener("hashchange", handleRouting);
    return () => {
      window.removeEventListener("popstate", handleRouting);
      window.removeEventListener("hashchange", handleRouting);
    };
  }, []);

  const handleBackToCreator = () => {
    window.history.pushState(null, "", window.location.pathname);
    setActiveToken(null);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Dynamic Background Seductive Rose Glow Decorator */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#f43f5e0c,transparent_55%)] pointer-events-none" />

      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-rose-950/40" id="app-navigation-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleBackToCreator}
            id="brand-logo-btn"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart className="w-5 h-5 text-white fill-current stroke-[2.5] animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white tracking-tight leading-none">Mystère Coquin</span>
              <span className="text-[10px] text-rose-400 font-mono tracking-wider font-semibold uppercase">Puzzles Secrets</span>
            </div>
          </button>

          <div className="flex items-center gap-4" id="header-links">
            <button
              onClick={handleBackToCreator}
              id="header-create-link"
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                !activeToken
                  ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Envoyer un Nouveau Défi
            </button>
            <span className="text-rose-950/60 text-sm hidden sm:inline">|</span>
            <span className="text-[11px] font-mono text-rose-400/80 hidden sm:flex items-center gap-1.5 uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Seduction Edition
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10" id="app-main-viewport">
        {activeToken ? (
          <PuzzlePlayer
            encodedData={activeToken}
            onBackToCreator={handleBackToCreator}
          />
        ) : (
          <PuzzleCreator />
        )}
      </main>

      {/* Minimalistic Structural Footer */}
      <footer className="border-t border-rose-955/20 py-8 bg-neutral-950/80 mt-auto text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-xs text-neutral-500 space-y-2">
          <p className="font-sans">
            &copy; {new Date().getFullYear()} Mystère Coquin &mdash; Offrez une surprise sensorielle inédite sous forme d'énigme tactile.
          </p>
          <div className="flex justify-center gap-4 text-[10px] uppercase tracking-wider font-mono font-semibold" id="footer-badges">
            <span className="text-rose-400/40">Satin Pieces Algorithm</span>
            <span className="text-neutral-800">&bull;</span>
            <span className="text-rose-400/40">Mystery Interactive Encrypt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
