/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, Plus, CreditCard, Receipt, FileSpreadsheet, AlertCircle, Sparkles, Check, CheckCircle
} from "lucide-react";
import { SupplierBill, BillSkuDetail, BillPayment, BillInvoice } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SupplierBillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bill: SupplierBill | null;
  onUpdateBill: (updatedBill: SupplierBill) => void;
  onToast: (msg: string) => void;
}

export default function SupplierBillDrawer({ isOpen, onClose, bill, onUpdateBill, onToast }: SupplierBillDrawerProps) {
  // Payment record form state
  const [showPayForm, setShowPayForm] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payAmount, setPayAmount] = useState("");
  const [payAccount, setPayAccount] = useState("招商银行 (对公往来端 9120)");
  const [payType, setPayType] = useState<"货款" | "预付款" | "尾款" | "临时付款">("货款");
  const [payRemark, setPayRemark] = useState("");

  // Invoice record form state
  const [showInvForm, setShowInvForm] = useState(false);
  const [invDate, setInvDate] = useState(new Date().toISOString().split("T")[0]);
  const [invNo, setInvNo] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invRemark, setInvRemark] = useState("");

  if (!bill) return null;

  // Handles adding new payment and updating quantities
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      onToast("⚠️ 请输入有效的付款金额");
      return;
    }

    const newPayment: BillPayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      date: payDate,
      entity: "杭州乐娜童衣有限公司",
      account: payAccount,
      supplier: bill.supplierName,
      amount: amount,
      type: payType as any,
      relatedBill: bill.id,
      voucher: `V_-TRANSFER-${bill.id}.pdf`,
      operator: "陈财务",
      remark: payRemark || "无"
    };

    const updatedPaid = bill.paidAmt + amount;
    const updatedRemaining = Math.max(0, bill.finalAmt - updatedPaid);
    
    // Automatically transition status to "已结清" if remaining reaches 0, otherwise keep existing or set as confirmed
    let updatedAuditStatus = bill.auditStatus;
    if (updatedRemaining === 0) {
      updatedAuditStatus = "已结清";
    }

    const updatedBill: SupplierBill = {
      ...bill,
      paidAmt: updatedPaid,
      remainingAmt: updatedRemaining,
      auditStatus: updatedAuditStatus,
      payments: [newPayment, ...bill.payments]
    };

    onUpdateBill(updatedBill);
    setShowPayForm(false);
    setPayAmount("");
    setPayRemark("");
    onToast(`🟢 付款登记成功！已付金额：¥${amount.toLocaleString()}，剩余欠款：¥${updatedRemaining.toLocaleString()}`);
  };

  // Handles registering invoice receipt
  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(invAmount);
    if (!invNo.trim()) {
      onToast("⚠️ 请填写发票号码");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      onToast("⚠️ 请输入有效的发票金额");
      return;
    }

    const newInvoice: BillInvoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: invDate,
      invoiceNo: invNo,
      supplier: bill.supplierName,
      amount: amount,
      relatedBill: bill.id,
      status: "已收票",
      file: `VAT_INV_${invNo}.pdf`,
      remark: invRemark || "无"
    };

    // Calculate invoice status based on total invoice amounts
    const totalInv = bill.invoices.reduce((sum, inv) => sum + inv.amount, 0) + amount;
    const newInvoiceStatus = totalInv >= bill.finalAmt ? "已开票" : "部分开票";

    const updatedBill: SupplierBill = {
      ...bill,
      invoiceStatus: newInvoiceStatus,
      invoices: [newInvoice, ...bill.invoices]
    };

    onUpdateBill(updatedBill);
    setShowInvForm(false);
    setInvNo("");
    setInvAmount("");
    setInvRemark("");
    onToast(`🟢 发票登记成功！收到票额 ¥${amount.toLocaleString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-[100]"
          />

          {/* Drawer contain box */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-5xl bg-slate-50 shadow-2xl z-[110] border-l border-slate-200 flex flex-col focus:outline-none text-slate-800"
          >
            {/* Drawer Header Area */}
            <div className="bg-white border-b border-slate-100 p-6 flex items-center justify-between shadow-3xs shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-black rounded-lg">
                    {bill.period} 期
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    {bill.supplierName} - 账单核对详情
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  账单凭证流水编号: <span className="font-mono font-bold text-slate-600">{bill.id}</span>
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
                title="关闭抽屉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div className="bg-white border-b border-slate-150 p-6 grid grid-cols-2 lg:grid-cols-7 gap-4 shrink-0 select-none">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">供应商申报金额</span>
                <p className="text-sm font-bold font-mono text-slate-800">¥{bill.supplierAmt.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">系统入库金额</span>
                <p className="text-sm font-bold font-mono text-slate-800 font-black">¥{bill.systemAmt.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-600 font-extrabold uppercase block">账目比对差异</span>
                <p className={`text-sm font-black font-mono ${bill.diffAmt === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {bill.diffAmt === 0 ? "无差异" : `¥${bill.diffAmt.toLocaleString()}`}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-700 font-extrabold uppercase block">财务确认付定额</span>
                <p className="text-sm font-black font-mono text-emerald-700">¥{bill.finalAmt.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-xl space-y-1">
                <span className="text-[10px] text-teal-600 font-extrabold uppercase block">已付金额</span>
                <p className="text-sm font-bold font-mono text-teal-600">¥{bill.paidAmt.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl space-y-1 lg:col-span-2">
                <span className="text-[10px] text-rose-600 font-extrabold uppercase block">剩余欠款额</span>
                <p className="text-sm font-black font-mono text-rose-600 animate-none">
                  ¥{bill.remainingAmt.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Blocks Body Space (Single-scroll-box to avoid Tab Switching as mandated) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              
              {/* 区块一：入库核对明细 */}
              <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4 flex items-center justify-between select-none">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800">区块一：入库核对明细</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">核对采购单、款号、SKU账面申报数据与仓库实入退数量偏位</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black font-mono">
                    {bill.skus.length} 款项详细
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f8f9ff] text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100 select-none">
                      <tr>
                        <th className="p-3 pl-5">采购单号</th>
                        <th className="p-3">衣服款号</th>
                        <th className="p-3">SKU尺码</th>
                        <th className="p-3 text-center">商品图片</th>
                        <th className="p-3 text-right">商定单价</th>
                        <th className="p-3 text-right">系统成本</th>
                        <th className="p-3 text-right">账面数</th>
                        <th className="p-3 text-right">入库数</th>
                        <th className="p-3 text-right">退货数</th>
                        <th className="p-3 text-right">应结数</th>
                        <th className="p-3 text-right">申报金额</th>
                        <th className="p-3 text-right">系统实入</th>
                        <th className="p-3 text-right">比对差异</th>
                        <th className="p-3 pr-5">系统对碰备注</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {bill.skus.map((sku, index) => {
                        const hasDiff = sku.diffAmt !== 0;
                        return (
                          <tr 
                            key={`${sku.poNo}-${index}`}
                            className={`transition-colors ${hasDiff ? "bg-amber-50/60 hover:bg-amber-100/40" : "hover:bg-slate-50/40"}`}
                          >
                            <td className="p-3 pl-5 font-mono text-slate-500">{sku.poNo}</td>
                            <td className="p-3 text-slate-900 font-bold">{sku.styleNo}</td>
                            <td className="p-3 text-slate-500 font-sans">{sku.skuInfo}</td>
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 text-[10px] font-black">
                                {sku.styleNo.slice(-2)}
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono">¥{sku.supplierPrice.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono text-slate-500">¥{sku.systemCost.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono text-slate-500">{sku.supplierQty}</td>
                            <td className="p-3 text-right font-mono text-slate-500">{sku.inboundQty}</td>
                            <td className="p-3 text-right font-mono text-rose-500">{sku.returnedQty > 0 ? `-${sku.returnedQty}` : "0"}</td>
                            <td className="p-3 text-right font-mono text-slate-900 font-bold">{sku.settledQty}</td>
                            <td className="p-3 text-right font-mono">¥{sku.supplierAmt.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono text-slate-800">¥{sku.systemAmt.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              {hasDiff ? (
                                <span className="text-amber-600 font-mono font-black">
                                  +¥{sku.diffAmt.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-bold">无差异</span>
                              )}
                            </td>
                            <td className="p-3 pr-5 text-slate-400 font-normal leading-relaxed text-[10px] max-w-[180px] truncate" title={sku.reason}>
                              {sku.reason}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grid block wrapper for Payments and Invoices */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 区块二：付款记录 */}
                <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4 flex items-center justify-between select-none">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-800">区块二：付款记录</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">历史打款水单自动勾稽，多批货款抵扣登记</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowPayForm(!showPayForm)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-3xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>新增付款记录</span>
                      </button>
                    </div>

                    {/* New Payment sliding register widget */}
                    {showPayForm && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-emerald-50/40 p-4 border-b border-emerald-100 space-y-3"
                        onSubmit={handleAddPayment}
                      >
                        <p className="text-[10px] text-emerald-800 font-black flex items-center gap-1 leading-none uppercase">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                          <span>登记本期新增向该厂打款水记录</span>
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 mb-1">付款日期</label>
                            <input 
                              type="date"
                              required
                              value={payDate}
                              onChange={e => setPayDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 mb-1">付款金额 (¥)</label>
                            <input 
                              type="number"
                              required
                              step="0.01"
                              placeholder="例如 120000"
                              value={payAmount}
                              onChange={e => setPayAmount(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 mb-1">打款类型</label>
                            <select 
                              value={payType} 
                              onChange={e => setPayType(e.target.value as any)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                            >
                              <option value="货款">网银大货款</option>
                              <option value="预付款">预付定金契款</option>
                              <option value="尾款">回结清尾款</option>
                              <option value="临时付款">临时短期周转</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 mb-1">记账银行账户</label>
                            <select 
                              value={payAccount}
                              onChange={e => setPayAccount(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                            >
                              <option value="招商银行 (对公往来端 9120)">招商银行 (对公 9120)</option>
                              <option value="建设银行 (乐娜对公 8813)">建设银行 (乐娜 8813)</option>
                              <option value="浦发银行 (出纳自持 6025)">浦发银行 (出纳 6025)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 mb-1">付款备注</label>
                          <input 
                            type="text"
                            placeholder="如网银交易凭证单号、财务代垫抵等"
                            value={payRemark}
                            onChange={e => setPayRemark(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1 text-xs">
                          <button 
                            type="button"
                            onClick={() => setShowPayForm(false)}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 font-bold hover:bg-slate-50 text-slate-500 rounded-lg"
                          >
                            取消
                          </button>
                          <button 
                            type="submit"
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-lg cursor-pointer"
                          >
                            确认登记付款
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {/* Payments List */}
                    <div className="p-4 space-y-3">
                      {bill.payments.length === 0 ? (
                        <div className="py-8 text-center select-none text-slate-350 text-[10.5px]">
                          暂无该厂的任何汇付交易流水记录
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {bill.payments.map(pay => (
                            <div 
                              key={pay.id}
                              className="p-3 border border-slate-100 rounded-xl bg-slate-50/70 hover:bg-white transition-all text-[11px] flex items-center justify-between"
                            >
                              <div className="space-y-1">
                                <p className="font-extrabold text-[#002444] font-mono leading-none flex items-center gap-1.5">
                                  <span>{pay.id}</span>
                                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[8.5px] font-sans font-extrabold rounded-md uppercase">
                                    {pay.type}
                                  </span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  付款日期: <span className="font-mono text-slate-500 font-bold">{pay.date}</span> | 渠道: <span className="text-slate-550 font-bold">{pay.account.split(" ")[0]}</span>
                                </p>
                                {pay.remark && pay.remark !== "无" && (
                                  <p className="text-[10px] text-slate-450 italic mt-0.5 font-normal">备注: {pay.remark}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-[11.5px] font-black font-mono text-emerald-600">
                                  -¥{pay.amount.toLocaleString()}
                                </p>
                                <span className="text-[8.5px] text-slate-350 bg-slate-100 rounded px-1.5 py-0.2">陈财务 拨付</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer summarizing payments */}
                  <div className="bg-slate-50/50 p-3.5 border-t border-slate-100/80 text-[10px] text-slate-450 font-semibold flex items-center justify-between">
                    <span>累计过账笔数: <strong className="text-slate-700 font-mono">{bill.payments.length}</strong></span>
                    <span>合计已付: <strong className="text-emerald-600 font-mono text-xs">¥{bill.paidAmt.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* 区块三：发票记录 */}
                <div className="bg-white border border-slate-200/85 rounded-2xl shadow-3xs overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4 flex items-center justify-between select-none">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-800">区块三：发票记录</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">进项增值税防伪税控发票认领存档</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowInvForm(!showInvForm)}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-3xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>新增发票记录</span>
                      </button>
                    </div>

                    {/* New Invoice widget form */}
                    {showInvForm && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-purple-50/40 p-4 border-b border-purple-100 space-y-3"
                        onSubmit={handleAddInvoice}
                      >
                        <p className="text-[10px] text-purple-800 font-black flex items-center gap-1 leading-none uppercase">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                          <span>登记供应商新寄达增值税发票</span>
                        </p>

                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-455 mb-1">发票日期</label>
                            <input 
                              type="date"
                              required
                              value={invDate}
                              onChange={e => setInvDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-455 mb-1">发票号码</label>
                            <input 
                              type="text"
                              required
                              placeholder="No. 89100125"
                              value={invNo}
                              onChange={e => setInvNo(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-455 mb-1">发票金额 (¥)</label>
                            <input 
                              type="number"
                              required
                              step="0.01"
                              placeholder="发票票面总额"
                              value={invAmount}
                              onChange={e => setInvAmount(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-455 mb-1">开票状态</label>
                            <select 
                              disabled
                              className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none text-slate-400"
                            >
                              <option value="已收票">已开票</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 mb-1">发票备注</label>
                          <input 
                            type="text"
                            placeholder="如13%进项抵扣、纸质专票挂钩等"
                            value={invRemark}
                            onChange={e => setInvRemark(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1 text-xs">
                          <button 
                            type="button"
                            onClick={() => setShowInvForm(false)}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 font-bold hover:bg-slate-50 text-slate-500 rounded-lg"
                          >
                            取消
                          </button>
                          <button 
                            type="submit"
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 font-bold text-white rounded-lg cursor-pointer"
                          >
                            确认添加发票
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {/* Invoices List */}
                    <div className="p-4 space-y-3">
                      {bill.invoices.length === 0 ? (
                        <div className="py-8 text-center select-none text-slate-350 text-[10.5px]">
                          本期供应商暂未寄送或登记任何发票
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {bill.invoices.map(inv => (
                            <div 
                              key={inv.id}
                              className="p-3 border border-slate-100 rounded-xl bg-slate-50/70 hover:bg-white transition-all text-[11px] flex items-center justify-between"
                            >
                              <div className="space-y-1">
                                <p className="font-extrabold text-indigo-900 font-mono leading-none flex items-center gap-1.5">
                                  <span>{inv.invoiceNo}</span>
                                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[8.5px] font-sans font-extrabold rounded-md">
                                    {inv.status}
                                  </span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  发票日期: <span className="font-mono text-slate-500 font-bold">{inv.date}</span> | 编号: <span className="font-mono font-bold text-slate-550">{inv.id}</span>
                                </p>
                                {inv.remark && inv.remark !== "无" && (
                                  <p className="text-[10px] text-slate-450 italic mt-0.5 font-normal">备注: {inv.remark}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-[11.5px] font-black font-mono text-purple-600">
                                  ¥{inv.amount.toLocaleString()}
                                </p>
                                <span className="text-[8.5px] text-slate-350 bg-slate-100 rounded px-1.5 py-0.2">增值税专票已检明细</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary of invoice receipts */}
                  <div className="bg-slate-50/50 p-3.5 border-t border-slate-100/80 text-[10px] text-slate-450 font-semibold flex items-center justify-between">
                    <span>已备用发票数: <strong className="text-slate-700 font-mono">{bill.invoices.length}</strong></span>
                    <span>票面总金额: <strong className="text-purple-600 font-mono text-xs">¥{bill.invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</strong></span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions of Drawer Layout */}
            <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex items-center justify-between select-none shadow-md">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-450 uppercase">
                <AlertCircle className="w-4 h-4 text-slate-300" />
                <span>登记付款与发票数据自动与汇总核对终端联动。无需进行审核流。</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-bold">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 rounded-xl cursor-pointer"
                >
                  关闭窗口
                </button>
                {bill.auditStatus !== "已确认" && bill.auditStatus !== "已结清" && (
                  <button 
                    onClick={() => {
                      const updatedBill: SupplierBill = {
                        ...bill,
                        auditStatus: "已确认"
                      };
                      onUpdateBill(updatedBill);
                      onToast(`🟢 账单核对确认无误！状态已更换为 [已确认]`);
                    }}
                    className="px-4.5 py-2.2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl cursor-pointer flex items-center gap-1.5 shadow-3xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>标记已确认一致</span>
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
