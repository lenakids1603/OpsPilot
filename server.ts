import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3080;

  // Middleware for body parsing
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Generic Gemini API proxy endpoint for AI assistant & drafts
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
         res.status(400).json({ error: "Missing parameter: prompt" });
         return;
      }

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are an expert corporate secretary, data analyst, and automation consultant named OpsPilot.",
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Generate API error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Gemini API" });
    }
  });

  // Special Gemini endpoint for Metric Insight Analysis
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { metricsSummary, department } = req.body;
      if (!metricsSummary) {
         res.status(400).json({ error: "Missing parameter: metricsSummary" });
         return;
      }

      const client = getGeminiClient();
      const prompt = `Please provide a professional, concise bulleted analysis (3-4 points, in Chinese) of the following operation metrics for the ${department || "All"} department:\n${metricsSummary}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the advanced business analyst of Lenakids corporate. Act professional, insightful, and offer action-oriented strategies.",
          temperature: 0.4,
        }
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini Analyze API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate business insights" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: ['erp.lenakids.com'],
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
