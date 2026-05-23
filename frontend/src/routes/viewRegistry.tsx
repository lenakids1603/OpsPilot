/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import BusinessAnalysis from "../components/BusinessAnalysis";
import DepartmentTools from "../components/DepartmentTools";
import AutomationHub from "../components/AutomationHub";
import BusinessOverviewPage from "../pages/dashboard/BusinessOverviewPage";
import SalesOverviewPage from "../pages/sales/SalesOverviewPage";
import ProductListPage from "../pages/products/ProductListPage";
import FinanceOverviewPage from "../pages/finance/FinanceOverviewPage";
import CashflowPage from "../pages/finance/CashflowPage";

import {
  TodayDataView, 
  ExceptionAlertsView, 
  HeroStagnantView, 
  InventoryTurnoverView,
  ProcurementPOView, 
  LogisticsManifestView, 
  RolePermissionsView,
  StoreAnalysisView,
  ProductCatalogView
} from "../components/ERPSubmenuViews";

export function renderRegisteredView(selectedParent: string, selectedSub: string): React.ReactNode {
  // 1. WORKBENCH
  if (selectedParent === "工作台") {
    if (selectedSub === "经营概览") return <BusinessOverviewPage />;
    if (selectedSub === "异常提醒") return <ExceptionAlertsView />;
  }

  // 2. SALES AND REFUND
  if (selectedParent === "销售与退款") {
    if (selectedSub === "销售分析") return <SalesOverviewPage />;
    if (selectedSub === "退款分析") return <ExceptionAlertsView />;
  }

  // 3. PRODUCTS & INVENTORY
  if (selectedParent === "产品与库存") {
    if (selectedSub === "产品列表") return <ProductListPage />;
    if (selectedSub === "产品详情") return <HeroStagnantView />;
  }

  // 4. DESIGN & DEVELOPMENT
  if (selectedParent === "设计开发") {
    if (selectedSub === "设计方案") return <DepartmentTools />;
    if (selectedSub === "面辅料信息") return <ProductCatalogView />;
    if (selectedSub === "外来样品") return <ProcurementPOView />;
  }

  // 5. PROCUREMENT & SUPPLIES
  if (selectedParent === "采购与供应") {
    if (selectedSub === "采购总览") return <ProcurementPOView />;
    if (selectedSub === "采购成本") return <BusinessAnalysis initialDept="All" />;
    if (selectedSub === "入仓超时预警") return <ExceptionAlertsView />;
  }

  // 6. LOGISTICS FULFILLMENT
  if (selectedParent === "发货履约") {
    if (selectedSub === "发货总览") return <LogisticsManifestView />;
    if (selectedSub === "订单超时预警") return <ExceptionAlertsView />;
  }

  // 7. CUSTOMER SERVICES
  if (selectedParent === "客服售后") {
    if (selectedSub === "投诉列表") return <DepartmentTools />;
    if (selectedSub === "投诉登记") return <TodayDataView />;
  }

  // 8. FINANCIAL SYSTEM
  if (selectedParent === "财务系统") {
    if (selectedSub === "财务总览") return <FinanceOverviewPage />;
    if (selectedSub === "公司资金流水" || selectedSub === "收支流水") return <CashflowPage />;
    if (selectedSub === "供应商对账") return <InventoryTurnoverView />;
    if (selectedSub === "利润分析") return <BusinessAnalysis initialDept="All" />;
  }

  // 9. HUMAN RESOURCES
  if (selectedParent === "人力资源") {
    if (selectedSub === "员工档案") return <RolePermissionsView />;
    if (selectedSub === "薪资记录") return <BusinessAnalysis initialDept="All" />;
  }

  // 10. SYSTEM PARAMETERS
  if (selectedParent === "系统设置") {
    if (selectedSub === "员工账号") return <RolePermissionsView />;
    if (selectedSub === "职位设置") return <RolePermissionsView />;
    if (selectedSub === "权限设置") return <RolePermissionsView />;
    if (selectedSub === "操作日志") return <AutomationHub />;
  }

  // Fallback safely
  return <BusinessOverviewPage />;
}
