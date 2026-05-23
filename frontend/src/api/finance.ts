/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { request } from "./client";
import { FinanceRecord, ApiResponse } from "@shared/types";

// Realistic baseline mock transaction records for Lenakids financial tracking
const MOCK_FINANCE: FinanceRecord[] = [
  { id: "f1", type: "Income", category: "线上直营渠道销售收入", amount: 128450.00, date: "2026-05-22", creator: "系统每日结算" },
  { id: "f2", type: "Income", category: "代理商分销尾款入账", amount: 45000.00, date: "2026-05-21", creator: "财务主出纳" },
  { id: "f3", type: "Expense", category: "夏季新品面料定织打版", amount: 18500.00, date: "2026-05-20", creator: "供应链采购中心" },
  { id: "f4", type: "Expense", category: "华北云端推送基础设施租赁", amount: 3200.00, date: "2026-05-19", creator: "运维技术主管" },
  { id: "f5", type: "Expense", category: "江浙快递货代首重包年协议", amount: 25000.00, date: "2026-05-18", creator: "物流配送管理" },
  { id: "f6", type: "Income", category: "小红书社群直播代销返点", amount: 9800.50, date: "2026-05-18", creator: "联营运营总监" }
];

// Prepared for later financial data loading by Codex. Supporting Sandbox Mock.
export async function getFinanceRecords(): Promise<ApiResponse<FinanceRecord[]>> {
  return request<FinanceRecord[]>("/api/finance", {
    mockData: MOCK_FINANCE
  });
}

