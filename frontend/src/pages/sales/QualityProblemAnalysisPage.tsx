/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart, Filter, Search, Plus, FileText, CheckCircle, 
  AlertTriangle, ArrowRight, ShieldCheck, Percent, Layers, Landmark
} from "lucide-react";

interface QualityDefect {
  id: string;
  defectType: string;
  substanceMaterial: string; // e.g. "精梳棉针织", "莫代尔面料"
  reportedCount: number;
  liableFactory: string;
  rootCauseAnalysis: string;
  remedyAction: string;
  financialDeductionTotal: number;
  criticality: "中度偏低" | "中等警示" | "特大事故";
}

export default function QualityProblemAnalysisPage() {
  const [search, setSearch] = useState("");

  const [defectsList, setDefectsList] = useState<QualityDefect[]>([
    { id: "DEF-001", defectType: "温水浆洗后严重缩水超两码", substanceMaterial: "精织高支100%精梳棉", reportedCount: 880, liableFactory: "海安莱那织造有限公司", rootCauseAnalysis: "坯布在印染厂出机前未做充分的二次机械蒸汽预缩水处理，导致消费者洗涤后纤维回缩", remedyAction: "已对工厂当月账单罚款款 2.6 万元；强制后续必须增加两次高温定型工艺", financialDeductionTotal: 26000, criticality: "特大事故" },
    { id: "DEF-002", defectType: "领部纽扣接缝脱针开线", substanceMaterial: "双面防拉伸罗纹线", reportedCount: 200, liableFactory: "海安莱那织造有限公司", rootCauseAnalysis: "打扣机撞击力度过大，压脚回缩不齐，打断了边缘防脱环形锁边针织线", remedyAction: "更换新型三齿锁扣机，质检员加强领口抗拉拉拨测", financialDeductionTotal: 5800, criticality: "中等警示" },
    { id: "DEF-003", defectType: "防惊跳睡袋拉链刮刺伤婴儿面颊", substanceMaterial: "双向金属磨砂拉链口", reportedCount: 75, liableFactory: "温岭市依依童装制品厂", rootCauseAnalysis: "拉链头防摩擦保护贴布面积过小，侧睡时金属齿仍能外露，刮擦幼嫩面部", remedyAction: "全批次返工重修，将拉链领角布包边长由1.5cm增厚到3.5cm两面围护", financialDeductionTotal: 12000, criticality: "特大事故" },
    { id: "DEF-004", defectType: "拼口位置线线头顶结硌脚趾", substanceMaterial: "针织精织防滑童袜", reportedCount: 40, liableFactory: "常熟汇豪针织加工商行", rootCauseAnalysis: "自动缝头头时，刀头高度偏高 0.2 毫米，导致合拢位置残留 2 毫米线圈，收卷顶硌", remedyAction: "调校调校自动缝头机切刀焦距，品控线头超过 1 毫米一律视为次品剔除", financialDeductionTotal: 2000, criticality: "中度偏低" }
  ]);

  const filtered = defectsList.filter(d => {
    const q = search.toLowerCase();
    return d.defectType.toLowerCase().includes(q) || d.liableFactory.toLowerCase().includes(q) || d.rootCauseAnalysis.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Search Header control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-205 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-950 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-[#006591]" />
            代工厂品质缺陷透镜诊断分析
          </h1>
          <p className="text-xs text-slate-550 mt-1">
            聚合针织/梭织物理瑕疵客诉，锁定退次真因，落实纠正纠偏措施并回存罚薪对账底，推进良品合规率。
          </p>
        </div>

        <button 
          onClick={() => alert("功能开发：季度品质诊断分析报告书正在以 Excel 自动整合中...")}
          className="px-3.5 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg cursor-pointer"
        >
          导出分析报告书
        </button>
      </div>

      {/* Grid: Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "平均综合瑕疵退换率", value: "1.84%", change: "控制红线: 2.0%内", status: "符合合规目标", color: "text-emerald-500" },
          { label: "累计已裁处品质惩戒款", value: "¥45,800", change: "涉及工厂: 3 家", status: "已入供应商扣减项", color: "text-[#006591]" },
          { label: "重大品质重大事故警告", value: "2 项", change: "涉及品类: 爬服、睡袋", status: "已下达限时返工厂整改单", color: "text-rose-500 animate-pulse" },
          { label: "纠正防错措施落足", value: "85.2%", change: "整改完成率达标", status: "设备已完成硬件校验", color: "text-[#0ea5e9]" }
        ].map((k, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">{k.label}</span>
            <p className={`text-lg font-black font-mono mt-1.5 ${k.color}`}>{k.value}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 text-[9.5px] font-semibold text-slate-500">
              <span className="text-slate-800 font-bold">{k.change}</span>
              <span className="text-slate-405">{k.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Query panel */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="全文模糊检索故障大类、起落物料、起算责任工厂、根因分析摘要..."
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
              <th className="p-4 font-black">故障瑕疵表现</th>
              <th className="p-4 font-black">涉及面料物料</th>
              <th className="p-4 text-center">综合上报次数</th>
              <th className="p-4">第一责任厂商</th>
              <th className="p-4">缺陷工艺流程根因透视</th>
              <th className="p-4">品质纠错防错纠偏方案</th>
              <th className="p-4 text-right">已罚缴品质保证金</th>
              <th className="p-4 text-center">质量评级</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/20">
                <td className="p-4 font-mono font-bold text-slate-405">{d.id}</td>
                <td className="p-4 font-black text-slate-800">{d.defectType}</td>
                <td className="p-4 font-bold text-slate-500">{d.substanceMaterial}</td>
                <td className="p-4 text-center font-mono font-bold text-slate-600">{d.reportedCount.toLocaleString()} 笔</td>
                <td className="p-4 font-black text-slate-850">{d.liableFactory}</td>
                <td className="p-4 max-w-sm truncate text-slate-600 font-medium select-text" title={d.rootCauseAnalysis}>{d.rootCauseAnalysis}</td>
                <td className="p-4 max-w-xs truncate text-slate-605 font-medium select-text" title={d.remedyAction}>{d.remedyAction}</td>
                <td className="p-4 text-right font-mono font-black text-[#006591]">Y{d.financialDeductionTotal.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                    d.criticality === "特大事故" ? "bg-red-50 text-red-650 border-red-155 animate-pulse" :
                    d.criticality === "中等警示" ? "bg-amber-50 text-amber-550 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-105"
                  }`}>
                    {d.criticality}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
