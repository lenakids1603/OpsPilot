/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, Plus, Search, Filter, ShieldAlert, CheckCircle, 
  AlertTriangle, ArrowRight, UserCheck, HelpCircle, X
} from "lucide-react";
import { AnimatePresence } from "motion/react";

interface CustomerComplaint {
  id: string;
  registerDate: string;
  styleNo: string;
  storePlatform: string;
  defectCategory: "面料缩水落色" | "缝线脱针裂边" | "拉链或纽扣脱落" | "异味有害超标";
  briefQuote: string;
  isSupplierFault: boolean; // Automatic linkage indicator in procurement
  targetSupplier: string; // The factory liable to pay penalty
  compensationRefund: number;
  resolutionStatus: "待核准" | "客诉补偿完结" | "退厂重工结清";
}

export default function ComplaintRegisterPage() {
  const [search, setSearch] = useState("");
  const [complaintList, setComplaintList] = useState<CustomerComplaint[]>([
    { id: "T-202605-01", registerDate: "2026-05-22", styleNo: "LN-2026-CO", storePlatform: "抖音-莉娜贝贝旗舰店", defectCategory: "缝线脱针裂边", briefQuote: "洗涤后领部纽扣有轻微松脱，针缝线完全开了裂", isSupplierFault: true, targetSupplier: "海安莱那织造有限公司", compensationRefund: 50, resolutionStatus: "退厂重工结清" },
    { id: "T-202605-02", registerDate: "2026-05-20", styleNo: "LN-2026-CO", storePlatform: "天猫-LenaKids直营店", defectCategory: "面料缩水落色", briefQuote: "过水之后缩水了至少有两个尺码，原本80码缩成抱被大小", isSupplierFault: true, targetSupplier: "海安莱那织造有限公司", compensationRefund: 30, resolutionStatus: "客诉补偿完结" },
    { id: "T-202605-03", registerDate: "2026-05-21", styleNo: "LN-2026-BL", storePlatform: "抖音-莉娜臻选", defectCategory: "拉链或纽扣脱落", briefQuote: "防惊跳睡袋拉链拉环拉链断裂，拉齿有锐角摩擦皮肤", isSupplierFault: true, targetSupplier: "温岭市依依童装制品厂", compensationRefund: 120, resolutionStatus: "待核准" },
    { id: "T-202605-04", registerDate: "2026-05-18", styleNo: "LN-2026-SO", storePlatform: "拼多多-特惠组", defectCategory: "面料缩水落色", briefQuote: "防脱口宝宝童袜袜子脚尖位置线头多勒脚趾", isSupplierFault: false, targetSupplier: "无特定责任方", compensationRefund: 10, resolutionStatus: "客诉补偿完结" }
  ]);

  // Drawer creator layout state
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [regStyle, setRegStyle] = useState("LN-2026-CO");
  const [regPlatform, setRegPlatform] = useState("抖音-莉娜贝贝旗舰店");
  const [regCategory, setRegCategory] = useState<any>("缝线脱针裂边");
  const [regQuote, setRegQuote] = useState("");
  const [regIsFault, setRegIsFault] = useState(true);
  const [regSupplier, setRegSupplier] = useState("海安莱那织造有限公司");
  const [regRefund, setRegRefund] = useState(0);

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regQuote) return;

    const newCompl: CustomerComplaint = {
      id: `T-202605-0${complaintList.length + 1}`,
      registerDate: new Date().toISOString().split("T")[0],
      styleNo: regStyle,
      storePlatform: regPlatform,
      defectCategory: regCategory,
      briefQuote: regQuote,
      isSupplierFault: regIsFault,
      targetSupplier: regIsFault ? regSupplier : "无特定责任方",
      compensationRefund: Number(regRefund),
      resolutionStatus: "待核准"
    };

    setComplaintList(prev => [newCompl, ...prev]);
    setIsOpen(false);
    alert("🟢 客诉异常事件登记成功！已并入后台账期，该罚损将在月度决算核实应扣中主动抵扣厂商额。");
  };

  const filtered = complaintList.filter(c => {
    const q = search.toLowerCase();
    return c.styleNo.toLowerCase().includes(q) || c.briefQuote.toLowerCase().includes(q) || c.targetSupplier.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Search Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#006591]" />
            客服商品质量异常登记台板
          </h1>
          <p className="text-xs text-slate-505 mt-1">
            取代原客服部不规范 Excel 登记表格，通过款号客诉、标记工厂责任、联动后续付款扣款核销。
          </p>
        </div>

        <button
          onClick={() => {
            setRegQuote("");
            setRegRefund(0);
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>登记爆款质量投诉</span>
        </button>
      </div>

      {/* Global query input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="全文关键词检索受害款号、客诉反馈原文、定点扣款工厂字号..."
            className="w-full bg-white border border-slate-205 rounded-lg py-2.5 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Table grid details */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
            <tr>
              <th className="p-4">受理工单</th>
              <th className="p-4">登记日期</th>
              <th className="p-4 font-black">故障款号</th>
              <th className="p-4">承接店铺渠道</th>
              <th className="p-4 font-black">品质瑕疵大类</th>
              <th className="p-4">客诉遭遇文字实录</th>
              <th className="p-4 text-center">属工厂制造缺陷</th>
              <th className="p-4">惩罚抵扣应付责任方</th>
              <th className="p-4 text-right">退赔金额</th>
              <th className="p-4">理赔关结点</th>
              <th className="p-4 text-right">处置</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/20">
                <td className="p-4 font-mono font-bold text-[#002045]">{c.id}</td>
                <td className="p-4 font-mono text-slate-500">{c.registerDate}</td>
                <td className="p-4 font-mono font-black text-slate-900">{c.styleNo}</td>
                <td className="p-4"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9.5px] font-bold">{c.storePlatform}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-black border ${
                    c.defectCategory === "异味有害超标" ? "bg-red-50 text-red-655 border-red-100" :
                    c.defectCategory === "缝线脱针裂边" ? "bg-amber-50 text-amber-600 border-amber-100" :
                    c.defectCategory === "面料缩水落色" ? "bg-sky-50 text-sky-600 border-sky-100" : "bg-purple-50 text-purple-600 border-purple-100"
                  }`}>
                    {c.defectCategory}
                  </span>
                </td>
                <td className="p-4 max-w-xs truncate italic text-slate-600 font-medium">"{c.briefQuote}"</td>
                <td className="p-4 text-center">
                  <span className={`font-black text-xs ${c.isSupplierFault ? "text-rose-500" : "text-slate-400"}`}>
                    {c.isSupplierFault ? "⚙️ 缺陷责任" : "客户退换"}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-800">{c.targetSupplier}</td>
                <td className="p-4 text-right font-mono font-black text-[#006591]">Y{c.compensationRefund}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                    c.resolutionStatus === "退厂重工结清" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    c.resolutionStatus === "客诉补偿完结" ? "bg-sky-50 text-sky-600 border-sky-100" : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                  }`}>
                    {c.resolutionStatus}
                  </span>
                </td>
                <td className="p-4 text-right select-none">
                  {c.resolutionStatus === "待核准" ? (
                    <button 
                      onClick={() => alert(`【确认罚扣】已将客诉罚款 ¥${c.compensationRefund} 推送到 ${c.targetSupplier} 本月对账账底扣减！`)}
                      className="px-2.5 py-1 bg-[#002045] hover:bg-slate-800 text-white rounded-lg text-[9.5px] font-bold cursor-pointer transition-colors"
                    >
                      责任裁定
                    </button>
                  ) : (
                    <span className="text-[9.5px] text-slate-400 font-mono">已完结归档</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer creator form for complaints */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[80]" />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-205">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black text-slate-800">➕ 登记新品质缺陷投诉</span>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-450"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateComplaint} className="flex-grow p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">涉及款式款号 *</label>
                  <select value={regStyle} onChange={e => setRegStyle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold">
                    <option value="LN-2026-CO">LN-2026-CO (精梳棉连体爬服)</option>
                    <option value="LN-2026-BL">LN-2026-BL (防惊跳舒适睡袋)</option>
                    <option value="LN-2026-SO">LN-2026-SO (新生儿短袜3组装)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">受理渠道店铺 *</label>
                  <input type="text" required value={regPlatform} onChange={e => setRegPlatform(e.target.value)} placeholder="例如：抖音-丽娜贝贝旗舰店" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">品质异常分类大项 *</label>
                  <select value={regCategory} onChange={e => setRegCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700">
                    <option value="缝线脱针裂边">缝线起吊裂缝 / 面包扣脱落</option>
                    <option value="面料缩水落色">落色极其严重 / 缩水超过两码</option>
                    <option value="拉链或纽扣脱落">拉链划口锋利 / 划伤过敏</option>
                    <option value="异味有害超标">强烈工业浆洗异味</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">客诉反馈遭遇文字原话录音 *</label>
                  <textarea required rows={3} value={regQuote} onChange={e => setRegQuote(e.target.value)} placeholder="客户微信或飞鸽聊天反馈原话记录..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11.5px] font-black text-rose-800 block">判定为工厂制造责任</span>
                    <p className="text-[9.5px] text-rose-600 font-medium">如果是，系统会主动推送到供应商对账底核扣</p>
                  </div>
                  <input type="checkbox" checked={regIsFault} onChange={e => setRegIsFault(e.target.checked)} className="w-4.5 h-4.5 accent-rose-600 cursor-pointer" />
                </div>

                {regIsFault && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5">指定代工责任代工厂</label>
                    <select value={regSupplier} onChange={e => setRegSupplier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700">
                      <option value="海安莱那织造有限公司">海安莱那织造有限公司 (爬服)</option>
                      <option value="温岭市依依童装制品厂">温岭市依依童装制品厂 (防惊跳)</option>
                      <option value="常熟汇豪针织加工商行">常熟汇豪针织加工商行 (棉袜)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">对冲理赔客诉退赔金额 (元)</label>
                  <input type="number" value={regRefund} onChange={e => setRegRefund(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold" />
                </div>

                <div className="pt-6 font-semibold flex gap-2">
                  <button type="submit" className="flex-grow py-2.5 bg-[#006591] text-white text-xs font-bold rounded-lg cursor-pointer">发单存账</button>
                  <button type="button" onClick={() => setIsOpen(false)} className="py-2.5 px-4 border border-slate-200 text-slate-655 text-xs font-bold rounded-lg">取消</button>
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
