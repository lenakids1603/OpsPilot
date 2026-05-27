/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, Plus, FileSpreadsheet, Download, RefreshCw, AlertCircle,
  Search, Filter, Landmark, Sparkles, Check, X, FileText, Wallet, AlertTriangle, Upload, ChevronRight, Loader2, TrendingDown, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SupplierBill, BillPayment } from "./types";
import SupplierBillDrawer from "./components/SupplierBillDrawer";
import { 
  getReconciliationList, getReconciliationSummary, getActiveSuppliers,
  addSupplierPayment, uploadReconciliationFile, mapBatchToSupplierBill, BackendBatch
} from "../../api/reconciliation";

export default function SupplierBillAuditPage() {
  const [batches, setBatches] = useState<BackendBatch[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_inbound: 0,
    total_deductions: 0,
    total_payable: 0,
    total_paid: 0,
    total_unpaid: 0,
    abnormal_count: 0
  });

  // Loading indicator states
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filtering states
  const [selectedMonth, setSelectedMonth] = useState("全部");
  const [selectedSupplier, setSelectedSupplier] = useState("全部");
  const [selectedAuditStatus, setSelectedAuditStatus] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Interaction Modals / Drawers states
  const [activeBillIdForDrawer, setActiveBillIdForDrawer] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Quick Payment Modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [payModalBatchId, setPayModalBatchId] = useState<string | null>(null);
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payAmount, setPayAmount] = useState("");
  const [payAccount, setPayAccount] = useState("招商银行 (对公往来端 9120)");
  const [payReceiverName, setPayReceiverName] = useState("");
  const [payReceiverAccount, setPayReceiverAccount] = useState("");
  const [payRemark, setPayRemark] = useState("");

  // Simulated Import Modals (with dynamic background posting!)
  const [showBillImportModal, setShowBillImportModal] = useState(false);
  const [showInboundImportModal, setShowInboundImportModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedBatchForUpload, setSelectedBatchForUpload] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load and Poll trigger
  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedSupplier, selectedAuditStatus]);

  const fetchData = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      // Fetch dynamic stats from the cents database
      const summaryRes = await getReconciliationSummary();
      if (summaryRes.success && summaryRes.data) {
        setStats(summaryRes.data);
      }

      // Fetch active suppliers
      const suppliersRes = await getActiveSuppliers();
      if (suppliersRes.success && suppliersRes.data) {
        setSuppliers(suppliersRes.data);
      }

      // Construct filter parameters for query
      const pFilters: any = {};
      if (selectedMonth !== "全部") pFilters.month = selectedMonth;
      if (selectedSupplier !== "全部") {
        const found = suppliersRes.data?.find((s: any) => s.name === selectedSupplier);
        if (found) pFilters.supplier_id = found.id;
      }
      if (selectedAuditStatus !== "全部") {
        let statusVal = "pending";
        if (selectedAuditStatus === "有差异") statusVal = "diff";
        else if (selectedAuditStatus === "已确认") statusVal = "approved";
        else if (selectedAuditStatus === "已结清") statusVal = "settled";
        else if (selectedAuditStatus === "待核对") statusVal = "pending";
        pFilters.status = statusVal;
      }

      // Load batch lists
      const listRes = await getReconciliationList(pFilters);
      if (listRes.success && listRes.data) {
        setBatches(listRes.data);
      }
    } catch (e: any) {
      showToast("❌ 无法从微服务拉取对账册：" + e.message);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // Overall Data sums based on Filtered data list
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchSupplier = b.supplier_name.toLowerCase().includes(query);
        const matchBillNo = b.bill_no.toLowerCase().includes(query);
        const matchId = b.id.toLowerCase().includes(query);
        return matchSupplier || matchBillNo || matchId;
      }
      return true;
    });
  }, [batches, searchQuery]);

  // Paginated elements
  const paginatedBatches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBatches.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBatches, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / itemsPerPage));

  // Trigger Simple Register Payment Dialog
  const openPayModal = (batch: BackendBatch) => {
    setPayModalBatchId(batch.id);
    setPayAmount((batch.unpaid_amount / 100).toString());
    setPayReceiverName(batch.supplier_name);
    setPayReceiverAccount("6228489201992012");
    setPayRemark("");
    setShowPayModal(true);
  };

  const handlePayModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(payAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast("⚠️ 请输入有效的付款金额");
      return;
    }

    if (!payModalBatchId) return;

    setLoading(true);
    try {
      const cents = Math.round(amountVal * 100);
      const res = await addSupplierPayment(payModalBatchId, {
        payment_date: payDate,
        payer_account: payAccount,
        receiver_name: payReceiverName,
        receiver_account: payReceiverAccount,
        amount: cents,
        remark: payRemark || "通过主页面列表快捷记账"
      });

      if (res.success) {
        showToast(`🟢 付款流水 ¥${amountVal.toLocaleString()} 已自动划账冲销！`);
        setShowPayModal(false);
        await fetchData();
      } else {
        showToast("❌ 付款添加失败：" + res.message);
      }
    } catch (err: any) {
      showToast("❌ 付款更新失败: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles simulated/parsed Excel drag uploads
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Submit actual uploaded Excel for parsing!
  const triggerBillImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      showToast("⚠️ 请先挑选对账结算大表");
      return;
    }

    const targetBatch = selectedBatchForUpload || batches[0]?.id;
    if (!targetBatch) {
      showToast("⚠️ 当前系统账本中无任何核账期批次，请先生成或选择默认批次");
      return;
    }

    setLoading(true);
    try {
      const res = await uploadReconciliationFile(
        "/api/supplier-reconciliations/import-supplier-bill",
        uploadedFile,
        targetBatch
      );
      if (res.success) {
        showToast(`🎉 成功解析该供应商申报账单表格！差额比对流水已载入完毕。`);
        setShowBillImportModal(false);
        setUploadedFile(null);
        await fetchData();
      } else {
        showToast("⚠️ " + res.message);
      }
    } catch (err: any) {
      showToast("❌ 导入对账大表失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerInboundImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      showToast("⚠️ 请先选择仓库到货/入库大表");
      return;
    }

    const targetBatch = selectedBatchForUpload || batches[0]?.id;
    if (!targetBatch) {
      showToast("⚠️ 暂无任何对账批次");
      return;
    }

    setLoading(true);
    try {
      const res = await uploadReconciliationFile(
        "/api/supplier-reconciliations/import-inbound",
        uploadedFile,
        targetBatch
      );
      if (res.success) {
        showToast(`🎉 标准到货数及聚水潭系统入库明细导入成功！`);
        setShowInboundImportModal(false);
        setUploadedFile(null);
        await fetchData();
      } else {
        showToast("⚠️ " + res.message);
      }
    } catch (err: any) {
      showToast("❌ 导入到货失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export reconciliation table spreadsheet
  const handleExportReconciliation = () => {
    showToast("📊 报表打包中：已下载本期供应商账单核对、最终合意已付欠款对账总大表 (XLSX, 印发版)。");
    
    // Simulate generation of CSV to download
    const headers = [
      "账单月份", "账单批次号", "供应商", "账单类型", "结算方式", 
      "系统到货金额", "供应商账单金额", "退厂金额", "返修回仓金额", 
      "运费其他调整", "质量扣款", "超时扣款", "系统计算实际应付", 
      "已付款金额", "待结清欠款", "核对差异", "状态"
    ].join(",");
    
    const rows = filteredBatches.map(b => [
      b.month, b.id, b.supplier_name, b.bill_type, b.settlement_method,
      b.system_inbound_amount / 100, b.supplier_bill_amount / 100, b.return_amount / 100, b.repair_return_amount / 100,
      (b.freight_amount + b.other_adjustment_amount) / 100, b.quality_deduction_amount / 100, b.timeout_deduction_amount / 100,
      b.calculated_payable_amount / 100, b.paid_amount / 100, b.unpaid_amount / 100,
      b.diff_amount / 100, b.status
    ].join(","));
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `供应商比对总账表_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert currently active batch to SupplierBill interface for the inner drawer
  const activeBillForDrawer = useMemo(() => {
    const target = batches.find(b => b.id === activeBillIdForDrawer);
    if (!target) return null;
    return mapBatchToSupplierBill(target);
  }, [batches, activeBillIdForDrawer]);

  return (
    <div className="space-y-6 select-text pb-12 font-sans text-slate-800 bg-[#f8f9fc]">
      
      {/* Dynamic Tiny Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white font-bold text-xs py-2.5 px-6 rounded-full shadow-2xl z-[150] flex items-center space-x-2 select-none"
          >
            <span className="text-emerald-400">●</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 一、页面顶部 Header Block with description */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-3xs select-none">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">
                供应商账单核对
              </h1>
              <p className="text-xs text-slate-400 mt-1.8 leading-none">
                以大货实际到货及入库金额为结算基准，智能比对供应商申报申报、核消退厂返修、运费质罚公摊与付款流水
              </p>
            </div>
          </div>
        </div>

        {/* 3 Upper-Right Core buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-bold font-sans">
          <button 
            onClick={() => { setSelectedBatchForUpload(batches[0]?.id || ""); setShowBillImportModal(true); }} 
            className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-650 bg-white rounded-xl cursor-pointer transition-colors shadow-3xs flex items-center gap-1.5 font-black"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>导入供应商账单</span>
          </button>

          <button 
            onClick={() => { setSelectedBatchForUpload(batches[0]?.id || ""); setShowInboundImportModal(true); }}
            className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-650 bg-white rounded-xl cursor-pointer transition-colors shadow-3xs flex items-center gap-1.5 font-black"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>导入到货明细</span>
          </button>

          <button 
            onClick={handleExportReconciliation}
            className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-650 bg-white rounded-xl cursor-pointer transition-colors shadow-3xs flex items-center gap-1.5 font-black"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>导出核对结果</span>
          </button>
        </div>
      </div>

      {/* 二、筛选区 Filter Row (Simple, compact) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs select-none">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* 1. Month selection */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">账单月份</label>
            <select 
              value={selectedMonth}
              onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 text-slate-700 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold leading-normal focus:outline-none"
            >
              <option value="全部">全部月份</option>
              <option value="2026-05">2026-05期</option>
              <option value="2026-04">2026-04期</option>
            </select>
          </div>

          {/* 2. Supplier dropdown */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">供应方企业</label>
            <select 
              value={selectedSupplier}
              onChange={e => { setSelectedSupplier(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 text-slate-700 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold leading-normal focus:outline-none col-span-1"
            >
              <option value="全部">全部核心供应商</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Reconcile Audit Status */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">多业务差异状态</label>
            <select 
              value={selectedAuditStatus}
              onChange={e => { setSelectedAuditStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 text-slate-700 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold leading-normal focus:outline-none"
            >
              <option value="全部">全部状态</option>
              <option value="待核对">待核对 (未过账)</option>
              <option value="有差异">核对差异 (偏位红)</option>
              <option value="已确认">已确认 (终审过账)</option>
              <option value="已结清">已结清 (货款付尽)</option>
            </select>
          </div>

          {/* 4. Inbound text search */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">检索批次号/单号</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="搜索申明编号 / 批次流水..."
                className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl py-1.8 pl-8.5 pr-3 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 三、数据汇总卡片 Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 select-none">
        {[
          { label: "系统应计入库额", value: stats.total_inbound, style: "slate", icon: <Landmark className="w-4 h-4 text-indigo-500" /> },
          { label: "惩罚与双向调整项", value: stats.total_deductions, style: "rose", icon: <TrendingDown className="w-4 h-4 text-rose-500 animate-pulse" /> },
          { 
            label: "核准实际应付", 
            value: stats.total_payable, 
            style: "green", 
            icon: <Check className="w-4 h-4 text-emerald-500" /> 
          },
          { label: "历史已付款金额", value: stats.total_paid, style: "teal", icon: <Wallet className="w-4 h-4 text-teal-500" /> },
          { label: "账期剩余欠款总额", value: stats.total_unpaid, style: "rose-bold", icon: <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" /> },
          { label: "系统检出差异宗数", value: stats.abnormal_count, style: "warn", icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, isUnit: false }
        ].map((card, idx) => {
          const isWarn = card.style === "warn" && card.value > 0;
          const isRoseBold = card.style === "rose-bold";
          const isRose = card.style === "rose";
          const isGreen = card.style === "green";
          const isTeal = card.style === "teal";
          
          return (
            <div 
              key={idx}
              className={`bg-white border hover:border-slate-300 rounded-2xl p-4.5 shadow-3xs hover:shadow-2xs transition-all space-y-1.5 relative overflow-hidden ${
                isRoseBold ? "ring-1 ring-rose-50/50 bg-[#fffbfa]/70 border-rose-100" : 
                isWarn ? "ring-1 ring-amber-50/50 bg-[#fffdf9] border-amber-100" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">
                <span>{card.label}</span>
                {card.icon}
              </div>
              <div className="flex items-baseline space-x-0.2 select-text pt-1">
                {card.isUnit !== false && <span className="text-xs text-slate-400 font-bold font-mono">¥</span>}
                <span className={`text-[17px] font-black font-mono tracking-tight leading-none ${
                  isRoseBold ? "text-rose-600 font-extrabold" : 
                  isRose ? "text-rose-500 font-extrabold" :
                  isWarn ? "text-amber-600 font-black animate-pulse" : 
                  isGreen ? "text-emerald-600" :
                  isTeal ? "text-teal-600" : "text-slate-900"
                }`}>
                  {statsLoading ? "..." : card.value.toLocaleString()}
                </span>
                {card.isUnit === false && <span className="text-[10px] font-bold text-slate-450 ml-1">笔</span>}
              </div>
              <div className="text-[9px] font-bold text-slate-400 leading-none pt-0.5">
                {isRoseBold && card.value > 0 ? (
                  <span className="text-rose-600 bg-rose-50/50 px-1 py-0.2 rounded">累积待打款额</span>
                ) : isWarn ? (
                  <span className="text-amber-600 bg-amber-50 px-1 py-0.2 rounded">触发对碰偏位</span>
                ) : (
                  <span className="text-slate-450 font-normal">动态折算对碰</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 四、主表：供应商账单列表 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-3xs overflow-hidden">
        
        {/* Table information sub-header */}
        <div className="bg-slate-50/40 border-b border-slate-100 p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs select-none">
          <div className="flex items-center space-x-2">
            <span className="text-slate-450 font-bold block">
              当前展示对账清单批次: <strong className="text-slate-800 font-mono text-sm">{filteredBatches.length}</strong> / {batches.length} 组
            </span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-sky-50 text-sky-800 rounded font-black text-[9.5px]">
                检索关键: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
          <div className="text-slate-400 text-[10.5px] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-350" />
            <span>基于仓库入库实况（非CPS销售）跑批，人民币金额标准格式展示</span>
          </div>
        </div>

        {/* Dynamic Connected Spreadsheet View */}
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9fd] text-slate-400 font-extrabold uppercase text-[9.2px] border-b border-slate-200/80 select-none">
              <tr>
                <th className="p-3 pl-5 text-center w-10">#</th>
                <th className="p-3">账单月份</th>
                <th className="p-3">账单批次号</th>
                <th className="p-3">供应商</th>
                <th className="p-3">账单类型</th>
                <th className="p-3">结算方式</th>
                <th className="p-3 text-right">系统到货金额</th>
                <th className="p-3 text-right">供应商账单金额</th>
                
                {/* Dynamically requested adjustment columns */}
                <th className="p-3 text-right text-rose-500">退厂金额</th>
                <th className="p-3 text-right text-[#0d7f57]">返修回仓金额</th>
                <th className="p-3 text-right text-slate-500">运费/其他调整</th>
                <th className="p-3 text-right text-red-500">质量扣款</th>
                <th className="p-3 text-right text-amber-600">超时扣款</th>

                <th className="p-3 text-right text-emerald-700">实际应付款</th>
                <th className="p-3 text-right text-teal-600">已付款金额</th>
                <th className="p-3 text-right text-rose-600">待结清欠款</th>
                <th className="p-3 text-right text-blue-600">核对差异</th>
                <th className="p-3 text-center">状态</th>
                <th className="p-3 text-right pr-5">操作工作台</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {paginatedBatches.map((b, index) => {
                const diffCents = b.diff_amount;
                const outstanding = b.unpaid_amount / 100;

                // Color mappings for requested states
                let statusClassName = "bg-slate-100 text-slate-500 border-slate-200";
                let statusLabel = "待核对";
                if (b.status === "diff") {
                  statusClassName = "bg-rose-50 text-rose-600 border-rose-200 ring-1 ring-rose-400/20";
                  statusLabel = "有差异";
                } else if (b.status === "approved") {
                  statusClassName = "bg-emerald-50 text-emerald-600 border-emerald-200 ring-1 ring-emerald-400/20";
                  statusLabel = "已确认";
                } else if (b.status === "settled") {
                  statusClassName = "bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-400/25";
                  statusLabel = "已结清";
                } else if (b.status === "partial_paid") {
                  statusClassName = "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-400/20";
                  statusLabel = "已部分付款";
                } else if (b.status === "draft") {
                  statusClassName = "bg-slate-50 text-slate-450 border-slate-200";
                  statusLabel = "草稿";
                }

                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Index */}
                    <td className="p-3 pl-5 text-center select-none font-mono text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* period */}
                    <td className="p-3 font-mono text-slate-500">
                      {b.month}
                    </td>

                    {/* Batch No */}
                    <td className="p-3 font-mono text-slate-900 font-black text-[11px]">
                      {b.bill_no}
                    </td>

                    {/* Supplier */}
                    <td className="p-3 text-slate-900 font-bold">
                      {b.supplier_name}
                    </td>

                    {/* Bill type */}
                    <td className="p-3 text-slate-500 text-[10.5px]">
                      {b.bill_type}
                    </td>

                    {/* Settlement method */}
                    <td className="p-3 text-slate-500">
                      {b.settlement_method}
                    </td>

                    {/* system inbound */}
                    <td className="p-3 text-right font-mono">
                      ¥{(b.system_inbound_amount / 100).toLocaleString()}
                    </td>

                    {/* billing quote */}
                    <td className="p-3 text-right font-mono text-slate-800">
                      ¥{(b.supplier_bill_amount / 100).toLocaleString()}
                    </td>

                    {/* adjustments variables columns */}
                    <td className="p-3 text-right font-mono text-rose-500">
                      {b.return_amount > 0 ? `-¥${(b.return_amount / 100).toLocaleString()}` : "¥0"}
                    </td>

                    <td className="p-3 text-right font-mono text-[#0d7f57]">
                      {b.repair_return_amount > 0 ? `+¥${(b.repair_return_amount / 100).toLocaleString()}` : "¥0"}
                    </td>

                    <td className="p-3 text-right font-mono text-slate-500">
                      {b.freight_amount + b.other_adjustment_amount > 0 ? `¥${((b.freight_amount + b.other_adjustment_amount) / 100).toLocaleString()}` : "¥0"}
                    </td>

                    <td className="p-3 text-right font-mono text-red-500">
                      {b.quality_deduction_amount > 0 ? `-¥${(b.quality_deduction_amount / 100).toLocaleString()}` : "¥0"}
                    </td>

                    <td className="p-3 text-right font-mono text-amber-600">
                      {b.timeout_deduction_amount > 0 ? `-¥${(b.timeout_deduction_amount / 100).toLocaleString()}` : "¥0"}
                    </td>

                    {/* system actual calculated payable */}
                    <td className="p-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/10">
                      ¥{(b.calculated_payable_amount / 100).toLocaleString()}
                    </td>

                    {/* paid amount */}
                    <td className="p-3 text-right font-mono text-teal-600">
                      ¥{(b.paid_amount / 100).toLocaleString()}
                    </td>

                    {/* outstanding unpaid debt info */}
                    <td className={`p-3 text-right font-mono ${outstanding > 0 ? "text-rose-600 font-extrabold bg-rose-50/5" : "text-slate-400"}`}>
                      ¥{outstanding.toLocaleString()}
                    </td>

                    {/* diff amount matching */}
                    <td className="p-3 text-right">
                      {diffCents === 0 ? (
                        <span className="text-emerald-600 text-[10px] font-black bg-emerald-50 px-2 py-0.5 rounded leading-none border border-emerald-100">
                          无差异
                        </span>
                      ) : (
                        <span className="text-rose-600 font-mono font-black text-[10px] bg-rose-50 px-1.8 py-0.5 rounded border border-rose-100">
                          ¥{(diffCents / 100).toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* status */}
                    <td className="p-3 text-center select-none">
                      <span className={`px-2 py-0.5 rounded text-[9.2px] font-black border ${statusClassName}`}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* actions */}
                    <td className="p-3 text-right select-none space-x-2.5 whitespace-nowrap pr-5 font-bold">
                      <button 
                        onClick={() => {
                          setActiveBillIdForDrawer(b.id);
                          setIsDrawerOpen(true);
                        }}
                        className="text-[#006591] hover:text-[#004c6e] hover:underline cursor-pointer"
                      >
                        核查对账
                      </button>

                      {outstanding > 0 && b.status !== "draft" && (
                        <button 
                          onClick={() => openPayModal(b)}
                          className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                        >
                          快捷付款
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={19} className="p-12 text-center text-slate-400 select-none">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-500">无法检索到契合过滤条件的供应商账套记录</p>
                      <p className="text-[10px] text-slate-350">您可以选择其他的月份，或者导入全新的申报账单及到货包自动建账</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Static Pagination footer */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex items-center justify-between select-none text-xs text-slate-500">
          <span>
            当前展示 <strong className="text-slate-800 font-mono">{filteredBatches.length}</strong> 笔，共 <strong className="text-slate-800 font-mono">{totalPages}</strong> 页
          </span>
          <div className="flex items-center space-x-1 font-bold animate-none">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-650 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              上页
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7.5 h-7.5 rounded-lg border text-center font-mono ${
                  currentPage === idx + 1 
                    ? "bg-sky-600 border-sky-600 text-white font-black" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-650 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              下页
            </button>
          </div>
        </div>

      </div>

      {/* Slide-over Detail Drawer Component (The five sheets logic) */}
      <SupplierBillDrawer 
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); fetchData(); }}
        bill={activeBillForDrawer}
        onUpdateBill={() => fetchData()}
        onToast={showToast}
      />

      {/* A. Quick Payment Register Modal */}
      <AnimatePresence>
        {showPayModal && (
          <>
            <div onClick={() => setShowPayModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[130]" />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-[140] p-6 text-slate-700 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>快捷付款记账登记</span>
                </h3>
                <button 
                  onClick={() => setShowPayModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePayModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">付款清算日期</label>
                  <input 
                    type="date"
                    required
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-slate-350"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">划付出账金额 (¥ 元)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="输入记账实付账金"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-mono focus:outline-none focus:border-slate-350"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">付款核销渠道 (借方)</label>
                  <select 
                    value={payAccount}
                    onChange={e => setPayAccount(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="招商银行 (对公往来端 9120)">招商银行 (对公往来端 9120)</option>
                    <option value="建设银行 (乐娜对公 8813)">建设银行 (乐娜对公 8813)</option>
                    <option value="浦发银行 (出纳自持 6025)">浦发银行 (出纳自持 6025)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">收款方开户行卡号/说明</label>
                  <input 
                    type="text"
                    placeholder="选填付款水单号"
                    value={payReceiverAccount}
                    onChange={e => setPayReceiverAccount(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">付款流水备注</label>
                  <input 
                    type="text"
                    placeholder="一期大货清算电汇流水等"
                    value={payRemark}
                    onChange={e => setPayRemark(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 text-xs font-bold border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2.2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-3xs cursor-pointer flex items-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>确认记账并划扣</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* B. Dynamic Excel Import Supplier Bill Modal (Full Drag Drop Drag Active Support) */}
      <AnimatePresence>
        {showBillImportModal && (
          <>
            <div onClick={() => { setShowBillImportModal(false); setUploadedFile(null); }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[130]" />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-[140] p-6 text-slate-700 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>导入供应商大货申报结算 Excel 账单</span>
                </h3>
                <button 
                  onClick={() => { setShowBillImportModal(false); setUploadedFile(null); }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={triggerBillImportSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">1. 目标核算结算期批次</label>
                  <select
                    value={selectedBatchForUpload}
                    onChange={e => setSelectedBatchForUpload(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.month} 期 - {b.supplier_name} ({b.bill_no})</option>
                    ))}
                  </select>
                </div>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    dragActive ? "border-sky-500 bg-sky-50/25" : "border-slate-200 hover:border-slate-350 bg-[#f8f9fd]/50"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2 select-none">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    {uploadedFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-950">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">文件大小：{(uploadedFile.size / 1024).toFixed(1)} KB (点击下面按钮解析对仗)</p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-450">
                        <p className="font-bold text-slate-800">将供应商导出的申报 Excel 账套大表拖曳或点击此处上传</p>
                        <p className="text-[10px] text-slate-400 mt-1">支持标准 XLS, XLSX, CSV 供应商申报账套模板</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    onChange={e => e.target.files && setUploadedFile(e.target.files[0])}
                    className="hidden" 
                    id="excel-bill-input-field" 
                  />
                  <label 
                    htmlFor="excel-bill-input-field"
                    className="inline-block mt-4 px-3.5 py-1.8 border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer text-[10.5px] font-bold select-none shadow-3xs"
                  >
                    挑选文件
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl select-none">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    工作台智能解析说明：系统会自动拆解 Excel 中多子项“款号”、“申报单价”、“申报数量”，并自动与系统聚水潭入库记录进行二方对碰。
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-1 text-xs font-bold">
                  <button 
                    type="button"
                    onClick={() => { setShowBillImportModal(false); setUploadedFile(null); }}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2.2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>解析此大表</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* C. Dynamic Import Inbound Data Modal (Full Drag Drop Drag Active Support) */}
      <AnimatePresence>
        {showInboundImportModal && (
          <>
            <div onClick={() => { setShowInboundImportModal(false); setUploadedFile(null); }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[130]" />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-[140] p-6 text-slate-700 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>导入聚水潭/仓库采购入库及大货到地实数数据</span>
                </h3>
                <button 
                  onClick={() => { setShowInboundImportModal(false); setUploadedFile(null); }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={triggerInboundImportSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">1. 目标核对结算期批次</label>
                  <select
                    value={selectedBatchForUpload}
                    onChange={e => setSelectedBatchForUpload(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.month} 期 - {b.supplier_name} ({b.bill_no})</option>
                    ))}
                  </select>
                </div>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    dragActive ? "border-sky-500 bg-sky-50/25" : "border-slate-200 hover:border-slate-350 bg-[#f8f9fd]/50"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2 select-none">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    {uploadedFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-950">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-450 mt-1">文件就绪：{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-450 mt-1">
                        <p className="font-bold text-slate-800">将仓库出入退记录/聚水潭导出的标准到货 Excel 拖曳到此处</p>
                        <p className="text-[10px] text-slate-400 mt-1">支持以 XLS, XLSX 归并的出库实到清单</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    onChange={e => e.target.files && setUploadedFile(e.target.files[0])}
                    className="hidden" 
                    id="excel-inbound-input-field" 
                  />
                  <label 
                    htmlFor="excel-inbound-input-field"
                    className="inline-block mt-4 px-3.5 py-1.8 border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer text-[10.5px] font-bold select-none shadow-3xs"
                  >
                    选择仓库到货 Excel
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl select-none">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    自动对碰公式说明：导入仓库到货实到数量后，对应款号与SKU将触发自动合算。不涉及任何审批流。
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-1 text-xs font-bold">
                  <button 
                    type="button"
                    onClick={() => { setShowInboundImportModal(false); setUploadedFile(null); }}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2.2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>挂接聚水潭到货</span>
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
