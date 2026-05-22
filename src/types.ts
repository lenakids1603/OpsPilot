/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  details: string;
}

export interface BusinessChartPoint {
  label: string;
  revenue: number;
  cost: number;
  efficiency: number;
}

export interface SupportTicket {
  id: string;
  customer: string;
  source: "Email" | "WeChat" | "DingTalk" | "System";
  content: string;
  urgency: "High" | "Medium" | "Low";
  status: "Pending" | "Generated" | "Dispatched";
}

export interface Workflow {
  id: string;
  name: string;
  trigger: "OrderCreated" | "InventoryAlert" | "DailyReport" | "CustomerMessage";
  action: "GeminiAnalyze" | "FormatAndStore" | "DispatchDingTalk" | "DispatchWeChat";
  prompt?: string;
  dispatchTarget?: string;
  isActive: boolean;
  runCount: number;
  lastRun?: string;
}

export interface WorkflowLog {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "opspilot";
  text: string;
  timestamp: string;
}
