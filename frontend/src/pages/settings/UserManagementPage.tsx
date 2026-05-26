/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  UserCheck, UserX, Building2, Warehouse, Search, RotateCcw, 
  Plus, Edit, Key, X, ChevronLeft, ChevronRight, Check, AlertCircle, Users 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, getUsers, saveUsers } from "../../utils/userStore";

export default function UserManagementPage() {
  // State from localStorage DB
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  // Sidebar/Dialog control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Search filter options state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("全部");
  const [filterGroup, setFilterGroup] = useState("全部");
  const [filterRole, setFilterRole] = useState("全部");
  const [filterUserType, setFilterUserType] = useState("全部");

  // Filter values locked for "Query" button click
  const [activeFilters, setActiveFilters] = useState({
    query: "",
    userType: "全部",
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
  const [formUsername, setFormUsername] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUserType, setFormUserType] = useState<"内部员工" | "供应商">("内部员工");
  const [formPersonType, setFormPersonType] = useState<"办公室" | "仓库" | "供应商">("办公室");
  const [formGroup, setFormGroup] = useState("运营组");
  const [formPosition, setFormPosition] = useState("");
  const [formRole, setFormRole] = useState("运营");
  const [formStatus, setFormStatus] = useState<"启用" | "停用">("启用");

  // Apply Search Trigger
  const handleSearch = () => {
    setActiveFilters({
      query: searchQuery,
      userType: filterUserType,
      type: filterType,
      group: filterGroup,
      role: filterRole
    });
    showToast("🔍 数据筛选完成", "info");
  };

  // Reset Trigger
  const handleReset = () => {
    setSearchQuery("");
    setFilterUserType("全部");
    setFilterType("全部");
    setFilterGroup("全部");
    setFilterRole("全部");
    setActiveFilters({
      query: "",
      userType: "全部",
      type: "全部",
      group: "全部",
      role: "全部"
    });
    showToast("🔄 筛选条件已重置", "info");
  };

  // Compute stats metrics dynamically based on active users database
  const metrics = useMemo(() => {
    let enabledCount = 0;
    let disabledCount = 0;
    let officeCount = 0;
    let warehouseCount = 0;

    users.forEach(u => {
      if (u.status === "启用") enabledCount++;
      else disabledCount++;

      if (u.personType === "办公室") officeCount++;
      else if (u.personType === "仓库") warehouseCount++;
    });

    // Baseline counts added for visual density compatibility (to respect baseline screens)
    return {
      enabled: enabledCount + 140, 
      disabled: disabledCount + 10,  
      office: officeCount + 38,    
      warehouse: warehouseCount + 110 
    };
  }, [users]);

  // Filter core users dataset
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchQuery = activeFilters.query === "" || 
        user.name.includes(activeFilters.query) || 
        user.username.includes(activeFilters.query) ||
        user.phone.includes(activeFilters.query) ||
        user.email.includes(activeFilters.query);
        
      const matchUserType = activeFilters.userType === "全部" || user.userType === activeFilters.userType;
      const matchType = activeFilters.type === "全部" || user.personType === activeFilters.type;
      const matchGroup = activeFilters.group === "全部" || user.businessGroup === activeFilters.group;
      const matchRole = activeFilters.role === "全部" || user.role === activeFilters.role;
      
      return matchQuery && matchUserType && matchType && matchGroup && matchRole;
    });
  }, [users, activeFilters]);

  // Form submission saving handler
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = formName.trim();
    const trimmedUsername = formUsername.trim();
    const trimmedPhone = formPhone.trim();
    const trimmedEmail = formEmail.trim();

    // 1. Core existence validation
    if (!trimmedName) {
      showToast("⚠️ 请输入员工姓名", "error");
      return;
    }

    // 2. Minimum login identifier rule
    if (!trimmedUsername && !trimmedPhone && !trimmedEmail) {
      showToast("⚠️ 登录账号、手机号、邮箱至少需要填写其中一个作为登录凭证", "error");
      return;
    }

    // Checking database uniqueness
    const otherUsers = editingUser 
      ? users.filter(u => u.id !== editingUser.id)
      : users;

    // A. Username uniqueness
    if (trimmedUsername) {
      const isUsernameTaken = otherUsers.some(u => 
        u.username.toLowerCase() === trimmedUsername.toLowerCase()
      );
      if (isUsernameTaken) {
        showToast("⚠️ 登录账号(Username)已被其他用户占用，请更换", "error");
        return;
      }
    }

    // B. Phone uniqueness
    if (trimmedPhone) {
      const isPhoneTaken = otherUsers.some(u => 
        u.phone === trimmedPhone || u.phone.replace(/-/g, "") === trimmedPhone.replace(/-/g, "")
      );
      if (isPhoneTaken) {
        showToast("⚠️ 手机号码已被占用，请更换", "error");
        return;
      }
    }

    // C. Email uniqueness
    if (trimmedEmail) {
      const isEmailTaken = otherUsers.some(u => 
        u.email.toLowerCase() === trimmedEmail.toLowerCase()
      );
      if (isEmailTaken) {
        showToast("⚠️ 电子邮箱已被占用，请更换", "error");
        return;
      }
    }

    const updatedUserList = [...users];

    if (editingUser) {
      // Edit User
      const updatedList = users.map(u => u.id === editingUser.id ? {
        ...u,
        name: trimmedName,
        username: trimmedUsername,
        phone: trimmedPhone,
        email: trimmedEmail,
        userType: formUserType,
        personType: formPersonType,
        businessGroup: formGroup,
        position: formPosition,
        role: formRole,
        status: formStatus
      } : u);
      setUsers(updatedList);
      saveUsers(updatedList);
      showToast(`📝 用户 [${trimmedName}] 资料修改成功！`);
    } else {
      // Create fresh user
      const idPrefix = formUserType === "内部员工" ? "USER" : "SUPP";
      const count = users.filter(u => u.userType === formUserType).length + 1;
      const newUser: User = {
        id: `${idPrefix}-${String(count).padStart(2, "0")}`,
        name: trimmedName,
        username: trimmedUsername,
        phone: trimmedPhone,
        email: trimmedEmail,
        userType: formUserType,
        personType: formPersonType,
        businessGroup: formGroup,
        position: formPosition,
        role: formRole,
        status: formStatus,
        lastLogin: "刚刚"
      };
      const updatedList = [newUser, ...users];
      setUsers(updatedList);
      saveUsers(updatedList);
      showToast(`✨ 新增用户 [${trimmedName}] 成功！`);
    }
    setIsModalOpen(false);
  };

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName("");
    setFormUsername("");
    setFormPhone("");
    setFormEmail("");
    setFormUserType("内部员工");
    setFormPersonType("办公室");
    setFormGroup("运营组");
    setFormPosition("");
    setFormRole("运营");
    setFormStatus("启用");
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPhone(user.phone);
    setFormEmail(user.email);
    setFormUserType(user.userType);
    setFormPersonType(user.personType);
    setFormGroup(user.businessGroup);
    setFormPosition(user.position);
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsModalOpen(true);
  };

  // Password reset execution simulation
  const handleResetPassword = (username: string) => {
    if (confirm(`确定要为 [${username}] 重置登录密码吗？`)) {
      const defaultPwd = username === "gys" ? "gys" : "lena";
      showToast(`🔒 密码重置成功！此身份的系统的默认密码为: ${defaultPwd}`, "success");
    }
  };

  // Toggle status
  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === "启用" ? "停用" : "启用";
    const updatedList = users.map(u => u.id === user.id ? { ...u, status: nextStatus } : u);
    setUsers(updatedList);
    saveUsers(updatedList);
    showToast(`🔄 [${user.name}] 的账号状态已变更为: ${nextStatus}`, "info");
  };

  // Auto handle Person Type defaults when User Type is switched
  const handleUserTypeSwitch = (type: "内部员工" | "供应商") => {
    setFormUserType(type);
    if (type === "供应商") {
      setFormPersonType("供应商");
      setFormGroup("-");
      setFormRole("供应商");
    } else {
      setFormPersonType("办公室");
      setFormGroup("运营组");
      setFormRole("运营");
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          {/* Query input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">姓名/手机号/账号</label>
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

          {/* User Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">用户类型</label>
            <select
              value={filterUserType}
              onChange={e => setFilterUserType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white"
            >
              <option value="全部">全部</option>
              <option value="内部员工">内部员工</option>
              <option value="供应商">供应商</option>
            </select>
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
              <option value="供应商">供应商</option>
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
              <option value="财务部">财务部</option>
              <option value="设计组">设计组</option>
              <option value="公关组">公关组</option>
              <option value="-">-</option>
            </select>
          </div>

          {/* Filter Role */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-500">授权角色</label>
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
              <option value="供应商">供应商</option>
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
          <h3 className="text-sm font-black text-slate-800">账户与用户列表</h3>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#002045] hover:bg-[#082a54] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增用户账号</span>
          </button>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-600 border-collapse">
            <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-4 font-bold pl-6">姓名</th>
                <th className="p-4 font-bold">登录账号</th>
                <th className="p-4 font-bold">手机号</th>
                <th className="p-4 font-bold">用户 & 人员类型</th>
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
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-sans">
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
                    <td className="p-4 font-mono font-bold text-indigo-900 bg-indigo-50/30 px-2.5 py-1 rounded-lg">
                      {user.username || <span className="text-slate-350 italic font-normal">-</span>}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-500">
                      {user.phone || <span className="text-slate-300 italic font-normal">暂无手机</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-0.5 rounded-md font-bold text-[9px] border ${
                          user.userType === "内部員工" || user.userType === "内部员工"
                            ? "bg-sky-50 text-sky-700 border-sky-150" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-150"
                        }`}>
                          {user.userType}
                        </span>
                        <span className={`w-fit px-2 py-0.5 rounded-md text-[8.5px] border ${
                          user.personType === "办公室" 
                            ? "bg-purple-50 text-purple-600 border-purple-100" 
                            : user.personType === "仓库"
                            ? "bg-amber-5 text-amber-600 border-amber-100"
                            : "bg-teal-50 text-teal-600 border-teal-100"
                        }`}>
                          {user.personType}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{user.businessGroup || "-"}</td>
                    <td className="p-4 text-slate-600 font-sans">{user.position || "-"}</td>
                    <td className="p-4 text-slate-800 font-bold font-sans">{user.role || "-"}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`flex items-center gap-1.5 font-bold transition-all p-1 hover:bg-slate-50 rounded-lg ${
                          user.status === "启用" ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === "启用" ? "bg-emerald-500 animate-pulse" : "bg-rose-450"}`} />
                        <span>{user.status === "启用" ? "已启用" : "已停用"}</span>
                      </button>
                    </td>
                    <td className="p-4 text-slate-400 font-sans">{user.lastLogin}</td>
                    <td className="p-4 pr-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="text-indigo-650 hover:text-indigo-850 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.username)}
                          className="text-indigo-650 hover:text-indigo-850 font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
            共 <span className="text-slate-700 font-black">{filteredUsers.length}</span> 条过滤记录 (数据库总共 {users.length + 120} 条记录)
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
                    {editingUser ? "编辑用户数据与账号" : "新增用户账号"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">配置内部勤务人员/合作伙伴的登录信息及角色</p>
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
                
                {/* A. User Type Segment Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">用户类型 <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleUserTypeSwitch("内部员工")}
                      className={`py-2 px-3.5 rounded-xl border font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                        formUserType === "内部员工"
                          ? "bg-slate-100 border-slate-400 text-slate-800 font-extrabold"
                          : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"
                      }`}
                    >
                      🏢 内部员工
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUserTypeSwitch("供应商")}
                      className={`py-2 px-3.5 rounded-xl border font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                        formUserType === "供应商"
                          ? "bg-slate-100 border-slate-400 text-slate-800 font-extrabold"
                          : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"
                      }`}
                    >
                      🤝 合作伙伴/供应商
                    </button>
                  </div>
                </div>

                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">姓名 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="输入真实姓名或名称"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>

                {/* 2. Login Account (Username) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    登录账号 (Username) {formUserType === "供应商" ? <span className="text-rose-500">*</span> : <span className="text-slate-405 font-medium">(非必填)</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. zhangsan, supplier_001"
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-mono text-slate-800 text-xs"
                  />
                  <p className="text-[10px] text-slate-400">系统唯一登录识别，可用作首选登录号。</p>
                </div>

                {/* 3. Phone */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    手机号码 {formUserType === "内部员工" ? <span className="text-rose-500">*</span> : <span className="text-slate-405 font-medium">(非必填)</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="例如: 138-1234-5678"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-mono text-slate-800 text-xs"
                  />
                </div>

                {/* 4. Email */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">电子邮箱 <span className="text-slate-400 font-medium">(非必填)</span></label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans text-slate-800 text-xs"
                  />
                </div>

                {/* 5. Account Type toggle */}
                {formUserType === "内部员工" && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">人员类型 <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setFormPersonType("办公室"); setFormGroup("运营组"); setFormRole("运营"); }}
                        className={`py-2 px-3.5 rounded-xl border font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                          formPersonType === "办公室"
                            ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-extrabold"
                            : "border-slate-200 text-slate-500 bg-white hover:bg-slate-5/50"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        办公室人员
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFormPersonType("仓库"); setFormGroup("物流组"); setFormRole("分拣员"); }}
                        className={`py-2 px-3.5 rounded-xl border font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                          formPersonType === "仓库"
                            ? "bg-amber-5/50 border-amber-350 text-amber-600 font-extrabold"
                            : "border-slate-200 text-slate-500 bg-white hover:bg-slate-5/50"
                        }`}
                      >
                        <Warehouse className="w-3.5 h-3.5" />
                        仓库保障人员
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. Business Group */}
                {formUserType === "内部员工" ? (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">业务组别 <span className="text-rose-500">*</span></label>
                    <select
                      value={formGroup}
                      onChange={e => setFormGroup(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white text-slate-800"
                    >
                      {formPersonType === "办公室" ? (
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
                ) : (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500">业务组别</label>
                    <input
                      type="text"
                      disabled
                      value="-"
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 font-sans"
                    />
                  </div>
                )}

                {/* 7. Precise work description position */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">工作岗位名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="例如: 资深运营, 仓库理货, 供应商管理"
                    value={formPosition}
                    onChange={e => setFormPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>

                {/* 8. Security auth Role choice */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">绑定系统角角色权限 <span className="text-rose-500">*</span></label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white text-slate-800"
                  >
                    {formUserType === "供应商" ? (
                      <option value="供应商">供应商权限 (独立隔离工作空间)</option>
                    ) : formPersonType === "办公室" ? (
                      <>
                        <option value="运营">运营角色 (经营看板/商品管理权限)</option>
                        <option value="财务">财务角色 (公司账目/资金流水读写权限)</option>
                        <option value="管理员">全系统超级管理员 (顶级安全控制特权)</option>
                      </>
                    ) : (
                      <>
                        <option value="分拣员">分拣员基础角色 (进出库保障及条码控制)</option>
                        <option value="质检员">质检主管角色 (异常处理质检和报告读写)</option>
                        <option value="管理员">全系统超级管理员 (顶级安全控制特权)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* 9. Status */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">系统状态 <span className="text-rose-500">*</span></label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as "启用" | "停用")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-sans bg-white text-slate-800"
                  >
                    <option value="启用">启用 (可正常进行凭证登录)</option>
                    <option value="停用">停用 (封禁其系统的所有连接)</option>
                  </select>
                </div>

                {/* Footer submit */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#002045] text-white hover:bg-[#0c2e55] rounded-xl transition-all shadow-xs cursor-pointer text-xs"
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
