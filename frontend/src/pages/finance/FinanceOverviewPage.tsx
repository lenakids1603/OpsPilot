/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  DollarSign, ShieldAlert, Award, Landmark, Wallet, AlertCircle, ArrowUpRight, ArrowDownRight,
  TrendingUp, RefreshCw, Layers, CheckCircle, ChevronRight, Ban
} from "lucide-react";

export default function FinanceOverviewPage() {
  const [activeSegment, setActiveSegment] = useState("all");

  // Multi-proprietor overview cards
  const summaryCards = [
    { label: "自持合并现金资产", value: "¥18,348,000", change: "其中公账: ¥4,200,000", icon: <Wallet className="w-4 h-4 text-sky-500" />, sub: "32 家个体户对公/法民银行账户" },
    { label: "本年总计过账流入", value: "¥42,895,400", change: "同比去年: +15.8%", icon: <ArrowUpRight className="w-4 h-4 text-emerald-500" />, sub: "不计退款返还实收金额" },
    { label: "本年累计采购支付", value: "¥28,421,000", change: "占总支出: 68.2%", icon: <ArrowDownRight className="w-4 h-4 text-rose-500" />, sub: "代工厂货款、订金结算" },
    { label: "个体主体安全红线", value: "32家 / 30家正常", change: "2家暂停收款、限流", icon: <ShieldAlert className="w-4 h-4 text-rose-500" />, sub: "单体控额: ¥5,000,000/年" },
  ];

  // Proprietor lists - 90% GMV is via Douyin, each small entity needs to keep water < 5M/year
  const proprietors = [
    { id: "P-101", name: "义乌市乐娜商贸部", legal: "陈*娜", annualSales: 4894300, monthSales: 412000, status: "临期高危", statusTheme: "bg-red-50 text-red-600 border-red-100", quotaUsed: 97.8, mainDoudian: "抖音-莱米特童装店", bankCount: 2 },
    { id: "P-102", name: "温岭市依依童装店", legal: "沈*英", annualSales: 5092000, monthSales: 12000, status: "已被阻断", statusTheme: "bg-rose-500 text-white border-rose-600", quotaUsed: 101.8, mainDoudian: "抖音-旗舰精选", bankCount: 1 },
    { id: "P-103", name: "杭州仓前顺福童装网店", legal: "郑*华", annualSales: 4520300, monthSales: 389000, status: "临期警告", statusTheme: "bg-amber-50 text-amber-655 border-amber-200", quotaUsed: 90.4, mainDoudian: "抖音-莉娜臻选", bankCount: 2 },
    { id: "P-104", name: "织里佳琪制衣厂", legal: "朱*荣", annualSales: 3120000, monthSales: 345000, status: "使用中", statusTheme: "bg-emerald-50 text-emerald-600 border-emerald-150", quotaUsed: 62.4, mainDoudian: "淘宝-LenaKids小铺", bankCount: 3 },
    { id: "P-105", name: "临海市琪琪服饰部", legal: "李*华", annualSales: 2190000, monthSales: 420000, status: "使用中", statusTheme: "bg-emerald-50 text-emerald-600 border-emerald-150", quotaUsed: 43.8, mainDoudian: "抖音-爆款特卖", bankCount: 2 },
    { id: "P-106", name: "常熟中豪电商商行", legal: "顾*明", annualSales: 890000, monthSales: 154000, status: "使用中", statusTheme: "bg-emerald-50 text-emerald-600 border-emerald-150", quotaUsed: 17.8, mainDoudian: "拼多多-特惠组", bankCount: 1 },
    { id: "P-107", name: "温州卡服商贸有限公司", legal: "林*海", annualSales: 48000, monthSales: 0, status: "暂停中", statusTheme: "bg-slate-100 text-slate-500 border-slate-200", quotaUsed: 0.9, mainDoudian: "暂缺", bankCount: 1 },
  ];

  const filteredProprietors = proprietors.filter(p => {
    if (activeSegment === "all") return true;
    if (activeSegment === "active") return p.status === "使用中";
    if (activeSegment === "warning") return p.status.includes("临期") || p.status.includes("高危") || p.status.includes("警告");
    if (activeSegment === "blocked") return p.status.includes("阻断") || p.status === "暂停中";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h1 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[#006591]" />
          财务控制与多主体账户概览
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          专为 30 余家分散个体主体设计的流水分摊与 500 万内免税红线预警。控制流水分流并对大额预警做紧急叫停。
        </p>
      </div>

      {/* Grid: 4 Aggregate Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
              <span>{c.label}</span>
              {c.icon}
            </div>
            <p className="text-lg font-black font-mono text-slate-800">{c.value}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 text-[10px] font-semibold text-slate-500">
              <span className="text-slate-800">{c.change}</span>
              <span className="text-slate-400 font-normal">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: Proprietor listings (2/3 width) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-105 pb-4 mb-4">
            <div>
              <h2 className="text-xs font-black text-slate-900">个体户收款红线监控 (按年度流水防税红线排查)</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">年限 500 万流水人民币，接近 70% 警告，接近 90% 限流，达到 100% 必须拉黑关账</p>
            </div>
            
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 mt-2 sm:mt-0">
              {[
                { tag: "all", label: "全部主体" },
                { tag: "active", label: "活跃收款中" },
                { tag: "warning", label: "额度告急" },
                { tag: "blocked", label: "封锁/关闭" },
              ].map(tab => (
                <button
                  key={tab.tag}
                  onClick={() => setActiveSegment(tab.tag)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                    activeSegment === tab.tag 
                      ? "bg-white text-[#006591] shadow-xs" 
                      : "text-slate-450 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">主体商号/法人</th>
                  <th className="py-2.5">绑定抖音/天猫店</th>
                  <th className="py-2.5">银行账户</th>
                  <th className="py-2.5">年度累计流水</th>
                  <th className="py-2.5 text-center">使用进度 (上限500万)</th>
                  <th className="py-2.5">当前状态</th>
                  <th className="py-2.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredProprietors.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/40">
                    <td className="py-3.5">
                      <p className="font-bold text-slate-900 text-[11.5px]">{p.name}</p>
                      <span className="text-[9px] text-slate-400 font-mono">法人：{p.legal} | 统一代码 #{p.id}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{p.mainDoudian}</span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono">{p.bankCount} 张挂载卡</td>
                    <td className="py-3.5 text-slate-905 font-mono font-black">¥{p.annualSales.toLocaleString()}</td>
                    <td className="py-3.5">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-mono font-black ${
                          p.quotaUsed >= 100 ? "text-red-600 animate-pulse" : p.quotaUsed >= 90 ? "text-red-500" : "text-emerald-500"
                        }`}>{p.quotaUsed}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              p.quotaUsed >= 100 ? "bg-red-600" : p.quotaUsed >= 90 ? "bg-amber-400" : "bg-emerald-400"
                            }`} 
                            style={{ width: `${Math.min(100, p.quotaUsed)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${p.statusTheme}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => alert(`【主体配置】已提取主体 [${p.name}] 对应资质文档，本月收款流水分派比重已锁定。`)}
                        className="text-[10px] text-[#006591] hover:text-[#005175] font-black cursor-pointer"
                      >
                        额度调配
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Bank accounts & warnings sidebar (1/3 width) */}
        <div className="space-y-6">
          
          {/* Recent account balances */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">重点银行账户资产分布</h3>
              <span className="text-[10px] font-bold text-slate-450">共 32 户在线</span>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "中国建设银行 - 义乌商贸支行", owner: "义乌乐娜", amount: "¥4,210,000", type: "主力公账" },
                { name: "网商银行 - 抖店回款专户 01", owner: "依依国贸", amount: "¥5,890,200", type: "快速收款" },
                { name: "泰隆商业银行 - 常熟童装部", owner: "常熟中豪", amount: "¥2,150,000", type: "供应商打款" },
                { name: "中国农业银行 - 温岭支行", owner: "温岭依依", amount: "¥1,890,000", type: "储备储备金" },
                { name: "微信商户自扣保证金暂留户", owner: "公司自持", amount: "¥2,400,000", type: "冻结储备" },
              ].map((acc, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 rounded-lg space-y-1 block border border-slate-150">
                  <div className="flex justify-between items-start">
                    <span className="text-[10.5px] font-bold text-slate-800 truncate max-w-[70%]">{acc.name}</span>
                    <span className="px-1.5 py-0.5 bg-slate-150 text-slate-600 rounded text-[8px] font-bold uppercase">{acc.type}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[10px] text-slate-400">持卡人：{acc.owner}</span>
                    <span className="text-xs font-black font-mono text-slate-800">{acc.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick instructions on how LenaKids handles tax */}
          <div className="bg-amber-500/5 text-amber-800 border border-amber-200/50 rounded-xl p-4.5 space-y-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-505" />
              个体户 500 万流水合规操作规范
            </span>
            <ul className="text-[10px] space-y-2 leading-relaxed font-semibold text-slate-600 pl-4 list-disc">
              <li>一旦某主体年度过账突破 <strong className="text-rose-600">¥4,800,000</strong>，财务后台应立马触发阻断，将其从抖店绑定的资金回笼对公彻底撤下。</li>
              <li>新增主体必须在 24 小时内向公司法务群组上传法人身份证、印章等对数备案扫描件。</li>
              <li>每个月付款给供应商前，必须强制让其开出增值税发票，或者由公司统一从该收款主体做进项票核销。</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
