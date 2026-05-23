/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, Regex, Sparkles, Send, Copy, Check, Trash2, HelpCircle, FileCheck2, CornerDownLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "@shared/types";
import { askOpsPilot } from "../api/dashboard";

// Preset system prompting for business utility tasks
const PRESETS = [
  {
    title: "生成微信通知模板",
    emoji: "💬",
    systemInstruction: "你是一个专业的客户微信客服。写一段简短、礼貌、温和的微信通知（包含尊称、通知、提醒、感谢），字数控制在150字以内，符合商业礼仪。",
    placeholderPrompt: "订单编号 LN-2026-0522，由于华北雷雨天气，可能延迟1天派送。客户名：陈女士。"
  },
  {
    title: "客诉工单智能回复",
    emoji: "✉️",
    systemInstruction: "你是一个资深的电商公关骨干。请撰写一份极其真诚、关切的邮件回复草稿（包含致歉、问题跟进、解决方案与小额赔偿方案），结构清晰，排版精美。",
    placeholderPrompt: "客户张先生反馈收到的衣服包装有破损，衣服带有一处轻微压痕，想要退15元差价，不退货。"
  },
  {
    title: "业务简报排版优化",
    emoji: "📋",
    systemInstruction: "你是一位精明干练的行政秘书。请将用户提供的零碎笔记整理成为重点突出、条理清晰的一份格式化周报/日报汇报草稿，使用 Markdown 符号标识。",
    placeholderPrompt: "今天跑了3个物流仓库、对账搞定了2个、跟微信团队开会说消息推送节点还要等调试、下午收到4个退款工单都处理了。"
  }
];

export default function DepartmentTools() {
  const [messyText, setMessyText] = useState(
    "北京市朝阳区建国门外大街1号国贸大厦B座21层，收件人：李泽宇，联系电话：13812345678。订单号#982189，商品是乐那童装夏季遮阳帽，请周六日务必配送，谢谢！"
  );
  
  // Local regex extractor outputs
  const [extractedPhone, setExtractedPhone] = useState("");
  const [extractedAddress, setExtractedAddress] = useState("");
  const [extractedName, setExtractedName] = useState("");
  const [localSuccessMessage, setLocalSuccessMessage] = useState("");

  // Gemini assistant conversation logs
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "opspilot",
      text: "👋 您好！我是 OpsPilot 企业小助手。在这里您可以快速优化客单格式，或点击上方的「快速模板向导」一键生成微信通知、客诉邮件等，也支持跟我直接对话查询任何行政排版方案。",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Parse Text locally via Regex
  const handleLocalExtraction = () => {
    // Extract Phone (Mobile format)
    const phoneReg = /(1[3-9]\d{9})|(\d{3,4}-\d{7,8})/g;
    const phoneMatch = messyText.match(phoneReg);
    const phone = phoneMatch ? phoneMatch[0] : "未提取到有效电话";
    setExtractedPhone(phone);

    // Extract Address (Chinese Address keyword hint helper)
    const addressReg = /([一-龥]+(?:省|自治区|直辖市|市|区|县|街道|路|街|号|大厦|座))[^，。、\s]+/g;
    const addressMatch = messyText.match(addressReg);
    const address = addressMatch ? addressMatch[0] : "未提取到省市街道级地址";
    setExtractedAddress(address);

    // Extract Name (Heuristic finding: "收件人：" or "收货人：" or preceding words)
    const nameReg = /(?:收件人|收货人|客户)[:：]?\s*([一-龥]{2,4})/g;
    const nameMatch = nameReg.exec(messyText);
    const name = nameMatch ? nameMatch[1] : "未匹配到称呼关键字";
    setExtractedName(name);

    setLocalSuccessMessage("提取完成！点击下方字段可一键拷贝或快速填充至输入框。");
    setTimeout(() => setLocalSuccessMessage(""), 3000);
  };

  // Chat sending handler using the isolated API client
  const handleSendMessage = async (customPrompt?: string, presetSystem?: string) => {
    const promptToSend = customPrompt || userInput;
    if (!promptToSend.trim()) return;

    // Add User Bubble
    const userMsg: ChatMessage = {
      id: "us-" + Date.now(),
      sender: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog((prev) => [...prev, userMsg]);
    if (!customPrompt) setUserInput("");
    setIsSending(true);

    try {
      const result = await askOpsPilot(
        promptToSend,
        presetSystem || "You are an expert corporate secretary, data analyst, and automation consultant named OpsPilot."
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || "HTTP failure to backend standardizer.");
      }

      // Add Model Response Bubble
      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "opspilot",
        text: result.data.text || "已完成，没有输出内容。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatLog((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: "err-" + Date.now(),
        sender: "opspilot",
        text: `❌ 联络失败：${err.message || "未知接口错误"}。请确认后台服务器运行情况，及 Settings -> Secrets 中已经正确导入 GEMINI_API_KEY。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatLog((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Helper trigger applying Preset to Chat Input Form hook
  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    handleSendMessage(preset.placeholderPrompt, preset.systemInstruction);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Messy Order Text Formatter (Left Column - 5 cols) */}
      <div className="lg:col-span-12 xl:col-span-5 space-y-6">
        <div className="bg-white p-5 border border-slate-200 rounded-xl relative shadow-2xs">
          <div className="flex items-center space-x-2 pb-3.5 border-b border-slate-100 mb-4">
            <Regex className="w-5 h-5 text-[#0ea5e9]" />
            <h4 className="text-sm font-bold text-[#002045]">
              日常单本/客单智能拆分提取器
            </h4>
          </div>

          <label className="block text-xs font-bold text-slate-500 mb-2">
            原始凌乱文本粘贴区:
          </label>
          <textarea
            value={messyText}
            onChange={(e) => setMessyText(e.target.value)}
            rows={5}
            className="w-full p-3 font-semibold text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white resize-y leading-relaxed mb-4 font-sans"
            placeholder="粘贴凌乱的业务单据例如：北京市朝阳区客户张三电话139...商品名称..."
          />

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setMessyText("")}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 border border-transparent rounded-lg transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空输入</span>
            </button>
            <button
              onClick={handleLocalExtraction}
              className="flex items-center space-x-1.5 px-4.5 py-1.5 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>一键正则拆分规则</span>
            </button>
          </div>

          {/* Extracted Fields Dashboard Panel */}
          <div className="space-y-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/55 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mr-2">解析引擎:</span>
              <span className="text-[10px] font-semibold text-slate-500">
                本地词法提取器 v1.1
              </span>
            </div>

            {/* Field: Name */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">姓名:</span>
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-slate-800 ${extractedName ? "font-bold" : "text-slate-400 italic"}`}>
                  {extractedName || "等待拆分提取"}
                </span>
                {extractedName && (
                  <button 
                    onClick={() => handleCopy("name", extractedName)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                    title="复制姓名"
                  >
                    {copiedId === "name" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* Field: Phone */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">联系电话:</span>
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-slate-800 ${extractedPhone ? "font-bold" : "text-slate-400 italic"}`}>
                  {extractedPhone || "等待拆分提取"}
                </span>
                {extractedPhone && (
                  <button 
                    onClick={() => handleCopy("phone", extractedPhone)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                    title="复制手机"
                  >
                    {copiedId === "phone" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* Field: Address */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">详细收发地址:</span>
                {extractedAddress && (
                  <button 
                    onClick={() => handleCopy("addr", extractedAddress)}
                    className="p-1 text-slate-400 hover:text-[#006591] rounded flex items-center space-x-1 cursor-pointer"
                    title="复制地址"
                  >
                    {copiedId === "addr" ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <span className="flex items-center text-[10px] text-slate-400">
                        <Copy className="w-3 h-3 mr-1" /> 拷贝
                      </span>
                    )}
                  </button>
                )}
              </div>
              <p className={`p-2 bg-white rounded border border-slate-200 leading-relaxed font-mono ${extractedAddress ? "text-slate-700 font-medium" : "text-slate-400 italic"}`}>
                {extractedAddress || "等待正则算法识别..."}
              </p>
            </div>

            {/* Success Micro Alert */}
            <AnimatePresence>
              {localSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded"
                >
                  {localSuccessMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Informative Tips */}
        <div className="bg-slate-50/75 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-start space-x-2">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-700 block">如何协同右侧 AI 助手？</span>
            <span className="leading-relaxed">
              您可以利用本地拆分工具提取有用的实体，然后在右侧直接询问 AI “根据这个地址为李泽宇起草一份北京发往国贸的快递加急通知书”，将前后台接口实现无缝连通。
            </span>
          </div>
        </div>
      </div>

      {/* Gemini AI Copywriter Chat (Right Column - 7 cols) */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col space-y-4">
        {/* Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              disabled={isSending}
              className="bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-55 p-3 border border-slate-200 rounded-xl transition-all text-left flex items-start space-x-2.5 shadow-2xs group cursor-pointer"
            >
              <span className="text-xl p-1 bg-slate-50 rounded-lg group-hover:scale-115 transition-transform">{preset.emoji}</span>
              <div>
                <span className="block text-xs font-bold text-[#002045] mb-0.5">
                  {preset.title}
                </span>
                <span className="block text-[10px] text-slate-400 line-clamp-1">
                  例：{preset.placeholderPrompt}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Interactive Chat Console */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col h-[400px]">
          {/* Console Header */}
          <div className="p-3.5 px-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
              <span className="text-xs font-bold text-[#002045]">
                OpsPilot 智能撰写助理聊天沙盒
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-50 text-emerald-600 border border-emerald-200">
              ● Gemini-3.5-Flash
            </span>
          </div>

          {/* Message Area */}
          <div id="chat-messages-box" className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[290px]">
            {chatLog.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed font-sans ${
                    msg.sender === "user"
                      ? "bg-[#0ea5e9] text-white rounded-br-none"
                      : "bg-slate-50 text-slate-700 rounded-bl-none border border-slate-200/80"
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert font-semibold">
                    {msg.text}
                  </div>
                  {/* Option to copy robot output */}
                  {msg.sender === "opspilot" && msg.id !== "welcome-msg" && (
                    <div className="flex justify-end border-t border-slate-150 mt-2.5 pt-1.5">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-[#006591] cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>复制内容</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-semibold text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="flex flex-col items-start">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl rounded-bl-none px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="font-semibold text-[#002045]/75 animate-pulse">OpsPilot 在极速排版编排中...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Input Area */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/30 rounded-b-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isSending}
                className="flex-grow bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006591] disabled:opacity-60 font-semibold"
                placeholder={isSending ? "智能助理计算中..." : "在这里打字聊天或向 Gemini 询问..."}
              />
              <button
                type="submit"
                disabled={isSending || !userInput.trim()}
                className="bg-[#002045] hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg p-2 transition-all flex items-center justify-center cursor-pointer h-8 w-8"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
