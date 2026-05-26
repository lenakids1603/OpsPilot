/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Eye, Edit, Trash2, CheckCircle2, Lock, Paperclip, ChevronLeft, ChevronRight, AlertCircle, Sparkles
} from "lucide-react";
import { CashflowRecord } from "@shared/types";

interface CashflowTableProps {
  records: CashflowRecord[];
  onView: (record: CashflowRecord) => void;
  onEdit: (record: CashflowRecord) => void;
  onConfirm: (id: string) => void;
  onLock: (id: string) => void;
  onDelete: (id: string) => void;
  onBatchConfirm?: (ids: string[]) => void;
  onBatchDelete?: (ids: string[]) => void;
}

export default function CashflowTable({
  records,
  onView,
  onEdit,
  onConfirm,
  onLock,
  onDelete,
  onBatchConfirm,
  onBatchDelete
}: CashflowTableProps) {
  // Selection set state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset page when records list changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [records.length]);

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  
  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return records.slice(startIndex, startIndex + pageSize);
  }, [records, currentPage, pageSize]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Safe checks for batches
  const selectedDraftOrConfirmedCount = useMemo(() => {
    const subset = records.filter(r => selectedIds.includes(r.id));
    return subset.filter(r => r.status !== "locked").length;
  }, [selectedIds, records]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Batch control panel */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#006591] rounded-full animate-ping" />
            <span className="text-[11px] font-bold text-slate-500">
              已选中 <strong className="text-[#006591] text-xs px-0.5">{selectedIds.length}</strong> 项流水记录
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {onBatchConfirm && (
              <button
                onClick={() => {
                  onBatchConfirm(selectedIds);
                  setSelectedIds([]);
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 text-[10px] font-bold border border-emerald-200 rounded-lg transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>批量过账确认</span>
              </button>
            )}
            {onBatchDelete && (
              <button
                onClick={() => {
                  if (confirm(`是否确认批量废弃删除这 ${selectedIds.length} 项草稿流水？已确认或锁定流水将自动跳过删除。`)) {
                    onBatchDelete(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold border border-rose-200 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>批量撤销/删除</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main spreadsheet data frame */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase select-none border-b border-slate-100">
            <tr>
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={currentRecords.length > 0 && selectedIds.length === currentRecords.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-slate-300 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="p-4">发生日期</th>
              <th className="p-4">资金账户</th>
              <th className="p-4">收支方向</th>
              <th className="p-4 text-right">交易金额</th>
              <th className="p-4">账户科目分类</th>
              <th className="p-4">来往交易对象</th>
              <th className="p-4 max-w-[200px]">摘要摘要</th>
              <th className="p-4 text-center">凭证</th>
              <th className="p-4">入账状态</th>
              <th className="p-4">经办人</th>
              <th className="p-4 text-center">操作指令列</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-12 text-center text-slate-400 font-medium font-sans">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <span>暂无满足该筛选规则的资金流水账单。您可以在右上角点击「新增流水「或「批量录入」添加流水记录。</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentRecords.map((rec) => {
                const isDraft = rec.status === "draft";
                const isConfirmed = rec.status === "confirmed";
                const isLocked = rec.status === "locked";

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      selectedIds.includes(rec.id) ? "bg-sky-50/5 hover:bg-sky-50/15" : ""
                    }`}
                  >
                    {/* Checkbox column */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rec.id)}
                        onChange={(e) => handleSelectOne(rec.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded-sm border-slate-300 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Date */}
                    <td className="p-4 font-bold font-mono text-slate-600">
                      {rec.transactionDate}
                    </td>

                    {/* Account */}
                    <td className="p-4 font-bold text-slate-700">
                      {rec.accountName}
                    </td>

                    {/* Direction */}
                    <td className="p-4">
                      {rec.direction === "income" && (
                        <span className="inline-flex items-center px-1.8 py-0.6 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded">
                          收入 (+)
                        </span>
                      )}
                      {rec.direction === "expense" && (
                        <span className="inline-flex items-center px-1.8 py-0.6 text-[10px] font-bold text-rose-600 bg-rose-50 rounded">
                          支出 (-)
                        </span>
                      )}
                      {rec.direction === "transfer" && (
                        <span className="inline-flex items-center px-1.8 py-0.6 text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded">
                          内部转账 (•)
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-4 text-right font-black font-mono">
                      <span className={rec.direction === "income" ? "text-emerald-600" : rec.direction === "expense" ? "text-rose-500" : "text-indigo-600"}>
                        {rec.direction === "expense" ? "-" : ""}{rec.amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-bold text-slate-500 text-[11px]">
                      {rec.categoryName || "未设置分类"}
                    </td>

                    {/* Counterparty */}
                    <td className="p-4 font-semibold text-slate-600">
                      {rec.counterparty || <span className="text-slate-300 italic">无交易对手</span>}
                    </td>

                    {/* Summary */}
                    <td className="p-4 max-w-[200px] truncate text-slate-500 font-medium" title={rec.summary}>
                      {rec.summary}
                    </td>

                    {/* Has Attachment */}
                    <td className="p-4 text-center">
                      {rec.hasAttachment ? (
                        <span className="inline-flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded" title="包含记账发票凭证">
                          <Paperclip className="w-3 h-3 text-[#006591]" />
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 select-none">
                      {isDraft && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-slate-100 text-slate-500 border border-slate-200/50">
                          草稿
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-emerald-50 text-emerald-600 border border-emerald-200">
                          ● 已确认
                        </span>
                      )}
                      {isLocked && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-sky-50 text-indigo-600 border border-sky-200/60">
                          ⚙️ 已归档锁定
                        </span>
                      )}
                    </td>

                    {/* Operator */}
                    <td className="p-4 font-bold text-slate-400">
                      {rec.operator}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* View record details */}
                        <button
                          onClick={() => onView(rec)}
                          className="p-1.5 text-slate-500 hover:text-[#006591] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="查看详情流水细节"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit: Draft is fully editable. Confirmed gives slight indicator. Locked blocked */}
                        <button
                          onClick={() => {
                            if (isLocked) return;
                            onEdit(rec);
                          }}
                          disabled={isLocked}
                          className={`p-1.5 rounded-md transition-colors ${
                            isLocked 
                              ? "text-slate-200 cursor-not-allowed" 
                              : isConfirmed 
                              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                              : "text-blue-500 hover:text-[#006591] hover:bg-slate-100 cursor-pointer"
                          }`}
                          title={isLocked ? "已锁定流水：禁止编辑" : isConfirmed ? "编辑流水：修改记录生成操作日志" : "修改草稿"}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Overposting confirmation: Available for drafts */}
                        {isDraft && (
                          <button
                            onClick={() => onConfirm(rec.id)}
                            className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="标记为确认流水 (过账)"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Final Locking: Available for confirmed records */}
                        {isConfirmed && (
                          <button
                            onClick={() => onLock(rec.id)}
                            className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title="对账归账存档 (永久锁定)"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete: Draft editable. Locking and confirmation blocks deletes */}
                        <button
                          onClick={() => {
                            if (isLocked || isConfirmed) return;
                            onDelete(rec.id);
                          }}
                          disabled={!isDraft}
                          className={`p-1.5 rounded-md transition-colors ${
                            !isDraft 
                              ? "text-slate-200 cursor-not-allowed" 
                              : "text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          }`}
                          title={isDraft ? "删除此账户流水" : "已确认或锁定的流水不能被删除"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component floor */}
      {records.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center space-x-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">每页行数:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-250 rounded font-semibold text-slate-600 text-xs focus:ring-1 focus:ring-[#006591] focus:outline-none cursor-pointer"
            >
              <option value={10}>10 条</option>
              <option value={20}>20 条</option>
              <option value={50}>50 条</option>
            </select>
            <span className="text-[11px] font-bold text-slate-400">
              共 <strong className="text-slate-700 font-mono text-xs">{records.length}</strong> 条记录
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 px-2.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:opacity-40 text-slate-600 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-600 font-mono">
              {currentPage} / {totalPages} 页
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 px-2.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:opacity-40 text-slate-600 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
