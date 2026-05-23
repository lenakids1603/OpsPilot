/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Play, Search, Plus, Filter, FileText, Check, AlertTriangle, ArrowRight,
  TrendingUp, HelpCircle, RefreshCw, Layers, Shield, Sparkles, Send, Trash2, Edit3, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ==========================================================================
   1. TODAY_DATA_VIEW (工作台 -> 今日数据)
   ========================================================================== */
export function TodayDataView() {
  const [syncing, setSyncing] = useState(false);
  const [orders, setOrders] = useState([
    { id: "ORD-20260522-811c", store: "天猫旗舰店", product: "经典款婴幼儿精梳棉连体衣", qty: 2, amount: 258, status: "已自动回单", time: "16:20" },
    { id: "ORD-20260522-811b", store: "抖音小店专营", product: "防踢抱被有机棉四季款", qty: 4, amount: 476, status: "已自动回单", time: "16:15" },
    { id: "ORD-20260522-811a", store: "微信视频号小店", product: "儿童纯棉空气防凉睡袋", qty: 1, amount: 129, status: "已自动回单", time: "15:48" },
    { id: "ORD-20260522-8119", store: "天猫旗舰店", product: "轻柔弹力泡泡裤2件装", qty: 3, amount: 177, status: "已自动回单", time: "15:10" }
  ]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const newOrder = {
        id: `ORD-20260522-811${String.fromCharCode(97 + Math.floor(Math.random() * 6))}`,
        store: Math.random() > 0.5 ? "天猫旗舰店" : "抖音小店专营",
        product: "盛夏轻薄排汗五分袖两件套",
        qty: Math.floor(Math.random() * 3) + 1,
        amount: Math.random() > 0.5 ? 198 : 288,
        status: "已自动回单",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setOrders(prev => [newOrder, ...prev]);
    }, 1200);
  };

  return (
    <div id="today-data-container" className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-800">今日实时经营面板</h3>
          <p className="text-xs text-slate-400">对接 API 轮询正常开展中，自动从各多电商云端同步最新实单数值</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-2 px-3.5 py-1.8 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "秒级流式读取中..." : "手动数据秒级同步"}</span>
        </button>
      </div>

      {/* Primary KPI Mini widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "今日总支付流水", value: "¥164,820", sub: "昨日同期 +11.4%", color: "text-[#0ea5e9]" },
          { label: "今日累计订单量", value: "1,248 笔", sub: "昨日同期 +18.2%", color: "text-[#10b981]" },
          { label: "今日退款事件", value: "8 笔 (0.64%)", sub: "近一周稳定范围", color: "text-[#f59e0b]" },
          { label: "发货排期平均用时", value: "2.4 小时", sub: "比预警限额省 21.6 小时", color: "text-indigo-500" }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{kpi.label}</span>
            <span className={`text-xl font-black font-mono block mt-1 ${kpi.color}`}>{kpi.value}</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Orders Data list */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800">最新抓取多店铺订单流 (当前：{orders.length} 笔)</span>
          <span className="text-[10px] font-mono text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md font-bold font-sans">● ERP 实时监听套接字已联网</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase select-none border-b border-slate-100">
              <tr>
                <th className="p-4">订单单号</th>
                <th className="p-4">所属渠道</th>
                <th className="p-4">下单货品</th>
                <th className="p-4">购买数量</th>
                <th className="p-4 text-right">金额</th>
                <th className="p-4">抓取时间</th>
                <th className="p-4">同步校验状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {orders.map((ord) => (
                  <motion.tr
                    key={ord.id}
                    initial={{ opacity: 0, height: 0, backgroundColor: "#f0f9ff" }}
                    animate={{ opacity: 1, height: "auto", backgroundColor: "#ffffff" }}
                    transition={{ duration: 0.4 }}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="p-4 font-mono font-bold text-[#002045]">{ord.id}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded-md font-bold text-[10px] text-slate-600">{ord.store}</span></td>
                    <td className="p-4 font-medium text-slate-700">{ord.product}</td>
                    <td className="p-4 font-mono font-bold">{ord.qty}</td>
                    <td className="p-4 text-right font-mono font-bold text-sky-600">¥{ord.amount}</td>
                    <td className="p-4 text-slate-400 font-mono">{ord.time}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        <Check className="w-3 h-3" />
                        <span>{ord.status}</span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. EXCEPTION_ALERTS_VIEW (工作台 -> 异常提醒)
   ========================================================================== */
export function ExceptionAlertsView() {
  const [alerts, setAlerts] = useState([
    { id: "ALR-992a", level: "CRITICAL", tag: "毛利风险", text: "天猫店铺由于领券叠加出现 2 笔负毛利出库产品（实付价格低于货品成本价 12%）", state: "未响应", time: "10分钟前" },
    { id: "ALR-882b", level: "WARNING", tag: "物流超时", text: "聚水潭已发货超 28 小时未能在中通快递官网检索到任何揽收跟踪航迹", state: "未响应", time: "25分钟前" },
    { id: "ALR-772c", level: "INFO", tag: "API预警", text: "抖音小店专营店铺由于平台升级，外部服务授权 API Token 将在 3 天后自动过期", state: "未响应", time: "1小时前" },
    { id: "ALR-662d", level: "CRITICAL", tag: "库存枯竭", text: "盛夏薄款棉线童袜（多色组 A1）库存缺额目前已突破 -12 件，需立即停止推流", state: "未响应", time: "3小时前" }
  ]);

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(al => al.id === id ? { ...al, state: "已处理并归档" } : al));
  };

  return (
    <div id="exception-alerts-view" className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800">异动风险异常管理看板</h3>
        <p className="text-xs text-slate-400">OpsPilot 后台根据底层流数据构建的多维度异常发现，点击立即解决按钮可以派工处理。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-rose-800 block">高危严重级异动：{alerts.filter(a => a.level === "CRITICAL" && a.state === "未响应").length} 项</span>
            <p className="text-[11px] text-rose-600 mt-1">需运营主管、采销部或财务部门立即发起会签调整，防范更大资损。</p>
          </div>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-amber-800 block">中度警告异常：{alerts.filter(a => a.level === "WARNING" && a.state === "未响应").length} 项</span>
            <p className="text-[11px] text-amber-600 mt-1">一般涉及快递网络异常或库存偏低，日常当值执勤客服可轻松协调完成。</p>
          </div>
        </div>
        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-sky-800 block">系统运维事件：{alerts.filter(a => a.level === "INFO" && a.state === "未响应").length} 项</span>
            <p className="text-[11px] text-sky-600 mt-1 font-sans">基础服务器，数据库集群，外包接口，各平台Token有效期状态良好。</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((al) => (
          <div 
            key={al.id} 
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              al.state === "已处理并归档" 
                ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60" 
                : al.level === "CRITICAL" 
                  ? "bg-white border-rose-200 hover:border-rose-300"
                  : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] block mt-0.5 ${
                al.state === "已处理并归档"
                  ? "bg-slate-200 text-slate-500"
                  : al.level === "CRITICAL"
                    ? "bg-rose-500 text-white"
                    : al.level === "WARNING"
                      ? "bg-amber-500 text-white"
                      : "bg-sky-500 text-white"
              }`}>
                {al.level}
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-black text-slate-400">{al.id}</span>
                  <span className="text-xs font-bold text-slate-800">{al.tag}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{al.time}</span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1 select-text">{al.text}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              {al.state === "已处理并归档" ? (
                <span className="text-xs font-bold text-emerald-600 inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 rounded-lg">
                  <Check className="w-3.5 h-3.5" />
                  <span>{al.state}</span>
                </span>
              ) : (
                <button
                  onClick={() => handleResolve(al.id)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  立即解决排障
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   3. PERIODICAL_REVIEW_VIEW (工作台 -> 周月小结)
   ========================================================================== */
export function PeriodicalReviewView() {
  const [generating, setGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const handleGenerate = () => {
    setGenerating(true);
    setPreviewContent("");
    let currentText = "";
    const reportText = `### Lenakids 运营部五月份整体核心数据回顾与战术总结

1. **经营走势评估**:
   - 五月份全网累计销售额实现 **¥12,482,900**, 相比上月明显抬头增幅在 **+14.2%**，基本超预期完成既定第二季度核心预算线。
   - 聚水潭接口优化，各仓发单平均降至 **2.4** 小时, 跨系统对账效率提升 **3.5倍**。

2. **退款原因聚类分析**:
   - 尺码偏小退款率上升至整体客诉的 **48.2%**, 推荐在商品详情页显著加入一键测尺对照轮廓助手以优化前置期望。
   - 物流损坏比例下降至 **12%**, 反馈本月中旬增厚珍珠棉泡沫袋的包装举措有效防范了资损。

3. **主力货源和备货安全分析**:
   - 盛夏纯棉空气连体爬服成为本月顶梁柱（成交 1,200 万单 SKU 发货良好）。
   - 有机针织棉短裤即将步入秋款转换，建议采销组提早 12 天执行清尾，释放 4 号仓库容供秋冬保暖睡袋预入库。

4. **自动化与人员降负成果**:
   - 首批上线对接的 5 个自动化审批模块已自动回写订单单据 **41,200** 份, 免去手动核算。
   - 累计释放客服周均人工重复点击 **22** 小时，工效极大提速。`;

    let i = 0;
    const interval = setInterval(() => {
      if (i < reportText.length) {
        currentText += reportText.charAt(i);
        setPreviewContent(currentText);
        i += 2; // speeds up simulation
      } else {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 15);
  };

  return (
    <div id="periodical-review-view" className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">月度/季度智能决策分析简报</h3>
          <p className="text-xs text-slate-400">集成 Gemini 强大的分析总结实力，一键将 ERP 海量多账套、多退退货流凝聚为精细决策依据。</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 bg-[#002045] text-white hover:bg-[#002045]/90 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>{generating ? "大语言模型流式提炼中..." : "一键生成集团五月度分析简报"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border border-slate-200 bg-white p-4.5 rounded-xl space-y-4">
          <span className="text-xs font-bold text-slate-800 block">经营历史小结存档</span>
          <div className="space-y-2">
            {["2026年5月业务分析报表", "2026年4月经营月报", "2026年Q1季度零售战绩回顾", "2025年双11大聚汇发货统计"].map((rpt, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4.5 h-4.5 text-slate-400" />
                  <span className="font-medium text-slate-600 truncate max-w-[120px]">{rpt}</span>
                </div>
                <span className="text-[9px] text-[#0ea5e9] font-extrabold bg-sky-50 px-1.5 py-0.5 rounded-md">已归档</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 border border-slate-200 bg-white p-5 rounded-xl min-h-[300px]">
          <span className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 block">简报生产预览区 (大模型赋能)</span>
          <div className="mt-4 text-xs leading-relaxed text-slate-600 prose select-text whitespace-pre-wrap font-mono min-h-[220px]">
            {previewContent ? (
              previewContent
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-450 h-full text-center">
                <FileText className="w-12 h-12 text-slate-250 mb-3" />
                <p className="text-xs font-bold text-slate-600">目前暂无预览内容</p>
                <p className="text-[11px] text-slate-400 mt-0.5">请在右上方点击按钮，让内置高级诊断引擎开始多端聚类总结...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. SHORTCUT_ENTRIES_VIEW (工作台 -> 快捷入口 / 店铺分析)
   ========================================================================== */
export function ShortcutEntriesView() {
  const [skuName, setSkuName] = useState("");
  const [skuPrice, setSkuPrice] = useState("");
  const [skuCategory, setSkuCategory] = useState("连体衣");
  const [added, setAdded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuName || !skuPrice) return;
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSkuName("");
      setSkuPrice("");
    }, 2000);
  };

  return (
    <div id="shortcut-entries-view" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick SKU Add form */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 font-sans">一键创建新 SKU 主款式资料</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1.5">商品全称 / 企划名称</label>
              <input
                type="text"
                value={skuName}
                onChange={e => setSkuName(e.target.value)}
                placeholder="例如: 盛夏清爽透气网眼儿童爬服 2 件装"
                className="w-full bg-[#f8f9ff] text-xs font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 font-sans font-semibold"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1.5">预计零售价 (元)</label>
                <input
                  type="number"
                  value={skuPrice}
                  onChange={e => setSkuPrice(e.target.value)}
                  placeholder="99"
                  className="w-full bg-[#f8f9ff] text-xs font-bold text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1.5">品类分配</label>
                <select
                  value={skuCategory}
                  onChange={e => setSkuCategory(e.target.value)}
                  className="w-full bg-[#f8f9ff] text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 font-sans font-semibold"
                >
                  <option value="连体衣 font-sans">连体两用衣服</option>
                  <option value="睡袋 font-sans">防风保暖睡袋</option>
                  <option value="鞋袜 font-sans">精编防滑童袜</option>
                  <option value="配饰 font-sans">抱被毛巾用品</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#002045] hover:bg-[#002045]/90 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{added ? "款式创建成功并打通聚水潭!" : "确认建立并投产企划款式"}</span>
            </button>
            {added && (
              <span className="text-[11px] text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg flex items-center justify-center font-bold">
                ✓ 资料已自动推送同步至聚水潭 SKU 待核仓库！
              </span>
            )}
          </form>
        </div>

        {/* Quick Credentials connections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">ERP 外部系统中间层连接器授权</h3>
          <p className="text-xs text-slate-400">Lenakids 核心后台通过自研发中台直连其他 ERP 系统 API 端口，安全独立并无外网窃密隐患。</p>
          <div className="space-y-2.5 pt-2">
            {[
              { name: "聚水潭 ERP 数据双向同步", state: "运行正常 (API QPS: 15/50)", style: "bg-emerald-500" },
              { name: "天猫开放平台 API 授权", state: "运行正常 (剩余令牌 82 天)", style: "bg-emerald-500" },
              { name: "抖音飞鸽在线客服工作流转接", state: "运行正常 (双工TCP套接字链路)", style: "bg-emerald-500" },
              { name: "顺丰速运自动化电子面单同步", state: "运行正常 (自动校验顺丰特快)", style: "bg-emerald-500" }
            ].map((conn, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-150 rounded-xl bg-slate-50/40 text-xs">
                <span className="font-bold text-slate-700">{conn.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${conn.style} animate-pulse`}></span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">{conn.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   5. STORE_ANALYSIS_VIEW (销售数据 -> 店铺分析)
   ========================================================================== */
export function StoreAnalysisView() {
  const stores = [
    { name: "天猫官方旗舰店", type: "阿里零售端", uv: "45,400", cr: "3.84%", refund: "8.5%", revenue: "¥4,289,500" },
    { name: "抖音莱那宝贝小店", type: "兴趣电商", uv: "89,200", cr: "1.92%", refund: "14.2%", revenue: "¥3,124,000" },
    { name: "微信视频号爱心专属", type: "私域社群", uv: "15,100", cr: "5.11%", refund: "4.1%", revenue: "¥1,120,400" },
    { name: "京东极速旗舰专营", type: "自营电商", uv: "12,900", cr: "2.55%", refund: "6.8%", revenue: "¥390,600" }
  ];

  return (
    <div id="store-analysis-view" className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800">各渠道分店日度经营横向比对</h3>
        <p className="text-xs text-slate-400">细化分析各个流量池的转化表现、平均销售毛利率和退款偏好特征</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">店铺名称</th>
                <th className="p-4">电商类型</th>
                <th className="p-4">今日独立访客 (UV)</th>
                <th className="p-4">静默支付转化率 (CR)</th>
                <th className="p-4">综合退款率</th>
                <th className="p-4 text-right">本月销售账面值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map((st, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{st.name}</td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium text-[10px]">{st.type}</span></td>
                  <td className="p-4 font-mono font-bold text-slate-600">{st.uv}</td>
                  <td className="p-4 font-mono font-bold text-emerald-600">{st.cr}</td>
                  <td className="p-4 font-mono font-bold text-amber-600">{st.refund}</td>
                  <td className="p-4 text-right font-mono font-bold text-[#0ea5e9]">{st.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   6. PRODUCT_CATALOG_VIEW (商品与库存 -> 商品总览 / 爆品滞销)
   ========================================================================== */
export function ProductCatalogView() {
  const [searchTerm, setSearchTerm] = useState("");
  const products = [
    { sku: "LN-2026-CO", name: "Lenakids 臻选精梳棉连体爬服 (夏末透气款)", category: "爬服", price: "¥129", cost: "¥32", stock: 840, speed: "优秀 (240件/周)" },
    { sku: "LN-2026-BL", name: "精装防惊跳有机四季舒适睡袋", category: "睡袋", price: "¥248", cost: "¥58", stock: 120, speed: "暴涨 (180件/周)" },
    { sku: "LN-2026-SO", name: "防勒松口精梳棉新生儿短口袜 3 双装", category: "鞋袜", price: "¥49", cost: "¥8", stock: 1540, speed: "常态 (90套/周)" },
    { sku: "LN-2026-BA", name: "竹纤维空气褶皱超软两用睡抱被", category: "抱被", price: "¥188", cost: "¥41", stock: 45, speed: "常态 (12件/周)" },
    { sku: "LN-2026-SU", name: "莫代尔婴儿夏季排凉超轻空调服(男童套分色)", category: "爬服", price: "¥158", cost: "¥36", stock: 920, speed: "暴涨 (350套/周)" }
  ];

  const filtered = products.filter(p => p.name.includes(searchTerm) || p.sku.includes(searchTerm));

  return (
    <div id="product-catalog-view" className="space-y-6">
      <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">万款款式 SKU 主数据库检索</h3>
          <p className="text-xs text-slate-400">统筹货品规格、品类配码、核定成本底价及各大平台可用总储藏量</p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索款式名称或 SKU..."
            className="bg-[#f8f9ff] text-xs font-semibold placeholder:text-slate-400 border border-slate-200 focus:border-sky-500 rounded-lg p-2.5 pl-8 focus:outline-none min-w-[200px]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f9ff] text-slate-400 font-bold border-b border-slate-100">
            <tr>
              <th className="p-4">SKU款号</th>
              <th className="p-4">商品全称</th>
              <th className="p-4">品类</th>
              <th className="p-4">建议吊牌价</th>
              <th className="p-4">核定制造底价</th>
              <th className="p-4 text-center">可控存货储备</th>
              <th className="p-4">动销评级</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((prod) => (
              <tr key={prod.sku} className="hover:bg-slate-50/50">
                <td className="p-4 font-mono font-bold text-slate-800">{prod.sku}</td>
                <td className="p-4 font-medium text-slate-700">{prod.name}</td>
                <td className="p-4"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{prod.category}</span></td>
                <td className="p-4 font-mono font-bold text-slate-800">{prod.price}</td>
                <td className="p-4 font-mono font-bold text-slate-500">{prod.cost}</td>
                <td className="p-4 text-center font-mono font-bold text-[#002045]">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${prod.stock < 100 ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"}`}>
                    {prod.stock}件
                  </span>
                </td>
                <td className="p-4"><span className="text-[10px] font-bold font-sans text-sky-500 bg-sky-50/50 px-2 py-0.5 rounded-md">{prod.speed}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   7. HERO_STAGNANT_VIEW (商品与库存 -> 爆品滞销)
   ========================================================================== */
export function HeroStagnantView() {
  const heroes = [
    { name: "臻选棉精织空气连体两用衣服", category: "夏款热卖", sales: "2,482 件/周", stock: "840 件", restock: "常规补货" },
    { name: "莫代尔极轻薄防凉夏季空调睡服", category: "避暑爆推", sales: "1,530 件/周", stock: "920 件", restock: "加急追单" }
  ];

  const stagnants = [
    { name: "重色厚毛线连体婴儿冬袄 (库存余货)", category: "反季积压", age: "已呆滞180天", stock: "620 件", solution: "特惠捆绑赠送或清仓" },
    { name: "粉色纯蕾丝薄裙 (配饰组试水款)", category: "退货率高", age: "高退率18.4%", stock: "340 件", solution: "立刻停推流并不予补货" }
  ];

  return (
    <div id="hero-stagnant-view" className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800">爆品热销与滞销预警两极看板</h3>
        <p className="text-xs text-slate-400">自动研判货品流速差值，智能诊断是否应该启动降库存清仓或紧急拉起工厂追单</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Heroes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
              <span>🔥 爆款动销提速榜</span>
            </h4>
            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">主推引流中</span>
          </div>
          <div className="space-y-3">
            {heroes.map((h, i) => (
              <div key={i} className="p-3 bg-emerald-50/10 border border-emerald-100 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-slate-800">{h.name}</p>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>周销: <strong className="text-emerald-600">{h.sales}</strong></span>
                  <span>可销售存货: <strong>{h.stock}</strong></span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">{h.restock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stagnant Warning */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
            <h4 className="text-xs font-bold text-rose-800 flex items-center space-x-1">
              <span>❄️ 极低呆滞滞销警告</span>
            </h4>
            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">清除库存紧迫</span>
          </div>
          <div className="space-y-3">
            {stagnants.map((s, i) => (
              <div key={i} className="p-3 bg-rose-50/10 border border-rose-100 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-slate-800">{s.name}</p>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span className="text-rose-600 font-bold">{s.age}</span>
                  <span>积压存货: <strong>{s.stock}</strong></span>
                  <span className="px-1.5 py-0.5 bg-rose-105 text-rose-800 rounded font-bold">{s.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   8. RUNOVER_LEDGER_VIEW / RESTOCK_CALCULATOR (商品与库存 -> 库存周转)
   ========================================================================== */
export function InventoryTurnoverView() {
  const [dailySales, setDailySales] = useState("45");
  const [leadDays, setLeadDays] = useState("10");
  const [safetyDays, setSafetyDays] = useState("5");
  const [recommended, setRecommended] = useState<number>(0);

  useEffect(() => {
    const ds = Number(dailySales) || 0;
    const ld = Number(leadDays) || 0;
    const sd = Number(safetyDays) || 0;
    // Safety Stock restock recommendation formula = (dailySales * leadDays) + (dailySales * safetyDays)
    setRecommended(ds * ld + ds * sd);
  }, [dailySales, leadDays, safetyDays]);

  return (
    <div id="inventory-turnover-view" className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800">科学库存备料 Restocking 优化计算器</h3>
        <p className="text-xs text-slate-400">基于产品每日销售流速(Run-rate)、代工交货工期和安全储备系数，智能防止大断码及积压发生</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 md:col-span-1">
          <span className="text-xs font-bold text-slate-800 block">Restock 变量参数调整</span>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">每日销售流速指数 (件/日)</label>
              <input
                type="number"
                value={dailySales}
                onChange={e => setDailySales(e.target.value)}
                className="w-full bg-[#f8f9ff] text-xs font-bold p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">代工与物流交期 (天)</label>
              <input
                type="number"
                value={leadDays}
                onChange={e => setLeadDays(e.target.value)}
                className="w-full bg-[#f8f9ff] text-xs font-bold p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">缓冲缓冲安全冗余覆盖 (天)</label>
              <input
                type="number"
                value={safetyDays}
                onChange={e => setSafetyDays(e.target.value)}
                className="w-full bg-[#f8f9ff] text-xs font-bold p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#002045] text-white p-6 rounded-xl md:col-span-2 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block">智能核定推荐补货阈值</span>
            <div className="mt-4 flex items-baseline space-x-1">
              <span className="text-4xl font-black font-mono text-sky-450">{recommended}</span>
              <span className="text-xs text-slate-300 font-bold">件</span>
            </div>
            <p className="text-xs text-slate-300 mt-4 leading-normal font-sans">
              根据您的输入，当可用预备库存（实体店仓储量 + 正在海运/货车途中的在途单量）**低于 {recommended} 件** 时，
              采购系统应当自动建议给关联供应商触发全新的补货 PO 货单。以防销售在未来发生中途断码。
            </p>
          </div>
          <div className="border-t border-white/10 pt-4 mt-6 flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>推荐公式: (日均销售 × 交货天数) + (日均销售 × 安全天数)</span>
            <span className="text-emerald-400 font-bold">✓ 智能参数校验已通过</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   9. PROCUREMENT_PO_VIEW (采购与供应 -> 采购总览)
   ========================================================================== */
export function ProcurementPOView() {
  const [pos, setPos] = useState([
    { id: "PO-2026-611a", supplier: "海安莱那织造有限公司", product: "经典纯色精梳无骨爬服 (薄款)", qty: 2500, cost: "¥32.00", status: "待供应商确认" },
    { id: "PO-2026-611b", supplier: "桐乡市七彩蚕丝婴童制品厂", product: "防踢抱被有机精疏四季棉", qty: 800, cost: "¥58.00", status: "已确认待到货" },
    { id: "PO-2026-611c", supplier: "绍兴柯桥轻纺针织商行", product: "儿童空气夏季超柔空调被", qty: 300, cost: "¥41.00", status: "部分收妥入存" }
  ]);

  const handleProgress = (id: string) => {
    setPos(prev => prev.map(p => {
      if (p.id !== id) return p;
      let newStatus = p.status;
      if (p.status === "待供应商确认") newStatus = "已确认待到货";
      else if (p.status === "已确认待到货") newStatus = "部分收妥入存";
      else if (p.status === "部分收妥入存") newStatus = "已全部入库归档";
      return { ...p, status: newStatus };
    }));
  };

  return (
    <div id="procurement-po-view" className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800">采购采购订单 PO 数据跟踪面板</h3>
        <p className="text-xs text-slate-400">管理从源头原材料、婴童服装贴牌工厂、加工交期、验收和财务清算日志</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold border-b border-slate-100 uppercase">
              <tr>
                <th className="p-4">采购 PO 单号</th>
                <th className="p-4">指定外部代工厂商</th>
                <th className="p-4">计划加工货品</th>
                <th className="p-4">购买数量</th>
                <th className="p-4">采购谈判底单价</th>
                <th className="p-4">当前状态节点</th>
                <th className="p-4 text-center">流转审批操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-800">{p.id}</td>
                  <td className="p-4 font-bold text-[#002045]">{p.supplier}</td>
                  <td className="p-4 font-medium text-slate-700">{p.product}</td>
                  <td className="p-4 font-mono font-bold">{p.qty} 件</td>
                  <td className="p-4 font-mono font-bold text-slate-600">{p.cost}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === "已全部入库归档" ? "bg-emerald-500 text-white" :
                      p.status === "部分收妥入存" ? "bg-cyan-50 text-cyan-600" :
                      p.status === "已确认待到货" ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {p.status === "已全部入库归档" ? (
                      <span className="text-[10px] text-slate-400 font-medium font-mono">审批已完结</span>
                    ) : (
                      <button
                        onClick={() => handleProgress(p.id)}
                        className="px-2.5 py-1.2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        推进至下一步骤
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   10. LOGISTICS_MANIFEST_VIEW (发货履约 -> 发货总览 / 超时预警)
   ========================================================================== */
export function LogisticsManifestView() {
  const [selectedWaybill, setSelectedWaybill] = useState<string | null>("SF-12984920412");
  const waybills = [
    { id: "SF-12984920412", type: "顺丰特快", target: "北京市朝阳区大屯街道", owner: "张大亮", status: "派送中" },
    { id: "ZTO-81203941024", type: "中通快递", target: "广东省广州市天河区", owner: "刘春蕾", status: "已签收" },
    { id: "YTO-77120359851", type: "圆通速递", target: "四川省成都市武侯区", owner: "陈小美", status: "已揽收" }
  ];

  const trackingSteps: Record<string, { time: string; text: string }[]> = {
    "SF-12984920412": [
      { time: "2026-05-22 14:10", text: "【北京市朝阳区大屯营业部】派件员李明 138-xxxx-xxxx 正在派送中" },
      { time: "2026-05-22 08:30", text: "快件已到达【北京首都机场航空分拨中心】, 准备转车送至大屯营业部" },
      { time: "2026-05-21 19:40", text: "快件已由【杭州萧山一共享主仓】完成自动打面单装车出库" },
      { time: "2026-05-21 18:22", text: "顾客提交订单后，大中台聚水潭接收并发货创建" }
    ],
    "ZTO-81203941024": [
      { time: "2026-05-21 11:20", text: "【已签收】收发室丰巢快递柜自动代签，感谢您的配合" },
      { time: "2026-05-20 22:15", text: "快件已从小货车卸车，安排广州天河站入柜准备" }
    ],
    "YTO-77120359851": [
      { time: "2026-05-22 09:12", text: "圆通速递车次已到达【杭州钱塘大江东分拨部】揽收完毕" }
    ]
  };

  return (
    <div id="logistics-manifest-view" className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800">发货运单实时路由轨迹监控</h3>
        <p className="text-xs text-slate-400">打通国内各大主流承运商快递面单网，点击任意运单即可直接穿透展示底层物流动态数据。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Waybills List */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden lg:col-span-1">
          <div className="px-4 py-3 bg-[#f8f9ff] border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">当前活跃运单（3 笔）</span>
          </div>
          <div className="divide-y divide-slate-100">
            {waybills.map((w) => (
              <div
                key={w.id}
                onClick={() => setSelectedWaybill(w.id)}
                className={`p-4 cursor-pointer text-xs transition-colors ${
                  selectedWaybill === w.id ? "bg-sky-50/40 border-l-4 border-[#0ea5e9]" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800">{w.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                    w.status === "已签收" ? "bg-emerald-100 text-emerald-800" :
                    w.status === "派送中" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"
                  }`}>{w.status}</span>
                </div>
                <div className="mt-2 text-slate-500 font-sans flex justify-between">
                  <span>{w.type} | {w.owner}</span>
                  <span className="truncate max-w-[120px] text-slate-400">{w.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Tracking steps */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs lg:col-span-2 space-y-4">
          <span className="text-xs font-bold text-slate-800 block border-b border-slate-100 pb-3">
            物流溯源快轨节点展示（面单 ID: {selectedWaybill}）
          </span>

          {selectedWaybill && trackingSteps[selectedWaybill] ? (
            <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-5 pt-2">
              {trackingSteps[selectedWaybill].map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Circle dot marker */}
                  <span className={`absolute -left-6.5 top-1 w-2.5 h-2.5 rounded-full border border-white ${
                    idx === 0 ? "bg-sky-500 ring-4 ring-sky-100" : "bg-slate-300"
                  }`}></span>
                  <p className="text-[11px] font-bold text-slate-400 font-mono">{step.time}</p>
                  <p className={`text-xs font-medium mt-1 ${idx === 0 ? "text-[#002045] font-bold" : "text-slate-600"}`}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs font-sans font-semibold">
              请点击左侧某一具体运单号核查其承运物理网流转链条。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   11. ROLE_PERMISSIONS_VIEW (系统设置 -> 权限设置 / 员工账号)
   ========================================================================== */
export function RolePermissionsView() {
  const [users, setUsers] = useState([
    { email: "director.ops@lenakids.com", name: "程主管", role: "主管运营经理", status: "白名单激活" },
    { email: "buyer.cotton@lenakids.com", name: "王采购", role: "供应链采销", status: "白名单激活" },
    { email: "service.front05@lenakids.com", name: "小刘客服", role: "售后专值值班", status: "白名单激活" }
  ]);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("主管运营经理");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;
    setUsers(prev => [
      ...prev,
      { email: newUserEmail, name: newUserName, role: newUserRole, status: "白名单激活" }
    ]);
    setNewUserEmail("");
    setNewUserName("");
  };

  return (
    <div id="role-permissions-view" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        
        {/* Users list database table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-800">系统已授权员工账号白名单</h3>
              <p className="text-[11px] text-slate-400">只有列于下表并处于激活状态的职能人员能进入 PM2 的生产环境</p>
            </div>
            <span className="text-[10px] font-mono text-[#0ea5e9] bg-sky-50 px-2 py-0.5 rounded-full font-bold">PROD 授权中</span>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9ff] text-slate-450 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3">姓名</th>
                  <th className="p-3">登录账户邮箱</th>
                  <th className="p-3">ERP 授权角色</th>
                  <th className="p-3">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
                {users.map((usr, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">{usr.name}</td>
                    <td className="p-3 font-mono text-[#002045] font-semibold">{usr.email}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-[#f8f9ff] border border-slate-150 rounded text-[10px] font-bold text-slate-600">{usr.role}</span></td>
                    <td className="p-3">
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold inline-flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span>{usr.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action: Add User */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs md:col-span-1 h-fit">
          <h3 className="text-xs font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <UserPlus className="w-4.5 h-4.5 text-[#0ea5e9]" />
            <span>新员工白名单导入</span>
          </h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">员工姓名</label>
              <input
                type="text"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                placeholder="王小帅"
                className="w-full bg-[#f8f9ff] text-xs font-bold p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">专值工作邮箱</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                placeholder="wang@lenakids.com"
                className="w-full bg-[#f8f9ff] text-xs font-mono font-bold p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">设置分配权限角色</label>
              <select
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value)}
                className="w-full bg-[#f8f9ff] text-xs font-bold p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-semibold"
              >
                <option value="主管运营经理">国家级运营经理/主管</option>
                <option value="供应链采销">采销供应链高级专员</option>
                <option value="售后专值值班">一线当值专属客服</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs uppercase cursor-pointer"
            >
              一键添加白名单授权
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
