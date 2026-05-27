/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { request } from "./client";
import { SupplierBill, BillSkuDetail, DiscrepancyItem, BillPayment, BillLog } from "../pages/suppliers/types";

// Base interface mapping from 10 dynamic backend tables
export interface BackendBatch {
  id: string;
  bill_no: string;
  month: string;
  supplier_id: string;
  supplier_name: string;
  bill_type: string;
  settlement_method: string;
  status: string;
  system_inbound_amount: number;
  supplier_bill_amount: number;
  return_amount: number;
  repair_return_amount: number;
  freight_amount: number;
  other_adjustment_amount: number;
  quality_deduction_amount: number;
  timeout_deduction_amount: number;
  calculated_payable_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  diff_amount: number;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BackendSupplier {
  id: string;
  name: string;
  short_name: string;
  contact_name: string;
  phone: string;
  status: string;
}

export interface InboundItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  inbound_date: string;
  source_order_no: string;
  purchase_order_no: string;
  warehouse_receipt_no: string;
  style_code: string;
  sku_code: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  amount: number;
  warehouse_operator: string;
  system_registered_at: string;
  remark: string;
}

export interface BillItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  bill_line_no: number;
  style_code: string;
  sku_code: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  amount: number;
  remark: string;
}

export interface DifferenceItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  diff_type: string;
  style_code: string;
  sku_code: string;
  system_quantity: number;
  supplier_quantity: number;
  system_unit_price: number;
  supplier_unit_price: number;
  system_amount: number;
  supplier_amount: number;
  diff_amount: number;
  status: string;
  remark: string;
}

export interface AdjustmentItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  adjustment_type: "退厂" | "返修回仓" | "运费" | "其他" | "质量扣款" | "超时扣款";
  related_style_code: string;
  related_sku_code: string;
  amount: number;
  responsibility_party: string;
  occurred_at: string;
  remark: string;
  attachment_url?: string;
}

export interface BackendPayment {
  id: string;
  batch_id: string;
  supplier_id: string;
  payment_date: string;
  payer_entity: string;
  payer_account: string;
  receiver_name: string;
  receiver_account: string;
  amount: number;
  remark: string;
  created_by: string;
  created_at: string;
}

export interface BackendLog {
  id: string;
  batch_id: string;
  action_type: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  operator_id: string;
  operator_name: string;
  operated_at: string;
  remark?: string;
}

// Convert backend cents integer batch into frontend decimal standard
export function mapBatchToSupplierBill(
  batch: BackendBatch,
  skus: BillItem[] = [],
  inbounds: InboundItem[] = [],
  diffs: DifferenceItem[] = [],
  adjs: AdjustmentItem[] = [],
  payments: BackendPayment[] = [],
  logs: BackendLog[] = []
): SupplierBill {
  
  // Map billing audit status strings
  let auditStatus: any = "待核对";
  if (batch.status === "pending") auditStatus = "待核对";
  else if (batch.status === "diff") auditStatus = "有差异";
  else if (batch.status === "approved") auditStatus = "已确认";
  else if (batch.status === "partial_paid") auditStatus = "部分付款";
  else if (batch.status === "settled") auditStatus = "已结清";
  else if (batch.status === "draft") auditStatus = "草稿";
  else if (batch.status === "voided") auditStatus = "已作废";

  // Map skus to BillSkuDetail interface
  const skuList: BillSkuDetail[] = skus.map(s => {
    // Find matching system inbound record to show comp details
    const matchedInbound = inbounds.find(i => i.sku_code === s.sku_code) || inbounds[0];
    const systemCostVal = matchedInbound ? matchedInbound.unit_price / 100 : s.unit_price / 100;
    const systemQtyVal = matchedInbound ? matchedInbound.quantity : 0;
    const systemAmtVal = matchedInbound ? matchedInbound.amount / 100 : 0;
    
    // Find matching adjustment deduction for returned quantity
    const supplierId = batch.supplier_id;
    const returnedItems = adjs.filter(a => a.adjustment_type === "退厂" && a.related_sku_code === s.sku_code);
    // Since adjustment amount is cents, divide by price to deduce returned quantity if not explicit
    const returnedQty = returnedItems.reduce((sum, item) => sum + Math.round((item.amount / 100) / s.unit_price), 0);
    const settledQty = Math.max(0, s.quantity - returnedQty);

    return {
      poNo: matchedInbound?.purchase_order_no || "PO-INTERFACE-AUTO",
      name: s.product_name,
      styleNo: s.style_code,
      skuInfo: `${s.color} / ${s.size}`,
      supplierPrice: s.unit_price / 100,
      systemCost: systemCostVal,
      supplierQty: s.quantity,
      inboundQty: systemQtyVal,
      returnedQty: returnedQty,
      settledQty: settledQty,
      supplierAmt: s.amount / 100,
      systemAmt: systemAmtVal,
      diffAmt: (s.amount - systemAmtVal * 100) / 100,
      reason: s.remark || "表格比对相符",
      status: (s.amount - systemAmtVal * 100) !== 0 ? "有差异" : "已验证"
    };
  });

  // Map differences to DiscrepancyItem
  const diffItems: DiscrepancyItem[] = diffs.map(d => ({
    id: d.id,
    type: d.diff_type as any,
    item: d.sku_code ? `${d.style_code} (${d.sku_code})` : d.style_code,
    amt: d.diff_amount / 100,
    desc: d.remark,
    status: d.status === "已确认" ? "已核准" : d.status === "已忽略" ? "已忽略" : "未处理",
    remark: d.remark
  }));

  // Map payments to BillPayment
  const paymentList: BillPayment[] = payments.map(p => ({
    id: p.id,
    date: p.payment_date,
    entity: p.payer_entity,
    account: p.payer_account,
    supplier: batch.supplier_name,
    amount: p.amount / 100,
    type: "货款",
    relatedBill: batch.id,
    voucher: `V_TRANSFER-${p.id}.pdf`,
    operator: p.created_by.includes("@") ? "陈财务" : p.created_by,
    remark: p.remark
  }));

  // Map change logs to BillLog
  const logsList: BillLog[] = logs.map(l => {
    let actLabel = l.action_type;
    if (l.action_type === "create") actLabel = "自动跑批加载";
    else if (l.action_type === "recalculate") actLabel = "公式重算对仗";
    else if (l.action_type === "approve") actLabel = "财务终审过账";
    else if (l.action_type === "reopen") actLabel = "撤销终审";
    else if (l.action_type === "add_payment") actLabel = "转账打款核销";
    else if (l.action_type === "add_adjustment") actLabel = "扣款调整增补";

    return {
      time: l.operated_at.replace("T", " ").substring(0, 19),
      operator: l.operator_name,
      action: actLabel,
      before: l.old_value || "无",
      after: l.new_value || "无",
      remark: l.remark || "操作归档成功"
    };
  });

  return {
    id: batch.id,
    supplierName: batch.supplier_name,
    period: batch.month,
    settlementMode: batch.settlement_method as any,
    poCount: skus.length || 1,
    skuCount: skus.reduce((s, x) => s + x.quantity, 0),
    supplierAmt: batch.supplier_bill_amount / 100,
    systemAmt: batch.system_inbound_amount / 100,
    diffAmt: batch.diff_amount / 100,
    penaltyAmt: (batch.quality_deduction_amount + batch.timeout_deduction_amount) / 100,
    finalAmt: batch.calculated_payable_amount / 100,
    paidAmt: batch.paid_amount / 100,
    remainingAmt: batch.unpaid_amount / 100,
    invoiceStatus: "未开票",
    auditStatus: auditStatus,
    owner: batch.created_by.includes("@") ? "陈财务" : "陈财务",
    skus: skuList,
    discrepancies: diffItems,
    payments: paymentList,
    invoices: [],
    logs: logsList
  };
}

// 1. GET list of primary batches
export async function getReconciliationList(filters: {
  month?: string;
  supplier_id?: string;
  status?: string;
  bill_type?: string;
  settlement_method?: string;
  only_diff?: boolean;
}) {
  const query = new URLSearchParams();
  if (filters.month) query.append("month", filters.month);
  if (filters.supplier_id) query.append("supplier_id", filters.supplier_id);
  if (filters.status) query.append("status", filters.status);
  if (filters.bill_type) query.append("bill_type", filters.bill_type);
  if (filters.settlement_method) query.append("settlement_method", filters.settlement_method);
  if (filters.only_diff !== undefined) query.append("only_diff", String(filters.only_diff));

  const res = await request<BackendBatch[]>(`/api/supplier-reconciliations?${query.toString()}`);
  return res;
}

// 2. GET summary cards stats
export async function getReconciliationSummary() {
  const res = await request<{
    total_inbound: number;
    total_deductions: number;
    total_payable: number;
    total_paid: number;
    total_unpaid: number;
    abnormal_count: number;
  }>("/api/supplier-reconciliations/summary");
  
  // Adapt cents to decimal format for metrics cards
  if (res.success && res.data) {
    return {
      ...res,
      data: {
        total_inbound: res.data.total_inbound / 100,
        total_deductions: res.data.total_deductions / 100,
        total_payable: res.data.total_payable / 100,
        total_paid: res.data.total_paid / 100,
        total_unpaid: res.data.total_unpaid / 100,
        abnormal_count: res.data.abnormal_count
      }
    };
  }
  return res;
}

// 3. GET list of active suppliers
export async function getActiveSuppliers() {
  const res = await request<BackendSupplier[]>("/api/supplier-reconciliations/suppliers");
  return res;
}

// 4. GET Consolidated SupplierBill detail
export async function getSupplierBillDetail(id: string) {
  try {
    const [batchRes, skusRes, inboundsRes, diffsRes, adjsRes, paysRes, logsRes] = await Promise.all([
      request<BackendBatch>(`/api/supplier-reconciliations/${id}`),
      request<BillItem[]>(`/api/supplier-reconciliations/${id}/bill-items`),
      request<InboundItem[]>(`/api/supplier-reconciliations/${id}/inbound-items`),
      request<DifferenceItem[]>(`/api/supplier-reconciliations/${id}/differences`),
      request<AdjustmentItem[]>(`/api/supplier-reconciliations/${id}/adjustments`),
      request<BackendPayment[]>(`/api/supplier-reconciliations/${id}/payments`),
      request<BackendLog[]>(`/api/supplier-reconciliations/${id}/logs`)
    ]);

    if (!batchRes.success || !batchRes.data) {
      return { success: false, data: null, message: batchRes.message || "找不到账期批次" };
    }

    const billObj = mapBatchToSupplierBill(
      batchRes.data,
      skusRes.data || [],
      inboundsRes.data || [],
      diffsRes.data || [],
      adjsRes.data || [],
      paysRes.data || [],
      logsRes.data || []
    );

    return {
      success: true,
      data: billObj,
      message: "对账单细节综合加载成功"
    };

  } catch (err: any) {
    return {
      success: false,
      data: null,
      message: "对仗拉取失败: " + err.message
    };
  }
}

// 5. POST Recalculate
export async function triggerRecalculate(id: string) {
  const res = await request<BackendBatch>(`/api/supplier-reconciliations/${id}/recalculate`, {
    method: "POST"
  });
  return res;
}

// 6. POST Mark Approved
export async function approveReconciliationBatch(id: string) {
  const res = await request<BackendBatch>(`/api/supplier-reconciliations/${id}/approve`, {
    method: "POST"
  });
  return res;
}

// 7. POST Reopen
export async function reopenReconciliationBatch(id: string) {
  const res = await request<BackendBatch>(`/api/supplier-reconciliations/${id}/reopen`, {
    method: "POST"
  });
  return res;
}

// 8. POST Add unique Adjustment deduction
export async function addSupplierAdjustment(id: string, body: {
  supplier_id?: string;
  adjustment_type: string;
  related_style_code?: string;
  related_sku_code?: string;
  amount: number; // In cents integer
  responsibility_party?: string;
  occurred_at?: string;
  remark?: string;
}) {
  const res = await request<AdjustmentItem>(`/api/supplier-reconciliations/${id}/adjustments`, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return res;
}

// 9. POST Add cash Payment ledger
export async function addSupplierPayment(id: string, body: {
  supplier_id?: string;
  payment_date: string;
  payer_entity?: string;
  payer_account?: string;
  receiver_name?: string;
  receiver_account?: string;
  amount: number; // Cents
  remark?: string;
}) {
  const res = await request<BackendPayment>(`/api/supplier-reconciliations/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return res;
}

// 10. POST Upload File helper
export async function uploadReconciliationFile(endpoint: string, file: File, targetBatchId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("batch_id", targetBatchId);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return { success: data.success, message: data.message };
  } catch (error: any) {
    console.error("Failed to upload excel:", error);
    return { success: false, message: error.message };
  }
}

// 11. POST AI Assist recognize fields map
export interface AiRecognizeResult {
  headers: string[];
  mappings: Record<string, string>;
  confidence: Record<string, number>;
  previewRows: any[];
  standardizedPreview: any[];
  fullStandardizedItems: any[];
  geminiEnhanced: boolean;
  totalRows: number;
}

export async function aiRecognizeFields(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/supplier-reconciliations/ai-recognize-fields", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data as { success: boolean; data: AiRecognizeResult; message?: string };
  } catch (error: any) {
    console.error("Failed to recognize fields:", error);
    return { success: false, data: null as any, message: error.message };
  }
}

// 12. GET AI Analysis and Auto-Reconciliation summary
export async function getAiSummary(batchId: string) {
  const res = await request<{ summary: string; aiUsed: boolean }>(`/api/supplier-reconciliations/${batchId}/ai-summary`);
  return res;
}

