/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Truck, Warehouse, Wallet, Search, Filter, Check, X, ChevronLeft, Plus, 
  AlertCircle, ArrowLeftRight, Download, Sparkles, Clock, User, History, 
  ChevronRight, Coins, Eye, Settings, Layers, Lock, ThumbsUp, CheckCircle, 
  FileSpreadsheet, ClipboardCheck, Edit2, ShieldAlert, BadgeAlert, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types corresponding to domain
interface SkuArrivalItem {
  id: string;
  style_no: string;          // 款号
  sku_code: string;          // SKU 编码
  product_name: string;      // 商品名称
  color_size: string;        // 颜色尺码
  po_qty: number;            // 采购单数量
  supplier_qty: number;      // 供应商发货数量
  warehouse_qty: number;     // 仓库实点数量
  jst_qty: number;           // 聚水潭入库数量
  cost_price: number;        // 成本单价 (隐藏给仓库)
  discrepancy_reason?: string; // 差异原因
  handling_result?: string;  // 处理结果
  remark?: string;
}

interface ArrivalBatch {
  id: string;                 // 到货批次号
  supplier_name: string;      // 供应商
  arrival_date: string;       // 到货日期
  po_no: string;              // 关联采购单号
  style_count: number;        // 款号数量
  sku_count: number;          // SKU数量
  supplier_qty: number;       // 供应商发货总数
  warehouse_qty: number;      // 仓库实点总数
  jst_qty: number;            // 聚水潭入库总数
  diff_qty: number;           // 差异数量
  estimated_amount: number;   // 预估应付金额
  status: "待清点" | "清点中" | "有差异待处理" | "待聚水潭入库" | "入库差异待处理" | "财务待确认" | "可生成账单" | "已生成账单";
  counter_name?: string;      // 仓库清点人
  count_time?: string;        // 清点时间
  items: SkuArrivalItem[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action_type: string;
  target: string;
  before: string;
  after: string;
  reason?: string;
}

// Global Demo Roles
type RoleType = "finance" | "warehouse" | "supplier_annil" | "supplier_balabala";

export default function ArrivalVerificationPage() {
  // Current logged role mock
  const [currentRole, setCurrentRole] = useState<RoleType>("finance");
  
  // Back-end state mock
  const [batches, setBatches] = useState<ArrivalBatch[]>([
    {
      id: "REC-ARR-20260520-01",
      supplier_name: "安奈儿童装",
      arrival_date: "2026-05-20",
      po_no: "PO-20260515-081",
      style_count: 3,
      sku_count: 8,
      supplier_qty: 600,
      warehouse_qty: 588, // -12
      jst_qty: 585, // -3
      diff_qty: -15, // supplier - jst
      estimated_amount: 29250, // 585 * estim average
      status: "有差异待处理",
      counter_name: "张仓库",
      count_time: "2026-05-20 14:32:11",
      items: [
        { id: "S1", style_no: "AN-KIDS-602", sku_code: "AN602-BL-110", product_name: "全棉透气儿童短袖T恤", color_size: "天空蓝 / 110cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 95, jst_qty: 95, cost_price: 45, discrepancy_reason: "供应商少发", handling_result: "按仓库实点数量结算", remark: "原纸箱开箱即少5件" },
        { id: "S2", style_no: "AN-KIDS-602", sku_code: "AN602-BL-120", product_name: "全棉透气儿童短袖T恤", color_size: "天空蓝 / 120cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 100, jst_qty: 100, cost_price: 45, discrepancy_reason: "", handling_result: "", remark: "" },
        { id: "S3", style_no: "AN-KIDS-602", sku_code: "AN602-YL-110", product_name: "全棉透气儿童短袖T恤", color_size: "柠檬黄 / 110cm", po_qty: 80, supplier_qty: 80, warehouse_qty: 80, jst_qty: 80, cost_price: 45, discrepancy_reason: "", handling_result: "", remark: "" },
        { id: "S4", style_no: "AN-KIDS-918", sku_code: "AN918-PK-120", product_name: "女童防蚊哈伦裤", color_size: "樱花粉 / 120cm", po_qty: 120, supplier_qty: 120, warehouse_qty: 115, jst_qty: 115, cost_price: 55, discrepancy_reason: "供应商少发", handling_result: "等供应商补发", remark: "中箱发货数量跟随短少" },
        { id: "S5", style_no: "AN-KIDS-918", sku_code: "AN918-PK-130", product_name: "女童防蚊哈伦裤", color_size: "樱花粉 / 130cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 98, jst_qty: 95, cost_price: 55, discrepancy_reason: "聚水潭入库录错", handling_result: "修改聚水潭入库数量", remark: "入库实抄3件录入漏敲" },
        { id: "S6", style_no: "AN-KIDS-109", sku_code: "AN109-GN-110", product_name: "儿童薄款防晒衣", color_size: "薄荷绿 / 110cm", po_qty: 50, supplier_qty: 50, warehouse_qty: 50, jst_qty: 50, cost_price: 68, discrepancy_reason: "", handling_result: "", remark: "" },
        { id: "S7", style_no: "AN-KIDS-109", sku_code: "AN109-GN-120", product_name: "儿童薄款防晒衣", color_size: "薄荷绿 / 120cm", po_qty: 50, supplier_qty: 50, warehouse_qty: 50, jst_qty: 50, cost_price: 68, discrepancy_reason: "", handling_result: "", remark: "" },
        { id: "S8", style_no: "AN-KIDS-109", sku_code: "AN109-GN-130", product_name: "儿童薄款防晒衣", color_size: "薄荷绿 / 130cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 100, jst_qty: 100, cost_price: 68, discrepancy_reason: "", handling_result: "", remark: "" }
      ]
    },
    {
      id: "REC-ARR-20260522-02",
      supplier_name: "巴拉巴拉童装",
      arrival_date: "2026-05-22",
      po_no: "PO-20260517-109",
      style_count: 2,
      sku_count: 6,
      supplier_qty: 450,
      warehouse_qty: 450,
      jst_qty: 450,
      diff_qty: 0,
      estimated_amount: 21600,
      status: "财务待确认",
      counter_name: "徐仓库",
      count_time: "2026-05-22 11:15:00",
      items: [
        { id: "B1", style_no: "BB-BOY-101", sku_code: "BB101-OW-120", product_name: "男童印花运动短袖", color_size: "椰奶白 / 120cm", po_qty: 80, supplier_qty: 80, warehouse_qty: 80, jst_qty: 80, cost_price: 48, discrepancy_reason: "", handling_result: "", remark: "正常到货" },
        { id: "B2", style_no: "BB-BOY-101", sku_code: "BB101-OW-130", product_name: "男童印花运动短袖", color_size: "椰奶白 / 130cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 100, jst_qty: 100, cost_price: 48, discrepancy_reason: "", handling_result: "", remark: "正常到货" },
        { id: "B3", style_no: "BB-BOY-101", sku_code: "BB101-OW-140", product_name: "男童印花运动短袖", color_size: "椰奶白 / 140cm", po_qty: 70, supplier_qty: 70, warehouse_qty: 70, jst_qty: 70, cost_price: 48, discrepancy_reason: "", handling_result: "", remark: "正常到货" },
        { id: "B4", style_no: "BB-GIRL-504", sku_code: "BB504-PP-110", product_name: "女童碎花连衣裙", color_size: "香芋紫 / 110cm", po_qty: 50, supplier_qty: 50, warehouse_qty: 50, jst_qty: 50, cost_price: 48, discrepancy_reason: "", handling_result: "", remark: "正常到货" },
        { id: "B5", style_no: "BB-GIRL-504", sku_code: "BB504-PP-120", product_name: "女童碎花连衣裙", color_size: "香芋紫 / 120cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 100, jst_qty: 100, cost_price: 48, discrepancy_reason: "", handling_result: "", remark: "正常到货" },
        { id: "B6", style_no: "BB-GIRL-504", sku_code: "BB504-PP-130", product_name: "女童碎花连衣裙", color_size: "香芋紫 / 130cm", po_qty: 50, supplier_qty: 50, warehouse_qty: 50, jst_qty: 50, cost_price: 48, discrepancy_reason: "", handling_result: "", remark: "正常到货" }
      ]
    },
    {
      id: "REC-ARR-20260523-03",
      supplier_name: "森马童装",
      arrival_date: "2026-05-23",
      po_no: "PO-20260518-125",
      style_count: 2,
      sku_count: 4,
      supplier_qty: 300,
      warehouse_qty: 295, // 溢装/欠装
      jst_qty: 295,
      diff_qty: -5,
      estimated_amount: 11800,
      status: "待清点",
      items: [
        { id: "SM1", style_no: "SM-PANTS-77", sku_code: "SM77-BK-M", product_name: "中性直筒防晒长裤", color_size: "黑 / M", po_qty: 80, supplier_qty: 80, warehouse_qty: 0, jst_qty: 0, cost_price: 40 },
        { id: "SM2", style_no: "SM-PANTS-77", sku_code: "SM77-BK-L", product_name: "中性直筒防晒长裤", color_size: "黑 / L", po_qty: 100, supplier_qty: 100, warehouse_qty: 0, jst_qty: 0, cost_price: 40 },
        { id: "SM3", style_no: "SM-PANTS-77", sku_code: "SM77-WH-M", product_name: "中性直筒防晒长裤", color_size: "透亮白 / M", po_qty: 60, supplier_qty: 60, warehouse_qty: 0, jst_qty: 0, cost_price: 40 },
        { id: "SM4", style_no: "SM-PANTS-77", sku_code: "SM77-WH-L", product_name: "中性直筒防晒长裤", color_size: "透亮白 / L", po_qty: 60, supplier_qty: 60, warehouse_qty: 0, jst_qty: 0, cost_price: 40 }
      ]
    },
    {
      id: "REC-ARR-20260524-04",
      supplier_name: "笛莎公主裙",
      arrival_date: "2026-05-24",
      po_no: "PO-20260519-211",
      style_count: 2,
      sku_count: 4,
      supplier_qty: 200,
      warehouse_qty: 200,
      jst_qty: 200,
      diff_qty: 0,
      estimated_amount: 15600,
      status: "可生成账单",
      counter_name: "张仓库",
      count_time: "2026-05-24 16:11:45",
      items: [
        { id: "D1", style_no: "DS-裙-501", sku_code: "DS501-PK-100", product_name: "冰雪奇缘公主摆裙", color_size: "艾莎粉 / 100cm", po_qty: 55, supplier_qty: 55, warehouse_qty: 55, jst_qty: 55, cost_price: 78, discrepancy_reason: "", handling_result: "", remark: "正常入闸" },
        { id: "D2", style_no: "DS-裙-501", sku_code: "DS501-PK-110", product_name: "冰雪奇缘公主摆裙", color_size: "艾莎粉 / 110cm", po_qty: 45, supplier_qty: 45, warehouse_qty: 45, jst_qty: 45, cost_price: 78, discrepancy_reason: "", handling_result: "", remark: "正常入闸" },
        { id: "D3", style_no: "DS-裙-702", sku_code: "DS702-BL-110", product_name: "闪亮亮亮片网纱折半裙", color_size: "闪色蓝 / 110cm", po_qty: 50, supplier_qty: 50, warehouse_qty: 50, jst_qty: 50, cost_price: 78, discrepancy_reason: "", handling_result: "", remark: "正常入闸" },
        { id: "D4", style_no: "DS-裙-702", sku_code: "DS702-BL-120", product_name: "闪亮亮亮片网纱折半裙", color_size: "闪色蓝 / 120cm", po_qty: 50, supplier_qty: 50, warehouse_qty: 50, jst_qty: 50, cost_price: 78, discrepancy_reason: "", handling_result: "", remark: "正常入闸" }
      ]
    },
    {
      id: "REC-ARR-20260525-05",
      supplier_name: "戴维贝拉童装",
      arrival_date: "2026-05-25",
      po_no: "PO-20260520-401",
      style_count: 1,
      sku_count: 4,
      supplier_qty: 400,
      warehouse_qty: 405, // +5多发
      jst_qty: 400, // -5入库少单
      diff_qty: 5,
      estimated_amount: 32400,
      status: "入库差异待处理",
      counter_name: "王仓库",
      count_time: "2026-05-25 09:20:10",
      items: [
        { id: "DB1", style_no: "DV-COAT-90", sku_code: "DV90-BL-90", product_name: "纯棉儿童双口袋外套", color_size: "薄荷蓝 / 90cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 105, jst_qty: 100, cost_price: 80, discrepancy_reason: "供应商多发", handling_result: "退回多发货", remark: "实收多了5件，财务需要安排返退寄回" },
        { id: "DB2", style_no: "DV-COAT-90", sku_code: "DV90-BL-100", product_name: "纯棉儿童双口袋外套", color_size: "薄荷蓝 / 100cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 100, jst_qty: 100, cost_price: 80, discrepancy_reason: "", handling_result: "", remark: "" },
        { id: "DB3", style_no: "DV-COAT-90", sku_code: "DV90-BL-110", product_name: "纯棉儿童双口袋外套", color_size: "薄荷蓝 / 110cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 100, jst_qty: 100, cost_price: 80, discrepancy_reason: "", handling_result: "", remark: "" },
        { id: "DB4", style_no: "DV-COAT-90", sku_code: "DV90-BL-120", product_name: "纯棉儿童双口袋外套", color_size: "薄荷蓝 / 120cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 100, jst_qty: 100, cost_price: 80, discrepancy_reason: "", handling_result: "", remark: "" }
      ]
    }
  ]);

  // Track dynamic changes logs
  const [logs, setLogs] = useState<AuditLog[]>([
    { id: "L1", timestamp: "2026-05-20 14:32:11", operator: "张仓库", action_type: "开始清点", target: "AN602-BL-110", before: "0", after: "95", reason: "清点第1箱，外包装损坏，内部衣服有污渍已拒收且短发" },
    { id: "L2", timestamp: "2026-05-20 14:35:45", operator: "张仓库", action_type: "修改实实数", target: "AN918-PK-130", before: "100", after: "98", reason: "实点发现少装2件" },
    { id: "L3", timestamp: "2026-05-22 11:15:00", operator: "徐仓库", action_type: "锁定到货实收", target: "REC-ARR-20260522-02", before: "清点中", after: "财务待确认", reason: "巴拉巴拉大货零差异入库核查，操作员徐确认直接放行。" }
  ]);

  // Selected batch for detail view (null means list view)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Filter params state
  const [filterSupplier, setFilterSupplier] = useState<string>("全部");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("全部");
  const [filterHasDiff, setFilterHasDiff] = useState<string>("全部"); // 全部, 是, 否
  const [filterPoNo, setFilterPoNo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>(""); // Style Code / SKU Code

  // Dialog state: Finance confirmation Modal
  const [isFinConfirmOpen, setIsFinConfirmOpen] = useState<boolean>(false);
  const [finConfirmBatchId, setFinConfirmBatchId] = useState<string | null>(null);
  const [finSettlementRule, setFinSettlementRule] = useState<string>("warehouse_qty"); // warehouse_qty | jst_qty | manual
  const [allowCreateInvoice, setAllowCreateInvoice] = useState<boolean>(true);
  const [finFinalPriceAdjust, setFinFinalPriceAdjust] = useState<number>(0); // 调整金额
  const [finConfirmNote, setFinConfirmNote] = useState<string>("");

  // New Batch Modal State
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState<boolean>(false);
  const [newBatchSupplier, setNewBatchSupplier] = useState<string>("安奈儿童装");
  const [newBatchPoNo, setNewBatchPoNo] = useState<string>("");
  const [newBatchDate, setNewBatchDate] = useState<string>(new Date().toISOString().substring(0, 10));

  // State toast notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (txt: string) => {
    setToastMsg(txt);
    setTimeout(() => { setToastMsg(null); }, 3000);
  };

  // Get active selected batch detail
  const currentBatch = useMemo(() => {
    return batches.find(b => b.id === selectedBatchId) || null;
  }, [batches, selectedBatchId]);

  // Supplier filtering restriction based on current toggled role:
  // If role is supplier_annil, we only allow "安奈儿童装".
  // If role is supplier_balabala, we only allow "巴拉巴拉童装".
  const visibleBatches = useMemo(() => {
    return batches.filter(b => {
      // 1. Role boundaries (Supplier role separation)
      if (currentRole === "supplier_annil" && b.supplier_name !== "安奈儿童装") return false;
      if (currentRole === "supplier_balabala" && b.supplier_name !== "巴拉巴拉童装") return false;

      // 2. Toolbar filters
      if (filterSupplier !== "全部" && b.supplier_name !== filterSupplier) return false;
      if (filterStatus !== "全部" && b.status !== filterStatus) return false;
      if (filterStartDate && b.arrival_date < filterStartDate) return false;
      if (filterEndDate && b.arrival_date > filterEndDate) return false;
      
      if (filterHasDiff === "是" && b.diff_qty === 0) return false;
      if (filterHasDiff === "否" && b.diff_qty !== 0) return false;

      if (filterPoNo.trim() && !b.po_no.toLowerCase().includes(filterPoNo.trim().toLowerCase())) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        // Check if batch po_no or id matches, or if any inner item SKU or Style no matches
        const matchBatch = b.id.toLowerCase().includes(query) || b.po_no.toLowerCase().includes(query);
        const matchItem = b.items.some(item => 
          item.style_no.toLowerCase().includes(query) || 
          item.sku_code.toLowerCase().includes(query) ||
          item.product_name.toLowerCase().includes(query)
        );
        if (!matchBatch && !matchItem) return false;
      }

      return true;
    });
  }, [batches, currentRole, filterSupplier, filterStatus, filterStartDate, filterEndDate, filterHasDiff, filterPoNo, searchQuery]);

  // Dynamic statistics calculations
  const statsOverview = useMemo(() => {
    const list = batches.filter(b => {
      if (currentRole === "supplier_annil" && b.supplier_name !== "安奈儿童装") return false;
      if (currentRole === "supplier_balabala" && b.supplier_name !== "巴拉巴拉童装") return false;
      return true;
    });

    return {
      totalBatches: list.length,
      hasDiffCount: list.filter(b => b.diff_qty !== 0).length,
      pendingCount: list.filter(b => b.status === "待清点" || b.status === "清点中").length,
      canBillingCount: list.filter(b => b.status === "可生成账单").length,
      totalSupplierQty: list.reduce((sum, b) => sum + b.supplier_qty, 0),
      totalWarehouseQty: list.reduce((sum, b) => sum + b.warehouse_qty, 0),
      totalJstQty: list.reduce((sum, b) => sum + b.jst_qty, 0),
      totalDiffQty: list.reduce((sum, b) => sum + Math.abs(b.diff_qty), 0),
      totalEstimatedPayable: list.reduce((sum, b) => sum + b.estimated_amount, 0)
    };
  }, [batches, currentRole]);

  // Action: Add new custom arrival batch
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchPoNo.trim()) {
      showToast("⚠️ 请录入关联采购单号！");
      return;
    }

    const newId = `REC-ARR-202605${Math.floor(Math.random() * 80) + 10}-${Math.floor(Math.random() * 900) + 100}`;
    
    // Create random mock items for this supplier purchase order so it's ready to test
    const mockItems: SkuArrivalItem[] = [
      { id: "NM1", style_no: "KIDS-PO-01", sku_code: "PO01-RED-110", product_name: "超轻感薄款户外防晒服", color_size: "亮丽红 / 110cm", po_qty: 150, supplier_qty: 150, warehouse_qty: 0, jst_qty: 0, cost_price: 52 },
      { id: "NM2", style_no: "KIDS-PO-01", sku_code: "PO01-RED-120", product_name: "超轻感薄款户外防晒服", color_size: "亮丽红 / 120cm", po_qty: 150, supplier_qty: 150, warehouse_qty: 0, jst_qty: 0, cost_price: 52 },
      { id: "NM3", style_no: "KIDS-PO-12", sku_code: "PO12-BLU-100", product_name: "速干抗菌儿童束脚休闲裤", color_size: "藏青色 / 100cm", po_qty: 100, supplier_qty: 100, warehouse_qty: 0, jst_qty: 0, cost_price: 45 }
    ];

    const newBatch: ArrivalBatch = {
      id: newId,
      supplier_name: newBatchSupplier,
      arrival_date: newBatchDate,
      po_no: newBatchPoNo,
      style_count: 2,
      sku_count: 3,
      supplier_qty: 400,
      warehouse_qty: 0,
      jst_qty: 0,
      diff_qty: 0,
      estimated_amount: 19800,
      status: "待清点",
      items: mockItems
    };

    setBatches(prev => [newBatch, ...prev]);
    
    // Log creation
    const newLog: AuditLog = {
      id: `L-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: currentRole === "finance" ? "陈财务(主理)" : "仓库主管",
      action_type: "新建到货批次",
      target: newId,
      before: "空",
      after: `创建关联采购单 ${newBatchPoNo}，待仓库安排清点`
    };
    setLogs(prev => [newLog, ...prev]);

    setIsCreateBatchOpen(false);
    setNewBatchPoNo("");
    showToast(`🎉 成功接入 ${newBatchSupplier} 到货批次 ${newId}!`);
  };

  // Action: Warehouse edits physical item counted qty
  const handleWarehouseQtyChange = (itemId: string, newQtyVal: string) => {
    // Constraint check: This is editable by Warehouse or Finance. Supplier can't edit.
    if (currentRole.startsWith("supplier")) {
      showToast("🔒 您处于供应商只读账号状态，无权修改仓库清点实数！");
      return;
    }

    const qty = parseInt(newQtyVal);
    if (isNaN(qty) || qty < 0) return;

    if (!selectedBatchId) return;

    setBatches(prev => prev.map(b => {
      if (b.id !== selectedBatchId) return b;
      
      const beforeItem = b.items.find(item => item.id === itemId);
      const updatedItems = b.items.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            warehouse_qty: qty,
            estimated_payable: qty * item.cost_price 
          };
        }
        return item;
      });

      // Recalculate totals
      const totalWarehouseQty = updatedItems.reduce((acc, curr) => acc + curr.warehouse_qty, 0);
      const totalJstQty = updatedItems.reduce((acc, curr) => acc + curr.jst_qty, 0);
      const totalEstimated = updatedItems.reduce((acc, curr) => acc + (curr.warehouse_qty * curr.cost_price), 0);
      const discrepancy = totalJstQty - totalWarehouseQty; // Default diff standard: JST入库 vs 实实点

      // Auto update status to 清点中 if was 待清点
      let newStat = b.status;
      if (b.status === "待清点") {
        newStat = "清点中";
      } else if (discrepancy !== 0 && (b.status === "清点中" || b.status === "财务待确认")) {
        newStat = "有差异待处理";
      }

      // Log change
      if (beforeItem && beforeItem.warehouse_qty !== qty) {
        const logEntry: AuditLog = {
          id: `L-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          operator: currentRole === "finance" ? "财务管理员" : "清点工张某",
          action_type: "修改实点数量",
          target: beforeItem.sku_code,
          before: beforeItem.warehouse_qty.toString(),
          after: qty.toString(),
          reason: "大货逐件过磅核准实点数"
        };
        setTimeout(() => setLogs(l => [logEntry, ...l]), 10);
      }

      return {
        ...b,
        status: newStat,
        warehouse_qty: totalWarehouseQty,
        estimated_amount: totalEstimated,
        diff_qty: discrepancy,
        items: updatedItems,
        counter_name: b.counter_name || (currentRole === "finance" ? "陈财务" : "清点工张"),
        count_time: b.count_time || new Date().toISOString().replace("T", " ").substring(0, 19)
      };
    }));
  };

  // Action: Warehouse edits SKU remarks
  const handleItemRemarkChange = (itemId: string, val: string) => {
    if (currentRole.startsWith("supplier")) {
      showToast("🔒 只读角色，不可编辑备注！");
      return;
    }

    setBatches(prev => prev.map(b => {
      if (b.id !== selectedBatchId) return b;
      const updatedItems = b.items.map(item => {
        if (item.id === itemId) {
          return { ...item, remark: val };
        }
        return item;
      });
      return { ...b, items: updatedItems };
    }));
  };

  // Action: Update discrepancy reason
  const handleDiscrepancyReasonChange = (itemId: string, val: string) => {
    if (currentRole !== "finance") {
      showToast("🔒 仅财务或异常处理主管角色允许决策差异核定原因！");
      return;
    }

    setBatches(prev => prev.map(b => {
      if (b.id !== selectedBatchId) return b;
      
      const beforeItem = b.items.find(item => item.id === itemId);
      const updatedItems = b.items.map(item => {
        if (item.id === itemId) {
          return { ...item, discrepancy_reason: val };
        }
        return item;
      });

      if (beforeItem && beforeItem.discrepancy_reason !== val) {
        const logEntry: AuditLog = {
          id: `L-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          operator: "陈财务",
          action_type: "决策差异归因",
          target: beforeItem.sku_code,
          before: beforeItem.discrepancy_reason || "未设定",
          after: val || "清退无异议",
          reason: "确认二方对账无误后的差异追诉归类"
        };
        setTimeout(() => setLogs(l => [logEntry, ...l]), 10);
      }

      return { ...b, items: updatedItems };
    }));
  };

  // Action: Update item handling result
  const handleHandlingResultChange = (itemId: string, val: string) => {
    if (currentRole !== "finance") {
      showToast("🔒 仅财务角色允许确定核查差异处理结果！");
      return;
    }

    setBatches(prev => prev.map(b => {
      if (b.id !== selectedBatchId) return b;
      
      const beforeItem = b.items.find(item => item.id === itemId);
      const updatedItems = b.items.map(item => {
        if (item.id === itemId) {
          return { ...item, handling_result: val };
        }
        return item;
      });

      if (beforeItem && beforeItem.handling_result !== val) {
        const logEntry: AuditLog = {
          id: `L-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          operator: "陈财务",
          action_type: "锁定裁定结果",
          target: beforeItem.sku_code,
          before: beforeItem.handling_result || "未设定",
          after: val || "清退无异议"
        };
        setTimeout(() => setLogs(l => [logEntry, ...l]), 10);
      }

      return { ...b, items: updatedItems };
    }));
  };

  // Action: Fast update whole batch status flow
  const handleBatchStatusTransition = (statusTarget: ArrivalBatch["status"]) => {
    if (currentRole.startsWith("supplier")) {
      showToast("🔒 供应商权限只能查看，不可调升批次生命周期状态！");
      return;
    }

    if (!selectedBatchId || !currentBatch) return;

    // Log the event
    const logEntry: AuditLog = {
      id: `L-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: currentRole === "finance" ? "财务终审 陈财务" : "仓库主管 徐仓库",
      action_type: "改变批次生命周期",
      target: selectedBatchId,
      before: currentBatch.status,
      after: statusTarget,
      reason: "流程生命周期流转规约操作"
    };

    setBatches(prev => prev.map(b => {
      if (b.id !== selectedBatchId) return b;
      
      // If going to 财务待确认 and we have no counter name, lock current user
      const isFin = currentRole === "finance";
      return { 
        ...b, 
        status: statusTarget,
        counter_name: b.counter_name || (isFin ? "陈财务" : "清点工张"),
        count_time: b.count_time || new Date().toISOString().replace("T", " ").substring(0, 19)
      };
    }));

    setLogs(l => [logEntry, ...l]);
    showToast(`🟢 批次流程状态已更新为 [${statusTarget}]！`);
  };

  // Open financial final confirmation Modal
  const openFinanceConfirmDialog = (id: string) => {
    if (currentRole !== "finance") {
      showToast("🔒 此动作必须由 [财务主管/主管] 身份操作，由于具有资金最终核销决策权。");
      return;
    }
    setFinConfirmBatchId(id);
    setFinSettlementRule("warehouse_qty");
    setAllowCreateInvoice(true);
    setFinFinalPriceAdjust(0);
    setFinConfirmNote("");
    setIsFinConfirmOpen(true);
  };

  // Submit Financial approval and move status to "可生成账单"
  const handleFinanceConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finConfirmBatchId) return;

    const targetBatchObj = batches.find(b => b.id === finConfirmBatchId);
    if (!targetBatchObj) return;

    const adjustedAmount = targetBatchObj.estimated_amount + (finFinalPriceAdjust * 100);

    setBatches(prev => prev.map(b => {
      if (b.id !== finConfirmBatchId) return b;
      return {
        ...b,
        status: allowCreateInvoice ? "可生成账单" : "财务待确认",
        estimated_amount: adjustedAmount,
        remark: "财务已锁定并复归结算：规格清点已打通"
      };
    }));

    // Log the approval
    const logEntry: AuditLog = {
      id: `L-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: "陈财务 (主管审核)",
      action_type: "财务终审裁对",
      target: finConfirmBatchId,
      before: targetBatchObj.status,
      after: allowCreateInvoice ? "可生成账单" : "财务待确认",
      reason: `财务通过核定，公式规约:${finSettlementRule === "warehouse_qty" ? "按清点实数" : "按聚水潭入账"}。调整差额:${finFinalPriceAdjust}元。说明:${finConfirmNote || "无特殊财务调整项"}`
    };

    setLogs(l => [logEntry, ...l]);
    setIsFinConfirmOpen(false);
    showToast("🎉 到货核对已最终敲定！该批次可以顺利并入生成供应商后续账单。");
  };

  // Trigger generator flow simulating generating supplier bills
  const handleGenerateInvoice = (batchId: string) => {
    const targetObj = batches.find(b => b.id === batchId);
    if (!targetObj) return;

    // Transition state from 可生成账单 -> 已生成账单
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      return { ...b, status: "已生成账单" };
    }));

    // Log creation
    const logEntry: AuditLog = {
      id: `L-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: "陈财务",
      action_type: "生成应结发票",
      target: batchId,
      before: "可生成账单",
      after: "已生成账单",
      reason: `引用至供应商对账月结模块(PO编号:${targetObj.po_no})。应结算货款净额￥${(targetObj.estimated_amount / 100).toFixed(2)}。`
    };

    setLogs(l => [logEntry, ...l]);
    showToast("💸 成功生成最终供应商应付账单！采购实绩及入库货款已正式过闸归档。");
  };

  // Quick helper to see role badge
  const renderRoleBadge = () => {
    switch(currentRole) {
      case "finance":
        return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-black text-xs flex items-center gap-1">🛡️ 财务主管 (完整金额+审核权限)</span>;
      case "warehouse":
        return <span className="px-3 py-1 bg-[#eef6ff] text-[#006591] border border-blue-200 rounded-full font-black text-xs flex items-center gap-1">🏭 仓库清点组 (隐藏价格·只修实点实数)</span>;
      case "supplier_annil":
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-black text-xs flex items-center gap-1">📦 安奈儿童装 (供应商自查·只读权限)</span>;
      case "supplier_balabala":
        return <span className="px-3 py-1 bg-violet-50 text-violet-800 border border-violet-200 rounded-full font-black text-xs flex items-center gap-1">📦 巴拉巴拉 (供应商自查·只读权限)</span>;
    }
  };

  return (
    <div className="space-y-6 select-text text-slate-800 font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white font-bold text-xs py-2.5 px-6 rounded-full shadow-2xl z-[200] flex items-center space-x-2 select-none"
          >
            <span className="text-sky-400">●</span>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BLOCK 1: Top Dashboard Header with Simulation Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-3xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#002045] text-white rounded-xl shadow-xs shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">到货核对中心</h1>
                <span className="px-2 py-0.5 bg-sky-50 text-[#006591] border border-sky-100 rounded text-[10px] font-black">2026跑批引擎二代</span>
              </div>
              <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                彻底消除“供应商清单”、“仓库手工实点”、“聚水潭ERP入库”、“财务实付账金”多头不一致的问题。
              </p>
            </div>
          </div>

          {/* SENSOR ROLE SIMULATION SWITCHER BANNER */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center gap-3">
            <div className="text-left md:text-right shrink-0">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">⚙️ 模拟身份快速切换面板</span>
              <span className="text-[10px] text-slate-450 font-semibold block mt-1">切换查看不同角色在核对中心的字段/安全遮罩：</span>
            </div>
            
            <div className="grid grid-cols-2 xs:flex xs:flex-wrap gap-1.5 font-bold text-[10.5px]">
              <button
                onClick={() => { setCurrentRole("finance"); showToast("🛡️ 切换为：财务主管 (可见单价，可进行确认可结账操作)"); }}
                className={`px-3 py-1.8 rounded-xl transition-all cursor-pointer ${currentRole === "finance" ? "bg-amber-600 text-white shadow-xs font-black" : "bg-white hover:bg-slate-100 border border-slate-250 text-slate-700"}`}
              >
                💼 财务主管
              </button>
              <button
                onClick={() => { setCurrentRole("warehouse"); showToast("🏭 切换为：仓库清点组 (不允许查看成本单价，仅可清点及备注)"); }}
                className={`px-3 py-1.8 rounded-xl transition-all cursor-pointer ${currentRole === "warehouse" ? "bg-blue-600 text-white shadow-xs font-black" : "bg-white hover:bg-slate-100 border border-slate-250 text-slate-700"}`}
              >
                🏭 仓库实点员
              </button>
              <button
                onClick={() => { setCurrentRole("supplier_annil"); showToast("📦 切换为：安奈儿童装 (仅可见安奈儿到货，不允许修改数量)"); }}
                className={`px-3 py-1.8 rounded-xl transition-all cursor-pointer ${currentRole === "supplier_annil" ? "bg-emerald-600 text-white shadow-xs font-black" : "bg-white hover:bg-slate-100 border border-slate-250 text-slate-700"}`}
              >
                安奈儿厂方
              </button>
              <button
                onClick={() => { setCurrentRole("supplier_balabala"); showToast("📦 切换为：巴拉巴拉童装 (仅可见巴拉巴拉到货，只读限权)"); }}
                className={`px-3 py-1.8 rounded-xl transition-all cursor-pointer ${currentRole === "supplier_balabala" ? "bg-violet-600 text-white shadow-xs font-black" : "bg-white hover:bg-slate-100 border border-slate-250 text-slate-700"}`}
              >
                巴拉巴拉厂方
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* BLOCK 2: Quick Metrics cards highlighting the scope */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 select-none">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase leading-none block">核算到货总批数</span>
            <span className="text-xl font-black text-slate-900 tracking-tight block">{statsOverview.totalBatches} 批</span>
            <span className="text-[9px] text-slate-400 font-semibold block">关联全部厂家</span>
          </div>
          <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-rose-100 bg-rose-50/15 rounded-2xl p-4 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-rose-500 uppercase leading-none block">检出数量差异批次</span>
            <span className="text-xl font-black text-rose-600 tracking-tight block">{statsOverview.hasDiffCount} 批</span>
            <span className="text-[9px] text-rose-400 font-bold block">触发多头核对偏位</span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl relative">
            <BadgeAlert className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-blue-100 bg-blue-50/10 rounded-2xl p-4 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-blue-500 uppercase leading-none block">未锁定清点中</span>
            <span className="text-xl font-black text-blue-600 tracking-tight block">{statsOverview.pendingCount} 批</span>
            <span className="text-[9px] text-blue-400 font-bold block">仓库清算排程中</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-emerald-100 bg-emerald-50/10 rounded-2xl p-4 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-emerald-600 uppercase leading-none block">可生成财务账单</span>
            <span className="text-xl font-black text-emerald-600 tracking-tight block">{statsOverview.canBillingCount} 批</span>
            <span className="text-[9px] text-emerald-500 font-bold block">已安全比对并放闸</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Amount stat, masked if warehouse */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex items-center justify-between col-span-2 md:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-450 uppercase leading-none block">预估待结货款额</span>
            {currentRole === "warehouse" ? (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 py-1 px-2 rounded tracking-tight block">*** (权限锁定)</span>
            ) : (
              <span className="text-lg font-black text-emerald-700 tracking-tight block">¥{statsOverview.totalEstimatedPayable.toLocaleString()}</span>
            )}
            <span className="text-[9px] text-slate-400 font-semibold block">仅财务主管专享</span>
          </div>
          <div className="p-2.5 bg-slate-50 text-emerald-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* DYNAMIC VIEW ROUTER: IF SelectedBatchId is NULL -> SHOW BATCH LIST, ELSE SHOW BATCH DETAIL PAGE */}
      {!selectedBatchId ? (
        <div className="space-y-6">

          {/* FILTER ROW */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>精准搜索筛滤面板</span>
              </span>
              <button 
                onClick={() => {
                  setFilterSupplier("全部");
                  setFilterStartDate("");
                  setFilterEndDate("");
                  setFilterStatus("全部");
                  setFilterHasDiff("全部");
                  setFilterPoNo("");
                  setSearchQuery("");
                  showToast("🧹 已重置所有过滤筛选条件");
                }}
                className="text-[10.5px] text-[#006591] hover:underline hover:text-sky-800 font-extrabold cursor-pointer"
              >
                重置清空条件
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5 text-xs text-slate-650">
              
              {/* Filter supplier */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1.5">合作供应商</label>
                <select
                  disabled={currentRole.startsWith("supplier")}
                  value={filterSupplier}
                  onChange={e => setFilterSupplier(e.target.value)}
                  className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-350 text-slate-700 font-bold"
                >
                  <option value="全部">全部供应商</option>
                  <option value="安奈儿童装">安奈儿童装</option>
                  <option value="巴拉巴拉童装">巴拉巴拉童装</option>
                  <option value="森马童装">森马童装</option>
                  <option value="笛莎公主裙">笛莎公主裙</option>
                  <option value="戴维贝拉童装">戴维贝拉童装</option>
                </select>
              </div>

              {/* Arrival Start Date */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1.5">到货起期</label>
                <input 
                  type="date"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 border border-slate-200 rounded-xl py-1.8 px-3 focus:outline-none focus:border-slate-350 text-slate-700 font-bold"
                />
              </div>

              {/* Arrival End Date */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1.5">到货止期</label>
                <input 
                  type="date"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 border border-slate-200 rounded-xl py-1.8 px-3 focus:outline-none focus:border-slate-350 text-slate-700 font-bold"
                />
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1.5">核对状态类型</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-350 text-slate-700 font-bold"
                >
                  <option value="全部">全部状态</option>
                  <option value="待清点">待清点</option>
                  <option value="清点中">清点中</option>
                  <option value="有差异待处理">有差异待处理</option>
                  <option value="待聚水潭入库">待聚水潭入库</option>
                  <option value="入库差异待处理">入库差异待处理</option>
                  <option value="财务待确认">财务待确认</option>
                  <option value="可生成账单">可生成账单</option>
                  <option value="已生成账单">已生成账单</option>
                </select>
              </div>

              {/* Has Discrepancy */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1.5">是否存在差异项</label>
                <select
                  value={filterHasDiff}
                  onChange={e => setFilterHasDiff(e.target.value)}
                  className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-350 text-slate-700 font-bold"
                >
                  <option value="全部">全部记录</option>
                  <option value="是">有数量差异</option>
                  <option value="否">完全一致(零差异)</option>
                </select>
              </div>

              {/* PO Input */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1.5">检索关联采购单号</label>
                <input 
                  type="text"
                  placeholder="PO-2026..."
                  value={filterPoNo}
                  onChange={e => setFilterPoNo(e.target.value)}
                  className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 border border-slate-200 rounded-xl py-1.8 px-3 focus:outline-none focus:border-slate-350 text-slate-755 font-bold"
                />
              </div>

            </div>

            {/* General SKU Text Query */}
            <div className="relative pt-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                placeholder="键入款号、商品名称、SKU 条码一键搜索对应到货批次..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f9fc] text-xs font-bold border border-slate-200 rounded-xl py-2.2 pl-9 pr-4 focus:outline-none focus:border-slate-350 text-slate-800"
              />
            </div>
          </div>

          {/* ACCORDION TABLE / GRID SUMMARY OF THE BATCHES */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden">
            
            <div className="p-4.5 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-black">
                  到货对碰流水目录 📂 ({visibleBatches.length} 组匹配结果)
                </span>
                {renderRoleBadge()}
              </div>
              
              {!currentRole.startsWith("supplier") && (
                <button 
                  onClick={() => setIsCreateBatchOpen(true)}
                  className="px-3.5 py-1.8 bg-[#002045] hover:bg-[#002e62] text-white rounded-xl shadow-3xs transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新建到货批次页表</span>
                </button>
              )}
            </div>

            {/* The Batches Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#f8f9fd] text-slate-400 tracking-wider text-[9.5px] uppercase border-b border-slate-200 select-none font-black">
                  <tr>
                    <th className="p-3.5 pl-6 text-center w-10">序号</th>
                    <th className="p-3.5">到货批次号</th>
                    <th className="p-3.5">供货方</th>
                    <th className="p-3.5">到货日期</th>
                    <th className="p-3.5">关联采购PO号</th>
                    <th className="p-3.5 text-center">款号数/SKU数</th>
                    <th className="p-3.5 text-right bg-slate-50/20">发货清单总数</th>
                    <th className="p-3.5 text-right text-[#006591] bg-blue-50/5">仓库清点实数</th>
                    <th className="p-3.5 text-right font-semibold text-teal-800">聚水潭系统入库数</th>
                    <th className="p-3.5 text-right">数量差异</th>
                    <th className="p-3.5 text-right">预估应付金额</th>
                    <th className="p-3.5 text-center">当前流转状态</th>
                    <th className="p-3.5 text-center pr-6">控制操作台</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {visibleBatches.map((b, idx) => {
                    
                    const isDiff = b.diff_qty !== 0;
                    
                    // Style matching status string
                    let statusColor = "bg-slate-100 text-slate-500 border-slate-200";
                    if (b.status === "待清点") statusColor = "bg-slate-50 text-slate-500 border-slate-200";
                    else if (b.status === "清点中") statusColor = "bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-300/10";
                    else if (b.status === "有差异待处理") statusColor = "bg-rose-50 text-rose-600 border-rose-200 ring-1 ring-rose-300/10";
                    else if (b.status === "待聚水潭入库") statusColor = "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-300/10";
                    else if (b.status === "入库差异待处理") statusColor = "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/10";
                    else if (b.status === "财务待确认") statusColor = "bg-pink-50 text-pink-700 border-pink-200 ring-1 ring-pink-300/10";
                    else if (b.status === "可生成账单") statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200 ring-1 ring-emerald-300/10";
                    else if (b.status === "已生成账单") statusColor = "bg-slate-900 text-white border-slate-800";

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 pl-6 text-center text-slate-400 font-mono font-bold select-none">{idx + 1}</td>
                        <td className="p-3.5 font-bold font-mono text-slate-900 select-all">{b.id}</td>
                        <td className="p-3.5 font-bold text-slate-950">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#002045]" />
                            {b.supplier_name}
                          </span>
                        </td>
                        <td className="p-3.5 pr-2 font-mono text-slate-500 text-[11px]">{b.arrival_date}</td>
                        <td className="p-3.5 font-mono text-slate-650 text-xs">{b.po_no}</td>
                        <td className="p-3.5 text-center text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">{b.style_count}</span> 款 / <span className="font-bold text-slate-700">{b.sku_count}</span> SKU
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-800 bg-slate-50/20">{b.supplier_qty.toLocaleString()} 件</td>
                        <td className="p-3.5 text-right font-mono text-[#006591] bg-blue-50/5">
                          {b.status === "待清点" ? (
                            <span className="text-slate-400 italic">待填写</span>
                          ) : (
                            <span>{b.warehouse_qty.toLocaleString()} 件</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-mono text-teal-800">
                          {b.status === "待清点" || b.status === "清点中" ? (
                            <span className="text-slate-405 italic">未同步</span>
                          ) : (
                            <span>{b.jst_qty.toLocaleString()} 件</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {isDiff ? (
                            <span className="px-1.8 py-0.5 font-mono font-black text-rose-600 bg-rose-50 border border-rose-100 rounded text-[10.5px]">
                              {b.diff_qty > 0 ? `+${b.diff_qty}` : b.diff_qty} 件
                            </span>
                          ) : (
                            <span className="text-slate-400">一致</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-mono text-emerald-800 font-extrabold bg-emerald-55/5">
                          {currentRole === "warehouse" ? (
                            <span className="text-slate-420 font-bold italic text-[9px]">***</span>
                          ) : (
                            <span>¥{(b.estimated_amount / 100).toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center select-none">
                          <span className={`px-2.5 py-0.8 rounded-full border text-[9.5px] font-black tracking-normal inline-block ${statusColor}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center pr-6 space-x-3.5 whitespace-nowrap select-none font-bold">
                          <button 
                            onClick={() => {
                              setSelectedBatchId(b.id);
                              showToast(`🔍 已载入批次 ${b.id} SKU到货核对清单`);
                            }}
                            className="text-[#006591] hover:text-[#004c6e] hover:underline cursor-pointer flex-inline items-center gap-0.5"
                          >
                            <span>核查清细</span>
                          </button>

                          {/* Quick contexts actions depending on state and current mock role */}
                          {currentRole === "finance" && b.status === "财务待确认" && (
                            <button 
                              onClick={() => openFinanceConfirmDialog(b.id)}
                              className="text-amber-600 hover:text-amber-800 hover:underline cursor-pointer font-black"
                            >
                              财务终确认
                            </button>
                          )}

                          {currentRole === "finance" && b.status === "可生成账单" && (
                            <button 
                              onClick={() => handleGenerateInvoice(b.id)}
                              className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer font-black"
                            >
                              生成账单
                            </button>
                          )}

                          {currentRole === "warehouse" && (b.status === "待清点" || b.status === "清点中") && (
                            <button 
                              onClick={() => setSelectedBatchId(b.id)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-black"
                            >
                              开始数清
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {visibleBatches.length === 0 && (
                    <tr>
                      <td colSpan={13} className="p-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                          <AlertCircle className="w-8 h-8 text-slate-300" />
                          <p className="text-xs font-bold text-slate-600">没有检索到符合过滤器的到货批次表</p>
                          <p className="text-[10px] text-slate-400">请撤除时间范围限制，或者点击顶部切换身份模式恢复全览权限。</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Static standard pagination footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-450">
              <p>显示 1 到 {visibleBatches.length} 批（共计 {visibleBatches.length} 批次到货清算单）</p>
              <div className="flex items-center space-x-1.5 font-bold text-xs">
                <button disabled className="px-2.5 py-1.2 border border-slate-200 bg-white rounded-lg opacity-50 cursor-not-allowed">
                  上页
                </button>
                <button className="w-7 h-7 bg-[#002045] text-white border border-[#002045] rounded-lg">
                  1
                </button>
                <button disabled className="px-2.5 py-1.2 border border-slate-200 bg-white rounded-lg opacity-50 cursor-not-allowed">
                  下页
                </button>
              </div>
            </div>

          </div>

          {/* HISTORICAL WORKFLOW INTEGRATION MANUAL PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 select-none">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>核准流程约束说明（财务 & 仓库联锁）</span>
              </h4>
              <div className="text-[11.5px] text-slate-600 space-y-2.2 leading-relaxed">
                <p>
                  1. **仓库数清起航**：货车到场卸柜，仓库人员切换 <span className="font-bold underline text-blue-600">仓库实点员</span> 视角，在清单列输入实物清点数量。不允许清见单价。
                </p>
                <p>
                  2. **聚水潭自动对碰**：聚水潭一键完成入账。系统对比（到货实数 - 入库登记数），若存在偏差，批次状态置为 <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">有差异待处理</span>。
                </p>
                <p>
                  3. **财务终局裁决**：财务人员查看成本算账，核查偏位，对单项录入“差异原因”与“认定结果”。锁定结算金额后，升迁为 <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">可生成账单</span>。
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 select-none">
                <History className="w-4 h-4 text-slate-500" />
                <span>全线批次核查日志（数据审计）</span>
              </h4>
              
              {/* Dynamic scrollable operational logs for full enterprise feel */}
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 select-text">
                {logs.map(lg => (
                  <div key={lg.id} className="text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                    <div className="flex items-center justify-between text-[9px] text-[#006591] font-black pb-1">
                      <span>👤 {lg.operator}</span>
                      <span className="text-slate-400 font-mono font-medium">{lg.timestamp}</span>
                    </div>
                    <p className="text-slate-700">
                      动作：<strong className="text-slate-900">[{lg.action_type}]</strong> 目标 {lg.target}
                    </p>
                    <div className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                      <span>改前: <del className="text-rose-500">{lg.before}</del></span>
                      <ArrowLeftRight className="w-2.5 h-2.5 text-slate-400" />
                      <span>改后: <ins className="text-emerald-600 no-underline font-bold">{lg.after}</ins></span>
                    </div>
                    {lg.reason && (
                      <p className="text-[9.5px] text-amber-700 bg-amber-50/50 p-1 rounded mt-1.2 font-semibold">
                        💡 备注说明：{lg.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* BLOCK 3: PAGE 2 - BATCH DETAILS PAGE */
        <div className="space-y-6">
          
          {/* Back button and status card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <button 
                onClick={() => setSelectedBatchId(null)}
                className="hover:bg-slate-50 border border-slate-200 text-slate-650 bg-white py-1.8 px-3.5 rounded-xl cursor-pointer text-xs font-black transition-all flex items-center gap-1 max-w-fit"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>返回到货批次列表</span>
              </button>

              <div className="flex items-center flex-wrap gap-2 text-xs font-extrabold select-none">
                {currentRole === "finance" && currentBatch.status === "有差异待处理" && (
                  <button 
                    onClick={() => handleBatchStatusTransition("财务待确认")}
                    className="px-3.5 py-1.8 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-3xs cursor-pointer transition-colors"
                  >
                    🚀 送交财务核定
                  </button>
                )}

                {currentRole === "finance" && currentBatch.status === "财务待确认" && (
                  <button 
                    onClick={() => openFinanceConfirmDialog(currentBatch.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-3xs cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>通过终审并可入账</span>
                  </button>
                )}

                {currentRole === "warehouse" && (currentBatch.status === "待清点" || currentBatch.status === "清点中") && (
                  <button 
                    onClick={() => handleBatchStatusTransition("财务待确认")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-3xs cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>结束清点送交财务</span>
                  </button>
                )}

                {/* Simulated JST sync trigger */}
                {currentRole === "finance" && currentBatch.status === "清点中" && (
                  <button
                    onClick={() => {
                      // Set JST qty to slightly offset
                      setBatches(prev => prev.map(b => {
                        if (b.id !== currentBatch.id) return b;
                        const uItems = b.items.map(item => ({
                          ...item,
                          // Warehouse is edited or filled, let's copy to JST except 1
                          jst_qty: item.warehouse_qty || item.supplier_qty
                        }));
                        const totalWarehouse = uItems.reduce((s, i) => s + i.warehouse_qty, 0);
                        const totalJst = uItems.reduce((s, i) => s + i.jst_qty, 0);
                        return {
                          ...b,
                          status: "有差异待处理",
                          jst_qty: totalJst,
                          diff_qty: totalJst - totalWarehouse,
                          items: uItems
                        };
                      }));
                      showToast("🔄 聚水潭采购入库数同步成功！部分录单发现偏离已置为有差异。");
                    }}
                    className="px-4.5 py-2 border border-slate-250 hover:bg-slate-50 bg-white rounded-xl text-slate-700 shadow-3xs cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <span>对接聚水潭同步入库记录</span>
                  </button>
                )}

                <span className="text-[11.5px] text-slate-400 font-semibold px-2">当前操作模式：{renderRoleBadge()}</span>
              </div>
            </div>

            {/* Banner of details */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5 text-xs text-slate-600">
              
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">到货批次号</span>
                <span className="font-extrabold font-mono text-slate-900 text-sm">{currentBatch.id}</span>
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">供应商</span>
                <span className="font-black text-[#002045] text-sm">{currentBatch.supplier_name}</span>
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">到货日期</span>
                <span className="font-bold text-slate-700">{currentBatch.arrival_date}</span>
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">关联采购单号</span>
                <span className="font-bold text-slate-700 font-mono">{currentBatch.po_no}</span>
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">清点归入状态</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 border border-rose-200 text-rose-600">{currentBatch.status}</span>
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">到货与入库差异数</span>
                {currentBatch.diff_qty !== 0 ? (
                  <span className="font-black text-rose-605 bg-rose-50 border border-rose-100 rounded px-1.8 py-0.2 text-[10.5px]">
                    累计 {currentBatch.diff_qty} 件
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold">完全契合一致</span>
                )}
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">核定最终结算额</span>
                {currentRole === "warehouse" ? (
                  <span className="font-mono text-slate-400 italic">*** (权限锁定)</span>
                ) : (
                  <span className="font-black text-emerald-700 text-sm">¥{(currentBatch.estimated_amount / 100).toLocaleString()}</span>
                )}
              </div>

            </div>

          </div>

          {/* Core Table: SKU and item level detailed breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden">
            
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs select-none">
              <p className="font-black text-slate-800">
                🧮 款号及商品 SKU 属性清点过碰中心
              </p>
              <div className="text-[10px] text-slate-450 font-semibold max-w-md text-right">
                {currentRole === "warehouse" ? (
                  <span className="text-amber-600 bg-amber-50 p-1 rounded">⚠️ 只读提醒：您作为仓库人员，单价/应付金额等隐私项已被平台安全隐盖。</span>
                ) : (
                  <span className="text-slate-450">标准公式：应付 = 仓库清点数 * 成本价 (后续对碰聚水潭核拨)</span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#f8f9fd] text-slate-400 text-[9.5px] uppercase tracking-wider font-extrabold border-b border-slate-200 select-none">
                  <tr>
                    <th className="p-3 pl-5 text-center w-8">#</th>
                    <th className="p-3">款号</th>
                    <th className="p-3">SKU 编码 / 商品编码</th>
                    <th className="p-3">商品名称</th>
                    <th className="p-3">颜色尺码</th>
                    <th className="p-3 text-right bg-slate-50/10">1.采购单数量</th>
                    <th className="p-3 text-right bg-slate-50/20">2.发货清单数量</th>
                    <th className="p-3 text-right text-[#006591] bg-blue-50/5">3.仓库实点数量</th>
                    <th className="p-3 text-right text-teal-800 bg-teal-55/5">4.聚水潭入库数</th>
                    <th className="p-3 text-right text-rose-500">账面总差异</th>
                    
                    {/* Finance visible columns */}
                    {currentRole !== "warehouse" && (
                      <>
                        <th className="p-3 text-right text-amber-700 bg-amber-50/5">成本单价</th>
                        <th className="p-3 text-right text-emerald-800 bg-emerald-50/5">应付金额</th>
                      </>
                    )}

                    <th className="p-3">5.差异追溯归类</th>
                    <th className="p-3">6.核定处理结果</th>
                    <th className="p-3 pr-5">清点备注 / 追溯详情</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentBatch.items.map((item, index) => {
                    
                    const lineDiff = item.jst_qty - item.warehouse_qty;
                    const isLineDiff = lineDiff !== 0 || (item.supplier_qty !== item.warehouse_qty);
                    
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isLineDiff ? "bg-rose-50/10" : ""}`}>
                        <td className="p-3 pl-5 text-center text-slate-400 font-mono select-none">{index + 1}</td>
                        <td className="p-3 font-semibold text-slate-900 font-mono">{item.style_no}</td>
                        <td className="p-3 font-mono text-slate-700 select-all">{item.sku_code}</td>
                        <td className="p-3 text-slate-900 font-bold text-[11px] max-w-[140px] truncate" title={item.product_name}>
                          {item.product_name}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">{item.color_size}</td>
                        
                        {/* 1. PO qty */}
                        <td className="p-3 text-right font-mono text-slate-500 bg-slate-50/10">{item.po_qty} 件</td>
                        
                        {/* 2. Supplier qty */}
                        <td className="p-3 text-right font-mono text-slate-700 bg-slate-50/20">{item.supplier_qty} 件</td>
                        
                        {/* 3. Warehouse qty (Interactive field!) */}
                        <td className="p-3 text-right bg-blue-50/10">
                          {currentRole === "warehouse" || currentRole === "finance" ? (
                            <input 
                              type="number"
                              min="0"
                              value={item.warehouse_qty}
                              onChange={e => handleWarehouseQtyChange(item.id, e.target.value)}
                              className="w-16 bg-white hover:bg-slate-55 border border-slate-200 text-slate-900 rounded py-1 px-1.5 text-center text-xs font-bold leading-normal focus:outline-none focus:border-blue-500 font-mono shadow-3xs"
                            />
                          ) : (
                            <span className="font-mono text-slate-800">{item.warehouse_qty} 件</span>
                          )}
                        </td>

                        {/* 4. JST Qty */}
                        <td className="p-3 text-right font-mono text-teal-800 bg-teal-55/10">{item.jst_qty} 件</td>

                        {/* Line Diff */}
                        <td className="p-3 text-right">
                          {isLineDiff ? (
                            <div className="text-[10px] font-mono space-y-0.5">
                              {item.supplier_qty !== item.warehouse_qty && (
                                <span className="block text-red-600 font-black">
                                  厂/实: {item.warehouse_qty - item.supplier_qty > 0 ? `+${item.warehouse_qty - item.supplier_qty}` : item.warehouse_qty - item.supplier_qty}件
                                </span>
                              )}
                              {item.warehouse_qty !== item.jst_qty && (
                                <span className="block text-amber-600 font-medium">
                                  实/入: {item.jst_qty - item.warehouse_qty > 0 ? `+${item.jst_qty - item.warehouse_qty}` : item.jst_qty - item.warehouse_qty}件
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-emerald-600 text-[10px] font-bold">完全一致</span>
                          )}
                        </td>

                        {/* Unit price (Finance visible) */}
                        {currentRole !== "warehouse" && (
                          <td className="p-3 text-right font-mono text-slate-800 bg-amber-50/10">
                            ¥{item.cost_price.toFixed(2)}
                          </td>
                        )}

                        {/* Payable amount (Finance visible) */}
                        {currentRole !== "warehouse" && (
                          <td className="p-3 text-right font-mono text-emerald-800 font-extrabold bg-emerald-50/10">
                            ¥{(item.warehouse_qty * item.cost_price).toLocaleString()}
                          </td>
                        )}

                        {/* 5. Discrepancy Reason Dropdown */}
                        <td className="p-3">
                          {currentRole === "finance" && isLineDiff ? (
                            <select
                              value={item.discrepancy_reason || ""}
                              onChange={e => handleDiscrepancyReasonChange(item.id, e.target.value)}
                              className="bg-[#f8f9fc] hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded p-1"
                            >
                              <option value="">-- 选择原因 --</option>
                              <option value="供应商少发">供应商少发</option>
                              <option value="供应商多发">供应商多发</option>
                              <option value="供应商清单写错">供应商清单写错</option>
                              <option value="仓库清点错误">仓库清点错误</option>
                              <option value="聚水潭入库录错">聚水潭入库录错</option>
                              <option value="采购单数量与实际到货不一致">采购单数量与实际不一</option>
                              <option value="其他">其他</option>
                            </select>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-bold">{item.discrepancy_reason || "无差异"}</span>
                          )}
                        </td>

                        {/* 6. Handling Result Dropdown */}
                        <td className="p-3">
                          {currentRole === "finance" && isLineDiff ? (
                            <select
                              value={item.handling_result || ""}
                              onChange={e => handleHandlingResultChange(item.id, e.target.value)}
                              className="bg-[#f8f9fc] hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded p-1"
                            >
                              <option value="">-- 选择认定结果 --</option>
                              <option value="按仓库实点数量结算">按实数付款结算</option>
                              <option value="等供应商补发">保留尾货等供应商补发</option>
                              <option value="退回多发货">退回溢装货</option>
                              <option value="修改聚水潭入库数量">后台重修JST入账</option>
                              <option value="修改供应商发货清单">修正发发清单差额</option>
                              <option value="财务手动调整">财务手动挂起调账</option>
                            </select>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-bold">{item.handling_result || "免处理"}</span>
                          )}
                        </td>

                        {/* 7. Item Remark input */}
                        <td className="p-3 pr-5">
                          {currentRole !== "supplier_annil" && currentRole !== "supplier_balabala" ? (
                            <input 
                              type="text"
                              value={item.remark || ""}
                              onChange={e => handleItemRemarkChange(item.id, e.target.value)}
                              placeholder="清点异常追记..."
                              className="w-[120px] lg:w-[150px] bg-slate-50 border border-slate-200 rounded p-1 font-semibold text-[11px]"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px] block" title={item.remark || "正常"}>
                              {item.remark || "正常"}
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Overall bottom-up summary layout inside details page */}
            <div className="p-5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-650 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="block font-black text-slate-900">🏭 仓库实点锁定详情：</span>
                <span className="block text-[11px] text-slate-500">
                  清点执行时间：<strong className="text-slate-800 font-mono">{currentBatch.count_time || "未清算完毕"}</strong> | 清点员：<strong className="text-slate-800 font-medium">{currentBatch.counter_name || "待确认"}</strong>
                </span>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[11px] text-slate-450 font-bold">最终批次核准数量比对：</p>
                <p className="text-xs text-slate-700">
                  到货申报：<strong className="text-slate-950 font-mono font-black">{currentBatch.supplier_qty}</strong> 件 | 
                  仓库实录核计：<strong className="text-blue-600 font-mono font-black">{currentBatch.warehouse_qty}</strong> 件 | 
                  聚水潭最终入库：<strong className="text-teal-800 font-mono font-black">{currentBatch.jst_qty}</strong> 件
                </p>
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-3xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-[#006591]" />
              <p className="text-xs text-slate-500 font-bold">
                您可以在此确认所有更改。对账信息会自动回写至系统，无须保存。
              </p>
            </div>
            <button 
              onClick={() => { setSelectedBatchId(null); showToast("🔙 已返回主页列表目。"); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-bold text-xs shadow-3xs cursor-pointer"
            >
              确定并返回主页列表
            </button>
          </div>

        </div>
      )}

      {/* DIALOG 1: FINANCIAL FINAL RECONCILIATION APPROVAL MODAL */}
      <AnimatePresence>
        {isFinConfirmOpen && (
          <>
            <div onClick={() => setIsFinConfirmOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[150]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-2xl z-[160] p-6 text-slate-700"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 animate-none">
                  <ClipboardCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>到货核定财务确认中心 (批定终审)</span>
                </h3>
                <button 
                  onClick={() => setIsFinConfirmOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {finConfirmBatchId && (() => {
                const bObj = batches.find(b => b.id === finConfirmBatchId);
                if (!bObj) return null;

                const basePayable = bObj.estimated_amount / 100;
                const finalCalcedYuan = basePayable + finFinalPriceAdjust;

                return (
                  <form onSubmit={handleFinanceConfirmSubmit} className="space-y-4 text-xs font-bold font-sans">
                    
                    {/* Tiny summary banner */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-3 gap-3 text-center select-none">
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase mb-0.5">供应商派货清单件数</span>
                        <span className="text-sm font-black text-slate-800 font-mono">{bObj.supplier_qty} 件</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 mb-0.5">仓库最终实扣件数</span>
                        <span className="text-sm font-black text-blue-600 font-mono">{bObj.warehouse_qty} 件</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 mb-0.5">聚水潭入库入单数</span>
                        <span className="text-sm font-black text-teal-800 font-mono">{bObj.jst_qty} 件</span>
                      </div>
                    </div>

                    {/* Formula selection */}
                    <div>
                      <label className="block text-[10px] text-slate-450 mb-1.5 uppercase">采购账本结算数量设定基准</label>
                      <select
                        value={finSettlementRule}
                        onChange={e => setFinSettlementRule(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800"
                      >
                        <option value="warehouse_qty">以 [仓库手工点货实数] 为最终结算标准（由于服装实际卸货为准）</option>
                        <option value="jst_qty">以 [聚水潭采购接收录账数] 为结算标准（完全匹配系统ERP单数）</option>
                      </select>
                      <p className="text-[9px] text-slate-450 font-normal mt-1 leading-normal">
                        * 注：根据财务制度，若两张数存在差异：对于供应商少发默认按仓库实数支付；对于聚水潭少入应在修正聚水潭前按仓库手工点书支付货款。
                      </p>
                    </div>

                    {/* Manual Financial Price adjustments */}
                    <div>
                      <label className="block text-[10px] text-slate-450 mb-1">财务本批手动垫付款或公摊调整（￥ 元，支持负值扣款）</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2 text-slate-400 text-xs font-mono">¥</span>
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={finFinalPriceAdjust || ""}
                          onChange={e => setFinFinalPriceAdjust(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-1.8 pl-7.5 pr-3 text-xs font-mono font-black focus:outline-none"
                        />
                      </div>
                      <p className="text-[9px] text-slate-450 font-normal mt-1 leading-normal">
                        例如需要临时扣减质量赔偿、运费分摊等，此调整会直接加计至到货核准总价。
                      </p>
                    </div>

                    {/* Calculated Outcome display */}
                    <div className="bg-emerald-50/50 p-4.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[9.5px] text-emerald-800 uppercase mb-0.5">最终核准总结算货款</span>
                        <span className="text-[17px] font-black text-emerald-700 font-mono">
                          ¥{finalCalcedYuan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 uppercase mb-0.5">本批应计差额（对比预估）</span>
                        <span className="font-mono text-xs font-bold text-slate-650">
                          {finFinalPriceAdjust !== 0 ? `${finFinalPriceAdjust > 0 ? "+" : ""}${finFinalPriceAdjust}元` : "无偏微修正"}
                        </span>
                      </div>
                    </div>

                    {/* Permit invoice generation */}
                    <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl">
                      <input 
                        type="checkbox"
                        id="allow-invoice-generation-input"
                        checked={allowCreateInvoice}
                        onChange={e => setAllowCreateInvoice(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-100 accent-emerald-600 cursor-pointer"
                      />
                      <label htmlFor="allow-invoice-generation-input" className="text-[11px] text-slate-700 cursor-pointer select-none">
                        <strong>立即解锁可生成账单状态权</strong>（允许在随后的对账页面提取此货款合并结算）
                      </label>
                    </div>

                    {/* Note remark */}
                    <div>
                      <label className="block text-[10px] text-slate-450 mb-1">财务核查批次决裁终审备忘</label>
                      <input 
                        type="text"
                        placeholder="例：已与供应商安奈儿销售经理电话二次确认，实物少发部分本次短结，下批补发不重入账..."
                        value={finConfirmNote}
                        onChange={e => setFinConfirmNote(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2 text-xs font-bold border-t border-slate-100 select-none">
                      <button 
                        type="button"
                        onClick={() => setIsFinConfirmOpen(false)}
                        className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-pointer"
                      >
                        退回修改
                      </button>
                      <button 
                        type="submit"
                        className="px-4.5 py-2.2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-3xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>同意决审决议并过账</span>
                      </button>
                    </div>

                  </form>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DIALOG 2: NEW ARRIVAL BATCH MODAL */}
      <AnimatePresence>
        {isCreateBatchOpen && (
          <>
            <div onClick={() => setIsCreateBatchOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[150]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl z-[160] p-6 text-slate-700"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-indigo-500" />
                  <span>新建卸柜到货批次页表</span>
                </h3>
                <button 
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-4 text-xs font-bold select-none">
                
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1">1. 供货方名称</label>
                  <select
                    value={newBatchSupplier}
                    onChange={e => setNewBatchSupplier(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2.2 px-3 text-xs focus:outline-none"
                  >
                    <option value="安奈儿童装">安奈儿童装</option>
                    <option value="巴拉巴拉童装">巴拉巴拉童装</option>
                    <option value="森马童装">森马童装</option>
                    <option value="笛莎公主裙">笛莎公主裙</option>
                    <option value="戴维贝拉童装">戴维贝拉童装</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-455 mb-1">2. 关联采购合同或PO单编号</label>
                  <input 
                    type="text"
                    required
                    placeholder="例如 PO-20260525-450"
                    value={newBatchPoNo}
                    onChange={e => setNewBatchPoNo(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 focus:outline-none font-mono text-slate-800"
                  />
                  <p className="text-[9px] text-slate-400 font-normal mt-1 leading-normal">
                    * 注：新建到货批次会自动抓取该合同下的所有 SKU 原定采购数量进行清单比对初始化。
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-455 mb-1">3. 大货到货签收日期</label>
                  <input 
                    type="date"
                    required
                    value={newBatchDate}
                    onChange={e => setNewBatchDate(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-850"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 text-xs font-bold border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsCreateBatchOpen(false)}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-pointer"
                  >
                    取消退出
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2.2 bg-[#002045] hover:bg-[#002d60] text-white rounded-xl shadow-3xs cursor-pointer"
                  >
                    确认接入单据并建档
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
