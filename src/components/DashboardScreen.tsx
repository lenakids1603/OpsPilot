/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BarChart3, Cpu, Hammer, LogOut, Sun, Calendar, ShieldCheck, HelpCircle, RefreshCw, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BusinessAnalysis from "./BusinessAnalysis";
import DepartmentTools from "./DepartmentTools";
import AutomationHub from "./AutomationHub";

interface DashboardScreenProps {
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardScreen({ userEmail, onLogout }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "tools" | "automation">("analysis");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Clock updating hook
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setCurrentDate(now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="dashboard-layout" className="min-h-screen bg-[#f8f9ff] flex flex-col md:flex-row text-[#0b1c30] font-sans antialiased select-none">
      
      {/* Sidebar Navigation (Left Rail) */}
      <aside 
        id="dashboard-sidebar" 
        className="w-full md:w-64 bg-[#002045] text-white flex flex-col justify-between border-r border-[#1a365d] shadow-sm flex-shrink-0"
      >
        <div className="p-6">
          {/* Brand Logo Header */}
          <div className="flex items-center space-x-3 pb-6 border-b border-white/10">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-[#002045] shadow-xs">
              <span className="font-serif text-lg tracking-tight">LN</span>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white leading-none">Lenakids</h2>
              <span className="text-[10px] font-bold text-sky-400 tracking-wider">OpsPilot Hub</span>
            </div>
          </div>

          {/* Tab Selection Navigation Linkage */}
          <nav className="mt-8 space-y-1.5">
            {/* Tab: Business Analysis */}
            <button
              onClick={() => setActiveTab("analysis")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "analysis" 
                  ? "bg-[#0ea5e9] text-white shadow-xs" 
                  : "text-[#86a0cd] hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5 flex-shrink-0" />
              <span>经营数据分析后台</span>
            </button>

            {/* Tab: Department Tools */}
            <button
              onClick={() => setActiveTab("tools")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "tools" 
                  ? "bg-[#0ea5e9] text-white shadow-xs" 
                  : "text-[#86a0cd] hover:text-white hover:bg-white/5"
              }`}
            >
              <Hammer className="w-4.5 h-4.5 flex-shrink-0" />
              <span>部门辅助工具</span>
            </button>

            {/* Tab: Automation Hub */}
            <button
              onClick={() => setActiveTab("automation")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "automation" 
                  ? "bg-[#0ea5e9] text-white shadow-xs" 
                  : "text-[#86a0cd] hover:text-white hover:bg-white/5"
              }`}
            >
              <Cpu className="w-4.5 h-4.5 flex-shrink-0" />
              <span>自动化减负系统</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer detailing Operator details */}
        <div className="p-4 border-t border-white/10 bg-black/10 text-xs">
          <div className="flex items-center space-x-2.5 text-slate-300">
            <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400/30 text-sky-300">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate min-w-0 flex-grow">
              <p className="font-bold text-white text-[11px] truncate">{userEmail}</p>
              <span className="text-[9px] font-medium text-sky-400 block font-mono">授权值班工号 #LN9812</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2 border border-white/15 hover:bg-white/5 rounded-lg text-xs font-bold text-[#86a0cd] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>注销退出账户</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Frame (Right fluid zone) */}
      <main id="dashboard-content" className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header details */}
        <header className="bg-white border-b border-slate-200/90 h-16 px-6 flex items-center justify-between shadow-xs select-none flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            <span className="text-[#002045] font-black">Lenakids SECURED ENVE_ZONE</span>
            <span className="text-slate-200">|</span>
            <span className="hidden sm:inline-block">系统级中间层链路全部运转良好</span>
          </div>

          <div className="flex items-center space-x-4.5">
            {/* Realtime UTC Date Clock */}
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
              onClick={() => alert("Lenakids OpsPilot 行政总控：如有任何接口或功能疑问，可直接进入 [部门辅助工具] 模块向内置的 Gemini 3.5 AI 业务诊断助理提问解答。")}
              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#002045] rounded-lg transition-colors"
              title="求助中心"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body rendering space inside standard viewport limits */}
        <div className="flex-grow p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="h-full"
            >
              {activeTab === "analysis" && <BusinessAnalysis />}
              {activeTab === "tools" && <DepartmentTools />}
              {activeTab === "automation" && <AutomationHub />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mini Status Grid footer */}
        <footer className="h-9 px-6 bg-white border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-medium font-mono flex-shrink-0">
          <div className="flex items-center space-x-3.5">
            <span>● PROD_INGRESS: RUNNING</span>
            <span>|</span>
            <span>SYSTEM_TIME: 2026-05-22</span>
          </div>
          <div>
            <span>OpsPilot Enterprise Portal v2.4.9</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
