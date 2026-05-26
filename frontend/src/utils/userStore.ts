/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  username: string; // 登录账号
  phone: string; // 手机号
  email: string; // 邮箱，非必填
  userType: "内部员工" | "供应商";
  personType: "办公室" | "仓库" | "供应商";
  businessGroup: string;
  position: string;
  role: string;
  status: "启用" | "停用";
  lastLogin: string;
}

const STORAGE_KEY = "lenakids_users_v1";

const DEFAULT_USERS: User[] = [
  {
    id: "USER-00",
    name: "系统客服",
    username: "service",
    phone: "138-0000-0000",
    email: "service@lenakids.com",
    userType: "内部员工",
    personType: "办公室",
    businessGroup: "公关组",
    position: "客服主管",
    role: "管理员",
    status: "启用",
    lastLogin: "刚刚"
  },
  {
    id: "USER-01",
    name: "张三",
    username: "zhangsan",
    phone: "138-1234-0001",
    email: "",
    userType: "内部员工",
    personType: "办公室",
    businessGroup: "运营组",
    position: "资深运营",
    role: "运营",
    status: "启用",
    lastLogin: "10分钟前"
  },
  {
    id: "USER-02",
    name: "李四",
    username: "lisi",
    phone: "139-4321-1234",
    email: "",
    userType: "内部员工",
    personType: "仓库",
    businessGroup: "物流组",
    position: "分拣主管",
    role: "分拣员",
    status: "停用",
    lastLogin: "昨天 14:30"
  },
  {
    id: "USER-03",
    name: "王五",
    username: "wangwu",
    phone: "135-8888-8888",
    email: "",
    userType: "内部员工",
    personType: "办公室",
    businessGroup: "财务部",
    position: "结算专员",
    role: "财务",
    status: "启用",
    lastLogin: "2小时前"
  },
  {
    id: "USER-04",
    name: "赵六",
    username: "zhaoliu",
    phone: "188-5678-1122",
    email: "",
    userType: "内部员工",
    personType: "办公室",
    businessGroup: "运营组",
    position: "拼多多店长",
    role: "运营",
    status: "启用",
    lastLogin: "5分钟前"
  },
  {
    id: "USER-05",
    name: "陈七",
    username: "chenqi",
    phone: "137-0099-3344",
    email: "",
    userType: "内部员工",
    personType: "仓库",
    businessGroup: "物流组",
    position: "物料入库员",
    role: "分拣员",
    status: "启用",
    lastLogin: "3天前"
  },
  {
    id: "USER-06",
    name: "周八",
    username: "zhouba",
    phone: "159-4455-6677",
    email: "",
    userType: "内部员工",
    personType: "办公室",
    businessGroup: "设计组",
    position: "主设计师",
    role: "管理员",
    status: "启用",
    lastLogin: "1小时前"
  },
  {
    id: "USER-07",
    name: "钱九",
    username: "qianjiu",
    phone: "136-1122-3344",
    email: "",
    userType: "内部员工",
    personType: "仓库",
    businessGroup: "物流组",
    position: "出库分拣员",
    role: "分拣员",
    status: "停用",
    lastLogin: "上周"
  },
  {
    id: "USER-08",
    name: "孙十",
    username: "sunshi",
    phone: "131-7788-9900",
    email: "",
    userType: "内部员工",
    personType: "办公室",
    businessGroup: "公关组",
    position: "客服主管",
    role: "运营",
    status: "启用",
    lastLogin: "4小时前"
  },
  {
    id: "SUPP-01",
    name: "测试供应商",
    username: "gys",
    phone: "139-0000-9999",
    email: "gys@lenakids.com",
    userType: "供应商",
    personType: "供应商",
    businessGroup: "-",
    position: "官方供应商",
    role: "供应商",
    status: "启用",
    lastLogin: "刚刚"
  },
  {
    id: "SUPP-02",
    name: "杭州织锦服饰供应商",
    username: "supplier_hz",
    phone: "138-8888-8888",
    email: "",
    userType: "供应商",
    personType: "供应商",
    businessGroup: "-",
    position: "供应商管理人",
    role: "供应商",
    status: "启用",
    lastLogin: "1天前"
  }
];

export function getUsers(): User[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Searches for a user that matches the provided credential (email, phone, or username)
 * and conforms to the selected userType ("内部员工" or "供应商").
 */
export function findUserByCredential(
  credential: string,
  userType: "内部员工" | "供应商"
): User | null {
  const users = getUsers();
  const trimmed = credential.trim();
  if (!trimmed) return null;

  // Normalization for easy contact matching (ignoring hyphens and casing)
  const normVal = trimmed.toLowerCase();
  const rawPhone = normVal.replace(/-/g, "");

  return users.find((user) => {
    if (user.userType !== userType) return false;
    
    // Check match options
    const userNameMatch = user.username.toLowerCase() === normVal;
    const emailMatch = user.email && user.email.toLowerCase() === normVal;
    
    // Phone match allows both formatted (e.g., 138-1234-0001) and unformatted (e.g., 13812340001)
    const userRawPhone = user.phone.replace(/-/g, "");
    const phoneMatch = user.phone === trimmed || userRawPhone === rawPhone;

    return userNameMatch || emailMatch || phoneMatch;
  }) || null;
}
