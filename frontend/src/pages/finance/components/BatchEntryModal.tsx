/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Trash2, PlusCircle, LayoutGrid, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { CashflowRecord, FundAccount, CashflowCategory } from "@shared/types";

interface BatchEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (records: Omit<CashflowRecord, "id" | "createdAt">[]) => void;
  accounts: FundAccount[];
  categories: CashflowCategory[];
}

interface BatchRow {
  transactionDate: string;
  accountId: string;
  direction: "income" | "expense";
  amount: string;
  categoryId: string;
  counterparty: string;
  summary: string;
  remark: string;
  hasAttachment: boolean;
  errors: Record<string, string>;
}

export default function BatchEntryModal({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  categories
}: BatchEntryModalProps) {
  const [rows, setRows] = useState<BatchRow[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow()
  ]);

  const [hasValidated, setHasValidated] = useState(false);

  function createEmptyRow(): BatchRow {
    return {
      transactionDate: new Date().toISOString().split("T")[0],
      accountId: "",
      direction: "expense",
      amount: "",
      categoryId: "",
      counterparty: "",
      summary: "",
      remark: "",
      hasAttachment: false,
      errors: {}
    };
  }

  if (!isOpen) return null;

  const handleAddRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return; // Keep at least 1 row
    setRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFieldChange = (index: number, field: keyof Omit<BatchRow, "errors">, value: any) => {
    setRows(prev => prev.map((row, idx) => {
      if (idx === index) {
        const updated = { ...row, [field]: value };
        // If direction shifts, reset category id to prevent mismatch
        if (field === "direction") {
          updated.categoryId = "";
        }
        // clear errors on target field once it is touched
        if (row.errors[field as string]) {
          const freshErrors = { ...row.errors };
          delete freshErrors[field as string];
          updated.errors = freshErrors;
        }
        return updated;
      }
      return row;
    }));
  };

  const handleSave = (status: "draft" | "confirmed") => {
    let hasAnyErrors = false;

    const validatedRows = rows.map(row => {
      const fieldErrors: Record<string, string> = {};
      
      if (!row.transactionDate) fieldErrors.transactionDate = "日期空";
      if (!row.accountId) fieldErrors.accountId = "账户空";
      if (!row.amount || Number(row.amount) <= 0) fieldErrors.amount = "金额必正数";
      if (!row.categoryId) fieldErrors.categoryId = "分类空";
      if (!row.summary.trim()) fieldErrors.summary = "摘要空";

      if (Object.keys(fieldErrors).length > 0) {
        hasAnyErrors = true;
      }

      return {
        ...row,
        errors: fieldErrors
      };
    });

    setRows(validatedRows);
    setHasValidated(true);

    if (hasAnyErrors) {
      alert("批量录入中有部分必填项出现校验错误，请检查标红单元格！");
      return;
    }

    // Map rows to complete record layout
    const formattedRecords = rows.map(row => {
      const activeAccount = accounts.find(a => a.id === row.accountId);
      const activeCategory = categories.find(c => c.id === row.categoryId);

      return {
        transactionDate: row.transactionDate,
        accountId: row.accountId,
        accountName: activeAccount ? activeAccount.name : "未知账户",
        direction: row.direction,
        amount: Number(row.amount),
        categoryId: row.categoryId,
        categoryName: activeCategory ? activeCategory.name : "未分类",
        counterparty: row.counterparty,
        summary: row.summary,
        remark: row.remark,
        hasAttachment: row.hasAttachment,
        status, // pass draft or confirmed status
        operator: "lenakids1603@gmail.com"
      };
    });

    onSubmit(formattedRecords);
    onClose();
    // Reset inputs
    setRows([
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow()
    ]);
    setHasValidated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Frame content */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5 text-sky-500" />
            <div>
              <h3 className="text-sm font-bold text-[#002045]">
                在线仿 Excel 式批量对账凭证录入
              </h3>
              <p className="text-[10px] text-slate-400">支持快速添加或批量移除多重账目。财务系统将一次性过账写入内存以保留审计线索</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer hover:bg-slate-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tip panel */}
        <div className="px-5 py-3.5 bg-sky-50/50 border-b border-sky-100/60 text-xs text-sky-700 flex items-start space-x-2.5">
          <Lightbulb className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">高效率批量小记：</span>
            <span>由于安全机制，本沙盒目前通过电子表单单元格交互核算。可点击「添加新行」灵活插入记账记录。 <strong>后续上线版本将开放直接粘贴 Excel 列数据自动识别的功能。</strong></span>
          </div>
        </div>

        {/* Table sheet body */}
        <div className="flex-grow overflow-auto p-5">
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead className="bg-[#f8f9ff] text-slate-500 font-bold uppercase select-none border-b border-slate-200 text-[10px]">
              <tr>
                <th className="p-2 border border-slate-200 w-12 text-center">序号</th>
                <th className="p-2 border border-slate-200 w-40">发生日期 *</th>
                <th className="p-2 border border-slate-200 w-44">资金账户 *</th>
                <th className="p-2 border border-slate-200 w-32">收支方向 *</th>
                <th className="p-2 border border-slate-200 w-36">交易金额 *</th>
                <th className="p-2 border border-slate-200 w-40">账目科目分类 *</th>
                <th className="p-2 border border-slate-200 w-44">往来对象</th>
                <th className="p-2 border border-slate-200 min-w-44">核算摘要 *</th>
                <th className="p-2 border border-slate-200 min-w-36">备注</th>
                <th className="p-2 border border-slate-200 w-20 text-center">凭证附件</th>
                <th className="p-2 border border-slate-200 w-12 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {/* Row Sequence */}
                  <td className="p-2 border border-slate-200 text-center font-bold font-mono text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Transaction Date */}
                  <td className="p-2 border border-slate-200">
                    <input
                      type="date"
                      value={row.transactionDate}
                      onChange={(e) => handleFieldChange(idx, "transactionDate", e.target.value)}
                      className={`w-full p-1 base border rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none ${
                        row.errors.transactionDate ? "border-rose-450 bg-rose-50/5" : "border-slate-250 bg-white"
                      }`}
                    />
                  </td>

                  {/* Account */}
                  <td className="p-2 border border-slate-200">
                    <select
                      value={row.accountId}
                      onChange={(e) => handleFieldChange(idx, "accountId", e.target.value)}
                      className={`w-full p-1 bg-white border rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none cursor-pointer ${
                        row.errors.accountId ? "border-rose-450 bg-rose-50/5" : "border-slate-250"
                      }`}
                    >
                      <option value="">-- 选择账户 --</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </td>

                  {/* Direction */}
                  <td className="p-2 border border-slate-200">
                    <select
                      value={row.direction}
                      onChange={(e) => handleFieldChange(idx, "direction", e.target.value)}
                      className="w-full p-1 bg-white border border-slate-250 rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none cursor-pointer font-bold text-slate-700"
                    >
                      <option value="expense">支出 (-)</option>
                      <option value="income">收入 (+)</option>
                    </select>
                  </td>

                  {/* Amount */}
                  <td className="p-2 border border-slate-200">
                    <div className="relative">
                      <span className="absolute left-1 top-1.5 text-[9px] text-slate-400 font-bold font-mono">¥</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.amount}
                        onChange={(e) => handleFieldChange(idx, "amount", e.target.value)}
                        className={`w-full pl-4 pr-1 p-1 font-mono base border rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none ${
                          row.errors.amount ? "border-rose-450 bg-rose-50/5 font-bold" : "border-slate-250 bg-white"
                        }`}
                      />
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-2 border border-slate-200">
                    <select
                      value={row.categoryId}
                      onChange={(e) => handleFieldChange(idx, "categoryId", e.target.value)}
                      className={`w-full p-1 bg-white border rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none cursor-pointer ${
                        row.errors.categoryId ? "border-rose-450 bg-rose-50/5" : "border-slate-250"
                      }`}
                    >
                      <option value="">-- 选择科目 --</option>
                      {categories
                        .filter(c => c.direction === row.direction)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                  </td>

                  {/* Counterparty */}
                  <td className="p-2 border border-slate-200">
                    <input
                      type="text"
                      placeholder="往来对手"
                      value={row.counterparty}
                      onChange={(e) => handleFieldChange(idx, "counterparty", e.target.value)}
                      className="w-full p-1 bg-white border border-slate-255 rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none font-semibold text-slate-650"
                    />
                  </td>

                  {/* Summary */}
                  <td className="p-2 border border-slate-200">
                    <input
                      type="text"
                      placeholder="主要业务背景描述"
                      value={row.summary}
                      onChange={(e) => handleFieldChange(idx, "summary", e.target.value)}
                      className={`w-full p-1 bg-white border rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none font-semibold text-slate-750 ${
                        row.errors.summary ? "border-rose-450 bg-rose-50/5" : "border-slate-250"
                      }`}
                    />
                  </td>

                  {/* Remark */}
                  <td className="p-2 border border-slate-200">
                    <input
                      type="text"
                      placeholder="内部备忘（选填）"
                      value={row.remark}
                      onChange={(e) => handleFieldChange(idx, "remark", e.target.value)}
                      className="w-full p-1 bg-white border border-slate-255 rounded text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none text-slate-500"
                    />
                  </td>

                  {/* Attachment indicator column */}
                  <td className="p-2 border border-slate-200 text-center">
                    <input
                      type="checkbox"
                      checked={row.hasAttachment}
                      onChange={(e) => handleFieldChange(idx, "hasAttachment", e.target.checked)}
                      className="w-3.5 h-3.5 text-[#006591] bg-slate-100 border-slate-300 rounded-sm cursor-pointer"
                    />
                  </td>

                  {/* Remove row trigger */}
                  <td className="p-2 border border-slate-200 text-center">
                    <button
                      onClick={() => handleRemoveRow(idx)}
                      disabled={rows.length <= 1}
                      className={`p-1.5 rounded transition-all ${
                        rows.length <= 1
                          ? "text-slate-200 cursor-not-allowed"
                          : "text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      }`}
                      title="废除这一行"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <button
            onClick={handleAddRow}
            className="flex items-center space-x-1.5 px-4.5 py-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-[#006591] text-xs font-bold border border-slate-250 rounded-lg transition-all cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>添加空行</span>
          </button>
          
          <div className="flex items-center space-x-3.5">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => handleSave("draft")}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-[#002045] text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              保存为草稿记录 (批量)
            </button>
            <button
              onClick={() => handleSave("confirmed")}
              className="flex items-center space-x-1.5 px-6 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>保存并确认过账 (批量)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
