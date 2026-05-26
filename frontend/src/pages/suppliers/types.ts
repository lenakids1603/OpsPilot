/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BillSkuDetail {
  poNo: string;
  name: string;
  styleNo: string;
  skuInfo: string;
  supplierPrice: number;
  systemCost: number;
  supplierQty: number;
  inboundQty: number;
  returnedQty: number;
  settledQty: number;
  supplierAmt: number;
  systemAmt: number;
  diffAmt: number;
  reason: string;
  status: "待核对" | "有差异" | "已验证" | "已解决";
}

export interface DiscrepancyItem {
  id: string;
  type: "数量差异" | "单价差异" | "金额差异" | "退货未扣" | "残次扣款" | "重复结算" | "未入库先结算" | "代卖商品";
  item: string;
  amt: number;
  desc: string;
  status: "未处理" | "已核准" | "已驳回" | "下期处理" | "已忽略";
  remark?: string;
}

export interface BillPayment {
  id: string;
  date: string;
  entity: string;
  account: string;
  supplier: string;
  amount: number;
  type: "预付款" | "货款" | "尾款" | "临时周转" | "补款";
  relatedBill: string;
  voucher: string; // File name or voucher reference
  operator: string;
  remark: string;
}

export interface BillInvoice {
  id: string;
  date: string;
  invoiceNo: string;
  supplier: string;
  amount: number;
  relatedBill: string;
  status: "未收票" | "已收票" | "金额不符" | "已作废";
  file: string;
  remark: string;
}

export interface BillLog {
  time: string;
  operator: string;
  action: string;
  before: string;
  after: string;
  remark: string;
}

export interface SupplierBill {
  id: string;
  supplierName: string;
  period: string; // e.g. "2026-05"
  settlementMode: "月结" | "批次" | "临时付款" | "批次结算" | "预付款" | "尾款";
  poCount: number;
  skuCount: number;
  supplierAmt: number;
  systemAmt: number;
  diffAmt: number;
  penaltyAmt: number;
  finalAmt: number;
  paidAmt: number;
  remainingAmt: number;
  invoiceStatus: "未开票" | "已开票" | "部分开票";
  auditStatus: "待核对" | "有差异" | "已确认" | "已结清" | "未核对" | "核对中" | "已付款" | "已作废";
  owner: string;
  skus: BillSkuDetail[];
  discrepancies: DiscrepancyItem[];
  payments: BillPayment[];
  invoices: BillInvoice[];
  logs: BillLog[];
}
