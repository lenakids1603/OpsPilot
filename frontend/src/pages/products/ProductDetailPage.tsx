/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Search, Filter, Layers, CreditCard, Landmark, CheckCircle, 
  AlertTriangle, ChevronRight, Activity, TrendingUp, AlertCircle
} from "lucide-react";

interface ProductStyle {
  styleNo: string;
  name: string;
  category: string;
  season: string;
  msrp: number;
  costPrice: number;
  material: string; // e.g. "100% 精梳无骨棉"
  supplier: string;
  totalStock: number;
  totalSales: number;
}

export default function ProductDetailPage() {
  const [selectedStyleNo, setSelectedStyleNo] = useState("LN-2026-CO");

  const styles: Record<string, ProductStyle> = {
    "LN-2026-CO": { styleNo: "LN-2026-CO", name: "Lenakids 臻选精梳棉连体爬服 (夏末透气款)", category: "细针织爬服两用衫", season: "2026春夏", msrp: 129, costPrice: 32, material: "98%精梳高支无骨棉、2%莫代尔防滑丝", supplier: "海安莱那织造有限公司", totalStock: 840, totalSales: 2400 },
    "LN-2026-BL": { styleNo: "LN-2026-BL", name: "精装防惊跳有机四季舒适睡袋", category: "双向防惊跳防踢睡袋", season: "2026四季", msrp: 248, costPrice: 58, material: "100%有机无缝精织精排棉、高透气珍珠棉包头", supplier: "温岭市依依童装制品厂", totalStock: 120, totalSales: 1530 },
    "LN-2026-SO": { styleNo: "LN-2026-SO", name: "防勒松口精梳棉新生儿短口袜 3 双装", category: "精编婴儿防脱袜", season: "2026春夏", msrp: 49, costPrice: 8, material: "85%精绞竹浆棉、15%高强力橡弹性丝", supplier: "常熟汇豪针织加工商行", totalStock: 1540, totalSales: 3890 }
  };

  const skus: Record<string, { sku: string; color: string; size: string; stock: number; cost: number }[]> = {
    "LN-2026-CO": [
      { sku: "LN-2026-CO-PINK-80", color: "樱花粉", size: "80码 (3-6月)", stock: 320, cost: 32.0 },
      { sku: "LN-2026-CO-PINK-90", color: "樱花粉", size: "90码 (6-12月)", stock: 240, cost: 32.0 },
      { sku: "LN-2026-CO-BLUE-80", color: "天空蓝", size: "80码 (3-6月)", stock: 180, cost: 32.5 },
      { sku: "LN-2026-CO-BLUE-95", color: "天空蓝", size: "95码 (1-2岁)", stock: 100, cost: 32.5 }
    ],
    "LN-2026-BL": [
      { sku: "LN-2026-BL-OAT-100", color: "燕麦米", size: "100码 (2-3岁)", stock: 45, cost: 58.0 },
      { sku: "LN-2026-BL-OAT-110", color: "燕麦米", size: "110码 (3-4岁)", stock: 75, cost: 58.0 }
    ],
    "LN-2026-SO": [
      { sku: "LN-2026-SO-MIX-S", color: "三色混装", size: "S码 (0-1岁)", stock: 980, cost: 8.0 },
      { sku: "LN-2026-SO-MIX-M", color: "三色混装", size: "M码 (1-2岁)", stock: 560, cost: 8.0 }
    ]
  };

  // Simulated complaints specifically associated with this model product (Operational synergy!)
  const complaints: Record<string, { date: string; store: string; reason: string; result: string; severity: string }[]> = {
    "LN-2026-CO": [
      { date: "2026-05-22", store: "抖音丽娜贝贝旗舰店", reason: "洗涤后领部纽扣有轻微松脱，疑似针织行针有丢针", result: "安排免费速退，财务已在海安莱那织造结算中扣减 50 元/单罚款", severity: "中度" },
      { date: "2026-05-20", store: "天猫LenaKids旗舰店", reason: "实物色调比详情图稍微偏冷黄，客户抱怨有落色", result: "客客服补偿 10 元红包消号归档。建议美工调整摄影冷暖色温", severity: "轻度" }
    ],
    "LN-2026-BL": [
      { date: "2026-05-21", store: "抖音莉娜臻选", reason: "防惊跳包覆拉链头位置疑似打磨不平，摩擦婴儿面额导致红痕", result: "【严重质量事故】已要求依依童装制品厂整批返厂重工打磨，否则暂停后续 PO 合约", severity: "严重" }
    ],
    "LN-2026-SO": []
  };

  const activeStyle = styles[selectedStyleNo] || styles["LN-2026-CO"];
  const activeSkus = skus[selectedStyleNo] || [];
  const activeComplaints = complaints[selectedStyleNo] || [];

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Selector layout bar */}
      <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">当前检查款式大卡</span>
          <p className="text-xs text-slate-500 mt-1">请在右边侧边栏快速下拉选择款号大卡进行全渠道库存核验比对：</p>
        </div>

        <select
          value={selectedStyleNo}
          onChange={(e) => setSelectedStyleNo(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-black text-slate-800 focus:outline-none min-w-[200px]"
        >
          <option value="LN-2026-CO">LN-2026-CO (精棉爬服-32元代工价)</option>
          <option value="LN-2026-BL">LN-2026-BL (睡袋防惊跳-58元代工价)</option>
          <option value="LN-2026-SO">LN-2026-SO (精编婴儿短袜-8元代工价)</option>
        </select>
      </div>

      {/* Grid: Left metadata大卡 (2/3 width) and stats (1/3 width) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Style attributes detail sheets */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3.5">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 block uppercase">{activeStyle.styleNo}</span>
              <h2 className="text-sm font-black text-slate-900 mt-1">{activeStyle.name}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-550">
              <p>基础大品类：<span className="text-slate-800 font-bold">{activeStyle.category}</span></p>
              <p>适用服发布季：<span className="text-slate-800 font-bold">{activeStyle.season}</span></p>
              <p>面料纤维配比：<span className="text-slate-600">{activeStyle.material}</span></p>
              <p>定点合作代工厂：<span className="text-slate-805 font-bold">{activeStyle.supplier}</span></p>
              <p>建议吊牌销售价格：<span className="text-slate-800 font-bold font-mono">¥{activeStyle.msrp}</span></p>
              <p>结算制造代工BOM底价：<span className="text-[#006591] font-black font-mono">¥{activeStyle.costPrice}</span></p>
            </div>
          </div>

          {/* Child SKU tabular configurations */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-black text-slate-800">该款号下属有效 SKUs 配码表 (共 {activeSkus.length} 个)</span>
              <span className="text-[10px] text-slate-450 font-mono">Synced from JuShuiTan ERP</span>
            </div>

            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9px] border-b border-slate-100">
                <tr>
                  <th className="p-4">SKU 条形编码</th>
                  <th className="p-4 font-black">配色色卡</th>
                  <th className="p-4 font-black">尺寸规格</th>
                  <th className="p-4 text-center">可售可配库存</th>
                  <th className="p-4 text-right">商定物料价</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
                {activeSkus.map(sk => (
                  <tr key={sk.sku} className="hover:bg-slate-50/20">
                    <td className="p-4 font-mono font-bold text-[#002045] select-all">{sk.sku}</td>
                    <td className="p-4 font-black text-slate-800">{sk.color}</td>
                    <td className="p-4 text-slate-500">{sk.size}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                        sk.stock === 0 ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"
                      }`}>
                        {sk.stock} 件
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-black text-[#006591]">Y{sk.cost.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Sales dynamic alerts and complaint integrations (1/3 width) */}
        <div className="space-y-6">
          
          {/* Style aggregate metrics card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <span className="text-xs font-black text-slate-800 block border-b border-slate-100 pb-3">全网综合统计</span>
            
            <div className="space-y-3 font-semibold text-[11px]">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-450">全渠道总销发：</span>
                <strong className="font-mono text-slate-900 font-black">{activeStyle.totalSales.toLocaleString()} 件</strong>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-450">物理仓可支配可用储备：</span>
                <strong className="font-mono text-[#006591] font-black">{activeStyle.totalStock.toLocaleString()} 件</strong>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-450">估计已完成GMV：</span>
                <strong className="font-mono text-slate-805 font-extrabold text-indigo-505">¥{(activeStyle.totalSales * activeStyle.msrp).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Connected customer complaints (Complementary synergy!) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 block">客服质量整改日志</span>
              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-black">
                {activeComplaints.length} 笔投诉记录
              </span>
            </div>

            {activeComplaints.length > 0 ? (
              <div className="space-y-3">
                {activeComplaints.map((c, idx) => (
                  <div key={idx} className="p-3.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-200/50 rounded-lg space-y-2 text-[10.5px]">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-rose-700">{c.store}</span>
                      <span className={`px-1 rounded text-[8.5px] font-black ${
                        c.severity === "严重" ? "bg-red-600 text-white" : "bg-rose-100 text-rose-700 font-bold"
                      }`}>{c.severity}</span>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{c.reason}</p>
                    <div className="bg-white/80 border border-slate-100 p-2 rounded text-[10px] text-slate-500 italic flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>处算：{c.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                ✓ 本款型质量评分极佳，暂无客服投诉退货记录！
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
