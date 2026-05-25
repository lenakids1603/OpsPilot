import React, { useState, useMemo } from "react";
import { 
  X, Download, FileText, CheckCircle2, Wallet, ArrowRight, BarChart2, Check, RefreshCw, 
  Layers, Calendar, Landmark, Info, AlertCircle, AlertTriangle, ShieldCheck, HelpCircle, FileSpreadsheet
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface OverviewKPIsDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "invoice_available" | "invoice_completed" | "payment_paid" | null;
  kpis: {
    income: number;
    expense: number;
    net: number;
    invoiceable: number;
    invoiced: number;
    paid: number;
    desc: string;
  };
  timeRange: string;
  selectedPlatform: string;
  selectedShop: string;
  showToast: (msg: string) => void;
}

export default function OverviewKPIsDetailDrawer({
  isOpen,
  onClose,
  type,
  kpis,
  timeRange,
  selectedPlatform,
  selectedShop,
  showToast
}: OverviewKPIsDetailDrawerProps) {
  // Local state for Caliber on Invoice Completed
  // "date" = 按开票日期, "period" = 按账期入库合并分拨
  const [invoiceCaliber, setInvoiceCaliber] = useState<"date" | "period">("date");

  // Local state for Payment Filter
  // "all" = 全部付款渠道, "direct" = 银企直联拨付, "manual" = 外部网银人工
  const [paymentChannelFilter, setPaymentChannelFilter] = useState<"all" | "direct" | "manual">("all");

  // Format date mappings
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case "day": return "今日";
      case "yesterday": return "昨日";
      case "month": return "本月";
      case "lastMonth": return "上月";
      case "custom": return "选定周期(自定义)";
      default: return "本月";
    }
  }, [timeRange]);

  // Data Updates timestamps
  const updatedDateText = useMemo(() => {
    return "数据自动更新于：今日 09:00:00 (国税总局发票底账库与银企直联双向同步已对齐)";
  }, []);

  // 1. Calculations for Invoiceable (可开票金额)
  const invoiceableData = useMemo(() => {
    if (type !== "invoice_available") return null;
    const total = kpis.invoiceable;

    // Distribute calculations
    const inboundTotal = Math.round(total * 1.5);
    const differenceTotal = Math.round(total * 0.1);
    const invoicedTotal = Math.round(total * 0.4);
    // Adjusted available logic: Available = Inbound - Difference - Invoiced
    // We adjust final item so available total is exactly equal to 'total'
    
    const items = [
      {
        id: "SUB-BILL-2026-001",
        supplier: "织锦服饰加工厂",
        inbound: Math.round(total * 0.90),
        difference: Math.round(total * 0.05),
        invoiced: Math.round(total * 0.40),
        status: "待开票" as const,
      },
      {
        id: "SUB-BILL-2026-002",
        supplier: "亮亮童装面料商",
        inbound: Math.round(total * 0.65),
        difference: Math.round(total * 0.10),
        invoiced: Math.round(total * 0.20),
        status: "待核对" as const, // because difference is 10%
      },
      {
        id: "SUB-BILL-2026-003",
        supplier: "宏大物流园",
        inbound: Math.round(total * 0.40),
        difference: 0,
        invoiced: Math.round(total * 0.10),
        status: "异常已排解" as const,
      },
      {
        id: "SUB-BILL-2026-004",
        supplier: "温岭市依依童装店",
        inbound: Math.round(total * 0.15),
        difference: 0,
        invoiced: Math.round(total * 0.25),
        status: "超额开票" as const, // Negatives alert
      }
    ];

    // Recalculate available amounts and align precisely to decimal points
    const mappedItems = items.map((item, index) => {
      const avail = item.inbound - item.difference - item.invoiced;
      return {
        ...item,
        available: avail
      };
    });

    // Make sure the sum of available amounts is exactly total
    const sumAvailable = mappedItems.reduce((acc, item) => acc + item.available, 0);
    const diffToTotal = total - sumAvailable;
    if (diffToTotal !== 0) {
      mappedItems[0].available += diffToTotal;
    }

    return {
      inboundTotal: mappedItems.reduce((acc, i) => acc + i.inbound, 0),
      differenceTotal: mappedItems.reduce((acc, i) => acc + i.difference, 0),
      invoicedTotal: mappedItems.reduce((acc, i) => acc + i.invoiced, 0),
      items: mappedItems
    };
  }, [type, kpis.invoiceable]);

  // 2. Calculations for Invoiced Amount (已开票金额)
  const invoicedData = useMemo(() => {
    if (type !== "invoice_completed") return null;
    const total = kpis.invoiced;

    // Categorization composition
    const vendorAmt = Math.round(total * 0.85);
    const logisticsAmt = Math.round(total * 0.10);
    const serviceAmt = total - vendorAmt - logisticsAmt;

    const invoices = [
      {
        no: "INV-2026-0021",
        payee: "织锦服饰加工厂",
        category: "儿童夏装大货(采购发票)",
        amount: Math.round(total * 0.45),
        rate: "13%",
        date: invoiceCaliber === "date" ? "2026-05-15" : "2026-05-18",
        status: "已认证抵扣" as const,
      },
      {
        no: "INV-2026-0022",
        payee: "亮亮童装面料商",
        category: "毛呢大衣预付款(采购发票)",
        amount: Math.round(total * 0.35),
        rate: "13%",
        date: invoiceCaliber === "date" ? "2026-05-12" : "2026-05-14",
        status: "待认证" as const,
      },
      {
        no: "INV-2026-0043",
        payee: "宏大物流园",
        category: "仓储打包搬运费(技术服务发票)",
        amount: Math.round(total * 0.15),
        rate: "6%",
        date: invoiceCaliber === "date" ? "2026-05-10" : "2026-05-11",
        status: "已认证抵扣" as const,
      },
      {
        no: "INV-2026-0089",
        payee: "极速投流服务部",
        category: "千川引流投流代运营服务费",
        amount: 0, // dynamic
        rate: "3%",
        date: invoiceCaliber === "date" ? "2026-05-08" : "2026-05-10",
        status: "红字作废" as const,
      }
    ];

    // Dynamic scale the amount for index 3 to equal total budget
    invoices[3].amount = total - invoices[0].amount - invoices[1].amount - invoices[2].amount;

    return {
      vendorAmt,
      logisticsAmt,
      serviceAmt,
      invoices
    };
  }, [type, kpis.invoiced, invoiceCaliber]);

  // 3. Calculations for Paid Amount (已打款金额)
  const paidData = useMemo(() => {
    if (type !== "payment_paid") return null;
    const total = kpis.paid;

    // Composition
    const purchasePaid = Math.round(total * 0.75);
    const flowPaid = Math.round(total * 0.20);
    const otherPaid = total - purchasePaid - flowPaid;

    const baseTxns = [
      {
        no: "TXN-202605809",
        payee: "织锦服饰加工厂",
        channel: "银企直联拨付",
        bankRoute: "招商银行尾款自动归集",
        operator: "自动直达经办",
        date: "2026-05-20",
        amount: Math.round(total * 0.50),
        status: "成功支付" as const,
      },
      {
        no: "TXN-202605810",
        payee: "亮亮童装面料商",
        channel: "银企直联拨付",
        bankRoute: "农业银行银指专款账户",
        operator: "系统秒级出纳",
        date: "2026-05-18",
        amount: Math.round(total * 0.30),
        status: "支付中" as const,
      },
      {
        no: "TXN-202605411",
        payee: "宏大物流园",
        channel: "外部网银人工",
        bankRoute: "浦发银行手工转账",
        operator: "北京财务-小陈",
        date: "2026-05-15",
        amount: Math.round(total * 0.15),
        status: "成功支付" as const,
      },
      {
        no: "TXN-202605922",
        payee: "温岭市依依童装店",
        channel: "外部网银人工",
        bankRoute: "工商银行往来退款",
        operator: "织里备用出纳-徐哥",
        date: "2026-05-14",
        amount: 0, // dynamic
        status: "银行退票" as const,
      }
    ];

    // Align sum precisely
    baseTxns[3].amount = total - baseTxns[0].amount - baseTxns[1].amount - baseTxns[2].amount;

    // Filter by selected channel
    const filteredTxns = baseTxns.filter(txn => {
      if (paymentChannelFilter === "all") return true;
      if (paymentChannelFilter === "direct") return txn.channel === "银企直联拨付";
      if (paymentChannelFilter === "manual") return txn.channel === "外部网银人工";
      return true;
    });

    const filteredTotalAmount = filteredTxns.reduce((acc, i) => acc + i.amount, 0);

    return {
      purchasePaid,
      flowPaid,
      otherPaid,
      transactions: filteredTxns,
      filteredTotal: filteredTotalAmount
    };
  }, [type, kpis.paid, paymentChannelFilter]);

  if (!isOpen || !type) return null;

  return (
    <AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[150]"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%", opacity: 0.95 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-[70%] max-w-[960px] bg-slate-50 text-slate-800 shadow-2xl z-[160] flex flex-col border-l border-slate-200"
      >
        {/* Header zone with customized context indicators */}
        <div className="bg-white border-b border-slate-205 py-4 px-6 flex items-center justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              {type === "invoice_available" && <FileText className="w-5 h-5 text-sky-500" />}
              {type === "invoice_completed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {type === "payment_paid" && <Wallet className="w-5 h-5 text-indigo-500" />}
              <h2 className="text-sm font-black text-slate-900">
                {type === "invoice_available" && "可开票金额（应收供应商/待开回明细表）"}
                {type === "invoice_completed" && "已收进项发票明细（抵扣归集终端）"}
                {type === "payment_paid" && "已打款银行流水（实付清算台账）"}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-[#006591] bg-sky-50 px-2 py-0.5 rounded-sm">
                筛选维纲：{kpis.desc}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                周期范围：{timeRangeLabel}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors duration-150 cursor-pointer"
            title="关闭明细面板"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Canvas Area */}
        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
          {/* Main Visual KPIs Summary Box */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block">当前穿透透视总额</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3px font-serif text-slate-400 font-bold">¥</span>
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                  {type === "invoice_available" && kpis.invoiceable.toLocaleString()}
                  {type === "invoice_completed" && kpis.invoiced.toLocaleString()}
                  {type === "payment_paid" && kpis.paid.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> 数据完全平准
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-normal italic mt-1 font-mono">
                {updatedDateText}
              </p>
            </div>

            {/* Visual breakdown for complete overview */}
            {type === "invoice_available" && invoiceableData && (
              <div className="w-full md:w-auto grid grid-cols-3 gap-2 text-center text-xs min-w-[320px]">
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block">入库总值(应开票)</span>
                  <strong className="text-[11.5px] font-black text-slate-800 font-mono block mt-1">
                    ¥{invoiceableData.inboundTotal?.toLocaleString()}
                  </strong>
                </div>
                <div className="bg-rose-50/30 border border-rose-100 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block">差异及退货扣减</span>
                  <strong className="text-[11.5px] font-black text-rose-600 font-mono block mt-1">
                    ¥{invoiceableData.differenceTotal?.toLocaleString()}
                  </strong>
                </div>
                <div className="bg-[#006591]/5 border border-[#006591]/10 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block">已收票累计</span>
                  <strong className="text-[11.5px] font-black text-sky-700 font-mono block mt-1">
                    ¥{invoiceableData.invoicedTotal?.toLocaleString()}
                  </strong>
                </div>
              </div>
            )}

            {type === "invoice_completed" && invoicedData && (
              <div className="w-full md:w-auto bg-slate-50 border border-slate-150 rounded-xl p-3 min-w-[325px] space-y-2">
                <span className="text-[9px] font-bold text-slate-400 block">已收进项税目构成占比：</span>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-sky-500 h-full" style={{ width: "85%" }} title="主要货品发票: 85%" />
                  <div className="bg-indigo-400 h-full" style={{ width: "10%" }} title="运费服务票: 10%" />
                  <div className="bg-amber-400 h-full" style={{ width: "5%" }} title="代运营及流: 5%" />
                </div>
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-sky-600">● 货款发票 ¥{invoicedData.vendorAmt.toLocaleString()}</span>
                  <span className="text-indigo-650">● 物流发票 ¥{invoicedData.logisticsAmt.toLocaleString()}</span>
                  <span className="text-amber-600">● 服务返点 ¥{invoicedData.serviceAmt.toLocaleString()}</span>
                </div>
              </div>
            )}

            {type === "payment_paid" && paidData && (
              <div className="w-full md:w-auto bg-slate-50 border border-slate-150 rounded-xl p-3 min-w-[325px] space-y-2">
                <span className="text-[9px] font-bold text-slate-400 block">打款分类流算占比：</span>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-indigo-500 h-full" style={{ width: "75%" }} title="供应商货款: 75%" />
                  <div className="bg-sky-400 h-full" style={{ width: "20%" }} title="投流及代运营: 20%" />
                  <div className="bg-emerald-400 h-full" style={{ width: "5%" }} title="往来退货或保证金: 5%" />
                </div>
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-indigo-600">● 生产货款 ¥{paidData.purchasePaid.toLocaleString()}</span>
                  <span className="text-sky-600">● 流量推广 ¥{paidData.flowPaid.toLocaleString()}</span>
                  <span className="text-emerald-600">● 其他支缴 ¥{paidData.otherPaid.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* 1. 可开票金额 formula card & special controls */}
          {type === "invoice_available" && (
            <div className="bg-[#fffbeb] border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-amber-900 leading-normal">
              <div className="flex items-center gap-1.5 font-black text-[12.5px]">
                <Info className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                <span>可开票金额 计算逻辑与风控核心提示</span>
              </div>
              <p>
                <strong>金税核验算法公式：</strong> 
                <code className="bg-amber-100 font-bold px-1.5 py-0.5 rounded text-[11px] font-mono ml-1">
                  可票额 = 聚水潭采购入库总金额 - 财务差异/到仓拒签红字核销 - 进项税登记已收票额
                </code>
              </p>
              <p className="text-[11px] text-amber-800/90 font-medium">
                🚨 <strong>异常提示：</strong> 系统会智能拦截“开票超额”或“退货未核销”的异常，针对 <strong>温岭市依依童装店</strong> 出现的超额进项，财务已自动调停该厂下月的入库排单，并触发红字对冲警报。
              </p>
            </div>
          )}

          {/* 2. 已开票金额 Caliber Filter Selectors & details */}
          {type === "invoice_completed" && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl self-start">
                <button
                  onClick={() => {
                    setInvoiceCaliber("date");
                    showToast("📊 口径已调整：按纳税申报「开票开具日期」进行数据合并。");
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    invoiceCaliber === "date" 
                      ? "bg-white text-[#006591] shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  按开票日期统计
                </button>
                <button
                  onClick={() => {
                    setInvoiceCaliber("period");
                    showToast("📊 口径已调整：按「入库应付款合并归口」折算各发票关联性。");
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    invoiceCaliber === "period" 
                      ? "bg-white text-[#006591] shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  按入库账期归口
                </button>
              </div>

              <div className="text-[10.5px] font-bold text-slate-450 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>税控控直通率（100.0% 审核核验通）</span>
              </div>
            </div>
          )}

          {/* 3. 已打款金额 channel selection buttons */}
          {type === "payment_paid" && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start">
                {[
                  { id: "all", label: "全部付款渠道" },
                  { id: "direct", label: "网银自动直连" },
                  { id: "manual", label: "外部网银人工" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPaymentChannelFilter(opt.id as any);
                      showToast(`已筛选打款流水范围为：${opt.label}`);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      paymentChannelFilter === opt.id 
                        ? "bg-white text-[#006591] shadow-xs" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {paymentChannelFilter !== "all" && paidData && (
                <div className="text-[11px] font-bold text-slate-500 font-mono">
                  所选渠道实付流计：
                  <span className="text-[#006591] text-xs font-black">¥{paidData.filteredTotal.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Details Records Table Frame */}
          <div className="bg-white border border-slate-201 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                {/* 1. Table Headers */}
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10.5px] font-black text-slate-450 tracking-wider font-sans">
                    {type === "invoice_available" && (
                      <>
                        <th className="py-3 px-4">子账单明细号</th>
                        <th className="py-3 px-4">合作供应商</th>
                        <th className="py-3 px-4 text-right">采购入库货值</th>
                        <th className="py-3 px-4 text-right">差异退货扣减</th>
                        <th className="py-3 px-4 text-right">已开票金额</th>
                        <th className="py-3 px-4 text-right">可安排票余额</th>
                        <th className="py-3 px-4 text-center">系统审计状态</th>
                      </>
                    )}

                    {type === "invoice_completed" && (
                      <>
                        <th className="py-3 px-4">国家普通/专用发票号</th>
                        <th className="py-3 px-4">开票收款单位</th>
                        <th className="py-3 px-4">发票税目类目</th>
                        <th className="py-3 px-4 text-right">价税合计金额</th>
                        <th className="py-3 px-4 text-center">适用发票税率</th>
                        <th className="py-3 px-4 text-center">开具登记日期</th>
                        <th className="py-3 px-4 text-center">国税状态</th>
                      </>
                    )}

                    {type === "payment_paid" && (
                      <>
                        <th className="py-3 px-4">银行资金流水号 ID</th>
                        <th className="py-3 px-4">收款合作机构</th>
                        <th className="py-3 px-4">付款账号 / 支路</th>
                        <th className="py-3 px-4 text-center">网银经办人</th>
                        <th className="py-3 px-4 text-center">划线划拨款期</th>
                        <th className="py-3 px-4 text-right">流水实拨金额</th>
                        <th className="py-3 px-4 text-center">银企交割状态</th>
                      </>
                    )}
                  </tr>
                </thead>

                {/* 2. Table Rows */}
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {/* 可开票 Rows */}
                  {type === "invoice_available" && invoiceableData && invoiceableData.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[10.5px] font-medium">{item.id}</td>
                      <td className="py-3.5 px-4 text-slate-800">{item.supplier}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800">¥{item.inbound.toLocaleString()}</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-black ${item.difference > 0 ? "text-rose-500" : "text-slate-400"}`}>
                        {item.difference > 0 ? `-¥${item.difference.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">¥{item.invoiced.toLocaleString()}</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-black text-[12.5px] ${item.available < 0 ? "text-rose-600 bg-rose-50" : "text-[#006591]"}`}>
                        ¥{item.available.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.status === "待开票" && (
                          <span className="text-[9.5px] font-black bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.7 rounded-full">
                            待收票/待开
                          </span>
                        )}
                        {item.status === "待核对" && (
                          <span className="text-[9.5px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.7 rounded-full">
                            有差异/核校
                          </span>
                        )}
                        {item.status === "异常已排解" && (
                          <span className="text-[9.5px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.7 rounded-full">
                            核销通过
                          </span>
                        )}
                        {item.status === "超额开票" && (
                          <span className="text-[9.5px] font-black bg-rose-100 text-rose-750 border border-rose-200 px-2 py-0.7 rounded-full animate-pulse">
                            超额作警
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* 已开票 Rows */}
                  {type === "invoice_completed" && invoicedData && invoicedData.invoices.map(invoice => (
                    <tr key={invoice.no} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[10.5px]">{invoice.no}</td>
                      <td className="py-3.5 px-4 text-slate-800">{invoice.payee}</td>
                      <td className="py-3.5 px-4 text-slate-500">{invoice.category}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800 text-[12px]">
                        ¥{invoice.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{invoice.rate}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-[10.5px]">{invoice.date}</td>
                      <td className="py-3.5 px-4 text-center">
                        {invoice.status === "已认证抵扣" && (
                          <span className="text-[9.5px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.7 rounded-full">
                            已入账申报
                          </span>
                        )}
                        {invoice.status === "待认证" && (
                          <span className="text-[9.5px] font-black bg-amber-55 text-amber-600 border border-amber-100 px-2 py-0.7 rounded-full">
                            待月度审核
                          </span>
                        )}
                        {invoice.status === "红字作废" && (
                          <span className="text-[9.5px] font-black bg-red-100 text-red-700 border border-red-200 px-2 py-0.7 rounded-full">
                            已废红折
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* 已打款 Rows */}
                  {type === "payment_paid" && paidData && paidData.transactions.map(txn => (
                    <tr key={txn.no} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[10.5px]">{txn.no}</td>
                      <td className="py-3.5 px-4 text-slate-800">{txn.payee}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-sans">{txn.bankRoute}</td>
                      <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">{txn.operator}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[10.5px]">{txn.date}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800 text-[12px]">
                        ¥{txn.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {txn.status === "成功支付" && (
                          <span className="text-[9.5px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.7 rounded-full">
                            对账已平准
                          </span>
                        )}
                        {txn.status === "支付中" && (
                          <span className="text-[9.5px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.7 rounded-full animate-pulse">
                            在途核销中
                          </span>
                        )}
                        {txn.status === "银行退票" && (
                          <span className="text-[9.5px] font-black bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.7 rounded-full">
                            退回警报
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Empty state fallback */}
                  {((type === "payment_paid" && paidData && paidData.transactions.length === 0) ||
                    (type === "invoice_available" && invoiceableData && invoiceableData.items.length === 0) ||
                    (type === "invoice_completed" && invoicedData && invoicedData.invoices.length === 0)) && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        当前检索范畴下暂未发掘对应的流付凭证记录。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions Panel */}
        <div className="bg-white border-t border-slate-205 py-4 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (type === "invoice_available") {
                  showToast("📁 已成功聚合导发该期「可安排开票对账单明细.csv」文件到您的后台下载序列中。");
                } else if (type === "invoice_completed") {
                  showToast("📁 已成功聚合导发该期「已开进项发票明细清单.xls」文件到您的后台下载序列中。");
                } else {
                  showToast("📁 已成功聚合导发该期「实拨付款银行对应流水.xls」文件到您的后台下载序列中。");
                }
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              导出财务明细
            </button>

            {type === "invoice_available" && (
              <button
                onClick={() => {
                  showToast("📈 正在跳转分析本期合作供应商大货历史供票率分析面板...");
                }}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                查看历史往来
              </button>
            )}

            {type === "invoice_completed" && (
              <button
                onClick={() => {
                  showToast("🔗 已与全国增值税发票查询平台直连，启动一键核验抵扣排产，进度已推送。");
                }}
                className="px-4 py-2 border border-slate-200 bg-[#001529] text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                进项税一键网上申抵
              </button>
            )}

            {type === "payment_paid" && (
              <button
                onClick={() => {
                  showToast("🏦 正在整合对应批次招行/浦发等直连打款银行盖章电子回单文件... 已提交打包任务。");
                }}
                className="px-4 py-2 border border-[#006591] bg-sky-50 text-sky-700 rounded-xl text-xs font-black hover:bg-sky-100 transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                下载银行电子回单
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 border border-slate-210 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 font-sans"
          >
            关闭关闭
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
