/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Truck, Warehouse, Search, Filter, Check, X, Plus, Clock, 
  User, Eye, Edit2, ShieldAlert, Download, FileSpreadsheet, 
  Trash2, HelpCircle, CheckCircle, AlertCircle, ChevronRight, 
  Lock, Save, FileText, ClipboardList, Paperclip, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
export interface ArrivalOrderItem {
  id: string;
  styleNo: string;
  skuCode: string;
  productName: string;
  colorSize: string;
  qty: number;
  remark: string;
  status: "正常" | "已引用" | "已作废";
}

export interface ArrivalOrder {
  id: string;
  arrivalTime: string;
  supplierName: string;
  operator: string;
  attachment: string;
  remark: string;
  supplierDeliveryNo: string;
  status: "正常" | "部分引用" | "已引用" | "已作废";
  items: ArrivalOrderItem[];
}

interface SkuMetadata {
  skuCode: string;
  styleNo: string;
  name: string;
  colorSize: string;
  supplierName: string;
}

// System SKU Database (Auto-filled on SKU entry)
const GLOBAL_SKU_DATABASE: SkuMetadata[] = [
  { skuCode: "LN-2026-CO-PINK-80", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", colorSize: "樱花粉 / 80码 (3-6月)", supplierName: "海安莱那织造有限公司" },
  { skuCode: "LN-2026-CO-PINK-90", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", colorSize: "樱花粉 / 90码 (6-12月)", supplierName: "海安莱那织造有限公司" },
  { skuCode: "LN-2026-CO-BLUE-80", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", colorSize: "天空蓝 / 80码 (3-6月)", supplierName: "海安莱那织造有限公司" },
  { skuCode: "LN-2026-CO-BLUE-95", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", colorSize: "天空蓝 / 95码 (1-2岁)", supplierName: "海安莱那织造有限公司" },
  { skuCode: "LN-2026-BL-OAT-100", styleNo: "LN-2026-BL", name: "防惊跳有机四季睡袋", colorSize: "燕麦米 / 100码 (2-3岁)", supplierName: "温岭市依依童装制品厂" },
  { skuCode: "LN-2026-BL-OAT-110", styleNo: "LN-2026-BL", name: "防惊跳有机四季睡袋", colorSize: "燕麦米 / 110码 (3-4岁)", supplierName: "温岭市依依童装制品厂" },
  { skuCode: "LN-2026-SO-MIX-S", styleNo: "LN-2026-SO", name: "松口精棉新生短袜3双装", colorSize: "三色混装 / S码 (0-1岁)", supplierName: "常熟汇豪针织加工商行" },
  { skuCode: "LN-2026-SO-MIX-M", styleNo: "LN-2026-SO", name: "松口精棉新生短袜3双装", colorSize: "三色混装 / M码 (1-2岁)", supplierName: "常熟汇豪针织加工商行" },
  { skuCode: "AN602-BL-110", styleNo: "AN-KIDS-602", name: "全棉透气儿童短袖T恤", colorSize: "天空蓝 / 110cm", supplierName: "安奈儿童装" },
  { skuCode: "BB101-OW-120", styleNo: "BB101-OW-120", name: "男童印花运动短袖", colorSize: "椰奶白 / 120cm", supplierName: "巴拉巴拉童装" },
  { skuCode: "DS501-PK-100", styleNo: "DS501-PK-100", name: "冰雪奇缘公主摆裙", colorSize: "艾莎粉 / 100cm", supplierName: "笛莎公主裙" },
  { skuCode: "DV90-BL-90", styleNo: "DV90-BL-90", name: "纯棉儿童双口袋外套", colorSize: "薄荷蓝 / 90cm", supplierName: "戴维贝拉" }
];

export default function ArrivalRegisterPage() {
  // Roles selector simulating ERP profile configs
  const [currentUserRole, setCurrentUserRole] = useState<"warehouse_staff" | "warehouse_manager" | "finance">("warehouse_manager");
  
  const currentOperatorName = useMemo(() => {
    if (currentUserRole === "warehouse_staff") return "仓库组员-小温";
    if (currentUserRole === "warehouse_manager") return "仓管主管-李国强";
    return "财务对账会计-陈姐";
  }, [currentUserRole]);

  // Tab state: "order" (到货单视图), "sku" (SKU明细视图)
  const [activeTab, setActiveTab] = useState<"order" | "sku">("order");

  // Master Detail Dataset
  const [arrivalOrders, setArrivalOrders] = useState<ArrivalOrder[]>([
    {
      id: "ARR-20260526-001",
      arrivalTime: "2026-05-26 10:15:30",
      supplierName: "安奈儿童装",
      operator: "仓库组员-小温",
      attachment: "安奈特快发货清单.pdf",
      remark: "上午送仓，随大箱附有标签",
      supplierDeliveryNo: "AN-SHIP-99812",
      status: "部分引用",
      items: [
        {
          id: "DET-20260526-101",
          styleNo: "AN-KIDS-602",
          skuCode: "AN602-BL-110",
          productName: "全棉透气儿童短袖T恤",
          colorSize: "天空蓝 / 110cm",
          qty: 20,
          remark: "第一包衣服，已按箱签清点",
          status: "已引用",
        },
        {
          id: "DET-20260526-102",
          styleNo: "AN-KIDS-602",
          skuCode: "AN602-BL-110",
          productName: "全棉透气儿童短袖T恤",
          colorSize: "天空蓝 / 110cm",
          qty: 30,
          remark: "剩余尾数，完好无损",
          status: "正常"
        }
      ]
    },
    {
      id: "ARR-20260526-002",
      arrivalTime: "2026-05-26 12:10:00",
      supplierName: "海安莱那织造有限公司",
      operator: "仓库组员-小温",
      attachment: "SHIPPING_V2_2026.xlsx",
      remark: "精梳棉连体服分尺码到货",
      supplierDeliveryNo: "HA-LN-556",
      status: "正常",
      items: [
        {
          id: "DET-20260526-501",
          styleNo: "LN-2026-CO",
          skuCode: "LN-2026-CO-PINK-80",
          productName: "臻选精梳棉连体爬服",
          colorSize: "樱花粉 / 80码 (3-6月)",
          qty: 50,
          remark: "首箱清点正常",
          status: "正常"
        },
        {
          id: "DET-20260526-502",
          styleNo: "LN-2026-CO",
          skuCode: "LN-2026-CO-PINK-90",
          productName: "臻选精梳棉连体爬服",
          colorSize: "樱花粉 / 90码 (6-12月)",
          qty: 50,
          remark: "常规登记",
          status: "正常"
        }
      ]
    },
    {
      id: "ARR-20260525-001",
      arrivalTime: "2026-05-25 14:00:10",
      supplierName: "巴拉巴拉童装",
      operator: "仓库组员-小温",
      attachment: "巴拉清单图片.png",
      remark: "正常到货交付，随大车送达",
      supplierDeliveryNo: "BB-DELIVER-4412",
      status: "正常",
      items: [
        {
          id: "DET-20260525-201",
          styleNo: "BB101-OW-120",
          skuCode: "BB101-OW-120",
          productName: "男童印花运动短袖",
          colorSize: "椰奶白 / 120cm",
          qty: 40,
          remark: "纸箱无破损，货品全新",
          status: "正常"
        }
      ]
    },
    {
      id: "ARR-20260524-001",
      arrivalTime: "2026-05-24 09:12:00",
      supplierName: "笛莎公主裙",
      operator: "仓管主管-李国强",
      attachment: "",
      remark: "溢装，原采购100实际到了110件",
      supplierDeliveryNo: "DS-202605-01",
      status: "正常",
      items: [
        {
          id: "DET-20260524-301",
          styleNo: "DS501-PK-100",
          skuCode: "DS501-PK-100",
          productName: "冰雪奇缘公主摆裙",
          colorSize: "艾莎粉 / 100cm",
          qty: 110,
          remark: "多发10条，已备注",
          status: "正常"
        }
      ]
    },
    {
      id: "ARR-20260523-001",
      arrivalTime: "2026-05-23 16:45:00",
      supplierName: "海安莱那织造有限公司",
      operator: "仓库组员-小温",
      attachment: "莱那退货清单.pdf",
      remark: "录错款式整单作废",
      supplierDeliveryNo: "HA-LN-552",
      status: "已作废",
      items: [
        {
          id: "DET-20260523-401",
          styleNo: "LN-2026-CO",
          skuCode: "LN-2026-CO-BLUE-80",
          productName: "臻选精梳棉连体爬服",
          colorSize: "天空蓝 / 80码 (3-6月)",
          qty: 15,
          remark: "测试作废处理",
          status: "已作废"
        }
      ]
    }
  ]);

  // Filters State
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterSupplier, setFilterSupplier] = useState<string>("全部");
  const [filterOperator, setFilterOperator] = useState<string>("全部");
  const [filterStatus, setFilterStatus] = useState<string>("全部");
  const [filterSearch, setFilterSearch] = useState<string>("");

  // Drawer / Modals State
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<ArrivalOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ArrivalOrder | null>(null);

  // New Order Form Local State
  const [newOrderSupplier, setNewOrderSupplier] = useState("");
  const [newOrderTime, setNewOrderTime] = useState("");
  const [newOrderDeliveryNo, setNewOrderDeliveryNo] = useState("");
  const [newOrderRemark, setNewOrderRemark] = useState("");
  const [mockAttachmentName, setMockAttachmentName] = useState("");
  const [newOrderSkus, setNewOrderSkus] = useState<Array<{ skuCode: string; qty: string; remark: string }>>([
    { skuCode: "LN-2026-CO-PINK-80", qty: "50", remark: "粉色80码" },
    { skuCode: "LN-2026-CO-PINK-90", qty: "30", remark: "" }
  ]);

  // Edit Order Form Local State (Supports nesting edits)
  const [editFormValues, setEditFormValues] = useState<{
    arrivalTime: string;
    supplierDeliveryNo: string;
    remark: string;
    attachment: string;
    items: ArrivalOrderItem[];
  } | null>(null);

  const [toast, setToast] = useState<{ text: string; type: "success" | "warning" | "info" } | null>(null);
  const showToast = (text: string, type: "success" | "warning" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper variables
  const uniqueSuppliers = useMemo(() => Array.from(new Set(GLOBAL_SKU_DATABASE.map(s => s.supplierName))), []);
  const allSuppliersInRecords = useMemo(() => Array.from(new Set(arrivalOrders.map(o => o.supplierName))), [arrivalOrders]);
  const allOperators = useMemo(() => Array.from(new Set(arrivalOrders.map(o => o.operator))), [arrivalOrders]);

  // Computed Dynamic Statistics
  const stats = useMemo(() => {
    const todayStr = "2026-05-26";
    const activeOrders = arrivalOrders.filter(o => o.status !== "已作废");
    const todayOrders = activeOrders.filter(o => o.arrivalTime.startsWith(todayStr));
    const thisMonthOrders = activeOrders.filter(o => o.arrivalTime.startsWith("2026-05"));

    // 1. 今日到货单数
    const todayOrdersCount = todayOrders.length;

    // 2. 今日到货总件数
    let todayQty = 0;
    todayOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.status !== "已作废") todayQty += it.qty;
      });
    });

    // 3. 今日到货 SKU 数
    const todaySkus = new Set<string>();
    todayOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.status !== "已作废") todaySkus.add(it.skuCode);
      });
    });

    // 4. 今日到货供应商数
    const todaySuppliers = new Set<string>(todayOrders.map(o => o.supplierName)).size;

    // 5. 本月累计到货件数
    let thisMonthQty = 0;
    thisMonthOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.status !== "已作废") thisMonthQty += it.qty;
      });
    });

    return {
      todayOrdersCount,
      todayQty,
      todaySkusCount: todaySkus.size,
      todaySuppliers,
      thisMonthQty
    };
  }, [arrivalOrders]);

  // Filter Master Order List
  const filteredArrivalOrders = useMemo(() => {
    return arrivalOrders.filter(o => {
      if (filterStartDate && o.arrivalTime.substring(0, 10) < filterStartDate) return false;
      if (filterEndDate && o.arrivalTime.substring(0, 10) > filterEndDate) return false;
      if (filterSupplier !== "全部" && o.supplierName !== filterSupplier) return false;
      if (filterOperator !== "全部" && o.operator !== filterOperator) return false;
      if (filterStatus !== "全部" && o.status !== filterStatus) return false;

      if (filterSearch.trim() !== "") {
        const q = filterSearch.toLowerCase().trim();
        const mainMatch = o.id.toLowerCase().includes(q) || 
                          o.supplierName.toLowerCase().includes(q) || 
                          o.supplierDeliveryNo.toLowerCase().includes(q) ||
                          o.remark.toLowerCase().includes(q);

        const skuMatch = o.items.some(it => 
          it.skuCode.toLowerCase().includes(q) ||
          it.styleNo.toLowerCase().includes(q) ||
          it.productName.toLowerCase().includes(q)
        );

        return mainMatch || skuMatch;
      }
      return true;
    }).sort((a, b) => b.arrivalTime.localeCompare(a.arrivalTime));
  }, [arrivalOrders, filterStartDate, filterEndDate, filterSupplier, filterOperator, filterStatus, filterSearch]);

  // Flattened SKU Detail view
  const flattenedSkuRows = useMemo(() => {
    const rows: Array<{
      orderId: string;
      arrivalTime: string;
      supplierName: string;
      operator: string;
      remark: string; // Order remark
      item: ArrivalOrderItem;
      parent: ArrivalOrder;
    }> = [];

    arrivalOrders.forEach(o => {
      o.items.forEach(it => {
        rows.push({
          orderId: o.id,
          arrivalTime: o.arrivalTime,
          supplierName: o.supplierName,
          operator: o.operator,
          remark: o.remark,
          item: it,
          parent: o
        });
      });
    });

    return rows.filter(row => {
      if (filterStartDate && row.arrivalTime.substring(0, 10) < filterStartDate) return false;
      if (filterEndDate && row.arrivalTime.substring(0, 10) > filterEndDate) return false;
      if (filterSupplier !== "全部" && row.supplierName !== filterSupplier) return false;
      if (filterOperator !== "全部" && row.operator !== filterOperator) return false;
      if (filterStatus !== "全部" && row.item.status !== filterStatus) return false;

      if (filterSearch.trim() !== "") {
        const q = filterSearch.toLowerCase().trim();
        return row.orderId.toLowerCase().includes(q) ||
               row.supplierName.toLowerCase().includes(q) ||
               row.item.skuCode.toLowerCase().includes(q) ||
               row.item.styleNo.toLowerCase().includes(q) ||
               row.item.productName.toLowerCase().includes(q) ||
               row.item.remark.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => b.arrivalTime.localeCompare(a.arrivalTime));
  }, [arrivalOrders, filterStartDate, filterEndDate, filterSupplier, filterOperator, filterStatus, filterSearch]);

  // Check permissions based on requested rules
  const checkPermission = (order: ArrivalOrder, action: "edit" | "void") => {
    if (currentUserRole === "finance") {
      return { allowed: false, reason: "财务人员仅有只读查验及对账引用权限，不可编辑/作废常规仓库事实流水。" };
    }

    // Checking if already referenced
    const isReferencedInItems = order.items.some(it => it.status === "已引用");
    const isOrderReferenced = order.status === "已引用" || order.status === "部分引用" || isReferencedInItems;

    if (isOrderReferenced) {
      return { allowed: false, reason: "该到货单已被后续财务结算/到仓账单所引用锁死，无法撤销或整体编辑。" };
    }

    if (order.status === "已作废") {
      return { allowed: false, reason: "该到货单已被作废处理，无法执行二次修改或作废。" };
    }

    if (currentUserRole === "warehouse_staff") {
      // Rule: Can edit own today's data only
      const isToday = order.arrivalTime.startsWith("2026-05-26");
      if (!isToday) {
        return { allowed: false, reason: "普通仓库员无权修改历史到货登记（非今日数据），请向仓库主管李国强申请变更。" };
      }
      if (order.operator !== "仓库组员-小温") {
        return { allowed: false, reason: "您作为普通仓管员，仅能修正或作废由您自己签名登记的单据。" };
      }
    }

    return { allowed: true, reason: "" };
  };

  // Action: Open Add Arrival Modal
  const handleOpenAddModal = () => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const d = new Date();
    const curTimeStr = `2026-05-26 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    setNewOrderSupplier(uniqueSuppliers[0] || "");
    setNewOrderTime(curTimeStr);
    setNewOrderDeliveryNo("");
    setNewOrderRemark("");
    setMockAttachmentName("");
    setNewOrderSkus([
      { skuCode: "LN-2026-CO-PINK-80", qty: "50", remark: "樱花粉 80码" },
      { skuCode: "LN-2026-BL-OAT-110", qty: "30", remark: "备货睡袋" }
    ]);
    setIsAddModalOpen(true);
  };

  // Add SKU Row in New order Form
  const addSkuRow = () => {
    setNewOrderSkus([...newOrderSkus, { skuCode: "AN602-BL-110", qty: "10", remark: "" }]);
  };

  // Remove SKU Row in New order Form
  const removeSkuRow = (index: number) => {
    if (newOrderSkus.length <= 1) {
      showToast("⚠️ 到货单必须至少包含 1 条 SKU 明细记录", "warning");
      return;
    }
    setNewOrderSkus(newOrderSkus.filter((_, i) => i !== index));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderSupplier) {
      showToast("❌ 请选择供应商", "warning");
      return;
    }

    // Validate SKU details
    const validItems: ArrivalOrderItem[] = [];
    for (let i = 0; i < newOrderSkus.length; i++) {
      const row = newOrderSkus[i];
      const trimmedSku = row.skuCode.trim();
      if (!trimmedSku) {
        showToast(`❌ 第 ${i + 1} 行 SKU 编码未填写`, "warning");
        return;
      }
      const qtyNum = parseInt(row.qty);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        showToast(`❌ 第 ${i + 1} 行件数必须大于 0`, "warning");
        return;
      }

      const meta = GLOBAL_SKU_DATABASE.find(s => s.skuCode.trim().toLowerCase() === trimmedSku.toLowerCase());
      
      const actualSkuCode = meta ? meta.skuCode : trimmedSku.toUpperCase();
      const actualStyleNo = meta ? meta.styleNo : (actualSkuCode.split('-').slice(0, 3).join('-') || actualSkuCode);
      const actualProductName = meta ? meta.name : "手工输入商品";
      const actualColorSize = meta ? meta.colorSize : "手工登记规格";

      validItems.push({
        id: `DET-20260526-${Math.floor(100+Math.random()*900)}`,
        styleNo: actualStyleNo,
        skuCode: actualSkuCode,
        productName: actualProductName,
        colorSize: actualColorSize,
        qty: qtyNum,
        remark: row.remark || "清点入库",
        status: "正常"
      });
    }

    if (validItems.length === 0) {
      showToast("❌ 请至少填写一个有效的到货款式 SKU 明细", "warning");
      return;
    }

    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const orderId = `ARR-20260526-${pad(d.getHours())}${pad(d.getMinutes())}-${Math.floor(10 + Math.random()*90)}`;

    const newOrder: ArrivalOrder = {
      id: orderId,
      arrivalTime: newOrderTime,
      supplierName: newOrderSupplier,
      operator: currentOperatorName,
      attachment: mockAttachmentName,
      remark: newOrderRemark || "常规到仓卸货签收",
      supplierDeliveryNo: newOrderDeliveryNo || `DEL-${d.getTime().toString().slice(-4)}`,
      status: "正常",
      items: validItems
    };

    setArrivalOrders(prev => [newOrder, ...prev]);
    setIsAddModalOpen(false);
    showToast(`🟢 成功注册新入库单：${orderId}，已记录 ${validItems.length} 款 SKU 实点数据。`);
  };

  // Open Edit Order Modal
  const handleOpenEditModal = (order: ArrivalOrder) => {
    const perm = checkPermission(order, "edit");
    if (!perm.allowed) {
      alert(`权限拦截：\n${perm.reason}`);
      return;
    }

    // deep copy items list to modify on edit modal local states
    setEditingOrder(order);
    setEditFormValues({
      arrivalTime: order.arrivalTime,
      supplierDeliveryNo: order.supplierDeliveryNo,
      remark: order.remark,
      attachment: order.attachment,
      items: order.items.map(it => ({ ...it }))
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !editFormValues) return;

    // Valid check qty
    for (let i = 0; i < editFormValues.items.length; i++) {
      const it = editFormValues.items[i];
      if (it.qty <= 0) {
        showToast("❌ 登记 SKU 件数必须大于 0", "warning");
        return;
      }
    }

    setArrivalOrders(prev => prev.map(o => {
      if (o.id === editingOrder.id) {
        // Recalculating totals if needed
        return {
          ...o,
          arrivalTime: editFormValues.arrivalTime,
          supplierDeliveryNo: editFormValues.supplierDeliveryNo,
          remark: editFormValues.remark,
          attachment: editFormValues.attachment,
          items: editFormValues.items
        };
      }
      return o;
    }));

    setEditingOrder(null);
    setEditFormValues(null);
    showToast("💾 到货单修改已保存！");
  };

  // Void Whole Order
  const handleVoidOrder = (order: ArrivalOrder) => {
    const perm = checkPermission(order, "void");
    if (!perm.allowed) {
      alert(`作废被拦截：\n${perm.reason}`);
      return;
    }

    const confirmVoid = window.confirm(`⚠️ 请确认：您即将会将到货单 [${order.id}] 及其旗下所有明细款式整单作废！\n作废后财务不可对账核算。是否继续？`);
    if (!confirmVoid) return;

    setArrivalOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: "已作废",
          items: o.items.map(it => ({ ...it, status: "已作废" as const }))
        };
      }
      return o;
    }));

    showToast(`🚫 到货单 ${order.id} 已完成作废归档。`, "warning");
  };

  // Export CSV Excel
  const handleExportCSV = () => {
    const headers = ["到货单号", "到货时间", "供应商", "供应商发货单号", "款数", "明细款式-SKU", "产品名称", "数量", "登记人", "单备注", "状态"];
    const rows: string[][] = [];

    arrivalOrders.forEach(o => {
      o.items.forEach(it => {
        rows.push([
          o.id,
          o.arrivalTime,
          o.supplierName,
          o.supplierDeliveryNo,
          String(o.items.length),
          it.skuCode,
          it.productName,
          String(it.qty),
          o.operator,
          o.remark || "",
          o.status
        ]);
      });
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `到货登记清单_导出_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    showToast("📊 复合主从到货流水报表已导出为 CSV 下载！");
  };

  // Finance Toggle Citations mock trigger
  const handleFinanceToggleCitation = (orderId: string, itemId: string) => {
    setArrivalOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const nextItems = o.items.map(it => {
          if (it.id === itemId) {
            const nextStatus = it.status === "已引用" ? "正常" as const : "已引用" as const;
            return { ...it, status: nextStatus };
          }
          return it;
        });

        // Determine parent status based on children citations
        const allItemsCount = nextItems.length;
        const citedCount = nextItems.filter(it => it.status === "已引用").length;
        let nextOrderStatus = o.status;
        if (o.status !== "已作废") {
          if (citedCount === 0) nextOrderStatus = "正常";
          else if (citedCount === allItemsCount) nextOrderStatus = "已引用";
          else nextOrderStatus = "部分引用";
        }

        return { ...o, status: nextOrderStatus, items: nextItems };
      }
      return o;
    }));

    // Re-sync parent order details in drawer if open
    setTimeout(() => {
      setArrivalOrders(current => {
        const matching = current.find(x => x.id === orderId);
        if (matching) setSelectedDetailOrder(matching);
        return current;
      });
    }, 50);

    showToast("🔗 财务引用状态已模拟改变并触底连锁反应！");
  };

  return (
    <div className="space-y-5 select-text text-slate-800 font-sans w-full pb-10">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[999] px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold font-mono flex items-center space-x-2 ${
              toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
              toast.type === "warning" ? "bg-rose-50 border-rose-200 text-rose-800" :
              "bg-sky-50 border-sky-200 text-sky-800"
            }`}
          >
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Subtitles */}
      <div className="bg-[#00263e] text-white p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white">到货登记台账</h1>
              <span className="px-2 py-0.5 bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 rounded text-[9px] font-bold font-mono">
                仓库专版
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              记录供应商每次到仓事实，点开到货单查看本次到仓的 SKU 明细；仓库不填写任何成本和金额等财务脱敏字段。
            </p>
          </div>

          {/* Interactive Role Switcher to Demonstrate App Rules */}
          <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-700 font-semibold self-start lg:self-center">
            <span className="text-[10px] text-slate-400 block px-2 mb-1 uppercase tracking-wider">
              🎭 模拟演示角色切换（校验细分规则）：
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole("warehouse_staff");
                  showToast("🧑‍💻 已切换至：仓库组员小温 视角", "info");
                }}
                className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                  currentUserRole === "warehouse_staff" 
                    ? "bg-sky-600 text-white font-extrabold shadow-sm" 
                    : "text-slate-350 hover:text-white"
                }`}
              >
                仓管员(小温)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole("warehouse_manager");
                  showToast("👑 已切换至：仓库主管 完整权限", "info");
                }}
                className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                  currentUserRole === "warehouse_manager" 
                    ? "bg-[#006591] text-white font-extrabold shadow-sm" 
                    : "text-slate-350 hover:text-white"
                }`}
              >
                仓管主管
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole("finance");
                  showToast("🧾 已切换至：财务审计/结算 视角", "info");
                }}
                className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                  currentUserRole === "finance" 
                    ? "bg-indigo-600 text-white font-extrabold shadow-sm" 
                    : "text-slate-350 hover:text-white"
                }`}
              >
                财务审计
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS - ADJUSTED PER SPECIFICATIONS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 select-none font-semibold">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">今日到货单数</span>
            <span className="text-xl font-extrabold text-[#006591] tracking-tight block">
              {stats.todayOrdersCount} 单
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">正常归仓送货计数</span>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg shrink-0">
            <Warehouse className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">今日到货总件数</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
              {stats.todayQty} 件
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">到货物理件数统计</span>
          </div>
          <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
            <Truck className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">今日到货 SKU 数</span>
            <span className="text-xl font-extrabold text-indigo-600 tracking-tight block">
              {stats.todaySkusCount} 种
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">独立条码件拆配</span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <ClipboardList className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">今日到货供应商数</span>
            <span className="text-xl font-extrabold text-amber-600 tracking-tight block">
              {stats.todaySuppliers} 家
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">分摊到仓送货量</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
             <User className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm col-span-2 md:col-span-1 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">本月累计到货件数</span>
            <span className="text-xl font-extrabold text-emerald-600 tracking-tight block">
              {stats.thisMonthQty} 件
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">五月累计到货量</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 font-semibold">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[11px]">
          <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>过滤/检索到货记录</span>
          </span>
          <button 
            type="button"
            onClick={() => {
              setFilterStartDate("");
              setFilterEndDate("");
              setFilterSupplier("全部");
              setFilterOperator("全部");
              setFilterStatus("全部");
              setFilterSearch("");
              showToast("🧼 已清空重置全部过滤条件", "info");
            }}
            className="text-xs text-[#006591] hover:underline hover:text-[#004e6f]"
          >
            重置清空条件
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">开始到货日期</label>
            <input 
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-1.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">结束到货日期</label>
            <input 
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-1.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">合作供应商</label>
            <select
              value={filterSupplier}
              onChange={e => setFilterSupplier(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="全部">全部合作商</option>
              {allSuppliersInRecords.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">录单人员</label>
            <select
              value={filterOperator}
              onChange={e => setFilterOperator(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="全部">全部登记录</option>
              {allOperators.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">单据状态</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="全部">全部状态</option>
              <option value="正常">正常</option>
              <option value="部分引用">部分引用</option>
              <option value="已引用">已引用</option>
              <option value="已作废">已作废</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="键入款号、SKU、商品名、单号等，即使是单视图也将匹配明细..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl text-xs py-2 pl-9 pr-4 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
            <button 
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>导出 XLS/CSV 报单</span>
            </button>
            <button 
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-1.5 bg-[#006591] hover:bg-[#005175] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-sm transition-transform active:scale-97"
            >
              <Plus className="w-4 h-4" />
              <span>新增到货登记</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW SELECTION HEADERS & DATA LISTINGS */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        
        {/* VIEW SEGMENT SELECTOR TAB BAR */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 p-2 justify-between items-center text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("order")}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "order" 
                  ? "bg-white text-[#006591] shadow-2xs border border-slate-200" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
              }`}
            >
              📋 到货单视图 (Master View)
            </button>
            <button
              onClick={() => setActiveTab("sku")}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "sku" 
                  ? "bg-white text-[#006591] shadow-2xs border border-slate-200" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
              }`}
            >
              🔍 SKU明细视图 (SKU Query)
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline-block">
            {activeTab === "order" ? `共有 ${filteredArrivalOrders.length} 条到堆单据记录` : `共有 ${flattenedSkuRows.length} 条 SKU 详单流水`}
          </span>
        </div>

        {/* DATA GRID CHANGER */}
        <div className="overflow-x-auto select-text font-semibold">
          {activeTab === "order" ? (
            /* ---- VIEW 1: ARRIVAL ORDER VIEW (到货单视图) ---- */
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-450 text-[10px] uppercase border-b border-slate-100 select-none">
                <tr>
                  <th className="p-3 pl-4">到货单号</th>
                  <th className="p-3">到货时间</th>
                  <th className="p-3">供应商</th>
                  <th className="p-3 text-center">款式款数</th>
                  <th className="p-3 text-center">SKU条码数</th>
                  <th className="p-3 text-center">到货总件数</th>
                  <th className="p-3">登记人</th>
                  <th className="p-3">发货附件</th>
                  <th className="p-3">备注说明</th>
                  <th className="p-3">单据状态</th>
                  <th className="p-3 text-center pr-4">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {filteredArrivalOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-10 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                      <p>未检索到相对应的到仓送货主单表单。</p>
                    </td>
                  </tr>
                ) : (
                  filteredArrivalOrders.map(order => {
                    const isVoided = order.status === "已作废";
                    const stylesCount = Array.from(new Set(order.items.map(it => it.styleNo))).length;
                    const skusCount = order.items.length;
                    const totalQty = order.items.reduce((sum, it) => sum + it.qty, 0);

                    return (
                      <tr 
                        key={order.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isVoided ? "opacity-55 bg-slate-50/30" : ""
                        }`}
                      >
                        <td className="p-2.5 pl-4 font-mono font-bold text-[#006591]">
                          <div className="space-y-0.5">
                            <span>{order.id}</span>
                            {order.supplierDeliveryNo && (
                              <span className="block text-[9px] text-slate-400 font-medium font-sans">
                                货单号: {order.supplierDeliveryNo}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {order.arrivalTime}
                        </td>
                        <td className="p-2.5 max-w-[130px] truncate" title={order.supplierName}>
                          {order.supplierName}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          {stylesCount} 款
                        </td>
                        <td className="p-2.5 text-center font-mono text-indigo-650 font-bold">
                          {skusCount} 种
                        </td>
                        <td className="p-2.5 text-center font-mono font-black text-slate-900">
                          {totalQty} 件
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                          {order.operator}
                        </td>
                        <td className="p-2.5 font-mono text-[11px]">
                          {order.attachment ? (
                            <span 
                              className="inline-flex items-center space-x-1 text-[#006591] hover:underline cursor-pointer"
                              onClick={() => alert(`模拟下载/加载附件: ${order.attachment}`)}
                            >
                              <Paperclip className="w-3 h-3 text-sky-600" />
                              <span className="max-w-[70px] truncate block">{order.attachment}</span>
                            </span>
                          ) : (
                            <span className="text-slate-350">—</span>
                          )}
                        </td>
                        <td className="p-2.5 max-w-[150px] truncate text-slate-500 text-[11px]" title={order.remark}>
                          {order.remark || "—"}
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.status === "正常" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                            order.status === "部分引用" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            order.status === "已引用" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            "bg-rose-50 text-rose-700 border border-rose-250 line-through"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap pr-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedDetailOrder(order)}
                              className="px-2 py-1 bg-[#1890ff]/5 hover:bg-[#1890ff]/15 text-[#1890ff] rounded font-bold cursor-pointer transition-colors"
                            >
                              查看
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(order)}
                              disabled={currentUserRole === "finance" || order.status === "已作废"}
                              className={`p-1.5 rounded transition-colors ${
                                currentUserRole === "finance" || order.status === "已作废"
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                              }`}
                              title="编辑到货单"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleVoidOrder(order)}
                              disabled={currentUserRole === "finance" || order.status === "已作废"}
                              className={`p-1.5 rounded transition-colors ${
                                currentUserRole === "finance" || order.status === "已作废"
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                              }`}
                              title="作废该到货凭单"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* ---- VIEW 2: SKU DETAIL VIEW (SKU明细视图) ---- */
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-450 text-[10px] uppercase border-b border-slate-100 select-none">
                <tr>
                  <th className="p-3 pl-4">到货时间</th>
                  <th className="p-3">关联到货单号</th>
                  <th className="p-3">供应商</th>
                  <th className="p-3">款号</th>
                  <th className="p-3">SKU 编码</th>
                  <th className="p-3">商品名称规格</th>
                  <th className="p-3 text-right">及到货件数</th>
                  <th className="p-3">登记人</th>
                  <th className="p-3">明细备注</th>
                  <th className="p-3">明细状态</th>
                  <th className="p-3 text-center pr-4">反查母单</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {flattenedSkuRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-10 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                      <p>未能寻找到契合该筛选范围的到仓 SKU 条目细单。</p>
                    </td>
                  </tr>
                ) : (
                  flattenedSkuRows.map(row => {
                    const isVoided = row.item.status === "已作废";
                    return (
                      <tr 
                        key={row.item.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isVoided ? "opacity-55 bg-slate-50/30" : ""
                        }`}
                      >
                        <td className="p-2.5 pl-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {row.arrivalTime}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#006591]">
                          {row.orderId}
                        </td>
                        <td className="p-2.5 truncate max-w-[130px]" title={row.supplierName}>
                          {row.supplierName}
                        </td>
                        <td className="p-2.5 font-mono">{row.item.styleNo}</td>
                        <td className="p-2.5 font-mono font-bold text-indigo-750">{row.item.skuCode}</td>
                        <td className="p-2.5 max-w-[180px]">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block truncate" title={row.item.productName}>
                              {row.item.productName}
                            </span>
                            <span className="text-[10px] text-slate-440 font-mono block">{row.item.colorSize}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-black text-slate-900">
                          {row.item.qty} 件
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-550">{row.operator}</td>
                        <td className="p-2.5 text-[11px] max-w-[120px] truncate text-slate-500" title={row.item.remark}>
                          {row.item.remark || "—"}
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            row.item.status === "正常" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                            row.item.status === "已引用" ? "bg-emerald-50 text-emerald-700 border border-emerald-250 animate-pulse" :
                            "bg-rose-50 text-rose-700 border border-rose-250 line-through"
                          }`}>
                            {row.item.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center pr-4">
                          <button
                            onClick={() => setSelectedDetailOrder(row.parent)}
                            className="px-2 py-0.5 text-[11px] border border-slate-200 hover:border-[#006591] hover:text-[#006591] text-slate-600 rounded cursor-pointer font-bold shrink-0"
                          >
                            查阅主排
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* SUMMARY STATISTICS */}
        <div className="bg-slate-50 py-3 px-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between text-[11px] text-slate-500 gap-2 font-mono">
          <span>
            💡 到仓审计核查：当前可见合算累加到仓件总数：
            <strong className="text-[#006591] font-extrabold">
              {activeTab === "order" 
                ? filteredArrivalOrders.filter(o => o.status !== "已作废").reduce((sum, o) => sum + o.items.reduce((s, it) => it.status !== "已作废" ? s + it.qty : s, 0), 0)
                : flattenedSkuRows.filter(r => r.item.status !== "已作废").reduce((sum, r) => sum + r.item.qty, 0)
              } 件
            </strong>
          </span>
          <span>账务交接地一律脱敏，本页不涉及采购底价、分录金额及账单付款值。</span>
        </div>
      </div>

      {/* DETAILED SIDE SHEET / DRAWER (查看明细) */}
      <AnimatePresence>
        {selectedDetailOrder && (
          <div className="fixed inset-0 z-[120] flex justify-end select-text">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedDetailOrder(null)}
            />
            {/* Sheet Core */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden text-xs"
            >
              {/* Header */}
              <div className="p-4 bg-[#00263e] text-white flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5 text-sky-400" />
                  <div>
                    <h3 className="text-sm font-extrabold">到货登记凭证看板</h3>
                    <span className="text-[10px] text-slate-440 font-mono block">订单识别号: {selectedDetailOrder.id}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDetailOrder(null)}
                  className="p-1 bg-white/10 hover:bg-white/20 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-5 space-y-5 font-semibold">
                
                {/* Visual Status Indicator */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-440 block mb-0.5 uppercase">到仓对账状态</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold leading-normal ${
                      selectedDetailOrder.status === "正常" ? "bg-sky-50 text-sky-700 border border-sky-150 animate-pulse" :
                      selectedDetailOrder.status === "部分引用" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      selectedDetailOrder.status === "已引用" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                      "bg-rose-50 text-rose-700 border border-rose-200 line-through"
                    }`}>
                      {selectedDetailOrder.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-440 block mb-0.5 uppercase">实收供应商</span>
                    <span className="text-xs font-black block text-slate-900 truncate">{selectedDetailOrder.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-440 block mb-0.5">到仓登记时间</span>
                    <span className="text-xs font-mono block text-slate-650">{selectedDetailOrder.arrivalTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-440 block mb-0.5">实数录入签章</span>
                    <span className="text-xs font-mono block text-indigo-650">{selectedDetailOrder.operator}</span>
                  </div>
                </div>

                {/* Additional Metas */}
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-[9px] mb-0.5">随箱发货快递单号</span>
                      <span className="font-mono font-black text-slate-800">{selectedDetailOrder.supplierDeliveryNo || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] mb-0.5">到货电子佐证附件</span>
                      {selectedDetailOrder.attachment ? (
                        <button
                          onClick={() => alert(`模拟下载：${selectedDetailOrder.attachment}`)}
                          className="text-[#006591] font-bold hover:underline cursor-pointer flex items-center gap-0.5 text-xs text-left"
                        >
                          <Paperclip className="w-3 h-3 font-bold text-[#006591]" />
                          <span>{selectedDetailOrder.attachment}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">未随单上传物理单扫描件</span>
                      )}
                    </div>
                    <div className="col-span-2 bg-slate-150/40 p-2.5 rounded-lg border border-slate-200/40">
                      <span className="text-slate-450 block text-[9px] mb-0.5">仓库签收说明备注</span>
                      <p className="text-slate-700 leading-normal font-medium">{selectedDetailOrder.remark || "（空说明）"}</p>
                    </div>
                  </div>
                </div>

                {/* SKU DETAIL GRID IN DRAWER */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      📦 该单到货包含的 SKU 实点明细表
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      合计: {selectedDetailOrder.items.reduce((s, x) => x.status !== "已作废" ? s + x.qty : s, 0)} 件
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8f9fc] text-[10px] text-slate-440 font-bold border-b border-slate-150 select-none">
                        <tr>
                          <th className="p-2 pl-3">款式款号</th>
                          <th className="p-2">商品条码与名称</th>
                          <th className="p-2 text-right">件数</th>
                          <th className="p-2">备注</th>
                          <th className="p-2">引用状态</th>
                          {currentUserRole === "finance" && <th className="p-2 text-center">模拟干预</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDetailOrder.items.map(it => {
                          const isItemVoid = it.status === "已作废";
                          return (
                            <tr key={it.id} className={isItemVoid ? "opacity-45 bg-slate-50" : "hover:bg-slate-50/50"}>
                              <td className="p-2 pl-3 font-mono text-[11px] font-medium text-slate-600">
                                {it.styleNo}
                              </td>
                              <td className="p-2">
                                <span className="font-bold text-slate-900 block font-mono">{it.skuCode}</span>
                                <span className="text-[10px] text-slate-500 font-sans block">{it.productName} ({it.colorSize})</span>
                              </td>
                              <td className="p-2 text-right font-mono font-extrabold text-slate-900 text-[12px]">
                                {it.qty} 件
                              </td>
                              <td className="p-2 text-slate-500 text-[10px] font-sans">
                                {it.remark || "—"}
                              </td>
                              <td className="p-2">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  it.status === "正常" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                                  it.status === "已引用" ? "bg-emerald-50 text-emerald-700 border border-emerald-250 animate-pulse" :
                                  "bg-rose-50 text-rose-700 border border-rose-250 line-through"
                                }`}>
                                  {it.status}
                                </span>
                              </td>
                              {currentUserRole === "finance" && (
                                <td className="p-2 text-center">
                                  {isItemVoid ? (
                                    <span className="text-[10px] text-slate-450">-</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleFinanceToggleCitation(selectedDetailOrder.id, it.id)}
                                      className={`px-1.5 py-0.5 text-[9px] rounded font-bold cursor-pointer transition-colors ${
                                        it.status === "已引用"
                                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      }`}
                                    >
                                      {it.status === "已引用" ? "解引用" : "引用"}
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {currentUserRole === "finance" && (
                    <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 space-y-1">
                      <h5 className="font-bold text-[11px] text-indigo-950 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                        <span>财务权限交互演示：</span>
                      </h5>
                      <p className="text-[10px] leading-relaxed">
                        您当前处于 <strong>财务角色</strong>。在此详情侧拉框中，您可以点击模拟右侧款案明细上的【引用】或【解引用】操作，这将促使其在供应商结算页锁定，阻断仓库人员再次更正。
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedDetailOrder(null)}
                  className="px-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  关闭
                </button>
                {currentUserRole !== "finance" && selectedDetailOrder.status === "正常" && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const target = selectedDetailOrder;
                        setSelectedDetailOrder(null);
                        handleOpenEditModal(target);
                      }}
                      className="px-4 py-1.5 border border-[#006591] text-[#006591] hover:bg-slate-100 font-bold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      编辑单据
                    </button>
                    <button
                      onClick={() => {
                        const target = selectedDetailOrder;
                        setSelectedDetailOrder(null);
                        handleVoidOrder(target);
                      }}
                      className="px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold rounded-lg cursor-pointer"
                    >
                      作废此单
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 1: CREATION ARRIVAL ORDER (新增到货登记 - 主从) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[120] overflow-hidden select-text">
            <div onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-transparent animate-fade-in" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl text-xs flex flex-col h-full overflow-hidden"
            >
              <div className="p-4 bg-[#006591] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <Warehouse className="w-4.5 h-4.5 text-sky-400" />
                  <span className="text-xs font-black tracking-wide">手工新增供应商到货登记单</span>
                </div>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/10 rounded cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="flex-grow flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 space-y-4 font-semibold">
                
                {/* Upper fields */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                  <span className="text-[9px] text-slate-450 uppercase block tracking-wider font-extrabold">I. 到货主单基本要案信息</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">供应商归属 <span className="text-rose-500">*</span></label>
                      <select
                        value={newOrderSupplier}
                        onChange={e => setNewOrderSupplier(e.target.value)}
                        className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none"
                      >
                        {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">到货登记时间 <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newOrderTime}
                        onChange={e => setNewOrderTime(e.target.value)}
                        className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">供应商发货快递单号 (可选)</label>
                      <input
                        type="text"
                        placeholder="例：顺丰 SF14529329"
                        value={newOrderDeliveryNo}
                        onChange={e => setNewOrderDeliveryNo(e.target.value)}
                        className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">发货清单证明附件 (可选)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="例：收货现场小票.jpg"
                          value={mockAttachmentName}
                          onChange={e => setMockAttachmentName(e.target.value)}
                          className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => setMockAttachmentName("到货现场拍照清单_526.png")}
                          className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold shrink-0 transition-colors"
                        >
                          随机单证
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">仓库清点备注说明 (可选)</label>
                    <textarea
                      rows={1.5}
                      placeholder="如：外箱包装完好。本次收货已当面实点录入客观事实。"
                      value={newOrderRemark}
                      onChange={e => setNewOrderRemark(e.target.value)}
                      className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none"
                    />
                  </div>
                  
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>系统签名人：<strong className="text-indigo-650">{currentOperatorName}</strong></span>
                    <span>状态：新注册 / 准备落库</span>
                  </div>
                </div>

                {/* Lower SKU details Table Row editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-450 uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <span>II. SKU 物理清点细目清单</span>
                      <span className="text-[9px] lowercase text-[#006591] font-mono font-medium">(支持随时增加明细款式)</span>
                    </span>
                    <button
                      type="button"
                      onClick={addSkuRow}
                      className="px-2.5 py-1 bg-sky-50 text-[#006591] border border-sky-200 hover:bg-sky-100 rounded font-bold cursor-pointer transition-colors"
                    >
                      ➕ 增添款式明细行
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] text-slate-400 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-2 text-center w-10">序号</th>
                          <th className="p-2">挑选 SKU 编码 (必填)</th>
                          <th className="p-2 w-28 text-center">件数 (必须&gt;0)</th>
                          <th className="p-2">明细备注描述</th>
                          <th className="p-2 text-center w-12">删除</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white bg-opacity-100">
                        {newOrderSkus.map((skuRow, rIdx) => {
                          const matchedMeta = GLOBAL_SKU_DATABASE.find(
                            x => x.skuCode.trim().toLowerCase() === skuRow.skuCode.trim().toLowerCase()
                          );

                          return (
                            <tr key={rIdx} className="hover:bg-slate-50/50">
                              <td className="p-2 text-center font-mono text-slate-450 font-bold">{rIdx + 1}</td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  placeholder="请输入或复制 SKU 编码，例: BB101-OW-120"
                                  value={skuRow.skuCode}
                                  onChange={e => {
                                    setNewOrderSkus(prev => prev.map((item, pi) => {
                                      if (pi === rIdx) {
                                        return { ...item, skuCode: e.target.value };
                                      }
                                      return item;
                                    }));
                                  }}
                                  className="w-full bg-white border border-slate-220 rounded px-2 py-1 font-mono text-[11px] uppercase tracking-wide focus:border-[#006591] focus:outline-none"
                                />
                                {matchedMeta ? (
                                  <span className="block text-[9.5px] text-emerald-600 font-bold leading-tight mt-0.5 max-w-[280px] truncate">
                                    ✓ 已匹配系统 SKU: {matchedMeta.name} ({matchedMeta.colorSize})
                                  </span>
                                ) : (
                                  skuRow.skuCode.trim() !== "" && (
                                    <span className="block text-[9.5px] text-amber-600 leading-tight mt-0.5 max-w-[280px] truncate">
                                      ⚠️ 自定义款式 (将登记到临采及散货明细)
                                    </span>
                                  )
                                )}
                              </td>
                              <td className="p-1 text-center">
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  placeholder="件数"
                                  value={skuRow.qty}
                                  onChange={e => {
                                    setNewOrderSkus(prev => prev.map((item, pi) => {
                                      if (pi === rIdx) {
                                        return { ...item, qty: e.target.value };
                                      }
                                      return item;
                                    }));
                                  }}
                                  className="w-20 border border-slate-220 rounded px-1.5 py-1 text-center font-mono font-bold"
                                />
                              </td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  placeholder="备注说明，如溢装"
                                  value={skuRow.remark}
                                  onChange={e => {
                                    setNewOrderSkus(prev => prev.map((item, pi) => {
                                      if (pi === rIdx) {
                                        return { ...item, remark: e.target.value };
                                      }
                                      return item;
                                    }));
                                  }}
                                  className="w-full border border-slate-220 rounded px-1.5 py-1 text-slate-700"
                                />
                              </td>
                              <td className="p-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeSkuRow(rIdx)}
                                  className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                  title="移除此行"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-220 bg-white text-slate-650 hover:bg-slate-50 font-bold rounded-lg cursor-pointer transition-colors font-sans"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#006591] hover:bg-[#005175] text-white font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 font-sans"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>入仓核实登记</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2: EDIT ARRIVAL ORDER (编辑到货登记 - 关联编辑) */}
      <AnimatePresence>
        {editingOrder && editFormValues && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[120] overflow-hidden select-text">
            <div onClick={() => { setEditingOrder(null); setEditFormValues(null); }} className="absolute inset-0 bg-transparent animate-fade-in" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl text-xs flex flex-col h-full overflow-hidden"
            >
              <div className="p-4 bg-[#00263e] text-white flex items-center justify-between shrink-0">
                <span className="font-black tracking-wide text-xs">更正到货登记凭单 #{editingOrder.id} ✍️</span>
                <button type="button" onClick={() => { setEditingOrder(null); setEditFormValues(null); }} className="p-1 hover:bg-white/10 rounded cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex-grow flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 space-y-4 font-semibold">
                
                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">供应商来源（归整不可变）</label>
                      <input
                        type="text"
                        disabled
                        value={editingOrder.supplierName}
                        className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-1.5 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">到货登记时间 <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={editFormValues.arrivalTime}
                        onChange={e => setEditFormValues({ ...editFormValues, arrivalTime: e.target.value })}
                        className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">随车发货快递单号</label>
                      <input
                        type="text"
                        value={editFormValues.supplierDeliveryNo}
                        onChange={e => setEditFormValues({ ...editFormValues, supplierDeliveryNo: e.target.value })}
                        className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">单据附件证明名</label>
                      <input
                        type="text"
                        value={editFormValues.attachment}
                        onChange={e => setEditFormValues({ ...editFormValues, attachment: e.target.value })}
                        className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">仓库签收备注修改</label>
                    <textarea
                      rows={1.5}
                      value={editFormValues.remark}
                      onChange={e => setEditFormValues({ ...editFormValues, remark: e.target.value })}
                      className="w-full bg-white border border-slate-220 rounded-lg p-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Nesting Item Edit */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-extrabold">
                    🔒 SKU 实点数量编辑
                  </span>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-[#f8f9fc] text-[10px] text-slate-400 border-b border-slate-150">
                        <tr>
                          <th className="p-2 pl-3">款号款式</th>
                          <th className="p-2">SKU 属性条码与名称</th>
                          <th className="p-2 text-center w-28">到货件数 (必填)</th>
                          <th className="p-2">明细备注描述</th>
                          <th className="p-2 text-center w-20">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {editFormValues.items.map((it, rIdx) => {
                          const isCitied = it.status === "已引用";
                          const isVoided = it.status === "已作废";

                          return (
                            <tr key={it.id} className={isVoided ? "opacity-45 bg-slate-50" : "hover:bg-slate-50/50"}>
                              <td className="p-2 pl-3 font-mono text-slate-500">{it.styleNo}</td>
                              <td className="p-2 font-mono">
                                <span className="font-bold text-slate-900 block">{it.skuCode}</span>
                                <span className="text-[9.5px] text-slate-400 block max-w-[200px] truncate">{it.productName}</span>
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  required
                                  disabled={isCitied || isVoided}
                                  min="1"
                                  value={it.qty}
                                  onChange={e => {
                                    const nextItems = [...editFormValues.items];
                                    nextItems[rIdx] = { ...nextItems[rIdx], qty: parseInt(e.target.value) || 0 };
                                    setEditFormValues({ ...editFormValues, items: nextItems });
                                  }}
                                  className={`w-20 border border-slate-200 rounded p-1 text-center font-mono font-bold ${
                                    isCitied || isVoided 
                                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                      : "bg-white hover:border-slate-350 focus:outline-[#006591]"
                                  }`}
                                />
                              </td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  disabled={isVoided}
                                  value={it.remark}
                                  onChange={e => {
                                    const nextItems = [...editFormValues.items];
                                    nextItems[rIdx] = { ...nextItems[rIdx], remark: e.target.value };
                                    setEditFormValues({ ...editFormValues, items: nextItems });
                                  }}
                                  className="w-full border border-slate-200 rounded p-1"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  it.status === "已引用" ? "bg-emerald-50 text-emerald-800 border border-emerald-150" :
                                  it.status === "已作废" ? "bg-rose-50 text-rose-700 line-through" :
                                  "bg-sky-50 text-sky-800"
                                }`}>
                                  {it.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-slate-400 select-none">
                     💡 提示：如果登记错误，后续应通过作废整个物理单或在账单财务引用时折抵扣减，已引用的款型无法更改数量。
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setEditingOrder(null); setEditFormValues(null); }}
                    className="px-4 py-2 border border-slate-220 bg-white hover:bg-slate-50 font-bold rounded-lg cursor-pointer transition-colors font-sans"
                  >
                    取消放弃
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00263e] hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer shadow-xs transition-colors font-sans"
                  >
                    核销保存
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
