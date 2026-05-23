/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCcw, FileSpreadsheet, Sparkles, AlertCircle, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MetricCardData, BusinessChartPoint } from "../types";

// Mock dimensional database for different corporate departments
const DEPARTMENT_DATASET: Record<string, {
  kpis: MetricCardData[];
  chartData: BusinessChartPoint[];
}> = {
  All: {
    kpis: [
      { id: "rev", title: "全网总营业额 (¥)", value: "12,482,900", change: "+14.2%", trend: "up", details: "环比上月增加 155w 元" },
      { id: "cost", title: "全网总运营成本 (¥)", value: "4,120,400", change: "-2.1%", trend: "down", details: "供应链整合缩减 8.8k 元" },
      { id: "hours", title: "本月累积减负工时 (小时)", value: "342.5", change: "+35.8%", trend: "up", details: "AI 自动回单及格式化处理贡献" },
      { id: "auto", title: "业务流程自动化率", value: "86.4%", change: "+12.1%", trend: "up", details: "微信、钉钉消息对接节点已上线" }
    ],
    chartData: [
      { label: "1月", revenue: 820000, cost: 350000, efficiency: 72 },
      { label: "2月", revenue: 950000, cost: 370000, efficiency: 75 },
      { label: "3月", revenue: 1100000, cost: 390000, efficiency: 79 },
      { label: "4月", revenue: 1250000, cost: 410000, efficiency: 83 },
      { label: "5月", revenue: 1482900, cost: 412040, efficiency: 86 }
    ]
  },
  Sales: {
    kpis: [
      { id: "rev", title: "营销部门总成交 (¥)", value: "8,924,500", change: "+18.9%", trend: "up", details: "复购及渠道转化率达历史新高" },
      { id: "cost", title: "线上投放广告成本 (¥)", value: "2,450,000", change: "+4.2%", trend: "neutral", details: "单客获客成本(CAC)下降11.5%" },
      { id: "hours", title: "本月客服减负工时 (小时)", value: "125.0", change: "+24.3%", trend: "up", details: "全天候AI导购接待助手节省时间" },
      { id: "auto", title: "售前自动化回单率", value: "92.1%", change: "+15.0%", trend: "up", details: "自动抓取并对账系统良好运作" }
    ],
    chartData: [
      { label: "1月", revenue: 580000, cost: 210000, efficiency: 75 },
      { label: "2月", revenue: 640000, cost: 220000, efficiency: 78 },
      { label: "3月", revenue: 780000, cost: 230000, efficiency: 82 },
      { label: "4月", revenue: 810000, cost: 240000, efficiency: 87 },
      { label: "5月", revenue: 924500, cost: 245000, efficiency: 92 }
    ]
  },
  Logistics: {
    kpis: [
      { id: "rev", title: "物流揽收调拨估值 (¥)", value: "2,058,000", change: "+5.1%", trend: "up", details: "全国 3 大共享仓储吞吐保障" },
      { id: "cost", title: "配送运输公摊成本 (¥)", value: "1,120,400", change: "-8.5%", trend: "down", details: "智能路线调配算法降低油耗成本" },
      { id: "hours", title: "库管自动入库减负 (小时)", value: "148.2", change: "+61.0%", trend: "up", details: "订单CSV跨账套一键校对助手节省" },
      { id: "auto", title: "智能拣货自动化率", value: "79.8%", change: "+8.3%", trend: "up", details: "自动配货触发和库存警告系统" }
    ],
    chartData: [
      { label: "1月", revenue: 140000, cost: 110000, efficiency: 65 },
      { label: "2月", revenue: 160000, cost: 112000, efficiency: 68 },
      { label: "3月", revenue: 180000, cost: 120000, efficiency: 71 },
      { label: "4月", revenue: 200000, cost: 118000, efficiency: 74 },
      { label: "5月", revenue: 205800, cost: 112040, efficiency: 80 }
    ]
  },
  Support: {
    kpis: [
      { id: "rev", title: "售后保留客诉价值 (¥)", value: "1,500,400", change: "+11.2%", trend: "up", details: "本月售后召回二次留存计价" },
      { id: "cost", title: "人员客诉赔付工单 (¥)", value: "350,000", change: "-15.2%", trend: "down", details: "客户满意度(NPS)提升5.5分导致赔付缩减" },
      { id: "hours", title: "客诉工单撰写减负 (小时)", value: "52.8", change: "+18.2%", trend: "up", details: "客服AI模板自动生成器提供快速支撑" },
      { id: "auto", title: "售后事件流自动转接率", value: "88.5%", change: "+14.3%", trend: "up", details: "服务自动归类与微信提醒打通" }
    ],
    chartData: [
      { label: "1月", revenue: 100000, cost: 30000, efficiency: 70 },
      { label: "2月", revenue: 150000, cost: 38000, efficiency: 72 },
      { label: "3月", revenue: 140000, cost: 40000, efficiency: 77 },
      { label: "4月", revenue: 240000, cost: 52000, efficiency: 81 },
      { label: "5月", revenue: 350000, cost: 50000, efficiency: 89 }
    ]
  }
};

export default function BusinessAnalysis({ initialDept = "All" }: { initialDept?: string }) {
  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Q2_YTD");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string>("");

  useEffect(() => {
    setSelectedDept(initialDept);
  }, [initialDept]);

  const currentDataset = DEPARTMENT_DATASET[selectedDept] || DEPARTMENT_DATASET.All;

  // AI Diagnostic triggered by modern system endpoint
  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    setInsightError("");
    setAiInsight("");

    const kpiSummary = currentDataset.kpis
      .map((k) => `- ${k.title}: 当前记录 ${k.value}, 相比上月 ${k.change} (${k.details})`)
      .join("\n");

    const chartSummary = currentDataset.chartData
      .map((pt) => `- ${pt.label}: 发生金额 ¥${pt.revenue}, 成本支出 ¥${pt.cost}, 工效指数 ${pt.efficiency}%`)
      .join("\n");

    const inputPayload = {
      department: selectedDept === "All" ? "全集团所有部门联席" : `${selectedDept} 部门`,
      metricsSummary: `主要核心KPI：\n${kpiSummary}\n\n五月度核心走势：\n${chartSummary}`
    };

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputPayload),
      });

      if (!response.ok) {
        throw new Error("HTTP connection failed or server reported key absence in deployment.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAiInsight(data.analysis || "无法获取诊断建议，请稍后再试。");
    } catch (err: any) {
      console.error(err);
      setInsightError(err.message || "请求服务器接口失败。请确保您已在 Settings 菜单中配置了正确的 GEMINI_API_KEY。");
    } finally {
      setLoadingInsight(false);
    }
  };

  // Generate real spreadsheet CSV downloadable stream
  const handleExportCSV = () => {
    const headers = ["月份/指标", "总收入(¥)", "运营成本(¥)", "运营效率指数(%)"];
    const rows = currentDataset.chartData.map((pt) => [
      pt.label,
      pt.revenue.toString(),
      pt.cost.toString(),
      pt.efficiency.toString() + "%"
    ]);

    // Append KPIs bottom
    rows.push([]);
    rows.push(["【核心看板对账】", "当前数值", "近期趋势", "注释细节"]);
    currentDataset.kpis.forEach((k) => {
      rows.push([k.title, k.value, k.change, k.details]);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OpsPilot_${selectedDept}_Report_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Dimensions calculation helper
  const chartHeight = 220;
  const chartWidth = 520;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const maxRevenue = Math.max(...currentDataset.chartData.map((d) => d.revenue)) * 1.15;
  const minRevenue = 0;

  const getX = (index: number, total: number) => {
    return paddingLeft + (index / (total - 1)) * (chartWidth - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    const scaleY = (chartHeight - paddingTop - paddingBottom) / (maxRevenue - minRevenue);
    return chartHeight - paddingBottom - (val - minRevenue) * scaleY;
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4.5 bg-white border border-slate-200 rounded-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1.5ID">部门过滤:</label>
          <button 
            onClick={() => { setSelectedDept("All"); setAiInsight(""); }}
            className={`px-3 md:px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedDept === "All" ? "bg-[#0ea5e9]/10 text-[#006591] border border-[#0ea5e9]/30" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"}`}
          >
            全部大盘
          </button>
          <button 
            onClick={() => { setSelectedDept("Sales"); setAiInsight(""); }}
            className={`px-3 md:px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedDept === "Sales" ? "bg-[#0ea5e9]/10 text-[#006591] border border-[#0ea5e9]/30" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"}`}
          >
            营销部门 📊
          </button>
          <button 
            onClick={() => { setSelectedDept("Logistics"); setAiInsight(""); }}
            className={`px-3 md:px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedDept === "Logistics" ? "bg-[#0ea5e9]/10 text-[#006591] border border-[#0ea5e9]/30" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"}`}
          >
            仓储物流 📦
          </button>
          <button 
            onClick={() => { setSelectedDept("Support"); setAiInsight(""); }}
            className={`px-3 md:px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedDept === "Support" ? "bg-[#0ea5e9]/10 text-[#006591] border border-[#0ea5e9]/30" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"}`}
          >
            客户服务 💬
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#006591]"
          >
            <option value="Q2_YTD">2026年Q2 (至今)</option>
            <option value="LAST_30">过去30天</option>
            <option value="YTD">2026年度累计数据</option>
          </select>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#22c55e] text-white hover:bg-emerald-600 rounded-lg transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>导出CSV对账表</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentDataset.kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.3 }}
            className="bg-white p-4.5 border border-slate-200 rounded-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                {kpi.title}
              </p>
              <h3 className="text-2xl font-bold text-[#002045] mt-1.5 tracking-tight">
                {kpi.value}
              </h3>
            </div>
            <div className="mt-2.5 flex items-start space-x-1.5 pt-2.5 border-t border-slate-100">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] h-fit font-bold font-mono ${
                kpi.trend === "up" 
                  ? "bg-emerald-50 text-emerald-600" 
                  : kpi.trend === "down" 
                    ? "bg-rose-50 text-rose-600" 
                    : "bg-slate-50 text-slate-600"
              }`}>
                {kpi.trend === "up" && <TrendingUp className="w-2.5 h-2.5 mr-0.5" />}
                {kpi.trend === "down" && <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {kpi.change}
              </span>
              <span className="text-[11px] text-slate-500 leading-normal line-clamp-1">
                {kpi.details}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Interactive AI Insight Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Customized SVG Chart Container */}
        <div className="lg:col-span-7 bg-white p-5 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-150">
            <div>
              <h4 className="text-sm font-bold text-[#002045]">
                {selectedDept === "All" ? "全集团总营业额" : `${selectedDept}部门数据`} 月度收支趋势分析
              </h4>
              <p className="text-[11px] text-[#43474e]">
                动态拟合数据折线（浅蓝为运营成本，深蓝为月度营业额）
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-semibold text-[#43474e]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-[#002045] rounded-full inline-block"></span>
                <span>营业额</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-[#0ea5e9] rounded-full inline-block"></span>
                <span>成本</span>
              </span>
            </div>
          </div>

          {/* SVG Multi Line Canvas */}
          <div className="mt-6 flex justify-center items-center w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-[540px]">
              {/* Background grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingYScale(ratio);
                const val = Math.round(maxRevenue * ratio / 1000) + "k";
                return (
                  <g key={i}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={chartWidth - paddingRight} 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth={1} 
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="text-[9px] font-mono fill-slate-400"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Month Marks Bottom */}
              {currentDataset.chartData.map((pt, idx, arr) => {
                const x = getX(idx, arr.length);
                return (
                  <text key={idx} x={x} y={chartHeight - 16} textAnchor="middle" className="text-[10px] font-semibold fill-[#43474e]">
                    {pt.label}
                  </text>
                );
              })}

              {/* Revenue Area Under */}
              <path
                d={`M ${getX(0, currentDataset.chartData.length)} ${chartHeight - paddingBottom} ` +
                  currentDataset.chartData.map((pt, idx, arr) => `L ${getX(idx, arr.length)} ${getY(pt.revenue)}`).join(" ") +
                  ` L ${getX(currentDataset.chartData.length - 1, currentDataset.chartData.length)} ${chartHeight - paddingBottom} Z`
                }
                fill="url(#revGrad)"
                opacity={0.06}
              />

              {/* Revenue Line */}
              <path
                d={currentDataset.chartData.map((pt, idx, arr) => `${idx === 0 ? "M" : "L"} ${getX(idx, arr.length)} ${getY(pt.revenue)}`).join(" ")}
                fill="none"
                stroke="#002045"
                strokeWidth={2.5}
                strokeLinecap="round"
              />

              {/* Cost Line */}
              <path
                d={currentDataset.chartData.map((pt, idx, arr) => `${idx === 0 ? "M" : "L"} ${getX(idx, arr.length)} ${getY(pt.cost)}`).join(" ")}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              {/* Data Interactive Nodes */}
              {currentDataset.chartData.map((pt, idx, arr) => {
                const x = getX(idx, arr.length);
                const ry = getY(pt.revenue);
                const cy = getY(pt.cost);
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={x} cy={ry} r={5} fill="#002045" stroke="#ffffff" strokeWidth={1.5} className="hover:scale-125 transition-transform" />
                    <circle cx={x} cy={cy} r={4} fill="#0ea5e9" stroke="#ffffff" strokeWidth={1} className="hover:scale-125 transition-transform" />
                    {/* Floating mini tooltips on hovering group */}
                    <rect x={x - 30} y={ry - 24} width={60} height={16} rx={3} fill="#002045" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />
                    <text x={x} y={ry - 13} textAnchor="middle" className="opacity-0 group-hover:opacity-100 font-mono text-[9px] fill-white pointer-events-none">
                      ¥{(pt.revenue/1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#002045" />
                  <stop offset="100%" stopColor="#002045" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Dynamic AI Insights Analyzer Panel */}
        <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div className="space-y-2 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-[#006591]">
              <Sparkles className="w-5 h-5 text-[#0ea5e9] fill-[#0ea5e9]/10 animate-pulse" />
              <h4 className="text-sm font-bold text-[#002045]">
                OpsPilot AI 智能大盘诊断
              </h4>
            </div>
            <p className="text-[11px] text-[#43474e]">
              集成 Gemini 3.5 核心模型，针对当前 {selectedDept === "All" ? "全网大盘" : `${selectedDept}部门`} 进行全链成本、工时节省指数和流程卡点实施分析。
            </p>
          </div>

          {/* AI Content Area */}
          <div className="flex-grow mt-4 min-h-[160px] max-h-[220px] overflow-y-auto bg-slate-50/75 rounded-lg p-3.5 border border-slate-200/50">
            <AnimatePresence mode="wait">
              {loadingInsight ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center space-y-2 text-slate-400 py-8"
                >
                  <Cpu className="w-8 h-8 text-sky-500 animate-spin" />
                  <p className="text-xs font-semibold animate-pulse text-[#002045]">安全接入 Gemini 大脑诊断中...</p>
                  <p className="text-[10px] text-slate-400">正在分析该部门核心KPI和月度财务账单</p>
                </motion.div>
              ) : aiInsight ? (
                <motion.div
                  key="insight"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[#0b1c30] leading-relaxed space-y-2 font-medium"
                >
                  <div className="flex items-center space-x-1 text-[11px] tracking-wide text-[#0ea5e9] font-bold border-b border-sky-100 pb-1.5 mb-2">
                    <span>⚡ 业务优化诊断书 ({selectedDept === "All" ? "联席全网" : `${selectedDept}部`})</span>
                  </div>
                  <div className="prose prose-xs whitespace-pre-line text-slate-700">
                    {aiInsight}
                  </div>
                </motion.div>
              ) : insightError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-3 text-center space-y-2 text-rose-500"
                >
                  <AlertCircle className="w-7 h-7" />
                  <p className="text-xs font-semibold">分析诊断受限</p>
                  <p className="text-[10px] text-slate-500 max-w-xs">{insightError}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2 text-slate-400"
                >
                  <span className="text-2xl">💡</span>
                  <p className="text-xs">点击下方诊断按钮，启动 Gemini 对本部门的自动化率评估</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trigger button */}
          <button
            onClick={handleGenerateInsight}
            disabled={loadingInsight}
            className="w-full mt-4 py-2.5 px-4 bg-[#002045] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9] fill-sky-300" />
            <span>{loadingInsight ? "计算评估报告中..." : `分析评估 ${selectedDept === "All" ? "全网大盘" : `${selectedDept}部门`}`}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Helper inside chart coordinate calculations
  function paddingYScale(ratio: number) {
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    return chartHeight - paddingBottom - ratio * usableHeight;
  }
}
