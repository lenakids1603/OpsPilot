/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, LogIn, Check, AlertCircle } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("service@lenakids.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    // Simulate a fast enterprise authentication loading bar
    setTimeout(() => {
      if (password !== "lena") {
        setIsLoggingIn(false);
        setError("密码错误，请输入正确的密码。");
        return;
      }
      setIsLoggingIn(false);
      onLoginSuccess(email);
    }, 1200);
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#f8f9ff] flex flex-col md:flex-row font-sans text-[#0b1c30]">
      {/* Brand Sidebar (Left) */}
      <div 
        id="login-sidebar" 
        className="w-full md:w-[42%] bg-[#002045] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden"
      >
        {/* Abstract background graphics to elevate modern look */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-800/20 rounded-full blur-3xl -ml-60 -mb-60"></div>

        <div className="relative z-10">
          {/* Logo block */}
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg border border-white/20 hover:scale-105 transition-transform duration-200">
            <span className="font-serif font-black text-[#002045] text-xl tracking-tight">LN</span>
          </div>

          {/* Titles */}
          <div className="mt-16 md:mt-24 space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none text-white">
              Lenakids
            </h1>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none text-white">
              OpsPilot
            </h1>
            <p className="text-[#86a0cd] font-medium text-sm tracking-wide pt-2">
              Business Insights & Automation Hub
            </p>
          </div>

          {/* Visual Capabilities Badges */}
          <div className="mt-12 md:mt-20 space-y-6">
            <div className="flex items-center space-x-3.5 group">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                <span className="text-lg">📊</span>
              </div>
              <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors duration-200">
                经营数据分析后台
              </span>
            </div>

            <div className="flex items-center space-x-3.5 group">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                <span className="text-lg">🔧</span>
              </div>
              <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors duration-200">
                部门辅助工具
              </span>
            </div>

            <div className="flex items-center space-x-3.5 group">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                <span className="text-lg">🔄</span>
              </div>
              <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors duration-200">
                自动化减负系统
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-16 md:mt-0 text-xs text-white/45 tracking-wider font-medium font-mono">
          © 2024 LENAKIDS. Institutional Stability & Security.
        </div>
      </div>

      {/* Login Form Section (Right) */}
      <div 
        id="login-form-area" 
        className="w-full md:w-[58%] flex items-center justify-center px-6 md:px-16 py-12 bg-[#f8f9ff]"
      >
        <div className="w-full max-w-md space-y-9">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002045]">
              欢迎回来
            </h2>
            <p className="text-sm text-[#43474e]">
              请登录您的企业账户以继续
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#43474e]">
                工作邮箱
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006591] focus:border-transparent transition-all duration-150"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#43474e]">
                  密码
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert("密码重置请求已发送。请联系Lenakids运维小组办理重置。"); }}
                  className="text-xs font-semibold text-[#006591] hover:underline"
                >
                  忘记密码?
                </a>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006591] focus:border-transparent transition-all duration-150 font-mono"
                  placeholder="请输入登录密码"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg text-xs font-medium animate-pulse">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Options */}
            <div className="flex items-center">
              <label className="relative flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 mr-2.5 rounded border flex items-center justify-center transition-all ${rememberMe ? "bg-[#0ea5e9] border-[#0ea5e9]" : "border-slate-300 bg-white"}`}>
                  {rememberMe && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                </div>
                <span className="text-xs font-medium text-[#43474e]">
                  记住登录状态
                </span>
              </label>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3.5 px-4 bg-[#006591] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#004c6e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006591] transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer ${isLoggingIn ? "opacity-75 cursor-wait" : ""}`}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  <span>安全登录中...</span>
                </>
              ) : (
                <>
                  <span>登录系统</span>
                  <LogIn className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs tracking-wide text-slate-400 font-medium">
              或者使用以下方式
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => {
                setIsLoggingIn(true);
                setTimeout(() => { setIsLoggingIn(false); onLoginSuccess("wechat@lenakids.com"); }, 900);
              }}
              className="flex items-center justify-center space-x-2 py-2.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-[#0b1c30] hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
            >
              <span className="text-emerald-500 text-sm">💬</span>
              <span>微信</span>
            </button>
            <button
              onClick={() => {
                setIsLoggingIn(true);
                setTimeout(() => { setIsLoggingIn(false); onLoginSuccess("dingtalk@lenakids.com"); }, 900);
              }}
              className="flex items-center justify-center space-x-2 py-2.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-[#0b1c30] hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
            >
              <span className="text-sky-500 text-sm">🛩️</span>
              <span>钉钉</span>
            </button>
          </div>

          {/* Terms info */}
          <div className="text-center text-[11px] leading-relaxed text-[#43474e]">
            登录即表示您同意我们的{" "}
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Lenakids OpsPilot 企业服务条款：本系统仅限内部授权员工在安全合规的环境下访问，所有操作数据均生成只读审计日志。"); }} className="font-semibold text-slate-600 hover:underline">服务条款</a>{" "}
            和{" "}
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Lenakids OpsPilot 隐私政策说明：我们全面遵守国家数据安全规程。所有部门自动化交互均通过安全的离线中间层转接。"); }} className="font-semibold text-slate-600 hover:underline">隐私政策说明</a>
          </div>
        </div>
      </div>
    </div>
  );
}
