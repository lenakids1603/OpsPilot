/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static instance: GoogleGenAI | null = null;

  public static getClient(): GoogleGenAI {
    if (!GeminiService.instance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined. Please configure it in Settings > Secrets.");
      }
      GeminiService.instance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return GeminiService.instance;
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const client = GeminiService.getClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an expert corporate secretary, data analyst, and automation consultant named OpsPilot.",
        temperature: 0.7,
      },
    });
    return response.text || "";
  }

  public async analyzeMetrics(metricsSummary: string, department: string): Promise<string> {
    const client = GeminiService.getClient();
    const prompt = `Please provide a professional, concise bulleted analysis (3-4 points, in Chinese) of the following operation metrics for the ${department || "All"} department:\n${metricsSummary}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the advanced business analyst of Lenakids corporate. Act professional, insightful, and offer action-oriented strategies.",
        temperature: 0.4,
      },
    });
    return response.text || "";
  }
}
