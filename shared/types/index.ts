/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Original ERP Core Types
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

// RESTful Shared API Service Contracts requested by user
export interface DashboardSummary {
  todayRevenue: string;
  warningAlertCount: number;
  backlogTasks: number;
  activeWorkflows: number;
}

export interface SalesMetric {
  date: string;
  revenue: number;
  ordersCount: number;
  refundRate: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  rating: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  minAlarmStock: number;
  status: "Normal" | "Warning" | "Shortage";
}

export interface FinanceRecord {
  id: string;
  type: "Income" | "Expense";
  category: string;
  amount: number;
  date: string;
  creator: string;
}

export interface CashflowRecord {
  id: string;
  transactionDate: string;
  accountId: string;
  accountName: string;
  direction: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  categoryName: string;
  counterparty: string;
  relatedObjectType?: string;
  relatedObjectId?: string;
  summary: string;
  remark?: string;
  hasAttachment: boolean;
  status: 'draft' | 'confirmed' | 'locked';
  operator: string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  lockedAt?: string;
}

export interface CashflowSummary {
  openingBalance: number;
  periodIncome: number;
  periodExpense: number;
  closingBalance: number;
  unconfirmedAmount: number;
  unclassifiedCount: number;
}

export interface FundAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export interface CashflowCategory {
  id: string;
  name: string;
  direction: 'income' | 'expense' | 'transfer';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
