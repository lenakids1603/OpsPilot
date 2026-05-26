/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { request } from "./client";
import { ApiResponse } from "@shared/types";
import { getUsers } from "../utils/userStore";

export interface MetricsSummaryPayload {
  metricsSummary: string;
  department: string;
}

// Helper to look up active logged operator
export function getActiveOperatorHeaders() {
  const savedEmail = localStorage.getItem("opspilot_user_email") || "service";
  const user = getUsers().find(u => u.email === savedEmail || u.username === savedEmail || u.phone === savedEmail);
  const name = user ? user.name : "系统客服";
  const email = user ? (user.email || user.username || "service@lenakids.com") : "service@lenakids.com";

  return {
    "x-user-email": email,
    "x-user-name": encodeURIComponent(name)
  };
}

// Existing department metrics AI helper
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

// --- Product Complaints Registry API Service ---

export interface ComplaintImage {
  id: string;
  complaint_id: string;
  image_url: string;
  thumbnail_url: string;
  original_filename: string;
  file_size: number;
  width: number;
  height: number;
  image_hash: string;
  sort_order: number;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
}

export interface ProductComplaint {
  id: string;
  complaint_no: string;
  complaint_date: string;
  platform: "抖音" | "淘宝" | "天猫" | "快手" | "小红书" | "其他";
  shop_code: string;
  order_no: string;
  after_sale_no?: string;
  customer_nickname?: string;
  customer_service_remark?: string;
  style_no: string;
  sku_code: string;
  product_name?: string;
  color?: string;
  size?: string;
  supplier_id?: string;
  supplier_name?: string;
  new_arrival_batch?: string;
  affect_resale: "是" | "否" | "不确定";
  problem_type: string;
  problem_desc: string;
  severity: "轻微" | "一般" | "严重";
  responsibility: "供应商" | "仓库" | "物流" | "客服" | "顾客" | "待判定";
  status: "待处理" | "处理中" | "待仓库复核" | "待供应商确认" | "已处理" | "已关闭" | "无效投诉";
  handle_result?: string;
  refund_amount?: number;
  compensation_amount?: number;
  need_supplier_follow: "是" | "否";
  included_in_quality_stats: "是" | "否";
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_at?: string;
  images: ComplaintImage[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ComplaintStats {
  todayCount: number;
  monthCount: number;
  pendingCount: number;
  needFollowCount: number;
}

// 1. Fetch complaints list
export async function getComplaintsList(filters: {
  page?: number;
  pageSize?: number;
  dateStart?: string;
  dateEnd?: string;
  platform?: string;
  shop_code?: string;
  problem_type?: string;
  status?: string;
  responsibility?: string;
  hasImg?: string;
  needFollow?: string;
  search?: string;
}): Promise<ApiResponse<PaginatedResult<ProductComplaint>>> {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, String(val));
    }
  });

  return request<PaginatedResult<ProductComplaint>>(`/api/customer-service/product-complaints?${query.toString()}`, {
    method: "GET",
    headers: getActiveOperatorHeaders()
  });
}

// 2. Fetch complaint stats
export async function getComplaintStats(): Promise<ApiResponse<ComplaintStats>> {
  return request<ComplaintStats>("/api/customer-service/product-complaints/stats", {
    method: "GET",
    headers: getActiveOperatorHeaders()
  });
}

// 3. Get single complaint detail
export async function getComplaintDetail(id: string): Promise<ApiResponse<ProductComplaint>> {
  return request<ProductComplaint>(`/api/customer-service/product-complaints/${id}`, {
    method: "GET",
    headers: getActiveOperatorHeaders()
  });
}

// 4. Create complaint
export async function createComplaint(
  data: Omit<ProductComplaint, "id" | "complaint_no" | "created_at" | "images" | "created_by" | "created_by_name">
): Promise<ApiResponse<ProductComplaint>> {
  return request<ProductComplaint>("/api/customer-service/product-complaints", {
    method: "POST",
    headers: getActiveOperatorHeaders(),
    body: JSON.stringify(data)
  });
}

// 5. Update complaint
export async function updateComplaint(
  id: string,
  data: Partial<ProductComplaint>
): Promise<ApiResponse<ProductComplaint>> {
  return request<ProductComplaint>(`/api/customer-service/product-complaints/${id}`, {
    method: "PATCH",
    headers: getActiveOperatorHeaders(),
    body: JSON.stringify(data)
  });
}

// 6. Soft delete complaint
export async function deleteComplaint(id: string): Promise<ApiResponse<boolean>> {
  return request<boolean>(`/api/customer-service/product-complaints/${id}`, {
    method: "DELETE",
    headers: getActiveOperatorHeaders()
  });
}

// 7. Check duplicate order
export async function checkDuplicateOrder(orderNo: string): Promise<ApiResponse<{ exist: boolean }>> {
  return request<{ exist: boolean }>(`/api/customer-service/duplicate-order-check?orderNo=${encodeURIComponent(orderNo)}`, {
    method: "GET",
    headers: getActiveOperatorHeaders()
  });
}

// 8. Fetch revision changelogs
export interface ComplaintChangeLog {
  id: string;
  complaint_id: string;
  operator_id: string;
  operator_name: string;
  operation_type: "create" | "update" | "delete" | "upload_image" | "delete_image" | "status_change";
  field_name?: string;
  field_label?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export async function getComplaintChangeLogs(id: string): Promise<ApiResponse<ComplaintChangeLog[]>> {
  return request<ComplaintChangeLog[]>(`/api/customer-service/product-complaints/${id}/change-logs`, {
    method: "GET",
    headers: getActiveOperatorHeaders()
  });
}

// 9. Delete image
export async function deleteComplaintImage(complaintId: string, imageId: string): Promise<ApiResponse<boolean>> {
  return request<boolean>(`/api/customer-service/product-complaints/${complaintId}/images/${imageId}`, {
    method: "DELETE",
    headers: getActiveOperatorHeaders()
  });
}

// Note: Excel export is performed through normal browser download links on `/api/customer-service/product-complaints/export?<filters>`
