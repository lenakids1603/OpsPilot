/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Play, CheckCircle2, ChevronRight, ToggleLeft, ToggleRight, Plus, Terminal, RefreshCw, Radio, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Workflow, WorkflowLog } from "../types";

// Initial set of system default rules
const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "新商户首单对账自动对接",
    trigger: "OrderCreated",
    action: "FormatAndStore",
    isActive: true,
    runCount: 148,
    lastRun: "2026-05-22 11:30"
  },
  {
    id: "wf-2",
    name: "库存跌破警戒水位自动钉钉报警",
    trigger: "InventoryAlert",
    action: "DispatchDingTalk",
    prompt: "检测到库存过低，请相关库管尽快补充库存，产品编码由系统自动附带。",
    dispatchTarget: "DingTalk 乐那仓储群",
    isActive: true,
    runCount: 52,
    lastRun: "2026-05-22 09:15"
  },
  {
    id: "wf-3",
    name: "售后高级工单自动微信客服转办",
    trigger: "CustomerMessage",
    action: "GeminiAnalyze",
    prompt: "该客户发起中、高级投诉。检测到不满意情绪，请迅速转派值班运营公关进行快速解答与退款折算。",
    dispatchTarget: "微信 乐那快享客诉值班小组",
    isActive: false,
    runCount: 14,
    lastRun: "2026-05-21 16:40"
  }
];

export default function AutomationHub() {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [logs, setLogs] = useState<WorkflowLog[]>([
    { id: "log-1", workflowId: "wf-1", workflowName: "新商户首单对账自动对接", timestamp: "11:30:15", status: "success", details: "成功匹配北京市、山东省2个物流运单，对账单顺利归档。" },
    { id: "log-2", workflowId: "wf-2", workflowName: "库存跌破警戒水位自动钉钉报警", timestamp: "09:15:22", status: "success", details: "商品 #👒夏日遮阳帽 跌破12顶，已向 乐那仓储群 自动化预警并触发补货单草稿。" }
  ]);

  // Workflow Builder State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [newWfTrigger, setNewWfTrigger] = useState<Workflow["trigger"]>("OrderCreated");
  const [newWfAction, setNewWfAction] = useState<Workflow["action"]>("FormatAndStore");
  const [newWfPrompt, setNewWfPrompt] = useState("");
  const [newWfTarget, setNewWfTarget] = useState("");

  // Simulation State Machine
  const [simulatingWorkflow, setSimulatingWorkflow] = useState<Workflow | null>(null);
  const [simStep, setSimStep] = useState<number>(0); // 0: idle, 1: Trigger, 2: AI Parse, 3: DB Save, 4: Dispatch Done
  const [simConsoleLines, setSimConsoleLines] = useState<string[]>([]);

  const handleToggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const handleAddNewWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    const newWf: Workflow = {
      id: "wf-" + Date.now(),
      name: newWfName,
      trigger: newWfTrigger,
      action: newWfAction,
      prompt: newWfPrompt,
      dispatchTarget: newWfTarget || "系统默认通知渠道",
      isActive: true,
      runCount: 0
    };

    setWorkflows((prev) => [...prev, newWf]);
    setNewWfName("");
    setNewWfPrompt("");
    setNewWfTarget("");
    setShowAddForm(false);
  };

  // Run the sequence step-by-step
  const handleRunSimulation = (wf: Workflow) => {
    if (simulatingWorkflow) return; // Prevent double trigger
    
    setSimulatingWorkflow(wf);
    setSimStep(1);
    setSimConsoleLines([
      `⚡ [${new Date().toLocaleTimeString()}] INTERCEPT: 侦测到节点自动化信号触发...`,
      `⚙️ 事件名称: ${wf.name}`,
      `🔍 触发源: ${wf.trigger}`
    ]);

    // Fast sequential timeouts simulating background server pipelines
    setTimeout(() => {
      setSimStep(2);
      setSimConsoleLines((prev) => [
        ...prev,
        `🤖 [${new Date().toLocaleTimeString()}] Gemini-3.5-Flash 开始介入，对触发实体信息精细化提纯...`,
        `💡 正在加载核心指令: ["${wf.prompt || "标准数据化格式排版并且通知联络人"}"]`
      ]);
    }, 1200);

    setTimeout(() => {
      setSimStep(3);
      setSimConsoleLines((prev) => [
        ...prev,
        `📂 [${new Date().toLocaleTimeString()}] 数据结构整合完成。成功生成只读审计对账块 & 会计数据落表。`,
        `💾 事务已安全提交到 mock-database。索引序列号: TX_LOG_${Date.now().toString().slice(-6)}`
      ]);
    }, 2400);

    setTimeout(() => {
      setSimStep(4);
      setSimConsoleLines((prev) => [
        ...prev,
        `🚀 [${new Date().toLocaleTimeString()}] 完成最终分包。路由指令指向: [${wf.dispatchTarget || wf.action}]`,
        `🎉 叮咚！自动化流运转成功。相关责任部门已接收到实时状态！`
      ]);

      // Complete count-up update locally
      setWorkflows((prev) =>
        prev.map((w) => (w.id === wf.id ? { ...w, runCount: w.runCount + 1, lastRun: "刚刚" } : w))
      );

      // Add actual simulation log
      const newLog: WorkflowLog = {
        id: "log-" + Date.now(),
        workflowId: wf.id,
        workflowName: wf.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: "success",
        details: `手动模拟运行成功：执行 ${wf.action}，更新数据对账，派发目标为：${wf.dispatchTarget || "日志中枢"}`
      };
      setLogs((prev) => [newLog, ...prev]);
    }, 3600);

    // Fade simulator screen
    setTimeout(() => {
      setSimStep(0);
      setSimulatingWorkflow(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner introducing Simulation controls */}
      <div className="p-4 bg-gradient-to-r from-[#002045] to-[#006591] text-white rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
            <Radio className="w-5 h-5 text-sky-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">自动化引擎中枢 (OpsPilot Workflow Automation)</h4>
            <p className="text-[11px] text-sky-200">
              定制触发状态卡，点击「执行测试」可真实观察一整套企业中规、落表，以及派发消息的级联动画。
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>创建定制化工作流</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workflows Config List (Left - 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-5 border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <h5 className="text-xs font-bold text-[#002045] pb-2 border-b border-slate-100 mb-4">
                  ➕ 建立新业务自动化规则
                </h5>
                <form onSubmit={handleAddNewWorkflow} className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-500 font-semibold">自动化流名称</label>
                      <input
                        type="text"
                        required
                        value={newWfName}
                        onChange={(e) => setNewWfName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                        placeholder="例：客服高级催付自动跟进"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-500 font-semibold">触发节点源 (Trigger)</label>
                      <select
                        value={newWfTrigger}
                        onChange={(e) => setNewWfTrigger(e.target.value as Workflow["trigger"])}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                      >
                        <option value="OrderCreated">新运单/订单建立时触发 (OrderCreated)</option>
                        <option value="InventoryAlert">商品库存跌破下限预警 (InventoryAlert)</option>
                        <option value="DailyReport">每天例行定时汇报 (DailyReport)</option>
                        <option value="CustomerMessage">用户发生高频率留言或客诉 (CustomerMessage)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-500 font-semibold">中间处理行为 (Action)</label>
                      <select
                        value={newWfAction}
                        onChange={(e) => setNewWfAction(e.target.value as Workflow["action"])}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                      >
                        <option value="FormatAndStore">本地解析排版 ➔ 对账录入库 (LocalFormat)</option>
                        <option value="GeminiAnalyze">激活 Gemini 提取 ➔ 对账录入库 (GeminiAnalyze)</option>
                        <option value="DispatchDingTalk">解析 ➔ 自动发钉钉工作通知 (DingTalk)</option>
                        <option value="DispatchWeChat">解析 ➔ 自动发企业微信即时提醒 (WeChat)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-500 font-semibold">通知渠道/接收部门 (Target)</label>
                      <input
                        type="text"
                        value={newWfTarget}
                        onChange={(e) => setNewWfTarget(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                        placeholder="例：企业微信值班运营小组群"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-semibold">Gemini 解析提示词（可选）</label>
                    <textarea
                      value={newWfPrompt}
                      onChange={(e) => setNewWfPrompt(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white resize-none"
                      placeholder="例：将订单细节精简并翻译成英文后，作为微信提示推送给外籍主管..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-[#43474e] hover:bg-slate-150 rounded"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4.5 py-1.5 bg-[#006591] text-white font-bold rounded-lg shadow-xs hover:bg-[#004c6e] transition-all"
                    >
                      提交保存规则
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of rule triggers */}
          <div className="space-y-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className={`bg-white border rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  simulatingWorkflow?.id === wf.id 
                    ? "border-sky-500 ring-1 ring-sky-300 shadow-sm" 
                    : "border-slate-200 shadow-xs"
                }`}
              >
                {/* Visual labels */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h6 className="text-[13px] font-bold text-[#002045]">
                      {wf.name}
                    </h6>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#eff4ff] text-[#006591] border border-[#dce9ff]">
                      {wf.trigger}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                      {wf.action}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-semibold font-mono">
                    <span>运行次数: <b className="text-slate-600">{wf.runCount}次</b></span>
                    <span>•</span>
                    <span>最近通过: <b className="text-slate-600">{wf.lastRun || "无运行记录"}</b></span>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex items-center space-x-2.5 justify-end">
                  <button
                    onClick={() => handleToggleWorkflow(wf.id)}
                    className="p-1 focus:outline-none"
                    title={wf.isActive ? "点按停用规则" : "点按启动规则"}
                  >
                    {wf.isActive ? (
                      <ToggleRight className="w-8 h-8 text-[#0ea5e9]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRunSimulation(wf)}
                    disabled={!wf.isActive || !!simulatingWorkflow}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-slate-50 text-[#002045] hover:bg-slate-100 disabled:opacity-40 select-none rounded-lg border border-slate-200 group transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-[#0ea5e9] fill-[#0ea5e9] group-hover:scale-115 transition-transform" />
                    <span>执行测试</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Simulation Stepper & Dark Terminal logs (Right - 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Workflow Stepper Canvas */}
          <div className="bg-white p-5 border border-slate-200 rounded-xl">
            <h5 className="text-xs font-bold text-[#002045] pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>🖥️ 流程执行步骤仿真器</span>
              {simStep > 0 && (
                <span className="text-[10px] text-sky-500 flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>模拟中</span>
                </span>
              )}
            </h5>

            {/* Simulated steps timeline UI */}
            <div className="mt-5 space-y-4 text-xs font-semibold relative">
              <div className="absolute left-6.5 top-2 bottom-2 w-0.5 bg-slate-100 -z-0"></div>

              {/* Step 1: Trigger Detected */}
              <div className="flex items-start space-x-4.5 relative z-10">
                <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-all ${
                  simStep >= 1 ? "bg-sky-500 border-sky-600 text-white" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="pt-1">
                  <span className={`block font-bold ${simStep >= 1 ? "text-[#002045]" : "text-slate-400"}`}>
                    ① 触发节点侦测
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    监听到 API 或 Webhook 自助下单信号
                  </span>
                </div>
              </div>

              {/* Step 2: Gemini Parsing */}
              <div className="flex items-start space-x-4.5 relative z-10">
                <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-all ${
                  simStep >= 2 ? "bg-indigo-500 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="pt-1">
                  <span className={`block font-bold ${simStep >= 2 ? "text-[#002045]" : "text-slate-400"}`}>
                    ② Gemini 决策分拣
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    利用 3.5-Flash 进行格式提纯及实体清洗
                  </span>
                </div>
              </div>

              {/* Step 3: DB Saving */}
              <div className="flex items-start space-x-4.5 relative z-10">
                <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-all ${
                  simStep >= 3 ? "bg-amber-500 border-amber-600 text-white" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="pt-1">
                  <span className={`block font-bold ${simStep >= 3 ? "text-[#002045]" : "text-slate-400"}`}>
                    ③ 财务/审计数据落库
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    事务区块落表，生成只读日志块防篡改
                  </span>
                </div>
              </div>

              {/* Step 4: Dispatch Notification */}
              <div className="flex items-start space-x-4.5 relative z-10">
                <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-all ${
                  simStep >= 4 ? "bg-emerald-500 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="pt-1">
                  <span className={`block font-bold ${simStep >= 4 ? "text-[#002045]" : "text-slate-400"}`}>
                    ④ 精准推送路由分发
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    向微信或钉钉群下发标准排版业务对账通知
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Console / Simulated Live Logging Output */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-sm text-left">
            <div className="flex items-center space-x-2 text-teal-400 border-b border-white/10 pb-2 mb-3">
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
                AUTOMATION SYSTEM CONSOLE OUTPUT
              </span>
            </div>

            <div className="min-h-[140px] max-h-[180px] overflow-y-auto space-y-1.5 font-mono text-[10px] text-emerald-400/90 leading-normal scrollbar-thin">
              {simStep === 0 ? (
                <div className="text-slate-500 py-8 text-center italic">
                  [系统日志闲置。请在左侧点击任一工作流的「执行测试」按钮以查看控制台实时仿真输出...]
                </div>
              ) : (
                simConsoleLines.map((line, ix) => (
                  <div key={ix} className="whitespace-pre-wrap">{line}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs table summary */}
      <div className="bg-white p-5 border border-slate-200 rounded-xl">
        <h5 className="text-xs font-bold text-[#002045] pb-3 border-b border-slate-100 mb-4">
          📜 全局自动化测试/审计历史事件流
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 font-bold bg-slate-50 p-2">
                <th className="p-2 py-3 rounded-l-lg">发生时间</th>
                <th className="p-2 py-3">执行流水线名称</th>
                <th className="p-2 py-3">运转状态</th>
                <th className="p-2 py-3 rounded-r-lg">审计账目详情</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700 divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2 py-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                  <td className="p-2 py-3 text-[#002045]">{log.workflowName}</td>
                  <td className="p-2 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      success
                    </span>
                  </td>
                  <td className="p-2 py-3 text-[#43474e] max-w-sm line-clamp-1 truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Simple Helper component to avoid unused import validation
function FileCheck2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m3 15 2 2 4-4" />
    </svg>
  );
}
