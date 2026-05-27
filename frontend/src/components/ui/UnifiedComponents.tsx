/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Database, AlertCircle, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

// ==========================================
// 1. PageHeader Component
// ==========================================
interface PageHeaderProps {
  idPrefix: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ idPrefix, title, description, actions }: PageHeaderProps) {
  return (
    <div 
      id={`${idPrefix}-header-container`}
      className="flex flex-col md:flex-row md:items-center md:justify-between py-5 border-b border-slate-200 bg-white px-6 rounded-b-2xl shadow-3xs mb-5"
    >
      <div id={`${idPrefix}-title-group`} className="space-y-1">
        <h1 
          id={`${idPrefix}-main-title`}
          className="text-xl font-bold text-slate-800 tracking-tight font-sans"
        >
          {title}
        </h1>
        {description && (
          <p 
            id={`${idPrefix}-header-desc`}
            className="text-xs text-slate-400 font-sans"
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div 
          id={`${idPrefix}-header-actions`}
          className="flex flex-wrap items-center gap-2 mt-4 md:mt-0"
        >
          {actions}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. FilterPanel Component
// ==========================================
interface FilterPanelProps {
  idPrefix: string;
  children: React.ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  searchLabel?: string;
  resetLabel?: string;
  extraActions?: React.ReactNode;
}

export function FilterPanel({
  idPrefix,
  children,
  onSearch,
  onReset,
  searchLabel = "查询 / 搜索",
  resetLabel = "重置",
  extraActions
}: FilterPanelProps) {
  return (
    <div 
      id={`${idPrefix}-filter-card`}
      className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-3xs hover:border-slate-300/80 transition-colors"
    >
      <div 
        id={`${idPrefix}-filter-inputs`}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end"
      >
        {children}
        
        {/* Buttons integrated aligned nicely */}
        <div 
          id={`${idPrefix}-filter-actions-col`}
          className="flex items-center gap-2 lg:col-span-1 mt-2 sm:mt-0 justify-end"
        >
          {onReset && (
            <button
              id={`${idPrefix}-btn-filter-reset`}
              type="button"
              onClick={onReset}
              className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
            >
              {resetLabel}
            </button>
          )}
          {onSearch && (
            <button
              id={`${idPrefix}-btn-filter-search`}
              type="button"
              onClick={onSearch}
              className="px-4.5 py-2 text-xs font-black text-white bg-[#006591] hover:bg-[#004e70] rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              {searchLabel}
            </button>
          )}
          {extraActions && (
            <div id={`${idPrefix}-filter-extra-actions`} className="flex items-center gap-2 border-l border-slate-200 pl-2">
              {extraActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. StatCard Component
// ==========================================
interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  highlightColor?: "indigo" | "rose" | "emerald" | "amber" | "sky" | "slate";
}

export function StatCard({
  id,
  title,
  value,
  description,
  icon,
  trend,
  highlightColor = "slate"
}: StatCardProps) {
  const highlightClasses = {
    indigo: "border-l-4 border-indigo-550",
    rose: "border-l-4 border-rose-500",
    emerald: "border-l-4 border-emerald-500",
    amber: "border-l-4 border-amber-500",
    sky: "border-l-4 border-sky-500",
    slate: "border-l-4 border-slate-350"
  };

  return (
    <div 
      id={id}
      className={`bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs flex justify-between items-start transition-all hover:shadow-2xs ${highlightClasses[highlightColor]}`}
    >
      <div className="space-y-1.5 flex-1 min-w-0">
        <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider truncate">
          {title}
        </span>
        <span className="text-xl font-black text-slate-800 block tracking-tight font-mono truncate">
          {value}
        </span>
        
        {description && (
          <p className="text-[10px] text-slate-400 leading-relaxed truncate">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-1 mt-1 font-sans text-[10px] font-bold">
            {trend.direction === "up" && (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {trend.value}
              </span>
            )}
            {trend.direction === "down" && (
              <span className="text-rose-600 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> {trend.value}
              </span>
            )}
            {trend.direction === "neutral" && (
              <span className="text-slate-400">
                {trend.value}
              </span>
            )}
            <span className="text-slate-350 font-normal">环比上旬</span>
          </div>
        )}
      </div>
      
      {icon && (
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0 ml-3 shadow-3xs">
          {icon}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. StatusBadge Component
// ==========================================
interface StatusBadgeProps {
  id?: string;
  status: string;
}

export function StatusBadge({ id, status }: StatusBadgeProps) {
  const norm = (status || "").trim().toLowerCase();
  
  // Rule 1: 正常 / 已完成 -> 绿色
  // Rule 2: 待处理 / 待核对 -> 蓝色
  // Rule 3: 草稿 / 未开始 / 待确认 / 账期中 / 挂起 -> 灰色
  // Rule 4: 异常 / 差异 / 对不上 / 延误 -> 红色
  // Rule 5: 处理中 / 部分完成 / 拨付中 -> 橙色
  // Rule 6: 已取消 / 已作废 -> 灰色

  let bg = "bg-slate-100 text-slate-550 border-slate-205";
  let label = status;

  if (
    norm.includes("正常") || 
    norm.includes("已完成") || 
    norm.includes("正常") || 
    norm.includes("已过账") || 
    norm.includes("成功") || 
    norm.includes("已审核") || 
    norm.includes("正常到货") || 
    norm.includes("无差异") || 
    norm.includes("已结清")
  ) {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-150";
  } else if (
    norm.includes("待处理") || 
    norm.includes("待核对") || 
    norm.includes("核对中") || 
    norm.includes("处理中") ||
    norm.includes("待复核") || 
    norm.includes("进行中") || 
    norm.includes("待核") ||
    norm.includes("有待结清")
  ) {
    bg = "bg-sky-50 text-sky-700 border-sky-150";
  } else if (
    norm.includes("部分完成") || 
    norm.includes("调退中") || 
    norm.includes("部分到货") || 
    norm.includes("审核中") ||
    norm.includes("待回执") || 
    norm.includes("拨付中")
  ) {
    bg = "bg-amber-50 text-amber-700 border-amber-150";
  } else if (
    norm.includes("异常") || 
    norm.includes("差异") || 
    norm.includes("未对齐") || 
    norm.includes("对不上") || 
    norm.includes("超时") || 
    norm.includes("错配") || 
    norm.includes("延误") || 
    norm.includes("失败") || 
    norm.includes("报警") || 
    norm.includes("驳回") || 
    norm.includes("拒绝")
  ) {
    bg = "bg-rose-50 text-rose-700 border-rose-150";
  } else if (
    norm.includes("草稿") || 
    norm.includes("未开始") || 
    norm.includes("待确认") || 
    norm.includes("已取消") || 
    norm.includes("已作废") || 
    norm.includes("作废") || 
    norm.includes("关闭") || 
    norm.includes("挂起")
  ) {
    bg = "bg-slate-100 text-slate-500 border-slate-200";
  }

  return (
    <span 
      id={id}
      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border inline-flex items-center gap-1 font-sans ${bg}`}
    >
      <span className="w-1.2 h-1.2 rounded-full bg-current opacity-70" />
      <span>{label}</span>
    </span>
  );
}

// ==========================================
// 5. AmountText Component
// ==========================================
interface AmountTextProps {
  id?: string;
  amount: number | string;
  prefix?: string;
  showColor?: boolean;
  type?: "income" | "expense" | "bold-neutral";
}

export function AmountText({ id, amount, prefix = "¥", showColor = false, type }: AmountTextProps) {
  const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  const formatted = num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let color = "text-slate-700 font-bold";

  if (showColor || type) {
    if (type === "income" || (!type && num > 0)) {
      color = "text-emerald-600 font-extrabold";
    } else if (type === "expense" || (!type && num < 0)) {
      color = "text-rose-600 font-extrabold";
    }
  }

  if (type === "bold-neutral") {
    color = "text-slate-900 font-black";
  }

  return (
    <span id={id} className={`font-mono ${color}`}>
      {prefix}{formatted}
    </span>
  );
}

// ==========================================
// 6. AppDrawer Component
// ==========================================
interface AppDrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  widthClass?: string; // default "max-w-xl"
  hasUnsavedChanges?: boolean;
}

export function AppDrawer({
  id,
  isOpen,
  onClose,
  title,
  description,
  children,
  footerActions,
  widthClass = "max-w-xl",
  hasUnsavedChanges = false
}: AppDrawerProps) {
  
  const handleOverlayClick = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("您有未保存的内容，确认关闭吗？")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleCloseButton = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("您有未保存的内容，确认关闭吗？")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={id} className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Black glass overlay back-screen */}
          <motion.div
            id={`${id}-overlay`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={handleOverlayClick}
          />

          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <motion.div
              id={`${id}-content-panel`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className={`w-screen ${widthClass} bg-white shadow-2xl border-l border-slate-150 flex flex-col justify-between`}
            >
              {/* Header */}
              <div id={`${id}-header`} className="px-5.5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 select-none">
                <div>
                  <h3 id={`${id}-title`} className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    {title}
                  </h3>
                  {description && (
                    <p id={`${id}-desc`} className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  id={`${id}-close-btn`}
                  type="button"
                  onClick={handleCloseButton}
                  className="p-1.5 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer hover:bg-slate-150 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body inside panel */}
              <div id={`${id}-scrollable-body`} className="flex-grow overflow-y-auto p-5.5 space-y-5">
                {children}
              </div>

              {/* Bottom footer operations bar */}
              <div id={`${id}-footer`} className="px-5.5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3 font-semibold text-xs shrink-0">
                <button
                  id={`${id}-footer-btn-cancel`}
                  type="button"
                  onClick={handleCloseButton}
                  className="px-4.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-550 rounded-lg transition-all cursor-pointer"
                >
                  取消
                </button>
                {footerActions}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 7. EmptyState Component
// ==========================================
interface EmptyStateProps {
  id?: string;
  message?: string;
}

export function EmptyState({ id, message = "暂无相关匹配数据项" }: EmptyStateProps) {
  return (
    <div 
      id={id}
      className="py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center select-none"
    >
      <Database className="w-8 h-8 text-slate-300 mb-2 animate-bounce-slow" />
      <span className="text-xs font-bold text-slate-400 font-sans">
        {message}
      </span>
    </div>
  );
}

// ==========================================
// 8. LoadingState Component
// ==========================================
interface LoadingStateProps {
  id?: string;
  message?: string;
}

export function LoadingState({ id, message = "数据流正在获取载入中..." }: LoadingStateProps) {
  return (
    <div 
      id={id}
      className="py-16 text-center text-slate-400 font-bold select-none text-xs font-sans flex flex-col items-center justify-center space-y-2.5"
    >
      <Loader2 className="w-7 h-7 text-[#006591] animate-spin" />
      <span>{message}</span>
    </div>
  );
}
