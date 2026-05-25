/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Layers, Search, Filter, Plus, FileText, Image, Upload, Check, 
  Sparkles, Sliders, Settings, Award, ArrowUpRight, ChevronRight, X, RefreshCw
} from "lucide-react";
import { AnimatePresence } from "motion/react";

interface ProductModel {
  styleNo: string;
  name: string;
  category: string;
  season: string; // e.g. "2026夏款", "2026秋款"
  msrp: number;
  costPrice: number;
  coreSupplier: string;
  totalStock: number;
  salesVolume: number;
}

interface ProductProfilesPageProps {
  defaultTab?: "list" | "img-search";
}

export default function ProductProfilesPage({ defaultTab = "list" }: ProductProfilesPageProps) {
  const [activeTab, setActiveTab] = useState<"list" | "img-search">(defaultTab);
  const [query, setQuery] = useState("");

  const [products, setProducts] = useState<ProductModel[]>([
    { styleNo: "LN-2026-CO", name: "Lenakids 臻选精梳棉连体爬服 (夏末透气款)", category: "爬服两用衫", season: "2026春夏", msrp: 129, costPrice: 32, coreSupplier: "海安莱那织造有限公司", totalStock: 840, salesVolume: 2400 },
    { styleNo: "LN-2026-BL", name: "精装防惊跳有机四季舒适睡袋", category: "婴儿防踢被", season: "2026四季", msrp: 248, costPrice: 58, coreSupplier: "温岭市依依童装制品厂", totalStock: 120, salesVolume: 1530 },
    { styleNo: "LN-2026-SO", name: "防勒松口精梳棉新生儿短口袜 3 双装", category: "婴童鞋袜", season: "2026春夏", msrp: 49, costPrice: 8, coreSupplier: "常熟汇豪针织加工商行", totalStock: 1540, salesVolume: 3890 },
    { styleNo: "LN-2026-BA", name: "竹纤维空气褶皱超软两用睡抱被", category: "抱被巾饰", season: "2026秋冬", msrp: 188, costPrice: 41, coreSupplier: "常熟汇豪针织加工商行", totalStock: 45, salesVolume: 120 },
    { styleNo: "LN-2026-SU", name: "莫代尔婴儿夏季排凉超轻空调服(分色)", category: "空调睡衣", season: "2026春夏", msrp: 158, costPrice: 36, coreSupplier: "海安莱那织造有限公司", totalStock: 920, salesVolume: 3500 },
  ]);

  // Drawer creator state
  const [isOpen, setIsOpen] = useState(false);
  
  // Form elements
  const [formStyleNo, setFormStyleNo] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("爬服两用衫");
  const [formSeason, setFormSeason] = useState("2026春夏");
  const [formMSRP, setFormMSRP] = useState(0);
  const [formCost, setFormCost] = useState(0);
  const [formSupplier, setFormSupplier] = useState("海安莱那织造有限公司");

  // Image search upload state simulator
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [simulatedMatches, setSimulatedMatches] = useState<ProductModel[]>([]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleCreateProductModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStyleNo || !formName) return;

    const newProd: ProductModel = {
      styleNo: formStyleNo,
      name: formName,
      category: formCategory,
      season: formSeason,
      msrp: Number(formMSRP),
      costPrice: Number(formCost),
      coreSupplier: formSupplier,
      totalStock: 0,
      salesVolume: 0
    };

    setProducts(prev => [newProd, ...prev]);
    setIsOpen(false);
    alert(`🟢 新建款号款型 [${formStyleNo}] 档案成功！档案已下探推送分发到各大抖音后台仓库。`);
  };

  // Simulated image uploading search match
  const handleSimulateImageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    setImageUrl(URL.createObjectURL(e.target.files[0]));
    setSimulatedMatches([]);

    setTimeout(() => {
      setUploadingImage(false);
      // Give simulated best match and other similarity matches
      setSimulatedMatches([
        products[0], // best match
        products[4]  // similar match
      ]);
    }, 1500);
  };

  const filteredProducts = products.filter(p => {
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.styleNo.toLowerCase().includes(q) || p.coreSupplier.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Top action section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-955 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#006591]" />
            商品款式设计底卡档案
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            涵盖 3-14 岁女童产品版型款号、核定造价底限、面辅料指定配置，规范后续采购 PO 起算基准。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormStyleNo(`LN-2026-N${Math.floor(Math.random() * 90 + 10)}`);
              setFormName("");
              setIsOpen(true);
            }}
            className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>建立款号底卡</span>
          </button>
        </div>
      </div>

      {/* Tabs segment */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === "list" 
              ? "border-[#006591] text-[#006591]" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          款型底卡花名册
        </button>
        <button
          onClick={() => setActiveTab("img-search")}
          className={`flex items-center gap-1.5 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === "img-search" 
              ? "border-[#006591] text-[#006591]" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Image className="w-4 h-4" />
          <span>图片搜索匹配 (Similarity Search)</span>
        </button>
      </div>

      {/* TAB 1: 款型底卡列表 */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="键入企划款号 (LN-*)、主打款名、战略代工厂商检索款号..."
                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <button className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-150 cursor-pointer">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#f8f9ff] text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 select-none">
                <tr>
                  <th className="p-4">企划款号</th>
                  <th className="p-4">款型全称</th>
                  <th className="p-4">服饰品类</th>
                  <th className="p-4">本季批次</th>
                  <th className="p-4 text-right">建议零售价</th>
                  <th className="p-4 text-right">核定代工单价</th>
                  <th className="p-4">指定核心代工厂</th>
                  <th className="p-4 text-center">综合累销量</th>
                  <th className="p-4 text-center">可控仓储可用数</th>
                  <th className="p-4 text-right">详情</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
                {filteredProducts.map(p => (
                  <tr key={p.styleNo} className="hover:bg-slate-50/20">
                    <td className="p-4 font-mono font-bold text-slate-900 text-[11.5px]">{p.styleNo}</td>
                    <td className="p-4 font-black text-slate-805">{p.name}</td>
                    <td className="p-4">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9.5px] font-bold text-slate-500">{p.category}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-500">{p.season}</td>
                    <td className="p-4 text-right font-mono text-slate-700">¥{p.msrp}</td>
                    <td className="p-4 text-right font-mono font-black text-[#006591]">¥{p.costPrice}</td>
                    <td className="p-4 font-black text-slate-700">{p.coreSupplier}</td>
                    <td className="p-4 text-center font-mono font-bold text-slate-450">{p.salesVolume.toLocaleString()} 件</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                        p.totalStock < 100 ? "bg-red-50 text-red-655" : "bg-sky-50 text-sky-655"
                      }`}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="p-4 text-right select-none">
                      <button 
                        onClick={() => alert(`功能开发：正在跳转到 ${p.styleNo} 款号详情大卡看板。`)}
                        className="text-[#006591] hover:text-[#004c6e] cursor-pointer"
                      >
                        详情大卡
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: 图片搜索入口 */}
      {activeTab === "img-search" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* File drag upload zone */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-800">
              🖼️ 样品花版相似度匹配 (AI Vector Image Matcher)
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              支持上传 3-14 岁女装连衣裙、爬服实拍照或图稿。系统全字库秒级计算相似比例，自动筛出雷同款或已有款号底卡。
            </p>

            <div className="border-2 border-dashed border-slate-200 hover:border-[#006591] transition-all rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleSimulateImageSearch}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              {imageUrl ? (
                <div className="space-y-3">
                  <img src={imageUrl} className="w-24 h-24 object-cover rounded-md mx-auto border" />
                  <p className="text-[10.5px] text-slate-600 font-bold">样品照片已接收</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-8 h-8 text-slate-350 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">拖拽、选择或者通过拼图复制极速上传样品</p>
                  <p className="text-[10px] text-slate-400">大白底高清无噪拍摄质效最佳</p>
                </div>
              )}
            </div>

            {uploadingImage && (
              <div className="flex items-center justify-center gap-2 p-3 bg-sky-50 rounded-lg text-xs text-[#006591] font-bold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>向量化图片比对中 (比算比拟)...</span>
              </div>
            )}
          </div>

          {/* SIMULATED SIMILAR RESULTS */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-3 block">
              📊 图像向量检索匹配相似模型 (2个推荐)
            </h3>

            {simulatedMatches.length > 0 ? (
              <div className="space-y-3">
                {simulatedMatches.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 border border-slate-200 hover:border-[#006591] rounded-lg cursor-pointer transition-all flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-black text-slate-800">{m.styleNo}</strong>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase">
                          {idx === 0 ? "比心度 97% 基准" : "相似度 82% 比照"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-medium">{m.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                暂无图像数据，请在左侧框槽内上传照片预览...
              </div>
            )}
          </div>

        </div>
      )}

      {/* Product build drawer form */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[80]" />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-205">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black text-slate-800">➕ 登记新童装款款号底卡</span>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-450"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateProductModel} className="flex-grow p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">企划指定款号 *</label>
                  <input type="text" required value={formStyleNo} onChange={e => setFormStyleNo(e.target.value)} placeholder="例如: LN-2026-N12" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold uppercase" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">商品款全称 *</label>
                  <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} placeholder="极清莫代尔排汗吊带款睡衣裙" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5">服装大类</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700">
                      <option value="爬服两用衫">细针织爬服</option>
                      <option value="婴儿防踢被">防漏防踢抱睡被</option>
                      <option value="空调睡衣">莫代尔超轻空调</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5">适用发布季</label>
                    <input type="text" value={formSeason} onChange={e => setFormSeason(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5">核定零售一口价 (元)</label>
                    <input type="number" value={formMSRP} onChange={e => setFormMSRP(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5">协议代工制造底价 (元)</label>
                    <input type="number" value={formCost} onChange={e => setFormCost(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold text-[#006591]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5">生产主力合作代工厂</label>
                  <select value={formSupplier} onChange={e => setFormSupplier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700">
                    <option value="海安莱那织造有限公司">海安莱那织造有限公司 (精棉专供)</option>
                    <option value="温岭市依依童装制品厂">温岭市依依童装制品厂 (睡袋抱被)</option>
                    <option value="常熟汇豪针织加工商行">常熟汇豪针织加工商行 (空调莫代尔)</option>
                  </select>
                </div>
                <div className="pt-6 font-semibold flex gap-2">
                  <button type="submit" className="flex-grow py-2.5 bg-[#006591] text-white text-xs font-bold rounded-lg cursor-pointer">录入款号库</button>
                  <button type="button" onClick={() => setIsOpen(false)} className="py-2.5 px-4 border border-slate-200 text-slate-655 text-xs font-bold rounded-lg">取消</button>
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
