/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Search, Filter, ShieldAlert, CheckCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, FileSpreadsheet, RefreshCw, BarChart2
} from "lucide-react";

interface AbnormalRefundStyle {
  id: string;
  styleNo: string;
  name: string;
  category: string;
  weeklyRefundCount: number;
  weeklyTotalOrderCount: number;
  refundRate: number; // e.g. weeklyRefundCount / weeklyTotalOrderCount %
  majorReturnReason: string;
  assignedAction: "已下架停推广" | "已安排微信品控督办" | "正常动销监控";
  assignedActionTheme: string;
}

export default function AbnormalRefundsPage() {
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [refundStyles, setRefundStyles] = useState<AbnormalRefundStyle[]>([
    { id: "REF-001", styleNo: "LN-2026-BL", name: "精装防惊跳有机四季舒适睡袋", category: "婴儿睡袋防前倾", weeklyRefundCount: 540, weeklyTotalOrderCount: 1200, refundRate: 45.0, majorReturnReason: "拉链接缝处摩擦婴儿娇嫩面部，易产生红痕，客诉猛烈", assignedAction: "已下架停推广", assignedActionTheme: "bg-red-50 text-red-600 border-red-100" },
    { id: "REF-002", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服 (夏末透气款)", category: "细针织爬服衫款", weeklyRefundCount: 880, weeklyTotalOrderCount: 2500, refundRate: 35.2, majorReturnReason: "洗涤温水搅拌后严重缩水变形超两个码，尺码偏小", assignedAction: "已安排微信品控督办", assignedActionTheme: "bg-amber-50 text-amber-600 border-amber-100" },
    { id: "REF-003", styleNo: "LN-2026-SO", name: "防勒松口精梳棉新生儿短口袜 3 双装", category: "婴童袜套3对组", weeklyRefundCount: 140, weeklyTotalOrderCount: 1540, refundRate: 9.1, majorReturnReason: "松口偶尔易滑脱，偶有针脚多余线结顶坏脚底", assignedAction: "正常动销监控", assignedActionTheme: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { id: "REF-004", styleNo: "LN-2026-BA", name: "竹纤维空气褶皱超软两用睡抱被", category: "抱被巾套件组", weeklyRefundCount: 22, weeklyTotalOrderCount: 80, refundRate: 27.5, majorReturnReason: "洗前异味刺鼻，部分包装袋密封引起尘螨过敏", assignedAction: "已安排微信品控督办", assignedActionTheme: "bg-amber-50 text-amber-600 border-amber-100" }
  ]);

  const handleSyncDouyinRefunds = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("🟢【兴趣扣退云端接口同步】\n已完成抖音小店专营系统与物理仓退换明细的双全校验！24小时内的 431 笔多端退退款已映射。");
    }, 1200);
  };

  const filtered = refundStyles.filter(r => {
    const q = search.toLowerCase();
    return r.styleNo.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.majorReturnReason.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Title control header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-950 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#006591]" />
            全网高退货/异常退款商品监控卡 (GMV极速核对)
          </h1>
          <p className="text-xs text-slate-505 mt-1">
            针对女童装行业“买一退多”高退货环境建立，定位高退款款号，控制带货运营推广额，最大化避免空转损。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncDouyinRefunds}
            disabled={syncing}
            className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "抖音售后接口流式提取中..." : "与抖音飞鸽接口同步"}</span>
          </button>
        </div>
      </div>

      {/* Grid: 3 summary indicators specific for LenaKids refund environment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start space-x-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-rose-505 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-rose-900 block">高居不下的退款剪刀差 (约68%退款率)</span>
            <p className="text-[10px] text-rose-700 mt-1 font-semibold leading-relaxed">
              年 GMV 5亿，实收 GSV 1.6亿！中间大部分为“尺码错穿、多买测试”引起的即时发货前/发货后退款。
            </p>
          </div>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-start space-x-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-505 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-amber-900 block">尺码偏小退款集中区</span>
            <p className="text-[10px] text-amber-700 mt-1 font-semibold leading-relaxed">
              由于3-14岁女童发育跨度大，领跑客诉的 1 级因素是“尺码不准”。版型纸样需要随时纠偏。
            </p>
          </div>
        </div>
        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 flex items-start space-x-3 shadow-2xs">
          <BarChart2 className="w-5 h-5 text-[#006591] mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-sky-900 block">全网售后客诉联动底核</span>
            <p className="text-[10px] text-sky-700 mt-1 font-semibold leading-relaxed">
              确认由工厂生产疵点引起的违约金，客诉专员核定后直接联动供应商对账系统作同账扣。
            </p>
          </div>
        </div>
      </div>

      {/* Filter and query */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="全文过滤款型款款号底 (LN-*)、高危退款遭遇、特定解决标志..."
            className="w-full bg-white border border-slate-205 rounded-lg py-2.5 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
            <tr>
              <th className="p-4">受检 ID</th>
              <th className="p-4">企划款号</th>
              <th className="p-4 font-black">故障款式名称</th>
              <th className="p-4">服饰大项</th>
              <th className="p-4 text-center">本周退换笔数</th>
              <th className="p-4 text-center">本周预发订单量</th>
              <th className="p-4 text-center font-black">综合退款比率</th>
              <th className="p-4">主攻退款异议细节</th>
              <th className="p-4">理赔决策状态</th>
              <th className="p-4 text-right">处置方案</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/20">
                <td className="p-4 font-mono font-bold text-slate-405">{r.id}</td>
                <td className="p-4 font-mono font-black text-slate-900">{r.styleNo}</td>
                <td className="p-4 font-black text-slate-805">{r.name}</td>
                <td className="p-4 font-bold text-slate-500">{r.category}</td>
                <td className="p-4 text-center font-mono font-bold text-rose-500">{r.weeklyRefundCount.toLocaleString()} 笔</td>
                <td className="p-4 text-center font-mono font-bold text-slate-600">{r.weeklyTotalOrderCount.toLocaleString()} 笔</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-black ${
                    r.refundRate >= 35 ? "bg-red-100 text-red-655 font-black animate-pulse" :
                    r.refundRate >= 20 ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {r.refundRate.toFixed(1)}%
                  </span>
                </td>
                <td className="p-4 select-text max-w-sm font-medium leading-relaxed italic text-slate-600">"{r.majorReturnReason}"</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${r.assignedActionTheme}`}>
                    {r.assignedAction}
                  </span>
                </td>
                <td className="p-4 text-right select-none">
                  {r.refundRate >= 30 ? (
                    <button 
                      onClick={() => {
                        alert(`已下达【抖音停推控制】！系统已通过对接的抖音开放平台直连将该老款款号 [${r.styleNo}] 从本阶段达人带货白名单强制下挂。`);
                        setRefundStyles(prev => prev.map(item => item.id === r.id ? { ...item, assignedAction: "已下架停推广", assignedActionTheme: "bg-red-50 text-red-600 border-red-100" } : item));
                      }}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9.5px] font-bold cursor-pointer transition-colors"
                    >
                      下架控流
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert(`已下达【微品品质督办】！已自动向驻厂质检组下发整改通知书。`)}
                      className="px-2.5 py-1 bg-[#002045] hover:bg-slate-800 text-white rounded-lg text-[9.5px] font-bold cursor-pointer transition-colors"
                    >
                      微理督办
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
