import React from "react";

export interface PresetImage {
  id: string;
  name: string;
  url: string;
  category: string;
}

export const PRESETS: PresetImage[] = [
  {
    id: "rose_petals",
    name: "Lit de pétales de roses rouges",
    url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
    category: "Romantique",
  },
  {
    id: "candlelight",
    name: "Douce lueur de bougie",
    url: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800&auto=format&fit=crop&q=80",
    category: "Intime",
  },
  {
    id: "neon_heart",
    name: "Cœur néon passionné",
    url: "https://images.unsplash.com/photo-1518887570146-0612132dd618?w=800&auto=format&fit=crop&q=80",
    category: "Coquin",
  },
  {
    id: "velvet_sheets",
    name: "Draps de satin soyeux",
    url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    category: "Sensuel",
  },
  {
    id: "champagne",
    name: "Bulles et mystères",
    url: "https://images.unsplash.com/photo-1594144400612-3112a994a500?w=800&auto=format&fit=crop&q=80",
    category: "Célébration",
  },
];

interface PresetSelectorProps {
  selectedUrl: string;
  onSelect: (url: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedUrl,
  onSelect,
}) => {
  return (
    <div id="preset-selector-container">
      <p className="text-sm font-medium text-rose-300/80 mb-3 font-sans">
        Ou choisissez une ambiance secrète :
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="preset-grid">
        {PRESETS.map((preset) => {
          const isSelected = selectedUrl === preset.url;
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              type="button"
              onClick={() => onSelect(preset.url)}
              className={`relative h-24 rounded-xl overflow-hidden focus:outline-none transition-all duration-300 group ${
                isSelected
                  ? "ring-2 ring-rose-500 scale-95 shadow-md shadow-rose-900/40"
                  : "hover:scale-102 hover:shadow-lg active:scale-95 border border-white/5"
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 flex flex-col justify-end items-start">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 opacity-90">
                  {preset.category}
                </span>
                <span className="text-[11px] text-white font-medium truncate w-full text-left leading-tight">
                  {preset.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
