/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, Plus, LayoutGrid, FileSpreadsheet, Download, RefreshCw, AlertCircle
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
    search: ""
  });

  // Dialog / toggles states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Selected item slots
  const [activeRecord, setActiveRecord] = useState<CashflowRecord | null>(null);

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
  }, []);

  // Filtered dataset computed view
  const computedCashflows = useMemo(() => {
    return cashflowList.filter(record => {
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

      return true;
    });
  }, [cashflowList, filterParams]);

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

      {/* Primary KPI summary card component */}
      {computedSummary ? (
        <CashflowSummaryCards summary={computedSummary} />
      ) : (
        <div className="h-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
          正在计算最新账户合并资金余额，请稍等...
        </div>
      )}

      {/* Core search filter panel */}
      <CashflowFilter 
        accounts={fundAccounts} 
        categories={categories} 
        onSearch={handleFilterSearch} 
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
