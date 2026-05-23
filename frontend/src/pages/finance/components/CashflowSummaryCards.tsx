/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Landmark, ArrowUpRight, ArrowDownLeft, ShieldAlert, FolderMinus, Calculator } from "lucide-react";
import { CashflowSummary } from "@shared/types";

interface CashflowSummaryCardsProps {
  summary: CashflowSummary;
}

export default function CashflowSummaryCards({ summary }: CashflowSummaryCardsProps) {
  const cards = [
    {
      label: "期初账户余额",
      value: `¥${summary.openingBalance.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      desc: "历史预设期初合并总准备金",
      icon: <Landmark className="w-5 h-5 text-slate-400" />,
      color: "border-slate-200"
    },
    {
      label: "本期收入总计",
      value: `¥${summary.periodIncome.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      desc: "筛选区间已清算直营/回账总计",
      icon: <ArrowUpRight className="w-5 h-5 text-emerald-500" />,
      color: "border-emerald-250 bg-emerald-50/10"
    },
    {
      label: "本期支出总计",
      value: `¥${summary.periodExpense.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      desc: "筛选区间已完成支付与成本款项",
      icon: <ArrowDownLeft className="w-5 h-5 text-rose-500" />,
      color: "border-rose-150 bg-rose-50/10"
    },
    {
      label: "期末可用余额",
      value: `¥${summary.closingBalance.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      desc: "期初 + 累计收入 - 累计支出",
      icon: <Calculator className="w-5 h-5 text-sky-500" />,
      color: "border-sky-200 bg-sky-50/10"
    },
    {
      label: "未确认流水分额",
      value: `¥${summary.unconfirmedAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      desc: "处于「草稿」状态未过账金额",
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      color: "border-amber-200 bg-amber-50/15"
    },
    {
      label: "未归类交易笔数",
      value: `${summary.unclassifiedCount} 笔`,
      desc: "需跟进分类匹配的模糊记录",
      icon: <FolderMinus className="w-5 h-5 text-indigo-400" />,
      color: "border-slate-200 bg-slate-50/30"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white border rounded-xl p-4 flex flex-col justify-between shadow-2xs transition-all hover:shadow-xs ${card.color}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-tight uppercase">
              {card.label}
            </span>
            <div className="p-1 px-1.5 bg-slate-50 rounded-lg">
              {card.icon}
            </div>
          </div>
          <div>
            <span className="text-base md:text-lg font-black font-mono text-slate-800 tracking-tight block">
              {card.value}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1 line-clamp-1">
              {card.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
