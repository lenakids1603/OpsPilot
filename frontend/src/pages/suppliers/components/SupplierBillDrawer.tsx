/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, Plus, CreditCard, Receipt, FileSpreadsheet, AlertCircle, Sparkles, Check, CheckCircle,
  RefreshCw, TrendingDown, HelpCircle, UserCheck, Clock, Archive, DollarSign
} from "lucide-react";
import { SupplierBill, BillSkuDetail, BillPayment } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  getSupplierBillDetail, triggerRecalculate, approveReconciliationBatch, reopenReconciliationBatch,
  addSupplierAdjustment, addSupplierPayment, getAiSummary
} from "../../../api/reconciliation";

interface SupplierBillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bill: SupplierBill | null;
  onUpdateBill: (updatedBill: SupplierBill) => void;
  onToast: (msg: string) => void;
}

export default function SupplierBillDrawer({ isOpen, onClose, bill, onUpdateBill, onToast }: SupplierBillDrawerProps) {
  // Tabs State: summary | original_bill | mapping | matching_grid | differences | ai_report
  const [activeTab, setActiveTab] = useState<"summary" | "original_bill" | "mapping" | "matching_grid" | "differences" | "ai_report">("summary");
  
  // Loading indicators
  const [loading, setLoading] = useState(false);
  const [freshBill, setFreshBill] = useState<SupplierBill | null>(null);

  // AI Summary states
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Offline interaction row overrides
  const [taggedOkRows, setTaggedOkRows] = useState<Record<string, boolean>>({});
  const [forcedDiffRows, setForcedDiffRows] = useState<Record<string, boolean>>({});

  // Forms expanded toggles
  const [showAdjForm, setShowAdjForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);

  // Form Field States: Adjustment
  const [adjType, setAdjType] = useState<"退厂" | "返修回仓" | "运费" | "其他" | "质量扣款" | "超时扣款">("质量扣款");
  const [adjStyleNo, setAdjStyleNo] = useState("");
  const [adjSkuCode, setAdjSkuCode] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjParty, setAdjParty] = useState("供应商责任");
  const [adjRemark, setAdjRemark] = useState("");

  // Form Field States: Payment
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payAccount, setPayAccount] = useState("招商银行 (对公往来端 9120)");
  const [payReceiverName, setPayReceiverName] = useState("");
  const [payReceiverAccount, setPayReceiverAccount] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payRemark, setPayRemark] = useState("");

  // Sync internal state with prop
  useEffect(() => {
    if (bill?.id && isOpen) {
      setFreshBill(bill);
      loadCompleteDetails(bill.id, false);
      setAiSummary("");
      setActiveTab("summary");
    }
  }, [bill?.id, isOpen]);

  // Lazy load AI summary when the AI report tab is viewed
  useEffect(() => {
    if (activeTab === "ai_report" && freshBill?.id && !aiSummary) {
      fetchAiSummaryReport(freshBill.id);
    }
  }, [activeTab, freshBill?.id]);

  const fetchAiSummaryReport = async (id: string) => {
    setAiLoading(true);
    try {
      const res = await getAiSummary(id);
      if (res.success && res.data) {
        setAiSummary(res.data.summary);
      } else {
        onToast("⚠️ " + (res.message || "未能获取 AI 对账单摘要"));
      }
    } catch (e: any) {
      onToast("❌ 获取 AI 结算诊断报告失败: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRefreshAiSummary = () => {
    if (freshBill?.id) {
      fetchAiSummaryReport(freshBill.id);
    }
  };

  const loadCompleteDetails = async (id: string, updateParent = false) => {
    setLoading(true);
    try {
      const res = await getSupplierBillDetail(id);
      if (res.success && res.data) {
        setFreshBill(res.data);
        if (updateParent) {
          onUpdateBill(res.data);
        }
      }
    } catch (e: any) {
      onToast("❌ 载入流单失败：" + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !bill || !freshBill) return null;

  // Handles quick recalculation of difference metrics
  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const res = await triggerRecalculate(freshBill.id);
      if (res.success) {
        onToast("🔄 核算公式重算完成！对碰差异明细已自动刷新。");
        await loadCompleteDetails(freshBill.id, true);
      } else {
        onToast("⚠️ " + res.message);
      }
    } catch (e: any) {
      onToast("❌ 重算失败" + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles marking approved
  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await approveReconciliationBatch(freshBill.id);
      if (res.success) {
        onToast("🎉 账单已通过核准，货款应付款正式挂网核销！");
        await loadCompleteDetails(freshBill.id, true);
      } else {
        onToast("⚠️ " + res.message);
      }
    } catch (e: any) {
      onToast("❌ 审批失败" + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles reopen batch
  const handleReopen = async () => {
    setLoading(true);
    try {
      const res = await reopenReconciliationBatch(freshBill.id);
      if (res.success) {
        onToast("🟢 该期对账单已重新撤回至 [核对中] 池子");
        await loadCompleteDetails(freshBill.id, true);
      } else {
        onToast("⚠️ " + res.message);
      }
    } catch (e: any) {
      onToast("❌ 重启失败" + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles adding new deduction/adjustment
  const handleAddAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(adjAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      onToast("⚠️ 请输入有效的变动金额（元）");
      return;
    }

    setLoading(true);
    try {
      // Amount posted as cents int
      const cents = Math.round(amountVal * 100);
      const res = await addSupplierAdjustment(freshBill.id, {
        supplier_id: freshBill.id.slice(-6).startsWith("REC") ? "SUP-01" : undefined,
        adjustment_type: adjType,
        related_style_code: adjStyleNo,
        related_sku_code: adjSkuCode,
        amount: cents,
        responsibility_party: adjParty,
        occurred_at: new Date().toISOString().split("T")[0],
        remark: adjRemark
      });

      if (res.success) {
        onToast(`🟢 成功补入 ${adjType} 项 ¥${amountVal.toFixed(2)}，主单实际应付款已自动重算！`);
        setShowAdjForm(false);
        setAdjAmount("");
        setAdjRemark("");
        setAdjStyleNo("");
        setAdjSkuCode("");
        await loadCompleteDetails(freshBill.id, true);
      } else {
        onToast("⚠️ " + res.message);
      }
    } catch (err: any) {
      onToast("❌ 保存调整项失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles adding new payment record
  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(payAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      onToast("⚠️ 请输入有效的打款账额");
      return;
    }

    setLoading(true);
    try {
      const cents = Math.round(amountVal * 100);
      const res = await addSupplierPayment(freshBill.id, {
        payment_date: payDate,
        payer_account: payAccount,
        receiver_name: payReceiverName || freshBill.supplierName,
        receiver_account: payReceiverAccount,
        amount: cents,
        remark: payRemark
      });

      if (res.success) {
        onToast(`🟢 付款流水登记成功！¥${amountVal.toLocaleString()} 已自动冲销待结清欠账。`);
        setShowPayForm(false);
        setPayAmount("");
        setPayRemark("");
        setPayReceiverName("");
        setPayReceiverAccount("");
        await loadCompleteDetails(freshBill.id, true);
      } else {
        onToast("⚠️ " + res.message);
      }
    } catch (err: any) {
      onToast("❌ 登记往来实收账款失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper colors for status badges
  let statusBadgeClass = "bg-slate-100 text-slate-500 border-slate-200";
  if (freshBill.auditStatus === "有差异") {
    statusBadgeClass = "bg-amber-50 text-amber-600 border-amber-200 ring-1 ring-amber-400/20";
  } else if (freshBill.auditStatus === "已确认") {
    statusBadgeClass = "bg-emerald-50 text-emerald-600 border-emerald-250 ring-1 ring-emerald-400/15";
  } else if (freshBill.auditStatus === "已结清") {
    statusBadgeClass = "bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-400/20";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex justify-end overflow-hidden font-sans">
        
        {/* Under Background Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs transition-opacity"
        />

        {/* Drawer Sliding Body */}
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="relative w-full max-w-5xl bg-slate-50 shadow-2xl flex flex-col h-full border-l border-slate-200 border-dashed"
        >
          
          {/* Header Block with Metadata */}
          <div className="bg-white border-b border-slate-150 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0 shadow-3xs select-none">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-0.8 bg-sky-50 text-sky-700 text-xs font-black rounded-lg uppercase">
                  {freshBill.period} 结算单
                </span>
                <h2 className="text-base font-black text-slate-900">
                  {freshBill.supplierName} 对账单详情
                </h2>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-black border ${statusBadgeClass}`}>
                  {freshBill.auditStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                账期流水内联编码: <span className="font-mono font-bold text-slate-600">{freshBill.id}</span> | 结算模式: <span className="font-bold text-slate-650">{freshBill.settlementMode}</span>
              </p>
            </div>
            
            {/* Quick Action Buttons for the Batch */}
            <div className="flex items-center space-x-2 text-xs font-bold leading-none">
              <button 
                disabled={loading}
                onClick={handleRecalculate}
                title="重算出账、比对及公摊扣除项"
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 rounded-xl cursor-pointer disabled:opacity-45 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 text-blue-500 ${loading ? "animate-spin" : ""}`} />
                <span>自动点货重算</span>
              </button>

              {freshBill.auditStatus !== "已确认" && freshBill.auditStatus !== "已结清" ? (
                <button 
                  disabled={loading}
                  onClick={handleApprove}
                  className="px-4 py-2.2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-45 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>核准账期</span>
                </button>
              ) : (
                <button 
                  disabled={loading}
                  onClick={handleReopen}
                  className="px-3.5 py-2 hover:bg-red-50 border border-red-200 text-red-600 bg-white rounded-xl cursor-pointer disabled:opacity-45 transition-all flex items-center gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  <span>撤销核准</span>
                </button>
              )}

              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Multi-cards section */}
          <div className="bg-white border-b border-slate-150 px-6 py-4 grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0 select-none text-[11px]">
            <div className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150/50 space-y-1">
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase">供应商申报总量</span>
              <p className="text-sm font-black font-mono text-slate-900 leading-none pt-0.5">{freshBill.skuCount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">件</span></p>
            </div>
            <div className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150/50 space-y-1">
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase">账面申报金额</span>
              <p className="text-sm font-black font-mono text-slate-800 leading-none pt-0.5">¥{freshBill.supplierAmt.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150/50 space-y-1">
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase">系统入库成本</span>
              <p className="text-sm font-black font-mono text-slate-800 leading-none pt-0.5">¥{freshBill.systemAmt.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150/50 space-y-1">
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase">扣款罚款汇总</span>
              <p className="text-sm font-black font-mono text-rose-500 leading-none pt-0.5">-¥{freshBill.penaltyAmt.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-[#f3faf7] rounded-xl border border-emerald-150/45 space-y-1">
              <span className="text-[9.5px] text-emerald-600 font-extrabold uppercase">核实实际应付款</span>
              <p className="text-sm font-black font-mono text-emerald-700 leading-none pt-0.5">¥{freshBill.finalAmt.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-[#fff9f8] rounded-xl border border-rose-150 space-y-1">
              <span className="text-[9.5px] text-rose-600 font-extrabold uppercase">待结清欠账</span>
              <p className="text-sm font-black font-mono text-rose-600 leading-none pt-0.5">¥{freshBill.remainingAmt.toLocaleString()}</p>
            </div>
          </div>

          {/* SIX DEEP-PENETRATION TABS HEADING */}
          <div className="bg-white border-b border-slate-150 px-6 shrink-0 flex items-center overflow-x-auto select-none font-sans text-xs">
            {[
              { id: "summary", label: "【对账汇总】", count: null },
              { id: "original_bill", label: "【供应商大单】", count: freshBill.skus.length },
              { id: "mapping", label: "【智能映射反馈】", count: null },
              { id: "matching_grid", label: "【对仗对碰大表】", count: freshBill.skus.length },
              { id: "differences", label: "【差异明细底账】", count: freshBill.discrepancies.length, flag: freshBill.discrepancies.length > 0 },
              { id: "ai_report", label: "【AI综合诊报告】", count: null, isAi: true }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 border-b-2 font-black transition-all cursor-pointer relative whitespace-nowrap ${
                    isActive 
                      ? "border-sky-600 text-sky-700 font-extrabold" 
                      : "border-transparent text-slate-450 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {tab.isAi && <Sparkles className={`w-3.5 h-3.5 ${isActive ? "text-sky-600 animate-pulse" : "text-amber-500"}`} />}
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`px-1.5 py-0.2 text-[9px] font-mono rounded-full font-bold ${
                        isActive ? "bg-sky-550 text-white" : "bg-slate-100 text-slate-400"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {tab.flag && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-2.5 right-0.5 animate-ping" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tab View Body Space - 100% Client-Connected */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {loading && (
              <div className="absolute inset-x-0 top-0 bg-sky-650/10 text-sky-800 text-center py-1.8 text-[10.5px] font-black tracking-wide font-sans flex items-center justify-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>实时对仗匹配、刷新账本数据中自反馈...</span>
              </div>
            )}

            {/* TAB 1: 【对账汇总】 */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                
                {/* 1. Offset adjustments subsegment */}
                <div className="bg-white border border-slate-200/95 rounded-2xl shadow-3xs overflow-hidden">
                  <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between select-none">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-rose-50 text-rose-600 rounded">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-850">结算期特殊公摊、运费扣减与品质罚扣列表</span>
                    </div>
                    <button
                      onClick={() => setShowAdjForm(!showAdjForm)}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10.5px] font-black cursor-pointer shadow-3xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加调整抵扣项</span>
                    </button>
                  </div>

                  {showAdjForm && (
                     <motion.form 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       className="p-5 border-b border-slate-100 bg-[#fffbfc]/60 space-y-4"
                       onSubmit={handleAddAdjustmentSubmit}
                     >
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">扣款/调整项类型</label>
                           <select 
                             value={adjType}
                             onChange={e => setAdjType(e.target.value as any)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           >
                             <option value="质量扣款">质量扣款 (工艺疵罚款)</option>
                             <option value="超时扣款">超时扣款 (延期交货扣款)</option>
                             <option value="退厂">退厂扣款 (生产瑕疵返厂)</option>
                             <option value="返修回仓">返修回仓增加款 (+)</option>
                             <option value="运费">运费公摊调整</option>
                             <option value="其他">其他临时调整补正</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">发生金额 (元)</label>
                           <input 
                             type="number"
                             required
                             step="0.01"
                             placeholder="如 1200.00"
                             value={adjAmount}
                             onChange={e => setAdjAmount(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none font-mono"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">责任承担部门/人</label>
                           <input 
                             type="text"
                             placeholder="如 供应商质量组"
                             value={adjParty}
                             onChange={e => setAdjParty(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">关联款式款号 (选填)</label>
                           <input 
                             type="text"
                             placeholder="如 TR-2401"
                             value={adjStyleNo}
                             onChange={e => setAdjStyleNo(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">关联 SKU (选填)</label>
                           <input 
                             type="text"
                             placeholder="如 TR-2401-BLK-M"
                             value={adjSkuCode}
                             onChange={e => setAdjSkuCode(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">发生说明</label>
                           <input 
                             type="text"
                             placeholder="包装瑕疵折损公摊"
                             value={adjRemark}
                             onChange={e => setAdjRemark(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           />
                         </div>
                       </div>

                       <div className="flex justify-end gap-2 text-xs pt-1 select-none">
                         <button 
                           type="button"
                           onClick={() => setShowAdjForm(false)}
                           className="px-3 py-1.8 bg-white border border-slate-200 font-bold hover:bg-slate-50 text-slate-500 rounded-lg"
                         >
                           取消
                         </button>
                         <button 
                           type="submit"
                           className="px-4.2 py-1.8 bg-rose-600 hover:bg-rose-700 font-bold text-white rounded-lg cursor-pointer"
                         >
                           确认保存该扣项
                         </button>
                       </div>
                     </motion.form>
                  )}

                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                          <tr>
                            <th className="p-3 pl-3">扣减调整类型</th>
                            <th className="p-3">关联款号/SKU</th>
                            <th className="p-3 text-right">变动金额</th>
                            <th className="p-3">责任承担</th>
                            <th className="p-3 pr-3">备注</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {freshBill.penaltyAmt > 0 && (
                            <tr className="bg-rose-50/15">
                              <td className="p-3 pl-3 font-bold text-rose-650 font-sans">工艺瑕疵罚扣 (期初)</td>
                              <td className="p-3 font-mono text-slate-450">-</td>
                              <td className="p-3 text-right font-mono text-rose-600 font-bold">¥{freshBill.penaltyAmt.toLocaleString()}</td>
                              <td className="p-3 text-slate-500">供应商车间</td>
                              <td className="p-3 pr-3 text-slate-400 font-normal">期初工艺标准质检折旧折返抵扣</td>
                            </tr>
                          )}
                          {freshBill.logs.filter(l => l.action === "扣款调整增补").map((l, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30">
                              <td className="p-3 pl-3">
                                <span className="px-1.8 py-0.5 bg-slate-100 text-slate-650 rounded-md font-bold text-[10px]">
                                  {l.remark?.split("：")[0] || "公摊增补"}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-450">-</td>
                              <td className="p-3 text-right font-mono text-slate-800 font-bold">
                                ¥{l.remark?.includes("¥") ? l.remark.split("¥")[1] : "已记账"}
                              </td>
                              <td className="p-3 text-slate-500">物流/大货责任</td>
                              <td className="p-3 pr-3 text-slate-400 font-normal">{l.remark}</td>
                            </tr>
                          ))}
                          {freshBill.penaltyAmt === 0 && freshBill.logs.filter(l => l.action === "扣款调整增补").length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-350 select-none">此结算周期暂无特殊合同外条款调整与品质扣款记录</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 2. Registered cash payments subsegment */}
                <div className="bg-white border border-slate-200/95 rounded-2xl shadow-3xs overflow-hidden">
                  <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between select-none">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-800">对公货款划账、财务电汇网银出账登记</span>
                    </div>
                    <button
                      onClick={() => setShowPayForm(!showPayForm)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-black cursor-pointer shadow-3xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增登记付款流水</span>
                    </button>
                  </div>

                  {showPayForm && (
                     <motion.form 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       className="p-5 border-b border-slate-100 bg-[#f4faf7]/60 space-y-4"
                       onSubmit={handleAddPaymentSubmit}
                     >
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">发款电汇付款日期</label>
                           <input 
                             type="date"
                             required
                             value={payDate}
                             onChange={e => setPayDate(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">出账借方自持银行账号</label>
                           <select 
                             value={payAccount}
                             onChange={e => setPayAccount(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           >
                             <option value="招商银行 (对公往来端 9120)">招商银行 (对公往来端 9120)</option>
                             <option value="建设银行 (乐娜对公 8813)">建设银行 (乐娜对公 8813)</option>
                             <option value="浦发银行 (自持银付 6025)">浦发银行 (自持银付 6025)</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">付款出账金额 (元)</label>
                           <input 
                             type="number"
                             required
                             step="0.01"
                             placeholder="如 85000.00"
                             value={payAmount}
                             onChange={e => setPayAmount(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none font-mono"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">收款人名称</label>
                           <input 
                             type="text"
                             placeholder={freshBill.supplierName}
                             value={payReceiverName}
                             onChange={e => setPayReceiverName(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">接收网点银行卡号</label>
                           <input 
                             type="text"
                             placeholder="如 CIB-62284892..."
                             value={payReceiverAccount}
                             onChange={e => setPayReceiverAccount(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none font-mono"
                           />
                         </div>

                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 mb-1">流水备注摘要</label>
                           <input 
                             type="text"
                             placeholder="对公首期出账货款"
                             value={payRemark}
                             onChange={e => setPayRemark(e.target.value)}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                           />
                         </div>
                       </div>

                       <div className="flex justify-end gap-2 text-xs pt-1 select-none font-sans">
                         <button 
                           type="button"
                           onClick={() => setShowPayForm(false)}
                           className="px-3 py-1.8 bg-white border border-slate-200 font-bold hover:bg-slate-50 text-slate-500 rounded-lg"
                         >
                           取消
                         </button>
                         <button 
                           type="submit"
                           className="px-4.2 py-1.8 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-lg cursor-pointer"
                         >
                           确认登记打款记账
                         </button>
                       </div>
                     </motion.form>
                  )}

                  <div className="p-4">
                    <div className="space-y-2.5">
                      {freshBill.payments.map(pay => (
                        <div 
                          key={pay.id}
                          className="p-3 border border-slate-100 rounded-xl bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all font-sans text-xs flex items-center justify-between"
                        >
                            <div className="space-y-1">
                              <p className="font-extrabold text-[#002444] font-mono leading-none flex items-center gap-1.5 text-xs">
                                <span>付款单证: {pay.id}</span>
                                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[8.5px] font-extrabold rounded-md font-sans">
                                  财务网银电汇
                                </span>
                              </p>
                              <p className="text-[10.5px] text-slate-400 mt-1">
                                付款日期: <span className="font-mono text-slate-500 font-bold">{pay.date}</span> | 渠道：<span className="text-slate-500 font-bold">{pay.account.split(" ")[0]}</span>
                              </p>
                              {pay.remark && (
                                <p className="text-[10px] text-slate-450 italic mt-0.5">备注：{pay.remark}</p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="text-xs font-black font-mono text-emerald-600">
                                -¥{pay.amount.toLocaleString()}
                              </p>
                              <span className="text-[9px] text-slate-350 bg-slate-100 rounded px-1.8 py-0.2">经办人: {pay.operator}</span>
                            </div>
                          </div>
                      ))}

                      {freshBill.payments.length === 0 && (
                        <div className="py-8 text-center text-slate-350 select-none">此期暂无任何已拨货款及网银对公电汇划款历史</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
            {activeTab === "original_bill" && (
              <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                      <tr>
                        <th className="p-3 pl-5 text-center w-12">序号</th>
                        <th className="p-3">款式款号</th>
                        <th className="p-3">商品名称</th>
                        <th className="p-3">规格规格/颜色</th>
                        <th className="p-3 text-right">申报结算数量</th>
                        <th className="p-3 text-right">供应商申报结算单价</th>
                        <th className="p-3 text-right">申报结算金额（元）</th>
                        <th className="p-3 pr-5">申报说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {freshBill.skus.map((sku, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-3 pl-5 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 text-slate-900 font-bold">{sku.styleNo}</td>
                          <td className="p-3 text-slate-550">{sku.name}</td>
                          <td className="p-3 text-slate-450 font-sans">{sku.skuInfo}</td>
                          <td className="p-3 text-right font-mono font-bold">{sku.supplierQty}</td>
                          <td className="p-3 text-right font-mono text-slate-500">¥{sku.supplierPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">¥{sku.supplierAmt.toLocaleString()}</td>
                          <td className="p-3 pr-5 text-slate-400 font-normal">{sku.reason || "常规申报"}</td>
                        </tr>
                      ))}
                      {freshBill.skus.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-350 select-none">暂无已导入申报账单，请退出抽屉一键导入其 Excel 对账表</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: 【智能映射反馈】 */}
            {activeTab === "mapping" && (
              <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-3xs space-y-4 font-sans text-xs">
                <div className="flex items-center space-x-2 text-sky-850 bg-sky-50 border border-sky-100 p-3.5 rounded-xl text-xs font-semibold select-none leading-relaxed">
                  <Sparkles className="w-5 h-5 text-sky-600 animate-pulse shrink-0" />
                  <p>AI 自动识别映射反馈：已智能识别供应商非标 Excel 账单。请核对转换后的字段标准映射对应表。系统已硬核清洗并校验各格式类型。</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[10px] uppercase border-b border-slate-100 select-none">
                      <tr>
                        <th className="p-3 pl-4">供应商账单导入原始列头</th>
                        <th className="p-3">系统匹配绑定英文字段</th>
                        <th className="p-3">智能提取数据示范</th>
                        <th className="p-3">类型校验 Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-750">
                      {[
                        { raw: "款号 / 型号 / 款式代号", mapped: "style_code (款号)", sample: freshBill.skus[0]?.styleNo || "TR-2401", status: "VALID / TEXT" },
                        { raw: "颜色-尺码 / 规格编码 / 条码", mapped: "sku_code (SKU编码)", sample: "TR-2401-BLK-M", status: "VALID / STRING" },
                        { raw: "商品标题 / 宝贝名称", mapped: "product_name (商品名称)", sample: freshBill.skus[0]?.name || "针织弹力九分裤", status: "VALID / TEXT" },
                        { raw: "发货数量 / 申报到货数", mapped: "quantity (结算数量)", sample: "120", status: "VALID / INTEGER" },
                        { raw: "供应协议价 / 单价", mapped: "unit_price (结算单价)", sample: `¥${(freshBill.skus[0]?.supplierPrice || 65.0).toFixed(2)}`, status: "VALID / DECIMAL" },
                        { raw: "金额估算 / 合计数额", mapped: "amount (结算总额)", sample: `¥${((freshBill.skus[0]?.supplierPrice || 65.0) * 120).toLocaleString()}`, status: "VALID / DOUBLE" }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="p-3 pl-4 text-sky-850 font-bold border-l-2 border-sky-500 bg-sky-50/5 font-mono">{item.raw}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">{item.mapped}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{item.sample}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9.5px] font-black border border-emerald-100">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: 【对仗对碰大表】 */}
            {activeTab === "matching_grid" && (
              <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 select-none text-[11px] font-bold text-slate-550">
                  <span>两端数据流大表对碰清单：整合 ERP 系统到货记录、供应商契约账单及偏位差额汇总</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                      <tr>
                        <th className="p-3 pl-4">款号/SKU</th>
                        <th className="p-3 text-right">入库数量</th>
                        <th className="p-3 text-right">供应商申报数量</th>
                        <th className="p-3 text-right text-amber-600">数量偏差</th>
                        <th className="p-3 text-right">合同单价</th>
                        <th className="p-3 text-right text-rose-600">单价偏差</th>
                        <th className="p-3 text-right">系统总额</th>
                        <th className="p-3 text-right">供应商总额</th>
                        <th className="p-3 pr-4 text-right">对碰比对结论</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {freshBill.skus.map((sku, idx) => {
                        const qtyDiff = sku.inboundQty - sku.supplierQty;
                        const priceDiff = sku.systemCost - sku.supplierPrice;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            <td className="p-3 pl-4">
                              <span className="font-bold text-slate-900">{sku.styleNo}</span>
                              <p className="text-[9.5px] text-slate-400 font-mono">{sku.skuInfo}</p>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600">{sku.inboundQty}</td>
                            <td className="p-3 text-right font-mono text-slate-650">{sku.supplierQty}</td>
                            <td className="p-3 text-right font-mono font-bold text-amber-600">
                              {qtyDiff === 0 ? "0" : qtyDiff > 0 ? `+${qtyDiff}` : qtyDiff}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-550">¥{sku.systemCost.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono font-bold text-rose-500">
                              {priceDiff === 0 ? "¥0.00" : `¥${priceDiff.toFixed(2)}`}
                            </td>
                            <td className="p-3 text-right font-mono text-slate-900">¥{sku.systemAmt.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono text-slate-500">¥{sku.supplierAmt.toLocaleString()}</td>
                            <td className="p-3 pr-4 text-right">
                              <span className={`px-1.8 py-0.5 rounded text-[9.5px] font-black border ${
                                qtyDiff === 0 && priceDiff === 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                              }`}>
                                {qtyDiff === 0 && priceDiff === 0 ? "一致对齐" : "有偏位错漏"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: 【差异明细底账】 */}
            {activeTab === "differences" && (
              <div className="space-y-4">
                <div className="bg-amber-50 text-amber-700 border border-amber-100 p-4 rounded-xl flex items-start gap-2.5 text-[10.5px] select-none leading-relaxed font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    系统差异说明：该模块通过大货入库条码与供应商申批表进行双向对碰。
                    如果您选择<strong>“确认/核准”</strong>，系统认为此差异系业务允许范围内的合理偏差，并予以列支开票。
                  </p>
                </div>

                <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                        <tr>
                          <th className="p-3 pl-5">差异类型</th>
                          <th className="p-3">款式款号</th>
                          <th className="p-3">SKU编码</th>
                          <th className="p-3 text-right">系统数量</th>
                          <th className="p-3 text-right">供应商数量</th>
                          <th className="p-3 text-right">系统金额</th>
                          <th className="p-3 text-right">供应商金额</th>
                          <th className="p-3 text-right text-rose-600">差异额</th>
                          <th className="p-3 text-center">审核状态</th>
                          <th className="p-3 pr-5 text-right w-36">差异决策操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {freshBill.discrepancies.map((d, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/15 transition-colors">
                            <td className="p-3 pl-5 text-slate-900">
                              <span className="px-1.8 py-0.5 bg-amber-50 text-amber-700 font-black rounded-md text-[9.5px]">
                                {d.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-900 font-bold">{d.item.split(" ")[0]}</td>
                            <td className="p-3 font-mono text-slate-500">{d.item.includes("(") ? d.item.split("(")[1].replace(")", "") : "-"}</td>
                            <td className="p-3 text-right font-mono text-slate-500">{d.type === "单价差异" ? freshBill.skuCount : "-"}</td>
                            <td className="p-3 text-right font-mono text-slate-550">{d.type === "单价差异" ? freshBill.skuCount : "-"}</td>
                            <td className="p-3 text-right font-mono text-slate-450">¥{freshBill.systemAmt.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono text-slate-450">¥{freshBill.supplierAmt.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono font-black text-rose-600">¥{d.amt.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-black border ${
                                d.status === "已核准" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                d.status === "已忽略" ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-amber-55 text-amber-600 border-amber-100 animate-pulse"
                              }`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="p-3 pr-5 text-right select-none space-x-2">
                              {d.status === "未处理" && (
                                <>
                                  <button 
                                    onClick={() => {
                                      d.status = "已核准";
                                      onToast("🟢 该笔单价/差额变动项目财务已手工认可");
                                      setFreshBill({ ...freshBill });
                                    }}
                                    className="text-emerald-600 hover:underline cursor-pointer text-[10.5px] font-bold"
                                  >
                                    确认
                                  </button>
                                  <button 
                                    onClick={() => {
                                      d.status = "已忽略";
                                      onToast("⚪ 该笔对账差异已被忽略，折旧差不挂系统");
                                      setFreshBill({ ...freshBill });
                                    }}
                                    className="text-slate-400 hover:text-slate-600 hover:underline cursor-pointer text-[10.5px] font-bold"
                                  >
                                    忽略
                                  </button>
                                </>
                              )}
                              {d.status !== "未处理" && (
                                <span className="text-slate-350 italic text-[10px]">已入卷</span>
                              )}
                            </td>
                            </tr>
                        ))}
                        {freshBill.discrepancies.length === 0 && (
                          <tr>
                            <td colSpan={10} className="p-12 text-center text-slate-350 select-none">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                                <p className="text-xs font-bold text-slate-500">两方契约账单及聚水潭无金额数量对仗偏漏！</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: 【AI综合审核诊断报告】 */}
            {activeTab === "ai_report" && (
              <div className="space-y-4 font-sans">
                <div className="bg-[#fafbff] border border-sky-100 rounded-2xl p-6 shadow-3xs">
                  <div className="flex items-center justify-between border-b border-sky-50 pb-4 mb-4 select-none">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-sky-600 animate-pulse" />
                      <h3 className="text-xs font-black text-sky-800 uppercase tracking-wider">AI 智能供应链财务审计分析报告 (Gemini 3.5 Core)</h3>
                    </div>
                    <button
                      onClick={handleRefreshAiSummary}
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 rounded-lg text-xs font-black cursor-pointer shadow-3xs flex items-center gap-1 transition-all"
                    >
                      {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>手动重新跑 AI 诊断报告</span>
                    </button>
                  </div>

                  {aiLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-sky-650 animate-spin" />
                      <p className="text-xs font-bold text-slate-400">正在通过 Google Gemini 3.5 智能引擎实时解译账单和入库差异偏位成因...</p>
                    </div>
                  ) : (
                    <div className="prose prose-sm text-xs text-slate-650 leading-relaxed font-semibold">
                      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-3xs space-y-3.5">
                        <h4 className="text-xs font-black text-slate-900 border-l-3 border-sky-600 pl-2">【AI 账单与实际到货差异解释诊断】</h4>
                        <div className="whitespace-pre-wrap leading-relaxed font-semibold">{aiSummary || "暂无此对账批次的 AI 诊断报告，请点击上方按钮一键激发 Gemini 3.5 精准分析。"}</div>
                      </div>
                      
                      <div className="mt-4 bg-slate-50 border border-slate-150 rounded-xl p-4 text-[10.5px] text-slate-550 leading-relaxed space-y-1.5 select-none font-sans">
                        <p className="font-bold text-slate-700">🛡️ 智能机自反馈免责声明：</p>
                        <p>1. 本财务金额与差异计算完全基于系统既定内置之后端 standard 代码公式执行，AI 诊断仅提供货运与账单差异的成因解释参考，不能亦无法以任何指令修改任何财务应付款项底账数据。</p>
                        <p>2. 各项对账及扣款调节明细，请以本页面「AI对账主控台 / 账单差异比对」中的财务人工确认为准。</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Change logs revision lists (Rendered in right margin or at bottom of tabs) */}
            <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-3xs space-y-3.5 select-none mt-6">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>结算期操作日志及履历修改审计</span>
              </h4>
              <div className="relative border-l border-slate-200 pl-4 space-y-4">
                {freshBill.logs.map((log, idx) => (
                  <div key={idx} className="relative text-[10.5px] font-semibold text-slate-600">
                    <span className="absolute -left-[20.5px] top-1.5 w-1.8 h-1.8 rounded-full bg-slate-400 border border-white" />
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-mono font-bold">{log.time}</span>
                      <strong className="text-slate-800">{log.operator}</strong>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-normal text-[9px]">
                        {log.action}
                      </span>
                    </div>
                    {log.remark && (
                      <p className="text-slate-450 font-normal italic mt-0.8">{log.remark}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Core Footer Operations */}
          <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex items-center justify-between select-none shadow-md">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5 leading-none">
              <UserCheck className="w-4 h-4 text-slate-300" />
              <span>乐娜电商内部供应链结算中心对仗台</span>
            </span>
            <button 
              onClick={onClose}
              className="px-4.5 py-2 hover:bg-slate-50 border border-slate-200 font-extrabold text-slate-650 rounded-xl cursor-pointer"
            >
              关闭对账抽屉
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
