/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, Upload, Scale, BookOpen, Download, AlertTriangle, RefreshCw, BarChart2, CheckCircle2,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, ShieldAlert, AlertCircle, HelpCircle,
  Lightbulb, ChevronRight, Check, X, Printer, Landmark, DollarSign, PieChart, Percent, FileText,
  Clock, Settings, Edit3
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import OverviewKPIsDetailDrawer from "./components/OverviewKPIsDetailDrawer";

interface Proprietor {
  name: string;
  annualSales: number;
  percentage: number;
  status: "正常" | "风险" | "停用";
}

interface SupplierBill {
  supplier: string;
  amount: number;
  difference: number;
  status: "已结清" | "异常" | "待付款";
}

interface AlertItem {
  id: string;
  type: "高风险" | "异常" | "提醒" | "逾期";
  title: string;
  detail: string;
  amount: string;
  time: string;
  actionText: string;
  isResolved?: boolean;
}

export default function FinanceOverviewPage() {
  // Filters state
  const [timeRange, setTimeRange] = useState<"day" | "yesterday" | "month" | "lastMonth" | "custom">("month");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedShop, setSelectedShop] = useState("all");

  // Custom range and book balances state
  const [customStartDate, setCustomStartDate] = useState("2026-05-01T00:00");
  const [customEndDate, setCustomEndDate] = useState("2026-05-26T23:59");
  const [currentBookBalance, setCurrentBookBalance] = useState(12420000); // Default book balance matching accounts ¥12.42M
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [editedBalanceValue, setEditedBalanceValue] = useState("12420000");

  // Drill-down Detail Drawer type
  const [activeDetailType, setActiveDetailType] = useState<"invoice_available" | "invoice_completed" | "payment_paid" | null>(null);

  // Monitor URL parameters for direct deep-linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const detail = params.get("detail");
    if (detail === "invoice_available") {
      setActiveDetailType("invoice_available");
    } else if (detail === "invoice_completed" || detail === "invoiced") {
      setActiveDetailType("invoice_completed");
    } else if (detail === "payment_paid" || detail === "paid") {
      setActiveDetailType("payment_paid");
    }
  }, []);

  const openDetailDrawer = (type: "invoice_available" | "invoice_completed" | "payment_paid") => {
    setActiveDetailType(type);
    const params = new URLSearchParams(window.location.search);
    params.set("detail", type);
    window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  const closeDetailDrawer = () => {
    setActiveDetailType(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("detail");
    const newSearch = params.toString();
    window.history.pushState(null, "", `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`);
  };

  // Interaction Modals/Drawers
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);
  const [isSupplierReconOpen, setIsSupplierReconOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [handlingAlertId, setHandlingAlertId] = useState<string | null>(null);
  
  // Custom Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for New Expense
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("货款");
  const [expenseProprietor, setExpenseProprietor] = useState("义乌市乐娜商贸部");

  // Interactive state lists supporting real addition
  const [recentExpenses, setRecentExpenses] = useState<Array<{title: string, amount: number, category: string, date: string}>>([
    { title: "支付织锦服饰第4批货款", amount: 280000, category: "货款", date: "今天 10:15" },
    { title: "跨越速递物流结算", amount: 45000, category: "物流快递", date: "今天 09:30" }
  ]);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: "alert-1",
      type: "高风险",
      title: "额度告警：杭州心选服饰年度流入已达 482 万",
      detail: "系统已自动暂停该主体收款任务，请尽快启用新主体。",
      amount: "¥4,820,000",
      time: "10分前",
      actionText: "立即处理"
    },
    {
      id: "alert-2",
      type: "异常",
      title: "同步失败：招商银行 (8923) 流水拉取异常",
      detail: "网银接口响应超时，最后成功同步：09:32:00",
      amount: "—",
      time: "2小时前",
      actionText: "重试同步"
    },
    {
      id: "alert-3",
      type: "提醒",
      title: "待支付供应商：亮亮童装面料商差异金额确认",
      detail: "到货金额与账单金额不一致 (+¥5,000)，需人工核对。",
      amount: "¥325,000",
      time: "今天 08:45",
      actionText: "查看明细"
    },
    {
      id: "alert-4",
      type: "逾期",
      title: "逾期未付：织锦服饰加工厂 (Q3季度尾款)",
      detail: "已超过约定结账期 5 天，可能影响后续拿货优先级。",
      amount: "¥150,000",
      time: "5天前",
      actionText: "去结算"
    }
  ]);

  const [proprietors, setProprietors] = useState<Proprietor[]>([
    { name: "杭州心选服饰有限公司", annualSales: 4820000, percentage: 96, status: "停用" },
    { name: "滨江区章乐制衣厂", annualSales: 4150000, percentage: 83, status: "风险" },
    { name: "义乌市尚品童装店", annualSales: 1250000, percentage: 25, status: "正常" }
  ]);

  const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([
    { supplier: "织锦服饰加工厂", amount: 450000, difference: 0, status: "已结清" },
    { supplier: "亮亮童装面料商", amount: 325000, difference: 5000, status: "异常" },
    { supplier: "宏大物流园", amount: 125000, difference: 0, status: "待付款" }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Dynamic statistics engine based on filter selections
  const getFilteredKpis = () => {
    let baseInc = 3450000;
    let baseExp = 2100000;
    let baseInvAble = 2950000;
    let baseInvEd = 2050000;
    let basePaid = 1850050;
    let subtextInc = "";
    let subtextExp = "";
    let statusLabelInc = "";
    let statusLabelExp = "";

    // Normalize input selections for descriptive text
    const platformNames: Record<string, string> = { all: "全部平台", dy: "抖音", taobao: "淘宝/天猫", ks: "快手", pdd: "拼多多" };
    const shopNames: Record<string, string> = {
      all: "全部店铺",
      "shop-dy1": "乐娜童装抖音店",
      "shop-dy2": "安安婴儿服饰店",
      "shop-tb1": "织锦服饰天猫店",
      "shop-ks1": "乐娜快手直播店",
      "shop-pdd1": "安安皮皮拼多多店"
    };

    if (timeRange === "day") {
      baseInc = 128000;
      baseExp = 98000;
      baseInvAble = 110000;
      baseInvEd = 82000;
      basePaid = 91000;
      subtextInc = "对比昨日 +¥14,200 | 今日净现金流 +¥30,000";
      subtextExp = "今日预算执行 75% | 实时资金链稳定";
      statusLabelInc = "今日流入";
      statusLabelExp = "今日流出";
    } else if (timeRange === "yesterday") {
      baseInc = 113800;
      baseExp = 85600;
      baseInvAble = 98000;
      baseInvEd = 71000;
      basePaid = 78000;
      subtextInc = "对比前日 +¥9,400 | 网银全渠道自动同步";
      subtextExp = "预算执行率 68% | 包含货款、物流款";
      statusLabelInc = "昨日流入";
      statusLabelExp = "昨日流出";
    } else if (timeRange === "lastMonth") {
      baseInc = 3210000;
      baseExp = 1980000;
      baseInvAble = 2800000;
      baseInvEd = 1950000;
      basePaid = 1750000;
      subtextInc = "上月同期实到 ¥3,188,540 | 已出合规发票";
      subtextExp = "上月财务完整度 100% | 无异常差异挂账";
      statusLabelInc = "上月累计流入";
      statusLabelExp = "上月累计流出";
    } else if (timeRange === "custom") {
      let customDays = 30;
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        customDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      }
      baseInc = customDays * 95000;
      baseExp = customDays * 57000;
      baseInvAble = customDays * 82000;
      baseInvEd = customDays * 52000;
      basePaid = customDays * 51000;
      subtextInc = `自定义跨度(${customDays}天)数据归总 | 平均日流入 ¥95,000`;
      subtextExp = `整体流向健康 | 平均日支出 ¥57,000`;
      statusLabelInc = "选定周期总收入";
      statusLabelExp = "选定周期总支出";
    } else {
      // "month"
      baseInc = 3450000;
      baseExp = 2100000;
      baseInvAble = 2950000;
      baseInvEd = 2050000;
      basePaid = 1850050;
      subtextInc = "对比上月同期 (+12.5%) | 本月预估净利润 ¥450,000";
      subtextExp = "供应商货款 126万 | 待付供应商 ¥1,580,000";
      statusLabelInc = "本月累计流入";
      statusLabelExp = "本月累计流出";
    }

    // Dynamic Multipliers
    let multiplier = 1.0;
    if (selectedPlatform === "dy") {
      multiplier *= 0.55;
      if (selectedShop === "shop-dy1") multiplier *= 0.70;
      else if (selectedShop === "shop-dy2") multiplier *= 0.30;
    } else if (selectedPlatform === "taobao") {
      multiplier *= 0.25;
      if (selectedShop === "shop-tb1") multiplier *= 1.0;
    } else if (selectedPlatform === "ks") {
      multiplier *= 0.12;
      if (selectedShop === "shop-ks1") multiplier *= 1.0;
    } else if (selectedPlatform === "pdd") {
      multiplier *= 0.08;
      if (selectedShop === "shop-pdd1") multiplier *= 1.0;
    } else {
      // selectedPlatform === "all"
      if (selectedShop === "shop-dy1") multiplier *= 0.38;
      else if (selectedShop === "shop-dy2") multiplier *= 0.17;
      else if (selectedShop === "shop-tb1") multiplier *= 0.25;
      else if (selectedShop === "shop-ks1") multiplier *= 0.12;
      else if (selectedShop === "shop-pdd1") multiplier *= 0.08;
    }

    // Output final rounded calculations
    const finalIncome = Math.round(baseInc * multiplier);
    const finalExpense = Math.round(baseExp * multiplier);
    const finalInvAble = Math.round(baseInvAble * multiplier);
    const finalInvEd = Math.round(baseInvEd * multiplier);
    const finalPaid = Math.round(basePaid * multiplier);
    const netCashflow = finalIncome - finalExpense;

    // Detailed annotation explaining active filters
    const filterDesc = `${platformNames[selectedPlatform]} • ${shopNames[selectedShop] || "所选店铺"}`;

    return {
      income: finalIncome,
      expense: finalExpense,
      net: netCashflow,
      invoiceable: finalInvAble,
      invoiced: finalInvEd,
      paid: finalPaid,
      subInc: subtextInc,
      subExp: subtextExp,
      titleInc: statusLabelInc,
      titleExp: statusLabelExp,
      desc: filterDesc
    };
  };

  const kpis = getFilteredKpis();

  // Dynamic Initial Capital Calculator based on company's cash position trends
  const getInitialCapital = () => {
    let multiplier = 1.0;
    if (selectedPlatform === "dy") {
      multiplier *= 0.55;
      if (selectedShop === "shop-dy1") multiplier *= 0.70;
      else if (selectedShop === "shop-dy2") multiplier *= 0.30;
    } else if (selectedPlatform === "taobao") {
      multiplier *= 0.25;
      if (selectedShop === "shop-tb1") multiplier *= 1.0;
    } else if (selectedPlatform === "ks") {
      multiplier *= 0.12;
      if (selectedShop === "shop-ks1") multiplier *= 1.0;
    } else if (selectedPlatform === "pdd") {
      multiplier *= 0.08;
      if (selectedShop === "shop-pdd1") multiplier *= 1.0;
    } else {
      if (selectedShop === "shop-dy1") multiplier *= 0.38;
      else if (selectedShop === "shop-dy2") multiplier *= 0.17;
      else if (selectedShop === "shop-tb1") multiplier *= 0.25;
      else if (selectedShop === "shop-ks1") multiplier *= 0.12;
      else if (selectedShop === "shop-pdd1") multiplier *= 0.08;
    }

    if (timeRange === "day") {
      // Balance today at 00:00:00 = current - today's net cashflow
      const netToday = (128000 - 98000) * multiplier;
      return Math.round(currentBookBalance - netToday);
    } else if (timeRange === "yesterday") {
      // Balance yesterday at 00:00:00 = current - today's net - yesterday's net
      const netToday = (128000 - 98000) * multiplier;
      const netYesterday = (113800 - 85600) * multiplier;
      return Math.round(currentBookBalance - netToday - netYesterday);
    } else if (timeRange === "month") {
      // Balance on 1st of this month = current - this month's net cashflow
      const netMonth = (3450000 - 2100000) * multiplier;
      return Math.round(currentBookBalance - netMonth);
    } else if (timeRange === "lastMonth") {
      // Balance on 1st of last month = current - this month's net - last month's net
      const netMonth = (3450000 - 2100000) * multiplier;
      const netLastMonth = (3210000 - 1980000) * multiplier;
      return Math.round(currentBookBalance - netMonth - netLastMonth);
    } else if (timeRange === "custom") {
      // Calculate timespan from start of custom range to May 26, 2026
      const start = new Date(customStartDate);
      const today = new Date("2026-05-26T09:20:39Z");
      const diffTime = today.getTime() - start.getTime();
      const daysAgo = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const effectiveDaysAgo = daysAgo > 0 ? daysAgo : 0;
      const netSinceStart = effectiveDaysAgo * 52000 * multiplier;
      return Math.round(currentBookBalance - netSinceStart);
    }
    return currentBookBalance;
  };

  const initialCapital = getInitialCapital();

  // Dynamic status/subtitle descriptions for the period initial capital
  const getInitialCapitalSubtitle = () => {
    switch(timeRange) {
      case "day": return "今日凌晨 00:00:00 账面起算资金";
      case "yesterday": return "昨日凌晨 00:00:00 账面起算资金";
      case "month": return "本月 1 号 00:00:00 账面起算资金";
      case "lastMonth": return "上月 1 号 00:00:00 账面起算资金";
      case "custom": return `自定义起点: ${customStartDate.replace("T", " ")} 账面资金`;
      default: return "账面期初资金";
    }
  };

  // Custom Navigation Click Handler for KPI cards linking to Cashflow Page
  const handleCardClick = (direction: "income" | "expense") => {
    const event = new CustomEvent("finance-navigate", {
      detail: {
        parent: "财务系统",
        sub: "公司资金流水",
        direction,
        timeRange,
        platform: selectedPlatform,
        shop: selectedShop
      }
    });
    window.dispatchEvent(event);
    showToast(`正在深度联动，极速穿透查看${direction === "income" ? "收入" : "支出"}对账明细...`);
  };

  // Custom Navigation Click Handler for KPI cards linking to Individual Invoice Page "票务管理"
  const handleIndividualInvoiceNavigate = (targetTab: "available" | "issued" | "paid") => {
    const event = new CustomEvent("finance-navigate", {
      detail: {
        parent: "财务系统",
        sub: "票务管理",
        targetTab
      }
    });
    window.dispatchEvent(event);

    localStorage.setItem("finance-link-params", JSON.stringify({
      parent: "财务系统",
      sub: "票务管理",
      targetTab,
      tab: targetTab,
      triggeredAt: Date.now()
    }));

    showToast(`正在深度联动，极速下钻至个体户票务中查看相应对账主体明细...`);
  };

  // Add Expense form handler
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;
    
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt)) return;

    const newExp = {
      title: expenseTitle,
      amount: amt,
      category: expenseCategory,
      date: "刚刚"
    };

    setRecentExpenses([newExp, ...recentExpenses]);
    showToast(`成功登记支出：${expenseTitle} ¥${amt.toLocaleString()}`);
    setIsNewExpenseOpen(false);
    
    // Clear inputs
    setExpenseTitle("");
    setExpenseAmount("");
  };

  // Alert actions handler
  const handleAlertAction = (alert: AlertItem) => {
    if (alert.type === "高风险") {
      setHandlingAlertId(alert.id);
    } else if (alert.type === "异常") {
      showToast("🔄 正在尝试重新拉取招工商银行网银数据，请稍后...");
      setTimeout(() => {
        setAlerts(prev => prev.filter(al => al.id !== alert.id));
        showToast("✅ 招商银行(8923)流水同步成功！拉取结果已入库。");
      }, 1500);
    } else if (alert.type === "提醒") {
      setIsSupplierReconOpen(true);
    } else if (alert.type === "逾期") {
      showToast(`📌 已生成微信支付尾款单，付款主体已锁定！正在前往结算页面...`);
    }
  };

  const resolveQuotaAlert = () => {
    setAlerts(prev => prev.filter(al => al.id !== "alert-1"));
    setProprietors(prev => prev.map(p => p.name === "杭州心选服饰有限公司" ? { ...p, status: "正常", percentage: 5 } : p));
    setHandlingAlertId(null);
    showToast("✅ 额度任务指派完成：收款自动路由已分流至备用干净主体。");
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 bg-[#f8f9fc] min-h-screen pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] max-w-sm bg-slate-900 text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#006591]" />
            财务总览
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium font-sans">
            实时查看公司现金流、供应商应付、个体户额度与财务异常
          </p>
        </div>

        {/* Action Header Ribbon */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setIsNewExpenseOpen(true)}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-[#001529] hover:bg-slate-800 text-white text-xs font-black transition-colors duration-150 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            新增支出
          </button>
          
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-450" />
            导入流水
          </button>

          <button 
            onClick={() => setIsReconciliationOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-slate-450" />
            资金对账
          </button>

          <button 
            onClick={() => setIsSupplierReconOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-450" />
            供应商对账
          </button>

          <button 
            onClick={() => setIsExportReportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-450" />
            导出简报
          </button>
        </div>
      </div>

      {/* Filter Toolbar Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Time Period Filters & Custom Date Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-100/85 p-1 rounded-xl">
            {[
              { id: "day", label: "今日" },
              { id: "yesterday", label: "昨日" },
              { id: "month", label: "本月" },
              { id: "lastMonth", label: "上月" },
              { id: "custom", label: "自定义" },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setTimeRange(opt.id as any);
                  showToast(`已切换数据时间跨度为：${opt.label}`);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeRange === opt.id 
                    ? "bg-white text-[#006591] shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {timeRange === "custom" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.95, width: 0 }}
                className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1 rounded-xl shadow-3xs overflow-hidden"
              >
                <div className="flex items-center gap-1 px-1.5">
                  <span className="text-[10px] font-bold text-slate-400">开始</span>
                  <input 
                    type="datetime-local" 
                    value={customStartDate} 
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      showToast(`已更新自定义起始时间: ${e.target.value}`);
                    }}
                    className="bg-white border border-[#e2e8f0] rounded-lg py-1 px-2 text-xs font-mono font-bold text-slate-700 outline-none focus:border-[#006591] focus:ring-1 focus:ring-[#006591] cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1 px-1.5 border-l border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400">截止</span>
                  <input 
                    type="datetime-local" 
                    value={customEndDate} 
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      showToast(`已更新自定义截止时间: ${e.target.value}`);
                    }}
                    className="bg-white border border-[#e2e8f0] rounded-lg py-1 px-2 text-xs font-mono font-bold text-slate-700 outline-none focus:border-[#006591] focus:ring-1 focus:ring-[#006591] cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 平台 */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">平台:</span>
            <select 
              value={selectedPlatform}
              onChange={(e) => {
                const p = e.target.value;
                setSelectedPlatform(p);
                setSelectedShop("all"); // Reset shop selection to prevent inconsistency
                const platformLabel = p === "all" ? "全部平台" : p === "dy" ? "抖音" : p === "taobao" ? "淘宝/天猫" : p === "ks" ? "快手" : "拼多多";
                showToast(`已切换平台为：${platformLabel}`);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591]"
            >
              <option value="all">全部平台</option>
              <option value="dy">抖音</option>
              <option value="taobao">淘宝/天猫</option>
              <option value="ks">快手</option>
              <option value="pdd">拼多多</option>
            </select>
          </div>

          {/* 店铺 */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">店铺:</span>
            <select 
              value={selectedShop}
              onChange={(e) => {
                setSelectedShop(e.target.value);
                showToast(`已切换观察店铺范围`);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591]"
            >
              <option value="all">全部店铺</option>
              {(selectedPlatform === "all" || selectedPlatform === "dy") && (
                <>
                  <option value="shop-dy1">乐娜童装抖音店</option>
                  <option value="shop-dy2">安安婴儿服饰店</option>
                </>
              )}
              {(selectedPlatform === "all" || selectedPlatform === "taobao") && (
                <option value="shop-tb1">织锦服饰天猫店</option>
              )}
              {(selectedPlatform === "all" || selectedPlatform === "ks") && (
                <option value="shop-ks1">乐娜快手直播店</option>
              )}
              {(selectedPlatform === "all" || selectedPlatform === "pdd") && (
                <option value="shop-pdd1">安安皮皮拼多多店</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Company Cash Book Balances Summary banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Card 1: Initial Capital */}
        <div className="flex items-center gap-4 border-r border-dotted border-slate-100 last:border-0 pr-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-[#006591] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 block tracking-wider uppercase">
              初始静态资金
            </span>
            <span className="text-xl md:text-2xl font-black font-mono text-slate-800 tracking-tight block mt-0.5">
              ¥{initialCapital.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#006591] font-semibold block mt-0.5 truncate">
              {getInitialCapitalSubtitle()}
            </span>
          </div>
        </div>

        {/* Card 2: Period Surplus */}
        <div className="flex items-center gap-4 border-r border-dotted border-slate-100 last:border-0 pr-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpis.net >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {kpis.net >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 block tracking-wider uppercase">
              期间盈余变动
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl md:text-2xl font-black font-mono tracking-tight ${kpis.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {kpis.net >= 0 ? "+" : "-"}¥{Math.abs(kpis.net).toLocaleString()}
              </span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${kpis.net >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {kpis.net >= 0 ? "顺差" : "逆差"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              期间流入 ¥{kpis.income.toLocaleString()} | 流出 ¥{kpis.expense.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Current Book Capital (Editable) */}
        <div className="flex items-center gap-4 pl-0 pr-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-grow">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 block tracking-wider uppercase">
                当前公司账面资金
              </span>
              {!isEditingBalance && (
                <button 
                  onClick={() => {
                    setEditedBalanceValue(currentBookBalance.toString());
                    setIsEditingBalance(true);
                  }}
                  title="修改账面金额"
                  className="p-1 text-slate-400 hover:text-[#006591] hover:bg-slate-50 rounded transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isEditingBalance ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-base font-bold font-mono text-slate-800">¥</span>
                <input 
                  type="number" 
                  value={editedBalanceValue}
                  onChange={(e) => setEditedBalanceValue(e.target.value)}
                  className="bg-slate-50 border border-slate-200 outline-none rounded-lg px-2 py-0.5 text-xs font-semibold font-mono w-28 focus:border-[#006591] focus:ring-1 focus:ring-[#006591]"
                  autoFocus
                  onBlur={() => {
                    const val = parseFloat(editedBalanceValue);
                    if (!isNaN(val) && val >= 0) {
                      setCurrentBookBalance(val);
                      setIsEditingBalance(false);
                      showToast("已更新公司实时账面资金！");
                    } else {
                      setIsEditingBalance(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = parseFloat(editedBalanceValue);
                      if (!isNaN(val) && val >= 0) {
                        setCurrentBookBalance(val);
                        setIsEditingBalance(false);
                        showToast("已成功更新公司实时账面资金！");
                      }
                    } else if (e.key === "Escape") {
                      setIsEditingBalance(false);
                    }
                  }}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const val = parseFloat(editedBalanceValue);
                    if (!isNaN(val) && val >= 0) {
                      setCurrentBookBalance(val);
                      setIsEditingBalance(false);
                      showToast("已成功更新公司实时账面资金！");
                    }
                  }}
                  className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-xl md:text-2xl font-black font-mono text-slate-800 tracking-tight block mt-0.5">
                ¥{currentBookBalance.toLocaleString()}
              </span>
            )}
            
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate">
              公司全部银行账户及可用在保现金汇总余额
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic 2-Card Summary KPI Panel */}
      <div id="finance-kpi-drilldown-cards" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Card */}
        <div 
          onClick={() => handleCardClick("income")}
          title="点击即可联动穿透至公司资金流水对账，深度分析明细"
          className="group cursor-pointer hover:scale-[1.015] hover:border-emerald-300 hover:shadow-md active:scale-99 transition-all duration-300 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden select-none"
        >
          {/* Subtle hover background highlight */}
          <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/5 transition-all duration-500 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
              <span className="flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {kpis.titleInc}
              </span>
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.5%</span>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                核算总金额 (人民币)
                <span className="text-[9.5px] text-emerald-600 font-medium group-hover:underline opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1">
                  点击下钻对账单 ↗
                </span>
              </span>
              <h3 className="text-3xl font-black font-mono text-slate-800 tracking-tight mt-1 flex items-baseline gap-1">
                <span>¥{kpis.income.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-500 font-bold hidden md:inline ml-1">进入流水账 ➔</span>
              </h3>
            </div>

            <div className="mt-3 text-slate-500 text-[11px] leading-relaxed">
              {kpis.subInc}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-bold">
              <span>主体与渠道分布规划</span>
              <span className="text-slate-600 font-mono text-[10px]">{kpis.desc}</span>
            </div>
            <div className="w-full bg-slate-50 border border-slate-100 h-2 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: "65%" }} title="抖音/主力 65%" />
              <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: "20%" }} title="淘宝天猫 20%" />
              <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: "15%" }} title="其他全网渠道 15%" />
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-medium font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                抖音 (65%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                淘宝 (20%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                其他 (15%)
              </span>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div 
          onClick={() => handleCardClick("expense")}
          title="点击即可联动穿透至公司资金流水对账，深度分析明细"
          className="group cursor-pointer hover:scale-[1.015] hover:border-rose-300 hover:shadow-md active:scale-99 transition-all duration-300 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden select-none"
        >
          {/* Subtle hover background highlight */}
          <div className="absolute inset-0 bg-rose-50/0 group-hover:bg-rose-50/5 transition-all duration-500 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
              <span className="flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {kpis.titleExp}
              </span>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                <span>限流监控中</span>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                核算总金额 (人民币)
                <span className="text-[9.5px] text-rose-600 font-medium group-hover:underline opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1">
                  点击下钻对账单 ↗
                </span>
              </span>
              <h3 className="text-3xl font-black font-mono text-slate-800 tracking-tight mt-1 flex items-baseline gap-1">
                <span>¥{kpis.expense.toLocaleString()}</span>
                <span className="text-[10px] text-rose-500 font-bold hidden md:inline ml-1">进入流水账 ➔</span>
              </h3>
            </div>

            <div className="mt-3 text-slate-500 text-[11px] leading-relaxed">
              {kpis.subExp}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-bold">
              <span>支出科目构成比 (货款 / 运营 / 快递)</span>
              <span className="text-[#006591] font-mono text-[10px] font-black flex items-center gap-1">
                净现流: {kpis.net >= 0 ? "+" : ""}¥{kpis.net.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-50 border border-slate-100 h-2 rounded-full overflow-hidden flex">
              <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: "60%" }} title="货款 60%" />
              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: "15%" }} title="工资人效 15%" />
              <div className="h-full bg-indigo-400 transition-all duration-500" style={{ width: "25%" }} title="物流级其他 25%" />
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-medium font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                货款 (60%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                工资 (15%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                物流/杂支 (25%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Secondary KPI Cards (可开票金额, 已开票金额, 已打款金额) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 可开票金额 */}
        <div 
          onClick={() => handleIndividualInvoiceNavigate("available")}
          className="group cursor-pointer select-none bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-sky-300 hover:scale-[1.012] transition-all duration-300 relative overflow-hidden"
          title="点击下钻查看可开票金额的详细计算口径及供应商账目"
        >
          <div className="absolute inset-0 bg-sky-50/0 group-hover:bg-sky-50/1 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
            <span className="flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              可开票金额
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9.5px] text-sky-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">查看明细</span>
              <FileText className="w-4 h-4 text-slate-455 group-hover:text-sky-500 transition-colors" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400">待收票/待开票总额</span>
            <h4 className="text-xl font-black font-mono text-slate-800 mt-0.5 flex items-baseline justify-between">
              <span>¥{kpis.invoiceable.toLocaleString()}</span>
              <span className="text-sky-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">➔</span>
            </h4>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[10.5px] text-slate-550 font-bold">
            <span className="text-sky-600 bg-sky-50/70 px-1.5 py-0.5 rounded text-[9.5px]">查看可安排票额明细 →</span>
            <span className="text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded text-[9.5px]">额度宽松</span>
          </div>
        </div>

        {/* Card 2: 已开票金额 */}
        <div 
          onClick={() => handleIndividualInvoiceNavigate("issued")}
          className="group cursor-pointer select-none bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-teal-300 hover:scale-[1.012] transition-all duration-300 relative overflow-hidden"
          title="点击下钻查看所有国家进项防伪发票明细、抵扣认证状态"
        >
          <div className="absolute inset-0 bg-teal-50/0 group-hover:bg-teal-50/1 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
            <span className="flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              已开票金额
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9.5px] text-[#006591] font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">查看明细</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400">开票审核已通过</span>
            <h4 className="text-xl font-black font-mono text-slate-800 mt-0.5 flex items-baseline justify-between">
              <span>¥{kpis.invoiced.toLocaleString()}</span>
              <span className="text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">➔</span>
            </h4>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[10.5px] text-slate-550 font-bold">
            <span className="text-teal-600 bg-teal-50/70 px-1.5 py-0.5 rounded text-[9.5px]">查看已开票明细 →</span>
            <span className="text-emerald-600 font-mono text-[10px] font-black">100.0%</span>
          </div>
        </div>

        {/* Card 3: 已打款金额 */}
        <div 
          onClick={() => handleIndividualInvoiceNavigate("paid")}
          className="group cursor-pointer select-none bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 hover:scale-[1.012] transition-all duration-300 relative overflow-hidden"
          title="点击下钻核对各打款账户网银直连划扣流水及财务认领记录"
        >
          <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/1 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
            <span className="flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              已打款金额
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9.5px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">查看明细</span>
              <Wallet className="w-4 h-4 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400">银行流水成功支付</span>
            <h4 className="text-xl font-black font-mono text-slate-800 mt-0.5 flex items-baseline justify-between">
              <span>¥{kpis.paid.toLocaleString()}</span>
              <span className="text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">➔</span>
            </h4>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[10.5px] text-slate-550 font-bold">
            <span className="text-indigo-600 bg-indigo-50/70 px-1.5 py-0.5 rounded text-[9.5px]">查看已打款明细 →</span>
            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[9.5px]">网银直开</span>
          </div>
        </div>
      </div>

      {/* 财务异常预警 (Exception Alerts Area) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <h2 className="text-xs font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            财务异常预警
          </h2>
          <span className="text-[11px] font-bold text-slate-400">{alerts.length} 个未决警报文件</span>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-bold">
              🎉 完美合规！目前系统未探测到任何财务和账户安全问题。
            </div>
          ) : (
            alerts.map((al) => (
              <div 
                key={al.id} 
                className="group border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-start gap-3 max-w-2xl">
                  {/* Badge Mapper */}
                  <span className={`px-2 py-0.5 mt-0.5 rounded text-[10px] font-black shrink-0 border ${
                    al.type === "高风险" ? "bg-red-50 text-red-650 border-red-100" :
                    al.type === "异常" ? "bg-sky-50 text-sky-650 border-sky-100" :
                    al.type === "提醒" ? "bg-amber-50 text-amber-650 border-amber-100" :
                    "bg-rose-50 text-rose-650 border-rose-100"
                  }`}>
                    {al.type}
                  </span>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-850">{al.title}</h4>
                    <p className="text-[10.5px] text-slate-500">{al.detail}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-mono font-black text-slate-800">{al.amount}</p>
                    <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 justify-end">
                      <Clock className="w-2.5 h-2.5" />
                      {al.time}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleAlertAction(al)}
                    className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black shadow-xs cursor-pointer transition-colors ${
                      al.type === "高风险" ? "bg-red-600 text-white hover:bg-red-700" :
                      "bg-white border border-slate-205 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {al.actionText}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid: 2 columns (7. 个体户年度额度监控 & 8. 供应商账款与核销) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Card: 个体户年度额度监控 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-black text-slate-900 leading-tight">个体户年度额度监控</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">监控个体商户 500万免税额度使用情况</p>
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500"><strong className="text-slate-700">128</strong> 总主体</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-bold">96 活跃中</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[9px] font-bold">12 高风险</span>
                <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-bold">3 建议停用</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9.5px]">
                    <th className="pb-2">主体名称</th>
                    <th className="pb-2 text-right">年度累计流入</th>
                    <th className="pb-2 text-center">额度进度 (5M)</th>
                    <th className="pb-2 text-right">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {proprietors.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-3 font-bold text-slate-800 text-[11.5px]">{p.name}</td>
                      <td className="py-3 text-right font-mono font-black text-slate-900">¥{p.annualSales.toLocaleString()}</td>
                      <td className="py-3">
                        <div className="flex flex-col items-center gap-1 max-w-[120px] mx-auto">
                          <span className={`text-[10px] font-mono font-black ${
                            p.percentage >= 90 ? "text-red-500 animate-pulse" : p.percentage >= 70 ? "text-amber-500" : "text-[#006591]"
                          }`}>{p.percentage}%</span>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-50">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                p.percentage >= 90 ? "bg-red-550" : p.percentage >= 70 ? "bg-amber-400" : "bg-sky-450"
                              }`} 
                              style={{ width: `${p.percentage}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                          p.status === "停用" ? "bg-red-50 text-red-600 border-red-100" :
                          p.status === "风险" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-sky-50 text-[#006591] border-sky-100"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="border-t border-slate-50 pt-3 mt-4 text-right">
            <button 
              onClick={() => showToast("正在调取全部 128 家个体工商主体工商网数据明细...")}
              className="text-[10.5px] font-black text-[#006591] hover:text-[#005175] flex items-center gap-0.5 justify-end cursor-pointer"
            >
              查看大额阻断与管理详情
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: 供应商账款与核销 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-black text-slate-900 leading-tight">供应商账款与核销</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">管理本月应付货款、已结金额及差异</p>
              </div>
              <div className="flex gap-1.5 font-mono text-[9px] font-black">
                <span className="px-1.5 py-0.5 bg-[#f0f9ff] text-sky-600 border border-sky-100 rounded">本月到货 ¥2.4M</span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded">已核销 ¥1.2M</span>
                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded">待核销 ¥0.8M</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9.5px]">
                    <th className="pb-2">供应商</th>
                    <th className="pb-2 text-right">账单金额</th>
                    <th className="pb-2 text-right">差异金额</th>
                    <th className="pb-2 text-right">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {supplierBills.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-3 font-bold text-slate-800 text-[11.5px]">{s.supplier}</td>
                      <td className="py-3 text-right font-mono font-black text-slate-900 font-semibold">¥{s.amount.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono">
                        {s.difference > 0 ? (
                          <span className="text-rose-500 font-black">+¥{s.difference.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-450 font-bold">0</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                          s.status === "已结清" ? "bg-slate-100 text-slate-600 border-slate-200" :
                          s.status === "异常" ? "bg-red-500 text-white border-red-650" :
                          "bg-sky-50 text-[#006591] border-sky-100"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-3 mt-4 text-right">
            <button 
              onClick={() => setIsSupplierReconOpen(true)}
              className="text-[10.5px] font-black text-[#006591] hover:text-[#005175] flex items-center gap-0.5 justify-end cursor-pointer"
            >
              启动全量票账联查核销
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Grid: Lower section (银行账户资金分布 & 资金收支趋势) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Column 1: 左：银行账户资金分布 with Donut SVG */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-5">
            <h3 className="text-xs font-black text-slate-900 leading-tight">银行账户资金分布</h3>
            <span className="text-[10px] font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded">共 32 户在线</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* SVG Donut Center */}
            <div className="w-full md:w-1/3 flex justify-center py-2 shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 160 160" className="max-w-[135px] md:max-w-[145px] mx-auto">
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#006591" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.437} ${2 * Math.PI * 60 * 0.563}`} strokeDashoffset={2 * Math.PI * 60 * 0.25} />
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#0284c7" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.254} ${2 * Math.PI * 60 * 0.746}`} strokeDashoffset={2 * Math.PI * 60 * (0.25 - 0.437)} />
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#38bdf8" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.184} ${2 * Math.PI * 60 * 0.816}`} strokeDashoffset={2 * Math.PI * 60 * (0.25 - 0.437 - 0.254)} />
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#cbd5e1" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.125} ${2 * Math.PI * 60 * 0.875}`} strokeDashoffset={2 * Math.PI * 60 * (0.25 - 0.437 - 0.254 - 0.184)} />
                <circle cx="80" cy="80" r="48" fill="#ffffff" />
                <text x="80" y="75" textAnchor="middle" className="text-[13px] font-black fill-slate-800 font-sans">¥12.42M</text>
                <text x="80" y="93" textAnchor="middle" className="text-[9px] font-bold fill-slate-450 font-sans tracking-wide">现金总额</text>
              </svg>
            </div>

            {/* Bank detail specifications list */}
            <div className="flex-grow w-full space-y-3 font-semibold text-slate-700">
              <div className="grid grid-cols-4 text-[9.5px] font-bold text-slate-400 pb-1 border-b border-slate-50 uppercase tracking-wider">
                <span className="col-span-2">开户银行/尾号</span>
                <span className="text-right">当前余额</span>
                <span className="text-right">今日净流水</span>
              </div>

              {[
                { name: "招商银行 (8923)", amount: 5420000, daily: 245000, monthlyTrans: "12.5M", color: "bg-[#006591]" },
                { name: "工商银行 (1102)", amount: 3150000, daily: -12400, monthlyTrans: "8.2M", color: "bg-sky-600" },
                { name: "建设银行 (4403)", amount: 2280000, daily: 0, monthlyTrans: "4.1M", color: "bg-[#38bdf8]" }
              ].map((acc, idx) => (
                <div key={idx} className="grid grid-cols-4 items-center text-[11px] py-1 border-b border-slate-50 border-dotted hover:bg-slate-50/40">
                  <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${acc.color} shrink-0`} />
                    <span className="font-bold text-slate-800 truncate">{acc.name}</span>
                  </div>
                  <span className="text-right font-mono font-black text-slate-900 font-semibold">¥{acc.amount.toLocaleString()}</span>
                  <div className="text-right font-mono">
                    {acc.daily > 0 ? (
                      <span className="text-emerald-500 font-black font-semibold">+¥{acc.daily.toLocaleString()}</span>
                    ) : acc.daily < 0 ? (
                      <span className="text-rose-500 font-black font-semibold">-¥{Math.abs(acc.daily).toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: 右：资金收支趋势 with custom interactive CSS Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
              <h3 className="text-xs font-black text-slate-900 leading-tight">资金收支趋势</h3>
              <div className="flex items-center gap-3 text-[9.5px] font-bold text-slate-450">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-sm" />
                  收入
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-350 rounded-sm" />
                  支出
                </span>
              </div>
            </div>

            {/* Custom Bar Graph */}
            <div className="flex items-end justify-between h-[120px] px-2 pt-4 relative">
              <div className="absolute inset-x-0 top-4 border-b border-dashed border-slate-100 h-0" />
              <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 h-0" />
              <div className="absolute inset-x-0 bottom-0 border-b border-slate-200 h-0" />
              
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex items-end gap-1 h-20">
                  <div className="w-4.5 bg-sky-200 hover:bg-sky-500 rounded-t h-[60%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥65万</div>
                  </div>
                  <div className="w-4.5 bg-rose-220 hover:bg-rose-455 rounded-t h-[50%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥55万</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-slate-400">第一周</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex items-end gap-1 h-20">
                  <div className="w-4.5 bg-sky-300 hover:bg-sky-500 rounded-t h-[80%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥85万</div>
                  </div>
                  <div className="w-4.5 bg-rose-250 hover:bg-rose-455 rounded-t h-[70%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥75万</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-slate-400">第二周</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex items-end gap-1 h-20">
                  <div className="w-4.5 bg-sky-200 hover:bg-sky-500 rounded-t h-[70%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥72万</div>
                  </div>
                  <div className="w-4.5 bg-rose-220 hover:bg-rose-455 rounded-t h-[55%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥58万</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-slate-400">第三周</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex items-end gap-1 h-20">
                  <div className="w-4.5 bg-sky-400 hover:bg-sky-500 rounded-t h-[95%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥105万</div>
                  </div>
                  <div className="w-4.5 bg-rose-300 hover:bg-rose-455 rounded-t h-[80%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥88万</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-slate-400">第四周</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="flex items-end gap-1 h-20">
                  <div className="w-4.5 bg-sky-200 hover:bg-sky-500 rounded-t h-[55%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥58万</div>
                  </div>
                  <div className="w-4.5 bg-rose-200 hover:bg-rose-455 rounded-t h-[40%] transition-all duration-300 relative group cursor-pointer">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">¥42万</div>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-slate-400">第五周</span>
              </div>
            </div>
          </div>

          {/* AI Helper banner */}
          <div className="bg-[#f0f9ff] text-[#006591] p-3.5 rounded-xl border border-sky-100 text-[10.5px] font-semibold flex items-start gap-2.5 mt-5">
            <Lightbulb className="w-4.5 h-4.5 text-sky-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>财务智能助手结论：</strong>本月净现金流整体为正，但最近 3 天支出增长较快，主要系换季预备货款结算。
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Lower row (本月支出结构排行 & 本月预估利润拆解) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Column 1: 本月支出结构排行 with custom SVG Donut */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-5">
              <h3 className="text-xs font-black text-slate-900 leading-tight">本月支出结构排行</h3>
              <span className="text-[10px] font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded">¥2.1M 已支付</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* SVG Donut Center */}
              <div className="w-full md:w-1/3 flex justify-center py-2 shrink-0">
                <svg width="100%" height="100%" viewBox="0 0 160 160" className="max-w-[135px] md:max-w-[145px] mx-auto">
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#0f172a" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.6} ${2 * Math.PI * 60 * 0.4}`} strokeDashoffset={2 * Math.PI * 60 * 0.25} />
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#0284c7" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.15} ${2 * Math.PI * 60 * 0.85}`} strokeDashoffset={2 * Math.PI * 60 * (0.25 - 0.6)} />
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#38bdf8" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.1} ${2 * Math.PI * 60 * 0.9}`} strokeDashoffset={2 * Math.PI * 60 * (0.25 - 0.6 - 0.15)} />
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#fb7185" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.08} ${2 * Math.PI * 60 * 0.92}`} strokeDashoffset={2 * Math.PI * 60 * (0.25 - 0.6 - 0.15 - 0.1)} />
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#94a3b8" strokeWidth="16" strokeDasharray={`${2 * Math.PI * 60 * 0.07} ${2 * Math.PI * 60 * 0.93}`} strokeDashoffset={2 * Math.PI * 60 * (0.25 - 0.6 - 0.15 - 0.1 - 0.08)} />
                  <circle cx="80" cy="80" r="48" fill="#ffffff" />
                  <text x="80" y="75" textAnchor="middle" className="text-[13px] font-black fill-slate-800 font-sans">¥2.10M</text>
                  <text x="80" y="93" textAnchor="middle" className="text-[9px] font-bold fill-slate-450 font-sans tracking-wide">本月总支出</text>
                </svg>
              </div>

              {/* Specification rankings */}
              <div className="flex-grow w-full space-y-3 font-semibold text-slate-700">
                <div className="grid grid-cols-4 text-[9.5px] font-bold text-slate-400 pb-1 border-b border-slate-50 uppercase tracking-wider">
                  <span className="col-span-2">费用结构分流</span>
                  <span className="text-right">支出额</span>
                  <span className="text-right">偏离趋势</span>
                </div>

                {[
                  { name: "供应商货款", amount: 1260000, trend: "↑2%", type: "rose", color: "bg-slate-900" },
                  { name: "物流快递", amount: 315000, trend: "↓1%", type: "cyan", color: "bg-sky-600" },
                  { name: "人工薪酬", amount: 210000, trend: "-", type: "gray", color: "bg-sky-400" },
                  { name: "推广投流", amount: 168050, trend: "↓4%", type: "cyan", color: "bg-rose-400" },
                  { name: "其他杂项", amount: 147000, trend: "-", type: "gray", color: "bg-slate-400" }
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 items-center text-[11px] py-1 border-b border-slate-50 border-dotted hover:bg-slate-50/40">
                    <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-sm ${item.color} shrink-0`} />
                      <span className="font-bold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <span className="text-right font-mono font-black text-slate-900 font-semibold">¥{item.amount.toLocaleString()}</span>
                    <span className={`text-right font-mono font-black text-[10.5px] ${
                      item.type === "rose" ? "text-rose-500" : item.type === "cyan" ? "text-emerald-500" : "text-slate-400"
                    }`}>{item.trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-3 mt-4 text-right">
            <button 
              onClick={() => setIsNewExpenseOpen(true)}
              className="text-[10.5px] font-black text-[#006591] hover:text-[#005175] flex items-center gap-0.5 justify-end cursor-pointer"
            >
              录入或微调非周期支出事项
              <Plus className="w-3.5 h-3.5 ml-0.5 scale-90" />
            </button>
          </div>
        </div>

        {/* Column 2: 本月预估利润拆解 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
              <h3 className="text-xs font-black text-slate-900 leading-tight">本月预估利润拆解</h3>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">预计净利率</span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-black">13.1%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                <span className="text-slate-700">总销售收入 (+)</span>
                <span className="font-mono font-black text-slate-800">¥3,450,000</span>
              </div>

              <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                <span className="text-slate-500">商品成本 (COGS) (-)</span>
                <span className="font-mono font-bold text-rose-500">-¥1,550,000</span>
              </div>

              <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                <span className="text-slate-500">物流与仓储费用 (-)</span>
                <span className="font-mono font-bold text-rose-500">-¥168,000</span>
              </div>

              <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                <span className="text-slate-500">广告投放与流量 (-)</span>
                <span className="font-mono font-bold text-rose-500">-¥420,000</span>
              </div>

              <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                <span className="text-slate-500">人力与行政开支 (-)</span>
                <span className="font-mono font-bold text-rose-500">-¥315,050</span>
              </div>

              <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50 pb-3 border-b-2">
                <span className="text-slate-500">税费预留与杂项 (-)</span>
                <span className="font-mono font-bold text-rose-500">-¥547,000</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div>
              <span className="text-[10.25px] text-slate-400 font-bold uppercase tracking-wider block">最终预估经营利润</span>
              <span className="text-xl font-black font-mono text-white tracking-tight mt-0.5 block">¥450,000</span>
            </div>
            <button 
              onClick={() => showToast("📁 正在向浏览器推送：LenaKids_Monthly_Financial_Analysis_Q2.xlsx")}
              className="px-4 py-2 bg-[#006591] hover:bg-[#005175] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
            >
              下载明细报表
            </button>
          </div>
        </div>

      </div>

      {/* Footer System Credits */}
      <footer className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[10.5px] font-medium text-slate-450">
        <span>© 2026 OpsPilot Institutional Suite · 系统状态：<strong className="text-emerald-500 font-bold">运行良好</strong></span>
        <div className="flex gap-4 font-mono font-black text-slate-400">
          <span>数据同步：2026-05-25 14:45:32</span>
          <span>财务核算标准：权责发生制 (预估)</span>
          <span>技术支持：400-888-999</span>
        </div>
      </footer>

      {/* ========================================================== */}
      {/* 🔮 DRAWERS & DIALOGS CONTROLLERS (PORTALS & ANIMS) */}
      {/* ========================================================== */}
      
      {/* 1. Modal: 新增支出 (New Expense Register Drawer) */}
      <AnimatePresence>
        {isNewExpenseOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewExpenseOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 z-[110] flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black text-slate-850">➕ 登记新支出账目款项</span>
                <button 
                  onClick={() => setIsNewExpenseOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddExpenseSubmit} className="flex-grow p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-450 uppercase mb-1.5">款项名称 / 用途说明 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="例如：预付宏大物流下季度运费定金"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-450 uppercase mb-1.5">支出类别 <span className="text-red-500">*</span></label>
                    <select 
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591]"
                    >
                      <option value="货款">供应商货款</option>
                      <option value="物流快递">物流快递</option>
                      <option value="人工薪酬">人工薪酬</option>
                      <option value="推广投流">推广投流</option>
                      <option value="其他杂项">其他杂项</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-450 uppercase mb-1.5">关联扣款主体 <span className="text-red-500">*</span></label>
                    <select 
                      value={expenseProprietor}
                      onChange={(e) => setExpenseProprietor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591]"
                    >
                      <option value="义乌市乐娜商贸部">义乌市乐娜商贸部</option>
                      <option value="温岭市依依童装店">温岭市依依童装店</option>
                      <option value="织里佳琪制衣厂">织里佳琪制衣厂</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-450 uppercase mb-1.5">发生款项金额 (元) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">¥</span>
                    <input 
                      type="number" 
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs text-slate-800 font-black font-mono focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-grow py-3 rounded-xl bg-[#006591] hover:bg-[#005175] text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    保存款项登记
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsNewExpenseOpen(false)}
                    className="py-3 px-5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              </form>

              {/* History list preview inside Drawer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block">今日登记流水历史 (刚刚)</span>
                <div className="space-y-2">
                  {recentExpenses.map((re, idx) => (
                    <div key={idx} className="bg-white border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800">{re.title}</h5>
                        <p className="text-[9px] text-slate-400 font-medium font-sans mt-0.5">{re.category} · {re.date}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-rose-500">-¥{re.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Modal: 导入流水 (Import Bank Stream Dialog) */}
      <AnimatePresence>
        {isImportOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white shadow-2xl rounded-2xl border border-slate-100 z-[110] p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                  <Upload className="w-5 h-5 text-[#006591]" />
                  批量导入网银银行流水文件
                </span>
                <button 
                  onClick={() => setIsImportOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 hover:border-[#006591] transition-colors cursor-pointer" onClick={() => {
                showToast("📥 模拟读取流水：已捕获招商银行格式交易明细(510条)，系统完成格式校验。");
                setIsImportOpen(false);
              }}>
                <div className="p-3 bg-slate-100 rounded-full text-slate-500">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-black text-slate-800">拖拽文件到此处，或点击选择本地文件</span>
                  <p className="text-[10px] text-slate-400 mt-1">支持招商、工商、泰隆、微信支付、支付宝商户等银行标准的 Excel/CSV 格式</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">安全校验合规提示：</span>
                <ul className="text-[9.5px] text-slate-500 space-y-1 leading-relaxed list-disc pl-4 font-medium">
                  <li>上传的数据仅用于该项目端解析财务看板，绝不进行云端敏感信息留档。</li>
                  <li>解析引擎支持私有化模糊匹配算法，确保脱敏银行卡卡号及法人具体字样。</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 text-xs pt-2">
                <button 
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  关闭
                </button>
                <button 
                  onClick={() => {
                    showToast("📁 已调出模拟流：28 个往来合并主体流水已自动重新刷新核对完毕！");
                    setIsImportOpen(false);
                  }}
                  className="px-4 py-2 bg-[#006591] hover:bg-[#005175] text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  自动同步历史拉取
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Modal: 资金自动对账 (Account reconciliation) */}
      <AnimatePresence>
        {isReconciliationOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReconciliationOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white shadow-2xl rounded-2xl border border-slate-100 z-[110] p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                  <Scale className="w-5 h-5 text-[#006591]" />
                  多边流水平衡自动平衡对账引擎
                </span>
                <button 
                  onClick={() => setIsReconciliationOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-sky-50 text-[#006591] rounded-xl border border-sky-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">网银直联同步</span>
                    <strong className="text-base font-black font-mono block mt-1">¥42.89M</strong>
                    <span className="text-[9px] text-emerald-500 font-bold mt-0.5 inline-block">● 100% 对齐一气</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 border border-slate-150 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">平台对账单映射</span>
                    <strong className="text-base font-black font-mono block mt-1">¥42.84M</strong>
                    <span className="text-[9px] text-slate-400 mt-0.5 inline-block">存在 ±¥5,000 的极微异常</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  <div className="p-2 border border-slate-100 rounded-lg text-[10.5px] bg-emerald-50/30 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">温岭市依依童装店 · 招商银行 0201</span>
                      <p className="text-[9px] text-slate-400">已对账 325 笔往来付款单 · 同步比对通过</p>
                    </div>
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="p-2 border border-rose-100 rounded-lg text-[10.5px] bg-rose-50/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">义乌市乐娜商贸部 · 亮亮供应商打款</span>
                      <p className="text-[9px] text-rose-500">检测到差异到货误差 ¥5,000</p>
                    </div>
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                  </div>
                </div>

                <div className="bg-[#fffbeb] text-amber-800 p-3.5 rounded-xl text-[10.25px] flex items-start gap-2 border border-amber-100">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 select-none" />
                  <p className="leading-relaxed">
                    <strong>对账核心规则：</strong>如果检测到由于供应商漏配、包裹运输途损引起的财务付款差值，均会自动指派至 <strong>供应商对账账单</strong> 内等待确认解决。
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-3 text-xs pt-2">
                <button 
                  onClick={() => {
                    showToast("🖨️ 系统已自动排版，对账偏差明细表已发送至财务备份队列文件。");
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  打印偏差明细表
                </button>
                <button 
                  onClick={() => setIsReconciliationOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  关闭对账仪
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Modal: 供应商对账 (Supplier bill reconcile) */}
      <AnimatePresence>
        {isSupplierReconOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSupplierReconOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white shadow-2xl rounded-2xl border border-slate-100 z-[110] p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-[#006591]" />
                  供应商往来账账核销终端
                </span>
                <button 
                  onClick={() => setIsSupplierReconOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 font-semibold text-slate-700">
                <div className="p-3 bg-red-500/5 text-slate-800 rounded-xl border border-red-100 text-[10.5px]">
                  <strong>异常处理：亮亮童装面料商 (+¥5,000)</strong>
                  <p className="text-slate-500 text-[9.5px] mt-1 leading-normal">
                    由于该面料商本批次到仓货物有25包无条码瑕疵，库房自动拒签并生成拒签报告，但对方把这部分实收费用加入了当期期末总账单。
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">推荐解决方案建议：</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setAlerts(prev => prev.filter(al => al.id !== "alert-3"));
                        setSupplierBills(prev => prev.map(sb => sb.supplier === "亮亮童装面料商" ? { ...sb, status: "已结清", difference: 0 } : sb));
                        setIsSupplierReconOpen(false);
                        showToast("✅ 已成功对当期 5,000 元差异发起账期自动扣款红字发票核销。");
                      }}
                      className="flex-grow py-2 bg-[#006591] hover:bg-[#005175] text-white text-[10.5px] font-black rounded-lg transition-colors cursor-pointer"
                    >
                      申请对方出具扣红发票核实并完成清账
                    </button>
                    <button 
                      onClick={() => {
                        showToast("📌 已通知织里供应商理数负责人加入该异常工单多方协调处理。");
                        setIsSupplierReconOpen(false);
                      }}
                      className="px-3 py-2 border border-slate-205 text-slate-700 rounded-lg text-[10.5px] font-bold hover:bg-slate-100"
                    >
                      联系供应商客服
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 text-xs pt-1">
                <button 
                  onClick={() => setIsSupplierReconOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  放弃更改，关闭
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Modal: 导出简报 (Export Report) */}
      <AnimatePresence>
        {isExportReportOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportReportOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white shadow-2xl rounded-2xl border border-slate-100 z-[110] p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-xs font-black text-slate-850 flex items-center gap-1.5 animate-pulse">
                  <Download className="w-5 h-5 text-[#006591]" />
                  打包导出财务经营明细报表
                </span>
                <button 
                  onClick={() => setIsExportReportOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 font-semibold text-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">勾选要打包导出的模块：</span>
                
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#006591]" />
                    <span>年度 32 个自持合并个体户税务红线流水表</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#006591]" />
                    <span>供应商本季未结往来货款与差异平衡表</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#006591]" />
                    <span>今日全网公对私、网商渠道流入账单明细</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 text-xs pt-2">
                <button 
                  onClick={() => setIsExportReportOpen(false)}
                  className="px-4 py-2 border border-slate-201 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    showToast("📁 正在向您的浏览器端传输打包好的打包经营流报表：LenaKids_Financial_Pack_2026.zip");
                    setIsExportReportOpen(false);
                  }}
                  className="px-4 py-2 bg-[#006591] hover:bg-[#005175] text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  确立打包并导出
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. Modal: 解决额度告警 (Resolve Quota Alert Dialog) */}
      <AnimatePresence>
        {handlingAlertId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHandlingAlertId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white shadow-2xl rounded-2xl border border-slate-100 z-[110] p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-xs font-black text-slate-850 flex items-center gap-1.5 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                  紧急额度分流分派指派配置
                </span>
                <button 
                  onClick={() => setHandlingAlertId(null)}
                  className="p-1 hover:bg-slate-50 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 font-semibold text-slate-700 text-xs">
                <div className="p-3.5 bg-red-50 text-red-700/85 rounded-xl border border-red-100 text-[10.5px]">
                  <strong>当前告警主体：杭州心选服饰有限公司 (已累计: ¥4,820,000)</strong>
                  <p className="text-slate-550 text-[10px] mt-1 line-clamp-2 leading-relaxed">
                    由于该主体已达到一期 500 万免税额度上限的 96.4%，为防任何潜在超标报税红线，必须立马阻断其在抖音/天猫全部回款渠道的路由，并向备用安全主体实施热分派流水分批机制。
                  </p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">选择替代承接主体：</span>
                  
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 border border-slate-200/90 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="fallback-prop" defaultChecked className="accent-[#006591]" />
                        <div>
                          <span className="font-bold text-slate-800 block">义乌市尚品童装店 (法人: 徐小华)</span>
                          <span className="text-[9.5px] text-slate-400 block font-sans">当前年度已征用: ¥1.25M / ¥5M (空余 75% 额度)</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-green-50 text-green-600 border border-green-100 px-1.5 py-0.5 rounded">最佳备选</span>
                    </label>

                    <label className="flex items-center justify-between p-3 border border-slate-200/90 rounded-xl hover:bg-slate-50 cursor-pointer opacity-70">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="fallback-prop" disabled className="accent-[#006591]" />
                        <div>
                          <span className="font-bold text-slate-800 block">滨江区章乐制衣厂 (法人: 陈章乐)</span>
                          <span className="text-[9.5px] text-slate-400 block font-sans">当前年度已征用: ¥4.15M / ¥5M (空余 17% 额度)</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded">额度饱满不适</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 text-xs pt-3">
                <button 
                  onClick={() => setHandlingAlertId(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  放弃，维持阻断
                </button>
                <button 
                  onClick={resolveQuotaAlert}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  确认指派，秒级恢复收款通道
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* 7. Drill-down Detail Drawer layer (Invoiceable, Invoiced, Paid) */}
      <OverviewKPIsDetailDrawer
        isOpen={activeDetailType !== null}
        onClose={closeDetailDrawer}
        type={activeDetailType}
        kpis={kpis}
        timeRange={timeRange}
        selectedPlatform={selectedPlatform}
        selectedShop={selectedShop}
        showToast={showToast}
      />
    </div>
  );
}
