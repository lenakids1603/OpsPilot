/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Users, CheckCircle2, Hourglass, Ban, Eye, UserPlus, Search, 
  ChevronRight, Laptop, Sparkles, X, Edit, SwitchCamera, ShieldCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SupplierAccount {
  id: string;
  name: string;
  contact: string;
  phone: string;
  role: string;
  canSubmitQuote: boolean;
  canSubmitDelivery: boolean;
  canSubmitBill: boolean;
  status: "已开通" | "待激活" | "已停用";
}

export default function SupplierAccountPage() {
  const [suppliers, setSuppliers] = useState<SupplierAccount[]>([
    { id: "SUPP-01", name: "杭州织锦服饰有限公司", contact: "张经理", phone: "138-8888-8888", role: "供应商", canSubmitQuote: true, canSubmitDelivery: true, canSubmitBill: true, status: "已开通" },
    { id: "SUPP-02", name: "广州领航纺织", contact: "李工", phone: "135-1234-6721", role: "供应商", canSubmitQuote: true, canSubmitDelivery: false, canSubmitBill: false, status: "已开通" },
    { id: "SUPP-03", name: "苏州锦绣云绸", contact: "王总", phone: "137-9876-4432", role: "供应商", canSubmitQuote: true, canSubmitDelivery: false, canSubmitBill: true, status: "已开通" },
    { id: "SUPP-04", name: "南通常春织染厂", contact: "朱厂长", phone: "136-4455-8812", role: "供应商", canSubmitQuote: false, canSubmitDelivery: true, canSubmitBill: false, status: "待激活" },
    { id: "SUPP-05", name: "绍兴盛景面料商行", contact: "顾总", phone: "189-5751-2299", role: "供应商", canSubmitQuote: false, canSubmitDelivery: false, canSubmitBill: false, status: "已停用" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierAccount | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formQuote, setFormQuote] = useState(true);
  const [formDelivery, setFormDelivery] = useState(true);
  const [formBill, setFormBill] = useState(true);
  const [formStatus, setFormStatus] = useState<"已开通" | "待激活" | "已停用">("已开通");

  // Selected supplier for interactive preview highlight
  const [selectedPreviewIdx, setSelectedPreviewIdx] = useState(0);
  const activePreviewSupplier = suppliers[selectedPreviewIdx] || suppliers[0];

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filter list
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.includes(searchQuery) || 
      s.contact.includes(searchQuery) || 
      s.phone.includes(searchQuery)
    );
  }, [suppliers, searchQuery]);

  // Handle save/create
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formContact || !formPhone) {
      alert("请填写完备基础供应商档案");
      return;
    }

    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? {
        ...s,
        name: formName,
        contact: formContact,
        phone: formPhone,
        canSubmitQuote: formQuote,
        canSubmitDelivery: formDelivery,
        canSubmitBill: formBill,
        status: formStatus
      } : s));
      showToast(`📝 供应商 [${formName}] 数据更新成功！`);
    } else {
      const newSup: SupplierAccount = {
        id: `SUPP-${String(suppliers.length + 1).padStart(2, "0")}`,
        name: formName,
        contact: formContact,
        phone: formPhone,
        role: "供应商",
        canSubmitQuote: formQuote,
        canSubmitDelivery: formDelivery,
        canSubmitBill: formBill,
        status: formStatus
      };
      setSuppliers(prev => [...prev, newSup]);
      showToast(`✨ 成功创建供应商账号 [${formName}]！`);
    }
    setIsModalOpen(false);
  };

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormName("");
    setFormContact("");
    setFormPhone("");
    setFormQuote(true);
    setFormDelivery(true);
    setFormBill(true);
    setFormStatus("已开通");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: SupplierAccount) => {
    setEditingSupplier(sup);
    setFormName(sup.name);
    setFormContact(sup.contact);
    setFormPhone(sup.phone);
    setFormQuote(sup.canSubmitQuote);
    setFormDelivery(sup.canSubmitDelivery);
    setFormBill(sup.canSubmitBill);
    setFormStatus(sup.status);
    setIsModalOpen(true);
  };

  // Fast toggle permission tag on row click
  const handleToggleColumnPermission = (id: string, field: "quote" | "delivery" | "bill") => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          canSubmitQuote: field === "quote" ? !s.canSubmitQuote : s.canSubmitQuote,
          canSubmitDelivery: field === "delivery" ? !s.canSubmitDelivery : s.canSubmitDelivery,
          canSubmitBill: field === "bill" ? !s.canSubmitBill : s.canSubmitBill
        };
      }
      return s;
    }));
    showToast(`🔒 更改了操作提交权限点`);
  };

  return (
    <div className="space-y-6">
      {/* Toast popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[999] p-4 bg-emerald-600 border border-emerald-500 rounded-xl shadow-2xl flex items-center gap-2.5 text-white text-xs font-bold leading-none select-none"
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top statistical grid row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Metric 1 - Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold block">供应商总数</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{9 + suppliers.length + 70}</span>
              <span className="text-[10px] font-bold text-emerald-600 px-1.5 py-0.2 rounded-full bg-emerald-50/70 select-none">
                ↑ 12%
              </span>
            </div>
          </div>
          <div className="w-11 h-11 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-slate-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 - Opened */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold block">已开通</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {suppliers.filter(s => s.status === "已开通").length + 69}
              </span>
              <span className="text-[9.5px] font-medium text-slate-400">
                活跃率 <span className="text-emerald-600 font-bold">85%</span>
              </span>
            </div>
          </div>
          <div className="w-11 h-11 bg-emerald-50/30 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Metric 3 - Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold block">待激活</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {suppliers.filter(s => s.status === "待激活").length + 4}
              </span>
              <span className="text-[10px] text-amber-600 font-black">需跟进</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-amber-50/30 border border-amber-100 rounded-xl flex items-center justify-center text-amber-500">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 - Disabled */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold block">已停用</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-500 tracking-tight">
                {suppliers.filter(s => s.status === "已停用").length + 6}
              </span>
              <span className="text-[10px] text-rose-500 font-black">账号异常</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-rose-50/30 border border-rose-100 rounded-xl flex items-center justify-center text-rose-500">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Split visual area - Table名录 on Left, phone preview on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Supplier Table List (8/12 scope) */}
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Header row */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-800">供应商名录</h3>
              <p className="text-[10px] text-slate-400 font-medium font-sans">配置合伙工厂的二级网银账号及受限上行提报模块</p>
            </div>
            
            {/* Filter searching and add action buttons */}
            <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-48 bg-white rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索供应商/联系人..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 outline-none font-sans text-xs"
                />
              </div>

              {/* Add */}
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-[#002045] hover:bg-[#07264c] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>新增供应商</span>
              </button>
            </div>
          </div>

          {/* Supplier Grid list table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-600 border-collapse">
              <thead className="bg-[#fcfdfe] text-[10.5px] border-b border-slate-100 uppercase font-black text-slate-400">
                <tr>
                  <th className="p-4 pl-6 font-bold">供应商名称</th>
                  <th className="p-4 font-bold">联系人</th>
                  <th className="p-4 font-bold">手机号码</th>
                  <th className="p-4 font-bold">配分角色</th>
                  <th className="p-4 font-bold">可提报内容配置 (点击快速设定)</th>
                  <th className="p-4 font-bold pr-6">详情预览</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans tracking-wide">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      暂无对应的供应商数据记录
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup, idx) => (
                    <tr 
                      key={sup.id} 
                      onClick={() => setSelectedPreviewIdx(idx)}
                      className={`hover:bg-indigo-50/10 cursor-pointer transition-colors ${
                        activePreviewSupplier.id === sup.id ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      <td className="p-4 pl-6">
                        <span className="font-bold text-slate-800 text-[12px] block leading-normal select-all">
                          {sup.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            sup.status === "已开通" ? "bg-emerald-500 animate-pulse" : sup.status === "待激活" ? "bg-amber-400" : "bg-slate-300"
                          }`} />
                          <span className="text-slate-400 font-medium font-sans">账户状态: {sup.status}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{sup.contact}</td>
                      <td className="p-4 font-mono text-slate-500">{sup.phone}</td>
                      <td className="p-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9.5px] font-black border border-indigo-100">
                          {sup.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {/* Quote Tag toggle */}
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleToggleColumnPermission(sup.id, "quote"); 
                            }}
                            className={`px-2 py-1 rounded text-[9.5px] font-medium transition-all ${
                              sup.canSubmitQuote 
                                ? "bg-indigo-600 text-white font-bold shadow-xs hover:bg-indigo-700" 
                                : "bg-slate-100 text-slate-400 hover:bg-slate-205"
                            }`}
                          >
                            报价
                          </button>
                          {/* Delivery Tag toggle */}
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleToggleColumnPermission(sup.id, "delivery"); 
                            }}
                            className={`px-2 py-1 rounded text-[9.5px] font-medium transition-all ${
                              sup.canSubmitDelivery 
                                ? "bg-sky-600 text-white font-bold shadow-xs hover:bg-sky-700" 
                                : "bg-slate-100 text-slate-400 hover:bg-slate-205"
                            }`}
                          >
                            交期
                          </button>
                          {/* Bill Tag toggle */}
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleToggleColumnPermission(sup.id, "bill"); 
                            }}
                            className={`px-2 py-1 rounded text-[9.5px] font-medium transition-all ${
                              sup.canSubmitBill 
                                ? "bg-slate-650 text-white font-bold shadow-xs hover:bg-slate-750" 
                                : "bg-slate-100 text-slate-400 hover:bg-slate-205"
                            }`}
                          >
                            账单
                          </button>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-slate-400 flex items-center justify-between mt-1 select-none">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleOpenEdit(sup); 
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          编辑
                        </button>
                        <ChevronRight className={`w-4.5 h-4.5 transition-transform ${
                          activePreviewSupplier.id === sup.id ? "text-indigo-600 translate-x-1" : "text-slate-300"
                        }`} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Column (4/12 scope) - Supplier mock phone model */}
        <div className="xl:col-span-4 space-y-6">
          {/* Mock Frame Wrapper */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <Laptop className="w-5 h-5 text-indigo-650" />
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                  供应商视角预览
                  <span className="bg-sky-50 text-sky-700 text-[8.5px] px-1.5 py-0.2 rounded font-black border border-sky-100 animate-pulse font-sans">
                    LIVE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">以「{activePreviewSupplier.contact}」身份查看受限界面子模块</p>
              </div>
            </div>

            {/* Mobile device shell preview screen */}
            <div className="border border-slate-150 rounded-2xl bg-slate-50/70 p-3 shadow-md relative overflow-hidden flex flex-col min-h-[300px] select-none font-sans">
              {/* Top Notch Status Bar */}
              <div className="h-6 flex items-center justify-between text-[9px] text-slate-400 font-bold px-2.5 font-sans">
                <span>09:41</span>
                <span className="bg-slate-200 text-slate-600 rounded px-1 text-[8px] font-mono leading-none py-0.5">Lenakids Ops v2.5</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span>5G</span>
                  <span className="w-4 h-2 rounded-xs border border-slate-400 bg-emerald-500" />
                </div>
              </div>

              {/* Mock App Shell Body */}
              <div className="bg-white rounded-xl border border-slate-150 flex-1 p-3 flex flex-col space-y-3 font-sans">
                {/* Brand title */}
                <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5.5 h-5.5 bg-[#002045] rounded flex items-center justify-center font-bold text-[8.5px] text-white">
                      LN
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-slate-800 leading-none">{activePreviewSupplier.name}</h5>
                      <span className="text-[7.5px] font-bold text-indigo-600 block leading-tight mt-0.5">对接人账号 - {activePreviewSupplier.contact}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[7.5px] px-1 py-0.2 rounded-full font-bold">
                    在线
                  </span>
                </div>

                {/* Left restricted Menu List */}
                <div className="space-y-1.5 flex-1">
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black block">系统导航菜单</span>
                  
                  {/* Item 1 - Dashboard - ALWAYS VISIBLE */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 text-indigo-700 font-bold text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>工作台</span>
                    </div>
                    <span className="text-[8px] font-bold bg-indigo-100 px-1 py-0.2 rounded leading-tight">核心</span>
                  </div>

                  {/* Item 2 - Material submittals - Conditional */}
                  <div className={`flex items-center justify-between p-2 rounded-lg text-[10px] border ${
                    activePreviewSupplier.canSubmitQuote || activePreviewSupplier.canSubmitDelivery
                      ? "bg-slate-50 border-slate-100 text-slate-700 font-bold"
                      : "bg-slate-100/50 border-slate-50 text-slate-300 line-through select-none"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        activePreviewSupplier.canSubmitQuote || activePreviewSupplier.canSubmitDelivery ? "bg-emerald-500" : "bg-slate-200"
                      }`} />
                      <span>资料提交 (报价/交期)</span>
                    </div>
                    {!(activePreviewSupplier.canSubmitQuote || activePreviewSupplier.canSubmitDelivery) && (
                      <span className="text-[7.5px] bg-slate-200 text-slate-400 px-1 py-0.2 rounded font-sans leading-none">无权</span>
                    )}
                  </div>

                  {/* Item 3 - Account Bills - Conditional */}
                  <div className={`flex items-center justify-between p-2 rounded-lg text-[10px] border ${
                    activePreviewSupplier.canSubmitBill
                      ? "bg-slate-50 border-slate-100 text-slate-700 font-bold"
                      : "bg-slate-100/50 border-slate-50 text-slate-300 line-through select-none"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${activePreviewSupplier.canSubmitBill ? "bg-slate-600" : "bg-slate-200"}`} />
                      <span>我的款号 / 结算账单</span>
                    </div>
                    {!activePreviewSupplier.canSubmitBill && (
                      <span className="text-[7.5px] bg-slate-200 text-slate-400 px-1 py-0.2 rounded font-sans leading-none">无权</span>
                    )}
                  </div>
                </div>

                {/* Inner alert panel status */}
                <div className="bg-[#fafbfe] border border-slate-100 rounded-lg p-2 flex items-center justify-between text-[8px] leading-relaxed">
                  <div className="space-y-0.5 text-slate-400">
                    <span>当前已授权操作权限:</span>
                    <p className="font-bold text-slate-700">
                      {[
                        activePreviewSupplier.canSubmitQuote ? "报价提报" : null,
                        activePreviewSupplier.canSubmitDelivery ? "生产交期" : null,
                        activePreviewSupplier.canSubmitBill ? "对账打款" : null
                      ].filter(Boolean).join(" • ") || "无上报特权 (已被全锁)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines explanation Card */}
          <div className="bg-[#002045] rounded-2xl p-5 text-white space-y-2 select-none border border-slate-900 shadow-md">
            <h5 className="font-black text-xs flex items-center gap-1.5 justify-start">
              <span>🛡️ 权限控制说明</span>
            </h5>
            <p className="text-[10px] text-slate-350 leading-relaxed font-sans">
              当前已通过专属安全隔离与角色权限阻断：
            </p>
            <ul className="text-[10px] text-slate-300 space-y-1.5 font-sans pl-1">
              <li className="flex items-start gap-1">
                <span className="text-sky-400 mt-0.5">•</span>
                <span>供应商登录后系统将锁死在「供应商专属工作台」页面级沙箱中，无法跨越到任何财务流水或后台设置视图</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-sky-400 mt-0.5">•</span>
                <span>如果您在左侧的表格中去除了其「报价」「交期」或「账单」授权，对应的供应商操作后台将在载入时进行动态屏蔽拦截</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Drawer Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 text-xs font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            {/* Dialog Panel Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Head */}
              <div className="p-5 border-b border-slate-100 bg-[#fafbfe] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 text-[13.5px]">
                    {editingSupplier ? "修改供应商账号权限" : "极速新增外部供应商账号"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">配置供应商的上行访问以及特定提报控制点</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg inline-flex items-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveSupplier} className="p-6 space-y-4 font-sans text-xs">
                {/* 1. Supplier Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">供应商企业全称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="输入供应商品牌/工商注册名称"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-sans text-slate-850"
                  />
                </div>

                {/* 2. Contact Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">核心对接人负责人 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="输入供应商经办人或老板全称"
                    value={formContact}
                    onChange={e => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-sans text-slate-850"
                  />
                </div>

                {/* 3. Mobile Number */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">移动电话号码 (登录用户名) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="绑定11位手机号码作为其登录凭据"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-slate-855"
                  />
                </div>

                {/* 4. Can submit permissions */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-500">可授权提报模块 (上行通道)</label>
                  <div className="space-y-1.5">
                    {/* Check Quote */}
                    <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer font-sans text-slate-700">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formQuote}
                          onChange={e => setFormQuote(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 cursor-pointer"
                        />
                        <div className="space-y-0.2">
                          <span className="font-bold block text-slate-800">款式报价提交</span>
                          <span className="text-[9.5px] text-slate-405 block">允许其在线提交打样报价和成本细分单</span>
                        </div>
                      </div>
                    </label>

                    {/* Check Delivery */}
                    <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer font-sans text-slate-700">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formDelivery}
                          onChange={e => setFormDelivery(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 cursor-pointer"
                        />
                        <div className="space-y-0.2">
                          <span className="font-bold block text-slate-800">生产进度与交期提报</span>
                          <span className="text-[9.5px] text-slate-405 block">允许其每日填报裁剪、排装、交库具体日进程</span>
                        </div>
                      </div>
                    </label>

                    {/* Check Bill */}
                    <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer font-sans text-slate-705">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formBill}
                          onChange={e => setFormBill(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 cursor-pointer"
                        />
                        <div className="space-y-0.2">
                          <span className="font-bold block text-slate-800">对账明细与发票上传</span>
                          <span className="text-[9.5px] text-slate-405 block">允许其在线对账、下载采购结余、上传发票</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 5. Status Choice */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">账户状态</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-sans bg-white text-slate-880"
                  >
                    <option value="已开通">启用网银 (已开通)</option>
                    <option value="待激活">暂不开通密码 (待激活)</option>
                    <option value="已停用">冻结/锁死其业务流程 (已停用)</option>
                  </select>
                </div>

                {/* Footer Save */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#002045] text-white hover:bg-[#06264d] rounded-xl shadow-xs cursor-pointer"
                  >
                    保存并激活
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
