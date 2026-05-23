/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, TrendingUp, Boxes, Palette, ShoppingCart, Truck, Headphones, Percent, Users, Settings 
} from "lucide-react";

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  submenus: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "工作台",
    icon: <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["经营概览", "异常提醒"]
  },
  {
    title: "销售与退款",
    icon: <TrendingUp className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["销售分析", "退款分析"]
  },
  {
    title: "产品与库存",
    icon: <Boxes className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["产品列表", "产品详情"]
  },
  {
    title: "设计开发",
    icon: <Palette className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["设计方案", "面辅料信息", "外来样品"]
  },
  {
    title: "采购与供应",
    icon: <ShoppingCart className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["采购总览", "采购成本", "入仓超时预警"]
  },
  {
    title: "发货履约",
    icon: <Truck className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["发货总览", "订单超时预警"]
  },
  {
    title: "客服售后",
    icon: <Headphones className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["投诉列表", "投诉登记"]
  },
  {
    title: "财务系统",
    icon: <Percent className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["财务总览", "公司资金流水", "供应商对账", "利润分析"]
  },
  {
    title: "人力资源",
    icon: <Users className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["员工档案", "薪资记录"]
  },
  {
    title: "系统设置",
    icon: <Settings className="w-4.5 h-4.5 flex-shrink-0" />,
    submenus: ["员工账号", "职位设置", "权限设置", "操作日志"]
  }
];
