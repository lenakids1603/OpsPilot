/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  DollarSign, FileSpreadsheet, CheckCircle, AlertTriangle, Scale, Plus, 
  Search, Filter, Landmark, Sparkles, RefreshCw, FileText, ChevronRight, X
} from "lucide-react";
import { AnimatePresence } from "motion/react";

interface BillReconciliation {
  id: string;
  factoryName: string;
  poQty: number;
  inboundQty: number;
  defectQty: number; // Quality issues
  claimAmount: number; // Defect refund penalty
  poPrice: number;
  netPayable: number;
  billingStatus: "待核对" | "对账差异中" | "已核对确认" | "部分付款结清";
}

interface PaymentRecord {
  id: string;
  factoryName: string;
  payDate: string;
  payAmount: number;
  payingAccount: string;
  operator: string;
  relatedBillId: string;
  status: "回执完备" | "处理中" | "待审计审核";
}

interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  factoryName: string;
  invoiceAmount: number;
  taxRate: string; // e.g. "13%" or "3%"
  issueDate: string;
  relatedBillId: string;
  status: "已抵扣验证" | "待财务核销" | "偏离打回";
}

interface SupplierBillAuditPageProps {
  defaultTab?: "audit" | "payments" | "invoices";
}

export default function SupplierBillAuditPage({ defaultTab = "audit" }: SupplierBillAuditPageProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "payments" | "invoices">(defaultTab);
  const [search, setSearch] = useState("");

  const [auditList, setAuditList] = useState<BillReconciliation[]>([
    { id: "REC-202605-01", factoryName: "海安莱那织造有限公司", poQty: 2500, inboundQty: 2480, defectQty: 20, claimAmount: 2580, poPrice: 32, netPayable: 76780, billingStatus: "已核对确认" },
    { id: "REC-202605-02", factoryName: "织里丰盛婴童服饰厂", poQty: 1200, inboundQty: 1150, defectQty: 50, claimAmount: 5800, poPrice: 58, netPayable: 60900, billingStatus: "对账差异中" },
    { id: "REC-202605-03", factoryName: "常熟汇豪针织加工商行", poQty: 3000, inboundQty: 3000, defectQty: 10, claimAmount: 800, poPrice: 15, netPayable: 44200, billingStatus: "部分付款结清" },
    { id: "REC-202605-04", factoryName: "海宁市贝贝童装大卖部", poQty: 800, inboundQty: 820, defectQty: 0, claimAmount: 0, poPrice: 42, netPayable: 34440, billingStatus: "待核对" },
    { id: "REC-202605-05", factoryName: "温岭市依依童装制品厂", poQty: 1500, inboundQty: 1460, defectQty: 40, claimAmount: 4800, poPrice: 41, netPayable: 55060, billingStatus: "待核对" }
  ]);

  const [payments, setPayments] = useState<PaymentRecord[]>([
    { id: "PAY-99201", factoryName: "海安莱那织造有限公司", payDate: "2026-05-18", payAmount: 76780, payingAccount: "建设银行 (乐娜对公)", operator: "张财务", relatedBillId: "REC-202605-01", status: "回执完备" },
    { id: "PAY-99202", factoryName: "常熟汇豪针织加工商行", payDate: "2026-05-20", payAmount: 20000, payingAccount: "招商银行 (公司自持)", operator: "财务助理", relatedBillId: "REC-202605-03", status: "回执完备" },
    { id: "PAY-99203", factoryName: "海宁市贝贝童装大卖部", payDate: "2026-05-22", payAmount: 34440, payingAccount: "泰隆网盾卡 (余英)", operator: "张财务", relatedBillId: "REC-202605-04", status: "待审计审核" }
  ]);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    { id: "INV-80129", invoiceNo: "No.8190392014", factoryName: "海安莱那织造有限公司", invoiceAmount: 76780, taxRate: "13%", issueDate: "2026-05-19", relatedBillId: "REC-202605-01", status: "已抵扣验证" },
    { id: "INV-80130", invoiceNo: "No.5710294102", factoryName: "常熟汇豪针织加工商行", invoiceAmount: 44200, taxRate: "3% (小规模应税)", issueDate: "2026-05-21", relatedBillId: "REC-202605-03", status: "已抵扣验证" },
    { id: "INV-80131", invoiceNo: "No.4410258102", factoryName: "温岭市依依童装制品厂", invoiceAmount: 55060, taxRate: "13%", issueDate: "2026-05-23", relatedBillId: "REC-202605-05", status: "待财务核销" }
  ]);

  // Drawer toggles
  const [isPayFormOpen, setIsPayFormOpen] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);

  // Form states - Payments
  const [payFactory, setPayFactory] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [payAccount, setPayAccount] = useState("建设银行 (乐娜对公)");
  
  // Form states - Invoices
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [invoiceFactory, setInvoiceFactory] = useState("");
  const [invoiceRate, setInvoiceRate] = useState("13%");

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleAddNewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFactory || payAmount <= 0) return;

    const newPay: PaymentRecord = {
      id: `PAY-${Math.floor(Math.random() * 90000 + 10000)}`,
      factoryName: payFactory,
      payDate: new Date().toISOString().split("T")[0],
      payAmount: Number(payAmount),
      payingAccount: payAccount,
      operator: "当值出纳财务",
      relatedBillId: "REC-202605-手工挂接",
      status: "待审计审核"
    };

    setPayments(prev => [newPay, ...prev]);
    setIsPayFormOpen(false);
    alert("🟢 付款业务成功登记，请催促代工厂法务部门核实账单，随后将上传电子回执 PDF 存盘。");
  };

  const handleAddNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo || !invoiceFactory) return;

    const newInv: InvoiceRecord = {
      id: `INV-${Math.floor(Math.random() * 9000 + 80000)}`,
      invoiceNo: invoiceNo,
      factoryName: invoiceFactory,
      invoiceAmount: Number(invoiceAmount),
      taxRate: invoiceRate,
      issueDate: new Date().toISOString().split("T")[0],
      relatedBillId: "REC-202605-账单抵扣",
      status: "待财务核销"
    };

    setInvoices(prev => [newInv, ...prev]);
    setIsInvoiceFormOpen(false);
    alert("🟢 增值税发票登记成功！财务主管已录入税控中台校验真伪并核实进项抵扣金。");
  };

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Page Title with sub-menu summary cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-950 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#006591]" />
            代工厂账套结算与税控中台 (Phase 1)
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            连接聚水潭到货验质流，扣除尺码偏离与退货罚损，最终核实净应付差金，提供批量核销功能。
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "payments" && (
            <button
              onClick={() => {
                setPayFactory("");
                setPayAmount(0);
                setIsPayFormOpen(true);
              }}
              className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>登记付款挂账单</span>
            </button>
          )}

          {activeTab === "invoices" && (
            <button
              onClick={() => {
                setInvoiceNo("");
                setInvoiceFactory("");
                setInvoiceAmount(0);
                setIsInvoiceFormOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>登记到票抵扣</span>
            </button>
          )}

          <button 
            onClick={() => alert("功能开发：账目已通过。正在准备压缩电子账套 PDF 的发运明细...")}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-655 text-xs font-bold rounded-lg cursor-pointer"
          >
            导出 Excel 审计
          </button>
        </div>
      </div>

      {/* Navigation Sub-menu Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: "audit", label: "供应商账单核对", subtitle: "数量核对与退款抵扣" },
          { key: "payments", label: "付款登记流水", subtitle: "银行对账与过账" },
          { key: "invoices", label: "开票登记验证", subtitle: "进项税合规与核销" }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key as any)}
            className={`px-5 py-3 text-xs font-black border-b-2 text-left space-y-0.5 transition-all cursor-pointer ${
              activeTab === item.key 
                ? "border-[#006591] text-[#006591]" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="font-bold text-[11px] block">{item.label}</div>
            <div className="text-[9.5px] font-normal text-slate-400">{item.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Global Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="全文检索关联代工厂商、采购单号、账期状态、发票代码..."
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006591]"
          />
        </div>
      </div>

      {/* TAB 1: 供应商账单核对 */}
      {activeTab === "audit" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
              <tr>
                <th className="p-4">对账单流水号</th>
                <th className="p-4">指定代工厂字号</th>
                <th className="p-4">PO 指令件数</th>
                <th className="p-4">实收到货数</th>
                <th className="p-4">疵次品扣款</th>
                <th className="p-4">协议制造单价</th>
                <th className="p-4">扣罚后净应付应退金额</th>
                <th className="p-4">校验对比偏离</th>
                <th className="p-4 text-center">当前商务关节点</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
              {auditList
                .filter(a => a.factoryName.toLowerCase().includes(search.toLowerCase()))
                .map(a => {
                  const arrivalDiff = a.poQty - a.inboundQty;
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/20">
                      <td className="p-4 font-mono font-bold text-[#002045]">{a.id}</td>
                      <td className="p-4 font-black text-slate-800">{a.factoryName}</td>
                      <td className="p-4 font-mono font-bold">{a.poQty.toLocaleString()} 件</td>
                      <td className="p-4 font-mono font-bold text-slate-600">{a.inboundQty.toLocaleString()} 件</td>
                      <td className="p-4 text-rose-500 font-mono font-black">
                        {a.claimAmount > 0 ? `-¥${a.claimAmount.toLocaleString()}` : "¥0"}
                        {a.defectQty > 0 && <span className="text-[9.5px] text-rose-400 font-normal block">({a.defectQty}件剔退)</span>}
                      </td>
                      <td className="p-4 font-mono">¥{a.poPrice}/件</td>
                      <td className="p-4 font-mono font-black text-slate-900">¥{a.netPayable.toLocaleString()}</td>
                      <td className="p-4">
                        {arrivalDiff > 0 ? (
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                            少到 {arrivalDiff} 件 (偏负)
                          </span>
                        ) : arrivalDiff < 0 ? (
                          <span className="text-[10px] text-[#0ea5e9] font-bold bg-sky-50 px-1.5 py-0.5 rounded">
                            超到 {Math.abs(arrivalDiff)} 件 (溢)
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            无偏离
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                          a.billingStatus === "已核对确认" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          a.billingStatus === "部分付款结清" ? "bg-sky-50 text-sky-600 border-sky-100" :
                          a.billingStatus === "待核对" ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-red-50 text-red-600 border-red-150 animate-pulse"
                        }`}>
                          {a.billingStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right select-none">
                        <button 
                          onClick={() => alert(`【财务确认账目】已核准 ${a.factoryName} 的对应款底，该笔账单应付结算 ¥${a.netPayable} 进入出纳池。`)}
                          className="text-[#006591] hover:text-[#004c6e] text-[10.5px] cursor-pointer"
                        >
                          确认对账金
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: 付款登记 */}
      {activeTab === "payments" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
              <tr>
                <th className="p-4">付款流水 ID</th>
                <th className="p-4">目标代工厂商</th>
                <th className="p-4">出纳过账日</th>
                <th className="p-4">款项金额</th>
                <th className="p-4">支付银行账户</th>
                <th className="p-4">操作会计/出纳</th>
                <th className="p-4">所对账对账单号</th>
                <th className="p-4 text-center">审批状态</th>
                <th className="p-4 text-right">审计回单</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
              {payments
                .filter(p => p.factoryName.toLowerCase().includes(search.toLowerCase()))
                .map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/20">
                    <td className="p-4 font-mono font-bold text-[#002045]">{p.id}</td>
                    <td className="p-4 font-black text-slate-800">{p.factoryName}</td>
                    <td className="p-4 font-mono text-slate-500">{p.payDate}</td>
                    <td className="p-4 font-mono font-black text-[#006591]">¥{p.payAmount.toLocaleString()}</td>
                    <td className="p-4 font-bold text-slate-600">{p.payingAccount}</td>
                    <td className="p-4 font-medium text-slate-500">{p.operator}</td>
                    <td className="p-4 font-mono text-slate-450">{p.relatedBillId}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        p.status === "回执完备" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right select-none">
                      <button 
                        onClick={() => alert(`查看付款凭证：PAY_WATER_PDF_SLIP#${p.id}`)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        PDF 原件下载
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: 开票登记 */}
      {activeTab === "invoices" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-105 select-none">
              <tr>
                <th className="p-4">系统入账 ID</th>
                <th className="p-4">开票发票代码</th>
                <th className="p-4">关联开票工厂</th>
                <th className="p-4">发票税后金额</th>
                <th className="p-4 text-center">适用税率</th>
                <th className="p-4">发票开具日期</th>
                <th className="p-4">所核销应付单号</th>
                <th className="p-4 text-center">税控抵扣状态</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
              {invoices
                .filter(i => i.factoryName.toLowerCase().includes(search.toLowerCase()))
                .map(i => (
                  <tr key={i.id} className="hover:bg-slate-50/20">
                    <td className="p-4 font-mono font-bold text-[#002045]">{i.id}</td>
                    <td className="p-4 font-mono font-bold text-slate-800">{i.invoiceNo}</td>
                    <td className="p-4 font-black text-slate-805">{i.factoryName}</td>
                    <td className="p-4 font-mono font-black text-slate-900">¥{i.invoiceAmount.toLocaleString()}</td>
                    <td className="p-4 text-center font-mono font-bold text-slate-500">{i.taxRate}</td>
                    <td className="p-4 font-mono text-slate-500">{i.issueDate}</td>
                    <td className="p-4 font-mono text-slate-450">{i.relatedBillId}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                        i.status === "已抵扣验证" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-550 border border-amber-100"
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="p-4 text-right select-none">
                      <button 
                        onClick={() => alert(`税控联网核查：发票代号 [${i.invoiceNo}] 真伪及所属税目抵扣合规，核销成功。`)}
                        className="text-[10px] text-[#006591] hover:text-[#005175] cursor-pointer"
                      >
                        联网验证
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer Payments Form */}
      <AnimatePresence>
        {isPayFormOpen && (
          <>
            <div onClick={() => setIsPayFormOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[80]" />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-205">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black text-slate-800">💸 登记工厂付款流水单</span>
                <button onClick={() => setIsPayFormOpen(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-450"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddNewPayment} className="flex-grow p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 mb-1.5">收款对象 (代工厂商) *</label>
                  <input type="text" required value={payFactory} onChange={e => setPayFactory(e.target.value)} placeholder="例如：织里丰盛婴童服饰厂" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 mb-1.5">付款金额 (元) *</label>
                  <input type="number" required value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-black font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 mb-1.5">付款对公账户卡支 *</label>
                  <select value={payAccount} onChange={e => setPayAccount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-705">
                    <option value="建设银行 (乐娜对公)">建设银行 (乐娜对合伙公卡)</option>
                    <option value="泰隆网盾卡 (余英)">泰隆商业个人网盾 (出征用)</option>
                    <option value="网商银行回款卡">支付宝/网商直扣资金</option>
                  </select>
                </div>
                <div className="pt-6 font-semibold flex gap-2">
                  <button type="submit" className="flex-grow py-2.5 bg-[#006591] text-white text-xs font-bold rounded-lg cursor-pointer">登记存盘</button>
                  <button type="button" onClick={() => setIsPayFormOpen(false)} className="py-2.5 px-4 border border-slate-200 text-slate-655 text-xs font-bold rounded-lg">取消</button>
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer Invoices Form */}
      <AnimatePresence>
        {isInvoiceFormOpen && (
          <>
            <div onClick={() => setIsInvoiceFormOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[80]" />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-205">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black text-slate-800">📄 登记增值税进项发票</span>
                <button onClick={() => setIsInvoiceFormOpen(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-450"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddNewInvoice} className="flex-grow p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">发票代码 / 号码 *</label>
                  <input type="text" required value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="No.4402198305" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">开票代工厂商企业名称 *</label>
                  <input type="text" required value={invoiceFactory} onChange={e => setInvoiceFactory(e.target.value)} placeholder="海安莱那织造有限公司" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5">发票税后总金额 *</label>
                    <input type="number" required value={invoiceAmount} onChange={e => setInvoiceAmount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5">发票增值税率 *</label>
                    <select value={invoiceRate} onChange={e => setInvoiceRate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700">
                      <option value="13%">13% - 制造工业专专</option>
                      <option value="3% (小规模应税)">3% - 个体户简易征收</option>
                      <option value="0%">0% - 小微免退抵税</option>
                    </select>
                  </div>
                </div>
                <div className="pt-6 font-semibold flex gap-2">
                  <button type="submit" className="flex-grow py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer animate-pulse">验证并存入</button>
                  <button type="button" onClick={() => setIsInvoiceFormOpen(false)} className="py-2.5 px-4 border border-slate-200 text-slate-655 text-xs font-bold rounded-lg">取消</button>
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
