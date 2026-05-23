/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, CornerDownLeft, FileWarning, Paperclip, CheckCircle2, ShieldAlert } from "lucide-react";
import { CashflowRecord, FundAccount, CashflowCategory } from "@shared/types";

interface CashflowFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CashflowRecord, "id" | "createdAt"> & { status: "draft" | "confirmed" }) => void;
  recordToEdit?: CashflowRecord | null;
  accounts: FundAccount[];
  categories: CashflowCategory[];
}

export default function CashflowFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  recordToEdit,
  accounts,
  categories
}: CashflowFormDrawerProps) {
  const [transactionDate, setTransactionDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [direction, setDirection] = useState<"income" | "expense" | "transfer">("expense");
  const [amount, setAmount] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [summary, setSummary] = useState("");
  const [remark, setRemark] = useState("");
  const [hasAttachment, setHasAttachment] = useState(false);
  
  // Validation indicator
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Trigger form preloads
  useEffect(() => {
    if (recordToEdit) {
      setTransactionDate(recordToEdit.transactionDate);
      setAccountId(recordToEdit.accountId);
      setDirection(recordToEdit.direction);
      setAmount(recordToEdit.amount);
      setCategoryId(recordToEdit.categoryId);
      setCounterparty(recordToEdit.counterparty || "");
      setSummary(recordToEdit.summary);
      setRemark(recordToEdit.remark || "");
      setHasAttachment(recordToEdit.hasAttachment);
    } else {
      // Default baseline values
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setAccountId("");
      setDirection("expense");
      setAmount("");
      setCategoryId("");
      setCounterparty("");
      setSummary("");
      setRemark("");
      setHasAttachment(false);
    }
    setErrors({});
  }, [recordToEdit, isOpen]);

  // Adjust Category selection when DIRECTION changes
  useEffect(() => {
    if (!recordToEdit) {
      setCategoryId(""); // reset subclass category if direction shifts
    }
  }, [direction]);

  if (!isOpen) return null;

  // Manual pre-validation before submission
  const validateAndSubmit = (status: "draft" | "confirmed") => {
    const freshErrors: Record<string, string> = {};

    if (!transactionDate) freshErrors.transactionDate = "流水发生日期不能为空";
    if (!accountId) freshErrors.accountId = "请指定收款/付款资金账户";
    if (!direction) freshErrors.direction = "收支方向必填";
    if (!amount || Number(amount) <= 0) freshErrors.amount = "金额必须大于 0 整数或浮点数字";
    if (!categoryId && direction !== "transfer") freshErrors.categoryId = "科目归类不能为空";
    if (!summary.trim()) freshErrors.summary = "业务摘要摘要必须说明以供追溯";

    if (Object.keys(freshErrors).length > 0) {
      setErrors(freshErrors);
      return;
    }

    const selectedAccountObj = accounts.find(a => a.id === accountId);
    const selectedCategoryObj = categories.find(c => c.id === categoryId);

    onSubmit({
      transactionDate,
      accountId,
      accountName: selectedAccountObj ? selectedAccountObj.name : "未知账户",
      direction,
      amount: Number(amount),
      categoryId,
      categoryName: selectedCategoryObj ? selectedCategoryObj.name : (direction === "transfer" ? "账户内部转账" : "未指定分类"),
      counterparty,
      summary,
      remark,
      hasAttachment,
      operator: "lenakids1603@gmail.com", // Simulated core user
      status // 'draft' or 'confirmed'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
        <div className="w-screen max-w-lg bg-white shadow-xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-5 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-[#002045]">
                {recordToEdit ? `编辑流水登记项 (${recordToEdit.id})` : "单本手工增补资金流水"}
              </h3>
              <p className="text-[10px] text-slate-400">登入财务借贷科目、资金账户以及上传凭证单据用于校对</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer hover:bg-slate-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Fields body */}
          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            
            {/* Warning if editing a pre-confirmed flow */}
            {recordToEdit && recordToEdit.status === "confirmed" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-amber-800 block">确认中编辑警告</span>
                  <span className="text-[10px] text-amber-600 block leading-relaxed">
                    此账户流水已于 {new Date(recordToEdit.confirmedAt || "").toLocaleDateString()} 完成出纳确认。修改此流水的任何财务数据将会被记录到审计操作日志。
                  </span>
                </div>
              </div>
            )}

            {/* Field: Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">流水日期 <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 cursor-pointer ${
                  errors.transactionDate ? "border-rose-450 focus:ring-rose-500 bg-rose-50/5" : "border-slate-200 focus:ring-[#006591] focus:bg-white"
                }`}
              />
              {errors.transactionDate && <p className="text-[9px] font-bold text-rose-500 mt-1">{errors.transactionDate}</p>}
            </div>

            {/* Field: Direction */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-sans">财务借贷收支属性 <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "expense", label: "支出 (-)", bg: "border-rose-200 text-rose-600 active:bg-rose-50" },
                  { value: "income", label: "收入 (+)", bg: "border-emerald-200 text-emerald-600 active:bg-emerald-50" },
                  { value: "transfer", label: "内部划拨 (•)", bg: "border-indigo-200 text-indigo-600 active:bg-indigo-50" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDirection(opt.value as any)}
                    className={`p-2 py-2.5 border rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                      direction === opt.value
                        ? opt.value === "expense"
                          ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                          : opt.value === "income"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                          : "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Account Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">核算资金账户 <span className="text-rose-500">*</span></label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 cursor-pointer ${
                  errors.accountId ? "border-rose-450 focus:ring-rose-500 bg-rose-50/5" : "border-slate-200 focus:ring-[#006591] focus:bg-white"
                }`}
              >
                <option value="">-- 选择对应科目账户 --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} (可用额: ¥{acc.balance.toLocaleString()})</option>
                ))}
              </select>
              {errors.accountId && <p className="text-[9px] font-bold text-rose-500 mt-1">{errors.accountId}</p>}
            </div>

            {/* Field: Amount & Category side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">记账金额 <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold text-xs">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className={`w-full pl-7 pr-3 py-2.5 bg-slate-50 border rounded-lg text-xs font-black font-mono text-slate-700 focus:outline-none focus:ring-1 ${
                      errors.amount ? "border-rose-450 focus:ring-rose-500 bg-rose-50/5" : "border-slate-200 focus:ring-[#006591] focus:bg-white"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && <p className="text-[9px] font-bold text-rose-500 mt-1">{errors.amount}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">账户科目类别 <span className="text-rose-500">*</span></label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={direction === "transfer"}
                  className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 cursor-pointer ${
                    direction === "transfer" 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : errors.categoryId 
                    ? "border-rose-450 focus:ring-rose-500 bg-rose-50/5" 
                    : "border-slate-200 focus:ring-[#006591] focus:bg-white"
                  }`}
                >
                  {direction === "transfer" ? (
                    <option value="">账户内部划转联通</option>
                  ) : (
                    <>
                      <option value="">-- 科目归档 --</option>
                      {categories
                        .filter(c => c.direction === direction)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </>
                  )}
                </select>
                {errors.categoryId && direction !== "transfer" && <p className="text-[9px] font-bold text-rose-500 mt-1">{errors.categoryId}</p>}
              </div>
            </div>

            {/* Field: Counterparty */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">往来交易对象 (户名)</label>
              <input
                type="text"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                placeholder="对方企业（如：盛大织造）、员工姓名、运载货运商等"
              />
            </div>

            {/* Field: Summary */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">核算业务摘要 <span className="text-rose-500">*</span></label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-755 focus:outline-none focus:ring-1 resize-y ${
                  errors.summary ? "border-rose-450 focus:ring-rose-500 bg-rose-50/5" : "border-slate-200 focus:ring-[#006591] focus:bg-white"
                }`}
                placeholder="在此录入详尽简要：例「预付某某面料商定金30%、月度快递协议结算」等"
              />
              {errors.summary && <p className="text-[9px] font-bold text-rose-500 mt-1">{errors.summary}</p>}
            </div>

            {/* Field: Remarks */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">备注补充细则</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-755 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white resize-y"
                placeholder="追加其他核实依据或特殊说明事项（可空）"
              />
            </div>

            {/* Field: Attachment Toggle */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-205/60 space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAttachment}
                  onChange={(e) => setHasAttachment(e.target.checked)}
                  className="w-4 h-4 text-[#006591] bg-slate-100 border-slate-300 rounded-sm focus:ring-[#006591] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">已贴附电子记账发票凭证附件 / 单据底单</span>
              </label>

              {hasAttachment && (
                <div className="flex items-center space-x-2 p-2 bg-white rounded border border-slate-200 text-xs text-slate-500">
                  <Paperclip className="w-3.5 h-3.5 text-[#006591] flex-shrink-0 animate-pulse" />
                  <span className="truncate max-w-[200px] font-bold text-[10px]">LENA_CASHFLOW_DUMMY_VOUCHER_ATTACHED.PDF</span>
                  <span className="text-[9px] bg-sky-50 text-[#006591] font-bold px-1.5 py-0.5 rounded ml-auto">模拟上传成功</span>
                </div>
              )}
            </div>

          </div>

          {/* Footer submits */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
            >
              取消
            </button>
            <div className="flex items-center space-x-3.5">
              <button
                onClick={() => validateAndSubmit("draft")}
                className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-[#002045] text-xs font-bold rounded-lg transition-all cursor-pointer border border-transparent"
              >
                保存为草稿
              </button>
              <button
                onClick={() => validateAndSubmit("confirmed")}
                className="flex items-center space-x-1 px-5 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>保存并确认过账</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
