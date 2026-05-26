/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Truck, Warehouse, Wallet, Search, Filter, Check, X, ChevronLeft, Plus, 
  AlertCircle, ArrowLeftRight, Download, Sparkles, Clock, User, History, 
  ChevronRight, Coins, Eye, Settings, Layers, Lock, ThumbsUp, CheckCircle, 
  FileSpreadsheet, ClipboardCheck, Edit2, ShieldAlert, BadgeAlert, RefreshCw, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Parent Purchase Order Type
interface PurchaseOrder {
  po_no: string;                        // 采购单号
  supplier_name: string;                // 供应商
  style_no: string;                     // 款号
  sku_code: string;                     // SKU编码
  product_name: string;                 // 商品名称
  color_size: string;                   // 颜色尺码
  po_qty: number;                       // 采购数量
  cost_price: number;                   // 成本单价
  total_amount: number;                 // 采购总金额 (po_qty * cost_price)
  // Dynamic fields computed from batches:
  delivered_qty?: number;               // 累计到货数量
  remaining_qty?: number;               // 剩余数量 
  settled_qty?: number;                 // 结算数量
  status?: "未到货" | "部分到货" | "已到齐" | "超量到货" | "短缺关闭" | "已取消";
  is_short_closed: boolean;            // 是否被手动标记“短缺关闭”
  short_closed_reason?: string;          // 短缺关闭备注
  overage_policy: "accept" | "reject" | "manual" | ""; // 超量处理结果
  overage_manual_qty?: number;          // 手动核定结算数
}

// Child Sku Detail inside a specific Arrival Batch
interface SkuArrivalItem {
  sku_code: string;
  style_no: string;
  product_name: string;
  color_size: string;
  po_qty: number;             // 该采购订单针对该 SKU 的总量
  supplier_qty: number;       // 本批次供应商发货数
  warehouse_qty: number;      // 本批次仓库实点数
  jst_qty: number;            // 本批次聚水潭入库数
  confirmed_qty: number;      // 本批次财务确认数
  discrepancy_reason?: string; // 差异原因
  handling_result?: string;   // 重算/处理结果
  remark?: string;
}

// Child Arrival Batch Type
interface ArrivalBatch {
  id: string;                 // 到货批次号
  po_no: string;              // 关联采购单单号
  supplier_name: string;      // 供应商名称
  arrival_date: string;       // 到货日期
  status: "待清点" | "清点完成" | "待聚水潭入库" | "入库完成" | "有差异待处理" | "财务已确认";
  counter_name?: string;      // 仓库清点人
  count_time?: string;        // 清点日期时间
  remark?: string;
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

type RoleType = "finance" | "warehouse" | "supplier_annil" | "supplier_balabala";

export default function ArrivalVerificationPage() {
  // Current logged in simulator role (Finance / Warehouse / Supplier)
  const [currentRole, setCurrentRole] = useState<RoleType>("finance");

  // Dual View Tab Toggle: "batches" (到货批次视图) | "pos" (采购单进度视图)
  const [activeTab, setActiveTab] = useState<"batches" | "pos">("batches");

  // State Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (txt: string) => {
    setToastMsg(txt);
    setTimeout(() => { setToastMsg(null); }, 3000);
  };

  // 1. Core State: Purchase Orders (Parent Data)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      po_no: "PO-20260515-001",
      supplier_name: "安奈儿童装",
      style_no: "AN-KIDS-602",
      sku_code: "AN602-BL-110",
      product_name: "全棉透气儿童短袖T恤",
      color_size: "天空蓝 / 110cm",
      po_qty: 100,
      cost_price: 45,
      total_amount: 4500,
      is_short_closed: false,
      overage_policy: ""
    },
    {
      po_no: "PO-20260518-002",
      supplier_name: "巴拉巴拉童装",
      style_no: "BB101-OW-120",
      sku_code: "BB101-OW-120",
      product_name: "男童印花运动短袖",
      color_size: "椰奶白 / 120cm",
      po_qty: 100,
      cost_price: 48,
      total_amount: 4800,
      is_short_closed: false,
      overage_policy: ""
    },
    {
      po_no: "PO-20260519-003",
      supplier_name: "笛莎公主裙",
      style_no: "DS501-PK-100",
      sku_code: "DS501-PK-100",
      product_name: "冰雪奇缘公主摆裙",
      color_size: "艾莎粉 / 100cm",
      po_qty: 100,
      cost_price: 78,
      total_amount: 7800,
      is_short_closed: false,
      overage_policy: ""
    },
    {
      po_no: "PO-20260520-004",
      supplier_name: "戴维贝拉",
      style_no: "DV90-BL-90",
      sku_code: "DV90-BL-90",
      product_name: "纯棉儿童双口袋外套",
      color_size: "薄荷蓝 / 90cm",
      po_qty: 50,
      cost_price: 80,
      total_amount: 4000,
      is_short_closed: false,
      overage_policy: ""
    }
  ]);

  // 2. Core State: Arrival Batches (Child Data linked via po_no & sku_code)
  // Demonstrating both 1 Purchase Order delivered in multiple batches (e.g. PO-20260515-001 has multiple batches),
  // as well as shortfalls and overages to test actions out-of-the-box!
  const [arrivalBatches, setArrivalBatches] = useState<ArrivalBatch[]>([
    // Test Scenario: "PO-20260515-001" delivered across 4 batches of 20, 30, 40 and 10 to make exactly 100
    {
      id: "REC-ARR-001A",
      po_no: "PO-20260515-001",
      supplier_name: "安奈儿童装",
      arrival_date: "2026-05-10",
      status: "财务已确认",
      remark: "分批送货第1批",
      counter_name: "刘仓库",
      count_time: "2026-05-10 10:15:30",
      items: [{
        sku_code: "AN602-BL-110",
        style_no: "AN-KIDS-602",
        product_name: "全棉透气儿童短袖T恤",
        color_size: "天空蓝 / 110cm",
        po_qty: 100,
        supplier_qty: 20,
        warehouse_qty: 20,
        jst_qty: 20,
        confirmed_qty: 20,
        discrepancy_reason: "",
        handling_result: "按仓库实点数量结算"
      }]
    },
    {
      id: "REC-ARR-001B",
      po_no: "PO-20260515-001",
      supplier_name: "安奈儿童装",
      arrival_date: "2026-05-14",
      status: "财务已确认",
      remark: "分批送货第2批",
      counter_name: "刘仓库",
      count_time: "2026-05-14 11:20:00",
      items: [{
        sku_code: "AN602-BL-110",
        style_no: "AN-KIDS-602",
        product_name: "全棉透气儿童短袖T恤",
        color_size: "天空蓝 / 110cm",
        po_qty: 100,
        supplier_qty: 30,
        warehouse_qty: 30,
        jst_qty: 30,
        confirmed_qty: 30,
        discrepancy_reason: "",
        handling_result: "按仓库实点数量结算"
      }]
    },
    {
      id: "REC-ARR-001C",
      po_no: "PO-20260515-001",
      supplier_name: "安奈儿童装",
      arrival_date: "2026-05-20",
      status: "财务已确认",
      remark: "分批送货第3批",
      counter_name: "刘仓库",
      count_time: "2026-05-20 15:00:22",
      items: [{
        sku_code: "AN602-BL-110",
        style_no: "AN-KIDS-602",
        product_name: "全棉透气儿童短袖T恤",
        color_size: "天空蓝 / 110cm",
        po_qty: 100,
        supplier_qty: 40,
        warehouse_qty: 40,
        jst_qty: 40,
        confirmed_qty: 40,
        discrepancy_reason: "",
        handling_result: "按仓库实点数量结算"
      }]
    },
    {
      id: "REC-ARR-001D",
      po_no: "PO-20260515-001",
      supplier_name: "安奈儿童装",
      arrival_date: "2026-05-25",
      status: "待清点",
      remark: "分批送货最后1批(待清点)",
      items: [{
        sku_code: "AN602-BL-110",
        style_no: "AN-KIDS-602",
        product_name: "全棉透气儿童短袖T恤",
        color_size: "天空蓝 / 110cm",
        po_qty: 100,
        supplier_qty: 10,
        warehouse_qty: 0, // Pending physical count
        jst_qty: 0,
        confirmed_qty: 0,
        discrepancy_reason: "",
        handling_result: ""
      }]
    },

    // Test Scenario 2: "PO-20260518-002" Shortfall (Ordered 100, actually received 90 items, no more supplement)
    {
      id: "REC-ARR-002",
      po_no: "PO-20260518-002",
      supplier_name: "巴拉巴拉童装",
      arrival_date: "2026-05-22",
      status: "入库完成",
      remark: "供应商确认欠产少送10件",
      counter_name: "徐仓库",
      count_time: "2026-05-22 13:40:11",
      items: [{
        sku_code: "BB101-OW-120",
        style_no: "BB101-OW-120",
        product_name: "男童印花运动短袖",
        color_size: "椰奶白 / 120cm",
        po_qty: 100,
        supplier_qty: 90,
        warehouse_qty: 90,
        jst_qty: 90,
        confirmed_qty: 0,
        discrepancy_reason: "供应商少发",
        handling_result: "按仓库实点数量结算"
      }]
    },

    // Test Scenario 3: "PO-20260519-003" Over-receipt (Ordered 100, supplier sent 110. Real differences detected)
    {
      id: "REC-ARR-003",
      po_no: "PO-20260519-003",
      supplier_name: "笛莎公主裙",
      arrival_date: "2026-05-24",
      status: "有差异待处理",
      remark: "供应商塞货溢装10件，仓库实收110，聚水潭错入105",
      counter_name: "朱仓库",
      count_time: "2026-05-24 09:12:00",
      items: [{
        sku_code: "DS501-PK-100",
        style_no: "DS501-PK-100",
        product_name: "冰雪奇缘公主摆裙",
        color_size: "艾莎粉 / 100cm",
        po_qty: 100,
        supplier_qty: 100,
        warehouse_qty: 110, // Over received
        jst_qty: 105,       // Record error
        confirmed_qty: 0,
        discrepancy_reason: "供应商多发",
        handling_result: "退回多发货"
      }]
    }
  ]);

  // Operational Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "L1", timestamp: "2026-05-26 09:20:10", operator: "系统自动", action_type: "单据同步", target: "PO-20260515-001", before: "空", after: "同步4批次分期送货承诺，累计货款￥4,500.00" },
    { id: "L2", timestamp: "2026-05-26 10:11:45", operator: "朱仓库", action_type: "录入实物清点", target: "REC-ARR-003", before: "0", after: "110", reason: "实箱大包装拆点，款号DS501-PK-100溢发多到10件" },
    { id: "L3", timestamp: "2026-05-26 11:34:02", operator: "徐仓库", action_type: "锁定到货实数", target: "REC-ARR-002", before: "待清点", after: "入库完成", reason: "巴拉巴拉货品少发核验，标记异常原因：【供应商少发】" }
  ]);

  // Filters State
  const [filterSupplier, setFilterSupplier] = useState<string>("全部");
  const [filterPoNo, setFilterPoNo] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("全部");
  const [filterHasDiff, setFilterHasDiff] = useState<string>("全部"); // 全部 / 是 / 否
  const [searchSkuOrStyle, setSearchSkuOrStyle] = useState<string>("");

  // Detailed modal or drawers state
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [expandedPoNo, setExpandedPoNo] = useState<string | null>(null);

  // Modal State for Final Finance Confirmation
  const [isFinConfirmOpen, setIsFinConfirmOpen] = useState<boolean>(false);
  const [confirmingBatchId, setConfirmingBatchId] = useState<string | null>(null);
  const [financeConfirmSettleRule, setFinanceConfirmSettleRule] = useState<"warehouse" | "jst" | "custom">("warehouse");
  const [financeCustomQty, setFinanceCustomQty] = useState<number>(0);
  const [financeConfirmResult, setFinanceConfirmResult] = useState<string>("按仓库实点数量结算");
  const [financeConfirmNote, setFinanceConfirmNote] = useState<string>("");

  // Trigger Log addition
  const addAuditLog = (operator: string, actionType: string, target: string, before: string, after: string, reason?: string) => {
    const newLog: AuditLog = {
      id: `L-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator,
      action_type: actionType,
      target,
      before,
      after,
      reason
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Derive status and progress variables dynamically for Purchase Orders using useMemo
  // This guarantees there is no sync bug between batches and PO rows!
  const computedPOs = useMemo(() => {
    return purchaseOrders.map(po => {
      // Find all items corresponding to this PO item (matching po_no and sku_code)
      const matchingBatchItems: { batchStatus: string; item: SkuArrivalItem }[] = [];
      arrivalBatches.forEach(b => {
        if (b.po_no === po.po_no) {
          const matchSku = b.items.find(item => item.sku_code === po.sku_code);
          if (matchSku) {
            matchingBatchItems.push({
              batchStatus: b.status,
              item: matchSku
            });
          }
        }
      });

      // Compute delivered qty = sum of warehouse_qty across completed or counted batches (status !== '待清点')
      const delivered_qty = matchingBatchItems
        .filter(x => x.batchStatus !== "待清点")
        .reduce((sum, x) => sum + x.item.warehouse_qty, 0);

      // Compute settled_qty = sum of confirmed_qty of confirmed batches
      const settled_qty = matchingBatchItems
        .filter(x => x.batchStatus === "财务已确认")
        .reduce((sum, x) => sum + x.item.confirmed_qty, 0);

      // Determine Derived Status:
      let finalStatus: PurchaseOrder["status"] = "未到货";
      let remaining_qty = Math.max(0, po.po_qty - delivered_qty);

      if (po.is_short_closed) {
        finalStatus = "短缺关闭";
        remaining_qty = 0;
      } else if (delivered_qty === 0) {
        finalStatus = "未到货";
      } else if (delivered_qty > po.po_qty) {
        finalStatus = "超量到货";
      } else if (delivered_qty === po.po_qty) {
        finalStatus = "已到齐";
      } else if (delivered_qty < po.po_qty) {
        finalStatus = "部分到货";
      }

      // If overage handling strategy is applied, shift settled_qty or update
      let calculatedSettleQty = settled_qty;
      // In a real system, the finance user defines the final settlement strategy for the PO if it's over received
      if (finalStatus === "超量到货") {
        if (po.overage_policy === "reject") {
          calculatedSettleQty = po.po_qty; // Settle exactly on contract term (100)
        } else if (po.overage_policy === "manual" && po.overage_manual_qty !== undefined) {
          calculatedSettleQty = po.overage_manual_qty;
        } else {
          calculatedSettleQty = delivered_qty; // Settle on actual received
        }
      }

      return {
        ...po,
        delivered_qty,
        settled_qty: calculatedSettleQty,
        remaining_qty,
        status: finalStatus
      };
    });
  }, [purchaseOrders, arrivalBatches]);

  // Read role filter restrictions:
  // If role is supplier_annil, we ONLY expose "安奈儿童装".
  // If role is supplier_balabala, we ONLY expose "巴拉巴拉童装".
  const filteredArrivalBatches = useMemo(() => {
    return arrivalBatches.filter(b => {
      // 1. Role-based security check
      if (currentRole === "supplier_annil" && b.supplier_name !== "安奈儿童装") return false;
      if (currentRole === "supplier_balabala" && b.supplier_name !== "巴拉巴拉童装") return false;

      // 2. Filter states
      if (filterSupplier !== "全部" && b.supplier_name !== filterSupplier) return false;
      if (filterPoNo && !b.po_no.toLowerCase().includes(filterPoNo.trim().toLowerCase())) return false;
      if (filterStatus !== "全部" && b.status !== filterStatus) return false;
      
      // Calculate difference indicator
      const totalSupInBatch = b.items.reduce((sum, i) => sum + i.supplier_qty, 0);
      const totalWhInBatch = b.items.reduce((sum, i) => sum + i.warehouse_qty, 0);
      const totalJstInBatch = b.items.reduce((sum, i) => sum + i.jst_qty, 0);
      const hasDiff = (totalSupInBatch !== totalWhInBatch) || (totalSupInBatch !== totalJstInBatch);
      
      if (filterHasDiff === "是" && !hasDiff) return false;
      if (filterHasDiff === "否" && hasDiff) return false;

      // Text search
      if (searchSkuOrStyle) {
        const query = searchSkuOrStyle.trim().toLowerCase();
        const matchesSku = b.items.some(i => 
          i.sku_code.toLowerCase().includes(query) || 
          i.style_no.toLowerCase().includes(query) || 
          i.product_name.toLowerCase().includes(query)
        );
        const matchesBatchCode = b.id.toLowerCase().includes(query);
        if (!matchesSku && !matchesBatchCode) return false;
      }

      return true;
    });
  }, [arrivalBatches, currentRole, filterSupplier, filterPoNo, filterStatus, filterHasDiff, searchSkuOrStyle]);

  const filteredPOs = useMemo(() => {
    return computedPOs.filter(po => {
      // 1. Role-based security check
      if (currentRole === "supplier_annil" && po.supplier_name !== "安奈儿童装") return false;
      if (currentRole === "supplier_balabala" && po.supplier_name !== "巴拉巴拉童装") return false;

      // 2. Filter states
      if (filterSupplier !== "全部" && po.supplier_name !== filterSupplier) return false;
      if (filterPoNo && !po.po_no.toLowerCase().includes(filterPoNo.trim().toLowerCase())) return false;

      // Apply dynamic search text
      if (searchSkuOrStyle) {
        const query = searchSkuOrStyle.trim().toLowerCase();
        const matchesText = po.sku_code.toLowerCase().includes(query) || 
                            po.style_no.toLowerCase().includes(query) || 
                            po.product_name.toLowerCase().includes(query);
        if (!matchesText && !po.po_no.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [computedPOs, currentRole, filterSupplier, filterPoNo, searchSkuOrStyle]);

  // Overall Statistics Panel values
  const stats = useMemo(() => {
    const listBatches = arrivalBatches.filter(b => {
      if (currentRole === "supplier_annil" && b.supplier_name !== "安奈儿童装") return false;
      if (currentRole === "supplier_balabala" && b.supplier_name !== "巴拉巴拉童装") return false;
      return true;
    });

    const activePOs = computedPOs.filter(p => {
      if (currentRole === "supplier_annil" && p.supplier_name !== "安奈儿童装") return false;
      if (currentRole === "supplier_balabala" && p.supplier_name !== "巴拉巴拉童装") return false;
      return true;
    });

    const totalBillsGenerated = listBatches.filter(b => b.status === "财务已确认").length;
    const itemsWithDiff = listBatches.filter(b => {
      return b.items.some(i => i.supplier_qty !== i.warehouse_qty || i.supplier_qty !== i.jst_qty);
    }).length;

    // Calculate total tentative payable based on settled_qty
    const totalEstAmount = activePOs.reduce((sum, po) => sum + (po.settled_qty * po.cost_price), 0);

    return {
      batchCount: listBatches.length,
      poCount: activePOs.length,
      diffCount: itemsWithDiff,
      completeCount: listBatches.filter(b => b.status === "财务已确认" || b.status === "入库完成").length,
      payable: totalEstAmount
    };
  }, [arrivalBatches, computedPOs, currentRole]);

  // Warehouse Actions: Update Sku hand-counted quantity
  const handleWarehouseQtyEdit = (batchId: string, skuCode: string, inputVal: string) => {
    // Permission check
    if (currentRole.startsWith("supplier")) {
      showToast("🔒 供应商账户仅拥有【只读】视图，无权更改实收数据！");
      return;
    }

    const value = parseInt(inputVal);
    if (isNaN(value) || value < 0) return;

    setArrivalBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;

      const updatedItems = b.items.map(item => {
        if (item.sku_code === skuCode) {
          if (item.warehouse_qty !== value) {
            // Register an audit trail inside
            addAuditLog(
              currentRole === "finance" ? "陈财务" : "温仓库员",
              "录入核对实数",
              `${batchId} / ${skuCode}`,
              `${item.warehouse_qty} 件`,
              `${value} 件`,
              "到货纸质箱规开箱重新逐本清点"
            );
          }
          return { ...item, warehouse_qty: value };
        }
        return item;
      });

      // Shift status to 清点中 if warehouse qty gets updated
      let nextStatus = b.status;
      if (b.status === "待清点") {
        nextStatus = "清点完成";
      }

      return {
        ...b,
        status: nextStatus as any,
        items: updatedItems,
        counter_name: b.counter_name || "仓库检验员-何小兵",
        count_time: b.count_time || new Date().toISOString().replace("T", " ").substring(0, 19)
      };
    }));
  };

  // Action: Update comments
  const handleItemRemarkEdit = (batchId: string, skuCode: string, val: string) => {
    if (currentRole.startsWith("supplier")) return;
    setArrivalBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        items: b.items.map(i => i.sku_code === skuCode ? { ...i, remark: val } : i)
      };
    }));
  };

  // Action: Update discrepancy reason
  const handleDiscrepancyReasonEdit = (batchId: string, skuCode: string, val: string) => {
    if (currentRole !== "finance") {
      showToast("🔒 差异归因仅允许【财务角色】设定及审核认定！");
      return;
    }
    setArrivalBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        items: b.items.map(i => {
          if (i.sku_code === skuCode) {
            addAuditLog("陈财务", "标记差异归因", `${batchId} / ${skuCode}`, i.discrepancy_reason || "无", val || "无清除", "比对方数量不符之分类决策");
            return { ...i, discrepancy_reason: val };
          }
          return i;
        })
      };
    }));
  };

  // Action: Update handling result
  const handleHandlingResultEdit = (batchId: string, skuCode: string, val: string) => {
    if (currentRole !== "finance") {
      showToast("🔒 核查归置结果仅限【财务主管】进行锁定修改！");
      return;
    }
    setArrivalBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        items: b.items.map(i => {
          if (i.sku_code === skuCode) {
            addAuditLog("陈财务", "标记裁定成果", `${batchId} / ${skuCode}`, i.handling_result || "未决策", val || "无清除");
            return { ...i, handling_result: val };
          }
          return i;
        })
      };
    }));
  };

  // Action: Trigger status change manually on batch (e.g. 仓库清点完成 -> 待入库 -> 入库完成)
  const handleBatchStatusShift = (batchId: string, newStat: ArrivalBatch["status"]) => {
    if (currentRole.startsWith("supplier")) {
      showToast("🔒 供应商无权更新流程进度状态！");
      return;
    }
    setArrivalBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      addAuditLog(
        currentRole === "finance" ? "陈财务(审核)" : "仓库领班高经理",
        "更新批次进度",
        batchId,
        b.status,
        newStat,
        "流程进度递进手工重置"
      );
      return { 
        ...b, 
        status: newStat,
        counter_name: b.counter_name || "仓库业务件",
        count_time: b.count_time || new Date().toISOString().replace("T", " ").substring(0, 19)
      };
    }));
    showToast(`🟢 批次流程推进：[${newStat}] 成功`);
  };

  // Action: Shortage close on PO (Purchase Order)
  const handlePOShortClose = (poNo: string) => {
    if (currentRole !== "finance") {
      showToast("🔒 仅【财务主管】可行使合同短额强行归档权利（短缺关闭）！");
      return;
    }
    const textNote = prompt("请输入短缺关闭备注说明（如：本款面料售罄，后续欠件协商豁免不补发，核准本次结案）：");
    if (textNote === null) return; // cancel

    setPurchaseOrders(prev => prev.map(po => {
      if (po.po_no === poNo) {
        addAuditLog("陈财务", "手动短缺结案", poNo, "常态到货流转", "短缺关闭(结案完毕)", textNote || "未附加特定备注");
        return {
          ...po,
          is_short_closed: true,
          short_closed_reason: textNote || "由于货期延误或供应商材料短缺，经商定关闭剩余未到件，进入结算阶段"
        };
      }
      return po;
    }));
    showToast("🎉 该采购订单尚余空缺已被截断并强行归档！状态已变更为: 短缺关闭。");
  };

  // Action: Set Overage policy for PO
  const handlePOOveragePolicySet = (poNo: string, policy: "accept" | "reject" | "manual", manualQty?: number) => {
    if (currentRole !== "finance") {
      showToast("🔒 仅【财务主管】有权裁决溢装异常到货结转策略！");
      return;
    }
    setPurchaseOrders(prev => prev.map(po => {
      if (po.po_no === poNo) {
        let afterText = "";
        if (policy === "accept") afterText = "同意接收多发多货，按实收结算";
        if (policy === "reject") afterText = "退回超发货品，多出数量不予结账";
        if (policy === "manual") afterText = `协商部分吸纳，手工指定结算件数: ${manualQty}`;

        addAuditLog("陈财务", "设定超量处理策略", poNo, "未裁决", afterText);
        return {
          ...po,
          overage_policy: policy,
          overage_manual_qty: manualQty !== undefined ? manualQty : po.overage_manual_qty
        };
      }
      return po;
    }));
    showToast("⚖️ 溢装到货处理方案已成功绑定且生效！结算货款账值已自动更新。");
  };

  // Action: Finance confirms specific arrival batch (Opens dialogue setup)
  const handleOpenFinanceBatchConfirm = (batchId: string) => {
    if (currentRole !== "finance") {
      showToast("🔒 [财务待确认] 节点终审复核必须切换回 [财务主管] 账户操作！");
      return;
    }
    const b = arrivalBatches.find(x => x.id === batchId);
    if (!b) return;
    setConfirmingBatchId(batchId);
    setFinanceConfirmSettleRule("warehouse");
    
    const sumWarehouse = b.items.reduce((s, i) => s + i.warehouse_qty, 0);
    setFinanceCustomQty(sumWarehouse);
    setFinanceConfirmResult("按仓库实点数量结算");
    setFinanceConfirmNote("");
    setIsFinConfirmOpen(true);
  };

  // Form submit financial confirmation decision
  const handleSubmitFinanceConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingBatchId) return;

    const b = arrivalBatches.find(x => x.id === confirmingBatchId);
    if (!b) return;

    setArrivalBatches(prev => prev.map(batch => {
      if (batch.id !== confirmingBatchId) return batch;

      const updatedItems = batch.items.map(item => {
        let finalConfirmQtyForSku = item.warehouse_qty;
        if (financeConfirmSettleRule === "jst") {
          finalConfirmQtyForSku = item.jst_qty;
        } else if (financeConfirmSettleRule === "custom") {
          // Proportionate distribution or simple manual count override
          finalConfirmQtyForSku = financeCustomQty;
        }

        return {
          ...item,
          confirmed_qty: finalConfirmQtyForSku,
          discrepancy_reason: item.discrepancy_reason || "核准完成",
          handling_result: financeConfirmResult
        };
      });

      return {
        ...batch,
        status: "财务已确认",
        remark: `${batch.remark || ""} [财务裁：${financeConfirmResult}。说明: ${financeConfirmNote || "正常入账核对小结"}]`,
        items: updatedItems
      };
    }));

    addAuditLog(
      "陈财务(审核人)",
      "财务最终核准单据",
      confirmingBatchId,
      b.status,
      "财务已确认(可付账)",
      `裁定策略: ${financeConfirmResult}. 备注: ${financeConfirmNote || "二方无差异一致直接通闸发卡"}`
    );

    setIsFinConfirmOpen(false);
    setConfirmingBatchId(null);
    showToast("🎉 恭喜！财务已成功对碰清算此到货批次，该数据正式记入应结财务账。");
  };

  return (
    <div className="space-y-6 select-text text-slate-800 font-sans max-w-7xl mx-auto pb-10">
      
      {/* Toast Announcement */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white font-semibold text-xs py-2.5 px-6 rounded-full shadow-2xl z-[200] flex items-center space-x-2 select-none"
          >
            <span className="text-amber-400">●</span>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR AND ROLE SELECTOR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 shadow-inner shrink-0">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">到货核对中心</h1>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-mono">ERP v2.9</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                重点解决多分期到货中 “供应商送货数、仓库手工实点数、聚水潭入库账” 与 “财务应付金额” 对不上的核心难点。
                <strong className="text-amber-400 ml-1">非1对1设计，主客层级联动</strong>。
              </p>
            </div>
          </div>

          {/* SIMULATION CONTROLLER BANNER */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3 shrink-0">
            <div className="text-left shrink-0">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">⚙️ 模拟身份安全沙盘</span>
              <span className="text-[10px] text-slate-350 block mt-1">切换查看各自角色的数据脱敏、遮置：</span>
            </div>
            
            <div className="grid grid-cols-2 xs:flex xs:flex-wrap gap-1.5 font-bold text-[11px]">
              <button
                onClick={() => { setCurrentRole("finance"); showToast("🔑 切换为：财务主管（解锁进价、超额处理、最终终审确认权）"); }}
                className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${currentRole === "finance" ? "bg-amber-500 text-slate-950 shadow-md font-bold" : "bg-slate-700 hover:bg-slate-650 text-slate-200"}`}
              >
                💼 财务主管
              </button>
              <button
                onClick={() => { setCurrentRole("warehouse"); showToast("🏭 切换为：仓库清点组（遮脱敏感价格，只准修改实物清点数量）"); }}
                className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${currentRole === "warehouse" ? "bg-blue-500 text-slate-950 shadow-md font-bold" : "bg-slate-700 hover:bg-slate-650 text-slate-200"}`}
              >
                🏭 仓库实点员
              </button>
              <button
                onClick={() => { setCurrentRole("supplier_annil"); showToast("📦 切换为：安奈儿童装（只读查看自己到货，不允许越权查看其他品牌）"); }}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer ${currentRole === "supplier_annil" ? "bg-emerald-500 text-slate-950 shadow-md font-bold" : "bg-slate-700 hover:bg-slate-650 text-slate-200"}`}
              >
                安奈儿厂方
              </button>
              <button
                onClick={() => { setCurrentRole("supplier_balabala"); showToast("📦 切换为：巴拉巴拉（只读查看自己，无权见安奈儿、戴维贝拉、森玛）"); }}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer ${currentRole === "supplier_balabala" ? "bg-violet-500 text-slate-950 shadow-md font-bold" : "bg-slate-700 hover:bg-slate-650 text-slate-200"}`}
              >
                巴拉巴拉厂方
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CORE INTERACTIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 select-none">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase leading-none block">主采购单订单数</span>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight block">{stats.poCount} 个单子</span>
            <span className="text-[10px] text-slate-400 font-semibold block">分期送货父级骨架</span>
          </div>
          <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase leading-none block">子级到货送货批</span>
            <span className="text-lg font-extrabold text-indigo-600 tracking-tight block">{stats.batchCount} 批次</span>
            <span className="text-[10px] text-indigo-400 font-semibold block">仓库实际逐批清点</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-rose-100 bg-rose-50/10 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-500 uppercase leading-none block">异常数量差异批</span>
            <span className="text-lg font-extrabold text-rose-600 tracking-tight block">{stats.diffCount} 批次</span>
            <span className="text-[10px] text-rose-400 font-bold block">需财务进行对账裁决</span>
          </div>
          <div className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg shrink-0">
            <BadgeAlert className="w-4 h-4 animate-bounce" />
          </div>
        </div>

        <div className="bg-white border border-emerald-100 bg-emerald-50/10 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase leading-none block">已核准并产单</span>
            <span className="text-lg font-extrabold text-emerald-600 tracking-tight block">{stats.completeCount} 批</span>
            <span className="text-[10px] text-emerald-500 font-bold block">正式放闸至付货款</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase leading-none block">累计确认付账款额</span>
            {currentRole === "warehouse" ? (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 py-1 px-2 rounded block">*** (仓库脱敏)</span>
            ) : (
              <span className="text-lg font-extrabold text-emerald-700 tracking-tight block">¥{stats.payable.toLocaleString()}</span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold block">按财务核定数自动精算</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Coins className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* FILTER CONTROL COMPONENT */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>组合条件筛虑中心</span>
          </span>
          <button 
            onClick={() => {
              setFilterSupplier("全部");
              setFilterPoNo("");
              setFilterStatus("全部");
              setFilterHasDiff("全部");
              setSearchSkuOrStyle("");
              showToast("🧹 已全部重置到货中心筛选项！");
            }}
            className="text-[11px] text-indigo-650 hover:underline font-bold cursor-pointer"
          >
            重置筛选
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">供应商过滤</label>
            <select
              disabled={currentRole.startsWith("supplier")}
              value={filterSupplier}
              onChange={e => setFilterSupplier(e.target.value)}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100 border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none text-slate-800 font-semibold"
            >
              <option value="全部">全部供应商</option>
              <option value="安奈儿童装">安奈儿童装</option>
              <option value="巴拉巴拉童装">巴拉巴拉童装</option>
              <option value="笛莎公主裙">笛莎公主裙</option>
              <option value="戴维贝拉">戴维贝拉</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">关联采购单号</label>
            <input 
              type="text"
              placeholder="PO-2026..."
              value={filterPoNo}
              onChange={e => setFilterPoNo(e.target.value)}
              className="w-full bg-[#f8f9fc] border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">批次状态</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100 border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none text-slate-800 font-semibold"
            >
              <option value="全部">全部状态</option>
              <option value="待清点">待清点</option>
              <option value="清点完成">清点完成</option>
              <option value="待聚水潭入库">待聚水潭入库</option>
              <option value="入库完成">入库完成</option>
              <option value="有差异待处理">有差异待处理</option>
              <option value="财务已确认">财务已确认</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">是否存在数量差异</label>
            <select
              value={filterHasDiff}
              onChange={e => setFilterHasDiff(e.target.value)}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100 border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none text-slate-800 font-semibold"
            >
              <option value="全部">全部到货</option>
              <option value="是">只看有数量差异</option>
              <option value="否">只看无数量差异</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">款号 / SKU 编码一键搜</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
              <input 
                type="text"
                placeholder="键入检索..."
                value={searchSkuOrStyle}
                onChange={e => setSearchSkuOrStyle(e.target.value)}
                className="w-full bg-[#f8f9fc] border border-slate-200 rounded-lg py-1.5 pl-7 pr-2 focus:outline-none text-slate-800 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CORE VIEW TABS - DUAL MODE SWITCH */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab("batches"); setExpandedPoNo(null); }}
          className={`py-3.5 px-6 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "batches" ? "border-indigo-600 text-indigo-600 font-extrabold bg-indigo-50/20" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Truck className="w-4 h-4" />
          <span>视图 A：到货批次明细流水 (适合仓库开展实点 & 财务批次过账)</span>
          <span className="ml-1 bg-indigo-100 text-indigo-700 text-[10px] py-0.5 px-1.5 rounded-full font-mono">{filteredArrivalBatches.length} 批</span>
        </button>

        <button
          onClick={() => { setActiveTab("pos"); setExpandedBatchId(null); }}
          className={`py-3.5 px-6 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "pos" ? "border-indigo-600 text-indigo-600 font-extrabold bg-indigo-50/20" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Layers className="w-4 h-4" />
          <span>视图 B：采购订单到货进度 (适合采购及财务跟踪缺口/结案进度)</span>
          <span className="ml-1 bg-slate-100 text-slate-700 text-[10px] py-0.5 px-1.5 rounded-full font-mono">{filteredPOs.length} 单</span>
        </button>
      </div>

      {/* RENDERING VIEW A: BATCH VIEW */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="py-3 px-4.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-650">
              <span>🚚 到货批次流水总目 (仓库及财务核心对账单元)</span>
              <span className="text-[11px] text-slate-400">点击列表行右侧 【核对细数】 展开编辑款项</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#f8f9fd] text-slate-400 text-[9.5px] uppercase border-b border-slate-250 select-none">
                  <tr>
                    <th className="p-3 pl-4">到货批次号</th>
                    <th className="p-3">关联采购单号</th>
                    <th className="p-3">供应商</th>
                    <th className="p-3">到货日期</th>
                    <th className="p-3">备注</th>
                    <th className="p-3 text-right">商友发货数</th>
                    <th className="p-3 text-right text-indigo-600">仓库实点数</th>
                    <th className="p-3 text-right text-teal-700">聚水潭入库</th>
                    <th className="p-3 text-right text-amber-600">财务结算数</th>
                    <th className="p-3 text-center">状态</th>
                    <th className="p-3 text-right pr-6">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArrivalBatches.map(batch => {
                    const totalSupQty = batch.items.reduce((s, i) => s + i.supplier_qty, 0);
                    const totalWhQty = batch.items.reduce((s, i) => s + i.warehouse_qty, 0);
                    const totalJstQty = batch.items.reduce((s, i) => s + i.jst_qty, 0);
                    const totalConfQty = batch.items.reduce((s, i) => s + i.confirmed_qty, 0);
                    const isDiff = (totalSupQty !== totalWhQty) || (totalSupQty !== totalJstQty);

                    return (
                      <React.Fragment key={batch.id}>
                        <tr className={`hover:bg-indigo-50/10 transition-colors ${expandedBatchId === batch.id ? "bg-slate-50/70" : ""}`}>
                          <td className="p-3 pl-4 font-mono select-all text-[#006591] font-bold">
                            {batch.id}
                          </td>
                          <td className="p-3 font-mono text-slate-600 select-all">{batch.po_no}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800">{batch.supplier_name}</span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono">{batch.arrival_date}</td>
                          <td className="p-3 text-slate-450 truncate max-w-[150px]" title={batch.remark || "暂无备注"}>
                            {batch.remark || "—"}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-600 font-mono">{totalSupQty} 件</td>
                          <td className="p-3 text-right font-bold text-indigo-600 font-mono">{totalWhQty} 件</td>
                          <td className="p-3 text-right font-bold text-teal-700 font-mono">{totalJstQty} 件</td>
                          <td className="p-3 text-right font-bold text-amber-600 font-mono">
                            {batch.status === "财务已确认" ? `${totalConfQty} 件` : "待确认"}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold line-clamp-1 border ${
                              batch.status === "财务已确认" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                              batch.status === "有差异待处理" ? "bg-rose-50 text-rose-700 border-rose-250 animate-pulse" :
                              batch.status === "待清点" ? "bg-amber-50 text-amber-700 border-amber-250" :
                              batch.status === "清点完成" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-6 space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setExpandedBatchId(expandedBatchId === batch.id ? null : batch.id)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-250 rounded font-bold text-[11px] text-slate-700 cursor-pointer flex-inline items-center gap-0.5"
                            >
                              <Eye className="w-3 h-3 inline mr-0.5" />
                              <span>{expandedBatchId === batch.id ? "收起" : "核对细数"}</span>
                            </button>

                            {/* Status transitions based on role */}
                            {currentRole === "warehouse" && batch.status === "待清点" && (
                              <button
                                onClick={() => handleBatchStatusShift(batch.id, "清点完成")}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] cursor-pointer"
                              >
                                清点完成
                              </button>
                            )}

                            {currentRole === "warehouse" && batch.status === "清点完成" && (
                              <button
                                onClick={() => handleBatchStatusShift(batch.id, "待聚水潭入库")}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold text-[11px] cursor-pointer"
                              >
                                同步到JST
                              </button>
                            )}

                            {currentRole === "warehouse" && batch.status === "待聚水潭入库" && (
                              <button
                                onClick={() => handleBatchStatusShift(batch.id, "入库完成")}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[11px] cursor-pointer"
                              >
                                完成入库
                              </button>
                            )}

                            {currentRole === "finance" && batch.status !== "财务已确认" && (
                              <button
                                onClick={() => handleOpenFinanceBatchConfirm(batch.id)}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold text-[11px] cursor-pointer"
                              >
                                确认核对
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Collapsible item table inside BATCH row */}
                        {expandedBatchId === batch.id && (
                          <tr>
                            <td colSpan={11} className="p-4 bg-slate-50/50 border-t border-b border-indigo-100">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <ClipboardCheck className="w-4 h-4 text-indigo-500" />
                                    <span>明细对碰核准工作台 ({batch.id} SKU 深度清算)</span>
                                  </h4>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-slate-500">
                                      清点人: <strong className="text-slate-700">{batch.counter_name || "—"}</strong>
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                      清点时间: <strong className="text-slate-700">{batch.count_time || "—"}</strong>
                                    </span>
                                  </div>
                                </div>

                                <table className="w-full text-xs font-semibold bg-white border border-slate-205 rounded-lg overflow-hidden">
                                  <thead className="bg-slate-100 text-slate-650 text-[10.5px]">
                                    <tr>
                                      <th className="p-2.5 pl-4">款号</th>
                                      <th className="p-2.5">SKU编码 / 商品条码</th>
                                      <th className="p-2.5">商品名称</th>
                                      <th className="p-2.5">属性颜色尺码</th>
                                      <th className="p-2.5 text-right">采购单数量(PO)</th>
                                      <th className="p-2.5 text-right bg-amber-50/20">供应商发货页数</th>
                                      <th className="p-2.5 text-right bg-indigo-50/20 text-indigo-800">仓库实清实数</th>
                                      <th className="p-2.5 text-right bg-teal-50/20 text-teal-850">聚水潭系统入账</th>
                                      <th className="p-2.5 text-right bg-amber-500/10 text-amber-900">差异件数</th>
                                      {currentRole === "finance" && (
                                        <>
                                          <th className="p-2.5 text-right">采购成本单价</th>
                                          <th className="p-2.5 text-right text-emerald-800">应付金额估值</th>
                                        </>
                                      )}
                                      <th className="p-2.5 text-center">异常归因原因</th>
                                      <th className="p-2.5">拟处理结果/归宿</th>
                                      <th className="p-2.5 pr-4">操作备注</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-150">
                                    {batch.items.map(item => {
                                      const lineDiff = item.warehouse_qty - item.supplier_qty;
                                      
                                      return (
                                        <tr key={item.sku_code} className="hover:bg-slate-50/40">
                                          <td className="p-2.5 pl-4">{item.style_no}</td>
                                          <td className="p-2.5 font-mono select-all text-slate-650">{item.sku_code}</td>
                                          <td className="p-2.5 text-slate-800">{item.product_name}</td>
                                          <td className="p-2.5 text-slate-500">{item.color_size}</td>
                                          <td className="p-2.5 text-right font-mono text-slate-600">{item.po_qty} 件</td>
                                          <td className="p-2.5 text-right font-mono font-bold text-slate-600">{item.supplier_qty} 件</td>
                                          <td className="p-2.5 text-right font-mono font-bold text-indigo-700">
                                            {currentRole === "supplier_annil" || currentRole === "supplier_balabala" || batch.status === "财务已确认" ? (
                                              <span>{item.warehouse_qty} 件</span>
                                            ) : (
                                              <input
                                                type="number"
                                                min={0}
                                                className="w-16 bg-white border border-slate-300 rounded text-right py-0.5 px-1 focus:outline-none focus:border-indigo-500 font-extrabold"
                                                value={item.warehouse_qty}
                                                onChange={e => handleWarehouseQtyEdit(batch.id, item.sku_code, e.target.value)}
                                              />
                                            )}
                                          </td>
                                          <td className="p-2.5 text-right font-mono font-bold text-teal-800">{item.jst_qty} 件</td>
                                          <td className={`p-2.5 text-right font-mono font-bold ${lineDiff !== 0 ? "text-rose-600 bg-rose-50/40" : "text-slate-400"}`}>
                                            {lineDiff > 0 ? `+${lineDiff}` : lineDiff}
                                          </td>
                                          {currentRole === "finance" && (
                                            <>
                                              <td className="p-2.5 text-right font-mono">¥{item.cost_price}</td>
                                              <td className="p-2.5 text-right font-mono text-emerald-800">
                                                ¥{(item.warehouse_qty * item.cost_price).toLocaleString()}
                                              </td>
                                            </>
                                          )}
                                          
                                          {/* Discrepancy Reason */}
                                          <td className="p-2.5 text-center">
                                            {currentRole === "finance" && batch.status !== "财务已确认" ? (
                                              <select
                                                value={item.discrepancy_reason || ""}
                                                onChange={e => handleDiscrepancyReasonEdit(batch.id, item.sku_code, e.target.value)}
                                                className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-bold text-[10.5px] p-1"
                                              >
                                                <option value="">— 无 —</option>
                                                <option value="供应商少发">供应商少发</option>
                                                <option value="供应商多发">供应商多发</option>
                                                <option value="供应商清单写错">供应商清单写错</option>
                                                <option value="仓库清点错误">仓库清点错误</option>
                                                <option value="聚水潭入库录错">聚水潭入库录错</option>
                                                <option value="采购单数量与实际到货不一致">采购单与实送不符</option>
                                                <option value="其他">其他</option>
                                              </select>
                                            ) : (
                                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-100">
                                                {item.discrepancy_reason || "暂无备案"}
                                              </span>
                                            )}
                                          </td>

                                          {/* Handling Result */}
                                          <td className="p-2.5">
                                            {currentRole === "finance" && batch.status !== "财务已确认" ? (
                                              <select
                                                value={item.handling_result || ""}
                                                onChange={e => handleHandlingResultEdit(batch.id, item.sku_code, e.target.value)}
                                                className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 rounded font-bold text-[10.5px] p-1"
                                              >
                                                <option value="">— 未确定 —</option>
                                                <option value="按仓库实点数量结算">按仓库实点数量结算</option>
                                                <option value="等供应商补发">等供应商补发</option>
                                                <option value="退回多发货">退回多发货</option>
                                                <option value="修改聚水潭入库数量">修改JST实收数</option>
                                                <option value="修改供应商发货清单">修改发货清单</option>
                                                <option value="财务手动调整">财务手动调整结算</option>
                                              </select>
                                            ) : (
                                              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 block truncate max-w-[150px]" title={item.handling_result}>
                                                {item.handling_result || "等待定议"}
                                              </span>
                                            )}
                                          </td>

                                          {/* Remarks edit */}
                                          <td className="p-2.5 pr-4">
                                            {currentRole.startsWith("supplier") || batch.status === "财务已确认" ? (
                                              <span className="text-slate-450 italic text-[11px]">{item.remark || "—"}</span>
                                            ) : (
                                              <input
                                                type="text"
                                                placeholder="加入备注"
                                                className="w-full bg-slate-50 border border-slate-250 rounded py-1 px-1.5 focus:outline-none"
                                                value={item.remark || ""}
                                                onChange={e => handleItemRemarkEdit(batch.id, item.sku_code, e.target.value)}
                                              />
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>

                                {/* Small disclaimer / quick assist banner for warehouse/finance */}
                                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/60 flex items-start gap-2 text-[10.5px] text-slate-600">
                                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-indigo-900 leading-tight">💡 什么是两阶段账单结算安全模式？</p>
                                    <p className="mt-0.5 text-slate-500">
                                      不容许直接按采购承诺(PO件)一刀切结算。必须通过明细工作台将异常少发或多发分类锁定，只有【财务已确认】标记的件数才能对入最终应付款！
                                    </p>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDERING VIEW B: PO PROGRESS VIEW */}
      {activeTab === "pos" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="py-3 px-4.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-650">
              <span>📊 采购订单多期到货监视器 (父级视角 · 穿透多批送发)</span>
              <span className="text-[11px] text-red-500 font-extrabold">※ 一个采购单经常产生多次送货批，此处做累计聚类</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#f8f9fd] text-slate-400 text-[9.5px] uppercase border-b border-slate-250 select-none">
                  <tr>
                    <th className="p-3 pl-4">采购PO单号</th>
                    <th className="p-3">合作供应商</th>
                    <th className="p-3">款号</th>
                    <th className="p-3">商品名称属性</th>
                    <th className="p-3 text-right">采购总承诺(PO)</th>
                    <th className="p-3 text-right text-indigo-600">累计到货数 (∑子级)</th>
                    <th className="p-3 text-right text-rose-500 bg-rose-50/20">剩余未到货件</th>
                    <th className="p-3 text-right text-amber-600">已确认结算件数</th>
                    {currentRole === "finance" && (
                      <>
                        <th className="p-3 text-right">进项单价</th>
                        <th className="p-3 text-right">采购承诺金额</th>
                        <th className="p-3 text-right text-emerald-800">确认付款总计</th>
                      </>
                    )}
                    <th className="p-3 text-center">采购单状态</th>
                    <th className="p-3 text-right pr-6">监督操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPOs.map(po => {
                    return (
                      <React.Fragment key={po.po_no}>
                        <tr className={`hover:bg-slate-50/40 transition-colors ${expandedPoNo === po.po_no ? "bg-slate-150/40" : ""}`}>
                          <td className="p-3 pl-4 font-mono select-all text-slate-700 font-bold">{po.po_no}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800">{po.supplier_name}</span>
                          </td>
                          <td className="p-3 font-mono">{po.style_no}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{po.product_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{po.color_size}</div>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-600 font-mono">{po.po_qty} 件</td>
                          <td className="p-3 text-right font-bold text-indigo-600 font-mono">{po.delivered_qty} 件</td>
                          <td className="p-3 text-right font-bold text-rose-500 bg-rose-50/10 font-mono">
                            {po.remaining_qty} 件
                          </td>
                          <td className="p-3 text-right font-bold text-amber-600 font-mono">{po.settled_qty} 件</td>
                          {currentRole === "finance" && (
                            <>
                              <td className="p-3 text-right font-mono">¥{po.cost_price}</td>
                              <td className="p-3 text-right font-mono text-slate-650">¥{po.total_amount.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono text-emerald-800 font-black">
                                ¥{(po.settled_qty * po.cost_price).toLocaleString()}
                              </td>
                            </>
                          )}
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                              po.status === "已到齐" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                              po.status === "超量到货" ? "bg-purple-50 text-purple-700 border-purple-250" :
                              po.status === "部分到货" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              po.status === "短缺关闭" ? "bg-slate-100 text-slate-600 border-slate-300" :
                              po.status === "未到货" ? "bg-amber-50 text-amber-700 border-amber-250" :
                              "bg-slate-50 text-slate-400"
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-6 space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setExpandedPoNo(expandedPoNo === po.po_no ? null : po.po_no)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-150 border border-slate-200 rounded font-bold text-[10.5px] cursor-pointer"
                            >
                              📘 分期送货史
                            </button>

                            {/* Extra action controls for short-closing or overage selection */}
                            {currentRole === "finance" && po.status === "部分到货" && (
                              <button
                                onClick={() => handlePOShortClose(po.po_no)}
                                className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-rose-600 border border-rose-200 rounded font-black text-[10.5px]"
                              >
                                短缺关闭结案
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Collapsible Nested PO HISTORY PANEL */}
                        {expandedPoNo === po.po_no && (
                          <tr>
                            <td colSpan={currentRole === "finance" ? 14 : 11} className="p-4.5 bg-slate-100/40 border-l-4 border-indigo-500">
                              <div className="space-y-4">
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                                  <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <span>采购单 [{po.po_no}] 链路下的分批送货及财务清核历史一览</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-1 sm:mt-0">
                                    采购总量: <strong className="text-slate-800">{po.po_qty}件</strong> 
                                    | 累计实点到货: <strong className="text-slate-800">{po.delivered_qty}件</strong>
                                    {po.is_short_closed && (
                                      <span className="ml-1 bg-amber-50 text-amber-800 py-0.5 px-2 rounded-full font-bold">
                                        ⚠️ 已执行短缺关闭结案
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Overage Special Widget */}
                                {po.status === "超量到货" && (
                                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-purple-800 font-extrabold">
                                      <ShieldAlert className="w-4 h-4" />
                                      <span>发现供应商溢装/超合同发货情况！（实际到货 {po.delivered_qty} 件 ＞ 订购合同 {po.po_qty} 件）</span>
                                    </div>
                                    <p className="text-[11px] text-purple-750">
                                      超量货品可能产生积压及合同成本溢出。请采购或财务主管从政策层面裁决结算方式：
                                    </p>
                                    
                                    {currentRole === "finance" ? (
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        <button 
                                          onClick={() => handlePOOveragePolicySet(po.po_no, "accept")}
                                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${po.overage_policy === "accept" ? "bg-purple-600 text-white border-purple-500" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"}`}
                                        >
                                          ✔️ 接收超量，按实点 {po.delivered_qty} 件支付结算货款
                                        </button>
                                        <button 
                                          onClick={() => handlePOOveragePolicySet(po.po_no, "reject")}
                                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${po.overage_policy === "reject" ? "bg-purple-600 text-white border-purple-500" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"}`}
                                        >
                                          ❌ 退回多发部分，拒绝买单，仅按采购合同承诺 {po.po_qty} 件结算
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const qty = prompt("请输入协商确定的最终结算数量为：");
                                            if (qty && !isNaN(parseInt(qty))) {
                                              handlePOOveragePolicySet(po.po_no, "manual", parseInt(qty));
                                            }
                                          }}
                                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${po.overage_policy === "manual" ? "bg-purple-600 text-white border-purple-500" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"}`}
                                        >
                                          ⚙️ 财务手动介入调整，输入协商确认结转件数 (当前: {po.overage_manual_qty || "未设"})
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-[11px] font-bold text-purple-700">
                                        当前裁决状态: {po.overage_policy === "accept" ? "已同意超量按实点结算" : po.overage_policy === "reject" ? "已退回超量，仅结算合同数" : po.overage_policy === "manual" ? `手动裁结算数为: ${po.overage_manual_qty} 件` : "等待财务主管主管裁定选择结算策略"}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Delivery progression line items */}
                                <div className="space-y-2">
                                  {arrivalBatches.filter(b => b.po_no === po.po_no).map((batch, index) => {
                                    const matchingSkuItemInBatch = batch.items.find(i => i.sku_code === po.sku_code);
                                    if (!matchingSkuItemInBatch) return null;

                                    return (
                                      <div 
                                        key={batch.id}
                                        className="bg-white border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs"
                                      >
                                        <div className="flex items-center space-x-3 text-xs">
                                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold shrink-0">
                                            {index + 1}
                                          </span>
                                          <div>
                                            <div className="font-bold flex items-center gap-2">
                                              <span className="text-[#006591] font-mono">{batch.id}</span>
                                              <span className="text-slate-400">至</span>
                                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">{batch.arrival_date}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-1">
                                              批备注: {batch.remark || "正常到货承接单"}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                                          <div>
                                            <span className="text-slate-400 block text-[9.5px]">供应商送发件</span>
                                            <span className="font-bold text-slate-650 font-mono text-right block">{matchingSkuItemInBatch.supplier_qty} 件</span>
                                          </div>
                                          <div className="text-indigo-650">
                                            <span className="text-slate-400 block text-[9.5px]">仓库实点件数</span>
                                            <span className="font-bold font-mono text-indigo-750 text-right block">{matchingSkuItemInBatch.warehouse_qty} 件</span>
                                          </div>
                                          <div className="text-teal-700">
                                            <span className="text-slate-400 block text-[9.5px]">聚水潭入账件</span>
                                            <span className="font-bold font-mono text-teal-850 text-right block">{matchingSkuItemInBatch.jst_qty} 件</span>
                                          </div>
                                          <div className="text-amber-600">
                                            <span className="text-slate-400 block text-[9.5px]">财务最终结算确认数</span>
                                            <span className="font-black font-mono block text-right">
                                              {batch.status === "财务已确认" ? `${matchingSkuItemInBatch.confirmed_qty} 件` : "⚠️ 账前待确"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-400 block text-[9.5px]">批次流程状态</span>
                                            <span className={`px-1.5 py-0.2 rounded text-[10px] block font-bold ${batch.status === "财务已确认" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                              {batch.status}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {po.is_short_closed && (
                                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                                    <strong>🔒 结案决议：</strong> {po.short_closed_reason}
                                  </div>
                                )}

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE CONFIRMATION DIALOG/MODAL */}
      <AnimatePresence>
        {isFinConfirmOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border text-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4"
            >
              
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-900">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span>到货批次财务最终结算裁定</span>
                </h3>
                <button 
                  onClick={() => setIsFinConfirmOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(() => {
                const b = arrivalBatches.find(x => x.id === confirmingBatchId);
                if (!b) return null;

                const tSup = b.items.reduce((s, i) => s + i.supplier_qty, 0);
                const tWh = b.items.reduce((s, i) => s + i.warehouse_qty, 0);
                const tJst = b.items.reduce((s, i) => s + i.jst_qty, 0);
                
                return (
                  <form onSubmit={handleSubmitFinanceConfirm} className="space-y-4 text-xs">
                    
                    <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">待批款批次号</div>
                      <div className="font-mono text-sm font-black text-indigo-700">{b.id}</div>
                      <div className="text-[10px] text-slate-450 mt-1">
                        供应商: <strong>{b.supplier_name}</strong> | 关联原采购单: <strong>{b.po_no}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.2 bg-slate-50 border rounded-lg">
                        <span className="text-[10px] text-slate-450 block">原商清单数</span>
                        <span className="text-sm font-bold font-mono text-slate-700">{tSup} 件</span>
                      </div>
                      <div className="p-2.2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <span className="text-[10px] text-indigo-400 block">仓库实点数</span>
                        <span className="text-sm font-bold font-mono text-indigo-700">{tWh} 件</span>
                      </div>
                      <div className="p-2.2 bg-teal-50 border border-teal-100 rounded-lg">
                        <span className="text-[10px] text-teal-400 block">聚水潭入库</span>
                        <span className="text-sm font-bold font-mono text-teal-700">{tJst} 件</span>
                      </div>
                    </div>

                    {/* Settlement Rules choices */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-450 uppercase">可结算数量认定规则</label>
                      <div className="grid grid-cols-3 gap-2">
                        <label className={`border p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 block transition-all ${financeConfirmSettleRule === "warehouse" ? "border-amber-500 bg-amber-50/25" : ""}`}>
                          <input 
                            type="radio" 
                            name="settleRule" 
                            checked={financeConfirmSettleRule === "warehouse"}
                            onChange={() => {
                              setFinanceConfirmSettleRule("warehouse");
                              setFinanceConfirmResult("按仓库实点数量结算");
                              setFinanceCustomQty(tWh);
                            }}
                            className="mr-1.5 focus:ring-0 accent-amber-600" 
                          />
                          <span className="font-bold">以实实点结算</span>
                          <span className="block text-[9px] text-slate-400 mt-1">按仓库清点数（{tWh} 件）</span>
                        </label>

                        <label className={`border p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 block transition-all ${financeConfirmSettleRule === "jst" ? "border-amber-500 bg-amber-50/25" : ""}`}>
                          <input 
                            type="radio" 
                            name="settleRule" 
                            checked={financeConfirmSettleRule === "jst"}
                            onChange={() => {
                              setFinanceConfirmSettleRule("jst");
                              setFinanceConfirmResult("以聚水潭入库账结算");
                              setFinanceCustomQty(tJst);
                            }}
                            className="mr-1.5 focus:ring-0 accent-amber-600" 
                          />
                          <span className="font-bold">以聚水潭结算</span>
                          <span className="block text-[9px] text-slate-400 mt-1">按ERP入库数（{tJst} 件）</span>
                        </label>

                        <label className={`border p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 block transition-all ${financeConfirmSettleRule === "custom" ? "border-amber-500 bg-amber-50/25" : ""}`}>
                          <input 
                            type="radio" 
                            name="settleRule" 
                            checked={financeConfirmSettleRule === "custom"}
                            onChange={() => {
                              setFinanceConfirmSettleRule("custom");
                              setFinanceConfirmResult("财务手动特裁件数结算");
                            }}
                            className="mr-1.5 focus:ring-0 accent-amber-600" 
                          />
                          <span className="font-bold">特裁手动核准</span>
                          <span className="block text-[9px] text-slate-400 mt-1">手工指定计算件数</span>
                        </label>
                      </div>
                    </div>

                    {financeConfirmSettleRule === "custom" && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">手动认定本期总结算数量</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-50 border rounded-lg py-1.8 px-3 font-semibold"
                          value={financeCustomQty}
                          onChange={e => setFinanceCustomQty(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">裁对备注 / 补发协议</label>
                      <input 
                        type="text"
                        placeholder="例：少货部分直接作废，不补，从货款折现：款号 AN602-BL-110 少5件退款"
                        className="w-full bg-[#f8f9fc] border rounded-lg py-2 px-3 font-semibold focus:outline-none"
                        value={financeConfirmNote}
                        onChange={e => setFinanceConfirmNote(e.target.value)}
                      />
                    </div>

                    <div className="p-3.5 bg-amber-50 rounded-lg text-[10.5px] text-amber-900 border border-amber-200/80 leading-relaxed">
                      💡 <strong>应付款放行说明：</strong> 
                      一旦确认结算数量，此批货款就会正式进入可结算池，采购跟单可在 B 视图查核完成度，即可对抵生成账期应付账单，请审慎核实！
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setIsFinConfirmOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-150 text-slate-600 rounded-lg font-bold"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg shadow-sm cursor-pointer"
                      >
                        确认此批结算件数
                      </button>
                    </div>

                  </form>
                );
              })()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OPERATIONAL AUDIT TRAIL LOGS */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between mb-1 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>到货核对中心 · 实时行级修订与操作日志 trace</span>
          </span>
          <span className="text-[10px] text-slate-450 font-mono">存储在内存沙箱中</span>
        </div>

        <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-100 text-[11px] font-mono select-none">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <div className="flex items-start sm:items-center space-x-2">
                <span className="text-slate-400 shrink-0 text-[10px]">{log.timestamp}</span>
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-650 rounded text-[9.5px] font-bold">
                  {log.operator}
                </span>
                <span className="text-indigo-650 font-bold">[{log.action_type}]</span>
                <span className="text-slate-900 font-bold select-all">{log.target}</span>
              </div>
              <div className="text-right text-slate-500">
                <span className="text-slate-400">变更：</span>
                <span className="line-through text-rose-500 bg-rose-50 border border-rose-100 px-1 rounded mr-1 leading-none">{log.before}</span>
                <span className="text-slate-400">→</span>
                <span className="text-teal-600 bg-teal-50 border border-teal-100 px-1 font-bold rounded ml-1 leading-none">{log.after}</span>
                {log.reason && <span className="text-amber-700 bg-amber-50 rounded ml-2 px-1 text-[10.5px]">原因: {log.reason}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
