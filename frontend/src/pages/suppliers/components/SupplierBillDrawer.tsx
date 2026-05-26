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
  addSupplierAdjustment, addSupplierPayment
} from "../../../api/reconciliation";

interface SupplierBillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bill: SupplierBill | null;
  onUpdateBill: (updatedBill: SupplierBill) => void;
  onToast: (msg: string) => void;
}

export default function SupplierBillDrawer({ isOpen, onClose, bill, onUpdateBill, onToast }: SupplierBillDrawerProps) {
  // Tabs State: inbound / bill / diff / adjust / payment
  const [activeTab, setActiveTab] = useState<"inbound" | "bill" | "diff" | "adjust" | "payment">("inbound");
  
  // Loading indicator
  const [loading, setLoading] = useState(false);
  const [freshBill, setFreshBill] = useState<SupplierBill | null>(null);

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
    }
  }, [bill?.id, isOpen]);

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

          {/* FIVE TABS HEADING (Section Seven Requirement) */}
          <div className="bg-white border-b border-slate-150 px-6 shrink-0 flex items-center overflow-x-auto select-none font-sans text-xs">
            {[
              { id: "inbound", label: "到货明细", count: freshBill.skus.length },
              { id: "bill", label: "供应商账单明细", count: freshBill.skuCount > 0 ? freshBill.skus.length : 0 },
              { id: "diff", label: "差异明细", count: freshBill.discrepancies.length, flag: freshBill.diffAmt !== 0 },
              { id: "adjust", label: "扣款与调整", count: null },
              { id: "payment", label: "付款记录", count: freshBill.payments.length }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4.5 border-b-2 font-black transition-all cursor-pointer relative whitespace-nowrap ${
                    isActive 
                      ? "border-sky-600 text-sky-700 font-extrabold" 
                      : "border-transparent text-slate-450 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`px-1.5 py-0.2 text-[9px] font-mono rounded-full font-bold ${
                        isActive ? "bg-sky-550 text-white" : "bg-slate-100 text-slate-400"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {tab.flag && (
                      <span className="w-1.8 h-1.8 rounded-full bg-amber-500 absolute top-2 right-1 animate-ping" />
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

            {/* TAB 1: 到货明细 */}
            {activeTab === "inbound" && (
              <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                      <tr>
                        <th className="p-3 pl-5">采购单号</th>
                        <th className="p-3">入库单号（聚水潭等）</th>
                        <th className="p-3">款式款号</th>
                        <th className="p-3">商品名称</th>
                        <th className="p-3">规格（领域）</th>
                        <th className="p-3 text-right">入库数量</th>
                        <th className="p-3 text-right">合同单价（元）</th>
                        <th className="p-3 text-right">系统应付（元）</th>
                        <th className="p-3 pr-5">系统到货登记时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {freshBill.skus.map((sku, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-3 pl-5 font-mono text-slate-500">{sku.poNo}</td>
                          <td className="p-3 font-mono text-slate-450">WR-20260512-AR</td>
                          <td className="p-3 text-slate-900 font-bold">{sku.styleNo}</td>
                          <td className="p-3 text-slate-550">{sku.name}</td>
                          <td className="p-3 text-slate-450 font-sans">{sku.skuInfo}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">{sku.inboundQty}</td>
                          <td className="p-3 text-right font-mono text-slate-500">¥{sku.systemCost.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">¥{sku.systemAmt.toLocaleString()}</td>
                          <td className="p-3 pr-5 text-slate-400 font-normal font-mono">{new Date(freshBill.logs[0]?.time || Date.now()).toISOString().substring(0, 10)} 15:40:00</td>
                        </tr>
                      ))}
                      {freshBill.skus.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-12 text-center text-slate-350 select-none">暂无到货匹配，可返回面板点击“导入到货数据”一键挂账</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: 供应商账单明细 */}
            {activeTab === "bill" && (
              <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                      <tr>
                        <th className="p-3 pl-5 text-center w-12">序号</th>
                        <th className="p-3">款式款号</th>
                        <th className="p-3">商品名称</th>
                        <th className="p-3">规格（规格/颜色）</th>
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

            {/* TAB 3: 差异明细 (Section Seven: Operation buttons needed) */}
            {activeTab === "diff" && (
              <div className="space-y-4">
                <div className="bg-amber-50 text-amber-700 border border-amber-100 p-4 rounded-xl flex items-start gap-2.5 text-[10.5px] select-none leading-relaxed font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    系统差异说明：该模块通过大货入库条码（条形码SKU）与供应商申批表进行双向对碰校验。
                    如果您选择<strong>“Ignored”</strong>，该偏位在汇总卡片中不再归类为“异常差异”；选择<strong>“Approved”</strong>，即承认以此单价对碰金额开票归账。
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
                                    className="text-emerald-600 hover:underline cursor-pointer text-[10.5.px]"
                                  >
                                    确认
                                  </button>
                                  <button 
                                    onClick={() => {
                                      d.status = "已忽略";
                                      onToast("⚪ 该笔对账差异已被忽略，折旧差不挂系统");
                                      setFreshBill({ ...freshBill });
                                    }}
                                    className="text-slate-400 hover:text-slate-600 hover:underline cursor-pointer text-[10.5.px]"
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

            {/* TAB 4: 扣款与调整 */}
            {activeTab === "adjust" && (
              <div className="space-y-6">
                
                {/* Expand Toggle and Form */}
                <div className="bg-white border border-slate-200/95 rounded-2xl shadow-3xs overflow-hidden">
                  <div className="bg-slate-50/50 p-4.5 border-b border-slate-100 flex items-center justify-between select-none">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-rose-50 text-rose-600 rounded">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-800">直接增加本批次的货期索减、退货和运费公摊调整</span>
                    </div>
                    <button
                      onClick={() => setShowAdjForm(!showAdjForm)}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10.5px] font-black cursor-pointer shadow-3xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加调整扣项</span>
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
                            <option value="质量扣款">质量扣款 (索索罚款数)</option>
                            <option value="超时扣款">超时扣款 (延期交货扣款)</option>
                            <option value="退厂">退厂扣款 (大货瑕疵返厂)</option>
                            <option value="返修回仓">返修回仓增加款 (+)</option>
                            <option value="运费">运费调整公摊</option>
                            <option value="其他">其他临时调整补正</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">变动发生金额 (元)</label>
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
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">归属归因责任方</label>
                          <input 
                            type="text"
                            placeholder="如 903制衣、出货包装"
                            value={adjParty}
                            onChange={e => setAdjParty(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">关联款式款号 (选填)</label>
                          <input 
                            type="text"
                            placeholder="如 TY-6623"
                            value={adjStyleNo}
                            onChange={e => setAdjStyleNo(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">关联具体 SKU (选填)</label>
                          <input 
                            type="text"
                            placeholder="如 TY-6623-P90"
                            value={adjSkuCode}
                            onChange={e => setAdjSkuCode(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">辅助备注声明</label>
                          <input 
                            type="text"
                            placeholder="如 开裂率10%批量折旧罚款"
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
                          确认添加该扣项
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Dynamic Adjustments Displays list */}
                  <div className="p-4.5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                          <tr>
                            <th className="p-3 pl-3">扣减调整类型</th>
                            <th className="p-3">关联款号/SKU</th>
                            <th className="p-3 text-right">发生变动金额</th>
                            <th className="p-3">发生日期</th>
                            <th className="p-3">责任归属</th>
                            <th className="p-3 pr-3">备注</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {/* Render returned and penalty listings if stored on page metrics */}
                          {freshBill.penaltyAmt > 0 && (
                            <tr className="bg-rose-50/15">
                              <td className="p-3 pl-3 font-bold text-rose-650">质量罚扣 (期初)</td>
                              <td className="p-3 font-mono text-slate-450">-</td>
                              <td className="p-3 text-right font-mono text-rose-600 font-black">¥{freshBill.penaltyAmt.toLocaleString()}</td>
                              <td className="p-3 font-mono text-slate-400">期初设定</td>
                              <td className="p-3 text-slate-500">供应商生产部官方</td>
                              <td className="p-3 pr-3 text-slate-400">常规大货延迟或车间针织疵罚款汇算</td>
                            </tr>
                          )}
                          
                          {/* Custom added ones */}
                          {freshBill.logs.filter(l => l.action === "扣款调整增补").map((l, idx) => {
                            // Deduce mock description row
                            return (
                              <tr key={idx} className="hover:bg-slate-50/30">
                                <td className="p-3 pl-3">
                                  <span className="px-1.8 py-0.5 bg-slate-100 text-slate-650 rounded-md font-bold text-[10px]">
                                    {l.remark?.split("：")[0] || "公摊增补"}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-slate-450">-</td>
                                <td className="p-3 text-right font-mono text-slate-800 font-bold">
                                  ¥{l.remark?.includes("¥") ? l.remark.split("¥")[1] : "未核准"}
                                </td>
                                <td className="p-3 font-mono text-slate-400">{l.time.substring(0, 10)}</td>
                                <td className="p-3 text-slate-500">公国公摊分担</td>
                                <td className="p-3 pr-3 text-slate-400 font-normal">{l.remark}</td>
                              </tr>
                            );
                          })}

                          {freshBill.penaltyAmt === 0 && freshBill.logs.filter(l => l.action === "扣款调整增补").length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-12 text-center text-slate-350 select-none">此期暂无任何特殊应付调整与扣减公摊记录</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 5: 付款记录 */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                
                {/* Expand toggler payment form */}
                <div className="bg-white border border-slate-200/95 rounded-2xl shadow-3xs overflow-hidden">
                  <div className="bg-slate-50/50 p-4.5 border-b border-slate-100 flex items-center justify-between select-none">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-800">直接向该供应商追加财务电汇、网银货打款登记</span>
                    </div>
                    <button
                      onClick={() => setShowPayForm(!showPayForm)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-black cursor-pointer shadow-3xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>登记付款</span>
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
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">付款核销日期</label>
                          <input 
                            type="date"
                            required
                            value={payDate}
                            onChange={e => setPayDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">划付银行账户 (借方)</label>
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
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">付款发生金额 (元)</label>
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
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">收款人公司名称</label>
                          <input 
                            type="text"
                            placeholder={freshBill.supplierName}
                            value={payReceiverName}
                            onChange={e => setPayReceiverName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">接收人开户行卡号</label>
                          <input 
                            type="text"
                            placeholder="如 CIB-62284892..."
                            value={payReceiverAccount}
                            onChange={e => setPayReceiverAccount(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold leading-normal focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">流水备注备注</label>
                          <input 
                            type="text"
                            placeholder="如 直播第一期电汇尾款"
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
                          确认登记出账
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* List displaying Payments */}
                  <div className="p-4.5">
                    <div className="space-y-3">
                      {freshBill.payments.map(pay => (
                        <div 
                          key={pay.id}
                          className="p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:border-slate-200 transition-all font-sans text-xs flex items-center justify-between"
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
