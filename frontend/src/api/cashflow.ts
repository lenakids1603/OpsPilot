/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { request } from "./client";
import { CashflowRecord, CashflowSummary, FundAccount, CashflowCategory, ApiResponse } from "@shared/types";

// High-fidelity active mock state for AI Studio Sandbox Mode session persistence
let SESSION_CASHFLOWS: CashflowRecord[] = [
  {
    id: "cf-1",
    transactionDate: "2026-05-23",
    accountId: "acc-1",
    accountName: "公司建设银行",
    direction: "expense",
    amount: 18500.00,
    categoryId: "cat-ex-1",
    categoryName: "供应商付款",
    counterparty: "盛大面料织造厂",
    summary: "给盛大预付2026早秋弹力棉布面料款",
    remark: "出货后付清余款，本次支付定金比例 30%",
    hasAttachment: true,
    status: "locked",
    operator: "陈建国",
    createdAt: "2026-05-23T09:12:00.000Z",
    lockedAt: "2026-05-23T11:00:00.000Z"
  },
  {
    id: "cf-2",
    transactionDate: "2026-05-22",
    accountId: "acc-3",
    accountName: "公司支付宝",
    direction: "income",
    amount: 128450.00,
    categoryId: "cat-in-1",
    categoryName: "销售收入",
    counterparty: "天猫基础流结算",
    summary: "5月21日天猫直营店资金结算自动归集",
    remark: "每日自动结算入网签约款项",
    hasAttachment: false,
    status: "confirmed",
    operator: "财务结算系统",
    createdAt: "2026-05-22T23:59:00.000Z",
    confirmedAt: "2026-05-23T01:10:00.000Z"
  },
  {
    id: "cf-3",
    transactionDate: "2026-05-21",
    accountId: "acc-2",
    accountName: "公司工商银行",
    direction: "expense",
    amount: 12000.00,
    categoryId: "cat-ex-2",
    categoryName: "工资支出",
    counterparty: "技术研发组李明等5人",
    summary: "发放2026年4月份外流技术顾问研发包资",
    remark: "已扣缴个税，网银对账单附凭证",
    hasAttachment: true,
    status: "confirmed",
    operator: "李泽宇",
    createdAt: "2026-05-21T14:30:00.000Z",
    confirmedAt: "2026-05-21T18:00:00.000Z"
  },
  {
    id: "cf-4",
    transactionDate: "2026-05-21",
    accountId: "acc-4",
    accountName: "公司微信",
    direction: "income",
    amount: 1250.00,
    categoryId: "cat-in-2",
    categoryName: "退款退回",
    counterparty: "顺丰速运物流公司",
    summary: "4月份超重退款理赔费用结算回账",
    remark: "4月12号超重理赔申诉成功单",
    hasAttachment: false,
    status: "confirmed",
    operator: "王海玲",
    createdAt: "2026-05-21T10:15:00.000Z",
    confirmedAt: "2026-05-21T11:20:00.000Z"
  },
  {
    id: "cf-5",
    transactionDate: "2026-05-20",
    accountId: "acc-4",
    accountName: "公司微信",
    direction: "expense",
    amount: 450.00,
    categoryId: "cat-ex-5",
    categoryName: "办公费用",
    counterparty: "京东自营办公耗材",
    summary: "采购办公室A4复印纸与晨光考试性笔备件",
    remark: "前台行政提单",
    hasAttachment: false,
    status: "draft",
    operator: "黄婷",
    createdAt: "2026-05-20T11:00:00.000Z"
  },
  {
    id: "cf-6",
    transactionDate: "2026-05-19",
    accountId: "acc-3",
    accountName: "公司支付宝",
    direction: "expense",
    amount: 8000.00,
    categoryId: "cat-ex-6",
    categoryName: "广告推广",
    counterparty: "字节跳动千川广告",
    summary: "抖音夏季童鞋千川引流短视频推广充值",
    remark: "市场部主投手提交",
    hasAttachment: true,
    status: "draft",
    operator: "赵丹妮",
    createdAt: "2026-05-19T13:45:00.000Z"
  },
  {
    id: "cf-7",
    transactionDate: "2026-05-18",
    accountId: "acc-5",
    accountName: "现金账户",
    direction: "transfer",
    amount: 5000.00,
    categoryId: "cat-tr-1",
    categoryName: "账户内部转账",
    counterparty: "日常综合行政备用金",
    summary: "从工商银行提取备用金至办公室现钞提管箱",
    remark: "已入账现钞流水，并验证盘点",
    hasAttachment: true,
    status: "confirmed",
    operator: "王海玲",
    createdAt: "2026-05-18T16:00:00.000Z",
    confirmedAt: "2026-05-18T16:30:00.000Z"
  },
  {
    id: "cf-8",
    transactionDate: "2026-05-18",
    accountId: "acc-1",
    accountName: "公司建设银行",
    direction: "expense",
    amount: 32000.00,
    categoryId: "cat-ex-4",
    categoryName: "物流费用",
    counterparty: "极兔速递集团",
    summary: "2026年4月份江浙沪华中区运费周结算",
    remark: "账期运费汇总，含抵扣抵用券120元",
    hasAttachment: true,
    status: "locked",
    operator: "陈建国",
    createdAt: "2026-05-18T09:30:00.000Z",
    lockedAt: "2026-05-20T10:00:00.000Z"
  }
];

// Fund Accounts Mock data
const MOCK_FUND_ACCOUNTS: FundAccount[] = [
  { id: "acc-1", name: "公司建设银行", type: "BankCard", balance: 1485000.00 },
  { id: "acc-2", name: "公司工商银行", type: "BankCard", balance: 652300.00 },
  { id: "acc-3", name: "公司支付宝", type: "ThirdParty", balance: 352420.50 },
  { id: "acc-4", name: "公司微信", type: "ThirdParty", balance: 94810.00 },
  { id: "acc-5", name: "现金账户", type: "Cash", balance: 25000.00 }
];

// Cashflow Categories Mock data
const MOCK_CATEGORIES: CashflowCategory[] = [
  { id: "cat-in-1", name: "销售收入", direction: "income" },
  { id: "cat-in-2", name: "退款退回", direction: "income" },
  { id: "cat-in-3", name: "其他收入", direction: "income" },
  { id: "cat-ex-1", name: "供应商付款", direction: "expense" },
  { id: "cat-ex-2", name: "工资支出", direction: "expense" },
  { id: "cat-ex-3", name: "房租水电", direction: "expense" },
  { id: "cat-ex-4", name: "物流费用", direction: "expense" },
  { id: "cat-ex-5", name: "办公费用", direction: "expense" },
  { id: "cat-ex-6", name: "广告推广", direction: "expense" },
  { id: "cat-ex-7", name: "退款支出", direction: "expense" },
  { id: "cat-ex-8", name: "其他支出", direction: "expense" },
  { id: "cat-tr-1", name: "账户内部转账", direction: "transfer" }
];

/**
 * 1. Fetch live or sandbox Cashflow records list.
 */
export async function getCashflowList(): Promise<ApiResponse<CashflowRecord[]>> {
  return request<CashflowRecord[]>("/api/finance/cashflow", {
    mockData: [...SESSION_CASHFLOWS]
  });
}

/**
 * 2. Add single Cashflow record. Appends in-session array during sandbox mode.
 */
export async function createCashflow(record: Omit<CashflowRecord, "id" | "createdAt" | "status"> & { status?: "draft" | "confirmed" }): Promise<ApiResponse<CashflowRecord>> {
  const newRecord: CashflowRecord = {
    ...record,
    id: "cf-" + Date.now(),
    status: record.status || "draft",
    createdAt: new Date().toISOString()
  };
  
  // Appending in-memory persistence
  SESSION_CASHFLOWS = [newRecord, ...SESSION_CASHFLOWS];

  return request<CashflowRecord>("/api/finance/cashflow", {
    method: "POST",
    body: JSON.stringify(record),
    mockData: newRecord
  });
}

/**
 * 3. Update existing Cashflow record. Synchronizes inside session during sandbox.
 */
export async function updateCashflow(id: string, record: Partial<CashflowRecord>): Promise<ApiResponse<CashflowRecord>> {
  let targetIndex = SESSION_CASHFLOWS.findIndex(cf => cf.id === id);
  let updatedRecord: CashflowRecord;

  if (targetIndex !== -1) {
    updatedRecord = {
      ...SESSION_CASHFLOWS[targetIndex],
      ...record,
      updatedAt: new Date().toISOString()
    };
    SESSION_CASHFLOWS[targetIndex] = updatedRecord;
  } else {
    updatedRecord = {
      ...(record as CashflowRecord),
      id,
      updatedAt: new Date().toISOString()
    };
  }

  return request<CashflowRecord>(`/api/finance/cashflow/${id}`, {
    method: "PUT",
    body: JSON.stringify(record),
    mockData: updatedRecord
  });
}

/**
 * 4. Delete single Cashflow record. Removes inside session during sandbox.
 */
export async function deleteCashflow(id: string): Promise<ApiResponse<boolean>> {
  const previousLength = SESSION_CASHFLOWS.length;
  SESSION_CASHFLOWS = SESSION_CASHFLOWS.filter(cf => cf.id !== id);
  const success = SESSION_CASHFLOWS.length < previousLength;

  return request<boolean>(`/api/finance/cashflow/${id}`, {
    method: "DELETE",
    mockData: success
  });
}

/**
 * 5. Bulk spreadsheet importing/matching tool. Appends inside session during sandbox.
 */
export async function importCashflow(records: Omit<CashflowRecord, "id" | "createdAt">[]): Promise<ApiResponse<CashflowRecord[]>> {
  const imported: CashflowRecord[] = records.map((rec, index) => ({
    ...rec,
    id: `cf-import-${Date.now()}-${index}`,
    createdAt: new Date().toISOString()
  }));

  SESSION_CASHFLOWS = [...imported, ...SESSION_CASHFLOWS];

  return request<CashflowRecord[]>("/api/finance/cashflow/import", {
    method: "POST",
    body: JSON.stringify(records),
    mockData: imported
  });
}

/**
 * 6. Confirm Cashflow record (changes draft to confirmed).
 */
export async function confirmCashflow(id: string): Promise<ApiResponse<CashflowRecord>> {
  let targetIndex = SESSION_CASHFLOWS.findIndex(cf => cf.id === id);
  let updatedRecord: CashflowRecord;

  if (targetIndex !== -1) {
    const rec = SESSION_CASHFLOWS[targetIndex];
    rec.status = "confirmed";
    rec.confirmedAt = new Date().toISOString();
    updatedRecord = { ...rec };
    SESSION_CASHFLOWS[targetIndex] = updatedRecord;
  } else {
    throw new Error("Rec not found in active session.");
  }

  return request<CashflowRecord>(`/api/finance/cashflow/${id}/confirm`, {
    method: "POST",
    mockData: updatedRecord
  });
}

/**
 * 7. Lock Cashflow record (changes confirmed to locked).
 */
export async function lockCashflow(id: string): Promise<ApiResponse<CashflowRecord>> {
  let targetIndex = SESSION_CASHFLOWS.findIndex(cf => cf.id === id);
  let updatedRecord: CashflowRecord;

  if (targetIndex !== -1) {
    const rec = SESSION_CASHFLOWS[targetIndex];
    rec.status = "locked";
    rec.lockedAt = new Date().toISOString();
    updatedRecord = { ...rec };
    SESSION_CASHFLOWS[targetIndex] = updatedRecord;
  } else {
    throw new Error("Rec not found in active session.");
  }

  return request<CashflowRecord>(`/api/finance/cashflow/${id}/lock`, {
    method: "POST",
    mockData: updatedRecord
  });
}

/**
 * 8. Summary analytics compiler (period flows, remaining unconfirmed pools).
 */
export async function getCashflowSummary(): Promise<ApiResponse<CashflowSummary>> {
  // Let's compute actual totals on the session array.
  let periodIncome = 0;
  let periodExpense = 0;
  let unconfirmedAmount = 0;
  let unclassifiedCount = 0;

  SESSION_CASHFLOWS.forEach(cf => {
    if (cf.direction === "income") {
      periodIncome += cf.amount;
    } else if (cf.direction === "expense") {
      periodExpense += cf.amount;
    }

    if (cf.status === "draft") {
      unconfirmedAmount += cf.amount;
    }

    // Unclassified accounts or categories
    if (!cf.categoryId || cf.categoryName === "其他收入" || cf.categoryName === "其他支出") {
      unclassifiedCount++;
    }
  });

  const openingBalance = 2450000.00; // Baseline company cash reserves
  const closingBalance = openingBalance + periodIncome - periodExpense;

  const summaryData: CashflowSummary = {
    openingBalance,
    periodIncome,
    periodExpense,
    closingBalance,
    unconfirmedAmount,
    unclassifiedCount
  };

  return request<CashflowSummary>("/api/finance/cashflow/summary", {
    mockData: summaryData
  });
}

/**
 * 9. Cash and checking accounts list locator.
 */
export async function getFundAccounts(): Promise<ApiResponse<FundAccount[]>> {
  return request<FundAccount[]>("/api/finance/accounts", {
    mockData: [...MOCK_FUND_ACCOUNTS]
  });
}

/**
 * 10. Ledger classification list.
 */
export async function getCashflowCategories(): Promise<ApiResponse<CashflowCategory[]>> {
  return request<CashflowCategory[]>("/api/finance/categories", {
    mockData: [...MOCK_CATEGORIES]
  });
}
