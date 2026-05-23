/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from "path";
import dotenv from "dotenv";
import express from "express";
import app from "./app";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite...");
    
    // Create Vite server in middleware mode relative to the frontend directory
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), "frontend"),
      server: {
        middlewareMode: true,
        allowedHosts: ["erp.lenakids.com"],
      },
      appType: "spa",
    });
    
    // Register Vite middleware
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.resolve(process.cwd(), "dist");
    
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OpsPilot Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server bootstrap error:", err);
});
