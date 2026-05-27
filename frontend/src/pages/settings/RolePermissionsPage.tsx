/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Info, Shield, ShieldCheck, ShieldAlert, Plus, X, 
  CheckSquare, Square, AlertTriangle, Save, RefreshCcw, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Role {
  id: string;
  name: string;
  description: string;
  isLocked: boolean;
}

// Defining permissions for 8 actions across 6 modules
type PermissionMatrix = Record<string, Record<string, boolean>>;

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([
    { id: "ROLE-01", name: "系统管理员", description: "拥有对系统所有模块的绝对控制权及全局超级网银划款划拨特权", isLocked: true },
    { id: "ROLE-02", name: "财务主管", description: "负责管理资金账户流水、核对供应商提现、登记应收账单、进销项核验", isLocked: false },
    { id: "ROLE-03", name: "供应商", description: "仅能通过供应商工作台与打样报价、查看对应的生产进程款号及账单发票", isLocked: false },
    { id: "ROLE-04", name: "仓库专员", description: "负责物流核料入退库，负责商品包装、现场质检、分提货物进程记录", isLocked: false },
    { id: "ROLE-05", name: "采购经理", description: "负责统配商品档案，对供应商进行评分排级，管理大货跟进交付时效", isLocked: false }
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("ROLE-03");

  // Initial Matrices state setup
  const [matrices, setMatrices] = useState<Record<string, PermissionMatrix>>({
    "ROLE-01": {
      "Dashboard": { "查看": true, "新增": true, "编辑": true, "删除": true, "导入": true, "导出": true, "管理账号": true },
      "资金流水": { "查看": true, "新增": true, "编辑": true, "删除": true, "导入": true, "导出": true, "管理账号": true },
      "账单核对": { "查看": true, "新增": true, "编辑": true, "删除": true, "导入": true, "导出": true, "管理账号": true },
      "商品资料": { "查看": true, "新增": true, "编辑": true, "删除": true, "导入": true, "导出": true, "管理账号": true },
      "用户管理": { "查看": true, "新增": true, "编辑": true, "删除": true, "导入": true, "导出": true, "管理账号": true },
      "供应商工作台": { "查看": true, "新增": true, "编辑": true, "删除": true, "导入": true, "导出": true, "管理账号": true }
    },
    "ROLE-02": {
      "Dashboard": { "查看": true, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": true, "管理账号": false },
      "资金流水": { "查看": true, "新增": true, "编辑": true, "删除": false, "导入": true, "导出": true, "管理账号": false },
      "账单核对": { "查看": true, "新增": true, "编辑": true, "删除": false, "导入": true, "导出": true, "管理账号": false },
      "商品资料": { "查看": true, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "用户管理": { "查看": true, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "供应商工作台": { "查看": true, "新增": false, "编辑": true, "删除": false, "导入": true, "导出": true, "管理账号": false }
    },
    "ROLE-03": {
      "Dashboard": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "资金流水": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "账单核对": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "商品资料": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "用户管理": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "供应商工作台": { "查看": true, "新增": false, "编辑": true, "删除": false, "导入": true, "导出": false, "管理账号": false }
    },
    "ROLE-04": {
      "Dashboard": { "查看": true, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "资金流水": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "账单核对": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "商品资料": { "查看": true, "新增": true, "编辑": true, "删除": false, "导入": true, "导出": false, "管理账号": false },
      "用户管理": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "供应商工作台": { "查看": true, "新增": false, "编辑": true, "删除": false, "导入": false, "导出": false, "管理账号": false }
    },
    "ROLE-05": {
      "Dashboard": { "查看": true, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": true, "管理账号": false },
      "资金流水": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "账单核对": { "查看 font-black": true, "查看": true, "新增": true, "编辑": true, "删除": false, "导入": false, "导出": true, "管理账号": false },
      "商品资料": { "查看": true, "新增": true, "编辑": true, "删除": true, "导入": true, "导出": true, "管理账号": false },
      "用户管理": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "供应商工作台": { "查看": true, "新增": true, "编辑": true, "删除": false, "导入": true, "导出": true, "管理账号": false }
    }
  });

  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedRole = useMemo(() => {
    return roles.find(r => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  const currentMatrix = useMemo(() => {
    return matrices[selectedRoleId] || {
      "Dashboard": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "资金流水": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "账单核对": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "商品资料": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "用户管理": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
      "供应商工作台": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false }
    };
  }, [matrices, selectedRoleId]);

  // Total chosen count inside current selected matrix
  const permissionsSelected = useMemo(() => {
    let count = 0;
    const actions: string[] = [];
    Object.keys(currentMatrix).forEach(moduleKey => {
      Object.keys(currentMatrix[moduleKey]).forEach(actionKey => {
        if (currentMatrix[moduleKey][actionKey]) {
          count++;
          if (!actions.includes(actionKey)) actions.push(actionKey);
        }
      });
    });
    return { count, actions };
  }, [currentMatrix]);

  // Handle cell toggle
  const handleToggleCell = (module: string, action: string) => {
    // Safety barrier for System admin (always full checks)
    if (selectedRoleId === "ROLE-01") {
      showToast("🔒 系统管理员的绝对核心权限禁止撤销及篡改");
      return;
    }

    // Safety barrier: "供应商" role can never access corporate-private modules at all
    if (selectedRoleId === "ROLE-03" && module !== "供应商工作台") {
      showToast("⚠️ 内部机密信息私有，不可向供应商公开！已受强制规则阻断");
      return;
    }

    setMatrices(prev => {
      const uMatrix = { ...prev[selectedRoleId] };
      const uRow = { ...uMatrix[module] };
      uRow[action] = !uRow[action];
      uMatrix[module] = uRow;
      return {
        ...prev,
        [selectedRoleId]: uMatrix
      };
    });
  };

  // Add fresh custom role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    const nextRoleId = `ROLE-${String(roles.length + 1).padStart(2, "0")}`;
    const newRoleObj: Role = {
      id: nextRoleId,
      name: newRoleName,
      description: newRoleDesc || "自定义创建的办公、审批或外接操作员角色配置",
      isLocked: false
    };

    setRoles(prev => [...prev, newRoleObj]);
    setMatrices(prev => ({
      ...prev,
      [nextRoleId]: {
        "Dashboard": { "查看": true, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
        "资金流水": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
        "账单核对": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
        "商品资料": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
        "用户管理": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false },
        "供应商工作台": { "查看": false, "新增": false, "编辑": false, "删除": false, "导入": false, "导出": false, "管理账号": false }
      }
    }));

    setSelectedRoleId(nextRoleId);
    setNewRoleName("");
    setNewRoleDesc("");
    setAddRoleOpen(false);
    showToast(`✨ 成功创建角色 [${newRoleName}]，可立即在矩阵中配置权限！`);
  };

  const handleSaveConfig = () => {
    showToast(`💾 角色 [${selectedRole.name}] 权限配置成功保存！即刻对所绑定账号生效。`);
  };

  const handleCancelConfig = () => {
    showToast("🔄 更改已取消，已重新拉取数据库储存的权限对照矩阵");
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Toast popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-5 z-[500] p-4 bg-slate-900 text-white font-bold rounded-xl border border-slate-750 shadow-2xl flex items-center gap-2"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-sky-450" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blue Informational policy banner */}
      <div className="bg-sky-50/70 border border-sky-150 p-4 rounded-2xl flex items-start gap-3.5 text-sky-750 leading-relaxed max-w-7xl mx-auto select-none">
        <div className="p-2 rounded-xl bg-sky-100 text-sky-750 border border-sky-200 flex-shrink-0">
          <Info className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="font-extrabold text-[12.5px] text-sky-850">角色说明</h4>
          <p className="text-[11.5px] mt-0.5 opacity-90">
            角色仅用于控制系统的功能可见范围与操作权限。角色分配不代表组织架构中的管理职级，也不涉及流程审批关系。
          </p>
        </div>
      </div>

      {/* Main grids split */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start max-w-7xl mx-auto">
        {/* Left column: Roles selection vertical sidebar list (col-span-1) */}
        <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-50">
            <h4 className="font-black text-slate-800 text-[12px]">角色列表</h4>
            <button
              onClick={() => setAddRoleOpen(true)}
              className="p-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center cursor-pointer"
              title="添加自定义角色"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[450px]">
            {roles.map(r => {
              const isSelected = r.id === selectedRoleId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md"
                      : "bg-[#fcfdfe]/50 border-slate-100 text-slate-600 hover:bg-slate-5/50 hover:text-slate-800"
                  }`}
                >
                  <div className="space-y-0.5 leading-normal truncate pr-2.5">
                    <span className="text-[11.5px] font-bold block">{r.name}</span>
                    <span className={`text-[9px] block truncate ${isSelected ? "text-indigo-200" : "text-slate-400 font-sans"}`}>
                      {r.description}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    isSelected ? "text-white translate-x-0.5" : "text-slate-300 group-hover:text-slate-500"
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Permission matrix grid configuration card (col-span-3) */}
        <div className="md:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Main header row inside right card */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h4 className="font-black text-slate-800 text-[12.5px] flex items-center gap-1.5 uppercase tracking-wide">
                <Shield className="w-4.5 h-4.5 text-indigo-650" />
                {selectedRole.name} 权限矩阵
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium font-sans">配置该角色的功能访问权与数据操作细分项</p>
            </div>

            {/* Matrix action links */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCancelConfig}
                className="px-4 py-2 border border-slate-205 text-slate-650 font-bold rounded-xl bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>取消修改</span>
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-5 py-2 bg-[#002045] hover:bg-[#072449] text-white font-extrabold rounded-xl hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存配置</span>
              </button>
            </div>
          </div>

          {/* Table representation matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-600 border-collapse table-fixed min-w-[650px]">
              <thead className="bg-[#fcfdfe] text-[10.5px] border-b border-slate-100 font-bold uppercase text-slate-400 text-center">
                <tr>
                  <th className="p-4 font-extrabold pl-6 text-left w-[180px]">系统模块</th>
                  <th className="p-4 font-bold">查看</th>
                  <th className="p-4 font-bold">新增</th>
                  <th className="p-4 font-bold">编辑</th>
                  <th className="p-4 font-bold">删除</th>
                  <th className="p-4 font-bold">导入</th>
                  <th className="p-4 font-bold">导出</th>
                  <th className="p-4 font-bold pr-6">管理账号</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans tracking-wide">
                {Object.keys(currentMatrix).map((moduleName) => {
                  const isBlockedRow = selectedRoleId === "ROLE-03" && moduleName !== "供应商工作台";
                  
                  return (
                    <tr 
                      key={moduleName} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isBlockedRow ? "bg-slate-100/30 opacity-60 text-slate-350" : ""
                      }`}
                    >
                      {/* Left Header Cell */}
                      <td className="p-4 pl-6 font-bold text-slate-800 font-sans text-[11.5px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isBlockedRow ? 'bg-slate-300' : 'bg-[#002045]'}`} />
                          <span>{moduleName}</span>
                        </div>
                      </td>

                      {/* Checkboxes parameters */}
                      {Object.keys(currentMatrix[moduleName]).map((actionName) => {
                        const isChecked = currentMatrix[moduleName][actionName];
                        
                        return (
                          <td key={actionName} className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCell(moduleName, actionName)}
                              disabled={isBlockedRow}
                              className={`p-1.5 rounded-lg border transition-all inline-flex items-center justify-center leading-none ${
                                isBlockedRow
                                  ? "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed"
                                  : isChecked
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-350"
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 flex-shrink-0" />
                              ) : (
                                <Square className="w-5 h-5 flex-shrink-0 text-slate-300" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Matrix Bottom Status Alert summary */}
          <div className="p-4 border-t border-slate-100 bg-[#f9fafc] flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
            <div className="flex items-center gap-2 text-slate-500 font-sans font-medium">
              <span>已选权限:</span>
              <span className="text-slate-800 font-black">{permissionsSelected.count}项功能操作</span>
              {permissionsSelected.actions.slice(0, 3).map((a, idx) => (
                <span key={idx} className="bg-slate-200 text-slate-650 px-1.5 py-0.2 rounded text-[9.5px] font-bold border border-slate-300">
                  {a.toUpperCase()}
                </span>
              ))}
              {permissionsSelected.actions.length > 3 && (
                <span className="text-slate-400 text-[9px]">等</span>
              )}
            </div>

            {/* Locked Warning for Suppliers */}
            {selectedRoleId === "ROLE-03" ? (
              <div className="text-[#bf1e2e] font-black text-[11px] flex items-center gap-1.5 font-sans animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>内部私有模块已锁定，供应商角色无法访问</span>
              </div>
            ) : selectedRoleId === "ROLE-01" ? (
              <div className="text-emerald-700 font-bold text-[10.5px] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>系统高阶最高级安全权限在控</span>
              </div>
            ) : (
              <div className="text-slate-400 font-medium text-[10px] font-sans">
                更改后请务必点击上方 [保存配置] 按钮进行固化
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog creation modal */}
      <AnimatePresence>
        {addRoleOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-end p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddRoleOpen(false)}
              className="absolute inset-0 bg-[#000d1e]/40 backdrop-blur-xs"
            />

            {/* Card modal body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-sm bg-white border-l border-slate-200 h-full shadow-2xl p-6 text-xs flex flex-col justify-between"
            >
              <div className="pb-1 border-b border-slate-50">
                <h5 className="font-black text-slate-800 text-[13.5px]">增加自定义业务角色</h5>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">创建具有颗粒度系统操作的专属功能角色</p>
              </div>

              <form onSubmit={handleCreateRole} className="space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-505 block">角色名称 <span className="text-rose-550">*</span></span>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="请输入角色简称，例如: 资深财务助理"
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-400 outline-none rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-505 block">角色功能概述</span>
                  <textarea
                    rows={2}
                    placeholder="输入该授权或工作岗位描述..."
                    value={newRoleDesc}
                    onChange={e => setNewRoleDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-400 outline-none rounded-xl text-[10.5px]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 font-bold">
                  <button
                    type="button"
                    onClick={() => setAddRoleOpen(false)}
                    className="px-4 py-1.8 text-slate-500 hover:text-slate-705 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl leading-none cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.8 bg-[#002045] text-white hover:bg-[#062447] rounded-xl leading-none transition-colors shadow-xs cursor-pointer"
                  >
                    确认创建
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
