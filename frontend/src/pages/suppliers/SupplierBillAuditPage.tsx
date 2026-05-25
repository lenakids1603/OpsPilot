/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from "react";
import { 
  Building2, Plus, FileSpreadsheet, Download, RefreshCw, AlertCircle,
  Search, Filter, Landmark, Sparkles, Check, X, FileText, Wallet, AlertTriangle, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SupplierBill, BillPayment } from "./types";
import { INITIAL_SUPPLIER_BILLS } from "./mockData";
import SupplierBillDrawer from "./components/SupplierBillDrawer";

export default function SupplierBillAuditPage() {
  const [bills, setBills] = useState<SupplierBill[]>(INITIAL_SUPPLIER_BILLS);
  
  // Filtering states
  const [selectedMonth, setSelectedMonth] = useState("全部");
  const [selectedSupplier, setSelectedSupplier] = useState("全部");
  const [selectedAuditStatus, setSelectedAuditStatus] = useState("全部");
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Interaction Modals / Drawers states
  const [activeBillIdForDrawer, setActiveBillIdForDrawer] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Quick Payment Modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [payModalBillId, setPayModalBillId] = useState<string | null>(null);
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payAmount, setPayAmount] = useState("");
  const [payAccount, setPayAccount] = useState("招商银行 (对公往来端 9120)");
  const [payRemark, setPayRemark] = useState("");

  // Simulated Import Modals
  const [showBillImportModal, setShowBillImportModal] = useState(false);
  const [showInboundImportModal, setShowInboundImportModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // List of unique suppliers from mockData
  const suppliersDropdownList = useMemo(() => {
    const list = new Set<string>();
    bills.forEach(b => list.add(b.supplierName));
    return Array.from(list);
  }, [bills]);

  // Handle direct "标记已确认" click
  const handleMarkConfirmed = (billId: string) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        return {
          ...bill,
          auditStatus: "已确认"
        };
      }
      return bill;
    }));
    showToast(`🟢 账单 ${billId} 已快速标记为 [已确认] 状态`);
  };

  // Handles updating the bill inside the detail drawer recursively 
  const handleUpdateBillInPage = (updatedBill: SupplierBill) => {
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
  };

  // Filtering Logic
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // 1. Month Filter
      if (selectedMonth !== "全部" && bill.period !== selectedMonth) return false;

      // 2. Supplier Filter
      if (selectedSupplier !== "全部" && bill.supplierName !== selectedSupplier) return false;

      // 3. Reconcile Audit Status Filter
      if (selectedAuditStatus !== "全部" && bill.auditStatus !== selectedAuditStatus) return false;

      // 4. Invoice Status Filter
      if (selectedInvoiceStatus !== "全部" && bill.invoiceStatus !== selectedInvoiceStatus) return false;

      // 5. Text Search (采购单号 / 款号 / SKU / 供应商)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchSupplierName = bill.supplierName.toLowerCase().includes(query);
        const matchBillID = bill.id.toLowerCase().includes(query);
        const matchSkuDetails = bill.skus.some(sku => 
          sku.poNo.toLowerCase().includes(query) ||
          sku.styleNo.toLowerCase().includes(query) ||
          sku.skuInfo.toLowerCase().includes(query) ||
          sku.name.toLowerCase().includes(query)
        );
        if (!matchSupplierName && !matchBillID && !matchSkuDetails) return false;
      }

      return true;
    });
  }, [bills, selectedMonth, selectedSupplier, selectedAuditStatus, selectedInvoiceStatus, searchQuery]);

  // Overall Data sums based on Filtered data list
  const metrics = useMemo(() => {
    let billTotal = 0;
    let inboundTotal = 0;
    let diffTotal = 0;
    let confirmedTotal = 0;
    let paidTotal = 0;
    let remainingTotal = 0;

    filteredBills.forEach(b => {
      billTotal += b.supplierAmt;
      inboundTotal += b.systemAmt;
      diffTotal += Math.abs(b.diffAmt);
      if (b.auditStatus === "已确认" || b.auditStatus === "已结清") {
        confirmedTotal += b.finalAmt;
      }
      paidTotal += b.paidAmt;
      remainingTotal += b.remainingAmt;
    });

    return {
      billTotal,
      inboundTotal,
      diffTotal,
      confirmedTotal,
      paidTotal,
      remainingTotal
    };
  }, [filteredBills]);

  // Pagination Logic
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBills.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBills, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / itemsPerPage));

  // Trigger Simple Register Payment Dialog
  const openPayModal = (billId: string) => {
    const targetBill = bills.find(b => b.id === billId);
    if (targetBill) {
      setPayModalBillId(billId);
      setPayAmount(targetBill.remainingAmt.toString());
      setPayRemark("");
      setShowPayModal(true);
    }
  };

  const handlePayModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("⚠️ 请输入有效的付款金额");
      return;
    }

    if (!payModalBillId) return;

    setBills(prev => prev.map(bill => {
      if (bill.id === payModalBillId) {
        const nextPaid = bill.paidAmt + amount;
        const nextRemaining = Math.max(0, bill.finalAmt - nextPaid);
        const nextStatus = nextRemaining === 0 ? "已结清" : bill.auditStatus;

        const newPayment: BillPayment = {
          id: `PAY-${Date.now().toString().slice(-6)}`,
          date: payDate,
          entity: "杭州乐娜童衣有限公司",
          account: payAccount,
          supplier: bill.supplierName,
          amount: amount,
          type: "货款",
          relatedBill: bill.id,
          voucher: `V_TRANSFER_POP-${bill.id}.pdf`,
          operator: "陈财务",
          remark: payRemark || "通过工作台列表直汇"
        };

        return {
          ...bill,
          paidAmt: nextPaid,
          remainingAmt: nextRemaining,
          auditStatus: nextStatus as any,
          payments: [newPayment, ...bill.payments]
        };
      }
      return bill;
    }));

    setShowPayModal(false);
    showToast(`🟢 登记付款成功！已对账扣缴，自动计算剩余欠款项`);
  };

  // Handles simulated Excel drag uploads
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

  const triggerBillImportSim = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBillImportModal(false);
    setUploadedFile(null);
    showToast("🎉 成功模拟导入 18 笔供应商大货申报账单！系统已接入待核对池。");
  };

  const triggerInboundImportSim = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInboundImportModal(false);
    setUploadedFile(null);
    showToast("🎉 聚水潭采购入库、销退款明细数据实时导入成功！已完成二方数据对碰比对。");
  };

  const handleExportReconciliation = () => {
    showToast("📊 报表打包中：已下载本期供应商账单核对、最终合意已付欠款对账总大表 (XLSX, 印发版)。");
  };

  const activeBillForDrawer = bills.find(b => b.id === activeBillIdForDrawer) || null;

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

      {/* 一、页面顶部 Block */}
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
                核对供应商账单、入库金额、付款记录与剩余欠款
              </p>
            </div>
          </div>
        </div>

        {/* 3 Upper-Right Core buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-bold font-sans">
          <button 
            onClick={() => setShowBillImportModal(true)} 
            className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-650 bg-white rounded-xl cursor-pointer transition-colors shadow-3xs flex items-center gap-1.5 font-black"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>导入供应商账单</span>
          </button>

          <button 
            onClick={() => setShowInboundImportModal(true)}
            className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-650 bg-white rounded-xl cursor-pointer transition-colors shadow-3xs flex items-center gap-1.5 font-black"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>导入入库数据</span>
          </button>

          <button 
            onClick={handleExportReconciliation}
            className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-650 bg-white rounded-xl cursor-pointer transition-colors shadow-3xs flex items-center gap-1.5 font-black"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>导出当前表格</span>
          </button>
        </div>
      </div>

      {/* 二、筛选区 Filter Row (Simple, compact) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs select-none">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* 1. Month selection */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">结算月份</label>
            <select 
              value={selectedMonth}
              onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 text-slate-700 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold leading-normal focus:outline-none"
            >
              <option value="全部">全部月份</option>
              <option value="2026-05">2026-05 (最新期)</option>
              <option value="2026-04">2026-04 (往期)</option>
            </select>
          </div>

          {/* 2. Supplier dropdown */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">供应商</label>
            <select 
              value={selectedSupplier}
              onChange={e => { setSelectedSupplier(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 text-slate-700 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold leading-normal focus:outline-none col-span-1"
            >
              <option value="全部">全部核心供应商</option>
              {suppliersDropdownList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 3. Reconcile Audit Status */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">核对状态</label>
            <select 
              value={selectedAuditStatus}
              onChange={e => { setSelectedAuditStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 text-slate-700 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold leading-normal focus:outline-none"
            >
              <option value="全部">全部核对状态</option>
              <option value="待核对">待核对 (灰)</option>
              <option value="有差异">有差异 (橙)</option>
              <option value="已确认">已确认 (绿)</option>
              <option value="已结清">已结清 (深绿)</option>
            </select>
          </div>

          {/* 4. Invoice status */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">开票状态</label>
            <select 
              value={selectedInvoiceStatus}
              onChange={e => { setSelectedInvoiceStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#f8f9fc] hover:bg-slate-100/60 text-slate-700 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold leading-normal focus:outline-none"
            >
              <option value="全部">全部开票状态</option>
              <option value="未开票">未开票</option>
              <option value="已开票">已开票</option>
            </select>
          </div>

          {/* 5. Inbound text search */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">检索单号或款号/SKU</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="搜索单号 / 款号 / SKU..."
                className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl py-1.8 pl-8.5 pr-3 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 三、数据汇总卡片 Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 select-none">
        {[
          { label: "本月账单总额", value: metrics.billTotal, style: "slate", icon: <FileSpreadsheet className="w-4 h-4 text-blue-500" /> },
          { label: "系统入库应付款", value: metrics.inboundTotal, style: "slate", icon: <Landmark className="w-4 h-4 text-indigo-500" /> },
          { 
            label: "账目比对差异", 
            value: metrics.diffTotal, 
            style: metrics.diffTotal > 0 ? "warn" : "green", 
            icon: <AlertTriangle className={`w-4 h-4 ${metrics.diffTotal > 0 ? "text-amber-500" : "text-emerald-500"}`} /> 
          },
          { label: "已确认应付", value: metrics.confirmedTotal, style: "green", icon: <Check className="w-4 h-4 text-emerald-500" /> },
          { label: "已付款金额", value: metrics.paidTotal, style: "teal", icon: <Wallet className="w-4 h-4 text-teal-500" /> },
          { label: "剩余欠款总计", value: metrics.remainingTotal, style: "rose", icon: <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" /> }
        ].map((card, idx) => {
          const isWarn = card.style === "warn" && card.value > 0;
          const isRose = card.style === "rose";
          const isGreen = card.style === "green";
          const isTeal = card.style === "teal";
          
          return (
            <div 
              key={idx}
              className={`bg-white border hover:border-slate-300 rounded-2xl p-4.5 shadow-3xs hover:shadow-2xs transition-all space-y-1.5 relative overflow-hidden ${
                isRose ? "ring-1 ring-rose-50/50 bg-[#fffbfa]/70 border-rose-100" : 
                isWarn ? "ring-1 ring-amber-50/50 bg-[#fffdf9] border-amber-100" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">
                <span>{card.label}</span>
                {card.icon}
              </div>
              <div className="flex items-baseline space-x-0.2 select-text pt-1">
                <span className="text-xs text-slate-400 font-bold font-mono">¥</span>
                <span className={`text-[17px] font-black font-mono tracking-tight leading-none ${
                  isRose ? "text-rose-600 font-extrabold" : 
                  isWarn ? "text-amber-600 font-black animate-pulse" : 
                  isGreen ? "text-emerald-600" :
                  isTeal ? "text-teal-600" : "text-slate-900"
                }`}>
                  {card.value.toLocaleString()}
                </span>
              </div>
              <div className="text-[9px] font-bold text-slate-400 leading-none pt-0.5">
                {isRose && card.value > 0 ? (
                  <span className="text-rose-600 bg-rose-50/50 px-1 py-0.2 rounded">有未结供应商账目</span>
                ) : isWarn ? (
                  <span className="text-amber-600 bg-amber-50 px-1 py-0.2 rounded">存在偏位差异待财务确认</span>
                ) : (
                  <span className="text-slate-400">实时对碰汇缴统计</span>
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
              当前对账单清单已过滤: <strong className="text-slate-800 font-mono text-sm">{filteredBills.length}</strong> / {bills.length} 行记录
            </span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-sky-50 text-sky-800 rounded font-black text-[9.5px]">
                检索关键: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
          <div className="text-slate-400 text-[10.5px] font-medium">
            财务一人操作面板 · 所有账目及打款明细自动核销折旧，不涉及流程审批
          </div>
        </div>

        {/* Dynamic Spreadsheet View */}
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9fd] text-slate-400 font-extrabold uppercase text-[9px] border-b border-slate-200/80 select-none">
              <tr>
                <th className="p-4 pl-6 text-center w-12">核对期</th>
                <th className="p-4">账单月份</th>
                <th className="p-4">核心供应商</th>
                <th className="p-4">结算方式</th>
                <th className="p-4 text-right">账单申报金额</th>
                <th className="p-4 text-right">系统人入库额</th>
                <th className="p-4 text-right">契约双向差异扣款</th>
                <th className="p-4 text-right">财务确认应付额</th>
                <th className="p-4 text-right text-teal-600">已付款金额</th>
                <th className="p-4 text-right text-rose-600">剩余应付欠款</th>
                <th className="p-4 text-center">发票开具</th>
                <th className="p-4 text-center">核对状态</th>
                <th className="p-4">财务经办</th>
                <th className="p-4 text-right pr-6">操作工作台</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {paginatedBills.map(b => {
                const diff = b.diffAmt;
                const outstanding = b.remainingAmt;

                // Color mappings for requested states: 待核对 (gray), 有差异 (orange), 已确认 (green), 已结清 (dark green)
                let statusClassName = "bg-slate-100 text-slate-500 border-slate-200";
                if (b.auditStatus === "有差异") {
                  statusClassName = "bg-amber-50 text-amber-600 border-amber-200";
                } else if (b.auditStatus === "已确认") {
                  statusClassName = "bg-emerald-50 text-emerald-600 border-emerald-200";
                } else if (b.auditStatus === "已结清") {
                  statusClassName = "bg-teal-50 text-teal-800 border-teal-200";
                }

                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Tiny visual state dot indicator */}
                    <td className="p-4 pl-6 text-center select-none">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        b.auditStatus === "有差异" ? "bg-amber-500" :
                        b.auditStatus === "已确认" ? "bg-emerald-500" :
                        b.auditStatus === "已结清" ? "bg-teal-600" : "bg-slate-400"
                      }`} />
                    </td>

                    {/* Period Month */}
                    <td className="p-4 font-mono text-slate-500">
                      {b.period}
                    </td>

                    {/* Supplier */}
                    <td className="p-4 font-black text-slate-900 text-[11.5px]">
                      {b.supplierName}
                    </td>

                    {/* Settlement mode */}
                    <td className="p-4 text-slate-500">
                      {b.settlementMode}
                    </td>

                    {/* Supplier Bill amount */}
                    <td className="p-4 text-right font-mono">
                      ¥{b.supplierAmt.toLocaleString()}
                    </td>

                    {/* System inbound cost */}
                    <td className="p-4 text-right font-mono text-slate-600">
                      ¥{b.systemAmt.toLocaleString()}
                    </td>

                    {/* Diff amount badge */}
                    <td className="p-4 text-right">
                      {diff === 0 ? (
                        <span className="text-emerald-600 text-[10px] font-black bg-emerald-50 px-2 py-0.5 rounded leading-none">
                          无差异
                        </span>
                      ) : (
                        <span className="text-amber-600 font-mono font-black text-[10px] bg-amber-50 px-1.8 py-0.5 rounded">
                          差 ¥{diff.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Final confirmed payable */}
                    <td className="p-4 text-right font-mono font-bold text-slate-900">
                      ¥{b.finalAmt.toLocaleString()}
                    </td>

                    {/* Paid ledger amount */}
                    <td className="p-4 text-right font-mono text-teal-600">
                      ¥{b.paidAmt.toLocaleString()}
                    </td>

                    {/* Remaining unpaid debt */}
                    <td className="p-4 text-right font-mono text-rose-600 font-black bg-rose-50/5">
                      ¥{outstanding.toLocaleString()}
                    </td>

                    {/* Invoice status badge */}
                    <td className="p-4 text-center select-none">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                        b.invoiceStatus === "已开票" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}>
                        {b.invoiceStatus}
                      </span>
                    </td>

                    {/* Reconcile Audit Status (Requested labels) */}
                    <td className="p-4 text-center select-none">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${statusClassName}`}>
                        {b.auditStatus === "未核对" ? "待核对" : b.auditStatus === "已付款" ? "已结清" : b.auditStatus}
                      </span>
                    </td>

                    {/* In-office handler clerk */}
                    <td className="p-4 text-slate-400 font-normal">
                      {b.owner}
                    </td>

                    {/* Work Actions columns */}
                    <td className="p-4 text-right select-none space-x-2.5 whitespace-nowrap pr-6 font-bold">
                      <button 
                        onClick={() => {
                          setActiveBillIdForDrawer(b.id);
                          setIsDrawerOpen(true);
                        }}
                        className="text-[#006591] hover:text-[#004c6e] hover:underline cursor-pointer"
                      >
                        查看明细
                      </button>

                      {b.auditStatus !== "已确认" && b.auditStatus !== "已结清" && (
                        <button 
                          onClick={() => handleMarkConfirmed(b.id)}
                          className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                        >
                          标记已确认
                        </button>
                      )}

                      {outstanding > 0 && (
                        <button 
                          onClick={() => openPayModal(b.id)}
                          className="text-amber-600 hover:text-amber-800 hover:underline cursor-pointer"
                        >
                          登记付款
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={14} className="p-12 text-center text-slate-400 select-none">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-500">无法检索到契合过滤条件的供应商账套记录</p>
                      <p className="text-[10px] text-slate-350">您可以尝试重置上方检索条件或重新上传 Excel 大单</p>
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
            当前展示 <strong className="text-slate-800 font-mono">{filteredBills.length}</strong> 笔记录，共 <strong className="text-slate-800 font-mono">{totalPages}</strong> 页
          </span>
          <div className="flex items-center space-x-1 font-bold">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              下页
            </button>
          </div>
        </div>

      </div>

      {/* Slide-over Detail Drawer Component (Three blocks logic inside) */}
      <SupplierBillDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        bill={activeBillForDrawer}
        onUpdateBill={handleUpdateBillInPage}
        onToast={showToast}
      />

      {/* A. Quick Payment Register Modal (弹窗交互为核心) */}
      <AnimatePresence>
        {showPayModal && (
          <>
            <div onClick={() => setShowPayModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[130]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed top-32 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl z-[140] p-6 text-slate-700"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-amber-500" />
                  <span>登记付款记录</span>
                </h3>
                <button 
                  onClick={() => setShowPayModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePayModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">付款日期</label>
                  <input 
                    type="date"
                    required
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">付款金额 (¥)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="输入记账实付金额额度"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">付款借记渠道账户</label>
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
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">备注信息</label>
                  <input 
                    type="text"
                    placeholder="网银转账流水号、单批抵用等说明"
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
                    className="px-4.5 py-2.2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-3xs cursor-pointer"
                  >
                    确认登记
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* B. Simulated Import Supplier Bill Modal */}
      <AnimatePresence>
        {showBillImportModal && (
          <>
            <div onClick={() => { setShowBillImportModal(false); setUploadedFile(null); }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[130]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-2xl z-[140] p-6 text-slate-700"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>导入供应商大货申报 Excel 账单</span>
                </h3>
                <button 
                  onClick={() => { setShowBillImportModal(false); setUploadedFile(null); }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={triggerBillImportSim} className="space-y-4">
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
                        <p className="text-[10px] text-slate-400 mt-1">文件大小：{(uploadedFile.size / 1024).toFixed(1)} KB (随时准备解析)</p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-450">
                        <p className="font-bold text-slate-800">将供应商导出的 Excel 对账结算大表拖曳或点击此处上传</p>
                        <p className="text-[10px] text-slate-400 mt-1">支持以 XLS, XLSX, CSV 载体结算模板大表</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    onChange={e => e.target.files && setUploadedFile(e.target.files[0])}
                    className="hidden" 
                    id="excel-input-field" 
                  />
                  <label 
                    htmlFor="excel-input-field"
                    className="inline-block mt-4 px-3.5 py-1.8 border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer text-[10.5px] font-bold select-none shadow-3xs"
                  >
                    选择本地账单表格
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl select-none">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    工作台智能解析说明：发载对触模块会自动识别大表中“供应商名称”、“款号单价”并自动拉取。
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-1 text-xs font-bold font-sans">
                  <button 
                    type="button"
                    onClick={() => { setShowBillImportModal(false); setUploadedFile(null); }}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2.2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs cursor-pointer"
                  >
                    模拟一键解析
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* C. Simulated Import Inbound Data Modal */}
      <AnimatePresence>
        {showInboundImportModal && (
          <>
            <div onClick={() => { setShowInboundImportModal(false); setUploadedFile(null); }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[130]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-2xl z-[140] p-6 text-slate-700"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 select-none">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>导入聚水潭/仓库采购入库及退货对账数据</span>
                </h3>
                <button 
                  onClick={() => { setShowInboundImportModal(false); setUploadedFile(null); }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={triggerInboundImportSim} className="space-y-4">
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
                        <p className="text-[10px] text-slate-450 mt-1">文件准备：{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-450 mt-1">
                        <p className="font-bold text-slate-800">将仓库出入退记录/聚水潭导出的标准接口包拖曳到这里</p>
                        <p className="text-[10px] text-slate-400 mt-1">支持以 XLS, JSON, XML 格式导出数据归底</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    onChange={e => e.target.files && setUploadedFile(e.target.files[0])}
                    className="hidden" 
                    id="inbound-input-field" 
                  />
                  <label 
                    htmlFor="inbound-input-field"
                    className="inline-block mt-4 px-3.5 py-1.8 border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 rounded-lg cursor-pointer text-[10.5px] font-bold select-none shadow-3xs"
                  >
                    选择仓库数据对碰
                  </label>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl select-none">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    自动核销备注：系统将自动按采购单号/衣服款号/SKU进行双向折旧对碰差，不需要繁琐的多级审核。
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-1 text-xs font-bold font-sans">
                  <button 
                    type="button"
                    onClick={() => { setShowInboundImportModal(false); setUploadedFile(null); }}
                    className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2.2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs cursor-pointer"
                  >
                    对碰聚水潭数据
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
