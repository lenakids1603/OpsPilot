/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Building2, Phone, Mail, FileText, CheckCircle2, MapPin, 
  HelpCircle, X, Search, Bell, LogOut, ArrowRight, ArrowUpRight, 
  Package, Truck, DollarSign, ShieldAlert, Award, ChevronLeft, ChevronRight,
  AlertTriangle, UploadCloud, Send, History, Plus, RefreshCw,
  Eye, ZoomIn, ZoomOut, RotateCw, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SubSKU {
  sku: string;
  styleNo: string;
  colorName: string;
  sizeName: string;
  cost: number;
  status: "生产中" | "待质检" | "已结案";
  colorHex: string; // Used to render real visual clothes mock
}

export interface CustomerComplaint {
  id: string;
  sku: string;
  colorName: string;
  date: string;
  feedback: string;
  source: string;
  status: "待整改" | "审核中" | "已核准" | "已结案";
  severity: "紧急" | "一般";
  solution?: string;
}

export interface SupplierWorkspacePageProps {
  userEmail?: string;
  onLogout?: () => void;
}

export default function SupplierWorkspacePage({ userEmail, onLogout }: SupplierWorkspacePageProps = {}) {
  const [activeTab, setActiveTab] = useState("工作台");
  const [searchSKU, setSearchSKU] = useState("");
  
  // Tabs of supplier workspace
  const tabs = ["工作台", "我的订单", "款式报价", "对账结算", "考核排名", "客户投诉"];

  // Mock list of supplier product issues
  const [productIssues] = useState<any[]>([
    {
      id: "FB-001",
      feedbackDate: "2026-05-18",
      styleNo: "26041503",
      sku: "26041503AbaiSY120",
      productName: "女童连衣裙",
      color: "白色",
      size: "120",
      issuePosition: "袖口",
      issueType: "开线",
      issueDescription: "袖口处出现开线问题，双针走线不精密，导致穿着后脱开。",
      feedbackCount: 1,
      supplierRemark: "请后续生产加强袖口走线检查",
      images: [
        { id: "img-01", url: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-002",
      feedbackDate: "2026-05-18",
      styleNo: "26050304",
      sku: "26050304AhuangLYQ150",
      productName: "女童礼服裙",
      color: "黄色",
      size: "150",
      issuePosition: "吊坠",
      issueType: "吊坠缺失",
      issueDescription: "客户反馈收到后衣服吊坠没有，包装袋内也未发现掉落吊坠。",
      feedbackCount: 1,
      supplierRemark: "请检查包装前配件是否齐全",
      images: [
        { id: "img-02", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-003",
      feedbackDate: "2026-05-18",
      styleNo: "26031205",
      sku: "26031205AhuiSY130",
      productName: "女童纱裙",
      color: "灰色",
      size: "130",
      issuePosition: "面料",
      issueType: "破洞",
      issueDescription: "裙摆纱面局部断丝破损，形成破洞，疑似裁剪拉丝或包箱磨损。",
      feedbackCount: 1,
      supplierRemark: "请注意纱料裁剪和包装保护",
      images: [
        { id: "img-03", url: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-004",
      feedbackDate: "2026-05-18",
      styleNo: "26041509",
      sku: "26041509Blan",
      productName: "女童公主裙",
      color: "蓝色",
      size: "-",
      issuePosition: "钻饰",
      issueType: "掉钻",
      issueDescription: "腰间装饰烫钻大面积脱落，极位不稳。",
      feedbackCount: 1,
      supplierRemark: "请检查钻饰粘合牢固度",
      images: [
        { id: "img-04", url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-005",
      feedbackDate: "2026-05-18",
      styleNo: "26040701",
      sku: "26040701BfenQZ140",
      productName: "女童裙子",
      color: "粉色",
      size: "140",
      issuePosition: "面料",
      issueType: "起毛",
      issueDescription: "面料表面严重起毛圈、起球，手感下降粗糙，疑似面料耐磨度或含棉成分问题。",
      feedbackCount: 1,
      supplierRemark: "请关注面料耐磨情况",
      images: [
        { id: "img-05", url: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-006",
      feedbackDate: "2026-05-18",
      styleNo: "26042201",
      sku: "26042201ClanCK160",
      productName: "女童套装",
      color: "蓝色",
      size: "160",
      issuePosition: "蕾丝",
      issueType: "蕾丝破损",
      issueDescription: "网格边缘蕾丝花边车线太靠内拉扯断开，多处花型损毁不完整。",
      feedbackCount: 1,
      supplierRemark: "请检查蕾丝车缝和包装过程",
      images: [
        { id: "img-06", url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-007",
      feedbackDate: "2026-05-18",
      styleNo: "26042803",
      sku: "26042803AbaiBX130",
      productName: "女童衬衫",
      color: "白色",
      size: "130",
      issuePosition: "蝴蝶结",
      issueType: "蝴蝶结脱落",
      issueDescription: "前胸蝴蝶结配饰拼接口缝线仅单针挂肉，导致穿着走动即松软断落。",
      feedbackCount: 1,
      supplierRemark: "请加强配件固定检查",
      images: [
        { id: "img-07", url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-008",
      feedbackDate: "2026-05-18",
      styleNo: "26042803",
      sku: "26042803AfenBX160",
      productName: "女童衬衫",
      color: "粉色",
      size: "160",
      issuePosition: "蝴蝶结",
      issueType: "蝴蝶结脱落",
      issueDescription: "蝴蝶结缝纫不平整，里面的钻托盘脱焊导致脱落。",
      feedbackCount: 1,
      supplierRemark: "请加强蝴蝶结配件检查",
      images: [
        { id: "img-08", url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-009",
      feedbackDate: "2026-05-18",
      styleNo: "26042103",
      sku: "26042103AbaiKS150",
      productName: "女童开衫",
      color: "白色",
      size: "150",
      issuePosition: "袖口",
      issueType: "其他",
      issueDescription: "袖裙车合断针破洞，袖子收口断线。",
      feedbackCount: 1,
      supplierRemark: "请严格把关断针检验规范",
      images: [
        { id: "img-09", url: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=810&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-010",
      feedbackDate: "2026-05-18",
      styleNo: "26042803",
      sku: "26042803AbaiBX150",
      productName: "女童衬衫",
      color: "白色",
      size: "150",
      issuePosition: "钻饰",
      issueType: "掉钻",
      issueDescription: "衣服上钉花钉针及小珍珠粘合不够，松脱掉落。",
      feedbackCount: 1,
      supplierRemark: "加强手工粘扣件核验",
      images: [
        { id: "img-10", url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-011",
      feedbackDate: "2026-05-18",
      styleNo: "26042703",
      sku: "26042703AbaiSY130",
      productName: "女童羊毛衫",
      color: "白色",
      size: "130",
      issuePosition: "印花",
      issueType: "其他",
      issueDescription: "衣服上面的图案黑色线缺少一块，图案不完整，影响整衣美观。",
      feedbackCount: 1,
      supplierRemark: "加强绣花及贴布绣品质对色核实",
      images: [
        { id: "img-11", url: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=150&auto=format&fit=crop&q=60" }
      ]
    },
    {
      id: "FB-012",
      feedbackDate: "2026-05-18",
      styleNo: "26042801",
      sku: "26042801AfenSY150",
      productName: "童装外套",
      color: "粉色",
      size: "150",
      issuePosition: "纽扣",
      issueType: "其他",
      issueDescription: "纽扣掉落缺失，扣子线过松，极易拉扯掉落。",
      feedbackCount: 1,
      supplierRemark: "加强扣型紧致度手工把控",
      images: [
        { id: "img-12", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=820&auto=format&fit=crop&q=80", thumbnailUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&auto=format&fit=crop&q=60" }
      ]
    }
  ]);

  // Product Feedback Filters
  const [issueStyleFilter, setIssueStyleFilter] = useState("");
  const [issueSkuFilter, setIssueSkuFilter] = useState("");
  const [issuePositionFilter, setIssuePositionFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");

  // Image lightbox preview state
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);

  // Mock list of 30 child-SKU items grouped by 4 iconic style numbers
  const [skus, setSkus] = useState<SubSKU[]>([
    // Style NO: LN-2024-W01 (10 Items)
    { sku: "LN-2024-W01-PK-66", styleNo: "LN-2024-W01", colorName: "雅致粉", sizeName: "66码 (3-6M)", cost: 58.00, status: "生产中", colorHex: "bg-rose-100" },
    { sku: "LN-2024-W01-PK-73", styleNo: "LN-2024-W01", colorName: "雅致粉", sizeName: "73码 (6-9M)", cost: 58.00, status: "生产中", colorHex: "bg-rose-100" },
    { sku: "LN-2024-W01-PK-80", styleNo: "LN-2024-W01", colorName: "雅致粉", sizeName: "80码 (9-12M)", cost: 58.00, status: "生产中", colorHex: "bg-rose-100" },
    { sku: "LN-2024-W01-PK-90", styleNo: "LN-2024-W01", colorName: "雅致粉", sizeName: "90码 (12-18M)", cost: 58.00, status: "待质检", colorHex: "bg-rose-100" },
    { sku: "LN-2024-W01-PK-100", styleNo: "LN-2024-W01", colorName: "雅致粉", sizeName: "100码 (18-24M)", cost: 58.00, status: "已结案", colorHex: "bg-rose-100" },
    { sku: "LN-2024-W01-YL-66", styleNo: "LN-2024-W01", colorName: "柠檬黄", sizeName: "66码 (3-6M)", cost: 58.00, status: "生产中", colorHex: "bg-amber-100" },
    { sku: "LN-2024-W01-YL-73", styleNo: "LN-2024-W01", colorName: "柠檬黄", sizeName: "73码 (6-9M)", cost: 58.00, status: "生产中", colorHex: "bg-amber-100" },
    { sku: "LN-2024-W01-YL-80", styleNo: "LN-2024-W01", colorName: "柠檬黄", sizeName: "80码 (9-12M)", cost: 58.00, status: "待质检", colorHex: "bg-amber-100" },
    { sku: "LN-2024-W01-YL-90", styleNo: "LN-2024-W01", colorName: "柠檬黄", sizeName: "90码 (12-18M)", cost: 58.00, status: "已结案", colorHex: "bg-amber-100" },
    { sku: "LN-2024-W01-YL-100", styleNo: "LN-2024-W01", colorName: "柠檬黄", sizeName: "100码 (18-24M)", cost: 58.00, status: "已结案", colorHex: "bg-amber-100" },

    // Style NO: LN-2024-W02 (8 Items)
    { sku: "LN-2024-W02-NY-80", styleNo: "LN-2024-W02", colorName: "深邃蓝", sizeName: "80码 (9-12M)", cost: 72.50, status: "待质检", colorHex: "bg-slate-700" },
    { sku: "LN-2024-W02-NY-90", styleNo: "LN-2024-W02", colorName: "深邃蓝", sizeName: "90码 (12-18M)", cost: 72.50, status: "待质检", colorHex: "bg-slate-700" },
    { sku: "LN-2024-W02-NY-100", styleNo: "LN-2024-W02", colorName: "深邃蓝", sizeName: "100码 (2-3Y)", cost: 72.50, status: "生产中", colorHex: "bg-slate-700" },
    { sku: "LN-2024-W02-NY-110", styleNo: "LN-2024-W02", colorName: "深邃蓝", sizeName: "110码 (3-4Y)", cost: 72.50, status: "已结案", colorHex: "bg-slate-700" },
    { sku: "LN-2024-W02-RD-80", styleNo: "LN-2024-W02", colorName: "复古红", sizeName: "80码 (9-12M)", cost: 75.00, status: "生产中", colorHex: "bg-red-200" },
    { sku: "LN-2024-W02-RD-90", styleNo: "LN-2024-W02", colorName: "复古红", sizeName: "90码 (12-18M)", cost: 75.00, status: "生产中", colorHex: "bg-red-200" },
    { sku: "LN-2024-W02-RD-100", styleNo: "LN-2024-W02", colorName: "复古红", sizeName: "100码 (2-3Y)", cost: 75.00, status: "已结案", colorHex: "bg-red-200" },
    { sku: "LN-2024-W02-RD-110", styleNo: "LN-2024-W02", colorName: "复古红", sizeName: "110码 (3-4Y)", cost: 75.00, status: "已结案", colorHex: "bg-red-200" },

    // Style NO: LN-2501-M10 (6 Items)
    { sku: "LN-2501-M10-WT-90", styleNo: "LN-2501-M10", colorName: "珍珠白", sizeName: "90码 (12-18M)", cost: 45.00, status: "已结案", colorHex: "bg-slate-50 border border-slate-200" },
    { sku: "LN-2501-M10-WT-100", styleNo: "LN-2501-M10", colorName: "珍珠白", sizeName: "100码 (2-3Y)", cost: 45.00, status: "已结案", colorHex: "bg-slate-50 border border-slate-200" },
    { sku: "LN-2501-M10-WT-110", styleNo: "LN-2501-M10", colorName: "珍珠白", sizeName: "110码 (3-4Y)", cost: 45.00, status: "已结案", colorHex: "bg-slate-50 border border-slate-200" },
    { sku: "LN-2501-M10-GY-90", styleNo: "LN-2501-M10", colorName: "花灰", sizeName: "90码 (12-18M)", cost: 45.00, status: "生产中", colorHex: "bg-slate-300" },
    { sku: "LN-2501-M10-GY-100", styleNo: "LN-2501-M10", colorName: "花灰", sizeName: "100码 (2-3Y)", cost: 45.00, status: "生产中", colorHex: "bg-slate-300" },
    { sku: "LN-2501-M10-GY-110", styleNo: "LN-2501-M10", colorName: "花灰", sizeName: "110码 (3-4Y)", cost: 45.00, status: "生产中", colorHex: "bg-slate-300" },

    // Style NO: LN-2024-W03 (6 Items)
    { sku: "LN-2024-W03-OG-73", styleNo: "LN-2024-W03", colorName: "蜜桔橙", sizeName: "73码 (6-9M)", cost: 65.00, status: "生产中", colorHex: "bg-orange-200" },
    { sku: "LN-2024-W03-OG-80", styleNo: "LN-2024-W03", colorName: "蜜桔橙", sizeName: "80码 (9-12M)", cost: 65.00, status: "生产中", colorHex: "bg-orange-200" },
    { sku: "LN-2024-W03-OG-90", styleNo: "LN-2024-W03", colorName: "蜜桔橙", sizeName: "90码 (12-18M)", cost: 65.00, status: "生产中", colorHex: "bg-orange-200" },
    { sku: "LN-2024-W03-GN-73", styleNo: "LN-2024-W03", colorName: "薄荷绿", sizeName: "73码 (6-9M)", cost: 65.00, status: "已结案", colorHex: "bg-teal-100" },
    { sku: "LN-2024-W03-GN-80", styleNo: "LN-2024-W03", colorName: "薄荷绿", sizeName: "80码 (9-12M)", cost: 65.00, status: "已结案", colorHex: "bg-teal-100" },
    { sku: "LN-2024-W03-GN-90", styleNo: "LN-2024-W03", colorName: "薄荷绿", sizeName: "90码 (12-18M)", cost: 65.00, status: "已结案", colorHex: "bg-teal-100" }
  ]);

  // Customer complaints state
  const [complaints, setComplaints] = useState<CustomerComplaint[]>([
    {
      id: "CMP-20260526-01",
      sku: "LN-2024-W01",
      colorName: "雅致粉",
      date: "2026-05-26",
      feedback: "领口背面车缝线端头不平整，线结凸起，触感不够亲肤。零售门店收到1起婴儿皮肤娇嫩摩擦红痒的客户投诉。",
      source: "上海国金中心直营店/买手转达",
      status: "待整改",
      severity: "紧急",
    },
    {
      id: "CMP-20260518-05",
      sku: "LN-2024-W02",
      colorName: "深邃蓝",
      date: "2026-05-18",
      feedback: "羊毛呢大衣领口洗涤标签缝制有轻微翘边，刮蹭宝宝娇嫩肌肤，买手建议改大货规程将标标移至衣服腰侧或下摆内缝。",
      source: "北京蓝色港湾专柜反馈",
      status: "已结案",
      severity: "一般",
      solution: "已修改车间后段缝纫工艺单，所有后续订单的洗标均下移至腰侧下摆，完全解决顶领刺刮问题。",
    }
  ]);

  // Show weekly complaints count instead of today's complaints
  const weeklyComplaintsCount = useMemo(() => {
    return complaints.length;
  }, [complaints]);

  // Derived filtered issues list for the "产品问题反馈列表" subpage
  const filteredIssues = useMemo(() => {
    return productIssues.filter(item => {
      const matchStyle = !issueStyleFilter || item.styleNo.toLowerCase().includes(issueStyleFilter.toLowerCase());
      const matchSku = !issueSkuFilter || item.sku.toLowerCase().includes(issueSkuFilter.toLowerCase());
      const matchPosition = !issuePositionFilter || item.issuePosition === issuePositionFilter;
      const matchType = !issueTypeFilter || item.issueType === issueTypeFilter;
      return matchStyle && matchSku && matchPosition && matchType;
    });
  }, [productIssues, issueStyleFilter, issueSkuFilter, issuePositionFilter, issueTypeFilter]);

  const problemPositions = ["全部", "衣领", "袖口", "裙摆", "腰部", "拉链", "纽扣", "吊坠", "蝴蝶结", "蕾丝", "钻饰", "面料", "里布", "印花", "包装", "纱裙"];
  const problemTypes = ["全部", "开线", "破洞", "掉钻", "起毛", "吊坠缺失", "蝴蝶结掉落", "蕾丝破损", "配件缺失", "脏污", "染色", "色差", "尺码异常", "做工问题", "其他"];

  // Invoice state values for the new Invoice submission tab
  const [invoices, setInvoices] = useState<any[]>([
    {
      id: "INV-202610-159",
      amount: 135000.00,
      taxRate: "13%",
      taxAmount: 15530.97,
      batchNo: "SET-202610-01",
      invoiceNo: "033002620159",
      fileName: "ZH_FP_88291_01.pdf",
      status: "已过账销账",
      date: "2026-10-21",
      comments: "PO-20260905 货款首批 100% 全额发票"
    }
  ]);

  const [invoiceFormBatch, setInvoiceFormBatch] = useState("SET-202610-02");
  const [invoiceFormNo, setInvoiceFormNo] = useState("");
  const [invoiceFormAmount, setInvoiceFormAmount] = useState("58000");
  const [invoiceFormTaxRate, setInvoiceFormTaxRate] = useState("13%");
  const [invoiceFormComments, setInvoiceFormComments] = useState("");
  const [uploadedInvoiceFile, setUploadedInvoiceFile] = useState<string | null>(null);

  // Dialog states for Actions
  const [modalType, setModalType] = useState<"quote" | "bill" | "detail" | null>(null);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  // View management: "style" (by style number) or "sku" (by sku spec)
  const [viewMode, setViewMode] = useState<"style" | "sku">("sku");

  // Filter local SKU items
  const filteredSkus = useMemo(() => {
    return skus.filter(s => s.sku.includes(searchSKU.toUpperCase()) || s.colorName.includes(searchSKU));
  }, [skus, searchSKU]);

  // Group SKUs by Style (used for by-style display mode)
  const styleGroups = useMemo(() => {
    const groups: Record<string, {
      styleNo: string;
      skus: SubSKU[];
      status: "生产中" | "待质检" | "已结案";
    }> = {};

    skus.forEach(s => {
      if (!groups[s.styleNo]) {
        groups[s.styleNo] = {
          styleNo: s.styleNo,
          skus: [],
          status: "已结案",
        };
      }
      groups[s.styleNo].skus.push(s);
    });

    Object.values(groups).forEach(g => {
      if (g.skus.some(s => s.status === "生产中")) {
        g.status = "生产中";
      } else if (g.skus.some(s => s.status === "待质检")) {
        g.status = "待质检";
      } else {
        g.status = "已结案";
      }
    });

    return Object.values(groups);
  }, [skus]);

  // Filter style groups for search matching
  const filteredStyleGroups = useMemo(() => {
    return styleGroups.filter(g => {
      const sTerm = searchSKU.toUpperCase();
      return g.styleNo.includes(sTerm) || g.skus.some(s => s.sku.includes(sTerm) || s.colorName.includes(searchSKU));
    });
  }, [styleGroups, searchSKU]);

  // Dynamic hangtag information for selected Style or SKU code
  const selectedTagInfo = useMemo(() => {
    if (!selectedSku) return null;
    let item = skus.find(s => s.sku === selectedSku);
    const isSkuMode = !!item;
    if (!item) {
      item = skus.find(s => s.styleNo === selectedSku);
    }
    if (!item) return null;

    const styleNo = item.styleNo;
    let productName = "婴儿舒适保暖常备衣服";
    let safetyClass = "GB 31701-2015 婴幼儿用品 (A类 / 优质安全型)";
    let executiveStandard = "GB/T 33271-2016 婴幼儿针织服饰规范";
    let fabricText = "100% 精梳棉 / Grade A 有机双平组织";
    let suggestedPrice = 188.00;
    let grade = "一等品";
    let inspector = "QC-01";

    if (styleNo === "LN-2024-W01") {
      productName = "婴幼儿有机平棉公主花边爬服";
      safetyClass = "GB 31701-2015 婴幼儿用品 (A类 / 直接接触皮肤类)";
      executiveStandard = "FZ/T 73025-2019 婴幼儿针织专类服饰特别工艺";
      fabricText = "95% 有机竹纤维棉 + 5% 杜邦莱卡高弹氨纶";
      suggestedPrice = 199.00;
      inspector = "QC-12";
    } else if (styleNo === "LN-2024-W02") {
      productName = "儿童英伦双排扣精纺美利奴小呢大衣";
      safetyClass = "GB 31701-2015 幼儿及儿童服饰安全规范 (B类 / 华美触肌)";
      executiveStandard = "FZ/T 81007-2021 高品位儿童呢绒大衣制造标准";
      fabricText = "面料: 100% 澳大利亚顶级天然美利奴羊毛 / 里料: 100% 醋酸纤维";
      suggestedPrice = 459.00;
      inspector = "QC-08";
    } else if (styleNo === "LN-2501-M10") {
      productName = "儿童双面丝光圆领精柔打底T恤衫";
      safetyClass = "GB 31701-2015 婴幼儿用品安全标准 (A类 / 直接接触皮肤)";
      executiveStandard = "GB/T 22849-2014 重工高档针织T恤检验指标";
      fabricText = "100% 臻选新疆细绒精梳双丝光棉 (70支双股无缝编制)";
      suggestedPrice = 129.00;
      inspector = "QC-03";
    } else if (styleNo === "LN-2024-W03") {
      productName = "女幼童镂空钩花美丽诺开衫毛衣";
      safetyClass = "GB 31701-2015 婴幼儿用品安全类别 (A类 / 直接接触皮肤)";
      executiveStandard = "FZ/T 73018-2021 纯精纺羊毛针织制造规程";
      fabricText = "80% 顶级美利奴羊毛 + 20% 高比例桑蚕丝纤维";
      suggestedPrice = 299.00;
      inspector = "QC-15";
    }

    const randNum = (styleNo === "LN-2024-W01" ? 6970125432014 : styleNo === "LN-2024-W02" ? 6970125432021 : styleNo === "LN-2501-M10" ? 6970125432038 : 6970125432045);
    const barCode = String(randNum + (isSkuMode ? item.sku.length : 0));

    return {
      isSkuMode,
      sku: item.sku,
      styleNo: item.styleNo,
      colorName: item.colorName,
      sizeName: item.sizeName,
      colorHex: item.colorHex,
      cost: item.cost,
      status: item.status,
      productName,
      safetyClass,
      executiveStandard,
      fabricText,
      suggestedPrice,
      grade,
      inspector,
      barCode,
    };
  }, [selectedSku, skus]);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "quote") {
      showToast("🚀 报价详情已成功提报！采购部正在进行核验。");
    } else {
      showToast("📁 进项财务发票及发货电子回单已被安全录入系统。");
    }
    setModalType(null);
  };

  return (
    <div className="bg-slate-50 border border-slate-100/60 rounded-3xl overflow-hidden shadow-lg p-3 sm:p-5 text-xs font-sans space-y-5 max-w-7xl mx-auto select-none">
      
      {/* Toast popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-5 z-[500] p-4 bg-emerald-650 text-white font-bold rounded-xl border border-emerald-500 shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal workspace mock header area */}
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs select-none">
        {/* Left Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 bg-indigo-650 rounded-xl flex items-center justify-center font-serif text-white font-black text-[16px]">
            H
          </div>
          <div>
            <h3 className="font-extrabold text-slate-805 text-[13px] tracking-tight">杭州织锦服饰有限公司</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 leading-none font-bold">供应商在线工作台</span>
          </div>
        </div>

        {/* Tab menu items */}
        <div className="flex items-center gap-1 w-full md:w-auto justify-start border-b border-slate-50 md:border-none pb-2 md:pb-0">
          {tabs.map(t => {
            const isSelected = activeTab === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setActiveTab(t);
                  showToast(`📂 已切换至子页面: ${t}`);
                }}
                className={`px-3 py-2 rounded-xl text-[11.5px] font-black transition-all cursor-pointer relative ${
                  isSelected 
                    ? "text-indigo-700 bg-indigo-50/70 font-extrabold" 
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {t}
                {isSelected && (
                  <motion.div 
                    layoutId="workspaceUnderline"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-indigo-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Admin pill */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/55 text-[10.5px]">
            <div className="w-5.5 h-5.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-[9px]">
              {userEmail ? userEmail.slice(0, 1).toUpperCase() : "张"}
            </div>
            <div>
              <span className="font-bold text-slate-705 block leading-tight">{userEmail || "张经理"}</span>
              <span className="text-[8.5px] text-emerald-600 block leading-none font-medium mt-0.5">
                {userEmail === "gys@lenakids.com" || userEmail === "gys" ? "供应商特权模式" : "账号已启用"}
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            disabled={!onLogout}
            className={`p-2 rounded-xl leading-none ${onLogout ? "text-rose-600 bg-rose-50 border border-rose-205 hover:bg-rose-100 cursor-pointer" : "text-slate-350 bg-slate-100 border border-slate-200"}`}
            title="退出提报程序"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Greeting Banner Segment */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight leading-normal">
            您好，张经理
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium font-sans">
            今天是 <span className="text-slate-650 font-bold">2026年10月24日</span>，请关注以下待办事项以确保生产顺利进行。
          </p>
        </div>

        {/* Quick Submit Buttons on top-right */}
        <div className="flex items-center gap-2.5 text-xs font-semibold select-none flex-shrink-0">
          <button
            onClick={() => setModalType("quote")}
            className="px-4 py-2 bg-[#002045] hover:bg-[#072449] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>提交报价</span>
          </button>
          <button
            onClick={() => setModalType("bill")}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>上传账单</span>
          </button>
        </div>
      </div>

      {/* Top dashboard stats cards row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 select-none">
        
        {/* Metric 1 */}
        <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-indigo-850 font-black text-[11px] block">待填写报价</span>
            <span className="text-[10px] text-slate-400 font-sans block">包含新款打样报价及审单确认</span>
          </div>
          <span className="text-3xl font-black text-indigo-700 font-mono tracking-tight leading-none px-2.5">3</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-amber-800/80 font-black text-[11px] block">待更新交期</span>
            <span className="text-[10px] text-slate-400 font-sans block">生产中订单的进度及入库预测</span>
          </div>
          <span className="text-3xl font-black text-orange-650 font-mono tracking-tight leading-none px-2.5">2</span>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => {
            setActiveTab("发票提交");
            showToast("🧾 已快速跳转至发票提交与账单明细面板");
          }}
          className="bg-slate-50 border border-slate-150 hover:bg-slate-100/60 hover:border-slate-350 cursor-pointer rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all"
        >
          <div className="space-y-1">
            <span className="text-slate-600 font-black text-[11px] block font-sans">待上传账单</span>
            <span className="text-[10px] text-slate-450 block">上月已入库货款的电子发票</span>
          </div>
          <span className="text-3xl font-black text-indigo-650 font-mono tracking-tight leading-none px-2.5">1</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-rose-700/80 font-black text-[11px] block font-sans">质量问题</span>
            <span className="text-[10px] text-slate-400 block">目前暂待回复的质检异常</span>
          </div>
          <span className="text-3xl font-black text-slate-400 font-mono tracking-tight leading-none px-2.5">0</span>
        </div>

        {/* Metric 5 */}
        <div 
          onClick={() => {
            setActiveTab("客户投诉");
            showToast("⚠️ 已快速跳转至客户投诉档案清单");
          }}
          className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            weeklyComplaintsCount > 0 
              ? "bg-rose-50 border-rose-300 hover:border-rose-450 hover:bg-rose-100/50 hover:shadow-xs" 
              : "bg-slate-50 border-slate-150 hover:border-slate-350"
          }`}
        >
          <div className="space-y-1">
            <span className={`font-black text-[11px] block font-sans ${weeklyComplaintsCount > 0 ? "text-rose-700 font-extrabold" : "text-slate-650"}`}>
              本周新增客诉
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">终端专柜及买手的客诉监控</span>
          </div>
          <span className={`text-4xl md:text-5xl font-black font-mono tracking-tight leading-none px-2.5 ${
            weeklyComplaintsCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-400"
          }`}>
            {weeklyComplaintsCount}
          </span>
        </div>
      </div>

      {/* Grid: Split Table vs Sidebar details */}
      {activeTab === "工作台" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Side: SKU Monitoring list table (8/12 scope) */}
          <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Main header row with View Switcher */}
            <div className="p-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4 select-none">
              <div className="flex items-center gap-3">
                <h4 className="font-extrabold text-slate-800 text-[12.5px] uppercase flex items-center gap-1 font-sans">
                  <Package className="w-4 h-4 text-indigo-600" />
                  我的款号 / SKU 监控
                </h4>

                {/* Styled segmented tab toggle */}
                <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 flex items-center shrink-0">
                  <button
                    onClick={() => setViewMode("style")}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                      viewMode === "style"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    以款号显示
                  </button>
                  <button
                    onClick={() => setViewMode("sku")}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                      viewMode === "sku"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    以SKU显示
                  </button>
                </div>
              </div>
              
              {/* Simple Searching bar */}
              <div className="relative w-44 rounded-xl border border-slate-205 py-1.5 pl-8 pr-3 bg-white focus-within:border-indigo-400 transition-colors">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索识别码或颜色..."
                  value={searchSKU}
                  onChange={e => setSearchSKU(e.target.value)}
                  className="w-full bg-transparent outline-none text-[11px] font-sans"
                />
              </div>
            </div>

            {/* Interactive table */}
            <div className="overflow-x-auto text-[11px] font-medium leading-normal">
              <table className="w-full text-left border-collapse text-slate-600">
                <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  {viewMode === "sku" ? (
                    <tr>
                      <th className="p-4 pl-6 font-extrabold w-[170px]">SKU 编号</th>
                      <th className="p-4 font-bold text-center">对应颜色</th>
                      <th className="p-4 font-bold text-center">规格/尺寸</th>
                      <th className="p-4 font-bold text-center">提领成本 (CNY)</th>
                      <th className="p-4 font-bold text-center">生产状态</th>
                      <th className="p-4 font-bold pr-6 text-center">系统操作</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-4 pl-6 font-extrabold">款号 (Style Number)</th>
                      <th className="p-4 font-bold text-center">产品款式描述</th>
                      <th className="p-4 font-bold text-center">工艺运行状态</th>
                      <th className="p-4 font-bold pr-6 text-center">系统操作</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {viewMode === "sku" ? (
                    filteredSkus.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                          没有找到匹配的SKU款号
                        </td>
                      </tr>
                    ) : (
                      filteredSkus.map(s => (
                        <tr key={s.sku} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800 font-mono tracking-wide">{s.sku}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <div className={`w-11 h-7 rounded-sm ${s.colorHex} shadow-xs border border-slate-100/40 relative flex items-center justify-center font-bold text-[8.5px] text-zinc-800/80 uppercase`}>
                                {s.colorName}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-705">{s.sizeName}</td>
                          <td className="p-4 text-center font-bold font-mono text-slate-500">{s.cost.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                              s.status === "生产中" 
                                ? "bg-sky-50 text-sky-700 border-sky-100 animate-pulse" 
                                : s.status === "待质检" 
                                  ? "bg-amber-5 text-amber-600 border-amber-100" 
                                  : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-center select-none">
                            <button
                              onClick={() => {
                                setSelectedSku(s.sku);
                                setModalType("detail");
                              }}
                              className="text-indigo-600 hover:text-indigo-805 font-bold hover:underline transition-colors cursor-pointer"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    filteredStyleGroups.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                          没有找到匹配的款号
                        </td>
                      </tr>
                    ) : (
                      filteredStyleGroups.map(g => {
                        let styleName = "精品童装款式";
                        if (g.styleNo === "LN-2024-W01") styleName = "公主花边爬服款式";
                        else if (g.styleNo === "LN-2024-W02") styleName = "双排扣纯羊毛高档童大衣";
                        else if (g.styleNo === "LN-2501-M10") styleName = "丝光棉圆领极柔童装T恤";
                        else if (g.styleNo === "LN-2024-W03") styleName = "纯针织雕花镂空开衫";

                        return (
                          <tr key={g.styleNo} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-800 font-mono tracking-wide">{g.styleNo}</td>
                            <td className="p-4 text-center text-slate-700 font-bold">{styleName}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                g.status === "生产中" 
                                  ? "bg-sky-50 text-sky-700 border-sky-100 animate-pulse" 
                                  : g.status === "待质检" 
                                    ? "bg-amber-5 text-amber-600 border-amber-100" 
                                    : "bg-slate-100 text-slate-400 border-slate-200"
                              }`}>
                                {g.status}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-center select-none">
                              <button
                                onClick={() => {
                                  setSelectedSku(g.styleNo);
                                  setModalType("detail");
                                }}
                                className="text-indigo-600 hover:text-indigo-805 font-bold hover:underline transition-colors cursor-pointer"
                              >
                                详情
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer of table info */}
            <div className="p-4 border-t border-slate-50 bg-[#fafbfe] flex items-center justify-between text-slate-400 font-medium">
              <span>共 <span className="text-slate-705 font-bold">
                {viewMode === "sku" ? filteredSkus.length : filteredStyleGroups.length}
              </span> 个 {viewMode === "sku" ? "SKU" : "款式款号"}</span>
              <div className="flex items-center gap-1 font-semibold text-[10.5px]">
                <button className="p-1 px-3 border border-slate-150 rounded-lg text-slate-400 bg-white hover:bg-slate-50 flex items-center">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  上一页
                </button>
                <button className="w-6 h-6 bg-slate-100 text-[#002045] border border-slate-202 rounded-lg font-black flex items-center justify-center">
                  1
                </button>
                <button className="p-1 px-3 border border-slate-150 rounded-lg text-slate-400 bg-white hover:bg-slate-50 flex items-center">
                  下一页
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Columns: Feeds Sidebars (4/12 scope) */}
          <div className="xl:col-span-4 space-y-5">
            {/* NEW: Supplier Evaluation & Ranking Quick View Card */}
            <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <Award className="w-24 h-24 text-amber-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
                  季度供应商考核与排名
                </h4>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 font-black text-[9px] scale-90">
                  S 级最优
                </span>
              </div>
              
              <div className="flex items-end justify-between mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">综合考核得分</span>
                  <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">96.8<span className="text-xs text-slate-400 font-sans font-medium"> 分</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">服饰品类排名</span>
                  <span className="text-2xl font-black text-amber-600 font-mono tracking-tight">第 2 <span className="text-xs text-slate-400 font-sans font-medium">/ 32 名</span></span>
                </div>
              </div>

              <p className="text-[10px] text-slate-550 leading-relaxed font-sans mt-1">
                恭喜！您的交期达成率 <span className="font-extrabold text-slate-700">98.2%</span> 与大货合格率 <span className="font-extrabold text-slate-705">99.1%</span> 蝉联同业高优梯队。
              </p>

              <button
                onClick={() => {
                  setActiveTab("考核排名");
                  showToast("🏆 已成功跳转至季度绩效评测与全国大排行榜");
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-xs text-white rounded-xl font-bold text-center transition-all cursor-pointer select-none text-[10.5px]"
              >
                查看完整考核红黑榜
              </button>
            </div>

            {/* Weekly Customer Complaint Alert Card */}
            <div className="bg-gradient-to-br from-rose-50/60 to-rose-100/40 border border-rose-200 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden animate-pulse">
              <div className="absolute right-4 bottom-14 opacity-10">
                <AlertTriangle className="w-16 h-16 text-rose-600" />
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-805 text-xs flex items-center gap-1.5 bg-transparent font-sans">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
                  本周新增客诉反馈
                </h4>
                <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] bg-rose-500 text-white shadow-xs">
                  急需关注
                </span>
              </div>

              {/* Big spotlight number layout */}
              <div className="flex items-center gap-4 bg-rose-500/10 border border-rose-200/60 rounded-2xl p-4 shadow-xs">
                <div className="text-5xl font-black font-mono text-rose-600 leading-none shrink-0 tracking-tight flex items-baseline">
                  {weeklyComplaintsCount}
                  <span className="text-xs font-sans font-black text-rose-500 ml-1">件</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-rose-750 font-extrabold block">待核对新增加急件</span>
                  <span className="text-[10px] text-slate-450 block font-medium">来自百货商场与终端巡检</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-700">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800">
                  <span>监督反馈: 缝制外观/水洗变形</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                  已累计接收来自商场、买手终端的品质反馈。此区域仅供工厂查询，无需提报整改方案。
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab("客户投诉");
                  showToast("📁 已成功切换至客户投诉面板查看列表");
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-center text-[10.5px] transition-all cursor-pointer relative z-10 shadow-sm"
              >
                进入客户投诉页面 ({weeklyComplaintsCount} 件待处理)
              </button>
            </div>

            {/* Feed Card 1: Dispute control panel */}
            <div className="bg-white border border-slate-105 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="font-black text-slate-805 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-slate-600" />
                质量反馈中心
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                当前有 <span className="text-rose-600 font-extrabold px-0.5">0</span> 个质量问题需要回复。请保持关注，以及时处理质检异常，避免影响结算。
              </p>
              <button
                onClick={() => showToast("ℹ️ 当前没有需要复议或整改的异常批次件")}
                className="w-full py-2 bg-[#002045] hover:bg-[#07254a] hover:shadow-xs text-white rounded-xl font-black text-center transition-all cursor-pointer select-none"
              >
                回复质量问题
              </button>
            </div>

            {/* Feed Card 2: List of chronologically ordered update logs */}
            <div className="bg-white border border-slate-105 rounded-2xl p-5 shadow-xs space-y-4 select-none">
              <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <Bell className="w-4.5 h-4.5 text-indigo-650" />
                最近动态
              </h4>

              {/* Timelines */}
              <div className="space-y-3.5 pl-1.5 text-[10px] font-medium leading-relaxed font-sans border-l border-slate-100">
                {/* Event 1 */}
                <div className="relative pl-3.5 space-y-0.2">
                  <div className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-650 border border-white" />
                  <span className="text-slate-400 block font-mono text-[9px]">今天 10:45 AM</span>
                  <p className="text-slate-700 font-medium">
                    收到新打样任务 - 款号: <span className="text-indigo-600 font-bold font-mono">LN-2024-W05</span>
                  </p>
                </div>

                {/* Event 2 */}
                <div className="relative pl-3.5 space-y-0.2">
                  <div className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 border border-white" />
                  <span className="text-slate-400 block font-mono text-[9px]">昨天</span>
                  <p className="text-slate-700 font-medium">
                    货款审核已通过 - 采购单: <span className="text-slate-700 font-bold font-mono">NO.88291</span>
                  </p>
                </div>

                {/* Event 3 */}
                <div className="relative pl-3.5 space-y-0.2">
                  <div className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 border border-white" />
                  <span className="text-slate-400 block font-mono text-[9px]">3天前</span>
                  <p className="text-slate-600">
                    系统通知: 报价模板包更新 - 请下载最新 <span className="text-emerald-600 font-bold">V3.2 版本</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => showToast("⚡ 系统已加载全部24小时内时序事件动态记录")}
                className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-bold rounded-xl text-center transition-colors cursor-pointer"
              >
                查看全部动态
              </button>
            </div>

            {/* Feed Card 3: Contact panel listing */}
            <div className="bg-[#fafbfe]/55 border border-slate-101 rounded-2xl p-4 flex items-center justify-between text-[11px] leading-snug">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-black">
                  王
                </div>
                <div className="space-y-0.2 font-sans font-medium">
                  <span className="font-bold text-slate-800 block">采购对接人 - 王小悦</span>
                  <span className="text-[9.5px] text-slate-400 font-mono block">电话: 138-xxxx-5678</span>
                </div>
              </div>
              <a 
                href="tel:13800005678" 
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                title="一键致电采购部"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE VIEW: 我的订单 */}
      {activeTab === "我的订单" && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h4 className="font-extrabold text-slate-800 text-[12.5px] uppercase flex items-center gap-2">
              <Truck className="w-4.5 h-4.5 text-indigo-600" />
              正在执行的采购生产单
            </h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-black uppercase">
              生产中: 2 笔 | 待发货: 1 笔
            </span>
          </div>
          
          <div className="overflow-x-auto text-[11px] font-medium leading-normal">
            <table className="w-full text-left border-collapse text-slate-600">
              <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="p-4 pl-6">采购单号</th>
                  <th className="p-4">对应款号 / 颜色</th>
                  <th className="p-4 text-center">订购数量 (件)</th>
                  <th className="p-4 text-center">单价 (CNY)</th>
                  <th className="p-4 text-center">出货交期</th>
                  <th className="p-4 text-center">当前进度</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-bold text-slate-800 font-mono">PO-20261011</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-700 block">LN-2024-W01</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">雅致粉 / 纯棉爬服</span>
                  </td>
                  <td className="p-4 text-center font-bold font-mono text-slate-900">1,500</td>
                  <td className="p-4 text-center font-bold font-mono">58.00</td>
                  <td className="p-4 text-center font-bold font-mono text-indigo-600">2026-11-15</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-sky-100 text-sky-700 border border-sky-200">
                      缝纫加工中 (65%)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-bold text-slate-800 font-mono">PO-20261018</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-700 block">LN-2024-W02</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">深邃蓝 / 羊毛外套</span>
                  </td>
                  <td className="p-4 text-center font-bold font-mono text-slate-900">800</td>
                  <td className="p-4 text-center font-bold font-mono">72.50</td>
                  <td className="p-4 text-center font-bold font-mono text-indigo-600">2026-11-20</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-5 text-amber-700 border border-amber-200">
                      面料预缩完成 (20%)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-bold text-slate-800 font-mono">PO-20260905</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-700 block">LN-2501-M10</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">珍珠白 / 丝光棉T恤</span>
                  </td>
                  <td className="p-4 text-center font-bold font-mono text-slate-900">3,000</td>
                  <td className="p-4 text-center font-bold font-mono">45.00</td>
                  <td className="p-4 text-center font-bold font-mono text-emerald-600">2026-10-20</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                      已验收入库 (100%)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBPAGE VIEW: 款式报价 */}
      {activeTab === "款式报价" && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h4 className="font-extrabold text-slate-800 text-[12.5px] uppercase flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-indigo-600" />
              打样款式报价记录
            </h4>
            <button
              onClick={() => setModalType("quote")}
              className="px-3 py-1.5 bg-[#002045] text-white hover:bg-[#072449] font-bold rounded-lg text-[10.5px] flex items-center gap-1 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              提报新打样报价
            </button>
          </div>

          <div className="overflow-x-auto text-[11px] font-medium leading-normal">
            <table className="w-full text-left border-collapse text-slate-600">
              <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="p-4 pl-6">打样款号</th>
                  <th className="p-4">设计及打样规格开发说明</th>
                  <th className="p-4 text-center">核定单件成本 (CNY)</th>
                  <th className="p-4 text-center">核准账期</th>
                  <th className="p-4 text-center">审核状态</th>
                  <th className="p-4 text-center">买手/采购判定反馈意见</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-bold text-slate-805 font-mono">LN-2024-W05</td>
                  <td className="p-4">纯棉连体爬服，面料克重220g，触感柔软蓬松</td>
                  <td className="p-4 text-center font-bold font-mono text-slate-900">-</td>
                  <td className="p-4 text-center">月结30天</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-5 text-amber-600 border border-amber-100">
                      待我方核价提报
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-400 font-sans">注意首批工艺防缩水指标</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-bold text-slate-805 font-mono">LN-2024-W01</td>
                  <td className="p-4">雅致粉公主蕾丝花边爬服款，含环保防潮包装</td>
                  <td className="p-4 text-center font-bold font-mono text-slate-700">58.00</td>
                  <td className="p-4 text-center">月结30天</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-705 border border-emerald-100">
                      采购部核准接收
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-650">性价比符合本季度大盘预期，推进PO加工</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBPAGE VIEW: 对账结算 */}
      {activeTab === "对账结算" && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h4 className="font-extrabold text-slate-800 text-[12.5px] uppercase flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-indigo-600" />
              采供财税结算电子对账中心
            </h4>
            <button
              onClick={() => setModalType("bill")}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 font-bold rounded-lg text-[10.5px] flex items-center gap-1 cursor-pointer bg-white text-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              上传账单往来发票
            </button>
          </div>

          {/* 财税三大主要指标 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-450 font-bold block">本季度已到账货款</span>
                <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">¥ 342,500.00</span>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="bg-amber-50/20 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-455 font-bold block">有待上传账单并轧账</span>
                <span className="text-xl font-bold font-mono text-orange-650 mt-1 block">¥ 58,000.00</span>
              </div>
              <FileText className="w-8 h-8 text-amber-400" />
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">累计合作结案货款</span>
                <span className="text-xl font-bold font-mono text-slate-700 mt-1 block">¥ 4,892,100.00</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-slate-350" />
            </div>
          </div>

          <div className="overflow-x-auto text-[11px] font-medium leading-normal mt-2">
            <table className="w-full text-left border-collapse text-slate-600">
              <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="p-4 pl-6">结算批次编码</th>
                  <th className="p-4">关联PO采购单项</th>
                  <th className="p-4 text-center">结算金额 (CNY)</th>
                  <th className="p-4 text-center">上传往来发票/回单</th>
                  <th className="p-4 text-center">到期应付款日期</th>
                  <th className="p-4 text-center">财务审查轧账状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-bold text-slate-805 font-mono">SET-202610-01</td>
                  <td className="p-4">PO-20260905 (珍珠白丝光棉T恤)</td>
                  <td className="p-4 text-center font-bold font-mono text-slate-900">¥135,000.00</td>
                  <td className="p-4 text-center text-indigo-600 underline font-bold cursor-pointer">ZH_FP_88291_01.pdf</td>
                  <td className="p-4 text-center font-bold font-mono text-slate-500">2026-10-25</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-705 border border-emerald-100">
                      已打款核销
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-bold text-slate-805 font-mono">SET-202610-02</td>
                  <td className="p-4">PO-20261011 (雅致粉公主爬服)</td>
                  <td className="p-4 text-center font-bold font-mono text-slate-905">¥58,000.00</td>
                  <td 
                    onClick={() => {
                      setModalType("bill");
                      showToast("🧾 请在此填写并上传上月已配平入库货款的对应增值税电子发票！");
                    }}
                    className="p-4 text-center text-rose-600 hover:text-rose-700 underline font-black cursor-pointer transition-colors"
                  >
                    待提交 (点此快速上传发票)
                  </td>
                  <td className="p-4 text-center font-bold font-mono text-indigo-600">2026-11-20</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-5 text-amber-600 border border-amber-100 animate-pulse">
                      待提报往来发票
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBPAGE VIEW: 发票提交 */}
      {activeTab === "发票提交" && (
        <div className="space-y-6">
          {/* Top Banner Guide Card */}
          <div className="bg-gradient-to-r from-indigo-650 via-blue-700 to-[#12002f] border border-indigo-300 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden select-none animate-fade-in">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <FileText className="w-8 h-8 text-indigo-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">自主数字化财务结算对账阶段</span>
                    <span className="bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase">
                      增值税专用/普通电子发票
                    </span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mt-1 text-[#fcfdfe]">
                    金蝶云 · 进项发票提报核对中心
                  </h3>
                  <p className="text-[11px] text-slate-200/80 mt-1 leading-snug font-medium font-sans">
                    依据国家财税与金蝶电子发票互通标准设立。供应商完成货款对账后，需立即上传对应结算批次的防伪增值税电子发票。系统将对发票号码与查验防伪码开展全自动 OCR 智能防伪和税查。
                  </p>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-6 divide-x divide-white/10 shrink-0">
                <div className="text-center px-4">
                  <span className="text-[10px] text-indigo-205 block font-black">当期预估待开票金额</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-amber-300 mt-1 block">
                    ¥ 58,000.00
                  </span>
                </div>
                <div className="text-center pl-6 pr-4">
                  <span className="text-[10px] text-indigo-205 block font-black">待查验状态批次</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-white mt-1 block">
                    1 <span className="text-xs font-sans font-medium text-slate-300">笔</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Side: Submit Form */}
            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4">
              <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
                <h4 className="font-extrabold text-[#0c1b2c] text-xs flex items-center gap-2 uppercase font-sans">
                  <UploadCloud className="w-4.5 h-4.5 text-indigo-600 animate-bounce" />
                  提报财务增值税发票
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceFormBatch("SET-202610-02");
                    setInvoiceFormNo("");
                    setInvoiceFormAmount("58000");
                    setInvoiceFormTaxRate("13%");
                    setInvoiceFormComments("");
                    setUploadedInvoiceFile(null);
                    showToast("🧹 表单数据已全部重置");
                  }}
                  className="text-slate-400 hover:text-slate-650 flex items-center gap-1 font-bold scale-90"
                  title="重打清空输入项"
                >
                  <RefreshCw className="w-3 h-3" />
                  重置
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!invoiceFormNo.trim()) {
                    showToast("❌ 请录入正确的国家防伪发票号码 (8位或20位)！");
                    return;
                  }
                  if (!uploadedInvoiceFile) {
                    showToast("❌ 请上传发票的 PDF 电子档并查验！");
                    return;
                  }
                  if (!parseFloat(invoiceFormAmount)) {
                    showToast("❌ 请录入发票对应的校验含税结算金额！");
                    return;
                  }

                  const currentTaxRateNum = parseFloat(invoiceFormTaxRate.replace("%", "")) || 0;
                  const computedTaxAmount = (parseFloat(invoiceFormAmount) * currentTaxRateNum / 100).toFixed(2);

                  const newInvoice = {
                    id: "INV-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(100 + Math.random() * 900),
                    amount: parseFloat(invoiceFormAmount),
                    taxRate: invoiceFormTaxRate,
                    taxAmount: parseFloat(computedTaxAmount),
                    batchNo: invoiceFormBatch,
                    invoiceNo: invoiceFormNo,
                    fileName: uploadedInvoiceFile,
                    status: "财务审核中",
                    date: new Date().toISOString().slice(0, 10),
                    comments: invoiceFormComments || "对账一致转出的结算批次货款发票提报"
                  };

                  setInvoices([newInvoice, ...invoices]);
                  showToast("🎉 发票已提报成功！已录入金蝶云查验对账流程。");
                  
                  // clear state
                  setInvoiceFormNo("");
                  setInvoiceFormComments("");
                  setUploadedInvoiceFile(null);
                }}
                className="space-y-4 text-xs font-semibold"
              >
                {/* Field 1: Associated batch */}
                <div className="space-y-1 font-sans">
                  <span className="text-slate-500 block">关联货款结算批次 *</span>
                  <select
                    value={invoiceFormBatch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInvoiceFormBatch(val);
                      if (val === "SET-202610-02") {
                        setInvoiceFormAmount("58000");
                      } else {
                        setInvoiceFormAmount("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-800 focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="SET-202610-02">SET-202610-02 (雅致粉公主爬服大货 - 货款 ¥58,000.00)</option>
                    <option value="SET-202610-03">SET-202610-03 (深邃蓝小呢大衣定制打样 - 审理中代定款)</option>
                    <option value="MANUAL_INPUT">手动填写其他往来批次 / 零散对账件</option>
                  </select>
                </div>

                {/* Field 2: Invoice No */}
                <div className="space-y-1 font-sans">
                  <span className="text-slate-500 block">国家防伪发票号码 *</span>
                  <input
                    type="text"
                    required
                    placeholder="请输入发票右上角的 8 位或 20 位纯数字代码..."
                    value={invoiceFormNo}
                    onChange={(e) => setInvoiceFormNo(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-slate-800 focus:border-indigo-400 focus:outline-none font-mono"
                  />
                </div>

                {/* Grid for amount and tax rate */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount with tax */}
                  <div className="space-y-1 font-sans">
                    <span className="text-slate-500 block">发票含税总金额 (CNY) *</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="发票价税合计金额..."
                      value={invoiceFormAmount}
                      onChange={(e) => setInvoiceFormAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-xl text-slate-800 focus:border-indigo-400 focus:outline-none font-mono font-bold animate-pulse text-[12.5px] bg-slate-50/50"
                    />
                  </div>

                  {/* Tax Rate */}
                  <div className="space-y-1 font-sans">
                    <span className="text-slate-500 block">发票增值税税率 *</span>
                    <select
                      value={invoiceFormTaxRate}
                      onChange={(e) => setInvoiceFormTaxRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 focus:border-indigo-400 focus:outline-none"
                    >
                      <option value="13%">13% (服饰大货增值税专票)</option>
                      <option value="3%">3% (小规模纳税人增值税普票)</option>
                      <option value="1%">1% (限时减征/个独税率)</option>
                      <option value="0%">0% (特殊零税率免税)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Tax Calculation Preview */}
                {parseFloat(invoiceFormAmount) > 0 && (
                  <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl flex items-center justify-between font-mono text-[10.5px]">
                    <div>
                      <span className="text-[9px] text-slate-400 font-sans block leading-none mb-1">估算进项税款金额</span>
                      <span className="font-extrabold text-indigo-700 block">
                        ¥ {((parseFloat(invoiceFormAmount) * (parseFloat(invoiceFormTaxRate.replace("%", "")) || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-sans block leading-none mb-1">抵扣进价不含税额</span>
                      <span className="font-bold text-slate-650 block">
                        ¥ {(parseFloat(invoiceFormAmount) - (parseFloat(invoiceFormAmount) * (parseFloat(invoiceFormTaxRate.replace("%", "")) || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {/* File Upload Zone */}
                <div className="space-y-1 font-sans">
                  <span className="text-slate-500 block">点击上传发票电子文件/影像件 *</span>
                  {uploadedInvoiceFile ? (
                    <div className="bg-indigo-50 border border-indigo-250 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-150 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          PDF
                        </div>
                        <div className="space-y-0.5 leading-none">
                          <span className="font-extrabold text-indigo-850 block max-w-[170px] truncate text-[9.5px]">
                            {uploadedInvoiceFile}
                          </span>
                          <span className="text-[8.5px] text-slate-400 block font-mono">1.2 MB / 已就绪等待查验</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedInvoiceFile(null)}
                        className="text-rose-500 hover:text-rose-750 font-black px-2 py-1 bg-white hover:bg-rose-50 rounded-lg text-[9px] border border-rose-200/50 cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        const simulatedNames = [
                          "LENA_FP_织锦服饰_SET2026_02.pdf",
                          "INV_APP_HANGZHOU_ZHIJIN_58000.pdf",
                          "ELECTRONIC_ZHUANPIAO_1024.jpg",
                          "KINGDEE_EXPORT_INV8291.pdf"
                        ];
                        const chosen = simulatedNames[Math.floor(Math.random() * simulatedNames.length)];
                        setUploadedInvoiceFile(chosen);
                        showToast(`📎 成功模拟拖拽/加载本地发票 PDF: ${chosen}`);
                      }}
                      className="border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 rounded-xl p-5 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-6 h-6 text-slate-400 animate-pulse" />
                      <div>
                        <span className="font-black text-[10.5px] text-slate-700 block">点击此区域模拟上传发票 PDF 文件</span>
                        <span className="text-[8.5px] text-slate-400 block mt-0.5">支持 PDF, JPG，系统自动对齐税号查验真伪 (最限 15MB)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remarks Comments */}
                <div className="space-y-1 font-sans">
                  <span className="text-slate-500 block">给买手/财务附言（选填）</span>
                  <textarea
                    rows={2}
                    value={invoiceFormComments}
                    onChange={(e) => setInvoiceFormComments(e.target.value)}
                    placeholder="请输入对账或结算发票附加备注..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:border-indigo-400 focus:outline-none font-medium placeholder-slate-350 bg-white"
                  />
                </div>

                {/* Form submit */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#002045] hover:bg-[#072449] text-white rounded-xl font-black text-center cursor-pointer transition-all uppercase text-[11px] flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  提报金蝶云发票查验核销
                </button>
              </form>
            </div>

            {/* Right Side: Submitted Invoice Archive list (7/12 span) */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4">
              <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
                <h4 className="font-extrabold text-[#0c1b2c] text-xs flex items-center gap-2 uppercase font-sans">
                  <History className="w-4.5 h-4.5 text-indigo-650" />
                  提报发票历史记录与查验销账动态
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold font-sans">
                  对账销账: {invoices.filter((inv) => inv.status === "已过账销账").length} 笔 | 查验审核: {invoices.filter((inv) => inv.status !== "已过账销账").length} 笔
                </span>
              </div>

              {/* Invoices map */}
              <div className="space-y-3.5">
                {invoices.map((inv) => {
                  const isSuccess = inv.status === "已过账销账";
                  return (
                    <div
                      key={inv.id}
                      className={`border rounded-xl p-4 transition-all relative overflow-hidden flex flex-col space-y-2 pb-3.5 ${
                        isSuccess
                          ? "border-slate-100 bg-slate-50/10"
                          : "border-indigo-150 bg-indigo-50/15"
                      }`}
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-800 text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-250">
                            {inv.id}
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">
                            {inv.date}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[9px] border ${
                            isSuccess
                              ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                              : "bg-indigo-50 text-indigo-700 border-indigo-150 animate-pulse"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      {/* Main breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold py-1.5 border-y border-dashed border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block leading-none">结算金额 (含税)</span>
                          <span className="text-[12.5px] font-mono font-black text-[#0c1b2c] mt-1 block">
                            ¥ {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block leading-none">应征税率</span>
                          <span className="text-[12px] font-mono font-black text-indigo-700 mt-1 block">
                            {inv.taxRate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block leading-none">匹配进项税额</span>
                          <span className="text-[12px] font-mono font-black text-slate-700 mt-1 block">
                            ¥ {inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block leading-none">财务结算单</span>
                          <span className="text-[11.5px] font-mono font-bold text-slate-500 mt-1 block">
                            {inv.batchNo}
                          </span>
                        </div>
                      </div>

                      {/* Bottom attachment details and memo comments */}
                      <div className="text-[10px] space-y-1 pt-1">
                        <div className="flex items-center justify-between text-slate-500 flex-wrap gap-1">
                          <span className="font-semibold font-sans leading-none text-slate-450 text-[9.5px]">
                            发票号码: <span className="font-mono text-slate-705 font-extrabold">{inv.invoiceNo || "03300262XXXX"}</span>
                          </span>
                          <span className="font-sans flex items-center gap-1 font-bold text-indigo-650 hover:underline cursor-pointer leading-none text-[9.5px]">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            {inv.fileName}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5 italic">
                          备注说明：{inv.comments}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE VIEW: 考核排名 (NEW HIGH LEVEL BOARD) */}
      {activeTab === "考核排名" && (
        <div className="space-y-6">
          {/* Top evaluation card */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-605 to-[#002045] border border-amber-300 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden select-none">
            {/* Ambient lighting backdrop effect */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200">2026年 第三季度综合考核评测结果</span>
                    <span className="bg-amber-400 text-[#0b1c30] text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase">S级 卓越标杆</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mt-1 text-[#fcfdfe]">
                    杭州织锦服饰有限公司 — 全链路协同考评仪表盘
                  </h3>
                  <p className="text-[11px] text-slate-200/80 mt-1 leading-snug">
                    依据 LenaKids 供应链合作算法累计。考评范围：交期承诺率、抽检合格率、款式重印、小单反应及对账即时率。
                  </p>
                </div>
              </div>

              {/* Score indicators */}
              <div className="flex items-center gap-6 divide-x divide-white/10 shrink-0">
                <div className="text-center px-4">
                  <span className="text-[10px] text-amber-200 block font-black">考核评定总分</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-white mt-1 block">96.8<span className="text-xs font-sans font-medium text-amber-200"> 分</span></span>
                </div>
                <div className="text-center pl-6 pr-4">
                  <span className="text-[10px] text-amber-200 block font-black">服饰类供货排行</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-amber-350 mt-1 block">第 2 <span className="text-xs font-sans font-medium text-slate-300">/ 32 强</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual core ratings scores */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-6">
              <h4 className="font-extrabold text-slate-805 text-[12.5px] uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 animate-rotate" />
                关键考核维度多频比对
              </h4>

              {/* Linear dimension bars comparison with industry average */}
              <div className="space-y-4 text-xs">
                {/* Metric 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="text-slate-700">📆 大货交付承诺达成率 (Delivery On-Time Rate)</span>
                    <div className="space-x-2 text-slate-500 font-mono text-[10.5px]">
                      <span className="text-indigo-650 font-black">我司: 98.2%</span>
                      <span>行业中游: 92.5%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-indigo-600 rounded-full z-10" style={{ width: "98.2%" }} />
                    <div className="absolute top-0 left-0 bottom-0 bg-slate-300 rounded-full" style={{ width: "92.5%" }} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="text-slate-700">🔬 面辅料/成衣QC抽检合格率 (Quality Defect Pass Rate)</span>
                    <div className="space-x-2 text-slate-500 font-mono text-[10.5px]">
                      <span className="text-emerald-600 font-black">我司: 99.1%</span>
                      <span>行业中游: 97.4%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-emerald-600 rounded-full z-10" style={{ width: "99.1%" }} />
                    <div className="absolute top-0 left-0 bottom-0 bg-slate-300 rounded-full" style={{ width: "97.4%" }} />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="text-slate-700">🤝 应急柔性追单与备料配合 (Urgent Production Flex)</span>
                    <div className="space-x-2 text-slate-500 font-mono text-[10.5px]">
                      <span className="text-amber-600 font-black">我司: 95.0%</span>
                      <span>行业中游: 88.0%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-amber-500 rounded-full z-10" style={{ width: "95%" }} />
                    <div className="absolute top-0 left-0 bottom-0 bg-slate-300 rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="text-slate-700">✏️ 首制打样及审单一次通过率 (First Sample Approval)</span>
                    <div className="space-x-2 text-slate-500 font-mono text-[10.5px]">
                      <span className="text-sky-600 font-black">我司: 94.0% (打样3.5天)</span>
                      <span>行业中游: 82.0% (打样4.8天)</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-sky-500 rounded-full z-10" style={{ width: "94%" }} />
                    <div className="absolute top-0 left-0 bottom-0 bg-slate-300 rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>

                {/* Metric 5 */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="text-slate-700">💬 异常质量批次回复即时率 (Dispute Action Period)</span>
                    <div className="space-x-2 text-slate-500 font-mono text-[10.5px]">
                      <span className="text-rose-650 font-black">我司: 93.0% (平均1.2天)</span>
                      <span>行业中游: 85.0% (平均2.1天)</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-rose-500 rounded-full z-10" style={{ width: "93%" }} />
                    <div className="absolute top-0 left-0 bottom-0 bg-slate-300 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>

              {/* Buyer feedback review note */}
              <div className="p-4 bg-emerald-50 border border-emerald-100/60 rounded-xl space-y-1.5 leading-relaxed text-[11px] text-emerald-805">
                <span className="font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                  采供协同评价与官方寄语清单：
                </span>
                <p className="text-slate-650 font-bold">
                  “本季度杭州织锦服饰有限公司展现了业内最高标准的车间工艺纪律。大货不合格开票率极低（&lt;0.5%），在极速追返和雅致粉公主爬服的应急开款上打样响应迅捷，期望继续保持！下季度配合采供财税系统，力争进一步提升发票对单轧账的数字化提报合规即时率。”
                </p>
              </div>
            </div>

            {/* Red & Black Honorable Top Rankings lists */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4">
              <h4 className="font-black text-[#0b1c30] text-xs flex items-center gap-1.5 uppercase">
                <Award className="w-4.5 h-4.5 text-amber-500" />
                同类服饰制造协同红黑荣誉榜
              </h4>
              <p className="text-[10px] text-slate-405 leading-snug">
                本平台协同工厂考核评级每月更新：基于真实的到货交期记录与买手联合质检大货通报进行精确运算。
              </p>

              {/* Ranks loops */}
              <div className="space-y-2.5 select-none">
                {[
                  { rank: 1, name: "海宁市宇通制衣有限公司", desc: "针织/外套工艺组", score: 98.2, quality: "99.6%" },
                  { rank: 2, name: "杭州织锦服饰有限公司 (我司)", desc: "梭织/女童装定制组", score: 96.8, quality: "99.1%", isSelf: true },
                  { rank: 3, name: "绍兴柯桥越秀纺织面料厂", desc: "面料精织研发组", score: 94.5, quality: "98.5%" },
                  { rank: 4, name: "常熟万达服饰制造有限公司", desc: "重工羽绒组", score: 92.1, quality: "98.0%" },
                  { rank: 5, name: "宁波申洲针织联合纺织总厂", desc: "外贸童装辅料组", score: 91.8, quality: "97.8%" }
                ].map((r, i) => (
                  <div key={r.rank} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    r.isSelf 
                      ? "bg-amber-50/40 border-amber-300 shadow-sm" 
                      : "bg-[#fcfdfe] border-slate-100 hover:bg-slate-50"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-5.5 h-5.5 rounded flex items-center justify-center font-bold font-mono text-[10.5px] ${
                        i === 0 
                          ? "bg-amber-500 text-white" 
                          : i === 1 
                            ? "bg-amber-100 text-amber-805 ring-1 ring-amber-300" 
                            : i === 2 
                              ? "bg-amber-700 text-white" 
                              : "bg-slate-200 text-slate-500"
                      }`}>
                        {r.rank}
                      </div>
                      <div>
                        <span className={`text-[11px] block ${r.isSelf ? "font-black text-[#0c1b2c]" : "font-bold text-slate-705"}`} title={r.name}>
                          {r.name}
                        </span>
                        <span className="text-[9px] text-[#006591] block mt-0.5 font-bold font-sans">{r.desc}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[11px] font-black text-slate-800 font-mono block">{r.score} 分</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">合格率 {r.quality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE VIEW: 客户投诉与质量问题反馈 (已合并) */}
      {activeTab === "客户投诉" && (
        <div className="space-y-6">
          {/* Top customer feedback card */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-750 to-[#0e0012] border border-rose-300 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden select-none">
            {/* Ambient lighting backdrop effect */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-rose-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-200">全链路品质安全监控</span>
                    <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase animate-pulse">只读工作台</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mt-1 text-[#fcfdfe]">
                    终端客户投诉 & 产品质量反馈中心 (客户投诉)
                  </h3>
                  <p className="text-[11px] text-slate-200/80 mt-1 leading-snug">
                    收集来自 Lenakids 各大直营商场百货、旗舰店、终端消费者的售后工艺及质量投诉。旨在指导合作供应商优化出厂工艺、改进对版大货。
                  </p>
                </div>
              </div>

              {/* Stats indicators */}
              <div className="flex items-center gap-6 divide-x divide-white/10 shrink-0">
                <div className="text-center px-4">
                  <span className="text-[10px] text-rose-100 block font-black uppercase tracking-wider">限时备件客诉</span>
                  <span className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-white animate-pulse mt-1 block">
                    {filteredIssues.length}<span className="text-xs font-sans font-medium text-rose-200 ml-1">件</span>
                  </span>
                </div>
                <div className="text-center pl-6 pr-4">
                  <span className="text-[10px] text-rose-200 block font-black uppercase tracking-wider">质量考核已结案</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-white/90 mt-1 block">15<span className="text-xs font-sans font-medium text-slate-300 ml-1">批次</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Filters Row - INCREASED HEIGHT */}
          <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-3xs flex flex-wrap items-center gap-4 select-none">
            <div className="flex items-center gap-1.5 font-bold text-slate-550 mr-1 shrink-0">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] text-slate-600">快速检索:</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 min-w-[280px]">
              {/* Style input */}
              <div className="space-y-1 font-sans">
                <label className="text-[10px] text-slate-400 font-extrabold block uppercase">款号</label>
                <input
                  type="text"
                  placeholder="如：26041503"
                  value={issueStyleFilter}
                  onChange={(e) => setIssueStyleFilter(e.target.value)}
                  className="w-full px-4 h-12 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-slate-705 font-bold text-[12px] font-mono shadow-3xs"
                />
              </div>
              {/* SKU input */}
              <div className="space-y-1 font-sans">
                <label className="text-[10px] text-slate-400 font-extrabold block uppercase">商品编码 / SKU</label>
                <input
                  type="text"
                  placeholder="输入SKU查找"
                  value={issueSkuFilter}
                  onChange={(e) => setIssueSkuFilter(e.target.value)}
                  className="w-full px-4 h-12 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-slate-705 font-bold text-[12px] font-mono shadow-3xs"
                />
              </div>
              {/* Position Selector */}
              <div className="space-y-1 font-sans">
                <label className="text-[10px] text-slate-405 font-extrabold block">问题部位</label>
                <select
                  value={issuePositionFilter}
                  onChange={(e) => setIssuePositionFilter(e.target.value === "全部" ? "" : e.target.value)}
                  className="w-full px-3 h-12 border border-slate-205 focus:border-indigo-500 bg-white focus:outline-none rounded-xl text-slate-705 font-extrabold text-[12px] shadow-3xs cursor-pointer"
                >
                  {problemPositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              {/* Type Selector */}
              <div className="space-y-1 font-sans">
                <label className="text-[10px] text-slate-405 font-extrabold block">问题类型</label>
                <select
                  value={issueTypeFilter}
                  onChange={(e) => setIssueTypeFilter(e.target.value === "全部" ? "" : e.target.value)}
                  className="w-full px-3 h-12 border border-slate-205 focus:border-indigo-500 bg-white focus:outline-none rounded-xl text-slate-705 font-extrabold text-[12px] shadow-3xs cursor-pointer"
                >
                  {problemTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Reset Button */}
            {(issueStyleFilter || issueSkuFilter || issuePositionFilter || issueTypeFilter) && (
              <button
                onClick={() => {
                  setIssueStyleFilter("");
                  setIssueSkuFilter("");
                  setIssuePositionFilter("");
                  setIssueTypeFilter("");
                  showToast("🧹 已清空所有检索条件");
                }}
                className="px-5 h-12 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl text-[12px] cursor-pointer transition-all shadow-3xs shrink-0 self-end flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置
              </button>
            )}
          </div>

          {/* Elegant High Density ERP Table container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Top Table Summary Row */}
            <div className="px-5 py-4 border-b border-slate-50 bg-[#fafbfe]/50 flex items-center justify-between flex-wrap gap-2 text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-805 text-xs text-left">
                  📊 大货品质反馈对照及改善明细清单 (合并客户投诉原始档案)
                </span>
                <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-100 px-2.5 py-0.5 rounded-full font-extrabold">
                  当前筛选: {filteredIssues.length} 条投诉记录
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">LENAKIDS COMPLAINTS MANAGEMENT SYSTEM</span>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed select-none" style={{ minWidth: "1280px" }}>
                <thead>
                  <tr className="bg-[#fffdf2] border-b border-amber-100 text-amber-900/90 text-[11px] font-black uppercase tracking-tight select-none">
                    <th className="py-3.5 px-4 w-[110px] text-center">反馈日期</th>
                    <th className="py-3.5 px-4 w-[120px] text-center">款号</th>
                    <th className="py-3.5 px-4 w-[210px]">商品编码/SKU</th>
                    <th className="py-3.5 px-4 w-[130px]">商品名称</th>
                    <th className="py-3.5 px-4 w-[110px]">颜色 / 尺码</th>
                    <th className="py-3.5 px-4 w-[100px] text-center">问题部位</th>
                    <th className="py-3.5 px-4 w-[110px] text-center">问题类型</th>
                    <th className="py-3.5 px-4 w-[280px]">客户原始投诉与售后诉求</th>
                    <th className="py-3.5 px-4 w-[80px] text-center">频次</th>
                    <th className="py-3.5 px-4 w-[240px]">工艺改良官方建议</th>
                    <th className="py-3.5 px-4 w-[140px] text-right">外观佐证图片</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-750 text-xs">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-slate-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertTriangle className="w-8 h-8 text-slate-300 animate-bounce" />
                          <span className="text-[12px] text-slate-500 font-bold">没有匹配符合当前筛选的客户投诉反馈</span>
                          <span className="text-[10px] text-slate-400">请尝试更换检索关键词、更正款号或重置筛选条件</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => {
                      return (
                        <tr key={issue.id} className="hover:bg-[#fafbfe]/50 transition-colors">
                          {/* Date */}
                          <td className="py-3 px-4 text-center font-bold text-slate-550 font-sans">
                            {issue.feedbackDate}
                          </td>
                          {/* Style */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-indigo-900">
                            {issue.styleNo}
                          </td>
                          {/* SKU */}
                          <td className="py-3 px-4 font-mono text-[10.5px] font-bold text-slate-700 select-all truncate tracking-tight" title={issue.sku}>
                            {issue.sku}
                          </td>
                          {/* Product name */}
                          <td className="py-3 px-4 font-bold text-slate-600 truncate">
                            {issue.productName || "-"}
                          </td>
                          {/* Color / size */}
                          <td className="py-3 px-4 text-slate-500 font-bold truncate">
                            {issue.color} / {issue.size}
                          </td>
                          {/* Location */}
                          <td className="py-3 px-4 text-center">
                            <span className="bg-slate-100/80 text-slate-700/80 px-2 py-0.8 rounded-md text-[10px] font-black border border-slate-200/55">
                              {issue.issuePosition}
                            </span>
                          </td>
                          {/* Type */}
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.8 rounded-md text-[10px] font-black border ${
                              issue.issueType === "开线" 
                                ? "bg-rose-50 border-rose-100 text-rose-700" 
                                : issue.issueType === "破洞" || issue.issueType === "蕾丝破损"
                                  ? "bg-red-50 border-red-100 text-red-700"
                                  : issue.issueType === "掉钻" || issue.issueType === "配件缺失" || issue.issueType === "吊坠缺失" || issue.issueType === "蝴蝶结掉落"
                                    ? "bg-amber-50 border-amber-100 text-amber-700"
                                    : issue.issueType === "起毛"
                                      ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                                      : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}>
                              {issue.issueType}
                            </span>
                          </td>
                          {/* Description */}
                          <td className="py-3 px-4 font-medium text-slate-600 leading-relaxed max-w-[280px] text-[11px] select-text">
                            {issue.issueDescription}
                          </td>
                          {/* Count */}
                          <td className="py-3 px-4 text-center font-bold text-slate-600 font-sans">
                            {issue.feedbackCount} 次
                          </td>
                          {/* Helper Remarks */}
                          <td className="py-3 px-4 text-[#00254e] font-bold whitespace-pre-wrap leading-relaxed text-[11px]">
                            🔔 {issue.supplierRemark || "-"}
                          </td>
                          {/* Images column on the rightmost */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {issue.images && issue.images.length > 0 ? (
                                issue.images.map((img: any, idx: number) => (
                                  <div 
                                    key={img.id}
                                    onClick={() => {
                                      setPreviewImages(issue.images);
                                      setCurrentPreviewIndex(idx);
                                      setPreviewZoom(1);
                                      setPreviewRotation(0);
                                    }}
                                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 cursor-pointer shadow-3xs group hover:border-indigo-400 hover:shadow-1xs transition-all shrink-0 bg-slate-50"
                                  >
                                    <img
                                      src={img.thumbnailUrl || img.url}
                                      alt="Closeup defect asset"
                                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                      <Eye className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold italic">暂无图片</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Simple Pagination placeholders */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-[11px]">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                显示第 1-{filteredIssues.length} 条数据 · 共计 {filteredIssues.length} 条记录
              </span>
              <div className="flex items-center gap-1.5 text-[10.5px]">
                <button disabled className="px-3 py-1.5 text-slate-350 border border-slate-150 bg-slate-100/60 font-bold rounded-xl cursor-not-allowed">上一页</button>
                <button className="px-3 py-1.5 bg-white text-indigo-750 font-black border border-indigo-200 rounded-xl shadow-3xs cursor-default">1</button>
                <button disabled className="px-3 py-1.5 text-slate-350 border border-slate-150 bg-slate-100/60 font-bold rounded-xl cursor-not-allowed">下一页</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up modals sheets for Interactive controls */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-[#001026]/40 backdrop-blur-xs"
            />

            {/* Modal Panel container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0.9 }}
              className="relative w-full max-w-sm bg-white border border-slate-100 rounded-2xl p-6 shadow-2xl flex flex-col space-y-4"
            >
              {/* Header */}
              <div className="pb-1 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h5 className="font-black text-slate-800 text-[13px]">
                    {modalType === "quote" ? "提报新款打样报价单" : modalType === "bill" ? "上传财务核对发票账单" : "产品款号设计说明"}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">请输入或上传相关上行结算、交付核心数据</p>
                </div>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 bg-[#f9fafc] rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Detail read-only preview */}
              {modalType === "detail" ? (
                <div className="space-y-3 font-sans text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                    <span className="text-[9px] text-slate-400 block">款号标志项</span>
                    <p className="font-bold text-slate-800 text-[13px]">{selectedSku}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                      <span>规格颜色: 默认定制款</span>
                      <span>工时成本: 45.00+13.00 CNY</span>
                      <span>生产时序: 30-45天</span>
                      <span>瑕疵控制要求: &lt;2.0%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalType(null)}
                    type="button"
                    className="w-full py-2 bg-[#002045] text-white font-extrabold rounded-xl text-center cursor-pointer"
                  >
                    我知道了
                  </button>
                </div>
              ) : (
                /* Interactive Forms */
                <form onSubmit={handleActionSubmit} className="space-y-3 text-xs leading-normal">
                  <div className="space-y-1 font-sans">
                    <span className="font-bold text-slate-600 block">
                      {modalType === "quote" ? "请输入提报款号 *" : "发票或账单附言"}
                    </span>
                    {modalType === "quote" ? (
                      <input
                        type="text"
                        required
                        placeholder="如 LN-2502-W03 or LN-2024-W01..."
                        className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-slate-800 font-mono"
                      />
                    ) : (
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800">
                        <option value="LN-2024-W01">LN-2024-W01 - 雅致粉</option>
                        <option value="LN-2024-W02">LN-2024-W02 - 深邃蓝</option>
                        <option value="LN-2501-M10">LN-2501-M10 - 珍珠白</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1 font-sans">
                    <span className="font-bold text-slate-600 block">
                      {modalType === "quote" ? "核定含税单件成本 (CNY) *" : "上传物料/发票 PDF 或 JPG 回单 *"}
                    </span>
                    {modalType === "quote" ? (
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="请输入您的含税报价成本，例: 63.80"
                        className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-0 rounded-xl font-bold font-mono text-slate-900"
                      />
                    ) : (
                      <div className="border border-dashed border-slate-350 bg-slate-50/50 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer hover:bg-slate-50/80 transition-colors">
                        <FileText className="w-7 h-7 text-slate-405" />
                        <span className="font-extrabold text-[10.5px] text-slate-600">点击或将电子发票拖拽至此上传</span>
                        <span className="text-[9px] text-slate-400 block">支持 JPG, PNG, PDF 文件格式，最大限制 10MB</span>
                      </div>
                    )}
                  </div>

                  {modalType === "quote" && (
                    <div className="space-y-1 font-sans">
                      <span className="font-bold text-slate-550 block">货期时效及打样规格说明</span>
                      <textarea
                        rows={2}
                        placeholder="例：纯棉爬服，面料克重220g，首批订单需要35天供货..."
                        className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2.5 font-bold">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-1.8 text-slate-500 hover:text-slate-705 border border-slate-205 bg-white hover:bg-slate-50 rounded-xl leading-none cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.8 bg-[#002045] text-white hover:bg-[#07244a] rounded-xl leading-none transition-all shadow-xs cursor-pointer"
                    >
                      保存并提交
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN PHOTO LIGHTBOX */}
      <AnimatePresence>
        {previewImages && previewImages.length > 0 && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none font-sans">
            {/* Click backdrop to exit */}
            <div className="absolute inset-0 cursor-default" onClick={() => setPreviewImages([])} />

            {/* Controls panel header */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-center text-white z-10 bg-slate-950/20 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="bg-white/10 px-3.5 py-1.8 rounded-xl border border-white/15 text-xs font-black tracking-tight">
                  📷 关联问题照片佐证: {currentPreviewIndex + 1} / {previewImages.length}
                </span>
                <span className="text-[10px] text-slate-405 font-mono">比例: {(previewZoom * 100).toFixed(0)}% | 偏角: {previewRotation}°</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom In button */}
                <button 
                  onClick={() => setPreviewZoom(z => Math.min(z + 0.25, 3.0))}
                  title="放大图片"
                  className="p-2 text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer transition-all active:scale-95"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {/* Zoom Out button */}
                <button 
                  onClick={() => setPreviewZoom(z => Math.max(z - 0.25, 0.5))}
                  title="缩小图片"
                  className="p-2 text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer transition-all active:scale-95"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                {/* Rotate button */}
                <button 
                  onClick={() => setPreviewRotation(r => (r + 90) % 360)}
                  title="顺时针旋转90°"
                  className="p-2 text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer transition-all active:scale-95"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                {/* Reset button */}
                <button 
                  onClick={() => { setPreviewZoom(1); setPreviewRotation(0); }}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl font-bold cursor-pointer transition-all active:scale-95"
                >
                  重置画布
                </button>
                {/* Close button */}
                <button 
                  onClick={() => setPreviewImages([])}
                  title="关闭大图预览"
                  className="p-2 text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 rounded-xl cursor-pointer ml-3 transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Left navigation arrow */}
            {previewImages.length > 1 && (
              <button
                onClick={() => {
                  setPreviewZoom(1);
                  setPreviewRotation(0);
                  setCurrentPreviewIndex(i => (i - 1 + previewImages.length) % previewImages.length);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3.5 bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/20 rounded-full text-white cursor-pointer z-10 backdrop-blur-xs transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Stage Image wrapper */}
            <div className="absolute inset-20 flex items-center justify-center overflow-hidden font-sans">
              <motion.img
                key={previewImages[currentPreviewIndex].id}
                src={previewImages[currentPreviewIndex].url}
                alt="Defect details closeup view"
                className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl origin-center"
                style={{
                  transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                }}
                animate={{ scale: previewZoom, rotate: previewRotation }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right navigation arrow */}
            {previewImages.length > 1 && (
              <button
                onClick={() => {
                  setPreviewZoom(1);
                  setPreviewRotation(0);
                  setCurrentPreviewIndex(i => (i + 1) % previewImages.length);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3.5 bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/20 rounded-full text-white cursor-pointer z-10 backdrop-blur-xs transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
