/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, UploadCloud, FileSpreadsheet, ArrowRight, ArrowLeft, Check, CheckCircle2, AlertTriangle, Download, Link 
} from "lucide-react";
import { CashflowRecord, FundAccount, CashflowCategory } from "@shared/types";

interface ImportCashflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (records: Omit<CashflowRecord, "id" | "createdAt">[]) => void;
  accounts: FundAccount[];
  categories: CashflowCategory[];
}

export default function ImportCashflowModal({
  isOpen,
  onClose,
  onConfirmImport,
  accounts,
  categories
}: ImportCashflowModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Match state placeholders for Step 2
  const [mappings, setMappings] = useState({
    date: "交易日期(时间)",
    account: "交易网卡账户",
    direction: "借贷类型",
    amount: "本外币发生金额",
    category: "大类科目归集",
    counterparty: "交易对手商户",
    summary: "收付主要明细"
  });

  // Mock template rows of Step 3 (The preview phase)
  const MOCK_PREVIEW_RECORDS: Omit<CashflowRecord, "id" | "createdAt">[] = [
    {
      transactionDate: "2026-05-23",
      accountId: "acc-1",
      accountName: "公司建设银行",
      direction: "expense",
      amount: 4500.00,
      categoryId: "cat-ex-5",
      categoryName: "办公费用",
      counterparty: "乐那童装客服组笔记本采购",
      summary: "采购行政配置研发高配MacBook Pro 1台",
      remark: "采购部黄经理提交，已取得专票电子版",
      hasAttachment: true,
      status: "draft",
      operator: "lenakids1603@gmail.com"
    },
    {
      transactionDate: "2026-05-22",
      accountId: "acc-3",
      accountName: "公司支付宝",
      direction: "income",
      amount: 68500.00,
      categoryId: "cat-in-1",
      categoryName: "销售收入",
      counterparty: "抖音小店合集清算",
      summary: "抖音拼盘合伙日常流水分拨收益划归账户",
      remark: "每日日结账单自动汇聚",
      hasAttachment: false,
      status: "draft",
      operator: "lenakids1603@gmail.com"
    },
    {
      transactionDate: "2026-05-22",
      accountId: "acc-4",
      accountName: "公司微信",
      direction: "expense",
      amount: 2800.00,
      categoryId: "cat-ex-3",
      categoryName: "房租水电",
      counterparty: "乐那设计院园区物业经理",
      summary: "5月份极夜孵化研发楼层独立电费预付充值",
      remark: "财务处出纳黄婷支付",
      hasAttachment: true,
      status: "draft",
      operator: "lenakids1603@gmail.com"
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const triggerImportCommit = () => {
    onConfirmImport(MOCK_PREVIEW_RECORDS);
    onClose();
    // reset steps
    setCurrentStep(1);
    setFileName(null);
  };

  const downloadMockTemplate = () => {
    alert("【AI Studio 沙盒占位】正在导出「公司资金流水银行对账批量导入模板.xlsx」。将在真实后端连通后直接解压下载！");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="import-cashflow-drawer-container" className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop overlay */}
          <motion.div
            id="import-cashflow-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
            <motion.div
              id="import-cashflow-drawer-content"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col justify-between"
            >
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-[#002045]">Excel/CSV 资金流水智能对账导入向导</h3>
              <p className="text-[10px] text-slate-400">一键拖拽银行网银对账单、支付宝对账账单快速注入企业金库账套</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer hover:bg-slate-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Guide bar */}
        <div className="bg-slate-50/30 px-8 py-3.5 border-b border-slate-150 flex items-center justify-between text-xs select-none">
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              currentStep === 1 ? "bg-[#006591] text-white" : "bg-emerald-500 text-white"
            }`}>
              {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
            </span>
            <span className={`font-bold ${currentStep === 1 ? "text-[#002045]" : "text-slate-400"}`}>
              上传表格凭证
            </span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              currentStep === 2 
                ? "bg-[#006591] text-white" 
                : currentStep > 2 
                ? "bg-emerald-500 text-white" 
                : "bg-slate-200 text-slate-400"
            }`}>
              {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
            </span>
            <span className={`font-bold ${currentStep === 2 ? "text-[#002045]" : "text-slate-400"}`}>
              指定字段映射
            </span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-300" />

          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              currentStep === 3 ? "bg-[#006591] text-white animate-pulse" : "bg-slate-200 text-slate-400"
            }`}>
              3
            </span>
            <span className={`font-bold ${currentStep === 3 ? "text-[#002045]" : "text-slate-400"}`}>
              预览账目合并
            </span>
          </div>
        </div>

        {/* Dynamic step rendering body */}
        <div className="p-6 h-[400px] overflow-y-auto">
          
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
                  dragActive ? "border-[#006591] bg-sky-50/10" : "border-slate-250 bg-slate-50/20 hover:bg-slate-50/50"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-2xs mb-3.5">
                  <UploadCloud className="w-8 h-8 text-[#006591]" />
                </div>
                
                {fileName ? (
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-[#002045] mb-1">
                      📄 已成功装载文件：
                    </span>
                    <span className="inline-block p-1 bg-sky-50 text-[#006591] px-3 font-mono font-bold text-xs rounded border border-sky-100">
                      {fileName}
                    </span>
                    <button
                      onClick={() => setFileName(null)}
                      className="block mx-auto text-[10px] font-bold text-rose-500 hover:underline mt-2.5 cursor-pointer"
                    >
                      重新选择文件
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-slate-700">
                      将您的网银对账单拖曳至此，或{" "}
                      <label className="text-[#006591] hover:underline cursor-pointer">
                        浏览系统目录
                        <input
                          type="file"
                          accept=".xls,.xlsx,.csv"
                          onChange={handleFileChoose}
                          className="hidden"
                        />
                      </label>
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      支持规范标准的 Excel (.xlsx, .xls) 以及纯文本 CSV 表格格式，推荐大小不超过 15MB
                    </span>
                  </div>
                )}
              </div>

              {/* Download template panel */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-200">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-[#002045]">没有标准导出格式？</span>
                  <span className="block text-[10px] text-slate-400 leading-relaxed">
                    为了保障大批量入账的字段准确性，建议先下载我司制定配置的标准化财务出纳导表模版。
                  </span>
                </div>
                <button
                  type="button"
                  onClick={downloadMockTemplate}
                  className="flex items-center space-x-1 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-all shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>下载模板</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Mapping properties */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-50 p-3.5 border border-sky-100/60 rounded-xl text-xs text-sky-700 font-medium">
                <strong>智能映射：</strong> 我们会自动分析您表格的首行属性。如自动对应不精准，请在下方下拉箱中点选您表格对应的原始列。
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8f9ff] text-slate-400 font-bold border-b border-slate-100 text-[10px]">
                    <tr>
                      <th className="p-3">标准中枢属性 (OpsPilot)</th>
                      <th className="p-3">映射匹配结果 (您的表格列名)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {[
                      { field: "date", label: "流水发生日期 (transactionDate) *", placeholder: "通常包含时间或对账发生的日期" },
                      { field: "account", label: "结算资金账户 (accountId) *", placeholder: "记录该笔划款流入或支处的银行等" },
                      { field: "direction", label: "收支方向 (direction) *", placeholder: "标有借/贷、收/支的属性列" },
                      { field: "amount", label: "交易发生金额 (amount) *", placeholder: "发生对账金额的物理数值" },
                      { field: "category", label: "分录科目分类 (categoryId) *", placeholder: "账款分类描述" },
                      { field: "counterparty", label: "往来对手户名 (counterparty)", placeholder: "例如公司名称或雇员" },
                      { field: "summary", label: "业务主要明细 (summary) *", placeholder: "银行转账附言或详情" }
                    ].map(item => (
                      <tr key={item.field}>
                        <td className="p-3">
                          <span className="block text-[11px] text-[#002045]">{item.label}</span>
                          <span className="block text-[9px] text-slate-400 font-sans font-medium">{item.placeholder}</span>
                        </td>
                        <td className="p-3">
                          <select
                            value={(mappings as any)[item.field]}
                            onChange={(e) => setMappings({ ...mappings, [item.field]: e.target.value })}
                            className="p-1 px-1.8 bg-white border border-slate-250 rounded font-bold text-xs text-slate-700 focus:ring-1 focus:ring-[#006591] focus:outline-none w-56 cursor-pointer"
                          >
                            <option value={(mappings as any)[item.field]}>{(mappings as any)[item.field]}</option>
                            <option value="自定义列A">自定义列A</option>
                            <option value="自定义列B">自定义列B</option>
                            <option value="未指定，留白">未指定，默认配置</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Preview list matching statistics */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl text-center space-y-0.5 shadow-2xs">
                  <span className="block text-emerald-800 text-[11px] font-bold">准备就绪笔数</span>
                  <span className="block text-xl font-mono font-black text-emerald-600">3 笔</span>
                </div>
                <div className="bg-amber-50 border border-amber-250 p-3 rounded-xl text-center space-y-0.5 shadow-2xs">
                  <span className="block text-amber-800 text-[11px] font-bold">待手工修缮笔数</span>
                  <span className="block text-xl font-mono font-black text-amber-600">0 笔</span>
                </div>
                <div className="bg-slate-50 border border-slate-250 p-3 rounded-xl text-center space-y-0.5 shadow-2xs">
                  <span className="block text-slate-700 text-[11px] font-bold">疑似历史重复记录</span>
                  <span className="block text-xl font-mono font-black text-slate-450">0 笔</span>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase mb-2">识别账单数据预览列表</span>
                <div className="border border-slate-100 rounded-xl overflow-x-auto text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#f8f9ff] text-slate-400 font-bold font-mono border-b border-slate-100">
                      <tr>
                        <th className="p-2.5">发生日期</th>
                        <th className="p-2.5">涉及资产账户</th>
                        <th className="p-2.5">收支方向</th>
                        <th className="p-2.5 text-right">金额</th>
                        <th className="p-2.5">对应科目分类</th>
                        <th className="p-2.5 max-w-[150px] truncate">业务摘要</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                      {MOCK_PREVIEW_RECORDS.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold font-mono text-slate-500">{rec.transactionDate}</td>
                          <td className="p-2.5 font-bold">{rec.accountName}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              rec.direction === "income" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                            }`}>
                              {rec.direction === "income" ? "流入(+)" : "支出(-)"}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-bold font-mono">¥{rec.amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-[#006591] font-bold">{rec.categoryName}</td>
                          <td className="p-2.5 max-w-[150px] truncate text-slate-400" title={rec.summary}>{rec.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer buttons */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (currentStep === 1) {
                onClose();
              } else {
                setCurrentStep((prev) => (prev - 1) as any);
              }
            }}
            className="flex items-center space-x-1.5 px-4.5 py-2 bg-white hover:bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStep === 1 ? "直接取消" : "上一步骤"}</span>
          </button>

          <button
            onClick={() => {
              if (currentStep === 1) {
                if (!fileName) {
                  alert("请先拖拽上传一个对账表 Excel/CSV 文件！");
                  return;
                }
                setCurrentStep(2);
              } else if (currentStep === 2) {
                setCurrentStep(3);
              } else {
                triggerImportCommit();
              }
            }}
            className="flex items-center space-x-1.5 px-6 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            {currentStep === 3 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>完成导入并注入金库</span>
              </>
            ) : (
              <>
                <span>下一步骤字段映射</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
