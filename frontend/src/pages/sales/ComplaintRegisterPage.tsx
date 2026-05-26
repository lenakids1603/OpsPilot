/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FileText, Plus, Search, Filter, ShieldAlert, CheckCircle2, XCircle, Info,
  AlertTriangle, Copy, Trash2, Edit3, Image as ImageIcon, History, Download,
  Check, ArrowRight, Loader2, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, ZoomIn, Settings
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { 
  getComplaintsList, getComplaintStats, createComplaint, updateComplaint, 
  deleteComplaint, getComplaintChangeLogs, deleteComplaintImage, checkDuplicateOrder,
  ProductComplaint, ComplaintImage, ComplaintChangeLog, ComplaintStats
} from "../../api/sales";

// Common lists for customer complaint fields
const PLATFORM_OPTIONS = ["抖音", "淘宝", "天猫", "快手", "小红书", "其他"];

const SHOP_OPTIONS = ["莉娜贝贝旗舰店", "LenaKids直营店", "莉娜臻选", "拼多多-特惠组", "天猫乐那自营", "小红书品牌店"];

const PROBLEM_TYPE_OPTIONS = [
  "开线", "破洞 / 纱破", "掉钻 / 掉饰品", "配件缺失", "起毛", "色差", 
  "染色", "脏污", "尺码问题", "做工问题", "面料问题", "包装问题", "错发", "漏发", "少件", "其他"
];

const SEVERITY_OPTIONS = ["轻微", "一般", "严重"];

const RESPONSIBILITY_OPTIONS = ["供应商", "仓库", "物流", "客服", "顾客", "待判定"];

const STATUS_OPTIONS = ["待处理", "处理中", "待仓库复核", "待供应商确认", "已处理", "已关闭", "无效投诉"];

const SUPPLIERS_OPTIONS = [
  { id: "SPL-01", name: "海安莱那织造有限公司" },
  { id: "SPL-02", name: "温岭市依依童装制品厂" },
  { id: "SPL-03", name: "常熟汇豪针织加工商行" },
  { id: "SPL-04", name: "湖州织里金丝儿服饰厂" },
  { id: "SPL-05", name: "常熟市叮当猫服饰有限公司" },
  { id: "SPL-06", name: "杭州织锦服饰有限公司" }
];

export default function ComplaintRegisterPage() {
  // Query States
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [platform, setPlatform] = useState("全部");
  const [shopCode, setShopCode] = useState("全部");
  const [problemType, setProblemType] = useState("全部");
  const [complaintStatus, setComplaintStatus] = useState("全部");
  const [responsibility, setResponsibility] = useState("全部");
  const [hasImg, setHasImg] = useState("all"); // "yes" | "no" | "all"
  const [needFollow, setNeedFollow] = useState("全部");

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<ProductComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Widget Numbers State
  const [stats, setStats] = useState<ComplaintStats>({
    todayCount: 0,
    monthCount: 0,
    pendingCount: 0,
    needFollowCount: 0
  });

  // Dialog / Drawer Toggle UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; filename: string } | null>(null);

  // Active Target Selection
  const [activeComplaint, setActiveComplaint] = useState<ProductComplaint | null>(null);
  const [activeLogs, setActiveLogs] = useState<ComplaintChangeLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Form Field States (Edit / Create)
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [fdComplaintDate, setFdComplaintDate] = useState("");
  const [fdPlatform, setFdPlatform] = useState<"抖音" | "淘宝" | "天猫" | "快手" | "小红书" | "其他">("抖音");
  const [fdShopCode, setFdShopCode] = useState("");
  const [fdOrderNo, setFdOrderNo] = useState("");
  const [fdAfterSaleNo, setFdAfterSaleNo] = useState("");
  const [fdCustomerNickname, setFdCustomerNickname] = useState("");
  const [fdCustomerServiceRemark, setFdCustomerServiceRemark] = useState("");
  const [fdStyleNo, setFdStyleNo] = useState("");
  const [fdSkuCode, setFdSkuCode] = useState("");
  const [fdProductName, setFdProductName] = useState("");
  const [fdColor, setFdColor] = useState("");
  const [fdSize, setFdSize] = useState("");
  const [fdSupplierId, setFdSupplierId] = useState("");
  const [fdSupplierName, setFdSupplierName] = useState("");
  const [fdNewArrivalBatch, setFdNewArrivalBatch] = useState("");
  const [fdAffectResale, setFdAffectResale] = useState<"是" | "否" | "不确定">("不确定");
  const [fdProblemType, setFdProblemType] = useState("");
  const [fdProblemDesc, setFdProblemDesc] = useState("");
  const [fdSeverity, setFdSeverity] = useState<"轻微" | "一般" | "严重">("一般");
  const [fdResponsibility, setFdResponsibility] = useState<"供应商" | "仓库" | "物流" | "客服" | "顾客" | "待判定">("待判定");
  const [fdStatus, setFdStatus] = useState<any>("待处理");
  const [fdHandleResult, setFdHandleResult] = useState("");
  const [fdRefundAmount, setFdRefundAmount] = useState<number | "">("");
  const [fdCompensationAmount, setFdCompensationAmount] = useState<number | "">("");
  const [fdNeedSupplierFollow, setFdNeedSupplierFollow] = useState<"是" | "否">("否");
  const [fdIncludedInQualityStats, setFdIncludedInQualityStats] = useState<"是" | "否">("是");

  // Dynamic duplicate order checker states
  const [orderCheckWarning, setOrderCheckWarning] = useState(false);
  const [isCheckingOrder, setIsCheckingOrder] = useState(false);

  // Local Image Queues (for Creation stage before ID exists)
  const [imageQueue, setImageQueue] = useState<{ file: File; compressedBlob: Blob; originalSize: number; compressedSize: number; previewUrl: string }[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Main Listing data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getComplaintsList({
        page,
        pageSize,
        dateStart,
        dateEnd,
        platform: platform === "全部" ? "" : platform,
        shop_code: shopCode === "全部" ? "" : shopCode,
        problem_type: problemType === "全部" ? "" : problemType,
        status: complaintStatus === "全部" ? "" : complaintStatus,
        responsibility: responsibility === "全部" ? "" : responsibility,
        hasImg,
        needFollow: needFollow === "全部" ? "" : needFollow,
        search
      });
      if (res.success && res.data) {
        setList(res.data.items);
        setTotal(res.data.total);
      }

      // Reload widget stats parallelly
      const statsRes = await getComplaintStats();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (e) {
      console.error("加载商品投诉明细失败", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on parameters changes
  useEffect(() => {
    loadData();
  }, [page, pageSize, platform, shopCode, problemType, complaintStatus, responsibility, hasImg, needFollow, dateStart, dateEnd]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Order Duplicate Validation Trigger
  const handleOrderNoBlur = async () => {
    if (!fdOrderNo.trim() || formMode === "edit") {
      setOrderCheckWarning(false);
      return;
    }
    setIsCheckingOrder(true);
    try {
      const res = await checkDuplicateOrder(fdOrderNo.trim());
      if (res.success && res.data?.exist) {
        setOrderCheckWarning(true);
      } else {
        setOrderCheckWarning(false);
      }
    } catch {
      // ignore
    } finally {
      setIsCheckingOrder(false);
    }
  };

  // Reset Filters wrapper
  const handleResetFilters = () => {
    setSearch("");
    setDateStart("");
    setDateEnd("");
    setPlatform("全部");
    setShopCode("全部");
    setProblemType("全部");
    setComplaintStatus("全部");
    setResponsibility("全部");
    setHasImg("all");
    setNeedFollow("全部");
    setPage(1);
    showToast("🧹 已重置所有数据检索过滤项。");
  };

  // Toast UI notification mockup (system utility)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Excel trigger
  const handleExportExcel = () => {
    setIsExporting(true);
    showToast("💾 正在从云端编译并下载最新高密度 Excel 特制账表...");
    
    setTimeout(() => {
      const query = new URLSearchParams();
      const filters = {
        dateStart,
        dateEnd,
        platform: platform === "全部" ? "" : platform,
        shop_code: shopCode === "全部" ? "" : shopCode,
        problem_type: problemType === "全部" ? "" : problemType,
        status: complaintStatus === "全部" ? "" : complaintStatus,
        responsibility: responsibility === "全部" ? "" : responsibility,
        hasImg,
        needFollow: needFollow === "全部" ? "" : needFollow,
        search
      };

      Object.entries(filters).forEach(([key, val]) => {
        if (val) query.append(key, String(val));
      });

      // Browser direct file fetch
      window.open(`/api/customer-service/product-complaints/export?${query.toString()}`);
      setIsExporting(false);
      showToast("📥 导出成功！请查收下载的标准格式 Excel 文件「商品投诉登记_YYYYMMDD_HHmmss.xlsx」");
    }, 1200);
  };

  // Open creation modal
  const handleOpenCreateForm = () => {
    setFormMode("create");
    setActiveComplaint(null);
    setFdComplaintDate(new Date().toISOString().split("T")[0]);
    setFdPlatform("抖音");
    setFdShopCode("莉娜贝贝旗舰店");
    setFdOrderNo("");
    setFdAfterSaleNo("");
    setFdCustomerNickname("");
    setFdCustomerServiceRemark("");
    setFdStyleNo("");
    setFdSkuCode("");
    setFdProductName("");
    setFdColor("");
    setFdSize("");
    setFdSupplierId("SPL-01");
    setFdSupplierName("海安莱那织造有限公司");
    setFdNewArrivalBatch("");
    setFdAffectResale("否");
    setFdProblemType("破洞 / 纱破");
    setFdProblemDesc("");
    setFdSeverity("一般");
    setFdResponsibility("供应商");
    setFdStatus("待处理");
    setFdHandleResult("");
    setFdRefundAmount("");
    setFdCompensationAmount("");
    setFdNeedSupplierFollow("是");
    setFdIncludedInQualityStats("是");

    setOrderCheckWarning(false);
    setImageQueue([]);
    setIsFormOpen(true);
  };

  // Open edit details modal
  const handleOpenEditForm = async (complaint: ProductComplaint) => {
    setFormMode("edit");
    setActiveComplaint(complaint);
    setFdComplaintDate(complaint.complaint_date);
    setFdPlatform(complaint.platform);
    setFdShopCode(complaint.shop_code);
    setFdOrderNo(complaint.order_no);
    setFdAfterSaleNo(complaint.after_sale_no || "");
    setFdCustomerNickname(complaint.customer_nickname || "");
    setFdCustomerServiceRemark(complaint.customer_service_remark || "");
    setFdStyleNo(complaint.style_no);
    setFdSkuCode(complaint.sku_code);
    setFdProductName(complaint.product_name || "");
    setFdColor(complaint.color || "");
    setFdSize(complaint.size || "");
    setFdSupplierId(complaint.supplier_id || "SPL-01");
    setFdSupplierName(complaint.supplier_name || "海安莱那织造有限公司");
    setFdNewArrivalBatch(complaint.new_arrival_batch || "");
    setFdAffectResale(complaint.affect_resale);
    setFdProblemType(complaint.problem_type);
    setFdProblemDesc(complaint.problem_desc);
    setFdSeverity(complaint.severity);
    setFdResponsibility(complaint.responsibility);
    setFdStatus(complaint.status);
    setFdHandleResult(complaint.handle_result || "");
    setFdRefundAmount(complaint.refund_amount !== undefined ? complaint.refund_amount : "");
    setFdCompensationAmount(complaint.compensation_amount !== undefined ? complaint.compensation_amount : "");
    setFdNeedSupplierFollow(complaint.need_supplier_follow);
    setFdIncludedInQualityStats(complaint.included_in_quality_stats);

    setOrderCheckWarning(false);
    setImageQueue([]);
    setIsFormOpen(true);
  };

  // View historical tracks
  const handleOpenLogsDrawer = async (complaint: ProductComplaint) => {
    setIsLogsLoading(true);
    setActiveComplaint(complaint);
    setIsLogsOpen(true);
    try {
      const res = await getComplaintChangeLogs(complaint.id);
      if (res.success && res.data) {
        setActiveLogs(res.data);
      }
    } catch (e) {
      console.error("加载变更日志轨迹失败", e);
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Hard Delete Complaint Action
  const handleDeleteComplaint = async (id: string, codeNo: string) => {
    const doubleCheck = window.confirm(`⚠️ 安全确认：您确定要彻底【软删除】并注销 "${codeNo}" 客诉事件吗？删除后，相关已生成的供应商扣罚可能将被作废挂起。`);
    if (!doubleCheck) return;

    try {
      const res = await deleteComplaint(id);
      if (res.success) {
        showToast(`🗑️ 已成功对客诉单 "${codeNo}" 进行软删除归档注销。`);
        loadData();
      } else {
        showToast(`❌ 删除失败：${res.message}`);
      }
    } catch (e: any) {
      showToast(`❌ 异常拦截：${e.message}`);
    }
  };

  // Copy values helpers
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`📋 已将 ${label} "${text}" 复制到剪切板。`);
  };

  // Shared helper to process image files (compression, validation, etc.)
  const processFilesList = async (files: FileList | File[]) => {
    // Check count ceiling
    const existingCount = formMode === "edit" ? (activeComplaint?.images?.length || 0) : 0;
    if (existingCount + imageQueue.length + files.length > 6) {
      alert("⚠️ 单张客诉单最多仅允许上传 6 张理赔佐证图片，您选择的数量已超限！");
      return;
    }

    // Process file compression one by one
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Format constraint
      if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
        alert("⚠️ 格式不支持：仅允许上传 JPG, JPEG, PNG, WEBP 文件！");
        continue;
      }

      showToast(`✨ 前端正在实施 WebP 底损高速无感压缩: ${file.name}`);

      try {
        const compressed = await compressAndConvertToWebp(file, 1600, 0.82);
        
        // Write item into queue
        const previewUrl = URL.createObjectURL(compressed.blob);
        setImageQueue(prev => [...prev, {
          file,
          compressedBlob: compressed.blob,
          originalSize: compressed.originalSize,
          compressedSize: compressed.compressedSize,
          previewUrl
        }]);
      } catch (err: any) {
        showToast(`❌ 前端图片制备压缩失败: ${err.message}`);
      }
    }
  };

  // Client Side Canvas Image compression WebP
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await processFilesList(files);

    // Clear file input value to allow reselecting the same image
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and Drop interaction handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFilesList(e.dataTransfer.files);
    }
  };

  const removeQueueImage = (index: number) => {
    URL.revokeObjectURL(imageQueue[index].previewUrl);
    setImageQueue(prev => prev.filter((_, i) => i !== index));
    showToast("🗑️ 移除了已准备理赔上传的暂缓图片");
  };

  // Upload images to backend for existing edit mode
  const uploadQueuedImagesForID = async (id: string, queue: typeof imageQueue): Promise<boolean> => {
    setIsUploadingImages(true);
    try {
      for (const item of queue) {
        const formData = new FormData();
        const uploadFile = new File([item.compressedBlob], item.file.name.replace(/\.[^/.]+$/, "") + ".webp", {
          type: "image/webp"
        });
        formData.append("image", uploadFile);

        const savedEmail = localStorage.getItem("opspilot_user_email") || "service";
        const res = await fetch(`/api/customer-service/product-complaints/${id}/images`, {
          method: "POST",
          headers: {
            "x-user-email": savedEmail,
            // Header decode helper on backend
            "x-user-name": encodeURIComponent("系统操作员")
          },
          body: formData
        });
        const parsed = await res.json();
        if (!parsed.success) {
          showToast(`❌ 佐证图 "${item.file.name}" 写入遇到阻碍: ${parsed.message}`);
          return false;
        }
      }
      return true;
    } catch (e: any) {
      console.error(e);
      showToast(`❌ 传输理赔图片崩溃: ${e.message}`);
      return false;
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Delete live image for edit view
  const handleDeleteLiveImage = async (imageId: string, filename: string) => {
    if (!activeComplaint) return;
    const confirmDel = window.confirm(`✂️ 移除确认：您确定要从工单中删除此张佐证图片吗？`);
    if (!confirmDel) return;

    try {
      const res = await deleteComplaintImage(activeComplaint.id, imageId);
      if (res.success) {
        showToast(`✅ 佐证素材 "${filename}" 已软删除并归档。`);
        // Refresh details
        const detailRes = await getComplaintsList({ page: 1, pageSize: 1, search: activeComplaint.complaint_no });
        if (detailRes.success && detailRes.data?.items?.[0]) {
          setActiveComplaint(detailRes.data.items[0]);
          loadData();
        }
      } else {
        showToast(`❌ 移除图片失败: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`❌ 异常拦截: ${err.message}`);
    }
  };

  // Handle Create or Update Submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Chinese validations triggers
    if (!fdComplaintDate) { alert("⚠️ 请填写‘投诉日期’！"); return; }
    if (!fdOrderNo.trim()) { alert("⚠️ 请填写‘订单编号’！"); return; }
    if (!fdStyleNo.trim()) { alert("⚠️ 请选择或指定‘款号’！"); return; }
    if (!fdSkuCode.trim()) { alert("⚠️ 请指定‘商品编码（SKU）’！"); return; }
    if (!fdProblemType) { alert("⚠️ 请选择‘对应问题分类’！"); return; }
    if (!fdProblemDesc.trim()) { alert("⚠️ 请详细书写‘缺陷及文字实录’，这对供应链质量判定极为宝贵！"); return; }

    const isCreate = formMode === "create";
    const payload = {
      complaint_date: fdComplaintDate,
      platform: fdPlatform,
      shop_code: fdShopCode || "莉娜贝贝旗舰店",
      order_no: fdOrderNo.trim(),
      after_sale_no: fdAfterSaleNo.trim() || undefined,
      customer_nickname: fdCustomerNickname.trim() || undefined,
      customer_service_remark: fdCustomerServiceRemark.trim() || undefined,
      style_no: fdStyleNo.trim(),
      sku_code: fdSkuCode.trim(),
      product_name: fdProductName.trim() || undefined,
      color: fdColor.trim() || undefined,
      size: fdSize.trim() || undefined,
      supplier_id: fdSupplierId || undefined,
      supplier_name: fdSupplierName || undefined,
      new_arrival_batch: fdNewArrivalBatch.trim() || undefined,
      affect_resale: fdAffectResale,
      problem_type: fdProblemType,
      problem_desc: fdProblemDesc.trim(),
      severity: fdSeverity,
      responsibility: fdResponsibility,
      status: fdStatus,
      handle_result: fdHandleResult.trim() || undefined,
      refund_amount: fdRefundAmount !== "" ? Number(fdRefundAmount) : 0,
      compensation_amount: fdCompensationAmount !== "" ? Number(fdCompensationAmount) : 0,
      need_supplier_follow: fdNeedSupplierFollow,
      included_in_quality_stats: fdIncludedInQualityStats
    };

    setIsLoading(true);
    try {
      if (isCreate) {
        // 1. Create complaint record first
        const res = await createComplaint(payload as any);
        if (res.success && res.data) {
          const newId = res.data.id;
          const newCodeNo = res.data.complaint_no;

          // 2. If there are compressed image queue from frontend, upload them one by one
          if (imageQueue.length > 0) {
            showToast(`⚙️ 正在向单据 "${newCodeNo}" 并发上传理赔佐证图片...`);
            const uploadSuccess = await uploadQueuedImagesForID(newId, imageQueue);
            if (!uploadSuccess) {
              showToast("⚠️ 客诉单存储成功，但我发现有些佐证图片上传丢失，请在列表页重新编辑上传。");
            }
          }

          showToast(`🟢 质量问题登记成功！系统为其自动生成终身归档工号: [${newCodeNo}]。已联动供应链核扣体系！`);
          setIsFormOpen(false);
          loadData();
        } else {
          alert(`❌ 理赔落地失败: ${res.message}`);
        }
      } else {
        // Update edit mode
        if (!activeComplaint) return;
        const res = await updateComplaint(activeComplaint.id, payload as any);
        if (res.success && res.data) {
          // Upload any new queues
          if (imageQueue.length > 0) {
            showToast(`⚙️ 正在增量追加客诉理赔佐证图片...`);
            await uploadQueuedImagesForID(activeComplaint.id, imageQueue);
          }

          showToast(`🟢 商品客诉工单 [${activeComplaint.complaint_no}] 细节更正并保存。历史修补履历已归档！`);
          setIsFormOpen(false);
          loadData();
        } else {
          alert(`❌ 保障更新失败: ${res.message}`);
        }
      }
    } catch (e: any) {
      alert(`⚠️ 出现意外错误: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Compression helper
  function compressAndConvertToWebp(file: File, maxWidth = 1600, quality = 0.85): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  blob,
                  originalSize: file.size,
                  compressedSize: blob.size
                });
              } else {
                reject(new Error("Canvas conversion to Blob failed"));
              }
            },
            "image/webp",
            quality
          );
        };
        img.onerror = () => reject(new Error("Image representation loading error"));
      };
      reader.onerror = () => reject(new Error("File stream loader error"));
    });
  }

  // Pre-fill fields from pre-recorded Sku catalog helper
  const handleStyleNoChange = (style: string) => {
    setFdStyleNo(style);
    // Pre-fill model and specs
    if (style === "LN-2026-CO") {
      setFdProductName("精梳棉婴儿高奢爬服");
      setFdColor("雅致粉");
      setFdSize("80码");
      setFdSkuCode("LN-2026-CO-PN-80");
      setFdSupplierId("SPL-01");
      setFdSupplierName("海安莱那织造有限公司");
      setFdNewArrivalBatch("2026春第一批");
    } else if (style === "LN-2026-BL") {
      setFdProductName("防惊跳舒适婴儿睡袋");
      setFdColor("米白蓝星");
      setFdSize("90码");
      setFdSkuCode("LN-2026-BL-WH-90");
      setFdSupplierId("SPL-02");
      setFdSupplierName("温岭市依依童装制品厂");
      setFdNewArrivalBatch("2026春第二批");
    } else if (style === "LN-2026-SO") {
      setFdProductName("婴儿防脱口纯棉短袜3组装");
      setFdColor("浅杏/裸粉");
      setFdSize("12码(3-5岁)");
      setFdSkuCode("LN-2026-SO-BE-12");
      setFdSupplierId("SPL-03");
      setFdSupplierName("常熟汇豪针织加工商行");
      setFdNewArrivalBatch("2026春补货");
    } else if (style === "LN-2026-HD") {
      setFdProductName("蕾丝拼接荷叶边褶皱连衣裙");
      setFdColor("复古蔷薇");
      setFdSize("110码");
      setFdSkuCode("LN-2026-HD-PK-110");
      setFdSupplierId("SPL-04");
      setFdSupplierName("湖州织里金丝儿服饰厂");
      setFdNewArrivalBatch("2026夏第一批");
    } else if (style === "LN-2026-TS") {
      setFdProductName("高弹纯棉夏季印花打底T恤");
      setFdColor("奶黄小熊");
      setFdSize("100码");
      setFdSkuCode("LN-2026-TS-YL-100");
      setFdSupplierId("SPL-05");
      setFdSupplierName("常熟市叮当猫服饰有限公司");
      setFdNewArrivalBatch("2026夏推荐批");
    }
  };

  const formattedSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-6 select-text pb-12 font-sans text-slate-900 bg-[#f8f9ff]">
      
      {/* Toast Notice Float */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 bg-[#002045] border border-sky-400/20 text-white text-xs font-bold rounded-lg shadow-xl flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header with standard title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#006591]/10 flex items-center justify-center text-[#006591]">
              <FileText className="w-5 h-5" />
            </span>
            商品投诉明细列表
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            取代客服高体积 Excel 异常登记。支持 1600px 级前端无损压缩、订单查重、历史变更轨迹及月度质量对账单 Excel 智能导出。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Download className="w-4 h-4 text-slate-500" />}
            <span>导出规范 Excel</span>
          </button>

          <button
            onClick={handleOpenCreateForm}
            className="px-4 py-2.5 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#006591]/10 hover:scale-[1.01] transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>登记商品客诉</span>
          </button>
        </div>
      </div>

      {/* Bento Grid KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-[#006591]/20 transition-all">
          <div className="w-11 h-11 bg-blue-50 text-[#006591] flex items-center justify-center rounded-xl font-black">
            📈
          </div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase tracking-wider block font-bold">今日新增客诉</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">{stats.todayCount} 件</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-violet-200 transition-all">
          <div className="w-11 h-11 bg-violet-50 text-violet-600 flex items-center justify-center rounded-xl font-black">
            🗓️
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase tracking-wider block font-bold">本月累计客诉</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">{stats.monthCount} 件</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-amber-200 transition-all">
          <div className="w-11 h-11 bg-amber-50 text-amber-600 flex items-center justify-center rounded-xl font-black animate-pulse">
            ⏳
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase tracking-wider block font-bold">待处理客诉异常</span>
            <span className="text-xl font-extrabold text-amber-600 font-mono mt-0.5 block">{stats.pendingCount} 件</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-rose-200 transition-all">
          <div className="w-11 h-11 bg-rose-50 text-rose-600 flex items-center justify-center rounded-xl font-black">
            ⚙️
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase tracking-wider block font-bold">待供应商跟进制程</span>
            <span className="text-xl font-extrabold text-rose-600 font-mono mt-0.5 block">{stats.needFollowCount} 件</span>
          </div>
        </div>

      </div>

      {/* FILTER SEARCH AREA - spacious and tall as requested */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        
        {/* Row 1: Spacious Height Search and Date Picker */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 检索：输入订单编号 / 售后单号 / 故障款号 / SKU 编码 / 瑕疵原话细节进行模糊匹配..."
              className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#006591] rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                placeholder="投诉开始"
                className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              />
            </div>
            <span className="text-slate-400 text-xs">至</span>
            <div className="relative">
              <input
                type="date"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Secondary selectors bento row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-3 pt-1">
          
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 mb-1">所属平台</label>
            <select value={platform} onChange={e => { setPlatform(e.target.value); setPage(1); }} className="w-full bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-lg text-xs font-bold text-slate-700">
              <option value="全部">全部平台</option>
              {PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 mb-1">店铺名称</label>
            <select value={shopCode} onChange={e => { setShopCode(e.target.value); setPage(1); }} className="w-full bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-lg text-xs font-bold text-slate-700">
              <option value="全部">全部店铺</option>
              {SHOP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 mb-1">品质缺陷类型</label>
            <select value={problemType} onChange={e => { setProblemType(e.target.value); setPage(1); }} className="w-full bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-lg text-xs font-bold text-slate-700">
              <option value="全部">全部品质类型</option>
              {PROBLEM_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 mb-1">工单处理状态</label>
            <select value={complaintStatus} onChange={e => { setComplaintStatus(e.target.value); setPage(1); }} className="w-full bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-lg text-xs font-bold text-slate-700">
              <option value="全部">全部处理状态</option>
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 mb-1">责判定归属</label>
            <select value={responsibility} onChange={e => { setResponsibility(e.target.value); setPage(1); }} className="w-full bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-lg text-xs font-bold text-slate-700">
              <option value="全部">全部责任判定</option>
              {RESPONSIBILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 mb-1">需供应商跟进</label>
            <select value={needFollow} onChange={e => { setNeedFollow(e.target.value); setPage(1); }} className="w-full bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-lg text-xs font-bold text-slate-700">
              <option value="全部">全部跟进选项</option>
              <option value="是">需要跟进 (是)</option>
              <option value="否">不需跟进 (否)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleResetFilters}
              className="py-2.5 w-full border border-dashed border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>清空重置</span>
            </button>
          </div>

        </div>

      </div>

      {/* COMPLAINTS LIST TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11.5px] border-collapse min-w-[1240px]">
            <thead className="bg-slate-50/70 border-b border-slate-100 font-extrabold text-slate-400 text-[10px] uppercase select-none tracking-wider">
              <tr>
                <th className="p-4 w-[110px]">客诉单编号</th>
                <th className="p-4 w-[120px]">平台店铺</th>
                <th className="p-4 w-[150px]">订单 / 售后单号</th>
                <th className="p-4 w-[140px]">涉及宝贝 (款式款号)</th>
                <th className="p-4">品质问题与遭遇原话</th>
                <th className="p-4 w-[90px] text-center">判定与程度</th>
                <th className="p-4 w-[160px]">所属责任厂商 / 批次</th>
                <th className="p-4 w-[110px] text-right">退赔 / 补偿额</th>
                <th className="p-4 w-[120px] text-center">佐证图集 (compressed)</th>
                <th className="p-4 w-[100px] text-center">系统状态</th>
                <th className="p-4 w-[110px] text-right">处置项</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 text-[#006591] animate-spin" />
                      <span className="text-xs text-slate-400">正在并发检索最新质量账目档，请稍后...</span>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <span className="text-3xl block">📁</span>
                      <span className="text-xs font-bold text-slate-500 block">空白台账</span>
                      <p className="text-slate-400 text-[11px]">没有查询到与当前条件匹配的商品投诉记录件。您可以尝试扩大筛选门类，或登记爆款第一个缺陷。</p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/30 transition-all group">
                    
                    {/* ID & Date */}
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 block group-hover:text-[#006591] transition-colors">{c.complaint_no}</span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{c.complaint_date}</span>
                    </td>

                    {/* Platform & Shop */}
                    <td className="p-4 space-y-1">
                      <span className="px-1.5 py-0.5 bg-sky-50 text-sky-650 rounded text-[9.5px] font-black">{c.platform}</span>
                      <span className="text-slate-900 block font-bold text-[11px] truncate" title={c.shop_code}>{c.shop_code}</span>
                    </td>

                    {/* Order No & Copy */}
                    <td className="p-4 space-y-1 font-mono">
                      <div className="flex items-center gap-1 group/item">
                        <span className="text-slate-800 text-[11px] font-bold">{c.order_no}</span>
                        <button onClick={() => handleCopyText(c.order_no, "订单编号")} className="p-0.5 opacity-0 group-hover/item:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-all cursor-pointer">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {c.after_sale_no && (
                        <div className="flex items-center gap-1 group/item text-[10.5px] text-slate-400">
                          <span>AS:{c.after_sale_no}</span>
                          <button onClick={() => handleCopyText(c.after_sale_no!, "售后单号")} className="p-0.5 opacity-0 group-hover/item:opacity-100 hover:bg-slate-100 rounded transition-all cursor-pointer">
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* SKU Specs */}
                    <td className="p-4 text-[11px]">
                      <span className="font-mono font-black text-[#002045] block">{c.style_no}</span>
                      <span className="text-slate-900 font-bold block truncate mt-0.5" title={c.product_name || ""}>{c.product_name || "未指定商品名称"}</span>
                      {c.color && <span className="text-slate-400 text-[10px] block truncate mt-0.5">{c.color} | {c.size || "均码"}</span>}
                    </td>

                    {/* Defect Problem */}
                    <td className="p-4">
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-655 rounded text-[9.5px] border border-rose-100 font-black inline-block mb-1">{c.problem_type}</span>
                      <p className="text-slate-600 italic font-medium line-clamp-2 text-[11px]" title={c.problem_desc}>
                        "{c.problem_desc}"
                      </p>
                      {c.customer_service_remark && <span className="text-amber-600 font-bold text-[10px] block mt-1">🏷️ 客服备注: {c.customer_service_remark}</span>}
                    </td>

                    {/* Severity / responsibility */}
                    <td className="p-4 text-center space-y-1">
                      <span className={`px-1.5 py-0.5 rounded-sm font-black text-[9.5px] tracking-wider ${
                        c.severity === "严重" ? "bg-red-100 text-red-700" :
                        c.severity === "一般" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                      }`}>
                        {c.severity}
                      </span>
                      <div className="text-[10px] text-slate-450 font-bold">责: {c.responsibility}</div>
                    </td>

                    {/* Supplier details */}
                    <td className="p-4 text-[11px]">
                      {c.supplier_name ? (
                        <>
                          <span className="text-slate-900 font-bold block truncate" title={c.supplier_name}>{c.supplier_name}</span>
                          <span className="text-slate-400 text-[10px] block mt-0.5 font-mono">{c.new_arrival_batch || "无批次"}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-mono italic">-</span>
                      )}
                    </td>

                    {/* Financial stats */}
                    <td className="p-4 text-right font-mono font-extrabold text-[11px] space-y-0.5">
                      <div className="text-red-600">退: ¥{(c.refund_amount || 0).toFixed(2)}</div>
                      <div className="text-slate-500">补: ¥{(c.compensation_amount || 0).toFixed(2)}</div>
                    </td>

                    {/* Images thumbnails hover magnifying */}
                    <td className="p-4">
                      {c.images && c.images.length > 0 ? (
                        <div className="flex items-center justify-center -space-x-2.5 overflow-hidden">
                          {c.images.slice(0, 3).map((img, idx) => (
                            <div 
                              key={img.id} 
                              onClick={() => setZoomedImage({ src: img.image_url, filename: img.original_filename })}
                              className="relative cursor-pointer w-8 h-8 rounded-full border border-white hover:scale-110 shadow-xs hover:z-10 transition-transform overflow-hidden bg-slate-100 group/thumb"
                            >
                              <img src={img.thumbnail_url} alt="Defect" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all">
                                <ZoomIn className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ))}
                          {c.images.length > 3 && (
                            <span className="w-8 h-8 rounded-full bg-slate-100 border border-white text-[9px] font-black text-slate-500 flex items-center justify-center z-10">
                              +{c.images.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-slate-350 italic font-medium text-[10px] select-none">无凭证</div>
                      )}
                    </td>

                    {/* System Status badges */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        c.status === "已处理" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        c.status === "待处理" ? "bg-red-50 text-rose-600 border-rose-100 animate-pulse" :
                        c.status === "处理中" ? "bg-sky-50 text-sky-600 border-sky-100" : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Operational row actions */}
                    <td className="p-4 select-none">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          onClick={() => handleOpenLogsDrawer(c)}
                          title="查看跟进改动履历轨迹"
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditForm(c)}
                          title="修改客诉工单"
                          className="p-1 text-slate-400 hover:text-[#006591] hover:bg-slate-100 rounded cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteComplaint(c.id, c.complaint_no)}
                          title="软删除归档事件"
                          className="p-1 text-slate-350 hover:text-rose-600 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL FOOTER */}
        {!isLoading && list.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 select-none flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <span className="text-xs text-slate-455 font-semibold">
              当前检索出符合条件台账共 <strong className="text-slate-800">{total}</strong> 行，正在显示第 <strong className="text-slate-800">{(page-1)*pageSize + 1} - {Math.min(page*pageSize, total)}</strong> 行记录
            </span>

            <div className="flex items-center gap-2">
              
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>每页行数</span>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 font-bold outline-none">
                  <option value={25}>25 行</option>
                  <option value={50}>50 行</option>
                  <option value={100}>100 行</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1 hover:bg-slate-50 disabled:opacity-30 rounded cursor-pointer transition-all disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs px-2 font-mono font-bold text-slate-800">{page}</span>
                <button
                  onClick={() => setPage(p => (p * pageSize < total ? p + 1 : p))}
                  disabled={page * pageSize >= total}
                  className="p-1 hover:bg-slate-50 disabled:opacity-30 rounded cursor-pointer transition-all disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* REVISION HISTORY LOGS SIDE DRAWER */}
      <AnimatePresence>
        {isLogsOpen && activeComplaint && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogsOpen(false)} 
              className="fixed inset-0 bg-black z-[80]" 
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 select-none">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  客诉变更轨迹历史 ({activeComplaint.complaint_no})
                </span>
                <button onClick={() => setIsLogsOpen(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"><XCircle className="w-5 h-5" /></button>
              </div>

              <div className="flex-grow p-5 space-y-5 overflow-y-auto">
                {isLogsLoading ? (
                  <div className="py-24 text-center space-y-1.5">
                    <Loader2 className="w-7 h-7 text-slate-400 animate-spin mx-auto" />
                    <span className="text-xs text-slate-400 block font-bold">载入轨迹履历中...</span>
                  </div>
                ) : activeLogs.length === 0 ? (
                  <div className="py-24 text-center italic text-slate-400 text-xs">没有找到该客诉工单的可记录变更历史迹。</div>
                ) : (
                  <div className="relative border-l border-slate-100 pl-4.5 space-y-6">
                    {activeLogs.map((log) => (
                      <div key={log.id} className="relative text-xs">
                        
                        {/* Dot marker on history timeline */}
                        <div className={`absolute -left-[24px] w-2.5 h-2.5 rounded-full border-2 border-white top-1 ${
                          log.operation_type === "create" ? "bg-emerald-505 bg-emerald-500" :
                          log.operation_type === "delete" ? "bg-red-500" :
                          log.operation_type === "status_change" ? "bg-[#006591]" : "bg-amber-400"
                        }`} />

                        <div className="space-y-1 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                          
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#002045] block">{log.operator_name}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium">
                            {log.operation_type === "create" && "🆕 登记归案了这笔客诉"}
                            {log.operation_type === "delete" && "🗑️ 将其标记为了软删除"}
                            {log.operation_type === "upload_image" && `🖼️ 增量追加了证据: ${log.new_value}`}
                            {log.operation_type === "delete_image" && `✂️ 移除了旧有凭证: ${log.old_value}`}
                            {log.operation_type === "status_change" && (
                              <div className="space-y-0.5 pt-0.5">
                                <span className="text-slate-400">状态流转：</span>
                                <span className="px-1 py-0.2 bg-slate-200 text-slate-655 font-bold rounded-sm text-[10px]">{log.old_value}</span>
                                <span className="mx-1 text-slate-350">→</span>
                                <span className="px-1 py-0.2 bg-emerald-50 text-emerald-655 border border-emerald-100 font-bold rounded-sm text-[10px]">{log.new_value}</span>
                              </div>
                            )}

                            {log.operation_type === "update" && log.field_name && (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-705">修正 {log.field_label}:</span>
                                <p className="text-slate-400 truncate line-clamp-2 italic" title={log.old_value}>从 "{log.old_value || "空"}"</p>
                                <p className="text-slate-800 truncate line-clamp-2 font-bold" title={log.new_value}>修正为 "{log.new_value || "空"}"</p>
                              </div>
                            )}

                            {log.operation_type === "update" && !log.field_name && "📄 对其它辅料信息进行了修正编辑"}
                          </div>

                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FORM CREATE / EDIT EXPANDED DRAWER */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-[80]" 
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[90] flex flex-col border-l border-slate-200"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 select-none">
                <div>
                  <span className="text-xs font-black text-slate-400 block uppercase tracking-wider">{formMode === "create" ? "🆕 登记爆款客诉" : "⚙️ 更正质量单"}</span>
                  <p className="text-sm font-extrabold text-[#002045] mt-0.5">{formMode === "create" ? "客服商品品质缺陷建档" : `编辑修正工号: [ ${activeComplaint?.complaint_no} ]`}</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-450"><XCircle className="w-5.5 h-5.5" /></button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmitForm} className="flex-grow overflow-y-auto p-6 space-y-6">
                
                {/* 1. 佐证与凭证图片集 (最多6张) - MOVED TO TOP */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#006591] rounded-full inline-block" />
                    <span>1. 瑕疵理赔佐证图片集 (最多6张)</span>
                  </h3>

                  {/* Drag and click zone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center select-none transition-all group cursor-pointer ${
                      isDragging 
                        ? "border-emerald-400 bg-emerald-50/50 scale-[1.01]" 
                        : "border-slate-200 hover:border-[#006591] bg-slate-50/50 hover:bg-slate-55"
                    }`}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageFileChange} 
                      className="hidden" 
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-lg transition-transform group-hover:scale-110 ${
                      isDragging ? "bg-emerald-100 text-emerald-600" : "bg-[#006591]/10 text-[#006591]"
                    }`}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {isDragging ? "松开鼠标即可极速上传佐证图片 !" : "点击选择 或 拖动图片到此处直接上传"}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      支持 JPG, JPEG, PNG, WEBP。前端 Canvas 自动对大图进行 WebP 极限损耗无感压缩，节省理赔响应时间！
                    </p>
                  </div>

                  {/* Existing LIVE Images in EDIT flow */}
                  {formMode === "edit" && activeComplaint && activeComplaint.images && activeComplaint.images.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-450 block font-bold">📂 已上传理赔存案图片 ({activeComplaint.images.length}张)：</span>
                      <div className="grid grid-cols-4 gap-3">
                        {activeComplaint.images.map((img) => (
                          <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-150 bg-slate-50 group">
                            <img src={img.thumbnail_url} alt="Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <button
                                type="button"
                                onClick={() => handleDeleteLiveImage(img.id, img.original_filename)}
                                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow-xs cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending upload queues (showing compression metrics) */}
                  {imageQueue.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#006591] block font-bold">✨ 即将随单上传的暂存压缩图片 ({imageQueue.length}张)：</span>
                      <div className="grid grid-cols-2 gap-3">
                        {imageQueue.map((item, idx) => {
                          const savings = ((1 - item.compressedSize / item.originalSize) * 100).toFixed(0);
                          return (
                            <div key={idx} className="flex gap-3 bg-white p-2 rounded-xl border border-slate-150 relative group">
                              <div className="w-10 h-10 bg-slate-205 rounded-lg overflow-hidden shrink-0">
                                <img src={item.previewUrl} alt="Compressed" className="w-full h-full object-cover" />
                              </div>
                              <div className="text-[9px] space-y-0.5 truncate flex-grow">
                                <span className="font-bold text-slate-800 block truncate" title={item.file.name}>{item.file.name}</span>
                                <span className="text-emerald-600 font-extrabold block">WebP：{formattedSize(item.compressedSize)} (-{savings}%)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeQueueImage(idx)}
                                className="absolute top-1.5 right-1.5 p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full border border-slate-155 cursor-pointer shadow-2xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Check warning duplicate order */}
                {orderCheckWarning && formMode === "create" && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-rose-700">
                      <strong className="block font-bold">🚨 订单历史重复客诉冲突警示：</strong>
                      订单编号 (<span className="font-mono font-black underline">{fdOrderNo}</span>) 此前已有建档。请客服核实避免重复理赔扣罚！
                    </div>
                  </div>
                )}

                {/* 2. 客服快捷核心登记 */}
                <div className="space-y-4 pt-1 bg-[#fcfdff] border border-slate-150/60 p-4 rounded-xl">
                  <h3 className="text-xs font-black text-[#006591] uppercase tracking-wider pb-1 flex items-center gap-1.5 border-b border-dashed border-slate-200">
                    <span className="w-1.5 h-1.5 bg-[#006591] rounded-full inline-block" />
                    <span>2. 客服极速登记表单（核心极简）</span>
                  </h3>

                  {/* Row A: Style selection and Order No */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                        1) 涉及瑕疵款号 * <span className="text-slate-400 font-normal shadow-2xs">(自动关联商品及厂家)</span>
                      </label>
                      <select 
                        value={fdStyleNo} 
                        required
                        onChange={e => handleStyleNoChange(e.target.value)} 
                        className="w-full bg-white border border-slate-250 outline-none rounded-lg p-2.5 text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-[#006591]"
                      >
                        <option value="">-- 请选择瑕疵爆款款号 --</option>
                        <option value="LN-2026-CO">LN-2026-CO (精梳棉连体爬服 - 婴儿装)</option>
                        <option value="LN-2026-BL">LN-2026-BL (防惊跳舒适婴儿睡袋)</option>
                        <option value="LN-2026-SO">LN-2026-SO (新生儿防脱纯棉袜3组装)</option>
                        <option value="LN-2026-HD">LN-2026-HD (复古蔷薇拼接连衣裙 - 大童装)</option>
                        <option value="LN-2026-TS">LN-2026-TS (高弹小熊打底T恤)</option>
                      </select>

                      {/* Spark prefill feedback to give high-fidelity cues */}
                      {fdStyleNo && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium max-w-full truncate">
                            📦 {fdProductName || "加载中..."} • {fdColor || "默认"} • {fdSize || "默认"}
                          </span>
                          <span className="text-[10px] bg-sky-50 text-[#006591] px-1.5 py-0.5 rounded font-mono font-semibold">
                            条码: {fdSkuCode}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">2) 平台订单编号 *</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required 
                          value={fdOrderNo} 
                          onChange={e => setFdOrderNo(e.target.value ?? "")} 
                          onBlur={handleOrderNoBlur}
                          placeholder="粘贴或输入 16-20 位订单号" 
                          className="w-full bg-white border border-slate-250 focus:border-[#006591] outline-none rounded-lg p-2.5 text-xs font-mono font-bold text-slate-800" 
                        />
                        {isCheckingOrder && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Row B: Refund & Compensation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">3) 理赔退款额 (元)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={fdRefundAmount} 
                        onChange={e => setFdRefundAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                        placeholder="客服退货退款损失扣罚" 
                        className="w-full bg-white border border-slate-250 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-[#006591]" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">4) 额外补偿金 (元) <span className="text-slate-400 font-normal">(选填)</span></label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={fdCompensationAmount} 
                        onChange={e => setFdCompensationAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                        placeholder="微信安抚红包或现金折让" 
                        className="w-full bg-white border border-slate-250 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-[#006591]" 
                      />
                    </div>
                  </div>

                  {/* Row C: Problem description with Quick Pre-fills */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1.5 flex justify-between items-center">
                      <span>5) 品质缺陷描写 & 客户投诉实录 *</span>
                      <span className="text-[10px] text-slate-400 font-normal">点击下方标签可一键极速起草填入</span>
                    </label>
                    
                    {/* Textarea */}
                    <textarea 
                      required 
                      rows={3} 
                      value={fdProblemDesc} 
                      onChange={e => setFdProblemDesc(e.target.value)} 
                      placeholder="请详细描述买家反馈之破绽、污斑或其它品质问题..." 
                      className="w-full bg-white border border-slate-250 outline-none rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#006591]" 
                    />

                    {/* Quick Prefill Templates */}
                    <div className="mt-2 text-left">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">🏷️ 爆款客服常用理赔速记词模组：</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "面料缝线开裂、破洞，严重车缝重大瑕疵",
                          "过水缩水变硬起球严重，影响日常穿着",
                          "爆线开裆、脱线，局部针脚不严密漏缝",
                          "胶印图案水洗脱落，花纹参差不齐",
                          "左右边/袖长不均，尺寸极度不对称",
                          "拉链损坏卡阻，有咬肉划伤风险",
                          "面料有黑色不规整污垢与异味"
                        ].map((phrase, pi) => (
                          <button
                            key={pi}
                            type="button"
                            onClick={() => {
                              if (!fdProblemDesc.trim()) {
                                setFdProblemDesc(phrase);
                              } else {
                                // check if already ends with comma/period
                                const endsWithPunct = /[，。,.！!]$/.test(fdProblemDesc);
                                setFdProblemDesc(prev => prev + (endsWithPunct ? "" : "，") + phrase);
                              }
                              showToast("⚡ 已快捷填充速填词");
                            }}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition border border-slate-200/50 cursor-pointer select-none font-semibold"
                          >
                            + {phrase.split("，")[0].substring(0, 8)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. COLLAPSIBLE ADVANCED DETAILS AREA */}
                <div id="advanced-optional-fields-container" className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 transition cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-slate-450" />
                      <span>{showAdvanced ? "📂 折叠精细次要字段（全部在库，非必看）" : "⚙️ 展开更多次要/核查属性（默认已智能预设，无需手动输入）"}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {showAdvanced ? "收起次要要素" : "展开修改平台/出厂批次/流向定责"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-4 border border-slate-200 p-4 rounded-xl bg-slate-50/30"
                      >
                        
                        {/* Section Sub-A: Platform channel */}
                        <div className="space-y-3 border-b border-slate-150 pb-3">
                          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">A. 受理平台与店铺渠道</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">投诉处理登记日期 *</label>
                              <input 
                                type="date" 
                                required
                                value={fdComplaintDate} 
                                onChange={e => setFdComplaintDate(e.target.value)} 
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs font-mono font-bold text-slate-800" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">受理平台 *</label>
                              <select 
                                value={fdPlatform} 
                                onChange={e => setFdPlatform(e.target.value as any)} 
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs font-bold text-slate-700"
                              >
                                {PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">受理店铺名称 *</label>
                              <select 
                                value={fdShopCode} 
                                onChange={e => setFdShopCode(e.target.value)} 
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs font-bold text-slate-700"
                              >
                                {SHOP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">逆向申请售后单号</label>
                              <input 
                                type="text" 
                                value={fdAfterSaleNo} 
                                onChange={e => setFdAfterSaleNo(e.target.value)} 
                                placeholder="多为逆向系统生成的 AS- 售后号" 
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs font-mono text-slate-800" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">客户旺旺/抖音昵称</label>
                              <input 
                                type="text" 
                                value={fdCustomerNickname} 
                                onChange={e => setFdCustomerNickname(e.target.value)} 
                                placeholder="方便日常回核关联" 
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs text-slate-800" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section Sub-B: Factory Sourcing & responsibility */}
                        <div className="space-y-3 border-b border-slate-150 pb-3">
                          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">B. 瑕疵定责与供应链追溯</h4>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">瑕疵类型分类 *</label>
                              <select 
                                value={fdProblemType} 
                                onChange={e => setFdProblemType(e.target.value)} 
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs font-bold text-slate-700"
                              >
                                {PROBLEM_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">严重程度系数 *</label>
                              <select 
                                value={fdSeverity} 
                                onChange={e => setFdSeverity(e.target.value as any)}
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs font-bold text-[#006591]"
                              >
                                {SEVERITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">判定首要责任方 *</label>
                              <select 
                                value={fdResponsibility} 
                                onChange={e => setFdResponsibility(e.target.value as any)} 
                                className="w-full bg-white border border-slate-200 outline-none rounded-md p-2 text-xs font-bold text-slate-700"
                              >
                                {RESPONSIBILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">对口代工厂商名</label>
                              <select 
                                value={fdSupplierId} 
                                onChange={e => {
                                  const s = SUPPLIERS_OPTIONS.find(x => x.id === e.target.value);
                                  setFdSupplierId(e.target.value);
                                  setFdSupplierName(s ? s.name : "");
                                }} 
                                className="w-full bg-white border border-slate-205 outline-none rounded-md p-2 text-xs font-bold text-slate-705"
                              >
                                {SUPPLIERS_OPTIONS.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">生产/出厂批次</label>
                              <input 
                                type="text" 
                                value={fdNewArrivalBatch} 
                                onChange={e => setFdNewArrivalBatch(e.target.value)} 
                                placeholder="例如：2026春第一批" 
                                className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">是否影响商品二次销售 *</label>
                              <div className="flex gap-4 pt-1">
                                {["是", "否", "不确定"].map((opt) => (
                                  <label key={opt} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="affect" 
                                      checked={fdAffectResale === opt} 
                                      onChange={() => setFdAffectResale(opt as any)} 
                                      className="accent-[#006591] w-4 h-4 cursor-pointer" 
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">需要代工厂制程跟进 *</label>
                              <div className="flex gap-4 pt-1">
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                  <input type="radio" name="gys_follow" checked={fdNeedSupplierFollow === "是"} onChange={() => setFdNeedSupplierFollow("是")} className="accent-rose-500 w-4 h-4" />
                                  <span>需要 (同步至代工厂看板)</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                  <input type="radio" name="gys_follow" checked={fdNeedSupplierFollow === "否"} onChange={() => setFdNeedSupplierFollow("否")} className="accent-slate-400 w-4 h-4" />
                                  <span>免签 (常规处理)</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section Sub-C: Internal details and specs */}
                        <div className="space-y-3">
                          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">C. 赔付追踪与高级配置 (物料快照)</h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">商品入账状态选择 *</label>
                              <select 
                                value={fdStatus} 
                                onChange={e => setFdStatus(e.target.value)} 
                                className="w-full bg-white border border-[#006591] outline-none rounded-md p-2 text-xs font-black text-[#006591]"
                              >
                                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">计入精细化质量报盘 *</label>
                              <div className="flex gap-4 pt-1">
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-705 cursor-pointer">
                                  <input type="radio" name="quality_stats" checked={fdIncludedInQualityStats === "是"} onChange={() => setFdIncludedInQualityStats("是")} className="accent-[#006591] w-4 h-4" />
                                  <span>入账核销计入</span>
                                </label>
                                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-705 cursor-pointer">
                                  <input type="radio" name="quality_stats" checked={fdIncludedInQualityStats === "否"} onChange={() => setFdIncludedInQualityStats("否")} className="accent-[#006591] w-4 h-4" />
                                  <span>免于扣发计入</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                          <div className="grid grid-cols-2 gap-3 font-mono">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">关联商品名称 (高级)</label>
                              <input 
                                type="text" 
                                required
                                value={fdProductName} 
                                onChange={e => setFdProductName(e.target.value)} 
                                className="w-full bg-white border border-slate-205 outline-none rounded-md p-2 text-xs text-slate-600 font-bold" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">商品条码 SKU Code (高级)</label>
                              <input 
                                type="text" 
                                required
                                value={fdSkuCode} 
                                onChange={e => setFdSkuCode(e.target.value)} 
                                className="w-full bg-white border border-slate-205 outline-none rounded-md p-2 text-xs text-slate-600 font-bold" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 font-mono">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">颜色规格码 (高级)</label>
                              <input type="text" value={fdColor} onChange={e => setFdColor(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">出厂尺码规格 (高级)</label>
                              <input type="text" value={fdSize} onChange={e => setFdSize(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 font-mono">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">理赔及后续处理结果详细备注</label>
                              <input 
                                type="text" 
                                value={fdHandleResult} 
                                onChange={e => setFdHandleResult(e.target.value)} 
                                placeholder="如：‘已和供应商对接决议此单扣款罚金’" 
                                className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-800 font-semibold" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">客服内部追踪备注 (特殊跟进)</label>
                              <input 
                                type="text" 
                                value={fdCustomerServiceRemark} 
                                onChange={e => setFdCustomerServiceRemark(e.target.value)} 
                                placeholder="多为极特殊退款的标记" 
                                className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-[#002045]/85 font-semibold" 
                              />
                            </div>
                          </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submissions button layout */}
                <div className="pt-6 border-t border-slate-100 flex gap-3 select-none">
                  <button 
                    type="submit" 
                    disabled={isLoading || isUploadingImages}
                    className="flex-grow py-3 bg-[#006591] hover:bg-[#004c6e] text-white text-xs font-black rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-md shadow-[#006591]/15 leading-none transition-all hover:scale-[1.01]"
                  >
                    {(isLoading || isUploadingImages) && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                    <span>{formMode === "create" ? "理赔确认，发单存账" : "保存修改并保存轨迹"}</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)} 
                    className="py-3 px-6 border border-slate-200 hover:bg-slate-55 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    取消
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING ZOOM PORTRAIT BOX CAROUSEL */}
      <AnimatePresence>
        {zoomedImage && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)} 
              className="fixed inset-0 bg-black z-[110] flex items-center justify-center" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] max-w-2xl max-h-[85vh] w-[90vw] overflow-hidden flex flex-col justify-center items-center pointer-events-none"
            >
              <img 
                src={zoomedImage.src} 
                alt="Defect detail zoomed" 
                className="rounded-2xl shadow-2xl max-w-full max-h-[75vh] object-contain bg-slate-900 border border-slate-800 pointer-events-auto referrer-policy" 
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 p-2 px-4 bg-[#002045] rounded-full text-[11px] font-bold text-white shadow-lg pointer-events-auto select-none flex items-center gap-2">
                <span>📄 {zoomedImage.filename}</span>
                <span className="text-slate-400">|</span>
                <button 
                  onClick={() => setZoomedImage(null)} 
                  className="hover:text-amber-400 font-extrabold cursor-pointer"
                >
                  关闭预览
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
