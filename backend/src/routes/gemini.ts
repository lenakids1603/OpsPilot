/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
import { generateContent, analyzeMetrics } from "../controllers/geminiController";

const router = Router();

// Routes prefix in app.ts will be /api/gemini
router.post("/generate", generateContent);
router.post("/analyze", analyzeMetrics);

export default router;
