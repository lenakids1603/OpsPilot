/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { GeminiService } from "../services/geminiService";

const geminiService = new GeminiService();

export async function generateContent(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      res.status(400).json({ success: false, data: null, message: "Missing parameter: prompt", error: "Bad Request" });
      return;
    }

    const text = await geminiService.generateText(prompt, systemInstruction);
    res.json({
      success: true,
      data: { text },
      message: "Generated successfully",
      error: null
    });
  } catch (error: any) {
    console.error("Controller Error in generateContent:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || "Failed to communicate with Gemini API",
      error: error.message || "Internal Server Error"
    });
  }
}

export async function analyzeMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { metricsSummary, department } = req.body;
    if (!metricsSummary) {
      res.status(400).json({ success: false, data: null, message: "Missing parameter: metricsSummary", error: "Bad Request" });
      return;
    }

    const analysis = await geminiService.analyzeMetrics(metricsSummary, department);
    res.json({
      success: true,
      data: { analysis },
      message: "Analyzed successfully",
      error: null
    });
  } catch (error: any) {
    console.error("Controller Error in analyzeMetrics:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || "Failed to generate business insights",
      error: error.message || "Internal Server Error"
    });
  }
}
