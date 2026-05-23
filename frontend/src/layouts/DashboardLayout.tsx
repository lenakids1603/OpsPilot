/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  LogOut, User, ChevronDown, ChevronRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "../components/sidebar/Sidebar";
import TopHeader from "../components/header/TopHeader";
import { MENU_ITEMS } from "../config/menu";
import { renderRegisteredView } from "../routes/viewRegistry";
import { getApiMode } from "../api/client";

interface DashboardLayoutProps {
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardLayout({ userEmail, onLogout }: DashboardLayoutProps) {
  // Navigation states
  const [selectedParent, setSelectedParent] = useState<string>("工作台");
  const [selectedSub, setSelectedSub] = useState<string>("经营概览");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    "工作台": true
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [apiMode, setApiMode] = useState<string>(getApiMode());

  // Listen back-end status/sandbox triggers
  useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setApiMode(customEvent.detail);
      }
    };
    window.addEventListener("api-mode-change", handleModeChange);
    return () => window.removeEventListener("api-mode-change", handleModeChange);
  }, []);

  // Clock updating hook
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setCurrentDate(now.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Expand / collapse header handler
  const handleToggleParent = (title: string) => {
    setExpandedParents(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Submenu selection handler
  const handleSelectSubmenu = (parentTitle: string, subTitle: string) => {
    setSelectedParent(parentTitle);
    setSelectedSub(subTitle);
  };

  return (
    <div id="dashboard-layout" className="min-h-screen bg-[#f8f9ff] flex flex-col md:flex-row text-[#0b1c30] font-sans antialiased overflow-hidden select-none">
      
      {/* Mobile Drawer Navigation (Slide-out menu like 2026krabi.lenakids.com) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            {/* Sliding Mobile Menu Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#002045] text-white z-[70] shadow-2xl flex flex-col pt-5"
            >
              {/* Close Button X */}
              <div className="absolute top-4 right-4">
                <button 
                  onClick={closeMenu} 
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="关闭菜单"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brand Header */}
              <div className="px-5 mb-5 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-[#002045] shadow-xs">
                    <span className="font-serif text-lg tracking-tight">LN</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white leading-none">Lenakids</h2>
                    <span className="text-[10px] font-bold text-sky-400 tracking-wider">OpsPilot ERP</span>
                  </div>
                </div>
              </div>

              {/* Scrollable multi-level Accordion list inside drawer */}
              <div className="flex-grow overflow-y-auto px-3 py-2 space-y-1">
                {MENU_ITEMS.map((parent) => {
                  const isExpanded = !!expandedParents[parent.title];
                  const isActiveParent = selectedParent === parent.title;

                  return (
                    <div key={parent.title} className="space-y-1.5">
                      {/* First-level accordion head */}
                      <button
                        onClick={() => handleToggleParent(parent.title)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                          isActiveParent 
                            ? "bg-white/10 text-white font-extrabold" 
                            : "text-[#86a0cd] hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {parent.icon}
                          <span>{parent.title}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {/* Submenu lists with exit state */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden pl-7.5 py-1.5 space-y-1.5"
                          >
                            {parent.submenus.map((sub) => {
                              const isSelected = selectedParent === parent.title && selectedSub === sub;
                              return (
                                <button
                                  key={sub}
                                  onClick={() => {
                                    handleSelectSubmenu(parent.title, sub);
                                    closeMenu(); // Auto close menu drawer
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-md text-[11px] font-bold transition-all leading-normal cursor-pointer ${
                                    isSelected
                                      ? "text-white bg-sky-500 font-extrabold shadow-sm"
                                      : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                                  }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Footer detailing Operator details */}
              <div className="p-4 border-t border-white/5 bg-black/15 text-xs flex-shrink-0">
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
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="w-full mt-4 flex items-center justify-center space-x-2 py-1.8 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-[#86a0cd] hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>注销退出账户</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation - Desktop Left Rail */}
      <Sidebar 
        selectedParent={selectedParent}
        selectedSub={selectedSub}
        expandedParents={expandedParents}
        handleToggleParent={handleToggleParent}
        handleSelectSubmenu={handleSelectSubmenu}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      {/* Main Panel Frame (Right fluid zone) */}
      <main id="dashboard-content" className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Responsive Header (Top bar) */}
        <TopHeader 
          selectedParent={selectedParent}
          selectedSub={selectedSub}
          currentTime={currentTime}
          currentDate={currentDate}
          toggleMenu={toggleMenu}
        />

        {/* Dynamic Tab Body rendering space inside standard viewport limits */}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-[#f8f9ff]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedParent}-${selectedSub}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="min-h-full pb-8"
            >
              {renderRegisteredView(selectedParent, selectedSub)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mini Status Grid footer detailing multi-AI collaborative guidelines */}
        <footer className="h-9 px-4 md:px-6 bg-white border-t border-slate-200/80 flex items-center justify-between text-[9px] md:text-[10px] text-slate-400 font-medium font-mono flex-shrink-0">
          <div className="flex items-center space-x-2 md:space-x-3.5 overflow-hidden">
            <div className="flex items-center space-x-1.5 truncate opacity-90">
              <span className={`w-1.5 h-1.5 rounded-full ${apiMode.includes("Sandbox") ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
              <span className={apiMode.includes("Sandbox") ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                API_MODE: {apiMode.toUpperCase()}
              </span>
            </div>
            <span className="hidden leading-none md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-400 select-all">
              OWNER: <span className="text-[#002045]/75 font-semibold">AI-STUDIO (FRONTEND)</span> & <span className="text-sky-600 font-semibold">CODEX (BACKEND & INFRA)</span>
            </span>
          </div>
          <div className="flex-shrink-0 text-slate-400">
            <span className="hidden xs:inline">Lenakids OpsPilot Enterprise Portal v2.5.0</span>
            <span className="xs:hidden">v2.5.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
