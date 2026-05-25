/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Upload, Download, Search, Calendar, Filter, ChevronDown, ChevronUp,
  X, CheckCircle2, AlertTriangle, Building, Receipt, DollarSign, RefreshCw, 
  FileSpreadsheet, Info, User, Clock, ArrowUpDown, ChevronRight, Eye, Coins, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { INITIAL_PROPRIETOR_DATA, ProprietorInvoiceItem } from "./components/proprietorData";

export default function IndividualInvoicePage() {
  // Core state for proprietors
  const [data, setData] = useState<ProprietorInvoiceItem[]>(INITIAL_PROPRIETOR_DATA);
  const [selectedItem, setSelectedItem] = useState<ProprietorInvoiceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Custom toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Filter States
  const [timeRange, setTimeRange] = useState<string>("全部时间");
  const [selectedShop, setSelectedShop] = useState<string>("全部店铺");
  const [searchOwnerQuery, setSearchOwnerQuery] = useState<string>(""); // state for searching subject names
  const [selectedBank, setSelectedBank] = useState<string>("全部银行");
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<string>("全部");
  const [selectedStatus, setSelectedStatus] = useState<string>("全部");
  const [selectedAbnormal, setSelectedAbnormal] = useState<string>("全部");
  const [universalSearch, setUniversalSearch] = useState<string>("");

  // Tab State
  // 1. 全部主体, 2. 厂家开票, 3. 赫得服务费, 4. 千川投流, 5. 异常复核, 6. 每日余额
  const [activeTab, setActiveTab] = useState<string>("all");

  // Sorting State
  const [sortField, setSortField] = useState<string>("withdrawTotal");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Registration modal states
  const [showInvoicingModal, setShowInvoicingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<"summary" | "balance">("summary");

  // Form states for adding invoices
  const [formProprietorId, setFormProprietorId] = useState<string>("");
  const [formType, setFormType] = useState<"manufacturer" | "hede" | "qianchuan">("manufacturer");
  const [formInvType, setFormInvType] = useState<"general" | "special">("general");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formReleased, setFormReleased] = useState<string>("0");

  // Form states for adding payments
  const [formPayProprietorId, setFormPayProprietorId] = useState<string>("");
  const [formPayType, setFormPayType] = useState<"hede" | "qianchuan">("hede");
  const [formPayTarget, setFormPayTarget] = useState<string>(""); // For Qianchuan: 莉禾唯, 科衣, etc.
  const [formPayAmount, setFormPayAmount] = useState<string>("");

  // Collapsible Calculation Formula card
  const [formulaExpanded, setFormulaExpanded] = useState<boolean>(false);

  // Check URL parameters / localStorage parameters for cross-page navigation from Business Overview
  useEffect(() => {
    // Check parameters on load and check periodically
    const checkParams = () => {
      const stored = localStorage.getItem("finance-link-params");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // If this is a very fresh navigation let's swallow it!
          if (Date.now() - parsed.triggeredAt < 15000) {
            // Check direction or targetTab simulation
            if (parsed.direction === "income" || parsed.tab === "available" || parsed.targetTab === "available") {
              setActiveTab("manufacturer");
              setSelectedAbnormal("可安排");
              showToast("✨ 财务联动：已为您筛选出可安排票额的厂家主体，并高亮还能安排票额指标！");
            } else if (parsed.tab === "issued" || parsed.targetTab === "issued") {
              setActiveTab("all");
              showToast("✨ 财务联动：已为您打开全部个体主体列表，重点关注已开票汇总。");
            } else if (parsed.tab === "paid" || parsed.targetTab === "paid") {
              setActiveTab("hede");
              showToast("✨ 财务联动：已为您打开赫得服务费打款与开票明细。");
            }
            // Clear to avoid infinite reset loops
            localStorage.removeItem("finance-link-params");
          }
        } catch (err) {
          console.error("Failed to parse link params", err);
        }
      }
    };
    checkParams();
    const interval = setInterval(checkParams, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to external event triggers
  useEffect(() => {
    const handleNavigationEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { targetTab } = customEvent.detail;
        if (targetTab === "available") {
          setActiveTab("manufacturer");
          setSelectedAbnormal("可安排");
          showToast("📊 已下钻：默认筛选厂家开票 [可安排] 主体状态，重点关注「还能安排票额」");
        } else if (targetTab === "issued") {
          setActiveTab("all");
          showToast("📊 已下钻：默认列出全部主体，并重点核对「已开票金额」数据指标");
        } else if (targetTab === "paid") {
          setActiveTab("hede");
          showToast("📊 已下钻：已为您定位至「赫得服务费开票与打款」核算对账视图");
        }
      }
    };
    window.addEventListener("finance-navigate", handleNavigationEvent);
    return () => {
      window.removeEventListener("finance-navigate", handleNavigationEvent);
    };
  }, []);

  // Dynamic calculations based on state filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Time range (simulated via 2025 vs 2026 filters if selected)
      if (timeRange === "2025年" && item.withdraw2025 === 0) return false;
      if (timeRange === "2026年" && item.withdraw2026 === 0) return false;
      if (timeRange === "本月") {
        // Mock filter logic: item with non-zero 2026 withdrawals represent recent records
        if (item.withdraw2026 === 0) return false;
      }
      
      // 2. Shop
      if (selectedShop !== "全部店铺" && item.shop !== selectedShop) return false;
      
      // 3. Subject Name Search
      if (searchOwnerQuery && !item.name.toLowerCase().includes(searchOwnerQuery.toLowerCase())) return false;
      
      // 4. Bank
      if (selectedBank !== "全部银行") {
        if (selectedBank === "中国银行" && !item.bank.includes("中国银行")) return false;
        if (selectedBank === "工商银行" && !item.bank.includes("工商银行")) return false;
        if (selectedBank === "其他银行" && (item.bank.includes("中国银行") || item.bank.includes("工商银行"))) return false;
      }

      // 5. Invoice Type Filter (厂家开票, 赫得服务费, 千川投流)
      // We don't exclude outright but rather highlight, but if strict filter is turned on:
      if (selectedInvoiceType !== "全部") {
        // Custom logic filter
      }

      // 6. Principal status
      if (selectedStatus !== "全部" && item.status !== selectedStatus) return false;

      // 7. Abnormal state
      if (selectedAbnormal !== "全部") {
        if (selectedAbnormal === "可安排" && item.manufacturerStatus !== "可安排") return false;
        if (selectedAbnormal === "已完成" && item.manufacturerStatus !== "已完成") return false;
        if (selectedAbnormal === "待开票" && item.manufacturerStatus !== "可安排") return false; // wait for invoicing
        if (selectedAbnormal === "待补票" && item.hedeStatus !== "待补票" && item.qianchuanStatus !== "待补票") return false;
        if (selectedAbnormal === "超额" && item.manufacturerStatus !== "超额") return false;
        if (selectedAbnormal === "待复核" && item.manufacturerStatus !== "待复核" && item.hedeStatus !== "待复核" && item.qianchuanStatus !== "待复核" && item.withdrawTotal < 4800000) return false;
      }

      // 8. Universal Search (店铺, 个体户主体, 银行账号尾号)
      if (universalSearch.trim() !== "") {
        const query = universalSearch.toLowerCase();
        const matchShop = item.shop.toLowerCase().includes(query);
        const matchName = item.name.toLowerCase().includes(query);
        const matchTail = item.accountTail.includes(query);
        const matchBank = item.bank.toLowerCase().includes(query);
        if (!matchShop && !matchName && !matchTail && !matchBank) return false;
      }

      // Tab specific dynamic filtering
      if (activeTab === "anomalies") {
        // Only show items with some form of discrepancy or special alerts
        const isAbnormal = item.manufacturerStatus === "超额" || 
                           item.hedeStatus === "待补票" || 
                           item.qianchuanStatus === "待补票" ||
                           item.status === "已注销" ||
                           item.withdrawTotal >= 4800000; // close to 5M
        if (!isAbnormal) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField as keyof ProprietorInvoiceItem] ?? 0;
      let valB: any = b[sortField as keyof ProprietorInvoiceItem] ?? 0;

      if (typeof valA === "string") {
        return sortDirection === "asc" 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [data, timeRange, selectedShop, searchOwnerQuery, selectedBank, selectedInvoiceType, selectedStatus, selectedAbnormal, universalSearch, activeTab, sortField, sortDirection]);

  // Aggregate Metrics over the dynamically filtered dataset
  const metrics = useMemo(() => {
    let totalWithdrawSum = 0;
    let computedPayableSum = 0;
    let completedInvoiceSum = 0;
    let completedPaymentSum = 0;
    let remainingAvailableInvoiceSum = 0;
    let abnormalCount = 0;

    filteredData.forEach(item => {
      totalWithdrawSum += item.withdrawTotal;
      // 应开票金额 = 厂家应开(70%) + 赫得应开(13%) + 千川应开(10%) -> 93% of total withdraw
      computedPayableSum += (item.manufacturerPayable + item.hedePayable + item.qianchuanPayable);
      
      // 已开票金额 = 厂家合计 + 赫得合计 + 千川合计
      completedInvoiceSum += (item.manufacturerInvTotal + item.hedeInvTotal + item.qianchuanInvTotal);
      
      // 已打款金额 = 赫得打款 + 千川打款
      completedPaymentSum += (item.hedePaid + item.qianchuanPaidTotal);
      
      // 可安排厂家票额 (positive values only)
      if (item.manufacturerInvAvailable > 0) {
        remainingAvailableInvoiceSum += item.manufacturerInvAvailable;
      }
      
      // Determine if proprietor has abnormal metrics or status
      const isAbnormal = item.status === "已注销" || 
                         item.status === "停止使用" || 
                         item.manufacturerStatus === "超额" || 
                         item.manufacturerStatus === "待复核" ||
                         item.hedeStatus === "待补票" || 
                         item.qianchuanStatus === "待补票" ||
                         item.withdrawTotal >= 4800000;
      if (isAbnormal) {
        abnormalCount++;
      }
    });

    return {
      totalWithdrawSum,
      computedPayableSum,
      completedInvoiceSum,
      completedPaymentSum,
      remainingAvailableInvoiceSum,
      abnormalCount
    };
  }, [filteredData]);

  // Handle Sort Toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Helper formatting for currency
  const formatRMB = (num: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num).replace("CNY", "¥");
  };

  // Quick Action: Register Invoicing
  const handleAddInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProprietorId || !formAmount) {
      showToast("❌ 请选择个体户主体并输入开票金额");
      return;
    }

    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("❌ 请输入大于 0 的有效开票金额");
      return;
    }

    const releasedAmt = parseFloat(formReleased) || 0;

    setData(prev => {
      return prev.map(item => {
        if (item.id === formProprietorId) {
          const updated = { ...item };
          if (formType === "manufacturer") {
            if (formInvType === "general") {
              updated.manufacturerInvGeneral += amt;
            } else {
              updated.manufacturerInvSpecial += amt;
            }
            updated.manufacturerInvTotal = updated.manufacturerInvGeneral + updated.manufacturerInvSpecial;
            updated.manufacturerInvReleased += releasedAmt;
            // Recalculate available: 应开票 - 合计开票 - 已放出票额
            updated.manufacturerInvAvailable = updated.manufacturerPayable - updated.manufacturerInvTotal - updated.manufacturerInvReleased;
            
            // Adjust status
            if (updated.manufacturerInvAvailable > 10) {
              updated.manufacturerStatus = "可安排";
            } else if (Math.abs(updated.manufacturerInvAvailable) <= 10) {
              updated.manufacturerStatus = "已完成";
            } else {
              updated.manufacturerStatus = "超额";
            }
          } else if (formType === "hede") {
            if (formInvType === "general") {
              updated.hedeInvGeneral += amt;
            } else {
              updated.hedeInvSpecial += amt;
            }
            updated.hedeInvTotal = updated.hedeInvGeneral + updated.hedeInvSpecial;
            updated.hedeDiffAmt = updated.hedePaid - updated.hedeInvTotal;
            if (Math.abs(updated.hedeDiffAmt) <= 50) {
              updated.hedeStatus = "已匹配";
            } else if (updated.hedeDiffAmt > 50) {
              updated.hedeStatus = "待补票";
            } else {
              updated.hedeStatus = "待复核";
            }
          } else if (formType === "qianchuan") {
            if (formInvType === "general") {
              updated.qianchuanInvGeneral += amt;
            } else {
              updated.qianchuanInvSpecial += amt;
            }
            updated.qianchuanInvTotal = updated.qianchuanInvGeneral + updated.qianchuanInvSpecial;
            updated.qianchuanDiffAmt = updated.qianchuanPaidTotal - updated.qianchuanInvTotal;
            if (Math.abs(updated.qianchuanDiffAmt) <= 50) {
              updated.qianchuanStatus = "已匹配";
            } else if (updated.qianchuanDiffAmt > 50) {
              updated.qianchuanStatus = "待补票";
            } else {
              updated.qianchuanStatus = "待复核";
            }
          }
          return updated;
        }
        return item;
      });
    });

    const targetProp = data.find(i => i.id === formProprietorId);
    showToast(`✅ 已登记开票：主体 [${targetProp?.name.substring(0, 10)}...] 记账票额 ¥${amt.toLocaleString()}`);
    setShowInvoicingModal(false);
    setFormAmount("");
    setFormReleased("0");
  };

  // Quick Action: Register Payment
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPayProprietorId || !formPayAmount) {
      showToast("❌ 请选择个体户以及打款金额");
      return;
    }

    const amt = parseFloat(formPayAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("❌ 请输入有效的打款数字金额");
      return;
    }

    setData(prev => {
      return prev.map(item => {
        if (item.id === formPayProprietorId) {
          const updated = { ...item };
          if (formPayType === "hede") {
            updated.hedePaid += amt;
            updated.currentBalance = Math.max(0, updated.currentBalance - amt);
            updated.hedeDiffAmt = updated.hedePaid - updated.hedeInvTotal;
            if (Math.abs(updated.hedeDiffAmt) <= 50) {
              updated.hedeStatus = "已匹配";
            } else if (updated.hedeDiffAmt > 50) {
              updated.hedeStatus = "待补票";
            } else {
              updated.hedeStatus = "待复核";
            }
          } else {
            // qianchuan with targeting target
            if (formPayTarget === "lihewei") updated.qianchuanPaidLihewei += amt;
            else if (formPayTarget === "keyi") updated.qianchuanPaidKeyi += amt;
            else if (formPayTarget === "huijian") updated.qianchuanPaidHuijian += amt;
            else updated.qianchuanPaidYurong += amt;

            updated.qianchuanPaidTotal = updated.qianchuanPaidLihewei + updated.qianchuanPaidKeyi + updated.qianchuanPaidHuijian + updated.qianchuanPaidYurong;
            updated.currentBalance = Math.max(0, updated.currentBalance - amt);
            updated.qianchuanDiffAmt = updated.qianchuanPaidTotal - updated.qianchuanInvTotal;
            if (Math.abs(updated.qianchuanDiffAmt) <= 50) {
              updated.qianchuanStatus = "已匹配";
            } else if (updated.qianchuanDiffAmt > 50) {
              updated.qianchuanStatus = "待补票";
            } else {
              updated.qianchuanStatus = "待复核";
            }
          }
          return updated;
        }
        return item;
      });
    });

    const targetProp = data.find(i => i.id === formPayProprietorId);
    showToast(`✅ 已登记打款：流出资金 ¥${amt.toLocaleString()} 成功划算扣记`);
    setShowPaymentModal(false);
    setFormPayAmount("");
  };

  // Double Check Item click
  const openDetail = (item: ProprietorInvoiceItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  // Quick Action Simulation Toast handlers
  const handleExportDetails = () => {
    showToast("💾 报表打包中：系统正在格式化并生成「个体户票务与财务穿透核对主表.xlsx」，请稍后...");
    setTimeout(() => {
      showToast("📥 下载成功：已导发 LenaKids_Individual_Invoice_Master_2026.xlsx Excel 报表！");
    }, 1500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (importType === "summary") {
      showToast("⚙️ 系统正在解析您上传的「个体户对公账户情况汇总表.xlsx」数据...");
      setTimeout(() => {
        // Mock add a fresh entry
        const isExist = data.some(item => item.id === "PROP-NEW");
        if (!isExist) {
          const newItem: ProprietorInvoiceItem = {
            id: "PROP-NEW",
            shop: "莉娜kids SH",
            name: "杭州萧山优芽服装设计厂（新导入主体）",
            bank: "中国工商银行杭州庆春支行",
            accountNo: "6212021200000010998",
            accountTail: "0998",
            withdraw2025: 0.00,
            withdraw2026: 880000.00,
            withdrawTotal: 880000.00,
            currentBalance: 88000.00,
            balanceDate: "2026-05-16",
            manufacturerRatio: 0.70,
            manufacturerPayable: 616000.00,
            manufacturerInvGeneral: 300000.00,
            manufacturerInvSpecial: 100000.00,
            manufacturerInvTotal: 400000.00,
            manufacturerInvReleased: 0,
            manufacturerInvAvailable: 216000.00,
            manufacturerStatus: "可安排",
            hedeRatio: 0.13,
            hedePayable: 114400.00,
            hedePaid: 114400.00,
            hedeInvGeneral: 114400.00,
            hedeInvSpecial: 0,
            hedeInvTotal: 114400.00,
            hedeDiffAmt: 0,
            hedeStatus: "已匹配",
            qianchuanRatio: 0.10,
            qianchuanPayable: 88000.00,
            qianchuanPaidLihewei: 30000.00,
            qianchuanPaidKeyi: 20000.00,
            qianchuanPaidHuijian: 20000.00,
            qianchuanPaidYurong: 18000.00,
            qianchuanPaidTotal: 88000.00,
            qianchuanInvGeneral: 88000.00,
            qianchuanInvSpecial: 0,
            qianchuanInvTotal: 88000.00,
            qianchuanDiffAmt: 0,
            qianchuanStatus: "已匹配",
            status: "正常",
            owner: "王助理",
            originalDocs: "个体户对公账户情况汇总表_新上传.xlsx",
            originalLine: 4
          };
          setData(prev => [...prev, newItem]);
          showToast("✅ 解析成功！已成功识别1家新商户主体数据，主体已追加并重算核心指标。");
        } else {
          showToast("✅ 表格数据重碰完毕：各主体流水计算公式已刷新，未发现异常差异！");
        }
      }, 1200);
    } else {
      showToast("⚙️ 系统正在读取「每日账户提现余额报表.csv」数据并回填物理余额...");
      setTimeout(() => {
        setData(prev => {
          return prev.map(item => {
            if (item.id === "PROP-001") {
              return { ...item, currentBalance: 12544.50, balanceDate: "2026-05-16" };
            }
            if (item.id === "PROP-003") {
              return { ...item, currentBalance: 34500.00, balanceDate: "2026-05-16" };
            }
            return item;
          });
        });
        showToast("✅ 分行对公余额自动平账匹配完成！已同步完成 2026年5月16日 网银流水核对。");
      }, 1000);
    }
    setShowImportModal(false);
  };

  return (
    <div className="flex-1 space-y-6 p-6 min-w-0 bg-[#f8fafc]">
      {/* Dynamic Toast Element */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold font-sans tracking-wide border border-slate-800"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2 transition-colors focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 四、页面标题区 & 五、数据来源说明 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Building className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">票务管理</h1>
          </div>
          <p className="text-xs text-slate-450 mt-1 font-medium">
            按个体户账户提现 / 出账金额，追踪厂家、服务费、投流开票与打款情况
          </p>
        </div>
        
        {/* 操作区放按钮: 导入汇总表, 导入每日余额, 新增开票记录, 新增打款记录, 导出明细 */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="btn-import-summary"
            onClick={() => { setImportType("summary"); setShowImportModal(true); }}
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-xs border border-transparent"
          >
            <Upload className="w-3.5 h-3.5" />
            导入汇总表
          </button>
          <button 
            id="btn-import-balance"
            onClick={() => { setImportType("balance"); setShowImportModal(true); }}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-450 hover:rotate-45 transition-transform" />
            导入每日余额
          </button>
          <button 
            id="btn-add-invoice"
            onClick={() => {
              if (data.length > 0) setFormProprietorId(data[0].id);
              setFormType("manufacturer");
              setShowInvoicingModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-705 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500 font-bold" />
            登记开票记录
          </button>
          <button 
            id="btn-add-payment"
            onClick={() => {
              if (data.length > 0) setFormPayProprietorId(data[0].id);
              setFormPayType("hede");
              setShowPaymentModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-705 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500 font-bold" />
            登记打款记录
          </button>
          <button 
            id="btn-export-all"
            onClick={handleExportDetails}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            导出明细
          </button>
        </div>
      </div>

      {/* 五、数据来源轻量提示条 */}
      <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-sky-950 font-medium">
        <div className="flex items-start md:items-center gap-2.5">
          <Info className="w-4 h-4 text-sky-650 flex-shrink-0 mt-0.5 md:mt-0" />
          <span>
            <strong>数据来源：</strong>个体户对公账户情况汇总表、每日提现表、开票登记、打款登记。
            <span className="ml-1 text-sky-800">本页面数据按个体户主体归集，查看提现、应开票额、已开票、打款，管理剩余可安排票额。</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sky-800 border-t md:border-t-0 border-sky-100 pt-2 md:pt-0">
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          <span>数据最后同步时间：<strong>2026年5月16日 09:08</strong></span>
        </div>
      </div>

      {/* 六、顶部筛选区 */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-black text-slate-700">多维度筛选配置</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. 时间范围 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">时间范围</label>
            <select 
              value={timeRange} 
              onChange={(e) => { setTimeRange(e.target.value); showToast(`已筛选：时间范围 → ${e.target.value}`); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal text-slate-800 focus:outline-none focus:border-slate-350"
            >
              <option value="全部时间">全部时间</option>
              <option value="本月">本月</option>
              <option value="本年">本年</option>
              <option value="2025年">2025年</option>
              <option value="2026年">2026年</option>
              <option value="自定义">自定义</option>
            </select>
          </div>

          {/* 2. 店铺 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">店铺归属</label>
            <select 
              value={selectedShop} 
              onChange={(e) => { setSelectedShop(e.target.value); showToast(`已切换店铺：${e.target.value}`); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal text-slate-800 focus:outline-none focus:border-slate-350"
            >
              <option value="全部店铺">全部店铺</option>
              <option value="莉娜kids DQ">莉娜kids DQ</option>
              <option value="莉娜kids SY">莉娜kids SY</option>
              <option value="莉娜kids XY">莉娜kids XY</option>
              <option value="莉娜kids WT">莉娜kids WT</option>
              <option value="莉娜kids ZW">莉娜kids ZW</option>
              <option value="莉娜kids SH">莉娜kids SH</option>
            </select>
          </div>

          {/* 3. 个体户主体搜索 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">搜索主体名称</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索主体姓名..."
                value={searchOwnerQuery}
                onChange={(e) => setSearchOwnerQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-355 placeholder:font-normal placeholder:text-slate-350"
              />
              {searchOwnerQuery && (
                <button 
                  onClick={() => setSearchOwnerQuery("")}
                  className="absolute right-1.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* 4. 银行 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">开户银行</label>
            <select 
              value={selectedBank} 
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal text-slate-800 focus:outline-none focus:border-slate-350"
            >
              <option value="全部银行">全部银行</option>
              <option value="中国银行">中国银行</option>
              <option value="工商银行">工商银行</option>
              <option value="其他银行">其他银行</option>
            </select>
          </div>

          {/* 5. 票务类型 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">票务业务类型</label>
            <select 
              value={selectedInvoiceType} 
              onChange={(e) => {
                setSelectedInvoiceType(e.target.value);
                if (e.target.value === "厂家开票") setActiveTab("manufacturer");
                if (e.target.value === "赫得服务费") setActiveTab("hede");
                if (e.target.value === "千川投流") setActiveTab("qianchuan");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal text-slate-800 focus:outline-none focus:border-slate-350"
            >
              <option value="全部">全部业务</option>
              <option value="厂家开票">厂家开票 (70%)</option>
              <option value="赫得服务费">赫得服务费 (13%)</option>
              <option value="千川投流">千川投流 (10%)</option>
            </select>
          </div>

          {/* 6. 主体状态 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">主体工商状态</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal text-slate-800 focus:outline-none focus:border-slate-350"
            >
              <option value="全部">全部状态</option>
              <option value="正常">正常运作</option>
              <option value="已注销">已注销</option>
              <option value="停止使用">已停止使用</option>
            </select>
          </div>

          {/* 7. 异常状态 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">核算异常过滤</label>
            <select 
              value={selectedAbnormal} 
              onChange={(e) => setSelectedAbnormal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-normal text-slate-800 focus:outline-none focus:border-slate-350"
            >
              <option value="全部">全部异常状态</option>
              <option value="可安排">可安排票额</option>
              <option value="已完成">完美已完成</option>
              <option value="待补票">待补充发票</option>
              <option value="超额">溢出超额开票</option>
              <option value="待复核">需人工待复核</option>
            </select>
          </div>

          {/* 8. 综合搜索狂 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">全域模糊快搜</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜店铺/尾号/主体"
                value={universalSearch}
                onChange={(e) => setUniversalSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 placeholder:font-normal placeholder:text-slate-355"
              />
              {universalSearch && (
                <button 
                  onClick={() => setUniversalSearch("")}
                  className="absolute right-1.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clear Filters helper */}
        {(selectedShop !== "全部店铺" || timeRange !== "全部时间" || searchOwnerQuery !== "" || selectedBank !== "全部银行" || selectedInvoiceType !== "全部" || selectedStatus !== "全部" || selectedAbnormal !== "全部" || universalSearch !== "") && (
          <div className="mt-2.5 flex justify-end">
            <button
              onClick={() => {
                setTimeRange("全部时间");
                setSelectedShop("全部店铺");
                setSearchOwnerQuery("");
                setSelectedBank("全部银行");
                setSelectedInvoiceType("全部");
                setSelectedStatus("全部");
                setSelectedAbnormal("全部");
                setUniversalSearch("");
                showToast("✅ 已成功重置所有筛选过滤条件");
              }}
              className="text-[10px] text-sky-600 font-bold hover:underline"
            >
              清除所有筛选条件
            </button>
          </div>
        )}
      </div>

      {/* 七、顶部核心指标卡片 (6列布局，自适应) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 卡片 1: 提现金额合计 */}
        <div 
          onClick={() => {
            setTimeRange("全部时间");
            setSelectedStatus("全部");
            setSelectedAbnormal("全部");
            showToast("📊 切换至：全额度提现累计指标核实");
          }}
          className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs cursor-pointer hover:border-sky-200 hover:shadow-xs transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wide">
            <span>提现金额合计</span>
            <Coins className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-base md:text-lg font-black font-mono text-slate-800 text-right">
            {formatRMB(metrics.totalWithdrawSum)}
          </div>
          <p className="mt-2 text-[9.5px] text-slate-400 leading-tight">
            当前筛选范围内个体户提现出账汇总
          </p>
        </div>

        {/* 卡片 2: 应开票金额 */}
        <div 
          onClick={() => {
            showToast(`📊 理论应开票总计 (93.0%比例理论额): ${formatRMB(metrics.computedPayableSum)}`);
          }}
          className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs cursor-pointer hover:border-slate-200 transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wide">
            <span>应开票金额</span>
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-base md:text-lg font-black font-mono text-slate-800 text-right">
            {formatRMB(metrics.computedPayableSum)}
          </div>
          <p className="mt-2 text-[9.5px] text-slate-400 leading-tight">
            提现出账 × 规定比例折算的理论开票
          </p>
        </div>

        {/* 卡片 3: 已开票金额 */}
        <div 
          onClick={() => {
            setActiveTab("all");
            showToast("📊 列表已为您默认突出：各主体已开票总进度列");
          }}
          className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs cursor-pointer hover:border-emerald-250 hover:shadow-xs transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <span>已开票金额</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 text-base md:text-lg font-black font-mono text-slate-800 text-right">
            {formatRMB(metrics.completedInvoiceSum)}
          </div>
          <p className="mt-2 text-[9.5px] text-slate-400 leading-tight">
            厂家、服务费及投流累计已回记账发票
          </p>
        </div>

        {/* 卡片 4: 已打款金额 */}
        <div 
          onClick={() => {
            setActiveTab("hede");
            showToast("📊 切换至财务支出比对视图");
          }}
          className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs cursor-pointer hover:border-indigo-200 transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <span>已打款金额</span>
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 text-base md:text-lg font-black font-mono text-slate-800 text-right">
            {formatRMB(metrics.completedPaymentSum)}
          </div>
          <p className="mt-2 text-[9.5px] text-slate-400 leading-tight">
            个体户打款至赫得、千川等科目流水
          </p>
        </div>

        {/* 卡片 5: 可安排开票金额 */}
        <div 
          onClick={() => {
            setActiveTab("manufacturer");
            setSelectedAbnormal("可安排");
            showToast("📊 触发下钻：已为您定位厂家开票的 [可安排票额] 清单");
          }}
          className="bg-sky-50 border border-sky-100 rounded-xl p-4 shadow-3xs cursor-pointer hover:border-sky-300 hover:shadow-xs transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-sky-700 uppercase tracking-wide">
            <span>可安排开票金额</span>
            <Plus className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="mt-2 text-base md:text-lg font-black font-mono text-sky-900 text-right">
            {formatRMB(metrics.remainingAvailableInvoiceSum)}
          </div>
          <p className="mt-2 text-[9.5px] text-sky-600 leading-tight">
            当前厂家开票科目仍可继续投放安排票数
          </p>
        </div>

        {/* 卡片 6: 异常主体数 */}
        <div 
          onClick={() => {
            setActiveTab("anomalies");
            showToast("⚠️ 已聚合显示异常复核列表：请重点核验红字及超限额主体");
          }}
          className={`${metrics.abnormalCount > 0 ? "bg-red-50/70 border-red-150" : "bg-slate-50 border-slate-100"} border rounded-xl p-4 shadow-3xs cursor-pointer hover:shadow-xs transition-all duration-300`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <span className={metrics.abnormalCount > 0 ? "text-red-700 font-black animate-pulse" : "text-slate-450"}>
              异常主体数
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 ${metrics.abnormalCount > 0 ? "text-red-650" : "text-slate-400"}`} />
          </div>
          <div className={`mt-2 text-lg font-black font-mono text-right ${metrics.abnormalCount > 0 ? "text-red-700" : "text-slate-800"}`}>
            {metrics.abnormalCount} <span className="text-xs font-sans font-normal">个</span>
          </div>
          <p className={`mt-2 text-[9.5px] leading-tight ${metrics.abnormalCount > 0 ? "text-red-650 font-medium" : "text-slate-400"}`}>
            {metrics.abnormalCount > 0 ? "部分主体已超额、待补票或接近五百万 limit" : "当前筛选未有明显核对异常异常"}
          </p>
        </div>
      </div>

      {/* 八、计算逻辑说明区 (Collapsible Drawer Box) */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-3xs overflow-hidden">
        <button 
          onClick={() => setFormulaExpanded(!formulaExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 px-2 rounded-md bg-slate-100 text-[10px] font-black text-slate-550 font-mono">FORMULA</div>
            <span className="text-xs font-black text-slate-700 tracking-tight">票务计算核定逻辑与比例规则</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-slate-400 font-medium">默认折叠，点击展开查看完整会计记账公式</span>
            {formulaExpanded ? <ChevronUp className="w-4 h-4 text-slate-450" /> : <ChevronDown className="w-4 h-4 text-slate-450" />}
          </div>
        </button>

        <AnimatePresence>
          {formulaExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-50 bg-slate-50/50 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-655 font-medium leading-relaxed">
                {/* 1. 厂家开票 */}
                <div className="bg-white border border-slate-100 rounded-lg p-3.5 space-y-2">
                  <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-sky-750">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    1. 厂家开票业务 (比例: 70%)
                  </h5>
                  <div className="space-y-1 text-[11px]">
                    <p>• <strong>提现金额合计</strong> = 2025年提现已出账 + 2026年提现已出账</p>
                    <p>• <strong>厂家应开票金额</strong> = 提现金额合计 × <span className="font-bold text-slate-800">70.0%</span></p>
                    <p>• <strong>厂家已开票金额</strong> = 厂家普票 + 厂家专票</p>
                    <p className="text-sky-652">• <strong>还能安排票额</strong> = 厂家应开票 - 厂家已开票 - 已放出票额</p>
                  </div>
                </div>

                {/* 2. 赫得服务费 */}
                <div className="bg-white border border-slate-100 rounded-lg p-3.5 space-y-2">
                  <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-emerald-750">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    2. 赫得服务费业务 (比例: 13%)
                  </h5>
                  <div className="space-y-1 text-[11px]">
                    <p>• <strong>赫得服务费应开票</strong> = 提现金额合计 × <span className="font-bold text-slate-800">13.0%</span></p>
                    <p>• <strong>赫得已开票金额</strong> = 赫得普票 + 赫得专票</p>
                    <p className="text-teal-650">• <strong>财务打款账目</strong> = 自动核验统计个体户给赫得已打款数额</p>
                    <p className="text-slate-400">• <strong>打款开票差异</strong> = 个体户已打款 - 赫得已完成开票数</p>
                  </div>
                </div>

                {/* 3. 千川投流 */}
                <div className="bg-white border border-slate-100 rounded-lg p-3.5 space-y-2">
                  <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-indigo-750">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    3. 千川投流业务 (比例: 10%)
                  </h5>
                  <div className="space-y-1 text-[11px]">
                    <p>• <strong>千川投流应开票金额</strong> = 提现金额合计 × <span className="font-bold text-slate-800">10.0%</span></p>
                    <p>• <strong>千川已打款金额</strong> = 莉禾唯 + 科衣 + 惠间 + 玉融打款明细汇总</p>
                    <p>• <strong>千川已完成开票</strong> = 千川投流通道主体开具的普票/专票合计</p>
                    <p className="text-indigo-600">• <strong>打款开票差异</strong> = 千川合计付款 - 千川合计已开票</p>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 rounded-lg bg-amber-50 border border-amber-100 p-3 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>异常提示与财务警示规则：</strong>
                  如果“可安排票额”为负数，提示该个体户主体已发生溢出超额开票或票额调拨严重异常，需要立即停止该个体的厂家分配并财务核查。
                  此外，当个体提现总规模接近 500 万时，个体户可能需要停止使用以防超限爆税，必须做好即时冻结与切换准备。
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 九、页面标签页 & 数据表格区 */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-2xs overflow-hidden">
        {/* Tab List */}
        <div className="border-b border-slate-100 bg-slate-50/55 flex flex-wrap items-center justify-between px-4">
          <div className="flex gap-1 overflow-x-auto whitespace-nowrap">
            {[
              { id: "all", label: "全部主体" },
              { id: "manufacturer", label: "厂家开票 (70%)" },
              { id: "hede", label: "赫得服务费 (13%)" },
              { id: "qianchuan", label: "千川投流 (10%)" },
              { id: "anomalies", label: "异常复核" },
              { id: "balances", label: "每日余额" }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Clear specific filter conditions or let them interact naturally
                    showToast(`已切换至: ${tab.label} 专注核查视图`);
                  }}
                  className={`py-3 px-4 text-xs font-black transition-all relative border-b-2 focus:outline-none ${
                    active 
                      ? "text-sky-600 border-sky-600 bg-white" 
                      : "text-slate-450 border-transparent hover:text-slate-800 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {/* Badge showing quantities inside different tabs */}
                    {tab.id === "anomalies" && metrics.abnormalCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] px-1 py-0.2 rounded-full font-bold">
                        {metrics.abnormalCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="text-[10.5px] text-slate-400 font-semibold py-2">
            当前筛选共计: <strong className="text-slate-750 font-black">{filteredData.length}</strong> 笔归集账户主体
          </div>
        </div>

        {/* Dynamic Table Body */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            {/* Table Headers */}
            <thead className="bg-[#f8fafc] border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-opacity-95 backdrop-blur-xs z-10">
              <tr>
                {/* 1. 店铺, 2. 个体户主体, 3. 银行, 4. 账号尾号 (Always fixed first columns concept, handled elegantly via column borders) */}
                <th className="p-3 pl-4 border-r border-slate-100 min-w-[110px]">店铺</th>
                <th className="p-3 border-r border-slate-100 min-w-[200px]">个体户主体</th>
                <th className="p-3 border-r border-slate-100 min-w-[140px]">开户银行</th>
                <th className="p-3 border-r border-slate-100 text-center min-w-[80px]">尾号</th>

                {/* Ten: 全部主体 Column Headers */}
                {activeTab === "all" && (
                  <>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort("withdraw2025")}>
                      <div className="flex items-center justify-end gap-1">2025提现 {sortField === "withdraw2025" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort("withdraw2026")}>
                      <div className="flex items-center justify-end gap-1">2026提现 {sortField === "withdraw2026" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                    <th className="p-3 text-right font-black text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100" onClick={() => handleSort("withdrawTotal")}>
                      <div className="flex items-center justify-end gap-1">提现提合 {sortField === "withdrawTotal" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                    
                    {/* 厂家开票 70% Summary */}
                    <th className="p-3 text-right text-sky-700 font-bold border-l border-slate-100">厂家应票(70%)</th>
                    <th className="p-3 text-right font-bold text-slate-750">厂家已开票</th>
                    <th className="p-3 text-right font-bold text-sky-700 bg-sky-50/40">厂家可安排</th>

                    {/* 赫得 13% Summary */}
                    <th className="p-3 text-right text-emerald-700 font-bold border-l border-slate-100">赫得应票(13%)</th>
                    <th className="p-3 text-right text-slate-755">赫得已打款</th>
                    <th className="p-3 text-right text-slate-755">赫得已开</th>

                    {/* 千川 10% Summary */}
                    <th className="p-3 text-right text-indigo-700 font-bold border-l border-slate-100">千川应票(10%)</th>
                    <th className="p-3 text-right text-slate-755">千川已打款</th>
                    <th className="p-3 text-right text-slate-755 font-bold">千川已开</th>

                    {/* Account Balance */}
                    <th className="p-3 text-right border-l border-slate-100 bg-amber-50/20 text-indigo-950 font-bold">当前账户余额</th>
                  </>
                )}

                {/* Eleven: 厂家开票 Column Headers */}
                {activeTab === "manufacturer" && (
                  <>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort("withdrawTotal")}>
                      <div className="flex items-center justify-end gap-1">提现金额合计 {sortField === "withdrawTotal" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                    <th className="p-3 text-center text-slate-400">厂家比例</th>
                    <th className="p-3 text-right font-black text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("manufacturerPayable")}>
                      <div className="flex items-center justify-end gap-1">厂家应开票额 {sortField === "manufacturerPayable" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                    <th className="p-3 text-right">厂家普票</th>
                    <th className="p-3 text-right">厂家专票</th>
                    <th className="p-3 text-right font-black text-slate-750 bg-slate-50">厂家合计开票</th>
                    <th className="p-3 text-center text-red-650 font-bold">已放出票额</th>
                    <th className="p-3 text-right font-black text-sky-700 bg-sky-50 cursor-pointer hover:bg-sky-100" onClick={() => handleSort("manufacturerInvAvailable")}>
                      <div className="flex items-center justify-end gap-1">还能安排票额 {sortField === "manufacturerInvAvailable" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                  </>
                )}

                {/* Twelve: 赫得服务费 Column Headers */}
                {activeTab === "hede" && (
                  <>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort("withdrawTotal")}>
                      <div className="flex items-center justify-end gap-1">提现金额合计 {sortField === "withdrawTotal" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                    <th className="p-3 text-center text-slate-400">服务费比例</th>
                    <th className="p-3 text-right text-teal-800 font-bold" onClick={() => handleSort("hedePayable")}>赫得应开票额</th>
                    <th className="p-3 text-right font-black text-slate-805" onClick={() => handleSort("hedePaid")}>个体户给赫得已打款</th>
                    <th className="p-3 text-right">赫得普票</th>
                    <th className="p-3 text-right">赫得专票</th>
                    <th className="p-3 text-right font-black bg-slate-50">赫得合计开票</th>
                    <th className="p-3 text-right font-black text-orange-700" onClick={() => handleSort("hedeDiffAmt")}>打款与开票差异</th>
                  </>
                )}

                {/* Thirteen: 千川投流 Column Headers */}
                {activeTab === "qianchuan" && (
                  <>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort("withdrawTotal")}>
                      <div className="flex items-center justify-end gap-1">提现金额合计 {sortField === "withdrawTotal" && <ArrowUpDown className="w-2.5 h-2.5" />}</div>
                    </th>
                    <th className="p-3 text-center text-slate-400">千川比例</th>
                    <th className="p-3 text-right text-indigo-700 font-bold">千川应开票额</th>
                    <th className="p-3 text-right text-xs">莉禾唯打款</th>
                    <th className="p-3 text-right text-xs">科衣打款</th>
                    <th className="p-3 text-right text-xs">惠间打款</th>
                    <th className="p-3 text-right text-xs">玉融打款</th>
                    <th className="p-3 text-right font-black text-slate-800 bg-slate-50">千川已打合计</th>
                    <th className="p-3 text-right">千川普票</th>
                    <th className="p-3 text-right">千川专票</th>
                    <th className="p-3 text-right font-black text-slate-800 bg-indigo-50/20">千川合计开票</th>
                    <th className="p-3 text-right text-orange-650 font-bold">付款开票差异</th>
                  </>
                )}

                {/* Fourteen: 异常复核 Column Headers */}
                {activeTab === "anomalies" && (
                  <>
                    <th className="p-3 text-left min-w-[120px]">异常类型</th>
                    <th className="p-3 text-right min-w-[130px]">关联出账金额</th>
                    <th className="p-3 text-right min-w-[120px]">差异超额金额</th>
                    <th className="p-3 text-left min-w-[200px]">异常详细说明说明</th>
                    <th className="p-3 text-left min-w-[180px]">配合建议处理</th>
                  </>
                )}

                {/* Fifteen: 每日余额 Column Headers */}
                {activeTab === "balances" && (
                  <>
                    <th className="p-3 text-right font-black text-slate-800 bg-amber-50/30" onClick={() => handleSort("currentBalance")}>当前账户余额</th>
                    <th className="p-3 text-center">对应余额日期</th>
                  </>
                )}

                <th className="p-3 text-center min-w-[100px] border-l border-slate-100">状态</th>
                <th className="p-3 text-center sticky right-0 bg-[#f8fafc] shadow-lg border-l border-slate-150 min-w-[130px]">操作</th>
              </tr>
            </thead>

            {/* Table Body Rows */}
            <tbody className="text-xs text-slate-700 divide-y divide-slate-100 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={24} className="p-8 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                      <p className="font-bold">未找到满足过滤条件的个体户主体记录</p>
                      <p className="text-[10.5px] text-slate-400">请清除部分筛选条件或导入汇总表重试</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  // Determine is closer to 5 Million limit 
                  const nearLimit = item.withdrawTotal >= 4800000;
                  
                  // In Anomaly Tab we determine custom strings
                  let anomalyType = "无";
                  let anomalyColor = "text-slate-500 bg-slate-100";
                  let linkAmt = item.withdrawTotal;
                  let diffAmtVal = 0;
                  let anomalyDesc = "正常主体";
                  let recommendFix = "维持日常核查监控";

                  if (item.manufacturerStatus === "超额") {
                    anomalyType = "超额开票";
                    anomalyColor = "text-red-700 bg-red-50 border border-red-100";
                    linkAmt = item.manufacturerPayable;
                    diffAmtVal = Math.abs(item.manufacturerInvAvailable);
                    anomalyDesc = "可安排票额为负数，实际开票金额已超越设定的 70.0% 比例理论红线！";
                    recommendFix = "由于超额已成事实，建议暂停该主体的后续厂家高派发额，由其他完备主体平账";
                  } else if (item.hedeStatus === "待补票" || item.qianchuanStatus === "待补票") {
                    anomalyType = "待补票务";
                    anomalyColor = "text-orange-700 bg-orange-50 border border-orange-100";
                    linkAmt = item.hedePaid + item.qianchuanPaidTotal;
                    diffAmtVal = Math.max(item.hedeDiffAmt, item.qianchuanDiffAmt);
                    anomalyDesc = "银行流水出账已打款，但相关服务商/投流主体尚未足额反开底根普专发票。";
                    recommendFix = "联系赫得财务(胡主管)或莉禾唯跟进人，要求在3个工作日内补开齐相应发票";
                  } else if (nearLimit) {
                    anomalyType = "逼近500万";
                    anomalyColor = "text-purple-700 bg-purple-50 border border-purple-100";
                    linkAmt = item.withdrawTotal;
                    diffAmtVal = 5000000 - item.withdrawTotal;
                    anomalyDesc = `累计提现已突破 ${formatRMB(item.withdrawTotal)}，随时触发个体税案合规及转一般纳税人风控。`;
                    recommendFix = "停止继续代购新收银，新对公归流请无缝切换走备底新个体户商行";
                  } else if (item.status === "已注销") {
                    anomalyType = "主体已注销";
                    anomalyColor = "text-slate-700 bg-slate-100 border border-slate-200";
                    linkAmt = item.withdrawTotal;
                    diffAmtVal = 0;
                    anomalyDesc = "该个体工商户主体已在工商局执行完销户清算，无法发生后续票额流动。";
                    recommendFix = "财务系统标识归档，不再接收对其的打款及额度分配";
                  }

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        nearLimit ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* 1. 店铺 */}
                      <td className="p-3 pl-4 border-r border-slate-50 font-sans font-bold text-slate-800">
                        {item.shop}
                      </td>
                      
                      {/* 2. 主体姓名及警示标志 */}
                      <td className="p-3 border-r border-slate-50 font-sans font-medium text-slate-700">
                        <div className="space-y-0.5">
                          <button 
                            onClick={() => openDetail(item)}
                            className="text-left font-bold text-slate-800 hover:text-sky-600 hover:underline transition-colors block text-xs"
                          >
                            {item.name}
                          </button>
                          {nearLimit && (
                            <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                              <AlertTriangle className="w-3 h-3 text-amber-600 animate-bounce" />
                              逼近500W: 剩余限额 {formatRMB(5000000 - item.withdrawTotal)}
                            </div>
                          )}
                          {item.remarks && (
                            <div className="text-[9.5px] text-slate-400 font-normal truncate max-w-[240px]" title={item.remarks}>
                              {item.remarks}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. 银行 */}
                      <td className="p-3 border-r border-slate-50 font-sans text-slate-500">
                        <span className="text-[11px] block leading-tight">{item.bank.split("杭州")[0]}</span>
                        <span className="text-[9.5px] text-slate-400 block tracking-tight">{item.bank.split("杭州")[1] || "分行支行"}</span>
                      </td>

                      {/* 4. 银行尾号 */}
                      <td className="p-3 border-r border-slate-50 text-center font-bold text-slate-650 bg-slate-50/30">
                        <span className="bg-slate-100 text-slate-700 p-1 px-1.5 rounded text-[10.5px]">
                          {item.accountTail}
                        </span>
                      </td>

                      {/* TAB: 全部主体 */}
                      {activeTab === "all" && (
                        <>
                          <td className="p-3 text-right text-slate-500">{formatRMB(item.withdraw2025)}</td>
                          <td className="p-3 text-right text-slate-500">{formatRMB(item.withdraw2026)}</td>
                          <td className="p-3 text-right font-black text-slate-850 bg-slate-50/40">
                            {formatRMB(item.withdrawTotal)}
                          </td>
                          
                          {/* 厂家 70% */}
                          <td className="p-3 text-right text-sky-800 font-semibold border-l border-slate-50">{formatRMB(item.manufacturerPayable)}</td>
                          <td className="p-3 text-right text-slate-600">{formatRMB(item.manufacturerInvTotal)}</td>
                          <td className={`p-3 text-right font-black bg-sky-50/20 ${item.manufacturerInvAvailable < 0 ? "text-red-650" : "text-sky-700"}`}>
                            {formatRMB(item.manufacturerInvAvailable)}
                          </td>

                          {/* 赫得 13% */}
                          <td className="p-3 text-right text-emerald-800 font-semibold border-l border-slate-50">{formatRMB(item.hedePayable)}</td>
                          <td className="p-3 text-right text-slate-550">{formatRMB(item.hedePaid)}</td>
                          <td className="p-3 text-right text-slate-550">{formatRMB(item.hedeInvTotal)}</td>

                          {/* 千川 10% */}
                          <td className="p-3 text-right text-indigo-800 font-semibold border-l border-slate-50">{formatRMB(item.qianchuanPayable)}</td>
                          <td className="p-3 text-right text-slate-500">{formatRMB(item.qianchuanPaidTotal)}</td>
                          <td className="p-3 text-right text-slate-600 font-bold">{formatRMB(item.qianchuanInvTotal)}</td>

                          {/* Account Balance */}
                          <td className="p-3 text-right border-l border-slate-50 bg-indigo-50/5 font-bold text-slate-750">
                            {formatRMB(item.currentBalance)}
                          </td>
                        </>
                      )}

                      {/* TAB: 厂家开票 view */}
                      {activeTab === "manufacturer" && (
                        <>
                          <td className="p-3 text-right font-bold text-slate-600">{formatRMB(item.withdrawTotal)}</td>
                          <td className="p-3 text-center text-[10.5px] text-slate-400 font-bold">70.0%</td>
                          <td className="p-3 text-right font-black text-slate-700">{formatRMB(item.manufacturerPayable)}</td>
                          <td className="p-3 text-right text-slate-500">{formatRMB(item.manufacturerInvGeneral)}</td>
                          <td className="p-3 text-right text-slate-500">{formatRMB(item.manufacturerInvSpecial)}</td>
                          <td className="p-3 text-right font-black text-slate-800 bg-slate-50/50">{formatRMB(item.manufacturerInvTotal)}</td>
                          <td className="p-3 text-center">
                            {item.manufacturerInvReleased > 0 ? (
                              <span className="text-red-650 bg-red-50 px-1.5 py-0.5 rounded font-black text-[9.5px]">
                                {formatRMB(item.manufacturerInvReleased)}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className={`p-3 text-right font-black bg-sky-50 text-xs ${
                            item.manufacturerInvAvailable < 0 ? "text-red-500" : "text-sky-700"
                          }`}>
                            {formatRMB(item.manufacturerInvAvailable)}
                          </td>
                        </>
                      )}

                      {/* TAB: 赫得服务费 view */}
                      {activeTab === "hede" && (
                        <>
                          <td className="p-3 text-right font-bold text-slate-600">{formatRMB(item.withdrawTotal)}</td>
                          <td className="p-3 text-center text-[10.5px] text-slate-400">13.0%</td>
                          <td className="p-3 text-right font-bold text-teal-800">{formatRMB(item.hedePayable)}</td>
                          <td className="p-3 text-right font-black text-slate-750">{formatRMB(item.hedePaid)}</td>
                          <td className="p-3 text-right text-slate-500">{formatRMB(item.hedeInvGeneral)}</td>
                          <td className="p-3 text-right text-slate-500">{formatRMB(item.hedeInvSpecial)}</td>
                          <td className="p-3 text-right font-black text-slate-800 bg-slate-50/50">{formatRMB(item.hedeInvTotal)}</td>
                          <td className={`p-3 text-right font-black text-xs ${
                            item.hedeDiffAmt > 50 
                              ? "text-orange-655 bg-orange-50/50" 
                              : item.hedeDiffAmt < -50 
                              ? "text-red-600" 
                              : "text-emerald-700 bg-emerald-50/30"
                          }`}>
                            {item.hedeDiffAmt > 0 ? "+" : ""}{formatRMB(item.hedeDiffAmt)}
                          </td>
                        </>
                      )}

                      {/* TAB: 千川投流 view */}
                      {activeTab === "qianchuan" && (
                        <>
                          <td className="p-3 text-right font-bold text-slate-600">{formatRMB(item.withdrawTotal)}</td>
                          <td className="p-3 text-center text-slate-400">10.0%</td>
                          <td className="p-3 text-right font-bold text-indigo-750">{formatRMB(item.qianchuanPayable)}</td>
                          <td className="p-3 text-right text-slate-500 truncate max-w-[80px]">{formatRMB(item.qianchuanPaidLihewei)}</td>
                          <td className="p-3 text-right text-slate-500 truncate max-w-[80px]">{formatRMB(item.qianchuanPaidKeyi)}</td>
                          <td className="p-3 text-right text-slate-500 truncate max-w-[80px]">{formatRMB(item.qianchuanPaidHuijian)}</td>
                          <td className="p-3 text-right text-slate-500 truncate max-w-[80px]">{formatRMB(item.qianchuanPaidYurong)}</td>
                          <td className="p-3 text-right font-black text-slate-800 bg-slate-50/50">{formatRMB(item.qianchuanPaidTotal)}</td>
                          <td className="p-3 text-right text-slate-450">{formatRMB(item.qianchuanInvGeneral)}</td>
                          <td className="p-3 text-right text-slate-450">{formatRMB(item.qianchuanInvSpecial)}</td>
                          <td className="p-3 text-right font-black text-[#1e1b4b] bg-indigo-50/20">{formatRMB(item.qianchuanInvTotal)}</td>
                          <td className={`p-3 text-right font-black text-xs ${
                            item.qianchuanDiffAmt > 50 
                              ? "text-orange-600 bg-orange-50/30" 
                              : item.qianchuanDiffAmt < -50 
                              ? "text-red-500" 
                              : "text-emerald-700 bg-emerald-50/30"
                          }`}>
                            {item.qianchuanDiffAmt > 0 ? "+" : ""}{formatRMB(item.qianchuanDiffAmt)}
                          </td>
                        </>
                      )}

                      {/* TAB: 异常复核 view */}
                      {activeTab === "anomalies" && (
                        <>
                          <td className="p-3 border-r border-slate-50">
                            <span className={`p-1 px-2 rounded-md font-bold text-[9px] ${anomalyColor}`}>
                              {anomalyType}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-600 font-bold">{formatRMB(linkAmt)}</td>
                          <td className="p-3 text-right font-black text-red-600">{diffAmtVal > 0 ? formatRMB(diffAmtVal) : "-"}</td>
                          <td className="p-3 font-sans text-[11px] text-slate-550 max-w-[250px] leading-snug">
                            {anomalyDesc}
                          </td>
                          <td className="p-3 font-sans text-[11.5px] text-sky-850 font-medium">
                            {recommendFix}
                          </td>
                        </>
                      )}

                      {/* TAB: 每日余额 view */}
                      {activeTab === "balances" && (
                        <>
                          <td className="p-3 text-right font-black text-slate-850 bg-amber-50/15">{formatRMB(item.currentBalance)}</td>
                          <td className="p-3 text-center text-slate-450 font-sans">{item.balanceDate}</td>
                        </>
                      )}

                      {/* 状态 Column */}
                      <td className="p-3 text-center border-l border-slate-50">
                        {item.status === "正常" && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-750 border border-emerald-100">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            正常
                          </span>
                        )}
                        {item.status === "已注销" && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            已注销
                          </span>
                        )}
                        {item.status === "停止使用" && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            <span className="w-1 h-1 rounded-full bg-orange-500" />
                            停止使用
                          </span>
                        )}
                      </td>

                      {/* 操作 Column - Fixed right for responsive tracking */}
                      <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 border-l border-slate-150 shadow-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openDetail(item)}
                            className="text-[10px] text-sky-600 border border-sky-100 p-1 px-2 rounded-md font-bold hover:bg-sky-50 transition-colors flex items-center gap-0.5"
                            title="查看完整明细"
                          >
                            <Eye className="w-3 h-3" />
                            详情
                          </button>
                          
                          {item.status === "正常" && (
                            <>
                              <button
                                onClick={() => {
                                  setFormProprietorId(item.id);
                                  setShowInvoicingModal(true);
                                }}
                                className="text-[10.5px] text-slate-700 hover:text-indigo-600 font-medium hover:underline p-1"
                              >
                                开票
                              </button>
                              <button
                                onClick={() => {
                                  setFormPayProprietorId(item.id);
                                  setShowPaymentModal(true);
                                }}
                                className="text-[10.5px] text-slate-705 hover:text-emerald-600 font-medium hover:underline p-1"
                              >
                                打款
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 十六、行详情设计 - Right side drawing details drawer */}
      <AnimatePresence>
        {detailOpen && selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailOpen(false)}
              className="fixed inset-0 bg-slate-900 z-50 pointer-events-auto"
            />

            {/* Drawer Container */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-slate-200 pointer-events-auto overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4.5 h-4.5 text-sky-650" />
                    <h3 className="text-sm font-black text-slate-800">个体户票务详情</h3>
                  </div>
                  <button 
                    onClick={() => setDetailOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Body details */}
                <div className="space-y-5 text-xs text-slate-700">
                  {/* 1. 基础信息 */}
                  <div className="space-y-2 bg-[#f8fafc] p-3 rounded-xl">
                    <p className="text-[10px] font-black text-sky-700 uppercase tracking-widest border-b border-sky-50 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      1. 基础工商信息
                    </p>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11.5px]">
                      <div>
                        <span className="text-slate-400">店铺归属:</span>
                        <p className="font-bold text-slate-800">{selectedItem.shop}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">主体状态:</span>
                        <div className="mt-0.5">
                          {selectedItem.status === "正常" && <span className="bg-emerald-50 text-emerald-800 font-bold p-0.5 px-1.5 rounded text-[9.5px]">正常运作</span>}
                          {selectedItem.status === "已注销" && <span className="bg-slate-100 text-slate-500 font-bold p-0.5 px-1.5 rounded text-[9.5px]">已注销</span>}
                          {selectedItem.status === "停止使用" && <span className="bg-orange-50 text-orange-700 font-bold p-0.5 px-1.5 rounded text-[9.5px]">停止使用</span>}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">个体户主体:</span>
                        <p className="font-bold text-slate-800 leading-normal">{selectedItem.name}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">开户银行支行:</span>
                        <p className="font-bold text-slate-800 text-[11px] font-sans">{selectedItem.bank}</p>
                      </div>
                      <div className="col-span-2 font-mono">
                        <span className="text-slate-400">银行完整账号:</span>
                        <p className="text-slate-800 font-black tracking-wider text-xs">{selectedItem.accountNo}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. 资金及余额 */}
                  <div className="space-y-2 bg-[#f8fafc] p-3 rounded-xl font-mono">
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest border-b border-amber-50 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      2. 提现及现存资金
                    </p>
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">2025年已提现金额:</span>
                        <span className="font-bold text-slate-800">{formatRMB(selectedItem.withdraw2025)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">2026年已提现金额:</span>
                        <span className="font-bold text-slate-800">{formatRMB(selectedItem.withdraw2026)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/50 pt-1">
                        <span className="text-slate-700 font-bold">提现出账金额合计 (A):</span>
                        <span className="font-black text-slate-900">{formatRMB(selectedItem.withdrawTotal)}</span>
                      </div>
                      <div className="flex justify-between text-indigo-700 pt-1">
                        <span>当前网银账户结存余额:</span>
                        <span className="font-black text-sm">{formatRMB(selectedItem.currentBalance)}</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 text-right font-sans">
                        余额更新申报日期: {selectedItem.balanceDate}
                      </p>
                    </div>
                  </div>

                  {/* 3. 厂家开票 (70%) */}
                  <div className="space-y-2 bg-[#f8fafc] p-3 rounded-xl font-mono">
                    <p className="text-[10px] font-black text-sky-800 uppercase tracking-widest border-b border-sky-50 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      3. 厂家开票业务 (70%额度)
                    </p>
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">厂家应开票金额 (70% × A):</span>
                        <span className="font-bold text-slate-800">{formatRMB(selectedItem.manufacturerPayable)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">├─ 厂家普票:</span>
                        <span className="text-slate-600">{formatRMB(selectedItem.manufacturerInvGeneral)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">├─ 厂家专票:</span>
                        <span className="text-slate-600">{formatRMB(selectedItem.manufacturerInvSpecial)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">├─ 厂家累计已开:</span>
                        <span className="font-bold text-slate-800">{formatRMB(selectedItem.manufacturerInvTotal)}</span>
                      </div>
                      {selectedItem.manufacturerInvReleased > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>└─ 注销放出额:</span>
                          <span>-{formatRMB(selectedItem.manufacturerInvReleased)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-200/50 pt-1">
                        <span className="font-bold text-sky-800">厂家还能安排额:</span>
                        <span className={`font-black text-sm ${selectedItem.manufacturerInvAvailable < 0 ? "text-red-500" : "text-sky-700"}`}>
                          {formatRMB(selectedItem.manufacturerInvAvailable)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10.5px] pt-1">
                        <span className="text-slate-455">票额状态:</span>
                        <span className={`font-bold ${
                          selectedItem.manufacturerStatus === "超额" ? "text-red-600" : "text-sky-600"
                        }`}>{selectedItem.manufacturerStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. 赫得服务费 */}
                  <div className="space-y-2 bg-[#f8fafc] p-3 rounded-xl font-mono">
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      4. 赫得服务费业务 (13%额度)
                    </p>
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">赫得应开票金额 (13% × A):</span>
                        <span className="font-bold text-slate-850">{formatRMB(selectedItem.hedePayable)}</span>
                      </div>
                      <div className="flex justify-between text-indigo-705">
                        <span className="font-bold">个体给赫得已打款:</span>
                        <span className="font-black text-slate-800">{formatRMB(selectedItem.hedePaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">已回发票合计:</span>
                        <span className="font-bold text-slate-700">{formatRMB(selectedItem.hedeInvTotal)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/50 pt-1">
                        <span className="text-slate-400">打款与开票差异:</span>
                        <span className={`font-bold ${selectedItem.hedeDiffAmt > 50 ? "text-orange-650" : "text-slate-750"}`}>
                          {formatRMB(selectedItem.hedeDiffAmt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. 千川投流 */}
                  <div className="space-y-2 bg-[#f8fafc] p-3 rounded-xl font-mono">
                    <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest border-b border-indigo-50 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      5. 千川投流业务 (10%额度)
                    </p>
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">其间应投流票额 (10% × A):</span>
                        <span className="font-bold text-slate-800">{formatRMB(selectedItem.qianchuanPayable)}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-450 pl-2 leading-snug space-y-0.5">
                        <div className="flex justify-between">
                          <span>莉禾唯打款:</span>
                          <span>{formatRMB(selectedItem.qianchuanPaidLihewei)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>科衣已打款:</span>
                          <span>{formatRMB(selectedItem.qianchuanPaidKeyi)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>惠间已打款:</span>
                          <span>{formatRMB(selectedItem.qianchuanPaidHuijian)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>玉融已打款:</span>
                          <span>{formatRMB(selectedItem.qianchuanPaidYurong)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/20 pt-1 font-bold">
                        <span>千川已扣款合计:</span>
                        <span className="text-slate-800">{formatRMB(selectedItem.qianchuanPaidTotal)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>千川合计开票:</span>
                        <span className="text-indigo-800">{formatRMB(selectedItem.qianchuanInvTotal)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/50 pt-1">
                        <span className="text-slate-400">付出与回票差异:</span>
                        <span className={`font-bold ${selectedItem.qianchuanDiffAmt > 50 ? "text-orange-650" : "text-slate-750"}`}>
                          {formatRMB(selectedItem.qianchuanDiffAmt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 6. 原始数据 */}
                  <div className="space-y-1 bg-slate-100 p-2.5 rounded-lg text-[10.5px] leading-snug font-sans text-slate-500">
                    <p className="font-black text-slate-700">6. 底层数据链路源</p>
                    <p>• 来源存储大表: <strong className="text-slate-750">{selectedItem.originalDocs || "主对公往来池表_A021"}</strong></p>
                    <p>• 表格对应的行号: Row <span className="font-bold text-slate-800">{selectedItem.originalLine || 11}</span></p>
                    <p>• 终核对人员: 经办 <span className="font-bold text-slate-800">{selectedItem.owner}</span></p>
                    <p>• 反馈备注说: {selectedItem.remarks || "无"}</p>
                    <div className="pt-1">
                      <button 
                        onClick={() => showToast(`🔗 原始凭证系统：已成功锁定底层行号【Row ${selectedItem.originalLine}】，正在查取网银直连交易日志...`)}
                        className="text-[10px] text-sky-600 font-bold hover:underline"
                      >
                        查看原始回单日志
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="border-t border-slate-100 pt-4 mt-6">
                <div className="grid grid-cols-2 gap-2">
                  {selectedItem.status === "正常" ? (
                    <>
                      <button
                        onClick={() => {
                          setFormProprietorId(selectedItem.id);
                          setShowInvoicingModal(true);
                        }}
                        className="bg-[#0f172a] text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800"
                      >
                        登记开票
                      </button>
                      <button
                        onClick={() => {
                          setFormPayProprietorId(selectedItem.id);
                          setShowPaymentModal(true);
                        }}
                        className="border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"
                      >
                        登记打款
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="bg-slate-100 text-slate-400 py-2 rounded-lg text-xs font-bold col-span-2 cursor-not-allowed"
                    >
                      主体已废/已注销，无法办理
                    </button>
                  )}
                  <button
                    onClick={() => {
                      showToast(`📁 已导出单体明细 [${selectedItem.name.substring(0, 8)}] 穿透表`);
                    }}
                    className="col-span-2 text-center text-xs text-sky-600 py-2 font-bold hover:underline"
                  >
                    下载该主体账务明细
                  </button>
                  <button
                    onClick={() => setDetailOpen(false)}
                    className="col-span-2 text-center text-xs text-slate-450 hover:text-slate-800"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* modal block: 新增开票记录登记 */}
      <AnimatePresence>
        {showInvoicingModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
              <button 
                onClick={() => setShowInvoicingModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                <Receipt className="w-5 h-5 text-indigo-500" />
                <h4 className="text-sm font-black text-slate-800">登记开票记录</h4>
              </div>

              <form onSubmit={handleAddInvoiceSubmit} className="space-y-4 text-xs font-sans">
                {/* 1. 主体选择 */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-450">选择个体户主体</label>
                  <select
                    value={formProprietorId}
                    onChange={e => setFormProprietorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {data.filter(i => i.status === "正常").map(prop => (
                      <option key={prop.id} value={prop.id}>{prop.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. 费用科目类型 */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-450">安排科目归口</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "manufacturer", label: "厂家 (70%)" },
                      { id: "hede", label: "赫得服务 (13%)" },
                      { id: "qianchuan", label: "千川投流 (10%)" }
                    ].map(type => {
                      const sel = formType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormType(type.id as any)}
                          className={`p-2 py-1.5 rounded-lg border text-center font-bold ${
                            sel 
                              ? "border-sky-500 bg-sky-50 text-sky-700" 
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 发票介质 */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-450">发票介质类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormInvType("general")}
                      className={`p-2 py-1 rounded-lg border text-center font-bold ${
                        formInvType === "general"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-250 bg-slate-50 text-slate-600"
                      }`}
                    >
                      电子普通公票
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormInvType("special")}
                      className={`p-2 py-1 rounded-lg border text-center font-bold ${
                        formInvType === "special"
                          ? "border-teal-650 bg-teal-50 text-teal-800"
                          : "border-slate-250 bg-slate-50 text-slate-600"
                      }`}
                    >
                      增值税专用发票
                    </button>
                  </div>
                </div>

                {/* 4. 金额 */}
                <div className="space-y-1 font-mono text-slate-800">
                  <label className="block font-bold text-slate-450 font-sans">开票金额(元)</label>
                  <input
                    type="number"
                    placeholder="请输入最终发票面额"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-black"
                  />
                </div>

                {formType === "manufacturer" && (
                  <div className="space-y-1 font-mono">
                    <label className="block font-bold text-slate-450 font-sans">已放出票额(元)</label>
                    <input
                      type="number"
                      placeholder="选填，注销清算等需要抵扣面值时填写"
                      value={formReleased}
                      onChange={e => setFormReleased(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-bold">
                  <button
                    type="submit"
                    className="bg-[#0f172a] text-white py-2 rounded-lg hover:bg-slate-800"
                  >
                    确认登记
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoicingModal(false)}
                    className="border border-slate-250 text-slate-705 py-2 rounded-lg hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* modal block: 新增付款打款登记 */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h4 className="text-sm font-black text-slate-800">登记个体打款记录</h4>
              </div>

              <form onSubmit={handleAddPaymentSubmit} className="space-y-4 text-xs font-sans">
                {/* 1. 主体选择 */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-450">选择付款个体户</label>
                  <select
                    value={formPayProprietorId}
                    onChange={e => setFormPayProprietorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {data.filter(i => i.status === "正常").map(prop => (
                      <option key={prop.id} value={prop.id}>{prop.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. 收款方类型 */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-450">打款转账科目</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setFormPayType("hede"); setFormPayTarget(""); }}
                      className={`p-2 py-1.5 rounded-lg border text-center font-bold ${
                        formPayType === "hede"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      赫得服务费
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormPayType("qianchuan"); setFormPayTarget("lihewei"); }}
                      className={`p-2 py-1.5 rounded-lg border text-center font-bold ${
                        formPayType === "qianchuan"
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      千川投流代理
                    </button>
                  </div>
                </div>

                {/* 3. 千川投流二级细分 target */}
                {formPayType === "qianchuan" && (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-450">细分打款对象</label>
                    <select
                      value={formPayTarget}
                      onChange={e => setFormPayTarget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold"
                    >
                      <option value="lihewei">莉禾唯</option>
                      <option value="keyi">科衣</option>
                      <option value="huijian">惠间</option>
                      <option value="yurong">玉融</option>
                    </select>
                  </div>
                )}

                {/* 4. 打款扣网银金额 */}
                <div className="space-y-1 font-mono">
                  <label className="block font-bold text-slate-450 font-sans">打款流出金额(元)</label>
                  <input
                    type="number"
                    placeholder="请输入银行实际付出金额"
                    value={formPayAmount}
                    onChange={e => setFormPayAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-black"
                  />
                  <span className="text-[10px] text-slate-400 block pt-0.5 font-sans leading-snug">
                    * 成功打款后，系统会自动对扣减该个体的网银对公“当前结存余额”。
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-bold">
                  <button
                    type="submit"
                    className="bg-[#0f172a] text-white py-2 rounded-lg hover:bg-slate-800"
                  >
                    确认划款记账
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="border border-slate-250 text-slate-705 py-2 rounded-lg hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* modal block: 模拟上传导入汇总表/余额表 */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
            <div className="bg-white border rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
              <button 
                onClick={() => setShowImportModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                <h4 className="text-sm font-black text-slate-800">
                  {importType === "summary" ? "导入个体户情况汇总表" : "导入每日网银余额表"}
                </h4>
              </div>

              <form onSubmit={handleImportSubmit} className="space-y-4 text-xs font-sans">
                <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-5 text-center cursor-pointer transition-colors space-y-1">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">点击上传或拖拽 Excel 文件至此</p>
                  <p className="text-[11px] text-slate-400">
                    支持 .xlsx, .xls, .csv 格式 (单次限 10M 以内)
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 leading-normal space-y-1">
                  <p className="font-semibold text-slate-700">系统识别规则提示：</p>
                  {importType === "summary" ? (
                    <>
                      <p>1. 系统将按店铺、公司、提现金额(2025/2026/合计)字段归集核对</p>
                      <p>2. 各项应开票额将自动依照 70%、13%、10% 进行全向对流折算</p>
                    </>
                  ) : (
                    <>
                      <p>1. 提现余额数据应包含：个体户简称、账号、分行当前余额，同步锁定期初余额</p>
                      <p>2. 导入后系统会将物理余额重碰更新</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-bold">
                  <button
                    type="submit"
                    className="bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 font-bold"
                  >
                    解析并导入数据
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
