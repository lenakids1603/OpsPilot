/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, Plus, Search, Filter, RefreshCw, Upload, CheckCircle, 
  AlertTriangle, ArrowRight, Settings, Calendar, Landmark, HelpCircle, X
} from "lucide-react";

interface ImportRecord {
  id: string;
  fileName: string;
  sourceType: "聚水潭采购入库单" | "抖音订单退款账单" | "银行交易回执账套" | "供应商档案注册体";
  linesParsed: number;
  successRate: number; // e.g. 98.5%
  operator: string;
  timestamp: string;
  status: "解析成功并落地" | "差异拦截核验中" | "结构打回重新导入";
}

interface ImportAnomaly {
  id: string;
  fileName: string;
  rowIndex: number;
  invalidFields: string; // e.g. "款型未在主款库中登记"
  rowRawData: string; // raw string dump
  anomalyStatus: "待忽略免除" | "已人工调校修正" | "严重拦截";
}

interface DataImportPageProps {
  defaultTab?: "import" | "records" | "anomalies";
}

export default function DataImportPage({ defaultTab = "import" }: DataImportPageProps) {
  const [activeTab, setActiveTab] = useState<"import" | "records" | "anomalies">(defaultTab);
  const [selectedFormat, setSelectedFormat] = useState("聚水潭采购入库单");

  const [importRecords, setImportRecords] = useState<ImportRecord[]>([
    { id: "IMP-202605-01", fileName: "Jushuitan_Inbounds_MayBatch_1.xlsx", sourceType: "聚水潭采购入库单", linesParsed: 450, successRate: 100, operator: "徐仓管", timestamp: "2026-05-22 14:10", status: "解析成功并落地" },
    { id: "IMP-202605-02", fileName: "Douyin_Refunds_Water_7D.csv", sourceType: "抖音订单退款账单", linesParsed: 1845, successRate: 98.5, operator: "丽娜客服部", timestamp: "2026-05-21 16:35", status: "解析成功并落地" },
    { id: "IMP-202605-03", fileName: "CCB_Proprietor_Bill_202605.xlsx", sourceType: "银行交易回执账套", linesParsed: 120, successRate: 91.6, operator: "出纳张财务", timestamp: "2026-05-20 10:15", status: "差异拦截核验中" },
    { id: "IMP-202605-04", fileName: "Supplier_NewContracts_Draft.xlsx", sourceType: "供应商档案注册体", linesParsed: 4, successRate: 0, operator: "采销唐主管", timestamp: "2026-05-18 11:20", status: "结构打回重新导入" }
  ]);

  const [anomalies, setAnomalies] = useState<ImportAnomaly[]>([
    { id: "ANM-80121", fileName: "CCB_Proprietor_Bill_202605.xlsx", rowIndex: 42, invalidFields: "个体主体 [温岭市大溪童装厂] 对应的银行卡号格式位不足，缺少结算分支银行", rowRawData: "6217CCB8820xxxxx,温岭大溪,45000.00", anomalyStatus: "待忽略免除" },
    { id: "ANM-80122", fileName: "CCB_Proprietor_Bill_202605.xlsx", rowIndex: 88, invalidFields: "对账单收款流水项突破单体 5,000,000 元额度安全线，系统阻断进项落地", rowRawData: "依依童装,4850000.00,CCB,,2026-05-20", anomalyStatus: "严重拦截" },
    { id: "ANM-80123", fileName: "Douyin_Refunds_Water_7D.csv", rowIndex: 1042, invalidFields: "品质缺陷退因中的多编码 SKU [LN-2026-N99] 未在商品档案库中查核底卡", rowRawData: "LN-2026-N99,天空蓝,M码,,4,248.00,缩水脱脱线", anomalyStatus: "已人工调校修正" }
  ]);

  // Excel uploading simulated dynamics
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setUploadedFile(file);

    setTimeout(() => {
      setUploading(false);
      // Construct a new record successfully imported
      const newRec: ImportRecord = {
        id: `IMP-202605-0${importRecords.length + 1}`,
        fileName: file.name,
        sourceType: selectedFormat as any,
        linesParsed: Math.floor(Math.random() * 300 + 40),
        successRate: 100,
        operator: "当值操作员",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "解析成功并落地"
      };

      setImportRecords(prev => [newRec, ...prev]);
      alert(`🟢【数据中心解析完成】\n解析文件 [${file.name}] 对应模板：\n- 提取出有效行数: ${newRec.linesParsed} 行\n已成功连通落地财务出纳数据库并对账打底！`);
    }, 1500);
  };

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Search Header control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-205 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-950 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#006591]" />
            数据中心：Excel 手工对账单导入中台
          </h1>
          <p className="text-xs text-slate-505 mt-1">
            取代原各系统不相通数据壁垒，支持核准聚水潭到货验质入仓单、抖音结算表、银行对账回执流式并入操作。
          </p>
        </div>
      </div>

      {/* Tabs segment */}
      <div className="flex border-b border-slate-200">
        {[
          { key: "import", label: "Excel 账单极速导入" },
          { key: "records", label: "数据导入审计日志" },
          { key: "anomalies", label: "数据异常拦截核验表" }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key as any)}
            className={`px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === item.key 
                ? "border-[#006591] text-[#006591]" 
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 数据导入 */}
      {activeTab === "import" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Form selecting source schema */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2.5 block">
              1. 选配 Excel 映射模板
            </h3>

            <div className="space-y-3.5 pt-1.5 font-bold text-slate-705 text-xs">
              {[
                "聚水潭采购入库单",
                "抖音订单退款账单",
                "银行交易回执账套",
                "供应商档案注册体"
              ].map(f => (
                <label key={f} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormat === f}
                    onChange={() => setSelectedFormat(f)}
                    className="accent-[#006591] w-4 h-4"
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[10px] leading-relaxed border border-amber-200/50">
              提示：上挂前请确保列头匹配名称一致。聚水潭到货单必须具有【款号、尺码、入库数、不良数、采购价】。
            </div>
          </div>

          {/* Core Upload box */}
          <div className="md:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-2xs flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2.5 block">
                2. 拖拽、粘贴或选择对账单文件 xlsx/csv
              </h3>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-normal">
                系统全本地解析，内置高强正则模型提取算法，可自动比对。如解析不通过，可在“数据异常拦截核验表”中进行人工调校。
              </p>
            </div>

            <div className="border border-dashed border-slate-200 hover:border-[#006591] transition-all bg-slate-50 rounded-xl p-10 text-center flex flex-col items-center justify-center cursor-pointer min-h-[160px] relative my-3">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSimulatedFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploadedFile ? (
                <div className="space-y-2">
                  <span className="font-mono text-xs font-black text-slate-700 block select-all">{uploadedFile.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold">文件尺寸：{uploadedFile.size ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : "自动匹配格式"}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="w-8 h-8 text-slate-350 mx-auto" strokeWidth={1.5} />
                  <p className="text-xs font-bold text-slate-705">点击这里选择对账单文件，或将表格文件拖拽至并排并连对齐</p>
                  <p className="text-[9.5px] text-slate-400">支持 3-14 岁女童全渠道订单流/银行流/采购流匹配解析</p>
                </div>
              )}
            </div>

            {uploading ? (
              <div className="p-3 bg-sky-50 rounded-lg text-xs text-[#006591] font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>表格多列分析解析、核查主款库、对比年流水红线中...</span>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 flex justify-between font-mono select-none">
                <span>模板匹配合规度：高高</span>
                <span>当前环境：ONLINE-PRESET</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: 导入记录 */}
      {activeTab === "records" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
              <tr>
                <th className="p-4">对账导入批次</th>
                <th className="p-4">账单文件名</th>
                <th className="p-4 font-black">映射数据模板</th>
                <th className="p-4 text-center">系统解析有效行</th>
                <th className="p-4 text-center">校验良品通过率</th>
                <th className="p-4">操作专员</th>
                <th className="p-4">完成录存时间</th>
                <th className="p-4 text-right">当前流转</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
              {importRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/20">
                  <td className="p-4 font-mono font-bold text-[#002045]">{r.id}</td>
                  <td className="p-4 select-all font-bold text-slate-800">{r.fileName}</td>
                  <td className="p-4"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9.5px] font-bold text-slate-500">{r.sourceType}</span></td>
                  <td className="p-4 text-center font-mono font-bold text-slate-600">{r.linesParsed} 行</td>
                  <td className="p-4 text-center font-mono font-black text-indigo-505">
                    {r.successRate === 100 ? "100.0%" : r.successRate === 0 ? "解析失败打回" : `${r.successRate.toFixed(1)}%`}
                  </td>
                  <td className="p-4 font-bold text-slate-600">{r.operator}</td>
                  <td className="p-4 font-mono text-slate-450">{r.timestamp}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                      r.status === "解析成功并落地" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      r.status === "差异拦截核验中" ? "bg-amber-50 text-amber-550 border border-amber-100" : "bg-red-50 text-red-655 border border-red-101"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: 数据异常记录 */}
      {activeTab === "anomalies" && (
        <div className="bg-white border border-slate-205 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 bg-[#fffbeb] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-505" />
            <div>
              <h3 className="text-xs font-black text-amber-800">未核准过账异常拦截汇总 (解析偏离记录)</h3>
              <p className="text-[10px] text-amber-600 mt-0.5">此类记录由于款号未建档、主主体超过年度 500 万控制安全线、或银行代码失效引起拦截，需要进行人工调配修正方可继续落地。</p>
            </div>
          </div>

          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100">
              <tr>
                <th className="p-4">拦截 ID</th>
                <th className="p-4">溯源文件名</th>
                <th className="p-4 text-center">Excel 异常行</th>
                <th className="p-4 font-black">验证拦截原真理由</th>
                <th className="p-4">原始行数据 Dump</th>
                <th className="p-4 text-center">状态</th>
                <th className="p-4 text-right">调校处置</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
              {anomalies.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/20">
                  <td className="p-4 font-mono font-bold text-rose-500">{a.id}</td>
                  <td className="p-4 font-mono text-slate-450 truncate max-w-[120px]" title={a.fileName}>{a.fileName}</td>
                  <td className="p-4 text-center font-mono font-bold text-slate-600">第 {a.rowIndex} 行</td>
                  <td className="p-4 font-black text-slate-800 select-text max-w-sm leading-normal">{a.invalidFields}</td>
                  <td className="p-4 font-mono text-[10px] text-slate-405 truncate max-w-[150px]" title={a.rowRawData}>{a.rowRawData}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                      a.anomalyStatus === "已人工调校修正" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      a.anomalyStatus === "待忽略免除" ? "bg-slate-100 text-slate-500 border border-slate-205" : "bg-red-550 text-white border border-red-600"
                    }`}>
                      {a.anomalyStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right select-none">
                    {a.anomalyStatus !== "已人工调校修正" ? (
                      <button 
                        onClick={() => {
                          const repair = confirm(`【人工偏离修正】是否开启对 ${a.id} 的数据手工调校？\n这允许强行补建款号底卡或重新选择关联银行。`);
                          if (repair) {
                            setAnomalies(prev => prev.map(item => item.id === a.id ? { ...item, anomalyStatus: "已人工调校修正" } : item));
                            alert("🟢 手动调控完成！该笔异常已由财务主管会签通过，重新写入出纳流水分派！");
                          }
                        }}
                        className="text-[#006591] hover:text-[#004c6e] cursor-pointer"
                      >
                        介入调校
                      </button>
                    ) : (
                      <span className="text-[9.5px] text-slate-400 font-mono">调校已核销落地</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
