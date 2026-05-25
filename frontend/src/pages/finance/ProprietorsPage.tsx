/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building2, Users, CreditCard, Landmark, ShieldAlert, Plus, Search, 
  Filter, HelpCircle, Download, CheckCircle, Ban, AlertTriangle, X
} from "lucide-react";
import { AnimatePresence } from "motion/react";

interface Proprietor {
  id: string;
  name: string;
  legal: string;
  boundShop: string;
  bankAccountCount: number;
  annualTotal: number;
  annualLimit: number; // usually 5,000,000
  monthIncome: number;
  monthExpense: number;
  status: "正常" | "本月使用中" | "暂停使用" | "接近额度" | "已达额度";
  platformServiceFee?: number;
}

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNo: string;
  ownerProprietor: string;
  balance: number;
  status: "正常" | "限流" | "解冻中" | "已封塞";
}

interface ProprietorsPageProps {
  initialTab?: "proprietors" | "accounts" | "alerts";
  defaultTab?: "proprietors" | "accounts" | "alerts";
}

export default function ProprietorsPage({ initialTab = "proprietors", defaultTab }: ProprietorsPageProps) {
  const [activeTab, setActiveTab] = useState<"proprietors" | "accounts" | "alerts">(defaultTab || initialTab);
  const [search, setSearch] = useState("");
  const [proprietorList, setProprietorList] = useState<Proprietor[]>([
    { id: "P-01", name: "义乌市乐娜商贸部", legal: "陈*娜", boundShop: "抖音-莉娜童装旗舰店", bankAccountCount: 2, annualTotal: 4894300, annualLimit: 5000000, monthIncome: 412000, monthExpense: 220000, status: "接近额度", platformServiceFee: 146829 },
    { id: "P-02", name: "温岭市依依童装店", legal: "沈*英", boundShop: "抖音-旗舰精选", bankAccountCount: 1, annualTotal: 5092000, annualLimit: 5000000, monthIncome: 12050, monthExpense: 5000, status: "已达额度", platformServiceFee: 152760 },
    { id: "P-03", name: "杭州仓前顺福童装网店", legal: "郑*华", boundShop: "抖音-莉娜臻选", bankAccountCount: 2, annualTotal: 4520300, annualLimit: 5000000, monthIncome: 389000, monthExpense: 180000, status: "接近额度", platformServiceFee: 135609 },
    { id: "P-04", name: "织里佳琪制衣厂", legal: "朱*荣", boundShop: "淘天-LenaKids直营店", bankAccountCount: 3, annualTotal: 3120000, annualLimit: 5000000, monthIncome: 345000, monthExpense: 280000, status: "本月使用中", platformServiceFee: 93600 },
    { id: "P-05", name: "临海市琪琪服饰部", legal: "李*华", boundShop: "抖音-爆款特卖", bankAccountCount: 2, annualTotal: 2190000, annualLimit: 5000000, monthIncome: 420000, monthExpense: 330000, status: "本月使用中", platformServiceFee: 65700 },
    { id: "P-06", name: "常熟中豪电商商行", legal: "顾*明", boundShop: "快手-Lena特卖场", bankAccountCount: 1, annualTotal: 890000, annualLimit: 5000000, monthIncome: 154000, monthExpense: 110000, status: "正常", platformServiceFee: 26700 },
    { id: "P-07", name: "温州卡服商贸有限公司", legal: "林*海", boundShop: "拼多多-特惠组", bankAccountCount: 1, annualTotal: 48000, annualLimit: 5000000, monthIncome: 0, monthExpense: 0, status: "暂停使用", platformServiceFee: 1440 },
    { id: "P-08", name: "湖州吴兴达美服饰部", legal: "胡*伟", boundShop: "抖音-琪琪美衣", bankAccountCount: 2, annualTotal: 3820000, annualLimit: 5000000, monthIncome: 290000, monthExpense: 190000, status: "本月使用中", platformServiceFee: 114600 },
    { id: "P-09", name: "海宁市贝贝童装大卖部", legal: "徐*国", boundShop: "淘宝-莱那生活馆", bankAccountCount: 1, annualTotal: 1200000, annualLimit: 5000000, monthIncome: 80000, monthExpense: 62000, status: "正常", platformServiceFee: 36000 },
  ]);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { id: "ACC-01", accountName: "陈*娜 (建行个人账户)", bankName: "中国建设银行 义乌支行", accountNo: "6217 **** **** 8812", ownerProprietor: "义乌市乐娜商贸部", balance: 1450000, status: "正常" },
    { id: "ACC-02", accountName: "温岭市依依童装店 对公账户", bankName: "招商银行 台州分行", accountNo: "5719 **** **** 1032", ownerProprietor: "温岭市依依童装店", balance: 12000, status: "限流" },
    { id: "ACC-03", accountName: "杭州仓前顺福 对公户", bankName: "杭州农业银行 仓前分部", accountNo: "6228 **** **** 9921", ownerProprietor: "杭州仓前顺福童装网店", balance: 5890200, status: "正常" },
    { id: "ACC-04", accountName: "朱*荣 (网商法人网盾)", bankName: "网商银行 阿里清算专户", accountNo: "9558 **** **** 0081", ownerProprietor: "织里佳琪制衣厂", balance: 3120000, status: "正常" },
    { id: "ACC-05", accountName: "李*华 支付宝直连卡", bankName: "网商银行 抖音担保专网", accountNo: "6217 **** **** 1192", ownerProprietor: "临海市琪琪服饰部", balance: 2190000, status: "正常" },
  ]);

  // Drawer modal states for Proprietor creation
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProprietor, setEditingProprietor] = useState<Proprietor | null>(null);
  
  // Drawer form inputs
  const [formName, setFormName] = useState("");
  const [formLegal, setFormLegal] = useState("");
  const [formShop, setFormShop] = useState("");
  const [formAnnualTotal, setFormAnnualTotal] = useState(0);
  const [formStatus, setFormStatus] = useState<any>("正常");
  const [formPlatformServiceFee, setFormPlatformServiceFee] = useState(0);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleOpenCreate = () => {
    setEditingProprietor(null);
    setFormName("");
    setFormLegal("");
    setFormShop("");
    setFormAnnualTotal(0);
    setFormPlatformServiceFee(0);
    setFormStatus("正常");
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (prop: Proprietor) => {
    setEditingProprietor(prop);
    setFormName(prop.name);
    setFormLegal(prop.legal);
    setFormShop(prop.boundShop);
    setFormAnnualTotal(prop.annualTotal);
    setFormPlatformServiceFee(prop.platformServiceFee ?? Math.round(prop.annualTotal * 0.03));
    setFormStatus(prop.status);
    setIsDrawerOpen(true);
  };

  const handleSaveProprietor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLegal) return;

    if (editingProprietor) {
      // Edit
      setProprietorList(prev => prev.map(p => {
        if (p.id === editingProprietor.id) {
          // Calculate status based on ratio if user is not forcing it
          let quotaUsed = (formAnnualTotal / 5000000) * 100;
          let calculatedStatus = formStatus;
          if (quotaUsed >= 100) calculatedStatus = "已达额度";
          else if (quotaUsed >= 90) calculatedStatus = "接近额度";
          
          return {
            ...p,
            name: formName,
            legal: formLegal,
            boundShop: formShop,
            annualTotal: Number(formAnnualTotal),
            platformServiceFee: Number(formPlatformServiceFee),
            status: calculatedStatus
          };
        }
        return p;
      }));
    } else {
      // Create new
      const newProp: Proprietor = {
        id: `P-${String(proprietorList.length + 1).padStart(2, "0")}`,
        name: formName,
        legal: formLegal,
        boundShop: formShop || "暂未绑定",
        bankAccountCount: 1,
        annualTotal: Number(formAnnualTotal),
        annualLimit: 5000000,
        monthIncome: 0,
        monthExpense: 0,
        platformServiceFee: Number(formPlatformServiceFee),
        status: formStatus
      };
      setProprietorList(prev => [newProp, ...prev]);
    }
    setIsDrawerOpen(false);
  };

  // Filters computed datasets
  const filteredProprietors = proprietorList.filter(p => {
    const query = search.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.legal.toLowerCase().includes(query) || p.boundShop.toLowerCase().includes(query);
  });

  const getQuotaStatusTheme = (percentage: number) => {
    if (percentage < 70) return { label: "正常收款区 (低于70%)", bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-100", highlight: "bg-emerald-50" };
    if (percentage >= 70 && percentage < 90) return { label: "额度临期提醒 (70%-90%)", bg: "bg-amber-400", text: "text-amber-550", border: "border-amber-100", highlight: "bg-amber-50" };
    if (percentage >= 90 && percentage < 100) return { label: "高危降速警告 (90%-100%)", bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-100", highlight: "bg-rose-50" };
    return { label: "过饱危险红线 (超过100%)", bg: "bg-red-650", text: "text-red-700", border: "border-red-250", highlight: "bg-red-50" };
  };

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Top action block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-950 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#006591]" />
            个体户主体与额度控制面板
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            统管 32 家个体工商户、挂载银行金流对公网盾，提供年流水免税 500 万内多户轮控。
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "proprietors" && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] hover:shadow-2xs text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>登记新个体主体</span>
            </button>
          )}
          <button
            onClick={() => alert("Excel 数据提取功能：当前主体与账户清账导存中...")}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#002045] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出表格</span>
          </button>
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-slate-200">
        {[
          { key: "proprietors", label: "个体户多主体管理", icon: <Building2 className="w-4 h-4" /> },
          { key: "accounts", label: "银行与通道账户管理", icon: <CreditCard className="w-4 h-4" /> },
          { key: "alerts", label: "年报限流额度预警区", icon: <ShieldAlert className="w-4 h-4" /> },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key as any)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === item.key 
                ? "border-[#006591] text-[#006591]" 
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* General Search panel */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="全文模糊模糊检索主体、法人代表、银行账号、挂靠抖音店铺..."
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006591]"
          />
        </div>
        <button className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-150 cursor-pointer">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* TAB 1: 个体户主体列表 */}
      {activeTab === "proprietors" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
              <tr>
                <th className="p-4">商号名称</th>
                <th className="p-4">法人代表</th>
                <th className="p-4">绑定平台/店铺</th>
                <th className="p-4 text-center">账户卡数</th>
                <th className="p-4">本月回执流水 (收/支)</th>
                <th className="p-4">平台服务费</th>
                <th className="p-4">年度过账累计</th>
                <th className="p-4 text-center">已用比例</th>
                <th className="p-4">当前状态</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredProprietors.map(p => {
                const ratio = Math.round((p.annualTotal / p.annualLimit) * 100);
                const theme = getQuotaStatusTheme(ratio);
                const serviceFee = p.platformServiceFee ?? Math.round(p.annualTotal * 0.03);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/20">
                    <td className="p-4">
                      <p className="font-bold text-slate-905 text-[11.5px]">{p.name}</p>
                      <span className="text-[9.5px] text-slate-400 font-mono">工商注册ID: {p.id}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{p.legal}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">{p.boundShop}</span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-600">{p.bankAccountCount} 个</td>
                    <td className="p-4">
                      <div className="flex flex-col font-mono text-[9px]">
                        <span className="text-emerald-500 font-black">收: +¥{p.monthIncome.toLocaleString()}</span>
                        <span className="text-rose-400 font-semibold">支: -¥{p.monthExpense.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-black text-[#006591]">
                      ¥{serviceFee.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-black text-slate-800">¥{p.annualTotal.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-mono font-black ${ratio >= 90 ? "text-rose-500" : "text-emerald-500"}`}>{ratio}%</span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${theme.bg}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                        p.status === "已达额度" ? "bg-red-500 text-white border-red-600" :
                        p.status === "接近额度" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        p.status === "本月使用中" ? "bg-emerald-500 text-white border-emerald-600" :
                        p.status === "正常" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-205"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleOpenEdit(p)}
                        className="text-[11px] font-black text-[#006591] hover:text-[#005175] cursor-pointer"
                      >
                        编辑配置
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: 银行与通道账户管理 */}
      {activeTab === "accounts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankAccounts.map(b => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-4 shadow-2xs relative">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{b.id}</span>
                  <h3 className="text-xs font-black text-slate-800">{b.accountName}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  b.status === "正常" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}>
                  {b.status}
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-semibold text-slate-500 border-t border-b border-dashed border-slate-105 py-3">
                <p>所属个体户：<span className="text-slate-800 font-bold">{b.ownerProprietor}</span></p>
                <p>卡号/支付号：<span className="font-mono text-slate-805 select-all">{b.accountNo}</span></p>
                <p>开设机构：<span className="text-slate-600">{b.bankName}</span></p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">目前卡内余额</span>
                <span className="text-sm font-black font-mono text-slate-900">¥{b.balance.toLocaleString()}</span>
              </div>
            </div>
          ))}
          <div 
            onClick={() => alert("功能开发：请转到财务公司资金流水页面对特定科目登记新账户。")}
            className="border-2 border-dashed border-slate-200 hover:border-[#006591] bg-slate-50/50 hover:bg-white rounded-xl flex flex-col items-center justify-center p-10 cursor-pointer transition-colors"
          >
            <Plus className="w-6 h-6 text-slate-350" />
            <span className="text-xs font-bold text-slate-600 mt-2">挂载关联并联银行卡对公盾</span>
            <span className="text-[10px] text-slate-400 mt-0.5">需配插泰隆、建行等硬件网盾</span>
          </div>
        </div>
      )}

      {/* TAB 3: 500 万额度预警区 */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "安全收款级别", desc: "额度 &lt; 70% (350万内)", color: "border-l-4 border-emerald-500", count: "5 家主体安全" },
              { label: "额度提示级别", desc: "70% - 90% (355-450万)", color: "border-l-4 border-amber-400", count: "1 家接近" },
              { label: "高危告警等级", desc: "90% - 100% (450-500万)", color: "border-l-4 border-rose-500", count: "2 家极端警告" },
              { label: "封顶阻断叫停", desc: "高于 100% (&gt;500万)", color: "border-l-4 border-red-600", count: "1 家已强停进账" },
            ].map((g, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
                <div className={`p-1.5 ${g.color} pl-3`}>
                  <span className="text-[11px] font-bold text-slate-805 block">{g.label}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{g.desc}</p>
                </div>
                <p className="text-xs font-black text-[#006591] mt-3 tracking-wide">{g.count}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#002045] flex items-center gap-1.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-rose-505" />
              当前处于警戒阀值 (&gt; 70%) 的重点对象清册
            </h3>

            <div className="space-y-3.5">
              {proprietorList
                .filter(p => (p.annualTotal / p.annualLimit) * 100 >= 70)
                .map((p, idx) => {
                  const ratio = Math.round((p.annualTotal / p.annualLimit) * 100);
                  const theme = getQuotaStatusTheme(ratio);
                  return (
                    <div 
                      key={p.id} 
                      className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-xs ${theme.border} ${theme.highlight}`}
                    >
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{p.name}</span>
                          <span className="text-[10px] font-bold text-slate-400">法人: {p.legal}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-medium">
                          绑定自持结算终端: <strong className="text-slate-700">{p.boundShop}</strong>。
                          目前年度已累计吞吐流水 <span className="font-mono text-slate-900 font-bold">¥{p.annualTotal.toLocaleString()}</span>/¥5M
                        </p>
                      </div>

                      <div className="flex-grow max-w-xs px-4">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-slate-400 font-bold">额度使用百分比</span>
                          <span className={`font-black ${ratio >= 100 ? "text-red-600" : ratio >= 90 ? "text-rose-500" : "text-amber-500"}`}>{ratio}%</span>
                        </div>
                        <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div className={`h-full rounded-full ${theme.bg}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                          ratio >= 100 ? "bg-red-550 text-white" : ratio >= 90 ? "bg-rose-50 text-rose-600 border border-rose-100 font-bold" : "bg-amber-550 text-white"
                        }`}>
                          {ratio >= 100 ? "已切断收款" : ratio >= 90 ? "建议阻断" : "需要注意"}
                        </span>
                        
                        {ratio >= 90 ? (
                          <button 
                            onClick={() => alert(`已下达封顶指令！系统已自动阻断该个体户主体 [${p.name}] 对应抖音商铺后台的收款路由。`)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10.5px] font-bold cursor-pointer"
                          >
                            立即封锁
                          </button>
                        ) : (
                          <button 
                            onClick={() => alert(`调低分流比份比例已成功！该主体本批次收款分派系数已调低两成。`)}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10.5px] font-bold cursor-pointer"
                          >
                            微调配比
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      )}

      {/* Drawer Dialog to Add/Edit Proprietors */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[80]"
            />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-200">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black text-slate-80s">
                  {editingProprietor ? "📝 编辑个体工商主体资料" : "➕ 登记新个体户商号主体"}
                </span>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-450 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProprietor} className="flex-grow overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase font-sans">个体工商户名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="请输入个体户营业执照完整字号，例如：义乌市安安童装店"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">法人姓名 <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formLegal}
                      onChange={(e) => setFormLegal(e.target.value)}
                      placeholder="徐安国"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">绑定收款店铺</label>
                    <input
                      type="text"
                      value={formShop}
                      onChange={(e) => setFormShop(e.target.value)}
                      placeholder="抖音-依依特卖铺"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-805 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">已征用年度累计流水额 (元) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">¥</span>
                    <input
                      type="number"
                      required
                      value={formAnnualTotal === 0 ? "" : formAnnualTotal}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormAnnualTotal(val);
                        setFormPlatformServiceFee(Math.round(val * 0.03));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-400 mt-1 block">系统将自动以五百万限额进行百分比计算，并分流预警级别。</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase font-sans">平台服务费余额扣除 (元)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">¥</span>
                    <input
                      type="number"
                      value={formPlatformServiceFee === 0 ? "" : formPlatformServiceFee}
                      onChange={(e) => setFormPlatformServiceFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                      placeholder="已累计过账平台费（3%预估或实扣）"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-400 mt-1 block">默认根据累积过账流水的 3.0% 扣点比率进行预估。</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">当前人工强制状态 (可不填)</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                  >
                    <option value="正常">正常 (低于 70% 额度)</option>
                    <option value="本月使用中">本月使用中</option>
                    <option value="暂停使用">暂停使用 / 离线封锁</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-[#006591] hover:bg-[#005175] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    保存配置
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="py-3 px-4 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
