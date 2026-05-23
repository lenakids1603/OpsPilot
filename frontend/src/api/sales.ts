/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { request } from "./client";
import { ApiResponse } from "@shared/types";

export interface MetricsSummaryPayload {
  metricsSummary: string;
  department: string;
}

// Prepared for later metrics analysis by Codex. Supporting Sandbox Mock.
export async function analyzeDepartmentMetrics(
  payload: MetricsSummaryPayload
): Promise<ApiResponse<{ analysis: string }>> {
  return request<{ analysis: string }>("/api/gemini/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
    mockData: {
      analysis: `### 📊 [乐那童装 - ${payload.department} 面板智能分析] (AI Studio 沙盒模拟报告)

1. **核心观察指出**：在最近的经营周期内，商品销售渠道呈均衡性增长。但供应链效率与物流配送的周转周期仍有优化和压缩空间。
2. **风险告警指标**：华北地区物流近期受不可抗力因素（如极端雷暴气候）影响，存在短期库龄增加和派送延迟趋势。
3. **流程优化举措**：建议通过 OpsPilot 自动规则，在订单付款完成后 **10 分钟内**，智能触发“由于雷雨天气天气，本批配货可能受阻”的关怀微信，提前降低客服负面满意度。

*注：本篇分析报告基于前端本地规则逻辑渲染。当 Codex 完成数据库与真实 LLM 资源对接后，分析结果将反映真实的数据库表级销售趋势。*`
    }
  });
}

