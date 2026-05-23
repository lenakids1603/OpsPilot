/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  LogOut, ShieldCheck, HelpCircle, User,
  LayoutDashboard, TrendingUp, Boxes, Palette, ShoppingCart, Truck, Headphones, Percent, Database, Settings,
  ChevronDown, ChevronRight, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BusinessAnalysis from "./BusinessAnalysis";
import DepartmentTools from "./DepartmentTools";
import AutomationHub from "./AutomationHub";
import {
  TodayDataView, ExceptionAlertsView, PeriodicalReviewView, ShortcutEntriesView,
  StoreAnalysisView, ProductCatalogView, HeroStagnantView, InventoryTurnoverView,
  ProcurementPOView, LogisticsManifestView, RolePermissionsView
} from "./ERPSubmenuViews";

interface DashboardScreenProps {
  userEmail: string;
  onLogout: () => void;
}

// Full ERP menu structure as requested
const MENU_ITEMS = [
  {
    title: "工作台",
    icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />,
    submenus: ["经营总览", "今日数据", "异常提醒", "周月小结", "快捷入口"]
  },
  {
    title: "销售数据",
    icon: <TrendingUp className="w-4 h-4 flex-shrink-0" />,
    submenus: ["销售总览", "店铺分析", "商品销售", "退款分析", "销售波动"]
  },
  {
    title: "商品与库存",
    icon: <Boxes className="w-4 h-4 flex-shrink-0" />,
    submenus: ["商品总览", "爆品滞销", "库存预警", "库存周转", "毛利分析"]
  },
  {
    title: "设计开发",
    icon: <Palette className="w-4 h-4 flex-shrink-0" />,
    submenus: ["新品企划", "款式资料", "样品记录", "上新复盘", "竞品参考"]
  },
  {
    title: "采购与供应",
    icon: <ShoppingCart className="w-4 h-4 flex-shrink-0" />,
    submenus: ["采购总览", "采购成本", "到货分析", "供应商表现", "补货建议"]
  },
  {
    title: "发货履约",
    icon: <Truck className="w-4 h-4 flex-shrink-0" />,
    submenus: ["发货总览", "发货时效", "超时预警", "物流异常", "履约日报"]
  },
  {
    title: "客服售后",
    icon: <Headphones className="w-4 h-4 flex-shrink-0" />,
    submenus: ["售后总览", "退款退货", "差评客诉", "问题归因", "话术知识库"]
  },
  {
    title: "利润分析",
    icon: <Percent className="w-4 h-4 flex-shrink-0" />,
    submenus: ["利润总览", "商品利润", "店铺利润", "成本分析", "月度利润"]
  },
  {
    title: "数据中心",
    icon: <Database className="w-4 h-4 flex-shrink-0" />,
    submenus: ["数据源管理", "聚水潭同步", "表格导入", "指标口径", "同步日志"]
  },
  {
    title: "系统设置",
    icon: <Settings className="w-4 h-4 flex-shrink-0" />,
    submenus: ["员工账号", "部门设置", "权限设置", "菜单设置", "操作日志"]
  }
];

export default function DashboardScreen({ userEmail, onLogout }: DashboardScreenProps) {
  // Navigation states
  const [selectedParent, setSelectedParent] = useState<string>("工作台");
  const [selectedSub, setSelectedSub] = useState<string>("经营总览");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    "工作台": true
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

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

  // Render view controller mappings
  const renderActiveView = () => {
    // 1. WORKBENCH
    if (selectedParent === "工作台") {
      if (selectedSub === "经营总览") return <BusinessAnalysis initialDept="All" />;
      if (selectedSub === "今日数据") return <TodayDataView />;
      if (selectedSub === "异常提醒") return <ExceptionAlertsView />;
      if (selectedSub === "周月小结") return <PeriodicalReviewView />;
      if (selectedSub === "快捷入口") return <ShortcutEntriesView />;
    }

    // 2. SALES DATA
    if (selectedParent === "销售数据") {
      if (selectedSub === "销售总览") return <BusinessAnalysis initialDept="Sales" />;
      if (selectedSub === "店铺分析") return <StoreAnalysisView />;
      if (selectedSub === "商品销售") return <ProductCatalogView />;
      if (selectedSub === "退款分析") return <ExceptionAlertsView />;
      if (selectedSub === "销售波动") return <BusinessAnalysis initialDept="Sales" />;
    }

    // 3. GOODS & INVENTORY
    if (selectedParent === "商品与库存") {
      if (selectedSub === "商品总览") return <ProductCatalogView />;
      if (selectedSub === "爆品滞销") return <HeroStagnantView />;
      if (selectedSub === "库存预警") return <AutomationHub />;
      if (selectedSub === "库存周转") return <InventoryTurnoverView />;
      if (selectedSub === "毛利分析") return <BusinessAnalysis initialDept="All" />;
    }

    // 4. DESIGN & DEVELOPMENT
    if (selectedParent === "设计开发") {
      if (selectedSub === "新品企划") return <DepartmentTools />;
      if (selectedSub === "款式资料") return <ProductCatalogView />;
      if (selectedSub === "样品记录") return <ProcurementPOView />;
      if (selectedSub === "上新复盘") return <BusinessAnalysis initialDept="All" />;
      if (selectedSub === "竞品参考") return <StoreAnalysisView />;
    }

    // 5. PROCUREMENT & WEAVING
    if (selectedParent === "采购与供应") {
      if (selectedSub === "采购总览") return <ProcurementPOView />;
      if (selectedSub === "采购成本") return <BusinessAnalysis initialDept="All" />;
      if (selectedSub === "到货分析") return <LogisticsManifestView />;
      if (selectedSub === "供应商表现") return <ProcurementPOView />;
      if (selectedSub === "补货建议") return <InventoryTurnoverView />;
    }

    // 6. LOGISTICS FULFILLMENT
    if (selectedParent === "发货履约") {
      if (selectedSub === "发货总览") return <LogisticsManifestView />;
      if (selectedSub === "发货时效") return <BusinessAnalysis initialDept="Logistics" />;
      if (selectedSub === "超时预警") return <ExceptionAlertsView />;
      if (selectedSub === "物流异常") return <ExceptionAlertsView />;
      if (selectedSub === "履约日报") return <BusinessAnalysis initialDept="Logistics" />;
    }

    // 7. CUSTOMER REPRESENTATION
    if (selectedParent === "客服售后") {
      if (selectedSub === "售后总览") return <BusinessAnalysis initialDept="Support" />;
      if (selectedSub === "退款退货") return <TodayDataView />;
      if (selectedSub === "差评客诉") return <DepartmentTools />;
      if (selectedSub === "问题归因") return <BusinessAnalysis initialDept="Support" />;
      if (selectedSub === "话术知识库") return <DepartmentTools />;
    }

    // 8. PROFIT LEDGERS
    if (selectedParent === "利润分析") {
      if (selectedSub === "利润总览") return <BusinessAnalysis initialDept="All" />;
      if (selectedSub === "商品利润") return <InventoryTurnoverView />;
      if (selectedSub === "店铺利润") return <StoreAnalysisView />;
      if (selectedSub === "成本分析") return <BusinessAnalysis initialDept="All" />;
      if (selectedSub === "月度利润") return <BusinessAnalysis initialDept="All" />;
    }

    // 9. DATA HUB
    if (selectedParent === "数据中心") {
      if (selectedSub === "数据源管理") return <ShortcutEntriesView />;
      if (selectedSub === "聚水潭同步") return <AutomationHub />;
      if (selectedSub === "表格导入") return <DepartmentTools />;
      if (selectedSub === "指标口径") return <PeriodicalReviewView />;
      if (selectedSub === "同步日志") return <AutomationHub />;
    }

    // 10. SYSTEM PARAMETERS
    if (selectedParent === "系统设置") {
      if (selectedSub === "员工账号") return <RolePermissionsView />;
      if (selectedSub === "部门设置") return <RolePermissionsView />;
      if (selectedSub === "权限设置") return <RolePermissionsView />;
      if (selectedSub === "菜单设置") return <ShortcutEntriesView />;
      if (selectedSub === "操作日志") return <AutomationHub />;
    }

    // Fallback safely
    return <BusinessAnalysis initialDept="All" />;
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
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
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
                    <div key={parent.title} className="space-y-0.5">
                      {/* First-level accordion head */}
                      <button
                        onClick={() => handleToggleParent(parent.title)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.8 rounded-lg text-xs font-bold transition-all ${
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
                            className="overflow-hidden pl-7.5 space-y-0.5"
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
                                  className={`w-full text-left px-3.5 py-1.8 rounded-md text-[11px] font-bold transition-all leading-normal ${
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
                  className="w-full mt-4 flex items-center justify-center space-x-2 py-1.8 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-[#86a0cd] hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>注销退出账户</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation - Desktop Left Rail (Hidden on Mobile) */}
      <aside 
        id="dashboard-sidebar" 
        className="hidden md:flex md:w-68 bg-[#002045] text-white flex-col justify-between border-r border-[#1a365d] shadow-sm flex-shrink-0 h-screen overflow-hidden"
      >
        {/* Brand Header */}
        <div className="p-5 flex-shrink-0 border-b border-white/5 bg-black/10">
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

        {/* Scrollable multi-level Accordion list */}
        <div className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
          {MENU_ITEMS.map((parent) => {
            const isExpanded = !!expandedParents[parent.title];
            const isActiveParent = selectedParent === parent.title;

            return (
              <div key={parent.title} className="space-y-0.5">
                {/* First-level accordion head */}
                <button
                  onClick={() => handleToggleParent(parent.title)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.8 rounded-lg text-xs font-bold transition-all ${
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
                      className="overflow-hidden pl-7.5 space-y-0.5"
                    >
                      {parent.submenus.map((sub) => {
                        const isSelected = selectedParent === parent.title && selectedSub === sub;
                        return (
                          <button
                            key={sub}
                            onClick={() => handleSelectSubmenu(parent.title, sub)}
                            className={`w-full text-left px-3.5 py-1.8 rounded-md text-[11px] font-bold transition-all leading-normal ${
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
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-1.8 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-[#86a0cd] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>注销退出账户</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Frame (Right fluid zone) */}
      <main id="dashboard-content" className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Responsive Header (Top bar) */}
        <header className="bg-white border-b border-slate-250 h-16 px-4 md:px-6 flex items-center justify-between shadow-xs select-none flex-shrink-0">
          
          {/* Mobile hamburger button + logo (Visible only on mobile) */}
          <div className="flex items-center space-x-2 md:hidden">
            <button 
              onClick={toggleMenu}
              className="p-1.5 hover:bg-slate-50 text-[#002045] rounded-full transition-colors flex-shrink-0"
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
              onClick={() => alert("Lenakids OpsPilot 行政总控：如有任何接口或功能疑问，可直接进入 [部门辅助工具] 模块向内置 of Gemini 3.5 AI 业务诊断助理提问解答。")}
              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#002045] rounded-lg transition-colors"
              title="求助中心"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

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
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mini Status Grid footer */}
        <footer className="h-9 px-4 md:px-6 bg-white border-t border-slate-200/80 flex items-center justify-between text-[9px] md:text-[10px] text-slate-400 font-medium font-mono flex-shrink-0">
          <div className="flex items-center space-x-2 md:space-x-3.5 overflow-hidden">
            <span className="truncate">● PROD_INGRESS: RUNNING</span>
            <span className="hidden leading-none md:inline">|</span>
            <span className="hidden md:inline">SYSTEM_TIME: 2026-05-22</span>
            <span className="hidden leading-none md:inline">|</span>
            <span className="hidden md:inline">CADDY: HTTPS PROXY</span>
          </div>
          <div className="flex-shrink-0">
            <span className="hidden xs:inline">Lenakids OpsPilot Enterprise Portal v2.5.0</span>
            <span className="xs:hidden">v2.5.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
