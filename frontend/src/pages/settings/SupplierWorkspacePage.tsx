/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Building2, Phone, Mail, FileText, CheckCircle2, MapPin, 
  HelpCircle, X, Search, Bell, LogOut, ArrowRight, ArrowUpRight, 
  Package, Truck, DollarSign, ShieldAlert, Award, ChevronLeft, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SubSKU {
  sku: string;
  colorName: string;
  cost: number;
  status: "生产中" | "待质检" | "已结案";
  colorHex: string; // Used to render real visual clothes mock
}

export interface SupplierWorkspacePageProps {
  userEmail?: string;
  onLogout?: () => void;
}

export default function SupplierWorkspacePage({ userEmail, onLogout }: SupplierWorkspacePageProps = {}) {
  const [activeTab, setActiveTab] = useState("工作台");
  const [searchSKU, setSearchSKU] = useState("");
  
  // Tabs of supplier workspace
  const tabs = ["工作台", "我的订单", "款式报价", "对账结算"];

  // Mock list of SKU
  const [skus, setSkus] = useState<SubSKU[]>([
    { sku: "LN-2024-W01", colorName: "雅致粉", cost: 58.00, status: "生产中", colorHex: "bg-rose-200" },
    { sku: "LN-2024-W02", colorName: "深邃蓝", cost: 72.50, status: "待质检", colorHex: "bg-slate-700" },
    { sku: "LN-2501-M10", colorName: "珍珠白", cost: 45.00, status: "已结案", colorHex: "bg-amber-5/50 border border-slate-205" }
  ]);

  // Dialog states for Actions
  const [modalType, setModalType] = useState<"quote" | "bill" | "detail" | null>(null);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  // Filter local SKU items
  const filteredSkus = useMemo(() => {
    return skus.filter(s => s.sku.includes(searchSKU.toUpperCase()) || s.colorName.includes(searchSKU));
  }, [skus, searchSKU]);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "quote") {
      showToast("🚀 报价详情已成功提报！采购部正在进行核验。");
    } else {
      showToast("📁 进项财务发票及发货电子回单已被安全录入系统。");
    }
    setModalType(null);
  };

  return (
    <div className="bg-slate-50 border border-slate-100/60 rounded-3xl overflow-hidden shadow-lg p-3 sm:p-5 text-xs font-sans space-y-5 max-w-7xl mx-auto select-none">
      
      {/* Toast popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-5 z-[500] p-4 bg-emerald-650 text-white font-bold rounded-xl border border-emerald-500 shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal workspace mock header area */}
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs select-none">
        {/* Left Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 bg-indigo-650 rounded-xl flex items-center justify-center font-serif text-white font-black text-[16px]">
            H
          </div>
          <div>
            <h3 className="font-extrabold text-slate-805 text-[13px] tracking-tight">杭州织锦服饰有限公司</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 leading-none font-bold">供应商在线工作台</span>
          </div>
        </div>

        {/* Tab menu items */}
        <div className="flex items-center gap-1 w-full md:w-auto justify-start border-b border-slate-50 md:border-none pb-2 md:pb-0">
          {tabs.map(t => {
            const isSelected = activeTab === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setActiveTab(t);
                  showToast(`📂 已切换至子页面: ${t}`);
                }}
                className={`px-3 py-2 rounded-xl text-[11.5px] font-black transition-all cursor-pointer relative ${
                  isSelected 
                    ? "text-indigo-700 bg-indigo-50/70 font-extrabold" 
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {t}
                {isSelected && (
                  <motion.div 
                    layoutId="workspaceUnderline"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-indigo-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Admin pill */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/55 text-[10.5px]">
            <div className="w-5.5 h-5.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-[9px]">
              {userEmail ? userEmail.slice(0, 1).toUpperCase() : "张"}
            </div>
            <div>
              <span className="font-bold text-slate-705 block leading-tight">{userEmail || "张经理"}</span>
              <span className="text-[8.5px] text-emerald-600 block leading-none font-medium mt-0.5">
                {userEmail === "gys@lenakids.com" ? "供应商特权模式" : "账号已启用"}
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            disabled={!onLogout}
            className={`p-2 rounded-xl leading-none ${onLogout ? "text-rose-600 bg-rose-50 border border-rose-205 hover:bg-rose-100 cursor-pointer" : "text-slate-350 bg-slate-100 border border-slate-200"}`}
            title="退出提报程序"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Greeting Banner Segment */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight leading-normal">
            您好，张经理
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium font-sans">
            今天是 <span className="text-slate-650 font-bold">2026年10月24日</span>，请关注以下待办事项以确保生产顺利进行。
          </p>
        </div>

        {/* Quick Submit Buttons on top-right */}
        <div className="flex items-center gap-2.5 text-xs font-semibold select-none flex-shrink-0">
          <button
            onClick={() => setModalType("quote")}
            className="px-4 py-2 bg-[#002045] hover:bg-[#072449] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>提交报价</span>
          </button>
          <button
            onClick={() => setModalType("bill")}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>上传账单</span>
          </button>
        </div>
      </div>

      {/* Top dashboard stats cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        {/* Metric 1 */}
        <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-indigo-800/80 font-black text-[11px] block">待填写报价</span>
            <span className="text-[10px] text-slate-400 font-sans block">包含新款打样报价及审单确认</span>
          </div>
          <span className="text-3xl font-black text-indigo-700 font-mono tracking-tight leading-none px-2.5">3</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-amber-800/80 font-black text-[11px] block">待更新交期</span>
            <span className="text-[10px] text-slate-400 font-sans block">生产中订单的进度及入库预测</span>
          </div>
          <span className="text-3xl font-black text-orange-650 font-mono tracking-tight leading-none px-2.5">2</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-600 font-black text-[11px] block font-sans">待上传账单</span>
            <span className="text-[10px] text-slate-450 block">上月已入库货款的电子发票</span>
          </div>
          <span className="text-3xl font-black text-slate-800 font-mono tracking-tight leading-none px-2.5">1</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-rose-700/80 font-black text-[11px] block font-sans">质量问题</span>
            <span className="text-[10px] text-slate-400 block">目前暂待回复的质检异常</span>
          </div>
          <span className="text-3xl font-black text-slate-400 font-mono tracking-tight leading-none px-2.5">0</span>
        </div>
      </div>

      {/* Grid: Split Table vs Sidebar details */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: SKU Monitoring list table (8/12 scope) */}
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Main header row */}
          <div className="p-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4 select-none">
            <h4 className="font-extrabold text-slate-800 text-[12.5px] uppercase flex items-center gap-1 font-sans">
              <Package className="w-4 h-4 text-indigo-600" />
              我的款号 / SKU 监控
            </h4>
            
            {/* Simple Searching bar */}
            <div className="relative w-44 rounded-xl border border-slate-205 py-1.5 pl-8 pr-3 bg-white focus-within:border-indigo-400 transition-colors">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索款号颜色..."
                value={searchSKU}
                onChange={e => setSearchSKU(e.target.value)}
                className="w-full bg-transparent outline-none text-[11px] font-sans"
              />
            </div>
          </div>

          {/* Interactive table */}
          <div className="overflow-x-auto text-[11px] font-medium leading-normal">
            <table className="w-full text-left border-collapse text-slate-600">
              <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="p-4 pl-6 font-extrabold w-[170px]">SKU 编号</th>
                  <th className="p-4 font-bold text-center">对应颜色</th>
                  <th className="p-4 font-bold text-center">规格/颜色</th>
                  <th className="p-4 font-bold text-center">提领成本 (CNY)</th>
                  <th className="p-4 font-bold text-center">生产状态</th>
                  <th className="p-4 font-bold pr-6 text-center">系统操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSkus.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      没有找到匹配的SKU款号
                    </td>
                  </tr>
                ) : (
                  filteredSkus.map(s => (
                    <tr key={s.sku} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800 font-mono tracking-wide">{s.sku}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <div className={`w-11 h-7 rounded-sm ${s.colorHex} shadow-xs border border-slate-100/40 relative flex items-center justify-center font-bold text-[8.5px] text-white uppercase`}>
                            {s.sku.slice(-3)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700">{s.colorName}</td>
                      <td className="p-4 text-center font-bold font-mono text-slate-500">{s.cost.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                          s.status === "生产中" 
                            ? "bg-sky-50 text-sky-700 border-sky-100 animate-pulse" 
                            : s.status === "待质检" 
                              ? "bg-amber-5 text-amber-600 border-amber-100" 
                              : "bg-slate-100 text-slate-400 border-slate-200"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-center select-none">
                        <button
                          onClick={() => {
                            setSelectedSku(s.sku);
                            setModalType("detail");
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors cursor-pointer"
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer of table info */}
          <div className="p-4 border-t border-slate-50 bg-[#fafbfe] flex items-center justify-between text-slate-400 font-medium">
            <span>共 <span className="text-slate-705 font-bold">{filteredSkus.length}</span> 个 SKU</span>
            <div className="flex items-center gap-1 font-semibold text-[10.5px]">
              <button className="p-1 px-3 border border-slate-150 rounded-lg text-slate-400 bg-white hover:bg-slate-50 flex items-center">
                <ChevronLeft className="w-3.5 h-3.5" />
                上一页
              </button>
              <button className="w-6 h-6 bg-slate-100 text-[#002045] border border-slate-202 rounded-lg font-black flex items-center justify-center">
                1
              </button>
              <button className="p-1 px-3 border border-slate-150 rounded-lg text-slate-400 bg-white hover:bg-slate-50 flex items-center">
                下一页
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Feeds Sidebars (4/12 scope) */}
        <div className="xl:col-span-4 space-y-5">
          {/* Feed Card 1: Dispute control panel */}
          <div className="bg-white border border-slate-105 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-black text-slate-805 text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-slate-600" />
              质量反馈中心
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
              当前有 <span className="text-rose-600 font-extrabold px-0.5">0</span> 个质量问题需要回复。请保持关注，以及时处理质检异常，避免影响结算。
            </p>
            <button
              onClick={() => showToast("ℹ️ 当前没有需要复议或整改的异常批次件")}
              className="w-full py-2 bg-[#002045] hover:bg-[#07254a] hover:shadow-xs text-white rounded-xl font-black text-center transition-all cursor-pointer select-none"
            >
              回复质量问题
            </button>
          </div>

          {/* Feed Card 2: List of chronologically ordered update logs */}
          <div className="bg-white border border-slate-105 rounded-2xl p-5 shadow-xs space-y-4 select-none">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <Bell className="w-4.5 h-4.5 text-indigo-650" />
              最近动态
            </h4>

            {/* Timelines */}
            <div className="space-y-3.5 pl-1.5 text-[10px] font-medium leading-relaxed font-sans border-l border-slate-100">
              {/* Event 1 */}
              <div className="relative pl-3.5 space-y-0.2">
                <div className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-650 border border-white" />
                <span className="text-slate-400 block font-mono text-[9px]">今天 10:45 AM</span>
                <p className="text-slate-700 font-medium">
                  收到新打样任务 - 款号: <span className="text-indigo-600 font-bold font-mono">LN-2024-W05</span>
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative pl-3.5 space-y-0.2">
                <div className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 border border-white" />
                <span className="text-slate-400 block font-mono text-[9px]">昨天</span>
                <p className="text-slate-700 font-medium">
                  货款审核已通过 - 采购单: <span className="text-slate-700 font-bold font-mono">NO.88291</span>
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative pl-3.5 space-y-0.2">
                <div className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 border border-white" />
                <span className="text-slate-400 block font-mono text-[9px]">3天前</span>
                <p className="text-slate-600">
                  系统通知: 报价模板包更新 - 请下载最新 <span className="text-emerald-600 font-bold">V3.2 版本</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => showToast("⚡ 系统已加载全部24小时内时序事件动态记录")}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-bold rounded-xl text-center transition-colors cursor-pointer"
            >
              查看全部动态
            </button>
          </div>

          {/* Feed Card 3: Contact panel listing */}
          <div className="bg-[#fafbfe]/55 border border-slate-101 rounded-2xl p-4 flex items-center justify-between text-[11px] leading-snug">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-black">
                王
              </div>
              <div className="space-y-0.2 font-sans font-medium">
                <span className="font-bold text-slate-800 block">采购对接人 - 王小悦</span>
                <span className="text-[9.5px] text-slate-400 font-mono block">电话: 138-xxxx-5678</span>
              </div>
            </div>
            <a 
              href="tel:13800005678" 
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
              title="一键致电采购部"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Pop-up modals sheets for Interactive controls */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-[#001026]/40 backdrop-blur-xs"
            />

            {/* Modal Panel container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0.9 }}
              className="relative w-full max-w-sm bg-white border border-slate-100 rounded-2xl p-6 shadow-2xl flex flex-col space-y-4"
            >
              {/* Header */}
              <div className="pb-1 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h5 className="font-black text-slate-800 text-[13px]">
                    {modalType === "quote" ? "提报新款打样报价单" : modalType === "bill" ? "上传财务核对发票账单" : "产品款号设计说明"}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">请输入或上传相关上行结算、交付核心数据</p>
                </div>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 bg-[#f9fafc] rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Detail read-only preview */}
              {modalType === "detail" ? (
                <div className="space-y-3 font-sans text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                    <span className="text-[9px] text-slate-400 block">款号标志项</span>
                    <p className="font-bold text-slate-800 text-[13px]">{selectedSku}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                      <span>规格颜色: 默认定制款</span>
                      <span>工时成本: 45.00+13.00 CNY</span>
                      <span>生产时序: 30-45天</span>
                      <span>瑕疵控制要求: &lt;2.0%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalType(null)}
                    type="button"
                    className="w-full py-2 bg-[#002045] text-white font-extrabold rounded-xl text-center cursor-pointer"
                  >
                    我知道了
                  </button>
                </div>
              ) : (
                /* Interactive Forms */
                <form onSubmit={handleActionSubmit} className="space-y-3 text-xs leading-normal">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 block">
                      {modalType === "quote" ? "请选择款号" : "发票或账单附言"}
                    </span>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800">
                      <option value="LN-2024-W01">LN-2024-W01 - 雅致粉</option>
                      <option value="LN-2024-W02">LN-2024-W02 - 深邃蓝</option>
                      <option value="LN-2501-M10">LN-2501-M10 - 珍珠白</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 block">
                      {modalType === "quote" ? "核定单件成本 (CNY) *" : "上传物料/发票 PDF 或 JPG 回单 *"}
                    </span>
                    {modalType === "quote" ? (
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="请输入您的报价成本，例: 63.80"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    ) : (
                      <div className="border border-dashed border-slate-350 bg-slate-50/50 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer hover:bg-slate-50/80 transition-colors">
                        <FileText className="w-7 h-7 text-slate-405" />
                        <span className="font-extrabold text-[10.5px] text-slate-600">点击或将电子发票拖拽至此上传</span>
                        <span className="text-[9px] text-slate-400 block">支持 JPG, PNG, PDF 文件格式，最大限制 10MB</span>
                      </div>
                    )}
                  </div>

                  {modalType === "quote" && (
                    <div className="space-y-1">
                      <span className="font-bold text-slate-550 block">货期时效及打样规格说明</span>
                      <textarea
                        rows={2}
                        placeholder="例：纯棉爬服，面料克重220g，首批订单需要35天供货..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2.5 font-bold">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-1.8 text-slate-500 hover:text-slate-705 border border-slate-205 bg-white hover:bg-slate-50 rounded-xl leading-none cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.8 bg-[#002045] text-white hover:bg-[#07244a] rounded-xl leading-none transition-all shadow-xs cursor-pointer"
                    >
                      保存并提交
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
