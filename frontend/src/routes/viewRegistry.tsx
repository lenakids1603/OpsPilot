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
import ProprietorsPage from "../pages/finance/ProprietorsPage";
import IndividualInvoicePage from "../pages/finance/IndividualInvoicePage";
import SupplierOverviewPage from "../pages/suppliers/SupplierOverviewPage";
import SupplierProfilesPage from "../pages/suppliers/SupplierProfilesPage";
import SupplierBillAuditPage from "../pages/suppliers/SupplierBillAuditPage";
import ProductProfilesPage from "../pages/products/ProductProfilesPage";
import SkuManagementPage from "../pages/products/SkuManagementPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import ComplaintRegisterPage from "../pages/sales/ComplaintRegisterPage";
import AbnormalRefundsPage from "../pages/sales/AbnormalRefundsPage";
import QualityProblemAnalysisPage from "../pages/sales/QualityProblemAnalysisPage";
import DataImportPage from "../pages/data/DataImportPage";
import UserManagementPage from "../pages/settings/UserManagementPage";
import SupplierAccountPage from "../pages/settings/SupplierAccountPage";
import RolePermissionsPage from "../pages/settings/RolePermissionsPage";
import SupplierWorkspacePage from "../pages/settings/SupplierWorkspacePage";

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
  // 1. Dashboard
  if (selectedParent === "Dashboard") {
    if (selectedSub === "经营首页") return <BusinessOverviewPage />;
  }

  // 2. 财务系统
  if (selectedParent === "财务系统") {
    if (selectedSub === "财务总览") return <FinanceOverviewPage />;
    if (selectedSub === "公司资金流水") return <CashflowPage />;
    if (selectedSub === "供应商账单核对") return <SupplierBillAuditPage defaultTab="audit" />;
    if (selectedSub === "个体户与银行账户" || selectedSub === "个体户账户管理") return <ProprietorsPage defaultTab="proprietors" />;
    if (selectedSub === "个体户票务管理" || selectedSub === "票务管理") return <IndividualInvoicePage />;
    if (selectedSub === "额度预警") return <ProprietorsPage defaultTab="alerts" />;
  }

  // 3. 供应商系统
  if (selectedParent === "供应商系统") {
    if (selectedSub === "供应商总览") return <SupplierOverviewPage />;
    if (selectedSub === "供应商档案") return <SupplierProfilesPage />;
    if (selectedSub === "采购超时预警") return <SupplierOverviewPage defaultTab="alerts" />;
  }

  // 4. 商品系统
  if (selectedParent === "商品系统") {
    if (selectedSub === "商品档案") return <ProductProfilesPage defaultTab="list" />;
    if (selectedSub === "SKU 管理") return <SkuManagementPage />;
    if (selectedSub === "商品详情") return <ProductDetailPage />;
    if (selectedSub === "图片搜索入口") return <ProductProfilesPage defaultTab="img-search" />;
  }

  // 5. 客服 / 售后
  if (selectedParent === "客服 / 售后") {
    if (selectedSub === "商品投诉登记") return <ComplaintRegisterPage />;
    if (selectedSub === "异常退款商品") return <AbnormalRefundsPage />;
    if (selectedSub === "质量问题分析") return <QualityProblemAnalysisPage />;
  }

  // 6. 数据中心
  if (selectedParent === "数据中心") {
    if (selectedSub === "数据导入") return <DataImportPage defaultTab="import" />;
    if (selectedSub === "导入记录") return <DataImportPage defaultTab="records" />;
    if (selectedSub === "数据异常记录") return <DataImportPage defaultTab="anomalies" />;
  }

  // 7. 系统设置
  if (selectedParent === "系统设置") {
    if (selectedSub === "用户管理") return <UserManagementPage />;
    if (selectedSub === "供应商账号管理") return <SupplierAccountPage />;
    if (selectedSub === "角色权限配置") return <RolePermissionsPage />;
  }

  // Fallback safely
  return <BusinessOverviewPage />;
}
