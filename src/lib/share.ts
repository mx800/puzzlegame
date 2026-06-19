import { PuzzleConfig } from "../types";

/**
 * Compresse/redimensionne une image (dataURL base64) côté navigateur afin de
 * garder un lien de partage raisonnable. Les URLs distantes (presets) sont
 * renvoyées telles quelles : elles sont déjà courtes et n'ont pas besoin d'être
 * embarquées dans le lien.
 */
export async function compressImage(
  src: string,
  maxDim = 900,
  quality = 0.7,
): Promise<string> {
  // Les presets sont des URLs http(s) : on les garde telles quelles.
  if (!src.startsWith("data:")) {
    return src;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      const targetW = Math.round(width * scale);
      const targetH = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Pas de contexte canvas : on retombe sur l'image d'origine.
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Impossible de charger l'image"));
    img.src = src;
  });
}

/** Charge utile compacte (clés courtes) sérialisée dans le lien. */
interface SharePayload {
  t: string; // title
  a: string; // author
  g: number; // gridSize
  i: string; // imageData
  f?: PuzzleConfig["fogIntensity"];
  v?: PuzzleConfig["veilMode"];
  c: number; // createdAt
}

/** base64url Unicode-safe (gère accents/emojis des titres). */
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): string {
  const base64 =
    token.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((token.length + 3) % 4);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Encode un puzzle en token destiné au fragment `#p=` du lien. */
export function encodePuzzle(cfg: PuzzleConfig): string {
  const payload: SharePayload = {
    t: cfg.title,
    a: cfg.author,
    g: cfg.gridSize,
    i: cfg.imageData,
    f: cfg.fogIntensity,
    v: cfg.veilMode,
    c: cfg.createdAt,
  };
  return toBase64Url(JSON.stringify(payload));
}

/** Décode un token de lien en PuzzleConfig, ou `null` si invalide. */
export function decodePuzzle(token: string): PuzzleConfig | null {
  try {
    const payload = JSON.parse(fromBase64Url(token)) as SharePayload;
    if (!payload.i || !payload.g || !payload.t) return null;
    return {
      title: payload.t,
      author: payload.a || "Anonyme",
      gridSize: payload.g,
      imageData: payload.i,
      fogIntensity: payload.f,
      veilMode: payload.v,
      createdAt: payload.c || Date.now(),
    };
  } catch {
    return null;
  }
}
