import { PuzzleConfig } from "../types";

/**
 * Compresse/redimensionne une image (dataURL base64) côté navigateur afin de
 * garder un lien de partage raisonnable. Les URLs distantes (presets) sont
 * renvoyées telles quelles : elles sont déjà courtes et n'ont pas besoin d'être
 * embarquées dans le lien.
 */
function drawToJpeg(
  source: CanvasImageSource,
  w: number,
  h: number,
  maxDim: number,
  quality: number,
): string | null {
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const targetW = Math.max(1, Math.round(w * scale));
  const targetH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, targetW, targetH);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Compresse/redimensionne une image (dataURL base64) en JPEG côté navigateur
 * afin de garder un lien de partage court. Les URLs distantes (presets) sont
 * renvoyées telles quelles.
 *
 * Utilise `createImageBitmap` en priorité : sur mobile (Android/iOS) c'est bien
 * plus fiable que `new Image()` pour décoder de très grandes photos (12-48 MP)
 * et applique correctement l'orientation EXIF. Repli sur `<img>` si indisponible.
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

  // Voie robuste mobile : createImageBitmap depuis un Blob.
  if (typeof createImageBitmap === "function") {
    try {
      const blob = await (await fetch(src)).blob();
      const bitmap = await createImageBitmap(blob);
      const out = drawToJpeg(bitmap, bitmap.width, bitmap.height, maxDim, quality);
      bitmap.close?.();
      if (out) return out;
    } catch {
      // On bascule sur le repli <img> ci-dessous.
    }
  }

  // Repli : élément <img> classique.
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const out = drawToJpeg(img, w, h, maxDim, quality);
      // Sans contexte canvas, on retombe sur l'image d'origine.
      resolve(out ?? src);
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

/** Paliers de compression décroissants : [côté max en px, qualité JPEG]. */
const COMPRESSION_TIERS: Array<[number, number]> = [
  [820, 0.62],
  [680, 0.55],
  [560, 0.5],
  [460, 0.45],
  [380, 0.4],
  [320, 0.38],
];

/**
 * Encode un puzzle en réduisant l'image par paliers jusqu'à ce que le token
 * reste sous `targetLen` caractères.
 *
 * Indispensable pour les photos prises sur mobile (souvent 12-48 MP) : un lien
 * trop long est tronqué par Android au moment de la copie / du partage (limites
 * du presse-papiers et des Intents système), ce qui casse le décodage chez le
 * destinataire ("Secret Introuvable"). Sur ordinateur le presse-papiers tolère
 * de longues chaînes, d'où le fonctionnement.
 *
 * Retourne le token final et sa longueur (pour avertir si le lien reste long).
 */
export async function encodePuzzleAdaptive(
  cfg: PuzzleConfig,
  targetLen = 12000,
): Promise<{ token: string; length: number }> {
  // Image preset (URL distante) : pas de base64, le lien est déjà court.
  if (!cfg.imageData.startsWith("data:")) {
    const token = encodePuzzle(cfg);
    return { token, length: token.length };
  }

  let token = "";
  for (let i = 0; i < COMPRESSION_TIERS.length; i++) {
    const [maxDim, quality] = COMPRESSION_TIERS[i];
    const image = await compressImage(cfg.imageData, maxDim, quality);
    token = encodePuzzle({ ...cfg, imageData: image });
    if (token.length <= targetLen || i === COMPRESSION_TIERS.length - 1) break;
  }
  return { token, length: token.length };
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
