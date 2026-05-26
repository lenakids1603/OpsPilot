/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  UserCheck, UserX, Building2, Warehouse, Search, RotateCcw, 
  Plus, Edit, Key, X, ChevronLeft, ChevronRight, Check, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InternalUser {
  id: string;
  name: string;
  phone: string;
  type: "办公室" | "仓库";
  group: string;
  position: string;
  role: string;
  status: "启用" | "已停用";
  lastLogin: string;
}

export default function UserManagementPage() {
  // Mock Database
  const [users, setUsers] = useState<InternalUser[]>([
    { id: "USER-01", name: "张三", phone: "138-1234-0001", type: "办公室", group: "运营组", position: "资深运营", role: "运营", status: "启用", lastLogin: "10分钟前" },
    { id: "USER-02", name: "李四", phone: "139-4321-1234", type: "仓库", group: "物流组", position: "分拣主管", role: "分拣员", status: "已停用", lastLogin: "昨天 14:30" },
    { id: "USER-03", name: "王五", phone: "135-8888-8888", type: "办公室", group: "财务部", position: "结算专员", role: "财务", status: "启用", lastLogin: "2小时前" },
    { id: "USER-04", name: "赵六", phone: "188-5678-1122", type: "办公室", group: "运营组", position: "拼多多店长", role: "运营", status: "启用", lastLogin: "5分钟前" },
    { id: "USER-05", name: "陈七", phone: "137-0099-3344", type: "仓库", group: "物流组", position: "物料入库员", role: "分拣员", status: "启用", lastLogin: "3天前" },
    { id: "USER-06", name: "周八", phone: "159-4455-6677", type: "办公室", group: "设计组", position: "主设计师", role: "管理员", status: "启用", lastLogin: "1小时前" },
    { id: "USER-07", name: "钱九", phone: "136-1122-3344", type: "仓库", group: "物流组", position: "出库分拣员", role: "分拣员", status: "已停用", lastLogin: "上周" },
    { id: "USER-08", name: "孙十", phone: "131-7788-9900", type: "办公室", group: "公关组", position: "客服主管", role: "运营", status: "启用", lastLogin: "4小时前" }
  ]);

  // Sidebar/Dialog control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);

  // Search filter options state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("全部");
  const [filterGroup, setFilterGroup] = useState("全部");
  const [filterRole, setFilterRole] = useState("全部");

  // Filter values locked for "Query" button click
  const [activeFilters, setActiveFilters] = useState({
    query: "",
    type: "全部",
    group: "全部",
    role: "全部"
  });

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formType, setFormType] = useState<"办公室" | "仓库">("办公室");
  const [formGroup, setFormGroup] = useState("运营组");
  const [formPosition, setFormPosition] = useState("");
  const [formRole, setFormRole] = useState("运营");

  // Apply Search Trigger
  const handleSearch = () => {
    setActiveFilters({
      query: searchQuery,
      type: filterType,
      group: filterGroup,
      role: filterRole
    });
    showToast("🔍 数据筛选完成", "info");
  };

  // Reset Trigger
  const handleReset = () => {
    setSearchQuery("");
    setFilterType("全部");
    setFilterGroup("全部");
    setFilterRole("全部");
    setActiveFilters({
      query: "",
      type: "全部",
      group: "全部",
      role: "全部"
    });
    showToast("🔄 筛选条件已重置", "info");
  };

  // Compute stats metrics dynamically
  const metrics = useMemo(() => {
    let enabledCount = 0;
    let disabledCount = 0;
    let officeCount = 0;
    let warehouseCount = 0;

    users.forEach(u => {
      if (u.status === "启用") enabledCount++;
      else disabledCount++;

      if (u.type === "办公室") officeCount++;
      else warehouseCount++;
    });

    // Provide higher baseline counts matching custom screenshot values
    return {
      enabled: enabledCount + 150, 
      disabled: disabledCount + 10,  
      office: officeCount + 40,    
      warehouse: warehouseCount + 115 
    };
  }, [users]);

  // Filter core users dataset
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchQuery = activeFilters.query === "" || 
        user.name.includes(activeFilters.query) || 
        user.phone.includes(activeFilters.query);
      const matchType = activeFilters.type === "全部" || user.type === activeFilters.type;
      const matchGroup = activeFilters.group === "全部" || user.group === activeFilters.group;
      const matchRole = activeFilters.role === "全部" || user.role === activeFilters.role;
      return matchQuery && matchType && matchGroup && matchRole;
    });
  }, [users, activeFilters]);

  // Form submission saving handler
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formPosition) {
      showToast("⚠️ 请完备必填表单字段", "error");
      return;
    }

    if (editingUser) {
      // Edit User
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: formName,
        phone: formPhone,
        type: formType,
        group: formGroup,
        position: formPosition,
        role: formRole
      } : u));
      showToast(`📝 用户 [${formName}] 数据更新成功！`);
    } else {
      // Create fresh user
      const newUser: InternalUser = {
        id: `USER-${String(users.length + 1).padStart(2, "0")}`,
        name: formName,
        phone: formPhone,
        type: formType,
        group: formGroup,
        position: formPosition,
        role: formRole,
        status: "启用",
        lastLogin: "刚刚"
      };
      setUsers(prev => [newUser, ...prev]);
      showToast(`✨ 新增内部用户 [${formName}] 成功！`);
    }
    setIsModalOpen(false);
  };

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName("");
    setFormPhone("");
    setFormType("办公室");
    setFormGroup("运营组");
    setFormPosition("");
    setFormRole("运营");
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (user: InternalUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormPhone(user.phone);
    setFormType(user.type);
    setFormGroup(user.group);
    setFormPosition(user.position);
    setFormRole(user.role);
    setIsModalOpen(true);
  };

  // Password reset execution simulation
  const handleResetPassword = (username: string) => {
    if (confirm(`确定要为 [${username}] 重置登录密码吗？`)) {
      showToast(`🔒 密码重置成功！默认密码重置为: LN${Math.floor(100000 + Math.random() * 900000)}`, "success");
    }
  };

  // Toggle state
  const handleToggleStatus = (user: InternalUser) => {
    const nextStatus = user.status === "启用" ? "已停用" : "启用";
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    showToast(`🔄 [${user.name}] 的账号状态已变更为: ${nextStatus}`, "info");
  };

  return (
    <div className="space-y-6">
      {/* Toast popup alerts feedback in top-right */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[999] p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-100 bg-white"
          >
            <div className={`p-1.5 rounded-lg ${toast.type === "success" ? "bg-emerald-100 text-emerald-700" : toast.type === "error" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"}`}>
              {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </div>
            <p className="text-[12px] font-bold text-slate-800 tracking-wide">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top statistics overview card grids */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-bold">已启用账号</span>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{metrics.enabled}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-bold">停用账号</span>
            <p className="text-3xl font-black text-rose-600 tracking-tight">{metrics.disabled}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-bold">办公室账号</span>
            <p className="text-3xl font-black text-amber-600 tracking-tight">{metrics.office}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-bold">仓库账号</span>
            <p className="text-3xl font-black text-slate-700 tracking-tight">{metrics.warehouse}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and control form block */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Query input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">姓名/手机号</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="输入关键字搜索"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

          {/* Personnel type selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">人员类型</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white"
            >
              <option value="全部">全部</option>
              <option value="办公室">办公室</option>
              <option value="仓库">仓库</option>
            </select>
          </div>

          {/* Business Group */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">业务组</label>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white"
            >
              <option value="全部">全部</option>
              <option value="运营组">运营组</option>
              <option value="物流组">物流组</option>
              <option value="财务部">财务部 / 组</option>
              <option value="设计组">设计组</option>
            </select>
          </div>

          {/* Filter Role */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">角色</label>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white"
            >
              <option value="全部">全部</option>
              <option value="运营">运营</option>
              <option value="分拣员">分拣员</option>
              <option value="财务">财务</option>
              <option value="管理员">管理员</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3.5 pt-1 text-xs">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-650 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-[#002045] hover:bg-[#082a54] text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>查询</span>
          </button>
        </div>
      </div>

      {/* Main Account Data Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800">内部用户列表</h3>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#002045] hover:bg-[#082a54] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增内部用户</span>
          </button>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-600 border-collapse">
            <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-4 font-bold pl-6">姓名</th>
                <th className="p-4 font-bold">手机号</th>
                <th className="p-4 font-bold">人员类型</th>
                <th className="p-4 font-bold">业务组</th>
                <th className="p-4 font-bold">工作岗位</th>
                <th className="p-4 font-bold">赋权角色</th>
                <th className="p-4 font-bold">系统状态</th>
                <th className="p-4 font-bold">最近登录</th>
                <th className="p-4 font-bold pr-6 text-center">系统操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] font-medium leading-relaxed">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-sans">
                    没有匹配的用户记录
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 font-black text-[#002045] border border-indigo-100/50 flex items-center justify-center text-[10px] select-none">
                        {user.name.slice(0, 2)}
                      </div>
                      <span className="font-bold text-slate-800 text-[12px]">{user.name}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-500">{user.phone}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] border ${
                        user.type === "办公室" 
                          ? "bg-indigo-50/60 text-indigo-700 border-indigo-100" 
                          : "bg-amber-5/50 text-amber-600 border-amber-100"
                      }`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">{user.group}</td>
                    <td className="p-4 text-slate-600 font-sans">{user.position}</td>
                    <td className="p-4 text-slate-800 font-bold font-sans">{user.role}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`flex items-center gap-1.5 font-bold transition-all p-1 hover:bg-slate-50 rounded-lg ${
                          user.status === "启用" ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === "启用" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                        <span>{user.status}</span>
                      </button>
                    </td>
                    <td className="p-4 text-slate-400 font-sans">{user.lastLogin}</td>
                    <td className="p-4 pr-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.name)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Key className="w-3 h-3" />
                          <span>重置密码</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls layout */}
        <div className="p-4 border-t border-slate-50 bg-[#fafbfe] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <span className="text-slate-400 font-sans">
            共 <span className="text-slate-700 font-black">{filteredUsers.length}</span> 条过滤记录 (数据库总共 168 条记录)
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 px-3 border border-slate-200 rounded-lg text-[11px] bg-white text-slate-400 hover:bg-slate-50 transition-colors font-bold flex items-center gap-0.5">
              <ChevronLeft className="w-3 h-3" />
              上一页
            </button>
            <button className="w-7 h-7 bg-[#002045] font-bold text-white rounded-lg flex items-center justify-center text-[11px]">
              1
            </button>
            <button className="w-7 h-7 bg-white font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center text-[11px]">
              2
            </button>
            <button className="w-7 h-7 bg-white font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center text-[11px]">
              3
            </button>
            <button className="p-1 px-3 border border-slate-200 rounded-lg text-[11px] bg-white text-slate-500 hover:bg-slate-50 transition-colors font-bold flex items-center gap-0.5">
              下一页
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over dialogue sidebar drawer for adding or editing account entries */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-end p-4 text-xs font-sans">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            {/* Panel box */}
            <motion.div
              initial={{ x: "100%", opacity: 0.95 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-full max-h-[90vh]"
            >
              {/* Head */}
              <div className="p-5 border-b border-slate-100 bg-[#fafbfe] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 text-[13.5px]">
                    {editingUser ? "编辑内务人员账号" : "新增内务人员账号"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">配置内部办公室或仓库的操作细节</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 px-1 text-slate-400 hover:text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg leading-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSaveUser} className="p-6 space-y-4 flex-1 overflow-y-auto">
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">员工姓名 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="输入员工真实姓名"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>

                {/* 2. Phone */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">手机号码 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="输入或绑定11位移动电话"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-mono text-slate-800"
                  />
                </div>

                {/* 3. Account Type toggle */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">人员类型 <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => { setFormType("办公室"); setFormGroup("运营组"); setFormRole("运营"); }}
                      className={`py-2 px-3.5 rounded-xl border font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                        formType === "办公室"
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-extrabold"
                          : "border-slate-200 text-slate-500 bg-white hover:bg-slate-5/50"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      办公室勤务
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormType("仓库"); setFormGroup("物流组"); setFormRole("分拣员"); }}
                      className={`py-2 px-3.5 rounded-xl border font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                        formType === "仓库"
                          ? "bg-amber-5/50 border-amber-300 text-amber-600 font-extrabold"
                          : "border-slate-200 text-slate-500 bg-white hover:bg-slate-5/50"
                      }`}
                    >
                      <Warehouse className="w-3.5 h-3.5" />
                      仓储配送勤务
                    </button>
                  </div>
                </div>

                {/* 4. Business Group */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">系统组别 <span className="text-rose-500">*</span></label>
                  <select
                    value={formGroup}
                    onChange={e => setFormGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white text-slate-800"
                  >
                    {formType === "办公室" ? (
                      <>
                        <option value="运营组">运营组</option>
                        <option value="财务部">财务部</option>
                        <option value="设计组">设计组</option>
                        <option value="公关组">公关组</option>
                      </>
                    ) : (
                      <>
                        <option value="物流组">物流组</option>
                        <option value="质检组">质检组</option>
                        <option value="包装中心">包装中心</option>
                      </>
                    )}
                  </select>
                </div>

                {/* 5. Precise work description position */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">具体岗位名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="例如: 拼多多核心店长, 财务出纳, 质检员"
                    value={formPosition}
                    onChange={e => setFormPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>

                {/* 6. Security auth Role choice */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">角功能角色权限绑定 <span className="text-rose-500">*</span></label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white text-slate-800"
                  >
                    {formType === "办公室" ? (
                      <>
                        <option value="运营">运营角色 (Dashboard/商品/客服可读写)</option>
                        <option value="财务">财务角色 (财务系统操作权)</option>
                        <option value="管理员">系统管理员 (全系统高阶超级特权)</option>
                      </>
                    ) : (
                      <>
                        <option value="分拣员">分拣员角色 (进出库扫码与质检特权)</option>
                        <option value="质检员">质检中心角色 (仅异常质检登记权)</option>
                        <option value="管理员">系统管理员 (全系统高阶超级特权)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Footer submit */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#002045] text-white hover:bg-[#0c2e55] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    保存提交
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
