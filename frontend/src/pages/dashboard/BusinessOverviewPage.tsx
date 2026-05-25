/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, AlertTriangle, Clock, ShieldAlert, DollarSign, ArrowUpRight, ArrowDownRight, 
  Wallet, ListTodo, ChevronRight, Activity, ShoppingBag, Layers, AlertCircle, RefreshCw, FileText
} from "lucide-react";

export default function BusinessOverviewPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Interactive Todos
  const [todos, setTodos] = useState([
    { id: 1, text: "核对【盛大织造】4月份账单，存在 1.2M 差异额需查明", category: "财务", dueDate: "今天 18:00", done: false },
    { id: 2, text: "杭州个体户【仓前顺福童装店】额度达 4.88M，紧急标记暂停收款", category: "主体", dueDate: "今天 12:00", done: true },
    { id: 3, text: "处理抖音客服投诉：款号 #2026KS08 质量破损率偏高", category: "客服", dueDate: "明天", done: false },
    { id: 4, text: "安排支付【温州卡比服饰】本周货款 ¥280,000", category: "供应商", dueDate: "2026-05-26", done: false },
    { id: 5, text: "导入昨日聚水潭售后退货及抖店销售销售单", category: "数据", dueDate: "已完成", done: true },
  ]);

  const handleToggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  // Mock data for the 12 core indicator cards
  const metrics = [
    { label: "今日销售额 (GMV)", value: "¥1,384,500", detail: "已支付 8,920 单", change: "+12.4%", isPositive: true, subtext: "抖音占比 91.2%" },
    { label: "今日退款额", value: "¥927,600", detail: "退款率约 67%", change: "+5.1%", isPositive: false, subtext: "主要为尺码与色差" },
    { label: "今日净销售额 (GSV)", value: "¥456,900", detail: "实际结算计入", change: "+18.2%", isPositive: true, subtext: "年度目标完成度 28%" },
    { label: "今日利润预估", value: "¥68,500", detail: "预估毛利率 15%", change: "+11.3%", isPositive: true, subtext: "已扣除推广及退货成本" },
    { label: "今日 / 本月现金收入", value: "¥432,000", detail: "本月: ¥13,820,000", icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />, isPositive: true, subtext: "公账对私账合并计算" },
    { label: "今日 / 本月现金支出", value: "¥315,000", detail: "本月: ¥11,140,500", icon: <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />, isPositive: false, subtext: "采购付货款占 65%" },
    { label: "净现金流 (本月)", value: "+¥2,679,500", detail: "上月: +¥1,950,000", change: "+37.4%", isPositive: true, subtext: "现金回流健康度良好" },
    { label: "现金账面余额", value: "¥18,348,000", detail: "32 个体户合计数", icon: <Wallet className="w-3.5 h-3.5 text-sky-500" />, isPositive: true, subtext: "其中抖音保证金 ¥2,400,000" },
    { label: "应付供应商款", value: "¥5,820,000", detail: "涉及 18 家主力厂商", icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />, isPositive: false, subtext: "本周到期 ¥1,240,000" },
    { label: "个体户额度预警", value: "4 个超标 / 告急", detail: "限额 500 万/年", badge: "危", badgeTheme: "bg-rose-500", subtext: "3个超 90%, 1个超 100%" },
    { label: "订单超时未发货", value: "148 单", detail: "超过 48 小时未履约", badge: "堵", badgeTheme: "bg-amber-500", subtext: "聚水潭延时同步或仓库缺货" },
    { label: "异常退款商品数", value: "8 款高退", detail: "退款率超过 85%", badge: "警", badgeTheme: "bg-rose-500", subtext: "主要集中在面料与染色变色" }
  ];

  // Raw mock list data
  const timeoutOrders = [
    { id: "O-910283", platform: "抖音", shop: "莉娜童装旗舰店", time: "52小时", sku: "2026KS08-粉色-120", qty: 2, status: "缺货中", supplier: "海宁贝贝服饰" },
    { id: "O-910304", platform: "淘宝", shop: "LenaKids小铺", time: "49小时", sku: "2026KS12-碎花五分裤-130", qty: 1, status: "备货中", supplier: "织里隆达童装" },
    { id: "O-910398", platform: "抖音", shop: "LenaKids精选店", time: "48.5小时", sku: "2026KS15-针织防晒衣-110", qty: 3, status: "面料延误", supplier: "温州卡比服饰" },
  ];

  const abnormalRefundProducts = [
    { code: "2026KS08", name: "女童防蚊裤（夏款冰丝）", refundRate: "89.2%", refundQty: "420 件", reason: "面料勾丝严重、克重不符", supplier: "海宁贝贝服饰", status: "紧急核对中" },
    { code: "2026KS12", name: "法式泡泡袖公主裙（两件套）", refundRate: "86.5%", refundQty: "280 件", reason: "洗后严重缩水、领口偏小", supplier: "织里老沈印染", status: "限期改版中" },
    { code: "2026KS19", name: "莫代尔空调短袖套装", refundRate: "85.8%", refundQty: "190 件", reason: "裤腰橡筋过紧勒肚子", supplier: "常熟中豪服饰", status: "暂停出货" },
  ];

  const topSuppliersApayable = [
    { name: "海宁贝贝服饰有限公司", totalDue: "¥1,894,500", overdue: "¥420,000", paymentCycle: "账期 30 天", rating: "合作中" },
    { name: "温州卡比服饰有限公司", totalDue: "¥1,240,000", overdue: "¥0", paymentCycle: "现结/预售返点", rating: "合作中" },
    { name: "常熟中豪服饰厂", totalDue: "¥850,000", overdue: "¥150,000", paymentCycle: "账期 45 天", rating: "待观察" },
    { name: "织里隆达童装个体户", totalDue: "¥620,000", overdue: "¥50,000", paymentCycle: "批量货到付款", rating: "合作中" },
  ];

  const proprietorWarnings = [
    { name: "温岭市依依童装店", owner: "张*红", boundShop: "抖音-莉娜臻选店", annualTotal: "¥5,082,100", ratio: 101.6, action: "已阻断! 本月停用" },
    { name: "杭州仓前顺福童装网店", owner: "王*华", boundShop: "抖音-莉娜童装旗舰店", annualTotal: "¥4,881,300", ratio: 97.6, action: "临期! 已准备割接新对公" },
    { name: "织里镇佳琪制衣部", owner: "章*明", boundShop: "淘天-LenaKids直营店", annualTotal: "¥4,625,000", ratio: 92.5, action: "警告! 限制每日付款限额" },
    { name: "临海市琪琪服饰部", owner: "李*华", boundShop: "快手-Lena特卖场", annualTotal: "¥4,510,000", ratio: 90.2, action: "高危! 建议流水分流" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">经营数据工作台</h1>
          <p className="text-xs text-slate-500 mt-1">
            实时汇聚抖音、淘宝等多主体数据，核心反馈 30+ 独立个体户流水、采购账期与超时异常
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-md font-mono">
            最后更新于：2026-05-25 11:00:00 (自动)
          </span>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006591] hover:bg-[#005175] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>重新加载</span>
          </button>
        </div>
      </div>

      {/* Grid: 12 Key Performance Indicator Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const isWarning = m.badge || m.label.includes("预警") || m.label.includes("超") || m.label.includes("异常") || m.label.includes("应付");
          return (
            <div 
              key={idx} 
              className={`p-4 bg-white border border-slate-200 rounded-xl shadow-xs transition-all hover:border-[#006591]/30 hover:shadow-sm ${
                isWarning ? "bg-gradient-to-br from-white to-red-50/5 border-red-100" : ""
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-1">
                <span>{m.label}</span>
                {m.badge ? (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white ${m.badgeTheme}`}>
                    {m.badge}
                  </span>
                ) : m.icon ? (
                  m.icon
                ) : null}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-md md:text-lg font-black font-mono text-slate-800 tracking-tight">{m.value}</span>
                {m.change && (
                  <span className={`text-[10px] font-black font-mono ${m.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                    {m.change}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center justify-between border-t border-slate-100 pt-1.5">
                <span className="truncate">{m.detail}</span>
                <span className="text-slate-400 font-normal truncate max-w-[45%] text-[9px]">{m.subtext}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Module Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 2: Today's Sales and Refund Trends (SVG Area) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#006591]" />
                今日销售额与退款额趋势图 (实时每小时)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">主峰值集中在 19:30-23:30 黄金抖音达人直播时间段</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black">
              <span className="flex items-center gap-1 text-slate-800">
                <span className="w-2.5 h-1 bg-sky-500 inline-block rounded-full" /> Today GMV
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-2.5 h-1 bg-rose-400 inline-block rounded-full" /> Today Refund
              </span>
            </div>
          </div>
          
          {/* Custom SVG Line Area Graph */}
          <div className="h-60 relative w-full mb-2">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="1" />
              
              {/* Area GMV */}
              <polyline
                fill="url(#grad-gvs)"
                stroke="none"
                points="0,85 10,88 20,80 30,75 40,60 50,55 60,65 70,30 80,15 90,20 100,5"
              />
              {/* Line GMV */}
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                points="0,85 10,88 20,80 30,75 40,60 50,55 60,65 70,30 80,15 90,20 100,5"
              />

              {/* Area Refund */}
              <polyline
                fill="url(#grad-rf)"
                stroke="none"
                points="0,95 10,92 20,88 30,85 40,78 50,70 60,75 70,55 80,45 90,50 100,38"
              />
              {/* Line Refund */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="2,2"
                points="0,95 10,92 20,88 30,85 40,78 50,70 60,75 70,55 80,45 90,50 100,38"
              />

              {/* XML Gradients */}
              <defs>
                <linearGradient id="grad-gvs" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad-rf" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fda4af" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Absolute coordinates labels */}
            <span className="absolute left-1 top-2 text-[9px] font-bold font-mono text-slate-400 bg-white/70 px-1">¥2.0M</span>
            <span className="absolute left-1 top-14 text-[9px] font-bold font-mono text-slate-400 bg-white/70 px-1">¥1.5M</span>
            <span className="absolute left-1 top-26 text-[9px] font-bold font-mono text-slate-400 bg-white/70 px-1">¥1.0M</span>
            <span className="absolute left-1 top-38 text-[9px] font-bold font-mono text-slate-400 bg-white/70 px-1">¥0.5M</span>
            <span className="absolute right-2 bottom-6 text-[9px] font-black text-sky-600 bg-sky-50 px-1 py-0.5 rounded">PM Peak (抖音直播爆量)</span>
          </div>

          <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono pt-2 border-t border-slate-100">
            <span>08:00</span>
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
            <span>16:00</span>
            <span>18:00</span>
            <span>20:00</span>
            <span>21:30</span>
            <span>23:00 (今日当前)</span>
          </div>
        </div>

        {/* Module 3: This Month Income / Expense / Net Cashflow Trends (SVG Bar Chart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                本月每日收入 / 支出 / 净现金流趋势图
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">本周期累计到港实到货款，非虚拟交易，纯真实钱款</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black">
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-2.5 h-2 bg-emerald-400 inline-block rounded-xs" /> 收入
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-2.5 h-2 bg-rose-400 inline-block rounded-xs" /> 支出
              </span>
              <span className="flex items-center gap-1 text-[#006591]">
                <span className="w-2.5 h-1.5 bg-slate-400 inline-block rounded-full" /> 净流入
              </span>
            </div>
          </div>

          {/* Simulated SVG Bar chart bars */}
          <div className="h-60 flex items-end justify-between px-2 gap-2 w-full pt-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4">
              <div className="border-b border-slate-100 h-0 w-full" />
              <div className="border-b border-slate-100 h-0 w-full" />
              <div className="border-b border-slate-100 h-0 w-full" />
              <div className="border-b border-slate-100 h-0 w-full" />
            </div>

            {/* Generated monthly group nodes (6 dynamic multi bar examples) */}
            {[
              { label: "W1 周期", in: 80, out: 65, net: "+15%" },
              { label: "W2 周期", in: 100, out: 85, net: "+15%" },
              { label: "W3 周期", in: 140, out: 110, net: "+30%" },
              { label: "W4 周期", in: 160, out: 120, net: "+40%" },
              { label: "当前 W5 周期", in: 120, out: 80, net: "+40%" },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center z-10 z-index-10">
                <div className="flex items-end gap-1.5 w-full justify-center">
                  <div className="w-4 md:w-6 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xs hover:opacity-90 transition-opacity" style={{ height: `${d.in}px` }} title={`自持回款: ${d.in}`} />
                  <div className="w-4 md:w-6 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-xs hover:opacity-90 transition-opacity" style={{ height: `${d.out}px` }} title={`供销支出: ${d.out}`} />
                </div>
                <div className="h-1 w-full bg-slate-200 my-1" />
                <span className="text-[9px] font-bold text-slate-600 truncate">{d.label}</span>
                <span className="text-[8px] font-bold text-sky-600 font-mono bg-sky-50 px-1 py-0.5 mt-0.5 rounded">{d.net}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center font-bold text-slate-400 mt-2">
            注：每周一为结算高发期，会有大量抖店流水清退，呈现净现金流波谷
          </p>
        </div>
      </div>

      {/* Main Grid: lists & alert risk monitors */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Module 4: Order unshipped timeout warnings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4.5 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                聚水潭订单未发货超时预警 (已超 48H)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">需要跟单员立即督促供应商快速发货或安排仓库提配</p>
            </div>
            <span className="text-[9px] font-bold text-[#006591] bg-sky-50 px-2 py-0.5 rounded">未发货总计：342单</span>
          </div>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">平台订单号</th>
                  <th className="py-2.5">绑定主体/店铺</th>
                  <th className="py-2.5 text-center">超时时长</th>
                  <th className="py-2.5">款号及SKU</th>
                  <th className="py-2.5">异常状态</th>
                  <th className="py-2.5">合作商</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {timeoutOrders.map((o, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-mono text-slate-900">{o.id}</td>
                    <td className="py-2.5">
                      <span className="text-slate-500">{o.platform}</span> - {o.shop}
                    </td>
                    <td className="py-2.5 text-center text-rose-500 font-mono font-black">{o.time}</td>
                    <td className="py-2.5 font-mono text-[10px]">{o.sku}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black border border-rose-100">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 text-[10px]">{o.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 5: Abnormal refund items */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4.5 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                异常退款商品监控 (单款退款率 &gt; 85%)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">退货原因多为面料勾丝与色差，决定本月对涉事供应商做索赔或限售</p>
            </div>
            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded font-mono">警报临界值: 80%</span>
          </div>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">款号及品名</th>
                  <th className="py-2.5 text-center">退款率</th>
                  <th className="py-2.5">退货件数</th>
                  <th className="py-2.5">核心客诉成因</th>
                  <th className="py-2.5">代工及主供</th>
                  <th className="py-2.5 text-right">处置结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {abnormalRefundProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <span className="font-mono bg-slate-100 text-slate-800 text-[10px] px-1.5 py-0.5 rounded">{p.code}</span>
                      <p className="text-[10px] text-slate-500 mt-1">{p.name}</p>
                    </td>
                    <td className="py-3 text-center text-rose-600 font-black font-mono text-xs">{p.refundRate}</td>
                    <td className="py-3 font-mono text-[10px]">{p.refundQty}</td>
                    <td className="py-3 text-slate-500 text-[10px] max-w-[120px] truncate" title={p.reason}>{p.reason}</td>
                    <td className="py-3 text-slate-500 text-[10px]">{p.supplier}</td>
                    <td className="py-3 text-right">
                      <span className="inline-block px-2 py-0.5 bg-amber-500 text-white rounded-[4px] text-[9px] font-bold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Module 6: Supplier Apayable Top list */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4.5 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-500" />
                供应商应付款大额排行 (应付款 Top 4)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">季度末主要需对清贝贝及温州卡比对账，应付差额偏大</p>
            </div>
            <span className="text-[9px] font-bold text-slate-500 font-mono">本月待收票应付: ¥4.6M</span>
          </div>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">供应商名称</th>
                  <th className="py-2.5">当前应付款</th>
                  <th className="py-2.5">逾期未付额</th>
                  <th className="py-2.5">合作协议</th>
                  <th className="py-2.5 text-right">合作状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {topSuppliersApayable.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-800 text-[11.5px]">{s.name}</td>
                    <td className="py-3 font-mono text-slate-900 text-xs font-black">{s.totalDue}</td>
                    <td className="py-3 font-mono text-rose-500 text-xs font-black">{s.overdue !== "¥0" ? s.overdue : "—"}</td>
                    <td className="py-3 text-slate-500 text-[10px]">{s.paymentCycle}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        s.rating === "合作中" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {s.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 7: Proprietors quota risk warnings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4.5 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                年报 500 万流水红线主休监控 (个体户)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">控制在单家 500 万人民币/年，超限会被认定为一般纳税人并查税</p>
            </div>
            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              30+ 个体户统一并联对数
            </span>
          </div>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">个体户名称</th>
                  <th className="py-2.5">绑定抖音店铺</th>
                  <th className="py-2.5">年度累计流水</th>
                  <th className="py-2.5 text-center">使用比例</th>
                  <th className="py-2.5 text-right">流水分流措施</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {proprietorWarnings.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 flex flex-col">
                      <span className="font-bold text-slate-800 text-[11.5px]">{p.name}</span>
                      <span className="text-[9px] text-slate-400">法人: {p.owner}</span>
                    </td>
                    <td className="py-3 text-slate-500 text-[10px] font-mono">{p.boundShop}</td>
                    <td className="py-3 font-mono text-slate-900 text-xs font-black">{p.annualTotal}</td>
                    <td className="py-3 text-center">
                      <div className="flex items-center flex-col gap-1 px-2">
                        <span className={`text-[10px] font-mono font-black ${p.ratio >= 100 ? "text-rose-600 animate-pulse" : p.ratio >= 95 ? "text-rose-500" : "text-amber-500"}`}>{p.ratio}%</span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${p.ratio >= 100 ? "bg-rose-500" : p.ratio >= 95 ? "bg-rose-400" : "bg-amber-400"}`} 
                            style={{ width: `${Math.min(100, p.ratio)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                        p.ratio >= 100 ? "bg-rose-600 text-white" : p.ratio >= 95 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {p.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Module 8: Recent pending issues task checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-[#006591]" />
              目前最近待处理事项 (班组协同日常备忘)
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">扁平化扁平协同，支持快速勾选置灰完成</p>
          </div>
          <button 
            onClick={() => {
              const text = prompt("录入新协同备忘描述：");
              if (text) {
                setTodos(prev => [
                  ...prev,
                  { id: Date.now(), text, category: "其他", dueDate: "刚刚", done: false }
                ]);
              }
            }}
            className="text-[11px] font-bold text-[#006591] hover:text-[#005175] flex items-center gap-0.5 cursor-pointer"
          >
            + 创设新待办
          </button>
        </div>

        <div className="space-y-2.5">
          {todos.map((todo) => (
            <div 
              key={todo.id} 
              onClick={() => handleToggleTodo(todo.id)}
              className={`p-3.5 border rounded-lg flex items-center justify-between transition-all cursor-pointer select-none ${
                todo.done 
                  ? "bg-slate-50/50 border-slate-100 text-slate-400 line-through decoration-slate-300" 
                  : "bg-white border-slate-200 text-slate-750 hover:bg-slate-50/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input 
                  type="checkbox" 
                  checked={todo.done}
                  readOnly
                  className="w-4 h-4 rounded border-slate-300 text-[#006591] focus:ring-[#006591] cursor-pointer" 
                />
                <span className="text-xs font-bold truncate">{todo.text}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  todo.done 
                    ? "bg-slate-100 text-slate-400" 
                    : todo.category === "财务" 
                    ? "bg-sky-50 text-sky-600 border border-sky-100"
                    : todo.category === "主体"
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : todo.category === "客服"
                    ? "bg-purple-50 text-purple-600 border border-purple-100"
                    : "bg-amber-50 text-amber-600 border border-amber-100"
                }`}>
                  {todo.category}
                </span>
                <span className="text-[10px] font-bold font-mono text-slate-400">{todo.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
