/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  LogOut, User, X, LayoutDashboard, Package, FileText, 
  DollarSign, Award, ShieldAlert, PhoneCall
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SupplierSidebar from "../components/sidebar/SupplierSidebar";
import SupplierTopHeader from "../components/header/SupplierTopHeader";
import SupplierWorkspacePage from "../pages/settings/SupplierWorkspacePage";

interface SupplierPortalLayoutProps {
  userEmail: string;
  onLogout: () => void;
}

export default function SupplierPortalLayout({ userEmail, onLogout }: SupplierPortalLayoutProps) {
  // Navigation states mirroring company dashboard layout
  const [activeTab, setActiveTab] = useState<string>("工作台");
  const [openTabs, setOpenTabs] = useState<string[]>(["工作台"]);

  // Mobile drawer navigation toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

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

  // Handle opening a page / tab
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (!openTabs.includes(tab)) {
      setOpenTabs(prev => [...prev, tab]);
    }
  };

  // Handle closing a page / tab
  const handleCloseTab = (tab: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (tab === "工作台") return; // Keep "工作台" permanent as first tab

    const remainingTabs = openTabs.filter(t => t !== tab);
    setOpenTabs(remainingTabs);

    if (activeTab === tab) {
      // If we closed the active tab, switch to the last open tab
      setActiveTab(remainingTabs[remainingTabs.length - 1] || "工作台");
    }
  };

  const MENU_ITEMS = [
    { title: "工作台", icon: <LayoutDashboard className="w-4 h-4" /> },
    { title: "我的订单", icon: <Package className="w-4 h-4" /> },
    { title: "款式报价", icon: <FileText className="w-4 h-4" /> },
    { title: "对账结算", icon: <DollarSign className="w-4 h-4" /> },
    { title: "考核排名", icon: <Award className="w-4 h-4" /> },
    { title: "客户投诉", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div id="supplier-portal-root" className="min-h-screen bg-[#f8f9ff] flex flex-col md:flex-row text-[#0b1c30] font-sans antialiased overflow-hidden select-none">
      
      {/* Mobile Drawer Navigation (Slide-out menu matching company layout but with green/teal colors) */}
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
              className="fixed inset-y-0 left-0 w-[280px] bg-[#012b24] text-white z-[70] shadow-2xl flex flex-col pt-5"
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
                  <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
                    <span className="font-serif text-lg tracking-tight">LN</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white leading-none">Lenakids</h2>
                    <span className="text-[10px] font-bold text-sky-400 tracking-wider">供应商协同门户</span>
                  </div>
                </div>
              </div>

              {/* Scrollable list inside drawer */}
              <div className="flex-grow overflow-y-auto px-3 py-2 space-y-1.5">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3.5 mb-2.5">
                  供应商功能
                </div>
                {MENU_ITEMS.map((item) => {
                  const isActive = activeTab === item.title;

                  return (
                    <button
                      key={item.title}
                      onClick={() => {
                        handleSelectTab(item.title);
                        closeMenu(); // Auto close menu drawer
                      }}
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

              {/* Sidebar Footer detailing Operator details */}
              <div className="p-4 border-t border-white/5 bg-black/15 text-xs flex-shrink-0 space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
                  <div className="text-[9.5px] leading-tight text-slate-300">
                    <span className="font-bold text-white block">专线王工</span>
                    <span>138-xxxx-5678</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-slate-300">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate min-w-0 flex-grow">
                    <p className="font-bold text-white text-[11px] truncate">{userEmail}</p>
                    <span className="text-[9px] font-medium text-emerald-400 block font-mono">核准合作供应商</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-1.8 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>注销退出门户</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation - Desktop Left Rail with custom green tint background */}
      <SupplierSidebar 
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      {/* Main Panel Frame (Right fluid zone) */}
      <main id="supplier-portal-content" className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Responsive Header (Top bar) */}
        <SupplierTopHeader 
          tabs={openTabs}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          currentTime={currentTime}
          currentDate={currentDate}
          toggleMenu={toggleMenu}
        />

        {/* Dynamic Inner Tab View Space */}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-[#f8f9ff]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="min-h-full pb-8"
            >
              <SupplierWorkspacePage 
                userEmail={userEmail} 
                onLogout={onLogout} 
                activeTab={activeTab} 
                setActiveTab={handleSelectTab}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mini Status Grid footer detailing supplier portals metadata */}
        <footer className="h-9 px-4 md:px-6 bg-white border-t border-slate-200/80 flex items-center justify-between text-[9px] md:text-[10px] text-slate-400 font-medium font-mono flex-shrink-0">
          <div className="flex items-center space-x-2 md:space-x-3.5 overflow-hidden">
            <div className="flex items-center space-x-1.5 truncate opacity-90 text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>EXTERNAL COOPERATIVE SECURITY SHIELD INTENSITY HIGH</span>
            </div>
            <span className="hidden leading-none md:inline text-slate-300">|</span>
            <span className="hidden md:inline select-all">
              EXTERNAL PORT: <span className="text-emerald-700 font-bold">LENAKIDS SUPPLY CHAIN PORTAL</span>
            </span>
          </div>
          <div className="flex-shrink-0">
            <span className="hidden xs:inline">杭州织锦服饰 & Lenakids ERP Backbone v2.5.0</span>
            <span className="xs:hidden">v2.5.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
