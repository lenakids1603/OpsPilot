/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, HelpCircle, Menu } from "lucide-react";

interface TopHeaderProps {
  selectedParent: string;
  selectedSub: string;
  currentTime: string;
  currentDate: string;
  toggleMenu: () => void;
}

export default function TopHeader({
  selectedParent,
  selectedSub,
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

      {/* Desktop header information (Visible only on desktop) */}
      <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-slate-400">
        <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
        <span className="text-[#002045] font-black">Lenakids SECURED ENVE_ZONE</span>
        <span className="text-slate-200">|</span>
        <span className="hidden xl:inline-block">系统级中间层链路全部运转良好</span>
        <span className="text-slate-200 hidden xl:inline-block">|</span>
        <span className="text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full font-bold select-all leading-normal text-[10px]">
          {selectedParent} › {selectedSub}
        </span>
      </div>

      {/* Mobile Current Path Indicator (Visible only on mobile) */}
      <div className="md:hidden flex-grow px-2 truncate text-right">
        <span className="inline-block text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-bold leading-normal text-[10px] truncate max-w-[140px]">
          {selectedParent} › {selectedSub}
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
