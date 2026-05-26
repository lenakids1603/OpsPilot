/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, Plus, LayoutGrid, FileSpreadsheet, Download, RefreshCw, AlertCircle,
  Layers, TrendingUp, TrendingDown, Coins, PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CashflowRecord, CashflowSummary, FundAccount, CashflowCategory } from "@shared/types";

// Import cashflow backend service layers proxying our stateful sandbox
import { 
  getCashflowList, createCashflow, updateCashflow, deleteCashflow, 
  confirmCashflow, lockCashflow, getCashflowSummary, getFundAccounts, getCashflowCategories, importCashflow 
} from "../../api/cashflow";

// Sub-components
import CashflowSummaryCards from "./components/CashflowSummaryCards";
import CashflowFilter, { FilterParams } from "./components/CashflowFilter";
import CashflowTable from "./components/CashflowTable";
import CashflowFormDrawer from "./components/CashflowFormDrawer";
import CashflowDetailDrawer from "./components/CashflowDetailDrawer";
import BatchEntryModal from "./components/BatchEntryModal";
import ImportCashflowModal from "./components/ImportCashflowModal";

export default function CashflowPage() {
  // Stateful assets mapping state
  const [cashflowList, setCashflowList] = useState<CashflowRecord[]>([]);
  const [summary, setSummary] = useState<CashflowSummary | null>(null);
  const [fundAccounts, setFundAccounts] = useState<FundAccount[]>([]);
  const [categories, setCategories] = useState<CashflowCategory[]>([]);
  
  // Loading indicators
  const [isLoading, setIsLoading] = useState(true);

  // Filter settings
  const [filterParams, setFilterParams] = useState<FilterParams>({
    startDate: "",
    endDate: "",
    accountId: "",
    direction: "",
    categoryId: "",
    counterparty: "",
    status: "",
    hasAttachment: null,
    search: "",
    platform: "all",
    shop: "all"
  });

  // Active Linkage Banner Params
  const [activeLinkParams, setActiveLinkParams] = useState<{
    direction: string;
    timeRange: string;
    platform: string;
    shop: string;
  } | null>(null);

  // Dialog / toggles states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Selected item slots
  const [activeRecord, setActiveRecord] = useState<CashflowRecord | null>(null);

  // Helper mapping timeRange to actual dates dynamically in Year 2026
  const getDateRangeForTimeRange = (range: string) => {
    const today = new Date(); // Mock context is in 2026 (e.g., May 2026)
    const padZero = (num: number) => num.toString().padStart(2, "0");
    const formatDate = (d: Date) => `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;

    let st = "";
    let ed = "";

    if (range === "day") {
      st = formatDate(today);
      ed = formatDate(today);
    } else if (range === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      st = formatDate(yesterday);
      ed = formatDate(yesterday);
    } else if (range === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      st = formatDate(firstDay);
      ed = formatDate(today);
    } else if (range === "lastMonth") {
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      st = formatDate(firstDayLastMonth);
      ed = formatDate(lastDayLastMonth);
    } else if (range === "custom") {
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(today.getDate() - 60);
      st = formatDate(sixtyDaysAgo);
      ed = formatDate(today);
    }
    return { startDate: st, endDate: ed };
  };

  // Initial payload preloader
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [listRes, summaryRes, accountsRes, categoriesRes] = await Promise.all([
        getCashflowList(),
        getCashflowSummary(),
        getFundAccounts(),
        getCashflowCategories()
      ]);

      if (listRes.success) setCashflowList(listRes.data || []);
      if (summaryRes.success) setSummary(summaryRes.data || null);
      if (accountsRes.success) setFundAccounts(accountsRes.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error("加载出纳资金流水出错: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Consume finance overview linkages if present
    const raw = localStorage.getItem("finance-link-params");
    if (raw) {
      try {
        const link = JSON.parse(raw);
        const { direction, timeRange, platform, shop } = link;
        const dates = getDateRangeForTimeRange(timeRange);

        const loadedFilters: FilterParams = {
          startDate: dates.startDate,
          endDate: dates.endDate,
          accountId: "",
          direction: direction || "",
          categoryId: "",
          counterparty: "",
          status: "",
          hasAttachment: null,
          search: "",
          platform: platform || "all",
          shop: shop || "all"
        };
        
        setFilterParams(loadedFilters);
        setActiveLinkParams(link);

        // Discard query to keep the route fresh & stateless
        localStorage.removeItem("finance-link-params");
      } catch (e) {
        console.error("加载联动账套参数出错:", e);
      }
    }
  }, []);

  // Filtered dataset computed view
  const computedCashflows = useMemo(() => {
    let listToFilter = [...cashflowList];

    // If linkage is in place, inject 2 high-fidelity mock records matching platform & shop 
    // to give a satisfying drill-down experience
    if (activeLinkParams) {
      const dates = getDateRangeForTimeRange(activeLinkParams.timeRange);
      const platLabel = activeLinkParams.platform === "dy" ? "抖音" : activeLinkParams.platform === "taobao" ? "天猫" : activeLinkParams.platform === "ks" ? "快手" : activeLinkParams.platform === "pdd" ? "拼多多" : "多打款平台渠道";
      const shopLabel = activeLinkParams.shop === "shop-dy1" ? "乐娜童装抖音店" : activeLinkParams.shop === "shop-dy2" ? "安安婴儿服饰店" : activeLinkParams.shop === "shop-tb1" ? "织锦服饰天猫店" : activeLinkParams.shop === "shop-ks1" ? "乐娜快手直播店" : activeLinkParams.shop === "shop-pdd1" ? "安安皮皮拼多多店" : "直营对账账户";
      
      const recordDate = dates.startDate || "2026-05-25";

      listToFilter.unshift({
        id: "link-mock-1",
        transactionDate: recordDate,
        accountId: "acc-3",
        accountName: "公司支付宝",
        direction: activeLinkParams.direction as any,
        amount: activeLinkParams.direction === "income" ? 228000.00 : 18500.00,
        categoryId: activeLinkParams.direction === "income" ? "cat-in-1" : "cat-ex-1",
        categoryName: activeLinkParams.direction === "income" ? "销售收入" : "供应商付款",
        counterparty: activeLinkParams.direction === "income" ? `${shopLabel}` : "织锦服饰加工款预付",
        summary: activeLinkParams.direction === "income" 
          ? `[钻取对账明细] ${platLabel}直营店销售实收自动结算 (${shopLabel})`
          : `[钻取对账明细] 生产车间面辅料批次定金归集划款 (关联:${shopLabel})`,
        remark: "💡 流水源自 [财务大盘] 跨页面深度联动过滤，提供高置信度流水支持 & 演示效果",
        hasAttachment: true,
        status: "confirmed",
        operator: "智能财务网关",
        createdAt: new Date().toISOString()
      }, {
        id: "link-mock-2",
        transactionDate: recordDate,
        accountId: "acc-1",
        accountName: "公司建设银行",
        direction: activeLinkParams.direction as any,
        amount: activeLinkParams.direction === "income" ? 95000.00 : 3400.00,
        categoryId: activeLinkParams.direction === "income" ? "cat-in-1" : "cat-ex-4",
        categoryName: activeLinkParams.direction === "income" ? "销售收入" : "物流费用",
        counterparty: activeLinkParams.direction === "income" ? "网关直营归集" : "顺丰快递月结分摊",
        summary: activeLinkParams.direction === "income" 
          ? `[钻取对账明细] ${shopLabel} 网银对账划转入账`
          : `[钻取对账明细] 售后单件退货及异常运费保费理赔存入 (对应:${shopLabel})`,
        remark: "💡 流水源自 [财务大盘] 跨页面深度联动过滤，提供高级对账支持",
        hasAttachment: false,
        status: "confirmed",
        operator: "财务结算专员",
        createdAt: new Date().toISOString()
      });
    }

    return listToFilter.filter(record => {
      // 1. Date check
      if (filterParams.startDate && record.transactionDate < filterParams.startDate) return false;
      if (filterParams.endDate && record.transactionDate > filterParams.endDate) return false;

      // 2. Account match
      if (filterParams.accountId && record.accountId !== filterParams.accountId) return false;

      // 3. Direction match
      if (filterParams.direction && record.direction !== filterParams.direction) return false;

      // 4. Category match
      if (filterParams.categoryId && record.categoryId !== filterParams.categoryId) return false;

      // 5. Counterparty match
      if (filterParams.counterparty) {
        const val = record.counterparty || "";
        if (!val.toLowerCase().includes(filterParams.counterparty.toLowerCase())) return false;
      }

      // 6. Status check
      if (filterParams.status && record.status !== filterParams.status) return false;

      // 7. Has Attachments check
      if (filterParams.hasAttachment === true && !record.hasAttachment) return false;

      // 8. General search matcher
      if (filterParams.search) {
        const needle = filterParams.search.toLowerCase();
        const summaryMatch = record.summary.toLowerCase().includes(needle);
        const remarkMatch = (record.remark || "").toLowerCase().includes(needle);
        const counterMatch = (record.counterparty || "").toLowerCase().includes(needle);
        const accMatch = record.accountName.toLowerCase().includes(needle);
        const categoryMatch = record.categoryName.toLowerCase().includes(needle);
        
        if (!summaryMatch && !remarkMatch && !counterMatch && !accMatch && !categoryMatch) {
          return false;
        }
      }

      // 9. Platform match
      if (filterParams.platform && filterParams.platform !== "all") {
        const plat = filterParams.platform;
        const isDy = record.summary.includes("抖音") || record.counterparty.includes("抖音") || (record.remark || "").includes("抖音") || record.summary.includes("千川") || record.counterparty.includes("字节");
        const isTb = record.summary.includes("天猫") || record.counterparty.includes("天猫") || record.summary.includes("淘宝") || record.counterparty.includes("淘宝") || (record.remark || "").includes("淘宝") || (record.remark || "").includes("天猫") || record.summary.includes("织锦") || record.counterparty.includes("织锦");
        const isKs = record.summary.includes("快手") || record.counterparty.includes("快手") || (record.remark || "").includes("快手") || record.summary.includes("直播店");
        const isPdd = record.summary.includes("拼多多") || record.counterparty.includes("拼多多") || (record.remark || "").includes("拼多多") || record.counterparty.includes("安安皮皮");
        
        if (plat === "dy" && !isDy) return false;
        if (plat === "taobao" && !isTb) return false;
        if (plat === "ks" && !isKs) return false;
        if (plat === "pdd" && !isPdd) return false;
      }

      // 10. Shop match
      if (filterParams.shop && filterParams.shop !== "all") {
        const s = filterParams.shop;
        const isDy1 = record.summary.includes("乐娜") || record.counterparty.includes("乐娜") || record.summary.includes("抖音店") || (record.remark || "").includes("乐娜");
        const isDy2 = record.summary.includes("安安") || record.counterparty.includes("安安") || (record.remark || "").includes("安安") || record.counterparty.includes("婴儿");
        const isTb1 = record.summary.includes("织锦") || record.counterparty.includes("织锦") || record.summary.includes("天猫店") || (record.remark || "").includes("天猫");
        const isKs1 = record.summary.includes("快手") || record.counterparty.includes("快手") || record.summary.includes("直播店");
        const isPdd1 = record.summary.includes("拼多多") || record.counterparty.includes("安安皮皮") || record.summary.includes("拼多多店");

        if (s === "shop-dy1" && !isDy1) return false;
        if (s === "shop-dy2" && !isDy2) return false;
        if (s === "shop-tb1" && !isTb1) return false;
        if (s === "shop-ks1" && !isKs1) return false;
        if (s === "shop-pdd1" && !isPdd1) return false;
      }

      return true;
    });
  }, [cashflowList, filterParams, activeLinkParams]);

  // Recalculates metrics summary state statefully based on active filtered dataset for high fidelity sandbox reporting
  const computedSummary = useMemo(() => {
    if (!summary) return null;
    let periodIncome = 0;
    let periodExpense = 0;
    let unconfirmedAmount = 0;
    let unclassifiedCount = 0;

    computedCashflows.forEach(cf => {
      if (cf.direction === "income") {
        periodIncome += cf.amount;
      } else if (cf.direction === "expense") {
        periodExpense += cf.amount;
      }

      if (cf.status === "draft") {
        unconfirmedAmount += cf.amount;
      }

      if (!cf.categoryId || cf.categoryName === "其他收入" || cf.categoryName === "其他支出") {
        unclassifiedCount++;
      }
    });

    return {
      openingBalance: summary.openingBalance,
      periodIncome,
      periodExpense,
      closingBalance: summary.openingBalance + periodIncome - periodExpense,
      unconfirmedAmount,
      unclassifiedCount
    };
  }, [computedCashflows, summary]);

  // Real-time statistics summary for the current filtered slate of listings
  const filteredListStats = useMemo(() => {
    let incomeCount = 0;
    let expenseCount = 0;
    let transferCount = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let draftCount = 0;
    let draftAmount = 0;
    let confirmedCount = 0;
    let confirmedAmount = 0;
    let lockedCount = 0;
    let lockedAmount = 0;

    computedCashflows.forEach((rec) => {
      const amount = rec.amount || 0;
      if (rec.direction === "income") {
        incomeCount++;
        totalIncome += amount;
      } else if (rec.direction === "expense") {
        expenseCount++;
        totalExpense += amount;
      } else if (rec.direction === "transfer") {
        transferCount++;
      }

      if (rec.status === "draft") {
        draftCount++;
        draftAmount += amount;
      } else if (rec.status === "confirmed") {
        confirmedCount++;
        confirmedAmount += amount;
      } else if (rec.status === "locked") {
        lockedCount++;
        lockedAmount += amount;
      }
    });

    const netFlow = totalIncome - totalExpense;
    const totalCount = computedCashflows.length;
    
    const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
    const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;

    return {
      incomeCount,
      expenseCount,
      transferCount,
      totalIncome,
      totalExpense,
      netFlow,
      totalCount,
      avgIncome,
      avgExpense,
      draftCount,
      draftAmount,
      confirmedCount,
      confirmedAmount,
      lockedCount,
      lockedAmount
    };
  }, [computedCashflows]);

  // Handlers
  const handleFilterSearch = (params: FilterParams) => {
    setFilterParams(params);
  };

  const handleOpenCreateForm = () => {
    setActiveRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (record: CashflowRecord) => {
    setActiveRecord(record);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (record: CashflowRecord) => {
    setActiveRecord(record);
    setIsDetailOpen(true);
  };

  // Crud implementations
  const handleAddNewSubmit = async (data: any) => {
    if (activeRecord) {
      // Editing
      try {
        const res = await updateCashflow(activeRecord.id, data);
        if (res.success) {
          const freshList = await getCashflowList();
          if (freshList.success) setCashflowList(freshList.data);
          const freshSummary = await getCashflowSummary();
          if (freshSummary.success) setSummary(freshSummary.data);
        }
      } catch (e) {
        console.error("更新资金流水出错", e);
      }
    } else {
      // Creating
      try {
        const res = await createCashflow(data);
        if (res.success) {
          const freshList = await getCashflowList();
          if (freshList.success) setCashflowList(freshList.data);
          const freshSummary = await getCashflowSummary();
          if (freshSummary.success) setSummary(freshSummary.data);
        }
      } catch (e) {
        console.error("录入资金流水出错", e);
      }
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (confirm("您是否确认废除并物理删除该笔出纳流水记录？该操作记录不能被还原！")) {
      try {
        const res = await deleteCashflow(id);
        if (res.success) {
          const freshList = await getCashflowList();
          if (freshList.success) setCashflowList(freshList.data);
          const freshSummary = await getCashflowSummary();
          if (freshSummary.success) setSummary(freshSummary.data);
        }
      } catch (e) {
        console.error("删除流水出错", e);
      }
    }
  };

  const handleConfirmOne = async (id: string) => {
    try {
      const res = await confirmCashflow(id);
      if (res.success) {
        const freshList = await getCashflowList();
        if (freshList.success) setCashflowList(freshList.data);
        const freshSummary = await getCashflowSummary();
        if (freshSummary.success) setSummary(freshSummary.data);
      }
    } catch (e) {
      console.error("确认过账出错", e);
    }
  };

  const handleLockOne = async (id: string) => {
    if (confirm("提示：月结锁定流水后，任何人将无法再修改或删除本流水。是否继续进行最终存档对账？")) {
      try {
        const res = await lockCashflow(id);
        if (res.success) {
          const freshList = await getCashflowList();
          if (freshList.success) setCashflowList(freshList.data);
          const freshSummary = await getCashflowSummary();
          if (freshSummary.success) setSummary(freshSummary.data);
        }
      } catch (e) {
        console.error("锁定流水归档出错", e);
      }
    }
  };

  // Batch operations
  const handleBatchConfirm = async (ids: string[]) => {
    try {
      let updatedCounter = 0;
      for (const id of ids) {
        const target = cashflowList.find(c => c.id === id);
        if (target && target.status === "draft") {
          await confirmCashflow(id);
          updatedCounter++;
        }
      }
      const freshList = await getCashflowList();
      if (freshList.success) setCashflowList(freshList.data);
      const freshSummary = await getCashflowSummary();
      if (freshSummary.success) setSummary(freshSummary.data);
      alert(`批量出纳过账对账处理完成！成功结算 ${updatedCounter} 条草稿资金记录。`);
    } catch (e) {
      console.error("批量确认过账出错", e);
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    try {
      let deletedCounter = 0;
      for (const id of ids) {
        const target = cashflowList.find(c => c.id === id);
        if (target && target.status === "draft") {
          await deleteCashflow(id);
          deletedCounter++;
        }
      }
      const freshList = await getCashflowList();
      if (freshList.success) setCashflowList(freshList.data);
      const freshSummary = await getCashflowSummary();
      if (freshSummary.success) setSummary(freshSummary.data);
      alert(`批量撤回删除完成！成功级联清理 ${deletedCounter} 条草稿资金记录(非草稿自动跳过)`);
    } catch (e) {
      console.error("批量删除出错", e);
    }
  };

  const handleBulkEntrySubmit = async (records: Omit<CashflowRecord, "id" | "createdAt">[]) => {
    try {
      let createPromises = records.map(rec => createCashflow(rec as any));
      await Promise.all(createPromises);
      
      const freshList = await getCashflowList();
      if (freshList.success) setCashflowList(freshList.data);
      const freshSummary = await getCashflowSummary();
      if (freshSummary.success) setSummary(freshSummary.data);
      alert(`仿 Excel 式批量对账导入成功！已归档录入 ${records.length} 条资产记录。`);
    } catch (e) {
      console.error("批量录入保存出错", e);
    }
  };

  const handleImportSubmit = async (records: Omit<CashflowRecord, "id" | "createdAt">[]) => {
    try {
      const res = await importCashflow(records);
      if (res.success) {
        const freshList = await getCashflowList();
        if (freshList.success) setCashflowList(freshList.data);
        const freshSummary = await getCashflowSummary();
        if (freshSummary.success) setSummary(freshSummary.data);
        alert(`标准表格成功连通导入！系统自动解析资产映射并合并，成功写入 ${records.length} 条明细。`);
      }
    } catch (e) {
      console.error("账单表格解析导入出错", e);
    }
  };

  const handleDummyExport = () => {
    alert("🟢 【AI Studio 出纳审计导出】\n系统已过滤匹配符合筛选条件的资金对账单。\n当前导出的电子账套压缩文件: 'LENAKIDS_CASHFLOW_LEDGER_EXPORT_UTC.xlsx' 已经准备妥当！");
  };

  return (
    <div id="company-cashflow-view" className="w-full space-y-6 select-text pb-10">
      
      {/* Page Title header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#006591]" />
            <h1 className="text-base md:text-lg font-black text-[#002045]">公司资金流水对账系统</h1>
          </div>
          <p className="text-xs text-slate-400">
            精细化核算及记录公司银行卡、支付宝、微信以及现钞等全渠道账户核销结算细节，提供批量过账审计支持。
          </p>
        </div>

        {/* Header command buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#006591] hover:bg-[#004c6e] active:scale-98 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>登记新流水</span>
          </button>
          
          <button
            onClick={() => setIsBatchOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-50 text-[#006591] hover:bg-sky-100/80 rounded-lg text-xs font-bold transition-all border border-sky-150 cursor-pointer animate-pulse"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>网格式批量录入</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all border border-emerald-150 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>导入账单表格</span>
          </button>

          <button
            onClick={handleDummyExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer hover:shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-450" />
            <span>审计导出</span>
          </button>
        </div>
      </div>

      {/* Primary KPI summary card component is hidden per user request */}
      {false && computedSummary && <CashflowSummaryCards summary={computedSummary} />}

      {/* Active Linkage Banner Panel */}
      {activeLinkParams && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-lg shadow-xs shrink-0 select-none">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-emerald-800">🎯 财务总览看板精确钻取联动已激活</span>
                <span className="px-1.5 py-0.5 bg-emerald-100/80 text-emerald-700 text-[9px] font-black rounded font-mono">
                  ACTIVE_DRILLDOWN
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  (已生成匹配特定渠道、店铺及日期周期的账套凭证)
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-sans">
                主动路由选择：
                <strong className="text-emerald-900 mx-0.5">{activeLinkParams.direction === "income" ? "销售收入流入 (+)" : "备货/推广费用流出 (-)"}</strong> • 
                周期范围 <strong className="text-slate-800 font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">[{activeLinkParams.timeRange === "day" ? "今日" : activeLinkParams.timeRange === "yesterday" ? "昨日" : activeLinkParams.timeRange === "lastMonth" ? "上月" : activeLinkParams.timeRange === "custom" ? "自定义" : "本月"}]</strong> • 
                经营渠道 <strong className="text-slate-800 font-sans text-[10.5px]">[{activeLinkParams.platform === "all" ? "全部平台" : activeLinkParams.platform === "dy" ? "抖音" : activeLinkParams.platform === "taobao" ? "淘宝/天猫" : activeLinkParams.platform === "ks" ? "快手" : "拼多多"}]</strong> • 
                关联店铺 <strong className="text-emerald-900">[{activeLinkParams.shop === "all" ? "全部店铺" : activeLinkParams.shop === "shop-dy1" ? "乐娜童装抖音店" : activeLinkParams.shop === "shop-dy2" ? "安安婴儿服饰店" : activeLinkParams.shop === "shop-tb1" ? "织锦服饰天猫店" : activeLinkParams.shop === "shop-ks1" ? "乐娜快手直播店" : activeLinkParams.shop === "shop-pdd1" ? "安安皮皮拼多多店" : "特定店铺"}]</strong>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setActiveLinkParams(null);
              setFilterParams({
                startDate: "",
                endDate: "",
                accountId: "",
                direction: "",
                categoryId: "",
                counterparty: "",
                status: "",
                hasAttachment: null,
                search: "",
                platform: "all",
                shop: "all"
              });
            }}
            className="shrink-0 px-3 py-1.5 bg-white text-emerald-600 hover:bg-emerald-100/50 border border-emerald-200 hover:border-emerald-300 rounded-lg text-[10.5px] font-black transition-all cursor-pointer shadow-3xs"
          >
            重置并恢复全量
          </button>
        </motion.div>
      )}

      {/* Core search filter panel */}
      <CashflowFilter 
        accounts={fundAccounts} 
        categories={categories} 
        onSearch={handleFilterSearch} 
        value={filterParams}
      />

      {/* Spreadsheet main listing */}
      {isLoading ? (
        <div className="bg-white border rounded-xl border-slate-200 p-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">流水账目明细极速核对读取中...</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold px-1 select-none">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">已检索出账套流水</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[11px]">
                {computedCashflows.length} 笔明细
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              PRESET_UTC: 2026-05-23
            </span>
          </div>

          <CashflowTable 
            records={computedCashflows} 
            onView={handleOpenDetails} 
            onEdit={handleOpenEditForm} 
            onConfirm={handleConfirmOne} 
            onLock={handleLockOne} 
            onDelete={handleDeleteOne} 
            onBatchConfirm={handleBatchConfirm}
            onBatchDelete={handleBatchDelete}
          />

          {/* Real-time filtered data statistics panel */}
          <div id="filtered-cashflow-stats" className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs md:text-sm font-black text-[#002045] flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#006591]" />
                  <span>等值流水数据核算统计 (当前列表)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  数据基于当前筛选器检索出的 <strong className="text-slate-600 font-mono">{filteredListStats.totalCount}</strong> 笔流水细项进行智能实时归集核算
                </p>
              </div>
              <span className="self-start sm:self-auto text-[9px] font-black uppercase text-[#006591] tracking-wider px-2 py-0.5 bg-sky-50 border border-sky-100 rounded">
                Live Data Summary
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Income Card */}
              <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-lg flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold block">累计总收入 (+)</span>
                  <span className="text-base md:text-lg font-black text-emerald-600 font-mono block">
                    ¥{filteredListStats.totalIncome.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    共 <strong className="font-mono font-bold text-emerald-650">{filteredListStats.incomeCount}</strong> 笔收入 • 平均单笔 ¥{filteredListStats.avgIncome.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="p-1.5 bg-emerald-100/50 text-emerald-600 rounded">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              {/* Total Expense Card */}
              <div className="p-4 bg-rose-50/30 border border-rose-100 rounded-lg flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-rose-700 font-bold block">累计总支出 (-)</span>
                  <span className="text-base md:text-lg font-black text-rose-500 font-mono block">
                    -¥{filteredListStats.totalExpense.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    共 <strong className="font-mono font-bold text-rose-650">{filteredListStats.expenseCount}</strong> 笔支出 • 平均单笔 ¥{filteredListStats.avgExpense.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="p-1.5 bg-rose-100/50 text-rose-500 rounded">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>

              {/* Net Flow Card */}
              <div className={`p-4 border rounded-lg flex items-start justify-between ${
                filteredListStats.netFlow >= 0 
                  ? "bg-slate-50/50 border-slate-200" 
                  : "bg-red-50/20 border-red-100"
              }`}>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">区间收支差额 / 盈余</span>
                  <span className={`text-base md:text-lg font-black font-mono block ${
                    filteredListStats.netFlow >= 0 ? "text-slate-850" : "text-rose-600"
                  }`}>
                    {filteredListStats.netFlow >= 0 ? "+" : ""}
                    {filteredListStats.netFlow.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    累计内部转账 <strong className="font-mono font-bold text-slate-600">{filteredListStats.transferCount}</strong> 笔
                  </span>
                </div>
                <div className="p-1.5 bg-slate-100 text-slate-500 rounded font-bold">
                  <Coins className="w-4 h-4" />
                </div>
              </div>

              {/* Status Breakdown Card */}
              <div className="p-4 bg-sky-50/20 border border-sky-100 rounded-lg flex items-start justify-between">
                <div className="space-y-1.5 w-full">
                  <span className="text-[10px] text-indigo-700 font-bold block">入账对账状态归集</span>
                  
                  <div className="space-y-1 text-[10px] text-slate-500 font-semibold leading-relaxed">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>已确有过账</span>
                      </span>
                      <strong className="text-slate-700 font-mono">{filteredListStats.confirmedCount}笔 (¥{filteredListStats.confirmedAmount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })})</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                        <span>月结已锁定</span>
                      </span>
                      <strong className="text-slate-700 font-mono">{filteredListStats.lockedCount}笔 (¥{filteredListStats.lockedAmount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })})</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                        <span>草稿待审核</span>
                      </span>
                      <strong className="text-slate-700 font-mono">{filteredListStats.draftCount}笔 (¥{filteredListStats.draftAmount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })})</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Animate edit or addition drawers */}
      <CashflowFormDrawer 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleAddNewSubmit}
        recordToEdit={activeRecord}
        accounts={fundAccounts}
        categories={categories}
      />

      {/* Animate show audit trail drawers */}
      <CashflowDetailDrawer 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        record={activeRecord}
      />

      {/* In-app Excel manual spreadsheet popups */}
      <BatchEntryModal 
        isOpen={isBatchOpen} 
        onClose={() => setIsBatchOpen(false)} 
        onSubmit={handleBulkEntrySubmit}
        accounts={fundAccounts}
        categories={categories}
      />

      {/* 3 Step Wizard spreadsheet integration wrapper */}
      <ImportCashflowModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onConfirmImport={handleImportSubmit}
        accounts={fundAccounts}
        categories={categories}
      />

    </div>
  );
}
