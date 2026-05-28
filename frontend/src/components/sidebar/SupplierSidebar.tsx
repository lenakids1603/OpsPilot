/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LogOut, User, LayoutDashboard, Package, FileText, 
  DollarSign, Award, ShieldAlert, PhoneCall
} from "lucide-react";

interface SupplierSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
}

export default function SupplierSidebar({
  activeTab,
  setActiveTab,
  userEmail,
  onLogout,
}: SupplierSidebarProps) {
  const MENU_ITEMS = [
    { title: "工作台", icon: <LayoutDashboard className="w-4 h-4" /> },
    { title: "我的订单", icon: <Package className="w-4 h-4" /> },
    { title: "款式报价", icon: <FileText className="w-4 h-4" /> },
    { title: "对账结算", icon: <DollarSign className="w-4 h-4" /> },
    { title: "考核排名", icon: <Award className="w-4 h-4" /> },
    { title: "客户投诉", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <aside 
      id="supplier-sidebar" 
      className="hidden md:flex md:w-68 bg-[#012b24] text-white flex-col justify-between border-r border-[#0d3f34] shadow-sm flex-shrink-0 h-screen overflow-hidden"
    >
      {/* Brand Header */}
      <div className="p-5 flex-shrink-0 border-b border-white/5 bg-black/15">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
            <span className="font-serif text-lg tracking-tight">LN</span>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white leading-none">Lenakids</h2>
            <span className="text-[9.5px] font-black text-emerald-450 tracking-wider">供应商协同门户</span>
          </div>
        </div>
      </div>

      {/* Flat List of Menu Items */}
      <div className="flex-grow overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="text-[10px] font-black text-slate-400/80 uppercase tracking-widest px-3.5 mb-2.5">
          供应商主功能导航
        </div>

        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.title;

          return (
            <button
              key={item.title}
              onClick={() => setActiveTab(item.title)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[12.5px] font-black transition-all cursor-pointer ${
                isActive 
                  ? "bg-white/10 text-emerald-400 border border-white/5 font-extrabold shadow-sm" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={isActive ? "text-emerald-400" : "text-slate-400"}>
                {item.icon}
              </span>
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom info desk & Footer detailing Operator details */}
      <div className="p-4 border-t border-white/5 bg-black/15 text-xs flex-shrink-0 space-y-4">
        {/* Support hotline info */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <div className="text-[10px] leading-tight text-slate-300">
            <span className="font-bold text-white block">采购专属服务</span>
            <span className="font-medium opacity-80 block mt-0.5">王小悦: 138-xxxx-5678</span>
          </div>
        </div>

        {/* User profile section */}
        <div className="flex items-center space-x-2.5 text-slate-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-300">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate min-w-0 flex-grow">
            <p className="font-bold text-white text-[11px] truncate">{userEmail}</p>
            <span className="text-[8.5px] font-bold text-emerald-400 block font-mono">核准外部供应商</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>注销退出门户</span>
        </button>
      </div>
    </aside>
  );
}
