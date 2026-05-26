/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, Wallet, Users, Boxes, Headphones, Database, Settings
} from "lucide-react";

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  submenus: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["经营首页"]
  },
  {
    title: "财务系统",
    icon: <Wallet className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["财务总览", "公司资金流水", "到货核对中心", "供应商账单核对", "票务管理", "个体户账户管理", "额度预警"]
  },
  {
    title: "供应商系统",
    icon: <Users className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["供应商总览", "供应商档案", "采购超时预警"]
  },
  {
    title: "商品系统",
    icon: <Boxes className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["商品档案", "SKU 管理", "商品详情", "图片搜索入口"]
  },
  {
    title: "客服 / 售后",
    icon: <Headphones className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["商品投诉登记", "异常退款商品", "质量问题分析"]
  },
  {
    title: "数据中心",
    icon: <Database className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["数据导入", "导入记录", "数据异常记录"]
  },
  {
    title: "系统设置",
    icon: <Settings className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["用户管理", "供应商账号管理", "角色权限配置"]
  }
];
