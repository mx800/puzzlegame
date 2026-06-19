import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support large base64 image uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Ensure data store directory exists
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Save puzzle
  app.post("/api/puzzles", (req, res) => {
    try {
      const { title, author, gridSize, imageData, fogIntensity, veilMode } = req.body;

      if (!title || !gridSize || !imageData) {
        return res.status(400).json({ error: "Champs obligatoires manquants" });
      }

      // Generate random unique ID (e.g., 6 alphanumeric characters)
      const id = Math.random().toString(36).substring(2, 8).toUpperCase();
      const puzzleFile = path.join(DATA_DIR, `puzzle_${id}.json`);

      const puzzleData = {
        id,
        title,
        author: author || "Anonyme",
        gridSize: parseInt(gridSize, 10),
        imageData,
        fogIntensity: fogIntensity || "sensual",
        veilMode: veilMode || "progress",
        createdAt: Date.now(),
      };

      fs.writeFileSync(puzzleFile, JSON.stringify(puzzleData, null, 2), "utf8");
      console.log(`[Success] Puzzle ${id} est enregistré.`);

      res.status(201).json({ id, success: true });
    } catch (error: any) {
      console.error("Échec de la sauvegarde du puzzle:", error);
      res.status(500).json({ error: "Erreur interne lors de la sauvegarde" });
    }
  });

  // Load puzzle
  app.get("/api/puzzles/:id", (req, res) => {
    try {
      const id = req.params.id.toUpperCase();
      const puzzleFile = path.join(DATA_DIR, `puzzle_${id}.json`);

      if (!fs.existsSync(puzzleFile)) {
        return res.status(404).json({ error: "Puzzle introuvable" });
      }

      const puzzleJson = fs.readFileSync(puzzleFile, "utf8");
      const puzzleData = JSON.parse(puzzleJson);

      res.json(puzzleData);
    } catch (error: any) {
      console.error("Échec du chargement du puzzle:", error);
      res.status(500).json({ error: "Erreur interne lors du chargement" });
    }
  });

  // --- Frontend Assets and Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting Express server:", err);
});
