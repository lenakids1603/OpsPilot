/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Truck, ShieldAlert, BadgeCheck, AlertTriangle, Landmark, Calendar, DollarSign,
  Plus, Search, Filter, ArrowUpRight, CheckCircle, RefreshCw, Layers
} from "lucide-react";

interface SupplierOverviewPageProps {
  defaultTab?: "overview" | "alerts";
}

export default function SupplierOverviewPage({ defaultTab = "overview" }: SupplierOverviewPageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "alerts">(defaultTab);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleSyncJushuitan = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("🟢【聚水潭采购协同中台】\n已经流式回接并校对多电商主仓的最新的采购到货入仓单，合并入库明细已写入最新账单明细！");
    }, 1200);
  };

  const overviewCards = [
    { label: "战略核心工厂总数", value: "32 家", change: "针织: 18 家 | 梭织: 14 家", color: "text-[#006591]", sub: "全部签署年度账单按季合规协议" },
    { label: "合并应付未付余额", value: "¥6,294,000", change: "其中逾期账期: ¥1,250,000", color: "text-[#0ea5e9]", sub: "抵扣退次与退换扣罚后的净应付" },
    { label: "已到货未核账到货明细", value: "48 批次", change: "涉及款号数: 24 款", color: "text-[#10b981]", sub: "需各主仓验货录单后进行入账登记" },
    { label: "异常延误采购出货", value: "4 批采购批", change: "待交期突破 48 小时限制", color: "text-rose-500", sub: "影响抖音大达人带货专场发货排期" }
  ];

  // Mock outstanding purchase orders with dispatch / incoming milestones from Jushuitan
  const timeoutPurchaseOrders = [
    { id: "PO-20260515-8120", factory: "海安莱那织造有限公司", product: "经典纯色精梳无骨爬服(夏末薄款)", qty: 2500, leadTime: "交期：2026-05-18", overdueDays: 4, level: "高级高危", levelTheme: "bg-red-50 text-red-600 border-red-100", doudianTarget: "抖音-[小美阿姨]专场" },
    { id: "PO-20260514-9901", factory: "织里丰盛婴童服饰厂", product: "甜美印花刺绣荷叶边吊带睡裙", qty: 1200, leadTime: "交期：2026-05-18", overdueDays: 4, level: "高级高危", levelTheme: "bg-red-50 text-red-600 border-red-100", doudianTarget: "抖音-[依依贝贝]店推" },
    { id: "PO-20260516-7782", factory: "常熟汇豪针织加工商行", product: "冰丝莫代尔轻薄透气纯口小裙", qty: 3000, leadTime: "交期：2026-05-20", overdueDays: 2, level: "中度警告", levelTheme: "bg-amber-50 text-amber-600 border-amber-100", doudianTarget: "天猫-[LenaKids]自推" },
    { id: "PO-20260517-1024", factory: "绍兴市柯桥轻纺顺福商贸印染店", product: "竹纤维泡褶空调抱被有机棉", qty: 800, leadTime: "交期：2026-05-21", overdueDays: 1, level: "常规提醒", levelTheme: "bg-blue-50 text-blue-600 border-blue-100", doudianTarget: "抖音-[莉娜臻选]带货" }
  ];

  return (
    <div className="space-y-6 select-text">
      
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-base md:text-lg font-black text-[#002045] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#006591]" />
            供应商数据分析与到货跟踪
          </h1>
          <p className="text-xs text-slate-500">
            对接聚水潭采购指令，实时研判交收账套与发运偏离，智能发出断码警并自动跟进工厂对账期与付款清账。
          </p>
        </div>

        <button
          onClick={handleSyncJushuitan}
          disabled={syncing}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#006591] hover:bg-[#004c6e] hover:shadow-2xs text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "聚水潭采购核单同步中..." : "极速接入聚水潭采购账单"}</span>
        </button>
      </div>

      {/* Primary KPI overview panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">{c.label}</div>
            <p className="text-lg font-black font-mono text-slate-900 mt-2">{c.value}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 text-[9.5px] font-semibold text-slate-500">
              <span className={c.color}>{c.change}</span>
              <span className="text-slate-400 font-normal">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs navigation list */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === "overview" 
              ? "border-[#006591] text-[#006591]" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          供应商到货时效看板
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-1.5 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === "alerts" 
              ? "border-[#006591] text-[#006591]" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <span>采购延误预警区</span>
          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-bold">4 个高危</span>
        </button>
      </div>

      {/* TAB 1: 到货时效及工厂账期统计 */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main factory summary list */}
          <div className="xl:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800">工厂到货排名及其本月清账账套 (32家工厂抽样)</span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">核算基期: 2026-05 至 2026-08</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "海安莱那织造有限公司", category: "针织专营", arrivalRate: 98.4, avgOverdue: "0.2天 (近乎准时)", term: "按月对账 / 月结30天", outstanding: 1450000 },
                { name: "织里佳琪制衣厂", category: "梭织工厂", arrivalRate: 95.2, avgOverdue: "1.1天", term: "货到即付全款 (5K内)", outstanding: 680000 },
                { name: "常熟汇豪针织加工商行", category: "辅料针线", arrivalRate: 88.0, avgOverdue: "2.8天", term: "季结90天 / 授信30万", outstanding: 1250000 },
                { name: "海宁市贝贝童装大卖部", category: "成衣精拼", arrivalRate: 92.5, avgOverdue: "1.5天", term: "按批次按批次结算", outstanding: 450000 },
                { name: "绍兴市柯桥轻纺顺福印染", category: "坯布印花", arrivalRate: 72.1, avgOverdue: "5.4天 (严重超时)", term: "现款现提 / 预付30%", outstanding: 250000 },
              ].map((fac, idx) => (
                <div key={idx} className="p-4 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition-colors block">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800 font-bold text-[12px]">{fac.name}</strong>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{fac.category}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        结算方式：<span className="text-slate-600 font-bold">{fac.term}</span> | 延迟到货平均：<span className={fac.arrivalRate < 80 ? "text-rose-500 font-bold" : "text-slate-655"}>{fac.avgOverdue}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4.5">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block">综合按时交期率</span>
                        <strong className={`font-mono text-xs font-black ${fac.arrivalRate >= 95 ? "text-emerald-500" : fac.arrivalRate >= 85 ? "text-amber-500" : "text-rose-500"}`}>{fac.arrivalRate}%</strong>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block">目前应付货款净额</span>
                        <strong className="font-mono text-slate-900 font-black">¥{fac.outstanding.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar: core supplier specifications */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs space-y-4">
            <span className="text-xs font-black text-slate-800 block border-b border-slate-100 pb-3">抖音返单备料原则 (30人办公室决策参考)</span>
            
            <div className="space-y-3 font-semibold text-slate-605 text-[10.5px] leading-relaxed">
              <div className="p-3.5 bg-sky-50 text-[#006591] rounded-lg border border-sky-100 space-y-1">
                <span className="text-xs font-bold block">1. 抖音爆仓 48 小时极速反弹机制</span>
                <p className="text-[10px] text-sky-700 font-medium">抖音达人带货易爆单，前置面料囤货不低于 50,000 米，主代工厂交期必须控制在 3-5 天内分批供货。</p>
              </div>

              <div className="p-3.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 space-y-1">
                <span className="text-xs font-bold block bg-transparent">2. 到货扣罚与验货核销规避</span>
                <p className="text-[10px] text-amber-700 font-medium">聚水潭检验到货不齐、辅料断货或者尺码大偏差，采购应当立即记录在供应商档案中，本月采购款直接予以同等抵扣。</p>
              </div>

              <div className="p-3.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-150 space-y-1">
                <span className="text-xs font-bold block text-slate-800">3. 合同对账合规约束</span>
                <p className="text-[10px] text-slate-500 font-medium">严禁任何未见聚水潭退/入库凭证的对私付款。代工厂法人银行卡必须对应档案开票信息才可登记付款凭单。</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: 采购超时预警 */}
      {activeTab === "alerts" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xs font-black text-slate-900">延期未到货采购 PO 指令明细 (来源于 聚水潭 系统偏离)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">到货严重偏离抖音开播排期，需驻厂品控或采购员在微信群紧密督办，防止违约退款发生</p>
            </div>
            <span className="px-2.5 py-0.5 bg-red-100 text-red-600 border border-red-200 rounded text-[9px] font-bold">4 批次预警中</span>
          </div>

          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold border-b border-slate-100 text-[10px]">
              <tr>
                <th className="p-4">采购 PO 单号</th>
                <th className="p-4">延期承接代工厂</th>
                <th className="p-4">延迟备货服装款名</th>
                <th className="p-4">采购指令数</th>
                <th className="p-4">额定到货交期</th>
                <th className="p-4">延误天数</th>
                <th className="p-4">承载直播排期</th>
                <th className="p-4">预警级别</th>
                <th className="p-4 text-center">催单操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
              {timeoutPurchaseOrders.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-[#002045]">{t.id}</td>
                  <td className="p-4 font-bold text-slate-900">{t.factory}</td>
                  <td className="p-4 font-medium text-slate-600">{t.product}</td>
                  <td className="p-4 font-mono font-bold">{t.qty.toLocaleString()} 件</td>
                  <td className="p-4 font-mono text-slate-500">{t.leadTime}</td>
                  <td className="p-4 font-mono text-rose-500 font-black">{t.overdueDays} 天</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] rounded font-bold">{t.doudianTarget}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-black border ${t.levelTheme}`}>
                      {t.level}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => alert(`驻单指令下达！系统已将超时催货工单推送给跟单员，微信协同群建立。`)}
                      className="px-2.5 py-1 bg-[#002045] text-white hover:bg-slate-800 text-[9.5px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      驻厂督办
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
