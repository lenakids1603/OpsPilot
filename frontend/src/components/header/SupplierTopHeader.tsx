/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldAlert, HelpCircle, Menu, X, Home } from "lucide-react";

interface SupplierTopHeaderProps {
  tabs: string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onCloseTab?: (tab: string, event: React.MouseEvent) => void;
  currentTime: string;
  currentDate: string;
  toggleMenu: () => void;
}

export default function SupplierTopHeader({
  tabs,
  activeTab,
  onSelectTab,
  onCloseTab,
  currentTime,
  currentDate,
  toggleMenu,
}: SupplierTopHeaderProps) {
  const handleHelpDialog = () => {
    alert("供应商业务提示：如有任何排程、结算或质检数据的异议疑问，请直接致电提报口径专线（王工: 138-xxxx-5678）或点击功能板面中的在线申请复议。");
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between shadow-xs select-none flex-shrink-0">
      
      {/* Mobile hamburger button + logo (Visible only on mobile) */}
      <div className="flex items-center space-x-2 md:hidden">
        <button 
          onClick={toggleMenu}
          className="p-1.5 hover:bg-slate-50 text-[#012b24] rounded-full transition-colors flex-shrink-0 cursor-pointer"
          title="打开菜单"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <div className="w-6.5 h-6.5 bg-[#012b24] rounded-md flex items-center justify-center font-bold text-white text-[10px]">
            <span className="font-serif">LN</span>
          </div>
          <div className="leading-none">
            <h1 className="text-xs font-black text-[#012b24] tracking-tight leading-none mb-0.5">Lenakids</h1>
            <span className="text-[8px] font-bold text-emerald-500 font-mono tracking-wide leading-none">External</span>
          </div>
        </div>
      </div>

      {/* Modern High-Fidelity ERP Tab Bar */}
      <div className="hidden md:flex items-end flex-grow mr-4 overflow-x-auto scrollbar-none h-full pt-2 gap-1.5">
        {tabs.map((tab, idx) => {
          const isActive = tab === activeTab;
          
          return (
            <div
              key={`${tab}-${idx}`}
              onClick={() => onSelectTab(tab)}
              className={`group relative flex items-center h-[38px] px-4.5 text-[13px] font-medium cursor-pointer select-none transition-all rounded-t-lg border-t border-x ${
                isActive 
                  ? "bg-white text-emerald-700 border-slate-200 border-t-2 border-t-emerald-600 -mb-[1px] z-10 font-bold shadow-[0_-2px_6px_rgba(0,0,0,0.03)]" 
                  : "bg-slate-50/70 hover:bg-slate-100 hover:text-slate-800 text-slate-500 border-transparent border-b-slate-200"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {idx === 0 ? (
                  <Home className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-slate-300 group-hover:bg-slate-400"}`} />
                )}
                
                <span className="whitespace-nowrap select-none tracking-normal">{tab}</span>
              </div>
              
              {idx !== 0 && onCloseTab && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab, e);
                  }}
                  className="w-4 h-4 ml-2.5 inline-flex items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  title="关闭标签"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Bottom active block highlight proxy */}
              {isActive && (
                <div className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-white z-20" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Current Path Indicator (Visible only on mobile) */}
      <div className="md:hidden flex-grow px-2 truncate text-right">
        <span className="inline-block text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold leading-normal text-[10px] truncate max-w-[140px]">
          {activeTab}
        </span>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4.5">
        {/* Realtime UTC Date Clock (Desktop Only) */}
        <div className="text-right hidden md:block">
          <span className="text-[10px] font-bold text-slate-400 block font-mono">
            {currentDate}
          </span>
          <span className="text-xs font-bold text-[#012b24] font-mono leading-none tracking-wide">
            🕒 {currentTime} (Beijing Time)
          </span>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

        {/* Quick action: help */}
        <button 
          onClick={handleHelpDialog}
          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#012b24] rounded-lg transition-colors cursor-pointer"
          title="供应商协同规则求助"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
