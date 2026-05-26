/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { LogOut } from "lucide-react";
import SupplierWorkspacePage from "../pages/settings/SupplierWorkspacePage";

interface SupplierPortalLayoutProps {
  userEmail: string;
  onLogout: () => void;
}

export default function SupplierPortalLayout({ userEmail, onLogout }: SupplierPortalLayoutProps) {
  return (
    <div id="supplier-portal-root" className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans select-none text-[#0b1c30]">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 h-16 px-4 md:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#0b1c30] rounded-xl flex items-center justify-center font-serif text-white font-black text-[16px]">
            LN
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-[13.5px] tracking-tight leading-none flex items-center gap-1.5">
              OpsPilot <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-black font-sans uppercase">供应商协同门户</span>
            </h3>
            <p className="text-[10px] text-slate-450 font-bold block mt-1 leading-none font-sans">
              LENAKIDS SUPPLY CHAIN PORTAL BACKBONE
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-150 rounded-xl text-xs">
            <div className="w-5 h-5 rounded-full bg-indigo-150 text-indigo-800 flex items-center justify-center font-extrabold text-[10px]">
              供
            </div>
            <div className="text-left font-sans">
              <span className="font-black text-slate-700 block leading-none">{userEmail}</span>
              <span className="text-[9px] text-[#006591] block leading-none mt-1 font-bold">角色: 外部合作供应商</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.8 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            title="安全注销并退出"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">安全退出</span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow p-4 md:p-8 bg-[#f8f9ff]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SupplierWorkspacePage userEmail={userEmail} onLogout={onLogout} />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-10 px-4 md:px-8 bg-white border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-tight shrink-0">
        <div>
          <span>EXTERNAL ENGINE: </span>
          <span className="text-[#0b1c30] font-bold">LENAKIDS SUPPLY CHAIN NETWORK v2.5.0</span>
        </div>
        <div className="hidden xs:inline text-slate-450">
          SECURE REVERSE PROXY LAYER ACTIVE
        </div>
      </footer>
    </div>
  );
}
