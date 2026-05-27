/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, HelpCircle, Menu, X, Home } from "lucide-react";

export interface OpenTab {
  parent: string;
  sub: string;
}

interface TopHeaderProps {
  tabs: OpenTab[];
  activeTabIndex: number;
  onSelectTab: (index: number) => void;
  onCloseTab: (index: number, event: React.MouseEvent) => void;
  currentTime: string;
  currentDate: string;
  toggleMenu: () => void;
}

export default function TopHeader({
  tabs,
  activeTabIndex,
  onSelectTab,
  onCloseTab,
  currentTime,
  currentDate,
  toggleMenu,
}: TopHeaderProps) {
  const handleHelpDialog = () => {
    alert("Lenakids OpsPilot 行政总控：如有任何接口或功能疑问，可直接进入 [设计开发 -> 设计方案] 模块向内置 of Gemini 3.5 AI 业务诊断助理提问解答。");
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between shadow-xs select-none flex-shrink-0">
      
      {/* Mobile hamburger button + logo (Visible only on mobile) */}
      <div className="flex items-center space-x-2 md:hidden">
        <button 
          onClick={toggleMenu}
          className="p-1.5 hover:bg-slate-50 text-[#002045] rounded-full transition-colors flex-shrink-0 cursor-pointer"
          title="打开菜单"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <div className="w-6.5 h-6.5 bg-[#002045] rounded-md flex items-center justify-center font-bold text-white text-[10px]">
            <span className="font-serif">LN</span>
          </div>
          <div className="leading-none">
            <h1 className="text-xs font-black text-[#002045] tracking-tight leading-none mb-0.5">Lenakids</h1>
            <span className="text-[8px] font-bold text-sky-500 font-mono tracking-wide leading-none">OpsPilot</span>
          </div>
        </div>
      </div>

      {/* Modern High-Fidelity ERP Tab Bar */}
      <div className="hidden md:flex items-end flex-grow mr-4 overflow-x-auto scrollbar-none h-full pt-2 gap-1.5">
        {tabs.map((tab, idx) => {
          const isActive = idx === activeTabIndex;
          // In SaaS UI: first tab is permanent and titled "系统首页"
          const tabTitle = idx === 0 ? "系统首页" : tab.sub;
          
          return (
            <div
              key={`${tab.parent}-${tab.sub}-${idx}`}
              onClick={() => onSelectTab(idx)}
              className={`group relative flex items-center h-[38px] px-4.5 text-[13px] font-medium cursor-pointer select-none transition-all rounded-t-lg border-t border-x ${
                isActive 
                  ? "bg-white text-[#006591] border-slate-200 border-t-2 border-t-[#006591] -mb-[1px] z-10 font-bold shadow-[0_-2px_6px_rgba(0,0,0,0.03)]" 
                  : "bg-slate-50/70 hover:bg-slate-100 hover:text-slate-800 text-slate-500 border-transparent border-b-slate-200"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {idx === 0 ? (
                  <Home className={`w-3.5 h-3.5 ${isActive ? "text-[#006591]" : "text-slate-400 group-hover:text-slate-500"}`} />
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#006591]" : "bg-slate-300 group-hover:bg-slate-400"}`} />
                )}
                
                <span className="whitespace-nowrap select-none tracking-normal">{tabTitle}</span>
              </div>
              
              {idx !== 0 && (
                <button
                  onClick={(e) => onCloseTab(idx, e)}
                  className="w-4 h-4 ml-2.5 inline-flex items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  title="关闭标签"
                >
                  <X className="w-3 h-3" />
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
        <span className="inline-block text-[#1890ff] bg-[#1890ff]/5 px-2.5 py-1 rounded-full font-bold leading-normal text-[10px] truncate max-w-[140px]">
          {tabs[activeTabIndex]?.sub || "OpsPilot"}
        </span>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4.5">
        {/* Realtime UTC Date Clock (Desktop Only) */}
        <div className="text-right hidden md:block">
          <span className="text-[10px] font-bold text-slate-400 block font-mono">
            {currentDate}
          </span>
          <span className="text-xs font-bold text-[#002045] font-mono leading-none tracking-wide">
            🕒 {currentTime} (Beijing Time)
          </span>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

        {/* Quick action: help */}
        <button 
          onClick={handleHelpDialog}
          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#002045] rounded-lg transition-colors cursor-pointer"
          title="求助中心"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
