/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LogOut, User, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MENU_ITEMS } from "../../config/menu";

interface SidebarProps {
  selectedParent: string;
  selectedSub: string;
  expandedParents: Record<string, boolean>;
  handleToggleParent: (title: string) => void;
  handleSelectSubmenu: (parentTitle: string, subTitle: string) => void;
  userEmail: string;
  onLogout: () => void;
}

export default function Sidebar({
  selectedParent,
  selectedSub,
  expandedParents,
  handleToggleParent,
  handleSelectSubmenu,
  userEmail,
  onLogout,
}: SidebarProps) {
  return (
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
                          onClick={() => handleSelectSubmenu(parent.title, sub)}
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
          onClick={onLogout}
          className="w-full mt-4 flex items-center justify-center space-x-2 py-1.8 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-[#86a0cd] hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>注销退出账户</span>
        </button>
      </div>
    </aside>
  );
}
