/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { request } from "./client";
import { ApiResponse } from "@shared/types";

// Prepared for later system probing by Codex. Supporting Sandbox Mock.
export async function checkSystemHealth(): Promise<ApiResponse<{ status: string; time: string }>> {
  return request<{ status: string; time: string }>("/api/health", {
    mockData: { status: "Offline (AI Studio Sandbox Mode)", time: new Date().toISOString() }
  });
}

// Prepared for later chat responses by Codex or Gemini. Supporting Sandbox Mock.
export async function askOpsPilot(
  prompt: string,
  systemInstruction?: string
): Promise<ApiResponse<{ text: string }>> {
  return request<{ text: string }>("/api/gemini/generate", {
    method: "POST",
    body: JSON.stringify({ prompt, systemInstruction }),
    mockData: {
      text: `👋 您好！目前 OpsPilot 正运行在【AI Studio 纯前端样式与交互沙布盒 (Sandbox Mode)】中。\n\n提示：当 Codex 工具后续部署了真实的服务端路由、数据库、用户及角色权限，并绑定了您的 Gemini 接口密钥时，此智能助手将自动切换为【Codex 实时 API】模式，并能执行大模型和复杂的业务编排！\n\n您可以试用左侧的客单提取规则（全本地正则算法支持，不依赖任何服务器），它的设计与真实的业务数据完全对应。`
    }
  });
}

