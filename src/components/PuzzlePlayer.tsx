import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCw,
  Trophy,
  ArrowLeft,
  Eye,
  EyeOff,
  Clock,
  Compass,
  Sparkles,
  HelpCircle,
  Home,
  CheckCircle2,
  Heart,
  HelpCircle as QuestionIcon,
  Flame,
  Undo,
  Download
} from "lucide-react";
import { PuzzleConfig, PuzzlePiece } from "../types";

// Custom coquin confetti rain with hearts and sensual colors
const ConfettiRain = () => {
  const particles = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage left
    y: -20 - Math.random() * 100, // starting top offset
    size: Math.random() * 10 + 8,
    isHeart: Math.random() > 0.4,
    color: ["#f43f5e", "#ec4899", "#db2777", "#e11d48", "#be123c", "#9d174d", "#f472b6"][
      Math.floor(Math.random() * 7)
    ],
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 3,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute flex items-center justify-center"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            color: p.color,
          }}
          animate={{
            y: ["0vh", "120vh"],
            x: [`${p.x}%`, `${p.x + (Math.random() * 12 - 6)}%`],
            rotate: [p.rotation, p.rotation + Math.random() * 720],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.isHeart ? (
            <svg viewBox="0 0 24 24" fill={p.color} className="w-full h-full">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <div className="rounded-full w-full h-full" style={{ backgroundColor: p.color }} />
          )}
        </motion.div>
      ))}
    </div>
  );
};

interface PuzzlePlayerProps {
  puzzleId: string;
  onBackToCreator: () => void;
}

export const PuzzlePlayer: React.FC<PuzzlePlayerProps> = ({
  puzzleId,
  onBackToCreator,
}) => {
  const [puzzle, setPuzzle] = useState<PuzzleConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gameplay state
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "solved">("idle");
  
  // Seductive hint layers
  const [showNumbers, setShowNumbers] = useState(false);
  const [peekActive, setPeekActive] = useState(false);
  const [usedPeek, setUsedPeek] = useState(false);

  // New Spicy Difficulty Parameters
  const [fogIntensity, setFogIntensity] = useState<"off" | "sensual" | "blinding">("sensual");
  const [veilMode, setVeilMode] = useState<"off" | "progress" | "hardcore">("progress");

  // Dynamic fog rubbing mechanic (steam wipe back and forth, tracked per piece ID)
  const [pieceFogs, setPieceFogs] = useState<Record<string, number>>({}); 
  const lastRubTimesRef = useRef<Record<string, number>>({});
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Slowly fog up again after 2.5 seconds of inactivity per piece
  useEffect(() => {
    if (gameStatus !== "playing" || fogIntensity === "off") return;

    const interval = setInterval(() => {
      const now = Date.now();
      setPieceFogs((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const pieceId in next) {
          const lastRub = lastRubTimesRef.current[pieceId] || 0;
          if (now - lastRub > 2500 && next[pieceId] > 0) {
            next[pieceId] = Math.max(0, next[pieceId] - 0.08); // Decays smoothly over ~1.2 seconds
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatus, fogIntensity]);

  const handleRubMovement = (clientX: number, clientY: number) => {
    if (gameStatus !== "playing" || fogIntensity === "off") return;

    const element = document.elementFromPoint(clientX, clientY);
    const button = element?.closest("[data-piece-id]");
    const pieceId = button?.getAttribute("data-piece-id");

    const now = Date.now();
    if (lastPosRef.current) {
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 3) {
        if (pieceId) {
          lastRubTimesRef.current[pieceId] = now;
          setPieceFogs((prev) => {
            const currentClarity = prev[pieceId] || 0;
            // Sensitive accumulation based on drag/move velocity
            const increment = Math.min(0.20, dist / 110);
            const updatedClarity = Math.min(1.0, currentClarity + increment);
            if (updatedClarity === currentClarity) return prev;
            return {
              ...prev,
              [pieceId]: updatedClarity,
            };
          });
        }
      }
    }
    lastPosRef.current = { x: clientX, y: clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleRubMovement(touch.clientX, touch.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleRubMovement(e.clientX, e.clientY);
  };

  const clearRubHistory = () => {
    lastPosRef.current = null;
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch puzzle from state/backend on mount
  useEffect(() => {
    const fetchPuzzle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/puzzles/${puzzleId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Ce lien de puzzle n'existe pas ou l'image a été retirée.");
          }
          throw new Error("Impossible de charger le puzzle.");
        }
        const data = await response.json();
        setPuzzle(data);
        
        // Dynamically load the pre-configured difficulty options set during creation
        if (data.fogIntensity) {
          setFogIntensity(data.fogIntensity);
        } else {
          setFogIntensity("off"); // Backwards compatibility default
        }
        
        if (data.veilMode) {
          setVeilMode(data.veilMode);
        } else {
          setVeilMode("off"); // Backwards compatibility default
        }

        setupGame(data.gridSize);
      } catch (err: any) {
        console.error("Fetch err:", err);
        setError(err.message || "Erreur de connexion.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPuzzle();
  }, [puzzleId]);

  // Handle active countdown timer
  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Setup initial pieces matrix
  const setupGame = (gridSize: number) => {
    const freshPieces: PuzzlePiece[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const idx = r * gridSize + c;
        freshPieces.push({
          id: `piece-${idx}`,
          correctCol: c,
          correctRow: r,
          correctIdx: idx,
          currentCol: c,
          currentRow: r,
          currentIdx: idx,
          rotation: 0, // initially facing normal direction
        });
      }
    }

    setPieces(freshPieces);
    setMoves(0);
    setTime(0);
    setGameStatus("idle");
    setSelectedPieceId(null);
    setPieceFogs({});
    lastRubTimesRef.current = {};
  };

  // Scramble and shuffle pieces with random rotation difficulty
  const scramblePieces = () => {
    if (!puzzle) return;
    const size = puzzle.gridSize;
    const total = size * size;

    let shuffledIndices = Array.from({ length: total }, (_, i) => i);
    
    // Fisher-Yates shuffle
    let attempts = 0;
    do {
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }
      attempts++;
    } while (
      attempts < 10 &&
      shuffledIndices.every((val, idx) => val === idx) // make sure it's scrambled
    );

    // Set piece positions and randomize rotations (0, 90, 180, or 270 degrees)
    const scrambled = pieces.map((piece, i) => {
      const targetIdx = shuffledIndices[i];
      const targetRow = Math.floor(targetIdx / size);
      const targetCol = targetIdx % size;

      // Assign rotation. 0 is also possible, but we add rotation to increase spicy difficulty!
      const rotationChoices = [0, 90, 180, 270];
      const randRotation = rotationChoices[Math.floor(Math.random() * rotationChoices.length)];

      return {
        ...piece,
        currentIdx: targetIdx,
        currentCol: targetCol,
        currentRow: targetRow,
        rotation: randRotation,
      };
    });

    setPieces(scrambled);
    setMoves(0);
    setTime(0);
    setGameStatus("playing");
    setSelectedPieceId(null);
    setUsedPeek(false);
    setPieceFogs({});
    lastRubTimesRef.current = {};
  };

  // Perform rotation on a single piece (Clockwise by 90 degrees)
  const rotatePiece = (pieceId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (gameStatus !== "playing") return;

    setPieces((prev) => {
      const updated = prev.map((p) => {
        if (p.id === pieceId) {
          const nextRotation = (p.rotation + 90) % 360;
          return { ...p, rotation: nextRotation };
        }
        return p;
      });
      // Increment moves slightly for rotation actions
      setMoves((m) => m + 1);
      // Verify win state after rotation
      setTimeout(() => checkVictoryCondition(updated), 50);
      return updated;
    });
  };

  // Multi-step piece actions
  const handlePieceClick = (pieceId: string) => {
    if (gameStatus !== "playing") return;

    if (selectedPieceId === null) {
      setSelectedPieceId(pieceId);
    } else if (selectedPieceId === pieceId) {
      // De-select piece if clicked again
      setSelectedPieceId(null);
    } else {
      // Swap coordinates/indices of pieceA and pieceB
      const pieceAIndex = pieces.findIndex((p) => p.id === selectedPieceId);
      const pieceBIndex = pieces.findIndex((p) => p.id === pieceId);

      if (pieceAIndex !== -1 && pieceBIndex !== -1) {
        const updatedPieces = [...pieces];
        const pieceA = updatedPieces[pieceAIndex];
        const pieceB = updatedPieces[pieceBIndex];

        // Swap their layouts fully
        const tempIdx = pieceA.currentIdx;
        const tempCol = pieceA.currentCol;
        const tempRow = pieceA.currentRow;

        pieceA.currentIdx = pieceB.currentIdx;
        pieceA.currentCol = pieceB.currentCol;
        pieceA.currentRow = pieceB.currentRow;

        pieceB.currentIdx = tempIdx;
        pieceB.currentCol = tempCol;
        pieceB.currentRow = tempRow;

        setPieces(updatedPieces);
        setMoves((prev) => prev + 1);
        setSelectedPieceId(null);

        // Check if now fully matched and correctly oriented
        checkVictoryCondition(updatedPieces);
      }
    }
  };

  // Win checker: Slot matches AND rotation is exactly 0 degrees (normal)
  const checkVictoryCondition = (currentPiecesList: PuzzlePiece[]) => {
    const solved = currentPiecesList.every(
      (p) => p.currentIdx === p.correctIdx && p.rotation === 0
    );
    if (solved) {
      setGameStatus("solved");
    }
  };

  const getCorrectPlacedCount = () => {
    // Correct position AND correct rotation!
    return pieces.filter((p) => p.currentIdx === p.correctIdx && p.rotation === 0).length;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handlePeekImage = () => {
    if (gameStatus !== "playing") return;
    setPeekActive(true);
    setUsedPeek(true);
    setTimeout(() => {
      setPeekActive(false);
    }, 1800); // Only shows for 1.8s then closes
  };

  const handleDownloadImage = async () => {
    try {
      if (!puzzle?.imageData) return;
      const imgData = puzzle.imageData;
      
      let downloadUrl = imgData;
      const filename = `${puzzle.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "photo_mystere"}.png`;

      // If it's a remote URL (not base64), download via fetch blob to bypass cross-origin browser limitations
      if (imgData.startsWith("http")) {
        try {
          const response = await fetch(imgData, { mode: "cors" });
          const blob = await response.blob();
          downloadUrl = URL.createObjectURL(blob);
        } catch (e) {
          console.warn("CORS fetch failed, using fallback direct download URL", e);
        }
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (downloadUrl.startsWith("blob:")) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      }
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Une erreur s'est produite lors du téléchargement. Veuillez essayer de faire un clic droit et enregistrer l'image directement.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center" id="player-loading-wrapper">
        <div className="w-14 h-14 rounded-full border-4 border-dashed border-rose-500 animate-spin mb-4" />
        <p className="text-rose-200/60 font-mono text-sm uppercase tracking-widest">Décryptage du verrou coquin...</p>
      </div>
    );
  }

  if (error || !puzzle) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center" id="player-error-wrapper">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 text-rose-400">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-sans">Secret Introuvable</h2>
        <p className="text-neutral-400 text-sm mb-8">{error || "Impossible d'accéder à cette invitation intime."}</p>
        <button
          onClick={onBackToCreator}
          id="error-back-btn"
          className="px-6 py-3.5 bg-neutral-900 border border-rose-500/20 hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl transition-all"
        >
          Retourner au Créateur
        </button>
      </div>
    );
  }

  const correctlyPlaced = getCorrectPlacedCount();
  const totalPieces = puzzle.gridSize * puzzle.gridSize;
  const isWinner = gameStatus === "solved";
  const selectedPiece = pieces.find((p) => p.id === selectedPieceId);
  const veilLimit = Math.ceil(totalPieces * (veilMode === "progress" ? 0.30 : veilMode === "hardcore" ? 0.60 : 0));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 relative" id="puzzle-player-root">
      {isWinner && <ConfettiRain />}

      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-6" id="player-top-navigation">
        <button
          onClick={onBackToCreator}
          id="player-nav-back-btn"
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-rose-500/10 text-rose-300 hover:text-rose-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 font-sans"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Créer mon propre Défi Coquin
        </button>

        <div className="flex gap-2 font-sans" id="player-modes-toggle">
          {/* Peek hint button */}
          <button
            type="button"
            id="hint-peek-btn"
            disabled={gameStatus !== "playing" || peekActive}
            onClick={handlePeekImage}
            className={`px-3 py-2 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-all ${
              peekActive
                ? "bg-rose-500/20 border-rose-500 text-rose-300"
                : "bg-neutral-900 border-white/5 hover:border-rose-900/60 text-neutral-400"
            }`}
            title="Apercevoir la photo mystère pendant 1,8 seconde"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Regarder (1.8s)</span>
          </button>

          <button
            type="button"
            id="toggle-help-numbers-btn"
            onClick={() => setShowNumbers(!showNumbers)}
            className={`p-2.5 rounded-xl border transition-all ${
              showNumbers
                ? "bg-rose-500/10 border-rose-500 text-rose-300"
                : "bg-neutral-900 hover:bg-neutral-850 border-white/5 text-neutral-400 hover:text-white"
            }`}
            title="Afficher les numéros d'indices"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="player-layout-grid">
        {/* Left column: Information card, progression and controls */}
        <div className="lg:col-span-4 space-y-6" id="player-left-panel">
          {/* Card Info */}
          <div className="bg-neutral-900/40 border border-rose-500/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden" id="player-meta-card">
            {/* Visual background lights */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-xl rounded-full" />

            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 mb-3 inline-flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500 fill-current animate-pulse" /> Énigme d'amour scellée
            </span>
            <h1 className="text-2xl font-bold text-white mb-1 line-clamp-2 font-sans leading-tight">
              {puzzle.title}
            </h1>
            <p className="text-rose-300/60 text-xs mb-4 font-sans">
              Signée par <span className="text-rose-200 font-semibold">{puzzle.author}</span>
            </p>

            {/* Hint of rules */}
            <div className="p-3 bg-neutral-950/60 rounded-xl text-[11px] text-neutral-400 leading-relaxed font-sans mb-5 border border-white/5">
              <p className="text-rose-400 font-semibold mb-1 flex items-center gap-1">
                ⚠️ Difficulté Double :
              </p>
              1. Les pièces peuvent être glissées / interchangées n'importe où.<br />
              2. <strong>Rotation Active :</strong> Double-cliquez sur une pièce pour la faire pivoter de 90°.
            </div>

            {/* Progress indicator */}
            <div className="space-y-2 pt-4 border-t border-white/5" id="pieces-matched-progress">
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-neutral-400">Positionnées &amp; Orientées</span>
                <span className="font-mono text-rose-400 font-bold">
                  {correctlyPlaced} / {totalPieces}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-950 overflow-hidden relative border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(correctlyPlaced / totalPieces) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-2 gap-4" id="hud-stats-grid">
            <div className="bg-neutral-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300/70 uppercase tracking-wider mb-1 font-sans">
                <Clock className="w-3.5 h-3.5 text-rose-400" /> Temps secret
              </div>
              <span className="font-mono text-2xl font-bold text-white">
                {formatTime(time)}
              </span>
            </div>

            <div className="bg-neutral-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300/70 uppercase tracking-wider mb-1 font-sans">
                <Compass className="w-3.5 h-3.5 text-rose-400" /> Actions
              </div>
              <span className="font-mono text-2xl font-bold text-white">
                {moves}
              </span>
            </div>
          </div>

          {/* Piece Controller (Shows when a piece is active) */}
          <AnimatePresence>
            {selectedPiece && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 bg-gradient-to-r from-rose-950/40 to-pink-950/30 border border-rose-500/20 rounded-2xl flex items-center justify-between gap-3 font-sans"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold mb-0.5">
                    Pièce Sélectionnée
                  </p>
                  <p className="text-xs text-neutral-300">
                    Orientation actuelle :{" "}
                    <span className="font-mono text-rose-400 font-bold">{selectedPiece.rotation}°</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => rotatePiece(selectedPiece.id, e)}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-rose-950/20"
                    title="Faire pivoter la pièce de 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Pivoter 90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPieceId(null)}
                    className="p-1.5 bg-neutral-900 text-neutral-400 hover:text-white rounded-lg text-xs"
                    title="Annuler la sélection"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spicy Custom Difficulties (Configured by the creator, read-only for players) */}
          <div className="bg-neutral-900/40 border border-rose-500/10 backdrop-blur-md rounded-2xl p-4.5 relative overflow-hidden" id="spicy-difficulty-readonly-panel">
            <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1 font-sans">
              🔒 Verrouillé
            </div>

            <h3 className="text-xs font-bold text-rose-300 flex items-center gap-2 mb-3.5 font-sans">
              <Flame className="w-4 h-4 text-rose-500 fill-current" /> Sensation de difficulté imposée :
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3 font-sans">
              {/* Brouillard info */}
              <div className="p-3 bg-neutral-950/70 border border-white/5 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                  ☁️ Brouillard Charnel
                </span>
                <span className="text-xs font-semibold text-white mt-1">
                  {fogIntensity === "off" && "Désactivé"}
                  {fogIntensity === "sensual" && "Satiné 🌶️"}
                  {fogIntensity === "blinding" && "Torride 🌶️🌶️"}
                </span>
                <span className="text-[8.5px] text-neutral-400 mt-0.5 leading-tight">
                  {fogIntensity === "off" && "Image transparente d'emblée."}
                  {fogIntensity === "sensual" && "Flou léger s'estompant au fil des pièces posées."}
                  {fogIntensity === "blinding" && "Flou torride s'éclaircissant avec la progression."}
                </span>
              </div>

              {/* Voile info */}
              <div className="p-3 bg-neutral-950/70 border border-white/5 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400">
                  🎭 Voile Mystère
                </span>
                <span className="text-xs font-semibold text-white mt-1 flex items-center justify-between">
                  <span>
                    {veilMode === "off" && "Transparent"}
                    {veilMode === "progress" && "Masqué 🌶️"}
                    {veilMode === "hardcore" && "Extase 🌶️🌶️"}
                  </span>
                  {veilMode !== "off" && (
                    <span className="text-[8px] font-mono font-bold bg-pink-900/40 text-pink-300 border border-pink-500/20 px-1 py-0.2 rounded leading-none">
                      {veilLimit} Pl.
                    </span>
                  )}
                </span>
                <span className="text-[8.5px] text-neutral-400 mt-0.5 leading-tight">
                  {veilMode === "off" && "Toutes les pièces de l'image sont visibles."}
                  {veilMode === "progress" && "Positions impaires masquées jusqu'à 30% du puzzle posé."}
                  {veilMode === "hardcore" && "Positions impaires masquées jusqu'à 60% du puzzle posé."}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/5 text-[10px] text-neutral-400 font-sans leading-relaxed">
              {veilMode !== "off" && correctlyPlaced < veilLimit ? (
                <p className="text-yellow-400/95 flex items-center gap-1.5 flex-wrap">
                  🔒 <strong className="text-yellow-300">Voile de dentelle actif :</strong> Les positions impaires restent masquées ! Posez encore <strong className="text-white bg-neutral-950 px-1.5 py-0.5 rounded border border-white/5">{veilLimit - correctlyPlaced} pièces</strong> correctement pour voir au-delà du voile.
                </p>
              ) : fogIntensity !== "off" && gameStatus === "playing" ? (
                <div className="space-y-1">
                  <p className="text-rose-300/90 font-semibold flex items-center gap-1">
                    ☁️ Brouillard Charnel Actif :
                  </p>
                  <p className="text-[10px] text-rose-200/60 leading-normal">
                    Faites glisser votre doigt ou votre souris avec des <strong>va-et-vient répétés</strong> directement sur un segment de photo pour en dissiper le brouillard ! Le brouillard des autres pièces reste intact, et celui que vous venez de frotter se refloutera peu à peu si vous l'abandonnez...
                  </p>
                  {(() => {
                    const maxPieceClarity = Object.keys(pieceFogs).reduce((max, key) => {
                      const val = pieceFogs[key] || 0;
                      return Math.max(max, val);
                    }, 0);
                    return maxPieceClarity > 0 ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[8px] font-mono text-rose-400 uppercase tracking-wider">Clarté frotter : {Math.round(maxPieceClarity * 100)}%</span>
                        <div className="h-1 flex-1 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-rose-500 rounded-full transition-all duration-100" style={{ width: `${maxPieceClarity * 100}%` }} />
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <p className="text-neutral-500">
                  Relevez le défi sensoriel conçu et signé par l'auteur original de cette surprise coquine.
                </p>
              )}
            </div>
          </div>

          {/* Main Scrambler Activator or reset */}
          <div className="space-y-3" id="player-dashboard-actions">
            {gameStatus === "idle" ? (
              <button
                type="button"
                id="start-scramble-btn"
                onClick={scramblePieces}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 font-sans text-white text-sm font-bold rounded-xl select-none transition-all duration-200 active:scale-98 shadow-xl shadow-rose-500/10 flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 fill-current animate-pulse text-white" /> Commencer le Jeu Surprise
              </button>
            ) : (
              <button
                type="button"
                id="reset-restart-btn"
                onClick={scramblePieces}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 border border-rose-500/10 text-neutral-300 hover:text-white text-xs font-bold font-sans rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5" /> Re-mélanger les morceaux secrets
              </button>
            )}

            <div className="bg-neutral-950/40 border border-rose-950/10 rounded-xl p-3 text-[11px] text-neutral-400 font-sans flex gap-2.5 items-start">
              <span>💡</span>
              <p className="leading-relaxed">
                <strong>Astuce Secrète :</strong> Cliquez sur une pièce pour la surbriller, puis cliquez sur n'importe quel autre emplacement de la grille pour échanger. <strong>Double-cliquez</strong> sur une pièce pour la faire pivoter !
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Grid Canvas Area */}
        <div className="lg:col-span-8 flex justify-center" id="player-right-panel">
          <div
            id="puzzle-board-container"
            className="w-full max-w-[500px] aspect-square bg-neutral-950 rounded-2xl p-4 border border-rose-500/10 shadow-2xl relative overflow-hidden flex items-center justify-center"
          >
            {/* Ambient background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-rose-950/10 via-black to-pink-950/10 pointer-events-none" />

            <AnimatePresence mode="wait">
              {peekActive ? (
                // Full original reference preview layer
                <motion.div
                  key="peek-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-4 rounded-xl overflow-hidden z-20"
                >
                  <img
                    src={puzzle.imageData}
                    alt="Peek surprise solution"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="px-3 py-1.5 rounded-full bg-neutral-900/95 text-rose-300 text-xs font-semibold border border-rose-500/20 uppercase tracking-widest animate-pulse font-sans">
                      Aperçu temporaire... 💋
                    </p>
                  </div>
                </motion.div>
              ) : gameStatus === "idle" ? (
                // Pre-scramble display with "Mélanger" overlay
                <motion.div
                  key="unscrambled-board"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-4 rounded-xl overflow-hidden z-10 flex flex-col items-center justify-center bg-gradient-to-tr from-rose-950/40 via-neutral-900/80 to-pink-950/40 border border-rose-500/10 text-center p-6"
                >
                  <div className="mb-6 relative">
                    <div className="absolute -inset-2 bg-rose-500/20 blur-xl rounded-full" />
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center scale-110 relative">
                      <Heart className="w-8 h-8 fill-current text-rose-500 animate-pulse" />
                    </div>
                  </div>

                  <p className="text-white text-lg font-bold mb-1 font-sans">Une Photo Surprise vous attend</p>
                  <p className="text-xs text-rose-200/60 max-w-[280px] mb-6 font-sans">
                    L'image originale est complètement cryptée et masquée. Vos yeux ne pourront la voir qu'après reconstitution !
                  </p>

                  <button
                    type="button"
                    id="idle-scramble-btn"
                    onClick={scramblePieces}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 font-sans text-white text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-rose-950/20"
                  >
                    Révéler & Mélanger l'image
                  </button>
                </motion.div>
              ) : (
                // Active puzzle grid list
                <motion.div
                  key="active-puzzle-matrix"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  id="pieces-matrix-layout"
                  className="w-full h-full grid gap-1.5 relative z-10 touch-none select-none"
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  onMouseLeave={clearRubHistory}
                  onTouchEnd={clearRubHistory}
                  style={{
                    gridTemplateColumns: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: totalPieces }).map((_, slotIdx) => {
                    const piece = pieces.find((p) => p.currentIdx === slotIdx);
                    if (!piece) return null;

                    const isSelected = selectedPieceId === piece.id;
                    const isOriented = piece.rotation === 0;
                    const isPlacedCorrectly = piece.currentIdx === piece.correctIdx;
                    const isPerfectMatch = isPlacedCorrectly && isOriented;

                    // Calculate background position percentages
                    const crCol = piece.correctCol;
                    const crRow = piece.correctRow;
                    const denominator = puzzle.gridSize - 1;
                    const bgPosX = denominator > 0 ? (crCol / denominator) * 100 : 0;
                    const bgPosY = denominator > 0 ? (crRow / denominator) * 100 : 0;

                    const isVeiled = veilMode !== "off" && (correctlyPlaced < veilLimit) && !isPerfectMatch && (piece.correctIdx % 2 === 1);

                    let filterStyle = undefined;
                    if (fogIntensity !== "off" && !isPerfectMatch) {
                      const progressRatio = totalPieces > 0 ? (correctlyPlaced / totalPieces) : 0;
                      const maxBlur = fogIntensity === "sensual" ? 10 : fogIntensity === "blinding" ? 22 : 0;
                      const currentClarity = pieceFogs[piece.id] || 0;
                      // The user rubs/wipes to temporarily remove the fog on this piece specifically
                      const currentBlur = Math.max(0, Math.round(maxBlur * (1 - progressRatio) * (1 - currentClarity)));
                      filterStyle = `blur(${currentBlur}px) saturate(${0.75 + currentClarity * 0.25}) contrast(${1.05 - currentClarity * 0.05})`;
                    }

                    return (
                      <motion.div
                        key={piece.id}
                        layoutId={piece.id}
                        className="relative w-full h-full"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      >
                        <button
                          id={`board-piece-slot-${slotIdx}`}
                          data-piece-id={piece.id}
                          type="button"
                          onClick={() => handlePieceClick(piece.id)}
                          onDoubleClick={() => rotatePiece(piece.id)}
                          className={`relative w-full h-full rounded-lg overflow-hidden focus:outline-none transition-all cursor-pointer ${
                            isSelected
                              ? "ring-4 ring-rose-500 scale-[0.93] z-20 shadow-2xl"
                              : isPerfectMatch && !isWinner
                              ? "border border-rose-500/30 p-0 shadow-lg"
                              : "border border-white/5 active:scale-97 hover:opacity-95"
                          }`}
                        >
                          {isVeiled ? (
                            /* Hidden Veil placeholder */
                            <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-2 border border-rose-950/40 select-none">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                                className="text-rose-500/80 mb-1"
                              >
                                <Heart className="w-5 h-5 fill-current text-rose-700/80" />
                              </motion.div>
                              <span className="text-[7.5px] font-mono tracking-widest text-rose-500/70 uppercase">Fermé</span>
                            </div>
                          ) : (
                            /* Rotatable slice container */
                            <div
                              id={`piece-bg-slice-${slotIdx}`}
                              className="w-full h-full object-cover transition-transform duration-300"
                              style={{
                                backgroundImage: `url(${puzzle.imageData})`,
                                backgroundSize: `${puzzle.gridSize * 100}% ${puzzle.gridSize * 100}%`,
                                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                                WebkitBackgroundSize: `${puzzle.gridSize * 100}% ${puzzle.gridSize * 100}%`,
                                backgroundRepeat: "no-repeat",
                                transform: `rotate(${piece.rotation}deg)`,
                                WebkitTransform: `rotate(${piece.rotation}deg)`,
                                filter: filterStyle,
                                WebkitFilter: filterStyle,
                              }}
                            />
                          )}

                          {/* Light velvet color overlays */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-rose-500/10 pointer-events-none"
                              />
                            )}
                          </AnimatePresence>

                          {/* Index Numbers hint option */}
                          {showNumbers && (
                            <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-md rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-white border border-rose-500/20">
                              {piece.correctIdx + 1}
                            </div>
                          )}

                          {/* Incorrect orientation warning indicator */}
                          {!isOriented && !isSelected && (
                            <div
                              onClick={(e) => rotatePiece(piece.id, e)}
                              className="absolute top-1.5 right-1.5 bg-neutral-900/90 text-yellow-300 p-1 rounded-md shadow-md border border-neutral-800 transition-all hover:scale-110 active:scale-90"
                              title="Pièce tournée à l'envers. Cliquez ici pour la redresser"
                            >
                              <RotateCw className="w-2.5 h-2.5" />
                            </div>
                          )}

                          {/* Match indicator */}
                          {isPerfectMatch && !isWinner && (
                            <div className="absolute bottom-1.5 right-1.5 bg-rose-500 text-white p-0.5 rounded-full shadow-md pointer-events-none">
                              <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Win Modal Overlay */}
      <AnimatePresence>
        {isWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            id="victory-congratulations-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-neutral-900 border border-rose-500/30 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl"
            >
              {/* Radial velvet lighting */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full" />

              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 scale-110 relative z-10">
                <Trophy className="w-10 h-10 animate-bounce" id="victory-trophy-illustration" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-rose-500" /> Énigme validée !
              </span>

              <h2 className="text-3xl font-extrabold text-white mb-2 font-sans leading-none">
                Le secret est à vous !
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm mb-6 font-sans">
                Félicitations pour votre délicatesse et votre patience. Vous avez résolu le puzzle ! Admirez maintenant l'image surprise dans toute sa splendeur :
              </p>

              {/* Reveal image preview inside the victory modal */}
              <div className="w-full h-44 rounded-xl overflow-hidden mb-6 border border-rose-500/25 relative shadow-lg group">
                <img
                  src={puzzle.imageData}
                  alt="Full surprise solution revealed"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-neutral-900/90 hover:bg-rose-600 border border-rose-500/30 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-md active:scale-95"
                  title="Télécharger la photo d'origine"
                >
                  <Download className="w-3 h-3" /> Télécharger
                </button>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-2 gap-3 mb-6 bg-neutral-950 p-4 rounded-xl border border-white/5 font-sans" id="victory-stats-summary">
                <div className="text-center border-r border-white/5">
                  <p className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider mb-0.5">Temps secret</p>
                  <p className="font-mono text-lg font-bold text-rose-400">{formatTime(time)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider mb-0.5">Actions</p>
                  <p className="font-mono text-lg font-bold text-rose-400">{moves}</p>
                </div>
              </div>

              {/* Action options */}
              <div className="flex flex-col gap-2.5 font-sans" id="victory-action-options">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Télécharger la photo surprise
                </button>
                <button
                  type="button"
                  id="victory-retry-scramble-btn"
                  onClick={scramblePieces}
                  className="w-full py-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rejouer ce Défi
                </button>
                <button
                  type="button"
                  id="victory-create-yours-btn"
                  onClick={onBackToCreator}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white text-xs font-bold rounded-xl transition-all"
                >
                  Créer un autre Puzzle Coquin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
