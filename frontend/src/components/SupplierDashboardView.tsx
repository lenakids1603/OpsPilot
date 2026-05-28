/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  FileText, X, Search, ArrowRight, Package, Truck, 
  DollarSign, ShieldAlert, Award, AlertTriangle, 
  ArrowUpRight, HelpCircle, Calendar, ShoppingCart, 
  Warehouse, Clock, Filter, Download, Eye, AlertCircle, 
  CheckCircle, Info, PhoneCall, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SubSKU {
  sku: string;
  styleNo: string;
  colorName: string;
  sizeName: string;
  cost: number;
  status: "生产中" | "待质检" | "已结案";
  colorHex: string;
}

interface SupplierDashboardViewProps {
  skus: SubSKU[];
  setActiveTab: (tab: string) => void;
  showToast: (msg: string) => void;
  setSelectedSku?: (sku: string | null) => void;
  setModalType?: (type: "quote" | "bill" | "detail" | null) => void;
  weeklyComplaintsCount?: number;
}

// Structuring details for each SKU for the slide-over drawer
interface DetailedSkuInfo {
  sku: string;
  name: string;
  imageUrl: string;
  category: string;
  purchaseQty: number;
  storedQty: number;
  remainingQty: number;
  unitPrice: number;
  amount: number;
  dueDate: string;
  status: "OVERDUE" | "PRODUCING" | "STORING" | "UPCOMING" | "COMPLETED";
  overdueDays: number;
  overdueDeduction: number;
  qualityReturns: number;
  qualityDeduction: number;
  lastInboundTime: string;
  supplierName: string;
}

export default function SupplierDashboardView({
  skus,
  setActiveTab,
  showToast,
  setSelectedSku,
  setModalType,
  weeklyComplaintsCount = 0
}: SupplierDashboardViewProps) {
  // 1. Timeframe Select state (Defaults to "This Month")
  const [selectedTimeframe, setSelectedTimeframe] = useState<"今日" | "本月" | "近30天" | "今年" | "自定义">("本月");
  const [customDateRange, setCustomDateRange] = useState({ start: "2026-05-01", end: "2026-05-31" });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Currently selected SKU for Right Drawer detail view
  const [activeDrawerItem, setActiveDrawerItem] = useState<DetailedSkuInfo | null>(null);

  // 3. Hover state for Timeline nodes
  const [hoveredTimelineNode, setHoveredTimelineNode] = useState<string | null>(null);

  // 4. Dataset representing multiple timeranges based on Stitch Mockup
  const dashboardData = useMemo(() => {
    const defaultSupplier = "杭州织锦服饰有限公司";
    
    const datasets: Record<typeof selectedTimeframe, {
      purchaseTotalQty: number;
      purchaseTotalAmount: number;
      inboundTotalQty: number;
      inboundTotalAmount: number;
      overdueQty: number;
      overdueDeductionAmount: number;
      qualityReturnQty: number;
      qualityDeductionAmount: number;
      timelineItems: Array<{
        date: string;
        isToday?: boolean;
        hasOverlappingItems?: boolean;
        itemCount?: number;
        sku?: string;
        name?: string;
        qty?: number;
        status?: "已超时" | "生产中" | "部分入库" | "即将交付" | "已完成";
        colorType?: "red" | "yellow" | "blue" | "green";
        image?: string;
      }>;
      pendingItems: DetailedSkuInfo[];
    }> = {
      今日: {
        purchaseTotalQty: 1200,
        purchaseTotalAmount: 68400,
        inboundTotalQty: 850,
        inboundTotalAmount: 48500,
        overdueQty: 0,
        overdueDeductionAmount: 0,
        qualityReturnQty: 4,
        qualityDeductionAmount: 120,
        timelineItems: [
          { date: "5/25", sku: "LN-2026-W01-PK-66", name: "女童泡泡袖亮丝加绒连衣裙", qty: 300, status: "已完成", colorType: "green", image: "dress_pink" },
          { date: "5/26" },
          { date: "5/27", isToday: true },
          { date: "5/28" },
          { date: "5/29", sku: "LN-2026-W01-YL-80", name: "女童法式轻复古刺绣连衣裙", qty: 180, status: "即将交付", colorType: "blue", image: "dress_yellow" },
          { date: "5/30" },
          { date: "5/31", hasOverlappingItems: true, itemCount: 1 },
          { date: "6/1" },
          { date: "6/2" },
          { date: "6/3" },
          { date: "6/4" }
        ],
        pendingItems: [
          {
            sku: "LN-2026-W01-PK-66",
            name: "女童泡泡袖亮丝加绒连衣裙 · 粉色",
            category: "女童连衣裙",
            imageUrl: "dress_pink",
            purchaseQty: 1200,
            storedQty: 900,
            remainingQty: 300,
            unitPrice: 61.50,
            amount: 18450.00,
            dueDate: "2026-05-25",
            status: "COMPLETED",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 0,
            qualityDeduction: 0,
            lastInboundTime: "2026-05-28",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W01-YL-80",
            name: "女童法式轻复古刺绣连衣裙 · 柠檬黄",
            category: "女童连衣裙",
            imageUrl: "dress_yellow",
            purchaseQty: 800,
            storedQty: 620,
            remainingQty: 180,
            unitPrice: 68.00,
            amount: 12240.00,
            dueDate: "2026-05-29",
            status: "UPCOMING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 2,
            qualityDeduction: 120,
            lastInboundTime: "2026-05-27",
            supplierName: defaultSupplier
          }
        ]
      },
      本月: {
        purchaseTotalQty: 12860,
        purchaseTotalAmount: 746280,
        inboundTotalQty: 9420,
        inboundTotalAmount: 546360,
        overdueQty: 320,
        overdueDeductionAmount: 3200,
        qualityReturnQty: 48,
        qualityDeductionAmount: 1680,
        timelineItems: [
          { date: "5/25", sku: "LN-2026-W01-PK-66", name: "女童泡泡袖亮丝加绒连衣裙", qty: 300, status: "已超时", colorType: "red", image: "dress_pink" },
          { date: "5/26" },
          { date: "5/27", isToday: true },
          { date: "5/28" },
          { date: "5/29", sku: "LN-2026-W01-YL-80", name: "女童法式轻复古刺绣连衣裙", qty: 180, status: "已超时", colorType: "yellow", image: "dress_yellow" },
          { date: "5/30" },
          { date: "5/31", hasOverlappingItems: true, itemCount: 3 },
          { date: "6/1" },
          { date: "6/2" },
          { date: "6/3", sku: "LN-2026-W02-BL-90", name: "童装连帽防风保暖外套", qty: 500, status: "即将交付", colorType: "green", image: "jacket_blue" },
          { date: "6/4" }
        ],
        pendingItems: [
          {
            sku: "LN-2026-W01-PK-66",
            name: "女童泡泡袖亮丝加绒连衣裙 · 经典粉",
            category: "女童连衣裙",
            imageUrl: "dress_pink",
            purchaseQty: 1200,
            storedQty: 900,
            remainingQty: 300,
            unitPrice: 61.50,
            amount: 18450.00,
            dueDate: "2026-05-25",
            status: "OVERDUE",
            overdueDays: 3,
            overdueDeduction: 3200,
            qualityReturns: 8,
            qualityDeduction: 240,
            lastInboundTime: "2026-05-22",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W01-YL-80",
            name: "女童法式轻复古刺绣连衣裙 · 柠檬黄",
            category: "女童连衣裙",
            imageUrl: "dress_yellow",
            purchaseQty: 800,
            storedQty: 620,
            remainingQty: 180,
            unitPrice: 68.00,
            amount: 12240.00,
            dueDate: "2026-05-29",
            status: "PRODUCING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 12,
            qualityDeduction: 480,
            lastInboundTime: "2026-05-24",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W02-BL-90",
            name: "童装连帽防风保暖运动外套 · 孔雀蓝",
            category: "童装外套",
            imageUrl: "jacket_blue",
            purchaseQty: 2500,
            storedQty: 2000,
            remainingQty: 500,
            unitPrice: 69.00,
            amount: 34500.00,
            dueDate: "2026-06-03",
            status: "STORING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 28,
            qualityDeduction: 960,
            lastInboundTime: "2026-05-26",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W03-GY-10",
            name: "精柔舒棉针织束脚运动裤 · 炭灰色",
            category: "精柔内衣裤",
            imageUrl: "pants_grey",
            purchaseQty: 1500,
            storedQty: 0,
            remainingQty: 1500,
            unitPrice: 15.00,
            amount: 22500.00,
            dueDate: "2026-06-15",
            status: "UPCOMING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 0,
            qualityDeduction: 0,
            lastInboundTime: "暂无",
            supplierName: defaultSupplier
          }
        ]
      },
      近30天: {
        purchaseTotalQty: 15400,
        purchaseTotalAmount: 896200,
        inboundTotalQty: 11200,
        inboundTotalAmount: 648300,
        overdueQty: 380,
        overdueDeductionAmount: 3800,
        qualityReturnQty: 52,
        qualityDeductionAmount: 1920,
        timelineItems: [
          { date: "5/25", sku: "LN-2026-W01-PK-66", name: "女童泡泡袖亮丝加绒连衣裙", qty: 300, status: "已超时", colorType: "red", image: "dress_pink" },
          { date: "5/26" },
          { date: "5/27", isToday: true },
          { date: "5/28" },
          { date: "5/29", sku: "LN-2026-W01-YL-80", name: "女童法式轻复古刺绣连衣裙", qty: 180, status: "已超时", colorType: "yellow", image: "dress_yellow" },
          { date: "5/30" },
          { date: "5/31", hasOverlappingItems: true, itemCount: 4 },
          { date: "6/1" },
          { date: "6/2" },
          { date: "6/3", sku: "LN-2026-W02-BL-90", name: "童装连帽防风保暖外套", qty: 500, status: "即将交付", colorType: "green", image: "jacket_blue" },
          { date: "6/4" }
        ],
        pendingItems: [
          {
            sku: "LN-2026-W01-PK-66",
            name: "女童泡泡袖亮丝加绒连衣裙 · 经典粉",
            category: "女童连衣裙",
            imageUrl: "dress_pink",
            purchaseQty: 1200,
            storedQty: 900,
            remainingQty: 300,
            unitPrice: 61.50,
            amount: 18450.00,
            dueDate: "2026-05-25",
            status: "OVERDUE",
            overdueDays: 4,
            overdueDeduction: 3800,
            qualityReturns: 10,
            qualityDeduction: 300,
            lastInboundTime: "2026-05-22",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W01-YL-80",
            name: "女童法式轻复古刺绣连衣裙 · 柠檬黄",
            category: "女童连衣裙",
            imageUrl: "dress_yellow",
            purchaseQty: 800,
            storedQty: 620,
            remainingQty: 180,
            unitPrice: 68.00,
            amount: 12240.00,
            dueDate: "2026-05-29",
            status: "PRODUCING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 14,
            qualityDeduction: 560,
            lastInboundTime: "2026-05-24",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W02-BL-90",
            name: "童装连帽防风保暖运动外套 · 孔雀蓝",
            category: "童装外套",
            imageUrl: "jacket_blue",
            purchaseQty: 2500,
            storedQty: 2000,
            remainingQty: 500,
            unitPrice: 69.00,
            amount: 34500.00,
            dueDate: "2026-06-03",
            status: "STORING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 28,
            qualityDeduction: 1060,
            lastInboundTime: "2026-05-26",
            supplierName: defaultSupplier
          }
        ]
      },
      今年: {
        purchaseTotalQty: 85420,
        purchaseTotalAmount: 4956320,
        inboundTotalQty: 78540,
        inboundTotalAmount: 4426500,
        overdueQty: 980,
        overdueDeductionAmount: 9800,
        qualityReturnQty: 210,
        qualityDeductionAmount: 8400,
        timelineItems: [
          { date: "5/25", sku: "LN-2026-W01-PK-66", name: "女童泡泡袖亮丝加绒连衣裙", qty: 300, status: "已超时", colorType: "red", image: "dress_pink" },
          { date: "5/26" },
          { date: "5/27", isToday: true },
          { date: "5/28" },
          { date: "5/29", sku: "LN-2026-W01-YL-80", name: "女童法式轻复古刺绣连衣裙", qty: 180, status: "已超时", colorType: "yellow", image: "dress_yellow" },
          { date: "5/30" },
          { date: "5/31", hasOverlappingItems: true, itemCount: 8 },
          { date: "6/1" },
          { date: "6/2" },
          { date: "6/3", sku: "LN-2026-W02-BL-90", name: "童装连帽防风保暖外套", qty: 500, status: "即将交付", colorType: "green", image: "jacket_blue" },
          { date: "6/4" }
        ],
        pendingItems: [
          {
            sku: "LN-2026-W01-PK-66",
            name: "女童泡泡袖亮丝加绒连衣裙 · 经典粉",
            category: "女童连衣裙",
            imageUrl: "dress_pink",
            purchaseQty: 1200,
            storedQty: 900,
            remainingQty: 300,
            unitPrice: 61.50,
            amount: 18450.00,
            dueDate: "2026-05-25",
            status: "OVERDUE",
            overdueDays: 10,
            overdueDeduction: 9800,
            qualityReturns: 45,
            qualityDeduction: 1210,
            lastInboundTime: "2026-05-22",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W01-YL-80",
            name: "女童法式轻复古刺绣连衣裙 · 柠檬黄",
            category: "女童连衣裙",
            imageUrl: "dress_yellow",
            purchaseQty: 800,
            storedQty: 620,
            remainingQty: 180,
            unitPrice: 68.00,
            amount: 12240.00,
            dueDate: "2026-05-29",
            status: "PRODUCING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 32,
            qualityDeduction: 1280,
            lastInboundTime: "2026-05-24",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W02-BL-90",
            name: "童装连帽防风保暖运动外套 · 孔雀蓝",
            category: "童装外套",
            imageUrl: "jacket_blue",
            purchaseQty: 2500,
            storedQty: 2000,
            remainingQty: 500,
            unitPrice: 69.00,
            amount: 34500.00,
            dueDate: "2026-06-03",
            status: "STORING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 80,
            qualityDeduction: 3200,
            lastInboundTime: "2026-05-26",
            supplierName: defaultSupplier
          }
        ]
      },
      自定义: {
        purchaseTotalQty: 6420,
        purchaseTotalAmount: 373140,
        inboundTotalQty: 4710,
        inboundTotalAmount: 273180,
        overdueQty: 160,
        overdueDeductionAmount: 1600,
        qualityReturnQty: 24,
        qualityDeductionAmount: 840,
        timelineItems: [
          { date: "5/25", sku: "LN-2026-W01-PK-66", name: "女童泡泡袖亮丝加绒连衣裙", qty: 300, status: "已超时", colorType: "red", image: "dress_pink" },
          { date: "5/26" },
          { date: "5/27", isToday: true },
          { date: "5/28" },
          { date: "5/29", sku: "LN-2026-W01-YL-80", name: "女童法式轻复古刺绣连衣裙", qty: 180, status: "已超时", colorType: "yellow", image: "dress_yellow" },
          { date: "5/30" },
          { date: "5/31", hasOverlappingItems: true, itemCount: 2 },
          { date: "6/1" },
          { date: "6/2" },
          { date: "6/3", sku: "LN-2026-W02-BL-90", name: "童装连帽防风保暖外套", qty: 500, status: "即将交付", colorType: "green", image: "jacket_blue" },
          { date: "6/4" }
        ],
        pendingItems: [
          {
            sku: "LN-2026-W01-PK-66",
            name: "女童泡泡袖亮丝加绒连衣裙 · 经典粉",
            category: "女童连衣裙",
            imageUrl: "dress_pink",
            purchaseQty: 1200,
            storedQty: 900,
            remainingQty: 300,
            unitPrice: 61.50,
            amount: 18450.00,
            dueDate: "2026-05-25",
            status: "OVERDUE",
            overdueDays: 2,
            overdueDeduction: 1600,
            qualityReturns: 4,
            qualityDeduction: 120,
            lastInboundTime: "2026-05-22",
            supplierName: defaultSupplier
          },
          {
            sku: "LN-2026-W02-BL-90",
            name: "童装连帽防风保暖运动外套 · 孔雀蓝",
            category: "童装外套",
            imageUrl: "jacket_blue",
            purchaseQty: 2500,
            storedQty: 2000,
            remainingQty: 500,
            unitPrice: 69.00,
            amount: 34500.00,
            dueDate: "2026-06-03",
            status: "STORING",
            overdueDays: 0,
            overdueDeduction: 0,
            qualityReturns: 20,
            qualityDeduction: 720,
            lastInboundTime: "2026-05-26",
            supplierName: defaultSupplier
          }
        ]
      }
    };
    return datasets[selectedTimeframe];
  }, [selectedTimeframe]);

  const handleTimeframeChange = (frame: typeof selectedTimeframe) => {
    setSelectedTimeframe(frame);
    if (frame === "自定义") {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
    showToast(`📅 已切换时间筛选：近 [${frame}] 的指标分析`);
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCustomPicker(false);
    showToast(`📅 已应用自定义时间段: ${customDateRange.start} 至 ${customDateRange.end}`);
  };

  // 5. Search filtering for Deliverables Table
  const filteredPendingItems = useMemo(() => {
    if (!searchQuery) return dashboardData.pendingItems;
    return dashboardData.pendingItems.filter(item => 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dashboardData, searchQuery]);

  // SVG Render Helper for Apparel Drawing Cards
  const renderApparelSVGPlaceholder = (type: string, colorClass: string) => {
    if (type.includes("pink")) {
      return (
        <svg className={`w-8 h-8 ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
          {/* Dress Shape inside an elegant container */}
          <path d="M12 2c-.55 0-1 .45-1 1v2.1c-2.24.42-4 2.33-4 4.67v8.23c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V9.77c0-2.34-1.76-4.25-4-4.67V3c0-.55-.45-1-1-1zm-3 7.77c0-1.8 1.34-3.26 3-3.26s3 1.46 3 3.26v2.23H9V9.77zM15 17H9v-3h6v3z"/>
        </svg>
      );
    } else if (type.includes("yellow")) {
      return (
        <svg className={`w-8 h-8 ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
          {/* Windbreaker Jacket Shape */}
          <path d="M12 2L4 7v13c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7l-8-5zm-5 7h4v11H7V9zm10 11h-4V9h4v11z"/>
        </svg>
      );
    } else if (type.includes("blue")) {
      return (
        <svg className={`w-8 h-8 ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
          {/* Outdoor Heavy Outwear Shape */}
          <path d="M18 8H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zM8 4h8v2H8V4z"/>
        </svg>
      );
    } else {
      return (
        <svg className={`w-8 h-8 ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
          {/* General Box structure for other clothes */}
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15H7v-5h5v5zm5-7h-5V7h5v4z"/>
        </svg>
      );
    }
  };

  return (
    <div id="supplier-dashboard-viewport" className="space-y-6">

      {/* Title Segment styled matching the layout of Stitch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#012b24] font-sans flex items-center gap-2">
            <span>工作台首页 Dashboard</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            数据最后统计更新时间：<span className="font-semibold text-slate-600">2026-05-28 09:42 AM</span> (实时计算) 
          </p>
        </div>

        {/* Time Selection control strip from Stitch Mockup */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-extrabold uppercase">指标区间筛选:</span>
          <div className="bg-[#f0f4f2] p-1 rounded-xl border border-emerald-500/10 flex items-center">
            {(["今日", "本月", "近30天", "今年", "自定义"] as const).map((frame) => {
              const isActive = selectedTimeframe === frame;
              return (
                <button
                  key={frame}
                  onClick={() => handleTimeframeChange(frame)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-emerald-800 shadow-[0_2px_5px_rgba(0,0,0,0.06)] scale-102"
                      : "text-slate-500 hover:text-emerald-900 hover:bg-white/40"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {frame === "自定义" && <Calendar className="w-3.5 h-3.5" />}
                    {frame}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date interval modal/popover (Custom selector drawer element) */}
      <AnimatePresence>
        {showCustomPicker && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-md max-w-md"
          >
            <form onSubmit={handleCustomDateSubmit} className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 block">开始日期</label>
                <input 
                  type="date" 
                  value={customDateRange.start} 
                  onChange={e => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 outline-hidden focus:border-emerald-500 font-mono text-xs text-slate-700" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 block">结束日期</label>
                <input 
                  type="date" 
                  value={customDateRange.end} 
                  onChange={e => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 outline-hidden focus:border-emerald-500 font-mono text-xs text-slate-700" 
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="px-4 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                >
                  确定筛选
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCustomPicker(false)}
                  className="px-3 py-1.8 hover:bg-slate-50 text-slate-450 border border-slate-200 rounded-lg text-xs cursor-pointer"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* METRIC OVERVIEW CARDS: Double Cards wide (Left sides) & Stacked Single Cards (Right sides) */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 select-none">
        
        {/* Card 1: Purchase Overview (col-span-2) */}
        <div 
          onClick={() => showToast(`🛒 筛选该统计周期内的采购合同。共采购计：${dashboardData.purchaseTotalQty.toLocaleString()} 件衣服`)}
          className="lg:col-span-2 bg-gradient-to-br from-emerald-50/20 to-teal-50/5 border border-emerald-500/15 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xs transition-all duration-300 hover:shadow-md cursor-pointer group relative overflow-hidden"
        >
          {/* Subtle icon outline in background like Stitch mockup */}
          <ShoppingCart className="absolute right-4 bottom-4 w-28 h-28 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none" />

          <div className="relative">
            <div className="flex items-center space-x-2 text-emerald-750 font-extrabold text-[12px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>PURCHASE OVERVIEW / 采购概况</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-b border-emerald-500/5 pb-5">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">采购件数</span>
                <div className="flex items-baseline mt-1.5">
                  <span className="text-2xl md:text-3.5xl font-black text-[#012b24] font-mono tracking-tight group-hover:scale-101 transition-transform origin-left">
                    {dashboardData.purchaseTotalQty.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold ml-1">pcs</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">采购金额</span>
                <div className="flex items-baseline mt-1.5">
                  <span className="text-2xl md:text-3.5xl font-black text-emerald-700 font-mono tracking-tight group-hover:scale-101 transition-transform origin-left">
                    ¥{dashboardData.purchaseTotalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>采购计划交付总量分析</span>
              <span className="text-emerald-700 font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                查看关联订单卷宗 →
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Inbound / Storage Overview (col-span-2) */}
        <div 
          onClick={() => showToast(`🏢 对应的仓储物流入库汇总。已过账入库款：${dashboardData.inboundTotalQty.toLocaleString()} 件`)}
          className="lg:col-span-2 bg-gradient-to-br from-blue-50/20 to-sky-50/5 border border-blue-500/15 hover:border-blue-500/40 rounded-3xl p-6 shadow-xs transition-all duration-300 hover:shadow-md cursor-pointer group relative overflow-hidden"
        >
          {/* Subtle warehouse icon in background */}
          <Warehouse className="absolute right-4 bottom-4 w-28 h-28 text-blue-500/5 group-hover:text-blue-500/10 transition-colors pointer-events-none" />

          <div className="relative">
            <div className="flex items-center space-x-2 text-blue-750 font-extrabold text-[12px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>STORAGE OVERVIEW / 入库概况</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-b border-blue-500/5 pb-5">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">入库件数</span>
                <div className="flex items-baseline mt-1.5">
                  <span className="text-2xl md:text-3.5xl font-black text-[#012b24] font-mono tracking-tight group-hover:scale-101 transition-transform origin-left">
                    {dashboardData.inboundTotalQty.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-455 font-bold ml-1">pcs</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">入库金额</span>
                <div className="flex items-baseline mt-1.5">
                  <span className="text-2xl md:text-3.5xl font-black text-blue-600 font-mono tracking-tight group-hover:scale-101 transition-transform origin-left">
                    ¥{dashboardData.inboundTotalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>已过账收货及结算进度统计</span>
              <span className="text-blue-600 font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                对账核数结算板块 →
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Stacked Delivery Overdue & Quality Issues (Right Panel col-span-2) */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4">
          
          {/* Card 3a: Delivery Overdue */}
          <div 
            onClick={() => showToast(`⚠️ 货期警示：当前有 ${dashboardData.overdueQty} 件商品已超出应交付日期，带来额外超时考核扣罚`)}
            className="flex-grow bg-amber-50/15 hover:bg-amber-50/30 border border-amber-500/15 hover:border-amber-500/35 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 shadow-3xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 animate-[spin_20s_linear_infinite]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">DELIVERY OVERDUE / 货期超时</span>
                <div className="flex items-baseline mt-1 gap-1">
                  <span className="text-xl font-extrabold text-amber-700 font-mono leading-none">
                    {dashboardData.overdueQty.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold font-sans">Items</span>
                </div>
              </div>
            </div>
            
            <div className="text-right border-l border-amber-500/10 pl-4.5 min-w-[90px]">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Penalty / 扣款</span>
              <span className="text-xs font-bold text-rose-600 font-mono leading-none block mt-1.5">
                ¥{dashboardData.overdueDeductionAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 3b: Quality Issues */}
          <div 
            onClick={() => showToast(`🛡️ 质量退货：质量考核监控。共退货：${dashboardData.qualityReturnQty} 件`)}
            className="flex-grow bg-rose-50/15 hover:bg-rose-50/30 border border-rose-500/15 hover:border-rose-500/35 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 shadow-3xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">QUALITY ISSUES / 质量瑕疵</span>
                <div className="flex items-baseline mt-1 gap-1">
                  <span className="text-xl font-extrabold text-rose-600 font-mono leading-none">
                    {dashboardData.qualityReturnQty.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold font-sans">Returns</span>
                </div>
              </div>
            </div>
            
            <div className="text-right border-l border-rose-500/10 pl-4.5 min-w-[90px]">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Deduction / 惩罚</span>
              <span className="text-xs font-bold text-rose-600 font-mono leading-none block mt-1.5">
                ¥{dashboardData.qualityDeductionAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* DELIVERY TIMELINE SECTION - Horizontal track design matching Stitch */}
      <div id="timelineCard" className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs relative overflow-hidden">
        
        {/* Header segment */}
        <div className="flex items-center justify-between mb-8 select-none flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-5 bg-emerald-600 rounded-xs inline-block" />
            <h3 className="text-15px font-bold text-[#012b24] tracking-tight">Delivery Timeline / 货期时间轴</h3>
          </div>

          {/* Legend indicators */}
          <div className="flex items-center gap-4 text-[11px] font-black tracking-normal">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block border border-rose-600" />
              <span className="text-slate-500">Overdue / 已超时</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-450 inline-block border border-amber-600" />
              <span className="text-slate-500">Risk / 生产异常</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-emerald-600" />
              <span className="text-slate-500">Healthy / 即将交付</span>
            </span>
          </div>
        </div>

        {/* Overdue/Upcoming Outer Indicator Labels */}
        <div className="hidden lg:flex items-center justify-between absolute left-5 right-5 top-[154px] pointer-events-none select-none">
          <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.8 rounded-md text-[9px] font-bold text-rose-600 animate-pulse">
            <AlertCircle className="w-3 h-3 text-rose-500" /> OVERDUE
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.8 rounded-md text-[9px] font-bold text-emerald-600">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> UPCOMING
          </div>
        </div>

        {/* Scrollable Timeline Grid Base Line */}
        <div className="overflow-x-auto pb-4 scrollbar-thin select-none">
          <div className="min-w-[950px] relative h-[210px] flex items-center justify-between px-8">
            
            {/* Center horizontal line */}
            <div className="absolute left-6 right-6 top-[130px] h-[3px] bg-slate-200" />

            {/* Render each node slot in dashboardData */}
            {dashboardData.timelineItems.map((node, index) => {
              const nodeKey = `node-${node.date}-${index}`;
              const isHovered = hoveredTimelineNode === nodeKey;

              // Color configurations based on colorType
              const ringColor = 
                node.colorType === "red" ? "border-rose-500 bg-rose-50" : 
                node.colorType === "yellow" ? "border-amber-450 bg-amber-50/40" : 
                node.colorType === "blue" ? "border-blue-500 bg-blue-50/40" :
                node.colorType === "green" ? "border-emerald-500 bg-emerald-50/45" : "border-slate-300 bg-slate-100";
              const tagColor = 
                node.colorType === "red" ? "bg-rose-500 text-white" : 
                node.colorType === "yellow" ? "bg-amber-450 text-white" : 
                node.colorType === "blue" ? "bg-blue-600 text-white" :
                node.colorType === "green" ? "bg-emerald-600 text-white" : "bg-slate-400 text-white";

              return (
                <div 
                  key={nodeKey}
                  className="flex flex-col items-center relative flex-1"
                  style={{ zIndex: isHovered ? 50 : 10 }}
                >
                  
                  {/* Item Above: SKU Card details if any item exists on date */}
                  {node.sku ? (
                    <div 
                      onMouseEnter={() => setHoveredTimelineNode(nodeKey)}
                      onMouseLeave={() => setHoveredTimelineNode(null)}
                      onClick={() => {
                        // Find matching pending detail item or fallback mock
                        const found = dashboardData.pendingItems.find(p => p.sku === node.sku) || {
                          sku: node.sku,
                          name: node.name || "示例服装衬衫",
                          imageUrl: node.image || "dress_pink",
                          category: "女童服饰",
                          purchaseQty: node.qty || 300,
                          storedQty: Math.floor((node.qty || 300) * 0.7),
                          remainingQty: Math.floor((node.qty || 300) * 0.3),
                          unitPrice: 65,
                          amount: (node.qty || 300) * 65,
                          dueDate: `2026-${node.date.replace("/", "-")}`,
                          status: node.colorType === "red" ? "OVERDUE" : "PRODUCING",
                          overdueDays: node.colorType === "red" ? 3 : 0,
                          overdueDeduction: node.colorType === "red" ? 1200 : 0,
                          qualityReturns: 0,
                          qualityDeduction: 0,
                          lastInboundTime: "2026-05-24",
                          supplierName: "杭州织锦服饰有限公司"
                        } as DetailedSkuInfo;
                        setActiveDrawerItem(found);
                      }}
                      className="absolute bottom-[92px] w-[90px] xl:w-[100px] flex flex-col items-center cursor-pointer group"
                    >
                      {/* Interactive hover detail overlay popover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute bottom-[104%] w-[210px] bg-[#0c1e34] text-white rounded-xl p-3 shadow-2xl z-50 text-[10.5px] leading-relaxed border border-white/10"
                          >
                            <span className={`text-[8px] font-extrabold uppercase px-1.8 py-0.5 rounded-sm mb-1.5 inline-block ${tagColor}`}>
                              {node.status}
                            </span>
                            <p className="font-extrabold truncate text-white">{node.sku}</p>
                            <p className="text-[9.5px] text-slate-300 font-medium truncate mt-0.5">{node.name}</p>
                            <div className="grid grid-cols-2 gap-1.5 mt-2 pt-1.5 border-t border-white/5 font-mono text-[9px] text-slate-400">
                              <div>已入库: <span className="text-emerald-400">{(node.qty || 0) * 2}件</span></div>
                              <div>采购件: <span className="text-white">{node.qty}件</span></div>
                            </div>
                            <span className="text-[8px] font-black text-amber-300 block mt-1.5">💡 点击单元格可展开高阶档案面板</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Header Badge tag (e.g. OVERDUE, RISK, HEALTHY) */}
                      <span className={`text-[8.5px] font-bold uppercase py-0.5 px-2 rounded-md tracking-wider shadow-2xs mb-1.5 select-none ${tagColor} transition-all group-hover:scale-105`}>
                        {node.colorType === "red" ? "OVERDUE" : node.colorType === "yellow" ? "RISK" : "HEALTHY"}
                      </span>

                      {/* Apparel Card with thumbnail */}
                      <div className={`w-[66px] h-[66px] rounded-2xl border-2 flex items-center justify-center p-1.5 text-center shadow-xs transition-all duration-350 bg-white group-hover:-translate-y-1 group-hover:shadow-md ${ringColor} ${isHovered ? "ring-4 ring-emerald-50" : ""}`}>
                        {renderApparelSVGPlaceholder(node.image || "", "text-slate-500 opacity-85 group-hover:scale-108 transition-all")}
                      </div>
                    </div>
                  ) : null}

                  {/* Item Above: Overlapping badge items (+3) */}
                  {node.hasOverlappingItems ? (
                    <div 
                      onMouseEnter={() => setHoveredTimelineNode(nodeKey)}
                      onMouseLeave={() => setHoveredTimelineNode(null)}
                      onClick={() => showToast(`📦 2026-05-31 该日期下共有 ${node.itemCount} 款交付商品：包含抗菌童袜、加绒长内衣等，可查阅下方表格进行对数。`)}
                      className="absolute bottom-[92px] w-[90px] flex flex-col items-center cursor-pointer group"
                    >
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-[84%] w-[200px] bg-[#0c1e34] text-white rounded-xl p-3.5 shadow-2xl z-50 text-[10px] leading-relaxed border border-white/5"
                          >
                            <span className="text-[8.5px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-sm block w-fit mb-2">
                              合并重叠款数 ({node.itemCount} 款)
                            </span>
                            <div className="space-y-1 text-slate-300 font-medium">
                              <p>• LN-2026-M10-WT-110 (White 童袜)</p>
                              <p>• LN-2026-K12-BK-90 (Black 外套)</p>
                              <p>• LN-2026-K12-RD-85 (Red 打底)</p>
                            </div>
                            <span className="text-[8px] text-slate-400 block mt-2 pt-1 border-t border-white/5">合并排单交货，避免库存阻滞</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <span className="text-[8.5px] font-black py-0.5 px-2 rounded-md bg-slate-500 text-white tracking-wider mb-2">
                        MERGED
                      </span>

                      {/* Stacked cards effect */}
                      <div className="relative w-[60px] h-[60px]">
                        <div className="absolute top-1.5 left-1.5 w-full h-full rounded-2xl bg-slate-300/30 border border-slate-300/50" />
                        <div className="absolute top-0.75 left-0.75 w-full h-full rounded-2xl bg-indigo-500/10 border border-[#0d3f34]/15" />
                        <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-[#0c2e36] text-white flex items-center justify-center border border-[#0d3f34] shadow-sm transform group-hover:-translate-y-1 transition-all">
                          <span className="font-bold text-center text-xs">+{node.itemCount}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Today Indicator Capsule (Direct pointer) */}
                  {node.isToday ? (
                    <div className="absolute bottom-[92px] w-[110px] flex flex-col items-center">
                      <div className="bg-[#0b1c30] text-white text-[9.5px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span>Today (5/27)</span>
                      </div>
                      {/* Downward connecting vertical arrow */}
                      <div className="w-[1.5px] h-9 bg-[#0b1c30] mt-1 relative flex justify-center">
                        <div className="absolute bottom-0 w-1.5 h-1.5 bg-[#0b1c30] rounded-full" />
                      </div>
                    </div>
                  ) : null}

                  {/* Timeline node dot mapping on center line */}
                  <div className="h-[28px] flex items-center justify-center relative translate-y-[13px]">
                    <div 
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all cursor-pointer ${
                        node.isToday ? "bg-[#0b1c30] border-[#0b1c30] scale-120 animate-pulse z-40" : 
                        node.colorType === "red" ? "bg-rose-500 border-rose-300" :
                        node.colorType === "yellow" ? "bg-amber-400 border-amber-300" :
                        node.colorType === "green" ? "bg-emerald-500 border-emerald-450" :
                        node.hasOverlappingItems ? "bg-teal-700 border-teal-550" : "bg-white border-slate-350"
                      }`}
                      title={node.date}
                    />
                  </div>

                  {/* Date Label (Under the centerline) */}
                  <span className={`text-[10.5px] font-mono font-bold mt-[26px] ${
                    node.isToday ? "text-[#0b1c30] font-black" : "text-slate-400"
                  }`}>
                    {node.date}
                  </span>

                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* PENDING DELIVERY ITEMS TABLE - Interactive data table matching Stitch */}
      <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Table Toolbar section */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-5 bg-emerald-600 rounded-xs inline-block" />
            <h3 className="text-15px font-bold text-[#012b24] tracking-tight">Pending Delivery Items / 待交付商品明细</h3>
          </div>

          <div className="flex items-center gap-3.5 w-full md:w-auto">
            
            {/* Search filter inline */}
            <div className="relative flex-grow md:flex-grow-0 w-full md:w-60 rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 bg-slate-50 focus-within:bg-white focus-within:border-emerald-600 transition-all">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索款号、SKU识别码..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[11px] font-sans placeholder-slate-400 text-slate-700 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter control badge */}
            <button 
              onClick={() => showToast("🛠️ 已执行数据过滤过滤规则")}
              className="p-1 px-3 py-2 rounded-xl border border-slate-205 hover:bg-slate-50 font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>筛选</span>
            </button>

            {/* Export control inline */}
            <button 
              onClick={() => showToast("📥 正在向云端发起申请：导出当前登录供应商的商品对数明细表.xlsx")}
              className="p-1 px-3 py-2 rounded-xl border border-slate-205 hover:bg-slate-50 font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
          </div>
        </div>

        {/* Dense Responsive Data Table */}
        <div className="overflow-x-auto text-[11.5px] font-medium leading-normal">
          <table className="w-full text-left border-collapse text-slate-650">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase font-sans tracking-wider">
              <tr>
                <th className="p-4 pl-6 text-center w-[90px]">Product / 商品</th>
                <th className="p-4">SKU / Name / 款号</th>
                <th className="p-4 text-center">Purchase Qty / 采购数</th>
                <th className="p-4 text-center">Stored Qty / 已入库</th>
                <th className="p-4 text-center">Remaining / 待入库</th>
                <th className="p-4 text-right">Amount / 采购金额</th>
                <th className="p-4 text-center">Due Date / 交付交期</th>
                <th className="p-4 text-center">Status / 交付状态</th>
                <th className="p-4 text-center pr-6">Action / 操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 font-medium">
              {filteredPendingItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    没有找到该时间筛选范围或匹配条件的未交付商品款号。
                  </td>
                </tr>
              ) : (
                filteredPendingItems.map((item, idx) => {
                  const hasOverdue = item.status === "OVERDUE";
                  const isProducing = item.status === "PRODUCING";
                  const isStoring = item.status === "STORING";
                  const isUpcoming = item.status === "UPCOMING";
                  const isCompleted = item.status === "COMPLETED";

                  return (
                    <tr 
                      key={`${item.sku}-${idx}`} 
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* PRODUCT IMAGE SELECTOR WITH STYLED PLACEHOLDER PATTERN */}
                      <td className="p-3 pl-6 text-center">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                          hasOverdue ? "border-rose-100 bg-rose-50/40 text-rose-500" :
                          isProducing ? "border-amber-100 bg-amber-50/30 text-amber-600" :
                          isStoring ? "border-blue-100 bg-blue-50/40 text-blue-500" :
                          "border-slate-100 bg-slate-50 text-slate-500"
                        }`}>
                          {renderApparelSVGPlaceholder(item.imageUrl, "w-6 h-6")}
                        </div>
                      </td>

                      {/* SKU / NAME DETAILS */}
                      <td className="p-4">
                        <div className="font-extrabold text-[#012b24] font-mono tracking-tight text-[12.5px]">
                          {item.sku}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[210px] mt-0.5">
                          {item.name}
                        </div>
                      </td>

                      {/* PURCHASE QUANTITY COL */}
                      <td className="p-4 text-center font-bold text-[#0b1c30] font-mono">
                        {item.purchaseQty.toLocaleString()} 件
                      </td>

                      {/* STORED QUANTITY COL */}
                      <td className="p-4 text-center font-mono text-slate-600">
                        {item.storedQty.toLocaleString()} 件 / <span className="text-[9.5px] font-bold text-slate-400">{(Math.round((item.storedQty / item.purchaseQty) * 100))}%</span>
                      </td>

                      {/* REMAINING UNSTORED QUANTITY COL (Colored dynamically for risk mitigation) */}
                      <td className="p-4 text-center font-mono">
                        {item.remainingQty === 0 ? (
                          <span className="text-emerald-600 font-extrabold font-sans">已清点完毕</span>
                        ) : (
                          <span className={`font-black ${
                            hasOverdue ? "text-rose-600" :
                            isProducing ? "text-amber-500" : "text-slate-700"
                          }`}>
                            {item.remainingQty.toLocaleString()} 件
                          </span>
                        )}
                      </td>

                      {/* TOTAL AMOUNT FOR PURCHASE */}
                      <td className="p-4 text-right font-extrabold font-mono text-slate-700">
                        ¥{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* DELIVERABLE DUE DATE */}
                      <td className="p-4 text-center font-mono font-bold text-[#012b24] whitespace-nowrap">
                        {item.dueDate}
                      </td>

                      {/* STATUS BADGES */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {hasOverdue && (
                          <span className="px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider border border-rose-200 bg-rose-50 text-rose-600">
                            已超时
                          </span>
                        )}
                        {isProducing && (
                          <span className="px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider border border-amber-200 bg-amber-50 text-amber-600">
                            生产中
                          </span>
                        )}
                        {isStoring && (
                          <span className="px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider border border-blue-200 bg-blue-50 text-blue-600">
                            部分入库
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider border border-emerald-200 bg-emerald-50 text-emerald-600">
                            即将交付
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider border border-slate-200 bg-slate-50 text-slate-500">
                            已完成
                          </span>
                        )}
                      </td>

                      {/* SYSTEM ACTION FOR MODALS/DRAWERS */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setActiveDrawerItem(item);
                            showToast(`📂 已选中 ${item.sku} 展开高精度联查账期抽屉面`);
                          }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-[#012b24] font-black rounded-lg transition-all cursor-pointer text-[10.5px] items-center gap-1 inline-flex"
                        >
                          <Eye className="w-3 h-3" />
                          <span>明细</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination bar matching mockup style */}
        <div className="h-12 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-6 select-none font-sans">
          <span className="text-[10px] text-slate-400 font-bold">
            显示 1 至 {filteredPendingItems.length} 条数据 (总共及过滤后)
          </span>
          <div className="flex items-center space-x-1.5 text-[10px]">
            <button className="px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 cursor-pointer">
              上一页
            </button>
            <button className="px-2.5 py-1 rounded-md bg-[#012b24] text-white font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 cursor-pointer">
              2
            </button>
            <button className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 cursor-pointer">
              3
            </button>
            <button className="px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 cursor-pointer">
              下一页
            </button>
          </div>
        </div>

      </div>

      {/* HIGHEST FIDELITY RIGHT DETAILED DRAWER FOR SKU DETAILS (Slideover pattern) */}
      <AnimatePresence>
        {activeDrawerItem && (
          <>
            {/* Dark blur veil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrawerItem(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[1000]"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-[420px] md:w-[480px] bg-white text-[#0b1c30] z-[1010] shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              
              {/* Drawer Header with Close */}
              <div className="p-5 border-b border-slate-100 bg-[#f8f9ff] flex items-center justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.8 rounded-md text-[9px] font-black uppercase tracking-wider mb-2 bg-[#012b24] text-white">
                    SKU 智能联查档案
                  </span>
                  <h3 className="text-15px font-black tracking-tight text-[#012b24] font-mono">
                    {activeDrawerItem.sku}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDrawerItem(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
                  title="关闭明细面板"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Drawer Body scrollable */}
              <div className="flex-grow overflow-y-auto p-5 md:p-6 space-y-5.5">
                
                {/* Visual Garment block */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center flex-shrink-0 bg-white ${
                    activeDrawerItem.status === "OVERDUE" ? "border-rose-200 text-rose-500" : "border-slate-200 text-slate-650"
                  }`}>
                    {renderApparelSVGPlaceholder(activeDrawerItem.imageUrl, "w-10 h-10")}
                  </div>
                  <div>
                    <h4 className="text-13px font-bold text-slate-800 leading-tight">
                      {activeDrawerItem.name}
                    </h4>
                    <span className="text-[10px] text-slate-450 block mt-1">
                      品类分类：<span className="font-semibold text-slate-600">{activeDrawerItem.category}</span>
                    </span>
                    <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-2 font-bold select-all">
                      合作商: {activeDrawerItem.supplierName}
                    </span>
                  </div>
                </div>

                {/* Main quantities grid card */}
                <div className="space-y-3.5">
                  <h5 className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider">
                    核心排进度对数 / Quantities Analysis
                  </h5>
                  <div className="grid grid-cols-3 gap-2.5">
                    
                    {/* Qty 1 */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block">采购合同件</span>
                      <span className="text-[16px] font-extrabold text-[#012b24] font-mono block mt-1.5 leading-none">
                        {activeDrawerItem.purchaseQty.toLocaleString()}
                      </span>
                    </div>

                    {/* Qty 2 */}
                    <div className="bg-emerald-50/15 p-3.5 rounded-xl border border-emerald-500/10 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block">实到入库件</span>
                      <span className="text-[16px] font-extrabold text-emerald-600 font-mono block mt-1.5 leading-none">
                        {activeDrawerItem.storedQty.toLocaleString()}
                      </span>
                    </div>

                    {/* Qty 3 */}
                    <div className="bg-rose-50/15 p-3.5 rounded-xl border border-rose-500/10 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block">待收未到件</span>
                      <span className={`text-[16px] font-extrabold font-mono block mt-1.5 leading-none ${
                        activeDrawerItem.status === "OVERDUE" ? "text-rose-600 animate-pulse" : "text-slate-700"
                      }`}>
                        {activeDrawerItem.remainingQty.toLocaleString()}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Sub Financial Details */}
                <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5.5 space-y-4">
                  <h5 className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider">
                    采购单结算明细 / Cost Breakdown
                  </h5>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200/80 pb-2.5">
                      <span className="text-slate-450 font-bold">采购单价 (CNY / Cost)</span>
                      <span className="font-extrabold text-[#012b24] font-mono">
                        ¥{activeDrawerItem.unitPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-slate-200/80 pb-2.5">
                      <span className="text-slate-455 font-bold">采购意向合计款</span>
                      <span className="font-extrabold text-emerald-700 font-mono text-[13px]">
                        ¥{activeDrawerItem.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-slate-200/80 pb-2.5">
                      <span className="text-slate-455 font-bold">计划交货应交付日期</span>
                      <span className="font-extrabold text-slate-700 font-mono whitespace-nowrap">
                        📅 {activeDrawerItem.dueDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-455 font-bold">当前货期状态</span>
                      <div>
                        {activeDrawerItem.status === "OVERDUE" && (
                          <span className="px-2 py-0.5 rounded-sm bg-rose-500 text-white font-bold font-mono text-[9px]">
                            已超时 OVERDUE
                          </span>
                        )}
                        {activeDrawerItem.status === "PRODUCING" && (
                          <span className="px-2 py-0.5 rounded-sm bg-amber-450 text-white font-bold font-mono text-[9px]">
                            生产中 PRODUCING
                          </span>
                        )}
                        {activeDrawerItem.status === "STORING" && (
                          <span className="px-2 py-0.5 rounded-sm bg-blue-600 text-white font-bold font-mono text-[9px]">
                            部分入库 STORING
                          </span>
                        )}
                        {activeDrawerItem.status === "UPCOMING" && (
                          <span className="px-2 py-0.5 rounded-sm bg-emerald-600 text-white font-bold font-mono text-[9px]">
                            即将交付 UPCOMING
                          </span>
                        )}
                        {activeDrawerItem.status === "COMPLETED" && (
                          <span className="px-2 py-0.5 rounded-sm bg-slate-400 text-white font-bold font-mono text-[9px]">
                            已结款 COMPLETED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk and penalty calculations card */}
                {activeDrawerItem.status === "OVERDUE" && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-extrabold text-[11.5px]">
                      <AlertTriangle className="w-4 h-4 text-rose-500 animate-[bounce_1.5s_infinite]" />
                      <span>异常行为：货期延期扣款警示</span>
                    </div>
                    <p className="text-[10px] text-rose-600 leading-relaxed font-semibold">
                      当前订单已超出交期 <span className="font-mono text-xs font-black">{activeDrawerItem.overdueDays} 天</span>。
                      根据供应链延迟入库通用罚则，每日递增扣罚 ¥10.00/件。累计估算货期扣款计：
                      <span className="font-mono text-xs font-black block mt-1.5 text-[14px]">
                        ¥{activeDrawerItem.overdueDeduction.toLocaleString()} 元
                      </span>
                    </p>
                  </div>
                )}

                {/* Damage / Complaint details */}
                <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5.5 space-y-4">
                  <h5 className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider">
                    品质考核异常 / Quality Returns & Fees
                  </h5>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-650">
                    <div className="border-r border-slate-200/70 p-1">
                      <span>品质退货数量:</span>
                      <p className="text-sm font-extrabold text-slate-800 mt-1">
                        {activeDrawerItem.qualityReturns} 件
                      </p>
                    </div>
                    <div className="p-1 pl-4">
                      <span>质量直接扣款:</span>
                      <p className="text-sm font-extrabold text-rose-605 mt-1">
                        ¥{activeDrawerItem.qualityDeduction.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 leading-normal pl-1 border-l-2 border-emerald-500">
                    品质退换货与面料残损相关，若有疑义可拨采购排程专线或在线申请对账调整。
                  </div>
                </div>

                {/* Logistics Trace or Last Inbound */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    最新过账记录 / Last Activity Log
                  </span>
                  <div className="p-3 bg-slate-55 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>物流货单最近过账清点时间：</span>
                    <span className="font-extrabold text-slate-700 font-mono">
                      {activeDrawerItem.lastInboundTime}
                    </span>
                  </div>
                </div>

                {/* Action CTA list in drawer */}
                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setActiveDrawerItem(null);
                      setActiveTab("对账结算");
                      showToast(`🧾 正在跳转账期核数板块对账，核算 SKU [${activeDrawerItem.sku}]`);
                    }}
                    className="flex-grow py-2.5 bg-[#012b24] hover:bg-[#07362e] text-white font-bold rounded-xl text-center select-none cursor-pointer transition-all text-xs"
                  >
                    前往对账结算
                  </button>
                  <button
                    onClick={() => {
                      setActiveDrawerItem(null);
                      showToast("📞 正在呼叫采购跟单专员：王工 (138-xxxx-5678) 咨询交货异议...");
                    }}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-center select-none cursor-pointer transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>跟单复议</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
