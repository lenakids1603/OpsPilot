/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, Layers, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { FundAccount, CashflowCategory } from "@shared/types";

export interface FilterParams {
  startDate: string;
  endDate: string;
  accountId: string;
  direction: string;
  categoryId: string;
  counterparty: string;
  status: string;
  hasAttachment: boolean | null;
  search: string;
  platform?: string;
  shop?: string;
}

interface CashflowFilterProps {
  accounts: FundAccount[];
  categories: CashflowCategory[];
  onSearch: (params: FilterParams) => void;
  value?: FilterParams;
}

export default function CashflowFilter({ accounts, categories, onSearch, value }: CashflowFilterProps) {
  const initialParams: FilterParams = {
    startDate: "",
    endDate: "",
    accountId: "",
    direction: "",
    categoryId: "",
    counterparty: "",
    status: "",
    hasAttachment: null,
    search: "",
    platform: "all",
    shop: "all"
  };

  const [params, setParams] = useState<FilterParams>(initialParams);
  const [collapsed, setCollapsed] = useState(false);

  // Sync internal state with incoming parent updates
  useEffect(() => {
    if (value) {
      setParams(value);
    }
  }, [value]);

  const handleApply = () => {
    onSearch({ ...params });
  };

  const handleReset = () => {
    setParams(initialParams);
    onSearch(initialParams);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Header bar and search switch */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#006591]" />
          <span className="text-xs font-bold text-[#002045]">资金流水精细化全局检索</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center space-x-1 cursor-pointer"
        >
          <span>{collapsed ? "展开检索参数" : "基本收起"}</span>
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Field: Keyword Search */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">关键词综合模糊匹配</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={params.search}
                  onChange={(e) => setParams({ ...params, search: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white resize-none"
                  placeholder="检索摘要、内部备注、批号..."
                />
              </div>
            </div>

            {/* Field: Fund Accounts */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">结算资金收发账户</label>
              <select
                value={params.accountId}
                onChange={(e) => setParams({ ...params, accountId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white cursor-pointer"
              >
                <option value="">全部资金账户</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} (余额: ¥{acc.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {/* Field: Flow Direction */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">收支运作方向</label>
              <select
                value={params.direction}
                onChange={(e) => {
                  const val = e.target.value;
                  setParams({ ...params, direction: val, categoryId: "" }); // Reset category upon direction change to avoid misplacement
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white cursor-pointer"
              >
                <option value="">全部运作方向</option>
                <option value="income">收入 (+)</option>
                <option value="expense">支出 (-)</option>
                <option value="transfer">账户划拨转账 (•)</option>
              </select>
            </div>

            {/* Field: Match classifications */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">流水科目归类</label>
              <select
                value={params.categoryId}
                onChange={(e) => setParams({ ...params, categoryId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white cursor-pointer"
                disabled={params.direction === "transfer"} // Transfers are auto-categorized usually
              >
                <option value="">全部科目分类</option>
                {categories
                  .filter(cat => !params.direction || cat.direction === params.direction)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>

            {/* Field: Transacting Target */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">交易对象 / 对方户名</label>
              <input
                type="text"
                value={params.counterparty}
                onChange={(e) => setParams({ ...params, counterparty: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                placeholder="对方公司、员工或承运商..."
              />
            </div>

            {/* Field: Flow Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">财务入账对账状态</label>
              <select
                value={params.status}
                onChange={(e) => setParams({ ...params, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white cursor-pointer"
              >
                <option value="">全部状态</option>
                <option value="draft">草稿记录</option>
                <option value="confirmed">出纳已确认 / 待归档</option>
                <option value="locked">月结已归档锁定</option>
              </select>
            </div>

            {/* Field: Date Range */}
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">流水发生区间</label>
              <div className="flex items-center space-x-1">
                <input
                  type="date"
                  value={params.startDate}
                  onChange={(e) => setParams({ ...params, startDate: e.target.value })}
                  className="w-1/2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] cursor-pointer"
                />
                <span className="text-slate-300 font-bold font-mono text-center px-1">至</span>
                <input
                  type="date"
                  value={params.endDate}
                  onChange={(e) => setParams({ ...params, endDate: e.target.value })}
                  className="w-1/2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] cursor-pointer"
                />
              </div>
            </div>

            {/* Field: Attachment Indicator */}
            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.hasAttachment === true}
                  onChange={(e) => setParams({ ...params, hasAttachment: e.target.checked ? true : null })}
                  className="w-4 h-4 text-[#006591] bg-slate-100 border-slate-300 rounded-sm focus:ring-[#006591] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600">仅筛选含电子凭证附件</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end items-center space-x-3 pt-3.5 border-t border-slate-100">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>清空参数</span>
            </button>
            <button
              onClick={handleApply}
              className="flex items-center space-x-1.5 px-6 py-2 bg-[#006591] hover:bg-[#004c6e] active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>快速查询</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
