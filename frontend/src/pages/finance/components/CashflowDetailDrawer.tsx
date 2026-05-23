/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Calendar, User, FileText, CheckCircle, Info, Paperclip, Clock, Lock } from "lucide-react";
import { CashflowRecord } from "@shared/types";

interface CashflowDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: CashflowRecord | null;
}

export default function CashflowDetailDrawer({ isOpen, onClose, record }: CashflowDetailDrawerProps) {
  if (!isOpen || !record) return null;

  const isDraft = record.status === "draft";
  const isConfirmed = record.status === "confirmed";
  const isLocked = record.status === "locked";

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 mb-3 mt-5">
      {icon}
      <span className="text-[11px] font-bold text-[#002045] uppercase tracking-wide">{title}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-5 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest block">流动流明细节</span>
              <h3 className="text-sm font-bold text-[#002045] mt-0.5">
                流水详情 
                <span className="ml-2 font-mono font-medium text-slate-400">({record.id})</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer hover:bg-slate-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details body */}
          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            
            {/* Direction and Amount display */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">本笔出纳金额</span>
              <span className={`text-2xl font-black font-mono block ${
                record.direction === "income" 
                ? "text-emerald-600" 
                : record.direction === "expense" 
                ? "text-rose-600" 
                : "text-indigo-600"
              }`}>
                {record.direction === "expense" ? "-" : ""}{record.amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="inline-flex mt-1">
                {record.direction === "income" && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-55/20 rounded">账户收入流入</span>
                )}
                {record.direction === "expense" && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-rose-600 bg-rose-55/25 rounded">账户支出流出</span>
                )}
                {record.direction === "transfer" && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-55/25 rounded">内部资金调拨划配</span>
                )}
              </div>
            </div>

            {/* Status banners */}
            <div className="flex items-center space-x-2 py-1.5 justify-center">
              <span className="text-xs font-bold text-slate-400">核对状态:</span>
              {isDraft && (
                <span className="px-3 py-0.8 bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200 rounded-full">
                  草稿记录中
                </span>
              )}
              {isConfirmed && (
                <span className="px-3 py-0.8 bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-200 rounded-full flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>已出纳过账</span>
                </span>
              )}
              {isLocked && (
                <span className="px-3 py-0.8 bg-sky-50 text-indigo-600 text-[11px] font-bold border border-sky-150 rounded-full flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>月度月结存档 (封存)</span>
                </span>
              )}
            </div>

            {/* Basic metadata fields */}
            {renderSectionHeader("基本记账指标", <Info className="w-3.5 h-3.5 text-[#006591]" />)}
            <div className="space-y-3.5 text-xs text-slate-600 pl-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">流水发生日期:</span>
                <span className="font-bold font-mono text-slate-800">{record.transactionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">涉及关联账户:</span>
                <span className="font-bold text-slate-800">{record.accountName} <span className="font-mono text-[10px] text-slate-400">({record.accountId})</span></span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">会计科目归档:</span>
                <span className="font-bold text-slate-800">{record.categoryName} <span className="font-mono text-[10px] text-slate-400">({record.categoryId || "None"})</span></span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">交易户名(对手):</span>
                <span className="font-bold text-slate-800">{record.counterparty || "（不适用）"}</span>
              </div>
            </div>

            {/* Content summary */}
            {renderSectionHeader("业务背景描述及备注", <FileText className="w-3.5 h-3.5 text-[#006591]" />)}
            <div className="space-y-3 text-xs pl-1">
              <div>
                <span className="font-semibold text-slate-400 block mb-1">主要业务摘要:</span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 leading-relaxed font-semibold">
                  {record.summary}
                </p>
              </div>
              {record.remark && (
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">内部备注细则:</span>
                  <p className="p-3 bg-[#fafafa] border border-slate-100 rounded-lg text-slate-600 leading-relaxed italic">
                    {record.remark}
                  </p>
                </div>
              )}
            </div>

            {/* Attachments */}
            {renderSectionHeader("账款电子凭证", <Paperclip className="w-3.5 h-3.5 text-[#006591]" />)}
            <div className="pl-1 text-xs">
              {record.hasAttachment ? (
                <div className="flex items-center space-x-2 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-[#006591] transition-all cursor-pointer">
                  <Paperclip className="w-4 h-4 text-[#006591]" />
                  <div className="overflow-hidden">
                    <span className="block font-bold text-slate-700 truncate text-[11px]">LENA_CASHFLOW_VOUCHER_{record.id.toUpperCase()}.PDF</span>
                    <span className="block text-[10px] text-slate-400">电子增值税专票 • PDF 文件 • 248.5 KB</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px]">未上传发票或银行水单附件。可点击编辑增补贴附凭证。</p>
              )}
            </div>

            {/* Operation audits logs */}
            {renderSectionHeader("系统核实及审计操作记录", <Clock className="w-3.5 h-3.5 text-[#006591]" />)}
            <div className="pl-1 space-y-4">
              <div className="relative border-l-2 border-slate-150 pl-4.5 pb-2.5 space-y-1">
                {/* Milestone 1: Created */}
                <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border bg-white border-slate-350" />
                <span className="text-[10px] text-slate-400 font-bold block">
                  创建于: {new Date(record.createdAt).toLocaleString("zh-CN")}
                </span>
                <span className="text-[11px] font-bold text-slate-600 flex items-center">
                  <User className="w-3 h-3 text-slate-400 mr-1" />
                  <span>流程经办人: {record.operator}</span>
                </span>
              </div>

              {/* Milestone 2: Confirmed */}
              {record.confirmedAt && (
                <div className="relative border-l-2 border-slate-150 pl-4.5 pb-2.5 space-y-1">
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border bg-white border-emerald-500" />
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    出纳审核确认于: {new Date(record.confirmedAt).toLocaleString("zh-CN")}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    标记为对账确认过账，归入本期可用统计资产。
                  </span>
                </div>
              )}

              {/* Milestone 3: Locked */}
              {record.lockedAt && (
                <div className="relative pl-4.5 space-y-1">
                  <div className="absolute -left-1 top-1.5 w-2.5 h-2.5 rounded-full border bg-white border-indigo-500" />
                  <span className="text-[10px] text-indigo-600 font-bold block">
                    月度账期封存归档于: {new Date(record.lockedAt).toLocaleString("zh-CN")}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-500 block">
                    该条记录已对账锁定归账，任何普通出纳账号或 AI 代理将不具备修改与移除权限。
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Footer close */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-150 hover:bg-slate-200 text-[#002045] mb-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              关闭
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
