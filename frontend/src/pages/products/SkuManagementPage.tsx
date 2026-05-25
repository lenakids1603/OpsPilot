/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Search, Filter, RefreshCw, Edit3, Grid, List, 
  Settings, CheckCircle, AlertTriangle, Layers, HelpCircle
} from "lucide-react";

interface SkuRecord {
  skuCode: string;
  styleNo: string;
  name: string;
  color: string;
  size: string; // e.g. "80 (适合3-6月)", "110 (适合3-4岁)"
  stock: number;
  costPrice: number;
  supplierName: string;
  status: "供应中" | "已售罄" | "工厂断料待补" | "清仓备战";
}

export default function SkuManagementPage() {
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");

  const [skuList, setSkuList] = useState<SkuRecord[]>([
    { skuCode: "LN-2026-CO-PINK-80", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", color: "樱花粉", size: "80码 (3-6月)", stock: 320, costPrice: 32.0, supplierName: "海安莱那织造有限公司", status: "供应中" },
    { skuCode: "LN-2026-CO-PINK-90", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", color: "樱花粉", size: "90码 (6-12月)", stock: 240, costPrice: 32.0, supplierName: "海安莱那织造有限公司", status: "供应中" },
    { skuCode: "LN-2026-CO-BLUE-80", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", color: "天空蓝", size: "80码 (3-6月)", stock: 180, costPrice: 32.5, supplierName: "海安莱那织造有限公司", status: "供应中" },
    { skuCode: "LN-2026-CO-BLUE-95", styleNo: "LN-2026-CO", name: "臻选精梳棉连体爬服", color: "天空蓝", size: "95码 (1-2岁)", stock: 0, costPrice: 32.5, supplierName: "海安莱那织造有限公司", status: "已售罄" },
    { skuCode: "LN-2026-BL-OAT-100", styleNo: "LN-2026-BL", name: "防惊跳有机四季睡袋", color: "燕麦米", size: "100码 (2-3岁)", stock: 45, costPrice: 58.0, supplierName: "温岭市依依童装制品厂", status: "工厂断料待补" },
    { skuCode: "LN-2026-BL-OAT-110", styleNo: "LN-2026-BL", name: "防惊跳有机四季睡袋", color: "燕麦米", size: "110码 (3-4岁)", stock: 75, costPrice: 58.0, supplierName: "温岭市依依童装制品厂", status: "供应中" },
    { skuCode: "LN-2026-SO-MIX-S", styleNo: "LN-2026-SO", name: "松口精棉新生短袜3双装", color: "三色混装", size: "S码 (0-1岁)", stock: 980, costPrice: 8.0, supplierName: "常熟汇豪针织加工商行", status: "清仓备战" },
    { skuCode: "LN-2026-SO-MIX-M", styleNo: "LN-2026-SO", name: "松口精棉新生短袜3双装", color: "三色混装", size: "M码 (1-2岁)", stock: 560, costPrice: 8.0, supplierName: "常熟汇豪针织加工商行", status: "供应中" }
  ]);

  const handleSyncJushuitanStock = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("🟢【聚水潭库存协同】\n已极速刷新多电商主仓、备用仓以及分理口 SKU 可售库存！现存量校验通过。");
    }, 1100);
  };

  const colors = ["all", "樱花粉", "天空蓝", "燕麦米", "三色混装"];
  const sizes = ["all", "80码 (3-6月)", "90码 (6-12月)", "95码 (1-2岁)", "100码 (2-3岁)", "110码 (3-4岁)", "S码 (0-1岁)", "M码 (1-2岁)"];

  const filteredSkus = skuList.filter(s => {
    const q = search.toLowerCase();
    const styleMatch = s.styleNo.toLowerCase().includes(q) || s.skuCode.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    const colorMatch = selectedColor === "all" || s.color === selectedColor;
    const sizeMatch = selectedSize === "all" || s.size === selectedSize;
    return styleMatch && colorMatch && sizeMatch;
  });

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-950 flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#006591]" />
            商品精细款式 SKU 单项管理
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            下沉至尺码、配色、规格明细，配平工厂供货期。库存实数通过聚水潭 API 每常态轮询校准，防范发货断尾超时。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncJushuitanStock}
            disabled={syncing}
            className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "聚水潭物理仓提取中..." : "与聚水潭同步库存"}</span>
          </button>
        </div>
      </div>

      {/* Filters Segment list */}
      <div className="bg-white border border-slate-205 rounded-xl p-4 space-y-3.5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">模糊模糊检索款号/SKU</span>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="款款号底 LN-* 或 混色、精纺..."
                className="w-full bg-[#f8f9ff] text-xs font-semibold placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:border-sky-500 rounded-lg py-2 pl-9 pr-3"
              />
            </div>
          </div>

          {/* Color filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">配色细目过滤</span>
            <select
              value={selectedColor}
              onChange={e => setSelectedColor(e.target.value)}
              className="w-full bg-[#f8f9ff] text-xs font-bold text-slate-700 border border-slate-202 rounded-lg py-2 px-3"
            >
              {colors.map(c => (
                <option key={c} value={c}>{c === "all" ? "全部配色" : c}</option>
              ))}
            </select>
          </div>

          {/* Size filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">尺码细分规格</span>
            <select
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value)}
              className="w-full bg-[#f8f9ff] text-xs font-bold text-slate-700 border border-slate-202 rounded-lg py-2 px-3"
            >
              {sizes.map(s => (
                <option key={s} value={s}>{s === "all" ? "全部尺码" : s}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Sku table listing */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
            <tr>
              <th className="p-4">SKU 条形防乱码</th>
              <th className="p-4">款型主企划款号</th>
              <th className="p-4">商品名款别</th>
              <th className="p-4 font-black">配色</th>
              <th className="p-4 font-black">尺寸码龄</th>
              <th className="p-4 text-center">聚水潭可售库存</th>
              <th className="p-4 text-right">核定代工BOM造价</th>
              <th className="p-4">主力代工厂</th>
              <th className="p-4">当前存货状态</th>
              <th className="p-4 text-right">调价</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
            {filteredSkus.map(s => (
              <tr key={s.skuCode} className="hover:bg-slate-50/20">
                <td className="p-4 font-mono font-bold text-[#002045] select-all">{s.skuCode}</td>
                <td className="p-4 font-mono text-slate-450">{s.styleNo}</td>
                <td className="p-4 font-black text-slate-800">{s.name}</td>
                <td className="p-4 font-black text-slate-900">{s.color}</td>
                <td className="p-4 text-slate-655">{s.size}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                    s.stock === 0 ? "bg-rose-100 text-rose-600 animate-pulse font-black" :
                    s.stock < 100 ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {s.stock} 件
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-black text-[#006591]">Y{s.costPrice.toFixed(1)}</td>
                <td className="p-4 text-xs font-semibold text-slate-600">{s.supplierName}</td>
                <td className="p-4">
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black ${
                    s.status === "供应中" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    s.status === "已售罄" ? "bg-red-50 text-red-600 border border-red-100" :
                    s.status === "工厂断料待补" ? "bg-amber-50 text-amber-550 border border-amber-100" : "bg-sky-50 text-sky-600 border border-sky-100"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-right select-none">
                  <button 
                    onClick={() => {
                      const newPrice = prompt(`请输入 [${s.skuCode}] 配置的全新代工价:`, String(s.costPrice));
                      if (newPrice && !isNaN(Number(newPrice))) {
                        setSkuList(prev => prev.map(item => item.skuCode === s.skuCode ? { ...item, costPrice: Number(newPrice) } : item));
                        alert("🟢 SKU 会计成本核定核实核销价修改成功！已连通聚水潭成本底单！");
                      }
                    }}
                    className="text-[#006591] hover:text-[#004c6e] font-black cursor-pointer"
                  >
                    调造价
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
