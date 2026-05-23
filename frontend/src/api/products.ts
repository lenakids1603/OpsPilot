/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { request } from "./client";
import { Product, ApiResponse } from "@shared/types";

// High-fidelity fallback list representing Lenakids product catalogs for AI Studio Sandbox Mode
const MOCK_PRODUCTS: Product[] = [
  { id: "p1", sku: "LN-SUN-HAT-01", name: "乐那童装 森林印花夏季儿童防晒遮阳帽", category: "配饰 / 帽子", price: 59.00, stock: 120 },
  { id: "p2", sku: "LN-BODY-COT-02", name: "乐那童装 100%有机纯棉婴儿连体哈服 (2连装)", category: "爬服 / 连体服", price: 129.00, stock: 350 },
  { id: "p3", sku: "LN-FLE-PANT-03", name: "乐那童装 经典摇粒绒抗静电保暖背带长裤", category: "下装 / 裤装", price: 189.05, stock: 85 },
  { id: "p4", sku: "LN-SNE-KID-04", name: "乐那鞋履 炫彩轻量防滑中童魔术贴透气运动鞋", category: "鞋履 / 运动鞋", price: 239.00, stock: 144 },
  { id: "p5", sku: "LN-SWE-AUT-05", name: "乐那童装 糖果撞色插肩袖秋季针织卫衣", category: "上装 / 毛衣卫衣", price: 145.50, stock: 210 },
  { id: "p6", sku: "LN-RAIN-COA-06", name: "乐那童装 恐龙卡通反光条拉链防风连体雨衣", category: "配饰 / 雨具", price: 88.00, stock: 65 }
];

// Prepared for later CRUD operations on product catalogs by Codex. Supporting Sandbox Mock.
export async function getProductsList(): Promise<ApiResponse<Product[]>> {
  return request<Product[]>("/api/products", {
    mockData: MOCK_PRODUCTS
  });
}

