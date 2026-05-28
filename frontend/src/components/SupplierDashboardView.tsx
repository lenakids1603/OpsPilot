import React, { useState, useMemo } from "react";
import { 
  FileText, X, Search, Bell, ArrowRight, Package, Truck, 
  DollarSign, ShieldAlert, Award, ChevronLeft, ChevronRight,
  AlertTriangle, UploadCloud, History, Plus, Phone
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
  setSelectedSku: (sku: string | null) => void;
  setModalType: (type: "quote" | "bill" | "detail" | null) => void;
  weeklyComplaintsCount: number;
}

export default function SupplierDashboardView({
  skus,
  setActiveTab,
  showToast,
  setSelectedSku,
  setModalType,
  weeklyComplaintsCount
}: SupplierDashboardViewProps) {
  // Local states for the Dashboard
  const [dashboardTimeframe, setDashboardTimeframe] = useState<"thisMonth" | "thisQuarter" | "last30Days">("thisMonth");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedMetricCard, setSelectedMetricCard] = useState<"none" | "procurement" | "todayArrival" | "pendingArrival">("none");
  const [searchSKU, setSearchSKU] = useState<string>("");
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"style" | "sku">("sku");

  const [deliveryForm, setDeliveryForm] = useState({
    poNo: "PO-20261011",
    skuCode: "LN-2024-W01-YL-80",
    qty: "500",
    carrier: "德邦快递",
    trackingNo: "DP72839210923",
  });

  const procurementPresetData = {
    thisMonth: {
      totalQty: 15400,
      totalAmount: 1085000,
      categories: [
        { name: "女童连衣裙", ratio: 42, amount: 455700, count: 6468 },
        { name: "童装外套", ratio: 31, amount: 336350, count: 4774 },
        { name: "精柔内衣裤", ratio: 27, amount: 292950, count: 4158 }
      ],
      trend: [1200, 1800, 2400, 3105, 2900, 3995],
      trendLabels: ["第1周", "第2周", "第3周", "第4周", "第5周", "第6周"]
    },
    thisQuarter: {
      totalQty: 48500,
      totalAmount: 3420000,
      categories: [
        { name: "女童连衣裙", ratio: 38, amount: 1299600, count: 18430 },
        { name: "童装外套", ratio: 34, amount: 1162800, count: 16490 },
        { name: "精柔内衣裤", ratio: 28, amount: 957600, count: 13580 }
      ],
      trend: [8000, 12000, 11000, 17500],
      trendLabels: ["第一阶段", "第二阶段", "第三阶段", "第四阶段"]
    },
    last30Days: {
      totalQty: 18200,
      totalAmount: 1280000,
      categories: [
        { name: "女童连衣裙", ratio: 40, amount: 512000, count: 7280 },
        { name: "童装外套", ratio: 35, amount: 448000, count: 6370 },
        { name: "精柔内衣裤", ratio: 25, amount: 320000, count: 4550 }
      ],
      trend: [3500, 4200, 4905, 5595],
      trendLabels: ["5/1-5/7", "5/8-5/14", "5/15-5/21", "5/22-5/28"]
    }
  };

  const [todayArrivals, setTodayArrivals] = useState([
    { id: "REC-20260528-01", poNo: "PO-20261011", skuCode: "LN-2024-W01-YL-80", styleNo: "LN-2024-W01", colorName: "柠檬黄", sizeName: "80码", qty: 600, category: "女童连衣裙", status: "已清点已过账", cost: 58.00, value: 34800, carrier: "顺丰速运", time: "09:30 AM" },
    { id: "REC-20260528-02", poNo: "PO-20261012", skuCode: "LN-2024-W02-NY-100", styleNo: "LN-2024-W02", colorName: "深邃蓝", sizeName: "100码", qty: 400, category: "童装外套", status: "已清点待账单", cost: 72.50, value: 29000, carrier: "德邦快递", time: "11:15 AM" },
    { id: "REC-20260528-03", poNo: "PO-20261013", skuCode: "LN-2501-M10-WT-110", styleNo: "LN-2501-M10", colorName: "珍珠白", sizeName: "110码", qty: 850, category: "精柔内衣裤", status: "质检中已锁库", cost: 45.00, value: 38250, carrier: "自主直送", time: "14:00 PM" }
  ]);

  const pendingArrivals = [
    { id: "AL-001", poNo: "PO-20261014", skuCode: "LN-2024-W01-PK-90", styleNo: "LN-2024-W01", colorName: "雅致粉", qty: 1200, category: "女童连衣裙", pendingQty: 1200, delayDays: 5, alertLevel: "high", reason: "交期逾期滞纳 (染厂胚布调拨延迟)" },
    { id: "AL-002", poNo: "PO-20261015", skuCode: "LN-2024-W02-RD-80", styleNo: "LN-2024-W02", colorName: "复古红", qty: 800, category: "童装外套", pendingQty: 550, delayDays: 2, alertLevel: "medium", reason: "干线物流阻滞 (德邦物流萧山集散中心异常滞留)" },
    { id: "AL-003", poNo: "PO-20261016", skuCode: "LN-2501-M10-GY-100", styleNo: "LN-2501-M10", colorName: "花灰", qty: 1500, category: "精柔内衣裤", pendingQty: 1500, delayDays: 0, alertLevel: "low", reason: "工艺会签抽检未通过，正在复核重整中" }
  ];

  const historicalArrival7Days = [
    { date: "5/22", count: 850, value: 5.6 },
    { date: "5/23", count: 1100, value: 7.9 },
    { date: "5/24", count: 1400, value: 9.8 },
    { date: "5/25", count: 1950, value: 13.5 },
    { date: "5/26", count: 1700, value: 11.2 },
    { date: "5/27", count: 2450, value: 16.8 },
    { date: "5/28", count: 1850, value: 10.2 }
  ];

  // Filters for Table C
  const filteredSkus = useMemo(() => {
    return skus.filter(s => {
      const matchSearch = s.sku.toLowerCase().includes(searchSKU.toLowerCase()) || s.colorName.includes(searchSKU);
      const matchCat = selectedCategory === "全部" || 
        (selectedCategory === "女童连衣裙" && s.sku.includes("W01")) ||
        (selectedCategory === "童装外套" && s.sku.includes("W02")) ||
        (selectedCategory === "精柔内衣裤" && s.sku.includes("M10"));
      return matchSearch && matchCat;
    });
  }, [skus, searchSKU, selectedCategory]);

  const filteredStyleGroups = useMemo(() => {
    const groups: Record<string, {
      styleNo: string;
      status: "生产中" | "待质检" | "已结案";
    }> = {};

    skus.forEach(s => {
      const matchCat = selectedCategory === "全部" || 
        (selectedCategory === "女童连衣裙" && s.sku.includes("W01")) ||
        (selectedCategory === "童装外套" && s.sku.includes("W02")) ||
        (selectedCategory === "精柔内衣裤" && s.sku.includes("M10"));

      if (matchCat) {
        if (!groups[s.styleNo]) {
          groups[s.styleNo] = {
            styleNo: s.styleNo,
            status: "已结案",
          };
        }
        if (s.status === "生产中") {
          groups[s.styleNo].status = "生产中";
        } else if (s.status === "待质检" && groups[s.styleNo].status !== "生产中") {
          groups[s.styleNo].status = "待质检";
        }
      }
    });

    return Object.values(groups).filter(g => 
      !searchSKU || g.styleNo.toLowerCase().includes(searchSKU.toLowerCase())
    );
  }, [skus, searchSKU, selectedCategory]);

  return (
    <div className="space-y-6 select-none animate-[fadeIn_0.5s_ease-out]">
      {/* Dashboard Control Filter Strip */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-extrabold uppercase">时间段切换:</span>
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 flex items-center">
            <button
              onClick={() => {
                setDashboardTimeframe("thisMonth");
                showToast("📅 已加载本月实时采购与入库汇总。");
              }}
              className={`px-3 py-1 text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                dashboardTimeframe === "thisMonth"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-455 hover:text-slate-700"
              }`}
            >
              本月财务期
            </button>
            <button
              onClick={() => {
                setDashboardTimeframe("thisQuarter");
                showToast("📅 已加载本季度跨期宏观对账与采购大数。");
              }}
              className={`px-3 py-1 text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                dashboardTimeframe === "thisQuarter"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-455 hover:text-slate-700"
              }`}
            >
              本季度
            </button>
            <button
              onClick={() => {
                setDashboardTimeframe("last30Days");
                showToast("📅 已加载近 30 天滑动运营周期数据。");
              }}
              className={`px-3 py-1 text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                dashboardTimeframe === "last30Days"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-455 hover:text-slate-700"
              }`}
            >
              近30天
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-extrabold uppercase ml-3">品类筛选:</span>
          <div className="flex items-center gap-1">
            {["全部", "女童连衣裙", "童装外套", "精柔内衣裤"].map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  showToast(`🔍 已筛选品类为: ${cat}`);
                }}
                className={`px-3 py-1 text-[10.5px] font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-black"
                    : "bg-white border-slate-150 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Comprehensive Search Field */}
        <div className="relative w-full md:w-56 rounded-xl border border-slate-205 py-1.5 pl-8 pr-3 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-400 transition-all">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索款号/SKU/采购物流单..."
            value={searchSKU}
            onChange={e => setSearchSKU(e.target.value)}
            className="w-full bg-transparent outline-none text-[11px] font-sans placeholder-slate-400 text-slate-700"
          />
          {searchSKU && (
            <button 
              onClick={() => setSearchSKU("")}
              className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Metric Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 采购总览 */}
        <div
          onClick={() => {
            setSelectedMetricCard(selectedMetricCard === "procurement" ? "none" : "procurement");
            showToast("💡 提示：点击大卡片下方已高亮过滤对应明细行。");
          }}
          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group ${
            selectedMetricCard === "procurement"
              ? "border-indigo-500 ring-2 ring-indigo-50"
              : "border-slate-100 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-black text-[10.5px] uppercase tracking-wide group-hover:text-indigo-650 transition-colors">
              采购总览 ({dashboardTimeframe === "thisMonth" ? "本月" : dashboardTimeframe === "thisQuarter" ? "本季" : "30天"})
            </span>
            <div className="p-1 px-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-[9px] font-bold">
              ERP订单源
            </div>
          </div>

          <div className="mt-3.5 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
                {(selectedCategory === "全部" 
                  ? procurementPresetData[dashboardTimeframe].totalQty 
                  : (procurementPresetData[dashboardTimeframe].categories.find(c => c.name === selectedCategory)?.count || 0)
                ).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">件</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              采购预计款：
              <span className="font-extrabold text-indigo-650 font-mono">
                ¥{(selectedCategory === "全部" 
                  ? procurementPresetData[dashboardTimeframe].totalAmount 
                  : (procurementPresetData[dashboardTimeframe].categories.find(c => c.name === selectedCategory)?.amount || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9.5px]">
            <span className="text-slate-400 font-medium">按单款穿透分析占比</span>
            <span className="text-indigo-600 font-extrabold group-hover:underline flex items-center gap-1">
              查看品类比率 <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: 今日到货登记 */}
        <div
          onClick={() => {
            setSelectedMetricCard(selectedMetricCard === "todayArrival" ? "none" : "todayArrival");
            showToast("💡 提示：点击今日入库卡片，下方已过滤属于今日实收的单据。");
          }}
          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group ${
            selectedMetricCard === "todayArrival"
              ? "border-emerald-500 ring-2 ring-emerald-5"
              : "border-slate-100 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-black text-[10.5px] uppercase tracking-wide group-hover:text-emerald-600 transition-colors">
              今日入库实收
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="mt-3.5 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
                {todayArrivals.reduce((sum, item) => {
                  if (selectedCategory !== "全部" && item.category !== selectedCategory) return sum;
                  return sum + item.qty;
                }, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">件</span>
            </div>
            <div className="text-[10px] text-slate-455 font-medium">
              入库清点估算：
              <span className="font-extrabold text-emerald-600 font-mono">
                ¥{todayArrivals.reduce((sum, item) => {
                  if (selectedCategory !== "全部" && item.category !== selectedCategory) return sum;
                  return sum + item.value;
                }, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9.5px]">
            <span className="text-emerald-600 font-extrabold font-sans">今日已过账：{todayArrivals.length} 笔款</span>
            <span className="text-slate-400 group-hover:text-slate-600 font-bold">卡片过滤明细</span>
          </div>
        </div>

        {/* Card 3: 待收 & 未到货警示 */}
        <div
          onClick={() => {
            setSelectedMetricCard(selectedMetricCard === "pendingArrival" ? "none" : "pendingArrival");
            showToast("💡 提示：点击待收警示，下方已过滤异常滞延入库细化预警。");
          }}
          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group ${
            selectedMetricCard === "pendingArrival"
              ? "border-amber-500 ring-2 ring-amber-50"
              : "border-slate-100 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-black text-[10.5px] uppercase tracking-wide group-hover:text-amber-600 transition-colors">
              待收 / 未到货提醒
            </span>
            <div className="p-1 rounded-md bg-amber-55 text-amber-700 text-[8.5px] font-black">
              {pendingArrivals.filter(p => p.delayDays > 0).length}项超期
            </div>
          </div>

          <div className="mt-3.5 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-600 font-mono tracking-tight animate-pulse">
                {pendingArrivals.reduce((sum, item) => {
                  if (selectedCategory !== "全部" && item.category !== selectedCategory) return sum;
                  return sum + item.pendingQty;
                }, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">件</span>
            </div>
            <div className="text-[10px] text-slate-455 font-medium">
              生产在外待发：
              <span className="font-extrabold text-slate-600">
                {pendingArrivals.filter(item => selectedCategory === "全部" || item.category === selectedCategory).length} 口款项 PO
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9.5px]">
            <span className="text-rose-500 font-extrabold flex items-center gap-1">
              高亮延迟入库项
            </span>
            <span className="text-slate-400 group-hover:text-amber-600 font-bold">点击追踪</span>
          </div>
        </div>

        {/* Card 4: 考核得分荣誉大盘 */}
        <div
          onClick={() => {
            setActiveTab("考核排名");
            showToast("🏆 已为您跳转到供应商考核评价大盘");
          }}
          className="bg-gradient-to-br from-[#0c1f35] to-[#163354] border border-slate-800 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <span className="text-indigo-200 font-black text-[10.5px] uppercase tracking-wide">
              本季考核与行业榜
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black text-[9px] scale-90 border border-emerald-500/20">
              一等评级 (S)
            </span>
          </div>

          <div className="mt-3 text-white flex items-center justify-between">
            <div>
              <span className="text-[9.5px] text-indigo-200 block opacity-80">综合绩效成绩</span>
              <span className="text-2xl font-extrabold font-mono tracking-tight">96.8<span className="text-xs text-indigo-300 font-sans font-medium"> 分</span></span>
            </div>
            <div className="text-right border-l border-white/10 pl-3">
              <span className="text-[9.5px] text-indigo-200 block opacity-80">杭州服饰排行</span>
              <span className="text-lg font-bold text-amber-400 font-mono">NO.2 <span className="text-[10px] text-indigo-200 font-sans font-medium">/ 32</span></span>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[9px] text-indigo-200">
            <span>出货合格率: 99.1%</span>
            <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
              查看排名表 <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Column 1: Charts & Data Trends visualization (8/12 scope) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Dynamic SVG Graphical Trend Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4 select-none">
              <div>
                <h4 className="font-extrabold text-slate-800 text-[12px] flex items-center gap-1.5 font-sans">
                  <History className="w-4 h-4 text-indigo-600" />
                  采购与历史到货过账入库趋势图 (近7天指标对齐)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  系统跟踪折线：今日物理入库计数 (件数，左轴) | 立柱高度：到货过账货款估值转化 (万元，右轴) 
                </p>
              </div>

              {/* Little legend pointers */}
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block shadow-xs" />
                  <span className="text-slate-500 font-bold">实际入库数量 (件)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-450 block shadow-xs" />
                  <span className="text-slate-500 font-bold">采购金额估值 (万元)</span>
                </div>
              </div>
            </div>

            {/* Handcrafted Responsive Pixel-Perfect Aesthetic SVG Chart area */}
            <div className="relative w-full h-[190px] bg-slate-50/25 rounded-xl border border-slate-101 p-2 overflow-hidden">
              <svg viewBox="0 0 500 180" className="w-full h-full" preserveAspectRatio="none">
                {/* SVG Gradients definitions */}
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                  </linearGradient>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Background Grids horizontal and vertical */}
                {[0, 1, 2, 3, 4].map(grid => {
                  const yVal = 15 + (grid * 32);
                  return (
                    <line
                      key={grid}
                      x1="40"
                      y1={yVal}
                      x2="485"
                      y2={yVal}
                      stroke="#e2e8f0"
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Draw Columns for Values (Amounts in Myriad Yuan) */}
                {historicalArrival7Days.map((val, idx) => {
                  const barW = 12;
                  const colX = 40 + (idx * (500 - 40 - 20) / (historicalArrival7Days.length - 1));
                  const maxAmt = 20;
                  const rectH = (val.value * (180 - 15 - 25) / maxAmt);
                  const rectY = 180 - 25 - rectH;

                  return (
                    <g key={idx}>
                      <rect
                        x={colX - (barW / 2)}
                        y={rectY}
                        width={barW}
                        height={rectH}
                        rx="3"
                        fill="url(#barGrad)"
                        className="transition-all hover:opacity-100 opacity-90 cursor-help"
                      >
                        <title>交付账款金额过账: ¥{(val.value * 10000).toLocaleString()}</title>
                      </rect>
                    </g>
                  );
                })}

                {/* Curves Line & Area representing quantities */}
                <path
                  d={(() => {
                    const pts = historicalArrival7Days.map((d, index) => {
                      const x = 40 + (index * (500 - 45) / (historicalArrival7Days.length - 1));
                      const maxQty = 2450;
                      const y = 180 - 25 - (d.count * (180 - 40) / maxQty);
                      return { x, y };
                    });
                    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  })()}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Gradient fill area beneath the quantity line */}
                <path
                  d={(() => {
                    const pts = historicalArrival7Days.map((d, index) => {
                      const x = 40 + (index * (500 - 45) / (historicalArrival7Days.length - 1));
                      const maxQty = 2450;
                      const y = 180 - 25 - (d.count * (180 - 40) / maxQty);
                      return { x, y };
                    });
                    const str = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    return `${str} L ${pts[pts.length - 1].x} 155 L 40 155 Z`;
                  })()}
                  fill="url(#areaGrad)"
                />

                {/* Nodes and Labels */}
                {historicalArrival7Days.map((d, index) => {
                  const x = 40 + (index * (500 - 45) / (historicalArrival7Days.length - 1));
                  const maxQty = 2450;
                  const y = 180 - 25 - (d.count * (180 - 40) / maxQty);

                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#4f46e5"
                        strokeWidth="1.8"
                        className="hover:scale-150 transition-transform cursor-pointer"
                      />
                      <text
                        x={x}
                        y={y - 8}
                        fontFamily="monospace"
                        fontSize="8"
                        fontWeight="bold"
                        fill="#312e81"
                        textAnchor="middle"
                      >
                        {d.count}
                      </text>

                      <text
                        x={x}
                        y="170"
                        fontFamily="sans-serif"
                        fontSize="8.5"
                        fontWeight="bold"
                        fill="#64748b"
                        textAnchor="middle"
                      >
                        {d.date}
                      </text>
                    </g>
                  );
                })}

                {["2.4k", "1.8k", "1.2k", "600"].map((tick, tIdx) => {
                  return (
                    <text
                      key={tick}
                      x="32"
                      y={20 + (tIdx * 34)}
                      fontFamily="sans-serif"
                      fontSize="7"
                      fontWeight="bold"
                      fill="#94a3b8"
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Category Breakdown Progress indicators */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-slate-800 text-[11.5px] uppercase">
                系统按类别采购占比核算
              </h4>
              <span className="text-[10px] text-slate-450 font-bold">总货值款：¥{procurementPresetData[dashboardTimeframe].totalAmount.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {procurementPresetData[dashboardTimeframe].categories.map((c, idx) => {
                const colorMap = idx === 0 ? "bg-indigo-600" : idx === 1 ? "bg-emerald-500" : "bg-sky-500";
                const textMap = idx === 0 ? "text-indigo-700" : idx === 1 ? "text-emerald-700" : "text-sky-700";
                const isSelected = selectedCategory === c.name;

                return (
                  <div 
                    key={c.name}
                    onClick={() => {
                      setSelectedCategory(c.name);
                      showToast(`已筛选大盘品类为: ${c.name}`);
                    }}
                    className={`p-3.5 border rounded-xl transition-all cursor-pointer ${
                      isSelected 
                        ? "border-indigo-300 bg-indigo-50/25 ring-1 ring-indigo-50" 
                        : "border-slate-101 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-705 text-[11px]">{c.name}</span>
                      <span className={`text-[11px] ${textMap}`}>{c.ratio}%</span>
                    </div>
                    {/* ProgressBar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${colorMap}`} style={{ width: `${c.ratio}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] text-slate-400 mt-2 font-medium">
                      <span>预计件数: <strong className="text-slate-700 font-extrabold">{c.count.toLocaleString()}</strong></span>
                      <span>分拨货款: <strong className="text-slate-705 font-bold font-mono">¥{c.amount.toLocaleString()}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Dashboard operational hub & actions (4/12 scope) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Quick Navigation Gateways */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3.5">
            <h4 className="font-extrabold text-slate-800 text-[11.5px] uppercase flex items-center gap-1">
              <Plus className="w-4 h-4 text-indigo-600" />
              管理入口主功能导航
            </h4>
            
            <p className="text-[10px] text-slate-450 leading-relaxed font-bold">
              快速进入协同系统相关页面：
            </p>

            <div className="space-y-2.5 pt-1.5 select-none text-[11px] font-bold">
              {/* Shortcut A */}
              <button
                onClick={() => {
                  setShowDeliveryModal(true);
                  showToast("🚀 已启用送货清点自主登记过账弹窗。");
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-xs"
              >
                <UploadCloud className="w-4 h-4 animate-bounce" />
                <span>入库登记 (到货自提登记)</span>
              </button>

              {/* Shortcut B */}
              <button
                onClick={() => {
                  setActiveTab("我的订单");
                  showToast("📂 进入我的订单详情页，查看排单生产中订单。");
                }}
                className="w-full py-3 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-755 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Truck className="w-4 h-4 text-indigo-650" />
                <span>采购单详情 (生管单溯源)</span>
              </button>

              {/* Shortcut B2 -款式报价 */}
              <button
                onClick={() => {
                  setActiveTab("款式报价");
                  showToast("📂 进入我的款式报价，填报最新样品。");
                }}
                className="w-full py-3 bg-[#fafbfe]/70 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>款式报价与新版审单</span>
              </button>

              {/* Shortcut C */}
              <button
                onClick={() => {
                  setActiveTab("对账结算");
                  showToast("📊 切换至账单核对，查看往月已入库未结清明细。");
                }}
                className="w-full py-3 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <DollarSign className="w-4 h-4 text-amber-653" />
                <span>账单核对 (往来财务清算)</span>
              </button>
            </div>
          </div>

          {/* Timeline Activity Alerts logs */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                <Bell className="w-4.5 h-4.5 text-indigo-650" />
                生产交付消息通知箱
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-4 pl-1 pl-1.5 text-[10px] border-l border-slate-100 font-medium font-sans">
              {todayArrivals.length > 3 && (
                <div className="relative pl-3.5 space-y-0.5">
                  <div className="absolute -left-[20.5px] top-1.5 w-1.6 h-1.6 rounded-full bg-emerald-600 border border-white" />
                  <span className="text-slate-400 block font-mono text-[9px]">刚刚提交</span>
                  <p className="text-slate-700 leading-normal font-bold">
                    自主入库托运已呈交过账：对应清算流单 <code className="text-emerald-700 font-mono font-bold leading-none bg-emerald-50 px-1 py-0.5 rounded text-[8.5px]">{todayArrivals[0].id}</code>
                  </p>
                </div>
              )}

              <div className="relative pl-3.5 space-y-0.5">
                <div className="absolute -left-[20.5px] top-1.5 w-1.6 h-1.6 rounded-full bg-indigo-650 border border-white" />
                <span className="text-slate-400 block font-mono text-[9px]">今日 14:00 PM</span>
                <p className="text-slate-700 leading-normal">
                  极收清点已录入，物理件核发流水批次 <code className="text-indigo-600 font-mono font-bold leading-none bg-indigo-50 px-1 py-0.5 rounded text-[8.5px]">REC-20260528-03</code> (850件)
                </p>
              </div>

              <div className="relative pl-3.5 space-y-0.5">
                <div className="absolute -left-[20.5px] top-1.5 w-1.6 h-1.6 rounded-full bg-[#10b981] border border-white" />
                <span className="text-slate-400 block font-mono text-[9px]">今日 09:30 AM</span>
                <p className="text-slate-700 leading-normal">
                  顺丰自派件已清点，对应账单流水 <code className="text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded text-[8.5px]">REC-20260528-01</code> 已核发
                </p>
              </div>

              <div className="relative pl-3.5 space-y-0.5">
                <div className="absolute -left-[20.5px] top-1.5 w-1.6 h-1.6 rounded-full bg-amber-500 border border-white" />
                <span className="text-slate-400 block font-mono text-[9px]">昨天 17:35 PM</span>
                <p className="text-slate-700 leading-normal">
                  王小悦接收了审单报价 <code className="text-slate-700 font-mono font-black bg-slate-50 px-1 py-0.5 rounded text-[8.5px]">LN-2024-W05</code>，工艺运行单已生成
                </p>
              </div>
            </div>

            <button
              onClick={() => showToast("⚡ 系统已对准供应链最近43小时日志数据。")}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-bold rounded-xl text-center transition-colors cursor-pointer"
            >
              刷新动态日志 (已完成同步)
            </button>
          </div>

          {/* Direct Support Contact desk */}
          <div className="p-4 bg-[#fafbfe]/55 border border-slate-101 rounded-2xl flex items-center justify-between text-[11px] leading-snug">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-805 border border-emerald-200 flex items-center justify-center font-black">
                王
              </div>
              <div className="space-y-0.2 font-sans font-medium">
                <span className="font-bold text-slate-800 block">采购对接人 - 王小悦</span>
                <span className="text-[9.5px] text-slate-400 font-mono block">电话: 138-xxxx-5678</span>
              </div>
            </div>
            <a 
              href="tel:13800005678" 
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
              title="一键致电采购部"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Drill-down Verification Tabbed panels */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase font-sans">
              <FileText className="w-4 h-4 text-indigo-650" />
              采购入库与提醒细节穿透层
            </h4>
            <p className="text-[10px] text-slate-400">
              {selectedMetricCard === "none" && "💡 快速提示：点击上方的大数据卡片，可以自动在此穿透过滤下面的表格指标。"}
              {selectedMetricCard === "procurement" && "🎯 当前已锁定高亮：【采购总览】穿透信息，显示核心 SKU 指标明细。"}
              {selectedMetricCard === "todayArrival" && "🎯 当前已锁定高亮：【今日入库实收】已交付流水记录清单。"}
              {selectedMetricCard === "pendingArrival" && "🎯 当前已锁定高亮：【待入仓缺额】与受阻物流预警清单，请加急排催。"}
            </p>
          </div>

          {/* Search count pill or filter resets */}
          {(selectedMetricCard !== "none" || selectedCategory !== "全部" || searchSKU !== "") && (
            <button
              onClick={() => {
                setSelectedMetricCard("none");
                setSelectedCategory("全部");
                setSearchSKU("");
                showToast("🧹 已成功撤销全部穿透过滤器，大盘恢复初态。");
              }}
              className="px-2.5 py-1 text-[9.5px] border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-lg transition-colors cursor-pointer"
            >
              清除所有穿透筛选
            </button>
          )}
        </div>

        {/* Drilldown tables */}
        <div className="space-y-6">
          {/* Table A: Today's Arrival Received list */}
          {(selectedMetricCard === "none" || selectedMetricCard === "todayArrival") && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-extrabold">
                <span className="text-emerald-700 flex items-center gap-1 leading-none font-bold">
                  <span className="w-1.8 h-1.8 rounded-full bg-emerald-500 animate-ping inline-block" />
                  ① 今日实收物理入库清点流水明细 (共 {todayArrivals.filter(arr => {
                    const matchCat = selectedCategory === "全部" || arr.category === selectedCategory;
                    const matchKeyword = !searchSKU || 
                      arr.skuCode.toLowerCase().includes(searchSKU.toLowerCase()) || 
                      arr.poNo.toLowerCase().includes(searchSKU.toLowerCase()) || 
                      arr.id.toLowerCase().includes(searchSKU.toLowerCase());
                    return matchCat && matchKeyword;
                  }).length} 笔)
                </span>
                <span className="text-slate-450">实时汇总过账：¥{todayArrivals.filter(arr => {
                  const matchCat = selectedCategory === "全部" || arr.category === selectedCategory;
                  const matchKeyword = !searchSKU || 
                    arr.skuCode.toLowerCase().includes(searchSKU.toLowerCase()) || 
                    arr.poNo.toLowerCase().includes(searchSKU.toLowerCase());
                  return matchCat && matchKeyword;
                }).reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
              </div>

              <div className="overflow-x-auto text-[11px] font-medium leading-normal border border-slate-100 rounded-xl bg-slate-50/20">
                <table className="w-full text-left border-collapse text-slate-600">
                  <thead className="bg-[#f8f9fb] border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase">
                    <tr>
                      <th className="p-3 pl-4">到货过账流水号</th>
                      <th className="p-3">关联采购单 PO</th>
                      <th className="p-3">SKU 编号</th>
                      <th className="p-3 text-center">规格/颜色</th>
                      <th className="p-3 text-center">清点件数</th>
                      <th className="p-3 text-center">系统对账状态</th>
                      <th className="p-3 text-center">运输承运商</th>
                      <th className="p-3 pr-4 text-right">入库实估金额</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {todayArrivals.filter(arr => {
                      const matchCat = selectedCategory === "全部" || arr.category === selectedCategory;
                      const matchKeyword = !searchSKU || 
                        arr.skuCode.toLowerCase().includes(searchSKU.toLowerCase()) || 
                        arr.poNo.toLowerCase().includes(searchSKU.toLowerCase()) || 
                        arr.id.toLowerCase().includes(searchSKU.toLowerCase());
                      return matchCat && matchKeyword;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400 font-medium">
                          没有符合条件或搜索到货记录。您可以通过最右侧 “入库登记” 提交自主货包。
                        </td>
                      </tr>
                    ) : (
                      todayArrivals.filter(arr => {
                        const matchCat = selectedCategory === "全部" || arr.category === selectedCategory;
                        const matchKeyword = !searchSKU || 
                          arr.skuCode.toLowerCase().includes(searchSKU.toLowerCase()) || 
                          arr.poNo.toLowerCase().includes(searchSKU.toLowerCase()) || 
                          arr.id.toLowerCase().includes(searchSKU.toLowerCase());
                        return matchCat && matchKeyword;
                      }).map(arr => (
                        <tr key={arr.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 pl-4 font-bold text-slate-800 font-mono">{arr.id}</td>
                          <td className="p-3 font-semibold text-slate-700 font-mono">{arr.poNo}</td>
                          <td className="p-3 font-bold text-slate-800 font-mono tracking-tight">{arr.skuCode}</td>
                          <td className="p-3 text-center">
                            <span className="font-extrabold text-slate-700">{arr.colorName}</span> / {arr.sizeName}
                          </td>
                          <td className="p-3 text-center text-indigo-700 font-extrabold font-mono text-[11.5px]">{arr.qty} 件</td>
                          <td className="p-3 text-center font-sans font-bold">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              arr.status.includes("已清洗") || arr.status.includes("已过账") || arr.status.includes("已清点")
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-sky-50 text-sky-700 border-sky-100 animate-pulse"
                            }`}>
                              {arr.status}
                            </span>
                          </td>
                          <td className="p-3 text-center text-slate-500">{arr.carrier} <span className="text-[8.5px] opacity-70 block font-mono mt-0.5">{arr.time}</span></td>
                          <td className="p-3 pr-4 text-right font-black font-mono text-emerald-600">¥{arr.value.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table B: Pending and Delays Exception Warning list */}
          {(selectedMetricCard === "none" || selectedMetricCard === "pendingArrival") && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold">
                <span className="text-amber-600 flex items-center gap-1 leading-none font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 animate-pulse inline-block" />
                  ② 待交付到货计划与超期警示单 (共 {pendingArrivals.filter(arr => {
                    const matchCat = selectedCategory === "全部" || arr.category === selectedCategory;
                    const matchKeyword = !searchSKU || 
                      arr.skuCode.toLowerCase().includes(searchSKU.toLowerCase()) || 
                      arr.poNo.toLowerCase().includes(searchSKU.toLowerCase()) || 
                      arr.reason.toLowerCase().includes(searchSKU.toLowerCase());
                    return matchCat && matchKeyword;
                  }).length} 笔)
                </span>
                <span className="text-rose-600">超期延迟比例较高，染厂正在干洗排期中</span>
              </div>

              <div className="overflow-x-auto text-[11px] font-medium leading-normal border border-slate-100 rounded-xl bg-rose-50/5">
                <table className="w-full text-left border-collapse text-slate-600">
                  <thead className="bg-[#fdfbfc] border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase">
                    <tr>
                      <th className="p-3 pl-4">采购单 PO</th>
                      <th className="p-3">SKU 编号</th>
                      <th className="p-3">对应颜色</th>
                      <th className="p-3 text-center">采购定货数</th>
                      <th className="p-3 text-center">待入仓库缺数</th>
                      <th className="p-3 text-center">超期延滞天数</th>
                      <th className="p-3 text-center">预警等级</th>
                      <th className="p-3 pr-4 text-right">主要受阻滞后原因明细</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pendingArrivals.filter(arr => {
                      const matchCat = selectedCategory === "全部" || arr.category === selectedCategory;
                      const matchKeyword = !searchSKU || 
                        arr.skuCode.toLowerCase().includes(searchSKU.toLowerCase()) || 
                        arr.poNo.toLowerCase().includes(searchSKU.toLowerCase()) || 
                        arr.reason.toLowerCase().includes(searchSKU.toLowerCase());
                      return matchCat && matchKeyword;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400 font-medium">
                          未检索到采购延迟预警款式。
                        </td>
                      </tr>
                    ) : (
                      pendingArrivals.filter(arr => {
                        const matchCat = selectedCategory === "全部" || arr.category === selectedCategory;
                        const matchKeyword = !searchSKU || 
                          arr.skuCode.toLowerCase().includes(searchSKU.toLowerCase()) || 
                          arr.poNo.toLowerCase().includes(searchSKU.toLowerCase()) || 
                          arr.reason.toLowerCase().includes(searchSKU.toLowerCase());
                        return matchCat && matchKeyword;
                      }).map(arr => (
                        <tr key={arr.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 pl-4 font-extrabold text-slate-800 font-mono">{arr.poNo}</td>
                          <td className="p-3 font-extrabold text-slate-800 font-mono tracking-tight">{arr.skuCode}</td>
                          <td className="p-3 font-semibold text-slate-700">{arr.colorName}</td>
                          <td className="p-3 text-center font-mono">{arr.qty}</td>
                          <td className="p-3 text-center font-extrabold font-mono text-rose-500 text-[11.5px]">{arr.pendingQty} 件</td>
                          <td className="p-3 text-center font-sans font-bold">
                            {arr.delayDays > 0 ? (
                              <span className="text-rose-600 font-black flex items-center justify-center gap-0.5 animate-pulse">
                                ⚠️ 延误 {arr.delayDays} 天
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">按计划推进</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-sans font-black">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
                              arr.alertLevel === "high"
                                ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                                : arr.alertLevel === "medium"
                                  ? "bg-amber-100 text-amber-600 border border-amber-300"
                                  : "bg-sky-50 text-sky-700 border-sky-100"
                            }`}>
                              {arr.alertLevel === "high" ? "🚨 重度延迟" : arr.alertLevel === "medium" ? "⏳ 中途受阻" : "正常"}
                            </span>
                          </td>
                          <td className="p-3 pr-4 text-right text-[10px] text-slate-500 font-sans max-w-[245px] truncate" title={arr.reason}>
                            {arr.reason}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table C: Original Core SKU Quality / Delivery Monitor (Preserving and Integrating) */}
          {(selectedMetricCard === "none" || selectedMetricCard === "procurement") && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                <span className="text-indigo-700 flex items-center gap-1 font-bold">
                  <Package className="w-4 h-4 text-indigo-600" />
                  ③ 核心款式工艺结算价挂牌穿透对账 (共 {filteredSkus.length} 款)
                </span>
                <div className="bg-slate-100 p-0.5 rounded-lg text-[9.5px] font-black">
                  <button onClick={() => setViewMode("sku")} className={`px-2.5 py-0.5 rounded-md ${viewMode === "sku" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-400"}`}>以SKU列</button>
                  <button onClick={() => setViewMode("style")} className={`px-2.5 py-0.5 rounded-md ${viewMode === "style" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-400"}`}>以款号列</button>
                </div>
              </div>

              <div className="overflow-x-auto text-[11px] font-medium leading-normal border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-slate-600">
                  <thead className="bg-[#fafbfc] border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase">
                    {viewMode === "sku" ? (
                      <tr>
                        <th className="p-3 pl-4 font-bold">SKU ID</th>
                        <th className="p-3 text-center">对应颜色</th>
                        <th className="p-3 text-center">规格尺寸</th>
                        <th className="p-3 text-center">提领出厂单价</th>
                        <th className="p-3 text-center">大货运行状态</th>
                        <th className="p-3 pr-4 text-right">核定详情</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-3 pl-4 font-bold">大货款号 (Style Number)</th>
                        <th className="p-3">款式简要描述</th>
                        <th className="p-3 text-center">工艺运行状态</th>
                        <th className="p-3 pr-4 text-right">核定操作</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {viewMode === "sku" ? (
                      filteredSkus.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                            没能查到该款号。
                          </td>
                        </tr>
                      ) : (
                        filteredSkus.map(s => (
                          <tr key={s.sku} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 pl-4 font-bold text-slate-800 font-mono tracking-wide">{s.sku}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center">
                                <div className={`w-11 h-6 rounded ${s.colorHex} shadow-xs border border-slate-100/40 relative flex items-center justify-center font-extrabold text-[8px] text-zinc-900 uppercase`}>
                                  {s.colorName}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center font-bold text-slate-705">{s.sizeName}</td>
                            <td className="p-3 text-center font-bold font-mono text-slate-500">¥{s.cost.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                s.status === "生产中" 
                                  ? "bg-sky-50 text-sky-700 border-sky-100 animate-pulse" 
                                  : s.status === "待质检" 
                                    ? "bg-amber-5 text-amber-600 border-amber-100" 
                                    : "bg-slate-100 text-slate-400 border-slate-200"
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="p-3 pr-4 text-right select-none">
                              <button
                                onClick={() => {
                                  setSelectedSku(s.sku);
                                  setModalType("detail");
                                }}
                                className="text-indigo-650 hover:text-indigo-850 font-black hover:underline cursor-pointer"
                              >
                                核心档案细节
                              </button>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      filteredStyleGroups.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">
                            未检索到对应款式。
                          </td>
                        </tr>
                      ) : (
                        filteredStyleGroups.map(g => {
                          let styleName = "精品服饰款式";
                          if (g.styleNo === "LN-2024-W01") styleName = "公主花边爬服款式";
                          else if (g.styleNo === "LN-2024-W02") styleName = "双排扣纯羊毛高档童大衣";
                          else if (g.styleNo === "LN-2501-M10") styleName = "丝光棉圆领极柔童装T恤";
                          else if (g.styleNo === "LN-2024-W03") styleName = "纯针织雕花镂空开衫精选";

                          return (
                            <tr key={g.styleNo} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 pl-4 font-bold text-slate-800 font-mono tracking-wide">{g.styleNo}</td>
                              <td className="p-3 text-slate-700 font-bold">{styleName}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                  g.status === "生产中" 
                                    ? "bg-sky-50 text-sky-700 border-sky-100 animate-pulse" 
                                    : g.status === "待质检" 
                                      ? "bg-amber-5 text-amber-600 border-amber-100" 
                                      : "bg-slate-100 text-slate-400 border-slate-200"
                                  }`}>
                                    {g.status}
                                  </span>
                                </td>
                                <td className="p-3 pr-4 text-right select-none">
                                  <button
                                    onClick={() => {
                                      setSelectedSku(g.styleNo);
                                      setModalType("detail");
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 font-black hover:underline cursor-pointer"
                                  >
                                    挂牌细节参数
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dialog A: 到货发货物理清点登记表单 */}
        <AnimatePresence>
          {showDeliveryModal && (
            <div className="fixed inset-0 bg-[#001025]/60 flex items-center justify-center z-[1000] p-4 select-none animate-[fadeIn_0.2s_ease-out]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <h4 className="text-slate-800 font-extrabold text-[13px]">
                      物理到货签收过账登记 (实收录入)
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const qtyInt = parseInt(deliveryForm.qty) || 200;
                    const matchedSku = skus.find(s => s.sku === deliveryForm.skuCode);
                    const costVal = matchedSku ? matchedSku.cost : 50.00;
                    const calculatedVal = qtyInt * costVal;

                    const newRec = {
                      id: `REC-20260528-${Math.floor(100 + Math.random() * 900)}`,
                      poNo: deliveryForm.poNo,
                      skuCode: deliveryForm.skuCode,
                      styleNo: deliveryForm.skuCode.split('-').slice(0, 3).join('-') || "LN-2024-W01",
                      colorName: matchedSku ? matchedSku.colorName : "雅致粉",
                      sizeName: matchedSku ? matchedSku.sizeName.split(' ')[0] : "80码",
                      qty: qtyInt,
                      category: deliveryForm.skuCode.includes("W01") ? "女童连衣裙" : deliveryForm.skuCode.includes("W02") ? "童装外套" : "精柔内衣裤",
                      status: "清点待转账结算",
                      cost: costVal,
                      value: calculatedVal,
                      carrier: deliveryForm.carrier,
                      time: "刚刚记账"
                    };

                    setTodayArrivals([newRec, ...todayArrivals]);
                    setShowDeliveryModal(false);
                    showToast(`🎉 成功录入！到货清点: ${qtyInt}件，账款估值: ¥${calculatedVal.toLocaleString()}。`);
                  }}
                  className="space-y-4 text-xs font-semibold"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-[10px] font-black uppercase text-left block mb-1">采购单 PO 号码</label>
                      <select
                        value={deliveryForm.poNo}
                        onChange={e => setDeliveryForm({ ...deliveryForm, poNo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-[11px] focus:bg-white focus:border-indigo-400 outline-none"
                      >
                        <option value="PO-20261011">PO-20261011 (连衣裙大单)</option>
                        <option value="PO-20261012">PO-20261012 (羊毛大衣单)</option>
                        <option value="PO-20261013">PO-20261013 (内衣针织款)</option>
                        <option value="PO-20261025">PO-20261025 (加急工艺追尾单)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 text-[10px] font-black uppercase text-left block mb-1">实到 SKU 代号</label>
                      <select
                        value={deliveryForm.skuCode}
                        onChange={e => setDeliveryForm({ ...deliveryForm, skuCode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-[11px] font-mono focus:bg-white focus:border-indigo-400 outline-none"
                      >
                        {skus.map(s => (
                          <option key={s.sku} value={s.sku}>
                            {s.sku} ({s.colorName} {s.sizeName.split(' ')[0]})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 text-[10px] font-black uppercase text-left block mb-1">实收交付件数 (*)</label>
                      <input
                        type="number"
                        value={deliveryForm.qty}
                        onChange={e => setDeliveryForm({ ...deliveryForm, qty: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-[11px] font-mono focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-[10px] font-black uppercase text-left block mb-1">托运承运商</label>
                      <input
                        type="text"
                        value={deliveryForm.carrier}
                        onChange={e => setDeliveryForm({ ...deliveryForm, carrier: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-[11px] focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-[10px] font-black uppercase text-left block mb-1">物流运单号</label>
                      <input
                        type="text"
                        value={deliveryForm.trackingNo}
                        onChange={e => setDeliveryForm({ ...deliveryForm, trackingNo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-[11px] font-mono focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 space-y-1 text-[10px] text-emerald-700">
                    <p className="font-extrabold">📌 数据实收联动说明：</p>
                    <p className="leading-relaxed">
                      提报此到货发货登记后，系统将模拟物理仓库的条码清点实测核对，自动累加至上方【今日入库实收】指标中进行全域穿准追踪！
                    </p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowDeliveryModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black cursor-pointer transition-all shadow-sm"
                    >
                      提报物理登记
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
