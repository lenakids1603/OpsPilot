/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from "@shared/types";

let usingMockFallback = false;

/**
 * Returns the current active API integration standard.
 * - Live Codex API: Connected directly to backend servers, authentication, and live databases.
 * - AI Studio Mock Sandbox: Working strictly client-side to compile, test, and style UI screens.
 */
export function getApiMode(): "Live Codex API" | "AI Studio Mock Sandbox" {
  return usingMockFallback ? "AI Studio Mock Sandbox" : "Live Codex API";
}

export async function request<T>(
  url: string,
  options?: RequestInit & { mockData?: T }
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      if (options?.mockData !== undefined) {
        console.warn(`[AI Studio Sandbox] API url '${url}' is not implemented by Codex yet. Using mock sandbox fallback.`);
        usingMockFallback = true;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("api-mode-change", { detail: "AI Studio Mock Sandbox" }));
        }
        return {
          success: true,
          data: options.mockData,
          message: "[Sandbox Fallback] Request fulfilled using local mock database.",
          error: null
        };
      }
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    return json as ApiResponse<T>;
  } catch (error: any) {
    if (options?.mockData !== undefined) {
      console.warn(`[AI Studio Sandbox] Connection failed to API url '${url}'. Using mock sandbox fallback.`);
      usingMockFallback = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-mode-change", { detail: "AI Studio Mock Sandbox" }));
      }
      return {
        success: true,
        data: options.mockData,
        message: "[Sandbox Fallback] Request fulfilled using local mock database.",
        error: null
      };
    }

    console.error(`API request error on ${url}:`, error);
    return {
      success: false,
      data: null as any,
      message: error.message || "Failed to contact API server",
      error: error.message || "Network Error"
    };
  }
}

