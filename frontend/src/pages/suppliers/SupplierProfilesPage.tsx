/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Building2, Phone, Mail, FileText, CheckCircle, MapPin, 
  Trash2, Landmark, Plus, Search, Filter, HelpCircle, X
} from "lucide-react";
import { AnimatePresence } from "motion/react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  address: string;
  contactName: string;
  contactPhone: string;
  bankName: string;
  bankAccount: string;
  paymentTerm: string;
  rating: "A (极优款/低疵点)" | "B (常用款/疵点2%内)" | "C (待改良/疵点较高)";
  dueBalance: number;
  reorderCount: number;
}

export default function SupplierProfilesPage() {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "SUP-01", name: "海安莱那织造有限公司", category: "针织婴童爬服", address: "江苏省南通市海安县精梳城2区", contactName: "陈莱娜总经理", contactPhone: "135-1200-8812", bankName: "中国建设银行 海安大桥支行", bankAccount: "6217 0021 9912 8820", paymentTerm: "月结 30 天", rating: "A (极优款/低疵点)", dueBalance: 1450000, reorderCount: 42 },
    { id: "SUP-02", name: "织里丰盛婴童服饰厂", category: "梭织纯棉睡裙", address: "浙江省湖州市织里镇佳苑路88号", contactName: "朱丰盛厂长", contactPhone: "189-5721-3312", bankName: "泰隆商业银行 织里支行", bankAccount: "5719 0081 2235 9940", paymentTerm: "货到验收即付", rating: "B (常用款/疵点2%内)", dueBalance: 680000, reorderCount: 18 },
    { id: "SUP-03", name: "常熟汇豪针织加工商行", category: "莫代尔短裤/空调服", address: "江苏省常熟市服装城新天地楼", contactName: "顾汇豪老板", contactPhone: "138-0623-1122", bankName: "招商银行 常熟支行", bankAccount: "6228 1145 9934 1024", paymentTerm: "月结 60 天", rating: "A (极优款/低疵点)", dueBalance: 1250000, reorderCount: 35 },
    { id: "SUP-04", name: "绍兴市柯桥轻纺顺福商贸店", category: "纯棉空气空气抱被料", address: "浙江省绍兴市柯桥区轻纺商贸交易中心", contactName: "唐先生", contactPhone: "159-5751-2281", bankName: "中国农业银行 柯桥支行", bankAccount: "6228 4410 8821 3491", paymentTerm: "季结 90 天", rating: "C (待改良/疵点较高)", dueBalance: 250000, reorderCount: 8 },
    { id: "SUP-05", name: "温岭市依依童装制品厂", category: "婴童睡包/有机无缝套", address: "浙江省温岭市大溪镇新工业园", contactName: "李大昌生产部长", contactPhone: "136-1582-4112", bankName: "台州商业银行 温岭大溪支行", bankAccount: "6217 4411 9051 8812", paymentTerm: "现付 30% / 验收付尾款", rating: "B (常用款/疵点2%内)", dueBalance: 620000, reorderCount: 24 }
  ]);

  // Drawer states
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("针织婴童爬服");
  const [formAddress, setFormAddress] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formBank, setFormBank] = useState("");
  const [formAccount, setFormAccount] = useState("");
  const [formTerm, setFormTerm] = useState("月结 30 天");
  const [formRating, setFormRating] = useState<any>("A (极优款/低疵点)");

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormName("");
    setFormCategory("针织婴童爬服");
    setFormAddress("");
    setFormContactName("");
    setFormContactPhone("");
    setFormBank("");
    setFormAccount("");
    setFormTerm("月结 30 天");
    setFormRating("A (极优款/低疵点)");
    setIsOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormName(sup.name);
    setFormCategory(sup.category);
    setFormAddress(sup.address);
    setFormContactName(sup.contactName);
    setFormContactPhone(sup.contactPhone);
    setFormBank(sup.bankName);
    setFormAccount(sup.bankAccount);
    setFormTerm(sup.paymentTerm);
    setFormRating(sup.rating);
    setIsOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    if (editingSupplier) {
      // Edit
      setSuppliers(prev => prev.map(s => {
        if (s.id === editingSupplier.id) {
          return {
            ...s,
            name: formName,
            category: formCategory,
            address: formAddress,
            contactName: formContactName,
            contactPhone: formContactPhone,
            bankName: formBank,
            bankAccount: formAccount,
            paymentTerm: formTerm,
            rating: formRating
          };
        }
        return s;
      }));
    } else {
      // Create new
      const newSup: Supplier = {
        id: `SUP-${String(suppliers.length + 1).padStart(2, "0")}`,
        name: formName,
        category: formCategory,
        address: formAddress || "暂未填写详细厂址",
        contactName: formContactName || "暂未填写联系人",
        contactPhone: formContactPhone || "暂未填写电话",
        bankName: formBank || "暂未填写基本账户卡",
        bankAccount: formAccount || "暂未填写卡号",
        paymentTerm: formTerm,
        rating: formRating,
        dueBalance: 0,
        reorderCount: 1
      };
      setSuppliers(prev => [newSup, ...prev]);
    }
    setIsOpen(false);
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    if (confirm(`⚠️ 警告！是否确认删除供应商档案 [${name}]？该操作将导致该厂的历史返单评分脱漏。`)) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.contactName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 select-text pb-10">
      
      {/* Search and control Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/85 shadow-2xs">
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-905 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#006591]" />
            核心供应商合作档案库 (Phase 1)
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            登记代工厂资质背景、绑定结算银行账号，合并综合投诉返修并进行评级（A/B/C级），控制不合规资损。
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#006591] hover:bg-[#004c6e] hover:shadow-2xs text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>建档合作代工厂</span>
        </button>
      </div>

      {/* Filter and listings search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="按代工厂名称、主攻品类物料、指定主负责人或城市模糊匹配检索..."
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006591]"
          />
        </div>
        <button className="px-3 py-2.5 bg-slate-100 border border-slate-205 rounded-lg text-slate-500 hover:bg-slate-150 cursor-pointer">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Supplier lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map(s => (
          <div key={s.id} className="bg-white border border-slate-200 hover:border-[#006591] rounded-xl p-5 shadow-2xs space-y-4 transition-all hover:shadow-xs group">
            
            {/* Row 1: Logo and rating */}
            <div className="flex justify-between items-start">
              <div className="space-y-1 max-w-[70%]">
                <span className="text-[9.5px] font-mono font-bold text-slate-400 tracking-wider uppercase">{s.id}</span>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-[#006591] transition-colors truncate">{s.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black border ${
                s.rating.startsWith("A") ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                s.rating.startsWith("B") ? "bg-amber-50 text-amber-550 border-amber-100" : "bg-red-50 text-red-600 border-red-100"
              }`}>
                {s.rating.split(" ")[0]} 级质量评分
              </span>
            </div>

            {/* Row 2: Category and location */}
            <div className="text-[11px] font-semibold text-slate-505 space-y-2 border-t border-b border-dashed border-slate-150 py-3.5">
              <p className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>供应类目：<strong className="text-slate-800">{s.category}</strong></span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">厂房字号：{s.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>商务联系：<strong className="text-slate-700">{s.contactName}</strong> ({s.contactPhone})</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate select-all font-mono">结算卡支：{bMask(s.bankAccount)}</span>
              </p>
            </div>

            {/* Row 3: stats summary */}
            <div className="flex justify-between items-center text-[10.5px]">
              <div>
                <span className="text-slate-405 block">累计回款返单</span>
                <strong className="font-mono text-slate-800 font-extrabold">{s.reorderCount} 批次</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-405 block">本月合并可结算</span>
                <strong className="font-mono text-[#006591] font-black">¥{s.dueBalance.toLocaleString()}</strong>
              </div>
            </div>

            {/* Row 4: Action button list */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 text-[10.5px] font-black">
              <button 
                onClick={() => handleOpenEdit(s)}
                className="text-[#006591] hover:text-[#005175] cursor-pointer"
              >
                配置资质
              </button>
              <button 
                onClick={() => handleDeleteSupplier(s.id, s.name)}
                className="text-slate-400 hover:text-red-650 cursor-pointer flex items-center gap-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>废止</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Drawer layout to add / edit suppliers */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[80]"
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-200">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black text-slate-850">
                  {editingSupplier ? `📝 调整工厂资料 [${editingSupplier.name}]` : "➕ 新建代工厂合作档案"}
                </span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-150 rounded-full text-slate-450 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSupplier} className="flex-grow overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">代工企业名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="请输入完整的代工厂企业执照字号"
                    className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">主营供应品类</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                    >
                      <option value="针织婴童爬服">针织细纺爬服</option>
                      <option value="梭织纯棉睡裙">梭织四季空调抱被</option>
                      <option value="莫代尔短裤/空调服">莫代尔超轻空调套</option>
                      <option value="纯棉空气空气抱被料">坯布/精排棉线</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">工厂质量评级</label>
                    <select
                      value={formRating}
                      onChange={e => setFormRating(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                    >
                      <option value="A (极优款/低疵点)">A (极优级别/无严重投诉)</option>
                      <option value="B (常用款/疵点2%内)">B (常规质保/疵点2%内)</option>
                      <option value="C (待改良/疵点较高)">C (观察改良期/疵点较高)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">工厂详细街道地址</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    placeholder="浙江省湖州市织里镇佳苑路88号"
                    className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">厂长/驻产联系人</label>
                    <input
                      type="text"
                      value={formContactName}
                      onChange={e => setFormContactName(e.target.value)}
                      placeholder="朱厂长"
                      className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">联系常用电话</label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={e => setFormContactPhone(e.target.value)}
                      placeholder="189-xxxx-xxxx"
                      className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">代收开户银行名称</label>
                  <input
                    type="text"
                    value={formBank}
                    onChange={e => setFormBank(e.target.value)}
                    placeholder="例如：泰隆商业银行 织里支行"
                    className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">打款对账银行卡号 / 绑定支付宝号</label>
                  <input
                    type="text"
                    value={formAccount}
                    onChange={e => setFormAccount(e.target.value)}
                    placeholder="6217 **** **** ****"
                    className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-455 mb-1.5 uppercase">账单核对约定账期</label>
                  <input
                    type="text"
                    value={formTerm}
                    onChange={e => setFormTerm(e.target.value)}
                    placeholder="例如：月结30天 / 货到付款"
                    className="w-full bg-slate-50 border border-slate-202 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006591] focus:bg-white"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    存入档案
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// Utility mask
function bMask(acc: string) {
  if (!acc || acc.length < 8) return "未登记卡号";
  return acc.substring(0, 4) + " **** " + acc.substring(acc.length - 4);
}
