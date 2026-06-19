import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PresetSelector } from "./PresetSelector";
import {
  Upload,
  User,
  Type,
  Grid3X3,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  Play,
  Camera,
  Heart,
  Flame,
  Eye
} from "lucide-react";

interface PuzzleCreatorProps {
  onPuzzleCreated: (puzzleId: string) => void;
}

export const PuzzleCreator: React.FC<PuzzleCreatorProps> = ({ onPuzzleCreated }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [gridSize, setGridSize] = useState<number>(3); // Default 3x3
  const [imageData, setImageData] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Spicy setting values set of game creation
  const [fogIntensity, setFogIntensity] = useState<"off" | "sensual" | "blinding">("sensual");
  const [veilMode, setVeilMode] = useState<"off" | "progress" | "hardcore">("progress");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner un fichier image valide.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageData(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSavePuzzle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageData) {
      alert("Veuillez choisir ou glisser-déposer une image mystère d'abord !");
      return;
    }
    if (!title.trim()) {
      alert("Veuillez donner un nom coquin à ce puzzle secret.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim() || undefined,
          gridSize,
          imageData,
          fogIntensity,
          veilMode,
        }),
      });

      if (!response.ok) {
        throw new Error("L'envoi a échoué");
      }

      const data = await response.json();
      if (data.id) {
        setSharedId(data.id);
      }
    } catch (err) {
      console.error(err);
      alert("Impossible d'enregistrer le puzzle. Assurez-vous que le serveur fonctionne.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSharingUrl = () => {
    if (!sharedId) return "";
    return `${window.location.origin}?puzzle=${sharedId}`;
  };

  const copyToClipboard = () => {
    const url = getSharingUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="puzzle-creator-root">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
        id="creator-header"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" /> Jeux pour Adultes & Puzzles Coquins
        </span>
        <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-white mb-3">
          Le Secret Éclate <span className="text-rose-500 font-serif italic text-rose-400">Pièce par Pièce...</span>
        </h1>
        <p className="text-neutral-300 text-base md:text-lg max-w-xl mx-auto font-sans leading-relaxed">
          Téléversez une photo charmante ou confidentielle. Vos partenaires ne la verront qu'une fois toutes les pièces repositionnées !
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!sharedId ? (
          <motion.form
            key="creator-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onSubmit={handleSavePuzzle}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-rose-500/10 p-6 md:p-8 shadow-2xl relative"
            id="builder-form"
          >
            {/* Soft pink ambient lighting */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-rose-500/5 blur-3xl rounded-full pointer-events-none" />

            {/* Left side: Image selection and preview */}
            <div className="lg:col-span-7 flex flex-col gap-6" id="left-builder-panel">
              {/* Drag & Drop Zone */}
              <div
                id="uploader-drop-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={imageData ? undefined : triggerFileInput}
                className={`relative min-h-[300px] md:min-h-[380px] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-neutral-950/60 cursor-pointer group ${
                  imageData
                    ? "border-rose-500/30 ring-1 ring-rose-500/10"
                    : isDragActive
                    ? "border-rose-400 bg-rose-500/5 scale-101"
                    : "border-neutral-800 hover:border-rose-900/60 hover:bg-neutral-900/40"
                }`}
              >
                <input
                  type="file"
                  id="image-file-input"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {imageData ? (
                  <>
                    <img
                      src={imageData}
                      alt="Aperçu du puzzle"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover max-h-[420px]"
                    />
                    <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                      <button
                        type="button"
                        id="change-image-btn"
                        onClick={triggerFileInput}
                        className="px-4 py-2 bg-neutral-900/95 text-white rounded-lg border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <Camera className="w-4 h-4" /> Changer l'Image Secrète
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center gap-4" id="uploader-prompt-details">
                    <div className="p-4 rounded-full bg-neutral-900 border border-rose-500/10 text-rose-400 group-hover:text-rose-300 transition-colors duration-300 group-hover:scale-110">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Faites glisser votre photo ici</p>
                      <p className="text-xs text-neutral-400">ou cliquez pour explorer vos fichiers privés</p>
                    </div>
                    <span className="text-[10px] text-rose-400/70 uppercase tracking-widest font-mono border border-rose-500/10 px-2.5 py-1 rounded bg-neutral-900/80">
                      Entièrement Privé (Généré en Base64)
                    </span>
                  </div>
                )}
              </div>

              {/* Presets and options */}
              <PresetSelector selectedUrl={imageData} onSelect={setImageData} />
            </div>

            {/* Right side: Options and Configuration */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6" id="right-builder-panel">
              <div className="space-y-6" id="form-fields-container">
                <div>
                  <h3 className="text-lg font-semibold text-white font-sans flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" /> Personnalisation coquine
                  </h3>
                  <p className="text-neutral-400 text-xs font-sans leading-relaxed">
                    Déterminez la difficulté du mystère et configurez votre invitation séduisante.
                  </p>
                </div>

                {/* Input Title */}
                <div className="space-y-2">
                  <label htmlFor="puzzle-title-input" className="block text-xs uppercase font-semibold text-rose-300/80 tracking-wider">
                    Titre De La Surprise <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative font-sans">
                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400/60" />
                    <input
                      type="text"
                      id="puzzle-title-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Une surprise pour tes yeux..."
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 placeholder-neutral-700 transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                {/* Input Author */}
                <div className="space-y-2">
                  <label htmlFor="puzzle-author-input" className="block text-xs uppercase font-semibold text-rose-300/80 tracking-wider">
                    Votre Signature / Pseudo secret
                  </label>
                  <div className="relative font-sans">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400/60" />
                    <input
                      type="text"
                      id="puzzle-author-input"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g., Ton admirateur secret 💋"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 placeholder-neutral-700 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Grid size slider / choices */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center font-sans">
                    <label className="text-xs uppercase font-semibold text-rose-300/80 tracking-wider flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5" /> Nombre de morceaux
                    </label>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {gridSize} × {gridSize} ({gridSize * gridSize} pièces)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2" id="grid-size-buttons">
                    {[2, 3, 4, 5].map((size) => {
                      const modeLabel =
                        size === 2
                          ? "Rapide"
                          : size === 3
                          ? "Séducteur"
                          : size === 4
                          ? "Passionné"
                          : "Extatique";
                      return (
                        <button
                          key={size}
                          type="button"
                          id={`grid-size-choice-${size}`}
                          onClick={() => setGridSize(size)}
                          className={`py-3 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 font-sans ${
                            gridSize === size
                              ? "bg-rose-500/10 border-rose-500 text-rose-300 font-semibold"
                              : "bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-rose-900/50 hover:text-white"
                          }`}
                        >
                          <span className="font-mono text-base">{size}x{size}</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">{modeLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spicy Custom Difficulties (Configured at game creation) */}
                <div className="bg-neutral-900/40 border border-rose-500/10 backdrop-blur-md rounded-2xl p-4 space-y-4 font-sans" id="creator-spicy-difficulty-settings">
                  <h3 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500 fill-current animate-pulse" /> Pimentez le Défi Secrètement
                  </h3>

                  {/* Brouillard intensity buttons */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      ☁️ Brouillard Charnel (Floute l'image non résolue) :
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      {[
                        { id: "off", label: "Désactivé", desc: "Clair d'emblée" },
                        { id: "sensual", label: "Satiné 🌶️", desc: "Flou léger" },
                        { id: "blinding", label: "Torride 🌶️🌶️", desc: "Flou intense" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFogIntensity(opt.id as any)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            fogIntensity === opt.id
                              ? "bg-rose-500/15 border-rose-500 text-rose-200 font-semibold"
                              : "bg-neutral-950/80 border-white/5 text-neutral-400 hover:border-rose-900/40 hover:text-white"
                          }`}
                        >
                          <span className="mb-0.5">{opt.label}</span>
                          <span className="text-[8px] opacity-70 leading-none">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Veil Mode */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      🎭 Voile Mystère (Certaines pièces restent noires) :
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      {[
                        { id: "off", label: "Transparent", desc: "Tout visible" },
                        { id: "progress", label: "Masqué 🌶️", desc: "Se révèle à 30%" },
                        { id: "hardcore", label: "Extase 🌶️🌶️", desc: "Se révèle à 60%" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVeilMode(opt.id as any)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            veilMode === opt.id
                              ? "bg-pink-500/15 border-pink-500 text-pink-200 font-semibold"
                              : "bg-neutral-950/80 border-white/5 text-neutral-400 hover:border-pink-900/40 hover:text-white"
                          }`}
                        >
                          <span className="mb-0.5">{opt.label}</span>
                          <span className="text-[8px] opacity-70 leading-none">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Note about rotation and surprise */}
                <div className="p-3.5 bg-rose-950/20 border border-rose-550/10 rounded-xl text-[11px] text-rose-300/70 font-sans space-y-1">
                  <p className="font-semibold text-rose-400 flex items-center gap-1 leading-none">
                    ✨ Nouveauté Pièces Tournantes & Libres :
                  </p>
                  <p className="leading-normal">
                    Certaines pièces seront initialement tournées à l'envers (à 90°, 180° ou 270°). Vos amis devront cliquer/double-cliquer pour les redresser afin que l'image surprise se révèle !
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-neutral-800" id="submission-container">
                <button
                  type="submit"
                  id="create-puzzle-submit-btn"
                  disabled={isSaving || !imageData}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-xl font-sans ${
                    !imageData
                      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                      : isSaving
                      ? "bg-rose-700 text-white cursor-wait opacity-80"
                      : "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:opacity-90 active:scale-98 shadow-rose-950/20"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-white animate-spin" />
                      Création du Mystère en cours...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Générer le Lien Coquin Secrètement
                    </>
                  )}
                </button>
                <div className="text-center mt-3 font-sans">
                  <span className="text-[11px] text-neutral-500">
                    L'image restera invisible au destinataire tant qu'il n'aura pas résolu l'énigme.
                  </span>
                </div>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-rose-500/30 p-8 shadow-2xl max-w-2xl mx-auto text-center relative"
            id="builder-success-panel"
          >
            {/* Seductive lighting spark */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-2xl rounded-full" />

            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 scale-110">
              <Check className="w-8 h-8 stroke-[2.5]" id="success-checkmark-icon" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-sans">
              Invitation coquine prête !
            </h2>
            <p className="text-neutral-400 text-sm md:text-base mb-8 max-w-md mx-auto">
              Le puzzle "<strong>{title}</strong>" a été scellé. Prenez maintenant ce lien d'accès et envoyez-le à la personne de votre choix.
            </p>

            {/* Link clipboard area */}
            <div className="space-y-4 max-w-lg mx-auto mb-8 bg-neutral-950/70 p-4 rounded-xl border border-white/5" id="share-link-wrapper">
              <div className="flex justify-between items-center font-sans">
                <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <LinkIcon className="w-3.5 h-3.5 text-rose-400" /> Lien public à transmettre :
                </span>
                {copied && (
                  <span className="text-[11px] text-rose-400 font-medium px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    Copié avec succès ! 💋
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  id="shareable-link-input"
                  readOnly
                  value={getSharingUrl()}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs md:text-sm text-rose-200 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  id="copy-to-clipboard-btn"
                  onClick={copyToClipboard}
                  className="p-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 font-semibold text-white transition-all active:scale-95"
                  title="Copier le lien"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Direct buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto font-sans" id="success-actions">
              <a
                href={getSharingUrl()}
                id="play-immediately-btn"
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 active:scale-98 text-white text-sm font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Tester le Défi
              </a>
              <button
                type="button"
                id="create-new-puzzle-btn"
                onClick={() => {
                  setSharedId(null);
                  setTitle("");
                  setAuthor("");
                }}
                className="flex-1 px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white active:scale-98 text-neutral-300 text-sm font-semibold rounded-xl border border-white/5 transition-all text-center"
              >
                Créer un Autre Défi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
