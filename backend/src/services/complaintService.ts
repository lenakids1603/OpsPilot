/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import * as XLSX from "xlsx";

// Interfaces for our full-stack Product Complaints Registry
export interface ProductComplaint {
  id: string; // complaint_id
  complaint_no: string; // CS-YYYYMMDD-XXXX
  complaint_date: string;
  platform: "抖音" | "淘宝" | "天猫" | "快手" | "小红书" | "其他";
  shop_code: string;
  order_no: string;
  after_sale_no?: string;
  customer_nickname?: string;
  customer_service_remark?: string;

  style_no: string;
  sku_code: string;
  product_name?: string;
  color?: string;
  size?: string;
  supplier_id?: string;
  supplier_name?: string;
  new_arrival_batch?: string;
  affect_resale: "是" | "否" | "不确定";

  problem_type: string; // 开线, 破洞 / 纱破, 掉钻 / 掉饰品码, 配件缺失, etc.
  problem_desc: string;
  severity: "轻微" | "一般" | "严重";
  responsibility: "供应商" | "仓库" | "物流" | "客服" | "顾客" | "待判定";
  status: "待处理" | "处理中" | "待仓库复核" | "待供应商确认" | "已处理" | "已关闭" | "无效投诉";
  handle_result?: string;

  refund_amount?: number;
  compensation_amount?: number;
  need_supplier_follow: "是" | "否";
  included_in_quality_stats: "是" | "否";

  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_at?: string;
  deleted_at: string | null;
}

export interface ComplaintImage {
  id: string;
  complaint_id: string;
  image_url: string;
  thumbnail_url: string;
  original_filename: string;
  file_size: number;
  width: number;
  height: number;
  format: string;
  image_hash: string;
  sort_order: number;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  deleted_at: string | null;
}

export interface ComplaintChangeLog {
  id: string;
  complaint_id: string;
  operator_id: string;
  operator_name: string;
  operation_type: "create" | "update" | "delete" | "upload_image" | "delete_image" | "status_change";
  field_name?: string;
  field_label?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Memory cash databases backed by JSON files
const DATA_DIR = path.resolve(process.cwd(), "backend", "data");
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

const FILE_COMPLAINTS = path.join(DATA_DIR, "product_complaints.json");
const FILE_IMAGES = path.join(DATA_DIR, "product_complaint_images.json");
const FILE_LOGS = path.join(DATA_DIR, "product_complaint_change_logs.json");

let complaintsCache: ProductComplaint[] = [];
let imagesCache: ComplaintImage[] = [];
let logsCache: ComplaintChangeLog[] = [];

// Dictionary for readable Chinese labels in logs
const FIELD_LABELS: Record<string, string> = {
  complaint_date: "投诉日期",
  platform: "平台",
  shop_code: "店铺",
  order_no: "订单编号",
  after_sale_no: "售后单号",
  customer_nickname: "客户昵称",
  customer_service_remark: "客服备注",
  style_no: "款号",
  sku_code: "商品编码",
  product_name: "商品名称",
  color: "颜色",
  size: "尺码",
  supplier_id: "供应商ID",
  supplier_name: "供应商名称",
  new_arrival_batch: "上新批次",
  affect_resale: "是否影响二次销售",
  problem_type: "问题类型",
  problem_desc: "问题描述",
  severity: "严重程度",
  responsibility: "责任初判",
  status: "处理状态",
  handle_result: "处理结果",
  refund_amount: "退款金额",
  compensation_amount: "补偿金额",
  need_supplier_follow: "是否需要供应商跟进",
  included_in_quality_stats: "是否计入质量统计"
};

// Initialize folder and tables
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Load Complaints
  if (fs.existsSync(FILE_COMPLAINTS)) {
    try {
      complaintsCache = JSON.parse(fs.readFileSync(FILE_COMPLAINTS, "utf-8"));
    } catch {
      complaintsCache = [];
    }
  } else {
    // Inject mock seed data if empty
    complaintsCache = [
      {
        id: "comp-1",
        complaint_no: "CS-20260522-0001",
        complaint_date: "2026-05-22",
        platform: "抖音",
        shop_code: "莉娜贝贝旗舰店",
        order_no: "9812401824081241",
        after_sale_no: "AS-8124018",
        customer_nickname: "贝贝妈",
        customer_service_remark: "面料缩水落色严重，反馈希望退货退款",
        style_no: "LN-2026-CO",
        sku_code: "LN-2026-CO-PN-80",
        product_name: "精梳棉婴儿高奢爬服",
        color: "雅致粉",
        size: "80码",
        supplier_id: "SPL-02",
        supplier_name: "海安莱那织造有限公司",
        new_arrival_batch: "2026春第一批",
        affect_resale: "是",
        problem_type: "破洞 / 纱破",
        problem_desc: "水洗过一次后，档位接缝处出现明显破洞和纱线脱开",
        severity: "严重",
        responsibility: "供应商",
        status: "待处理",
        refund_amount: 59.00,
        compensation_amount: 10.00,
        need_supplier_follow: "是",
        included_in_quality_stats: "是",
        created_by: "service@lenakids.com",
        created_by_name: "系统客服",
        created_at: "2026-05-22T10:15:00.000Z",
        deleted_at: null
      },
      {
        id: "comp-2",
        complaint_no: "CS-20260521-0001",
        complaint_date: "2026-05-21",
        platform: "天猫",
        shop_code: "LenaKids直营店",
        order_no: "5671201948124958",
        after_sale_no: "AS-9121589",
        customer_nickname: "晴天小猪",
        customer_service_remark: "五金有些锋利",
        style_no: "LN-2026-BL",
        sku_code: "LN-2026-BL-WH-90",
        product_name: "防惊跳睡袋",
        color: "纯白",
        size: "90码",
        supplier_id: "SPL-05",
        supplier_name: "温岭市依依童装制品厂",
        new_arrival_batch: "2026春第二批",
        affect_resale: "否",
        problem_type: "掉钻 / 掉饰品",
        problem_desc: "睡袋前面印花蕾丝饰物洗涤后有些脱胶和开裂",
        severity: "轻微",
        responsibility: "顾客",
        status: "已处理",
        refund_amount: 0,
        compensation_amount: 5.00,
        need_supplier_follow: "否",
        included_in_quality_stats: "否",
        created_by: "service@lenakids.com",
        created_by_name: "系统客服",
        created_at: "2026-05-21T14:30:22.000Z",
        deleted_at: null
      }
    ];
    saveComplaints();
  }

  // Load Images
  if (fs.existsSync(FILE_IMAGES)) {
    try {
      imagesCache = JSON.parse(fs.readFileSync(FILE_IMAGES, "utf-8"));
    } catch {
      imagesCache = [];
    }
  } else {
    imagesCache = [];
    saveImages();
  }

  // Load Logs
  if (fs.existsSync(FILE_LOGS)) {
    try {
      logsCache = JSON.parse(fs.readFileSync(FILE_LOGS, "utf-8"));
    } catch {
      logsCache = [];
    }
  } else {
    logsCache = [
      {
        id: "log-seed-1",
        complaint_id: "comp-1",
        operator_id: "service@lenakids.com",
        operator_name: "系统客服",
        operation_type: "create",
        created_at: "2026-05-22T10:15:00.000Z"
      },
      {
        id: "log-seed-2",
        complaint_id: "comp-2",
        operator_id: "service@lenakids.com",
        operator_name: "系统客服",
        operation_type: "create",
        created_at: "2026-05-21T14:30:22.000Z"
      }
    ];
    saveLogs();
  }
}

function saveComplaints() {
  fs.writeFileSync(FILE_COMPLAINTS, JSON.stringify(complaintsCache, null, 2), "utf-8");
}

function saveImages() {
  fs.writeFileSync(FILE_IMAGES, JSON.stringify(imagesCache, null, 2), "utf-8");
}

function saveLogs() {
  fs.writeFileSync(FILE_LOGS, JSON.stringify(logsCache, null, 2), "utf-8");
}

// Call on load
initDB();

export const ComplaintService = {
  // Query List with full database search filter matching requirements
  list(filters: {
    page?: number;
    pageSize?: number;
    dateStart?: string;
    dateEnd?: string;
    platform?: string;
    shop_code?: string;
    problem_type?: string;
    status?: string;
    responsibility?: string;
    hasImg?: string; // "yes" | "no" | "all"
    needFollow?: string; // "是" | "否" | "all"
    search?: string;
  }) {
    const page = Number(filters.page) || 1;
    const pageSize = Math.min(Number(filters.pageSize) || 25, 100); // safety cap at 100

    // Filter complaints (soft deleted excluded)
    let list = complaintsCache.filter(c => c.deleted_at === null);

    // Filter specifications
    if (filters.dateStart) {
      list = list.filter(c => c.complaint_date >= filters.dateStart!);
    }
    if (filters.dateEnd) {
      list = list.filter(c => c.complaint_date <= filters.dateEnd!);
    }
    if (filters.platform && filters.platform !== "全部") {
      list = list.filter(c => c.platform === filters.platform);
    }
    if (filters.shop_code && filters.shop_code !== "全部") {
      list = list.filter(c => c.shop_code.toLowerCase().includes(filters.shop_code!.toLowerCase()));
    }
    if (filters.problem_type && filters.problem_type !== "全部") {
      list = list.filter(c => c.problem_type === filters.problem_type);
    }
    if (filters.status && filters.status !== "全部") {
      list = list.filter(c => c.status === filters.status);
    }
    if (filters.responsibility && filters.responsibility !== "全部") {
      list = list.filter(c => c.responsibility === filters.responsibility);
    }
    if (filters.needFollow && filters.needFollow !== "全部" && filters.needFollow !== "all") {
      list = list.filter(c => c.need_supplier_follow === filters.needFollow);
    }

    // Has images filter
    if (filters.hasImg === "yes") {
      list = list.filter(c => {
        const activeImgs = imagesCache.filter(img => img.complaint_id === c.id && img.deleted_at === null);
        return activeImgs.length > 0;
      });
    } else if (filters.hasImg === "no") {
      list = list.filter(c => {
        const activeImgs = imagesCache.filter(img => img.complaint_id === c.id && img.deleted_at === null);
        return activeImgs.length === 0;
      });
    }

    // Fuzzy search box matching: 订单编号、售后单号、款号、商品编码、商品名称、问题描述
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(c => {
        return (
          c.order_no.toLowerCase().includes(q) ||
          (c.after_sale_no && c.after_sale_no.toLowerCase().includes(q)) ||
          c.style_no.toLowerCase().includes(q) ||
          c.sku_code.toLowerCase().includes(q) ||
          (c.product_name && c.product_name.toLowerCase().includes(q)) ||
          c.problem_desc.toLowerCase().includes(q)
        );
      });
    }

    // Default sorting logic: 按投诉日期倒序, 创建时间倒序
    list.sort((a, b) => {
      if (a.complaint_date !== b.complaint_date) {
        return b.complaint_date.localeCompare(a.complaint_date);
      }
      return b.created_at.localeCompare(a.created_at);
    });

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = list.slice(startIndex, startIndex + pageSize);

    // Map active images to rows
    const items = paginatedItems.map(c => {
      const activeImgs = imagesCache
        .filter(img => img.complaint_id === c.id && img.deleted_at === null)
        .sort((a, b) => a.sort_order - b.sort_order);

      return {
        ...c,
        images: activeImgs
      };
    });

    return {
      items,
      total,
      page,
      pageSize
    };
  },

  // Get stats dashboard numbers
  stats() {
    const active = complaintsCache.filter(c => c.deleted_at === null);
    const todayStr = new Date().toISOString().split("T")[0];
    const thisMonthPrefix = todayStr.substring(0, 7); // "YYYY-MM"

    const todayCount = active.filter(c => c.complaint_date === todayStr).length;
    const monthCount = active.filter(c => c.complaint_date.startsWith(thisMonthPrefix)).length;
    const pendingCount = active.filter(c => c.status === "待处理").length;
    const needFollowCount = active.filter(c => c.need_supplier_follow === "是").length;

    return {
      todayCount,
      monthCount,
      pendingCount,
      needFollowCount
    };
  },

  // Get single record with its logs and images
  get(id: string) {
    const complaint = complaintsCache.find(c => c.id === id && c.deleted_at === null);
    if (!complaint) return null;

    const activeImgs = imagesCache
      .filter(img => img.complaint_id === id && img.deleted_at === null)
      .sort((a, b) => a.sort_order - b.sort_order);

    return {
      ...complaint,
      images: activeImgs
    };
  },

  // Check duplicate order warning alerts
  checkDuplicateOrder(orderNo: string) {
    const exists = complaintsCache.some(c => c.order_no === orderNo && c.deleted_at === null);
    return exists;
  },

  // Generate unique complaint_no pattern CS-YYYYMMDD-XXXX
  generateComplaintNo(dateStr: string) {
    const formattedDate = dateStr.replace(/-/g, ""); // "2026-05-26" -> "20260526"
    const prefix = `CS-${formattedDate}-`;
    const todayMatches = complaintsCache.filter(c => c.complaint_no.startsWith(prefix));
    let nextSeq = 1;
    if (todayMatches.length > 0) {
      const seqs = todayMatches.map(c => {
        const parts = c.complaint_no.split("-");
        const last = Number(parts[parts.length - 1]);
        return isNaN(last) ? 0 : last;
      });
      nextSeq = Math.max(...seqs) + 1;
    }
    const seqStr = String(nextSeq).padStart(4, "0");
    return `${prefix}${seqStr}`;
  },

  // Create single Complaint
  create(payload: Omit<ProductComplaint, "id" | "complaint_no" | "created_at" | "deleted_at">) {
    const id = "comp-" + Date.now();
    const complaint_no = this.generateComplaintNo(payload.complaint_date);

    const record: ProductComplaint = {
      ...payload,
      id,
      complaint_no,
      created_at: new Date().toISOString(),
      deleted_at: null
    };

    complaintsCache.unshift(record);
    saveComplaints();

    // Log Action
    const log: ComplaintChangeLog = {
      id: "log-" + crypto.randomUUID(),
      complaint_id: id,
      operator_id: payload.created_by,
      operator_name: payload.created_by_name,
      operation_type: "create",
      created_at: new Date().toISOString()
    };
    logsCache.unshift(log);
    saveLogs();

    return this.get(id);
  },

  // Update complaint with state delta comparison and revision logs
  update(id: string, updates: Partial<ProductComplaint>, op: { operator_id: string; operator_name: string }) {
    const index = complaintsCache.findIndex(c => c.id === id && c.deleted_at === null);
    if (index === -1) return null;

    const oldRecord = { ...complaintsCache[index] };
    const newRecord = { ...oldRecord, ...updates };

    // Compare fields and record change logs
    const changedFields: { field: string; old: string; new: string }[] = [];

    // Fields we log changes on
    const fieldsToTrack = Object.keys(FIELD_LABELS);

    for (const field of fieldsToTrack) {
      const key = field as keyof ProductComplaint;
      // Compare values
      let oldVal = oldRecord[key];
      let newVal = updates[key];

      if (newVal !== undefined) {
        // Stringify or format comparison
        const oldStr = oldVal === null || oldVal === undefined ? "" : String(oldVal);
        const newStr = newVal === null || newVal === undefined ? "" : String(newVal);

        if (oldStr !== newStr) {
          changedFields.push({
            field,
            old: oldStr,
            new: newStr
          });
        }
      }
    }

    // Apply updates in cache
    complaintsCache[index] = {
      ...newRecord,
      updated_by: op.operator_id,
      updated_by_name: op.operator_name,
      updated_at: new Date().toISOString()
    };
    saveComplaints();

    const timestamp = new Date().toISOString();

    // 1. Log overall update
    const genericLog: ComplaintChangeLog = {
      id: "log-" + crypto.randomUUID(),
      complaint_id: id,
      operator_id: op.operator_id,
      operator_name: op.operator_name,
      operation_type: "update",
      created_at: timestamp
    };
    logsCache.unshift(genericLog);

    // 2. Log specific field changes as details
    for (const change of changedFields) {
      const fieldLog: ComplaintChangeLog = {
        id: "log-" + crypto.randomUUID(),
        complaint_id: id,
        operator_id: op.operator_id,
        operator_name: op.operator_name,
        operation_type: change.field === "status" ? "status_change" : "update",
        field_name: change.field,
        field_label: FIELD_LABELS[change.field] || change.field,
        old_value: change.old,
        new_value: change.new,
        created_at: timestamp
      };
      logsCache.unshift(fieldLog);
    }

    saveLogs();
    return this.get(id);
  },

  // Soft delete complaint with logging
  delete(id: string, op: { operator_id: string; operator_name: string }) {
    const index = complaintsCache.findIndex(c => c.id === id && c.deleted_at === null);
    if (index === -1) return false;

    complaintsCache[index].deleted_at = new Date().toISOString();
    saveComplaints();

    // Write change log
    const log: ComplaintChangeLog = {
      id: "log-" + crypto.randomUUID(),
      complaint_id: id,
      operator_id: op.operator_id,
      operator_name: op.operator_name,
      operation_type: "delete",
      created_at: new Date().toISOString()
    };
    logsCache.unshift(log);
    saveLogs();

    return true;
  },

  // Write revision log directly
  addCustomLog(log: Omit<ComplaintChangeLog, "id" | "created_at">) {
    const record: ComplaintChangeLog = {
      ...log,
      id: "log-" + crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    logsCache.unshift(record);
    saveLogs();
    return record;
  },

  // Save image record and process it
  async processAndAddImage(complaintId: string, payload: {
    filename: string;
    buffer: Buffer;
    uploaded_by: string;
    uploaded_by_name: string;
  }) {
    // 1. Read metadata & verify
    const image = sharp(payload.buffer);
    const meta = await image.metadata();

    const format = meta.format || "webp";
    const width = meta.width || 0;
    const height = meta.height || 0;
    const file_size = payload.buffer.length;

    // File hash MD5 calculation
    const image_hash = crypto.createHash("md5").update(payload.buffer).digest("hex");

    // File target output names
    const filenameNormal = `${image_hash}_1600.webp`;
    const filenameThumb = `${image_hash}_300.webp`;

    const pathNormal = path.join(UPLOADS_DIR, filenameNormal);
    const pathThumb = path.join(UPLOADS_DIR, filenameThumb);

    // 2. Normal compress (Long side <= 1600px, strip EXIF metadata by omitting .withMetadata())
    let normalImage = sharp(payload.buffer);
    if (width > 1600 || height > 1600) {
      normalImage = normalImage.resize(1600, 1600, { fit: "inside" });
    }
    await normalImage.webp({ quality: 80 }).toFile(pathNormal);

    // 3. Thumbnail compress (Long side 240px to 300px, e.g., max 300px)
    let thumbImage = sharp(payload.buffer);
    thumbImage = thumbImage.resize(300, 300, { fit: "inside" });
    await thumbImage.webp({ quality: 75 }).toFile(pathThumb);

    // Save image path url
    const image_url = `/uploads/${filenameNormal}`;
    const thumbnail_url = `/uploads/${filenameThumb}`;

    // Calculate sorting order
    const nextSort = imagesCache.filter(img => img.complaint_id === complaintId && img.deleted_at === null).length + 1;

    const imgRecord: ComplaintImage = {
      id: "img-" + crypto.randomUUID(),
      complaint_id: complaintId,
      image_url,
      thumbnail_url,
      original_filename: payload.filename,
      file_size,
      width,
      height,
      format: "webp",
      image_hash,
      sort_order: nextSort,
      uploaded_by: payload.uploaded_by,
      uploaded_by_name: payload.uploaded_by_name,
      uploaded_at: new Date().toISOString(),
      deleted_at: null
    };

    imagesCache.push(imgRecord);
    saveImages();

    // Log image upload action
    const log: ComplaintChangeLog = {
      id: "log-" + crypto.randomUUID(),
      complaint_id: complaintId,
      operator_id: payload.uploaded_by,
      operator_name: payload.uploaded_by_name,
      operation_type: "upload_image",
      field_name: "images",
      field_label: "图片列表",
      new_value: `新增图片: ${payload.filename}`,
      created_at: new Date().toISOString()
    };
    logsCache.unshift(log);
    saveLogs();

    return imgRecord;
  },

  // Soft delete complaint image
  deleteImage(complaintId: string, imageId: string, op: { operator_id: string; operator_name: string }) {
    const imgIndex = imagesCache.findIndex(img => img.id === imageId && img.complaint_id === complaintId && img.deleted_at === null);
    if (imgIndex === -1) return false;

    imagesCache[imgIndex].deleted_at = new Date().toISOString();
    saveImages();

    // Log deletion action
    const log: ComplaintChangeLog = {
      id: "log-" + crypto.randomUUID(),
      complaint_id: complaintId,
      operator_id: op.operator_id,
      operator_name: op.operator_name,
      operation_type: "delete_image",
      field_name: "images",
      field_label: "图片列表",
      old_value: `删除图片: ${imagesCache[imgIndex].original_filename}`,
      created_at: new Date().toISOString()
    };
    logsCache.unshift(log);
    saveLogs();

    return true;
  },

  // Get revision history logs for a complaint
  getChangeLogs(complaintId: string) {
    return logsCache.filter(log => log.complaint_id === complaintId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  // Build excel spreadsheet report
  exportExcel(filters: any) {
    // Collect filtered complaints (exclude pagination)
    const { items } = this.list({ ...filters, page: 1, pageSize: 100000 });

    // Header values
    const sheetData = items.map(c => {
      // Collect image urls joined by commas/newlines
      const imageUrls = c.images.map(img => `${img.original_filename || "Image"}: ${img.image_url}`).join("\n");

      return {
        "投诉编号": c.complaint_no,
        "投诉日期": c.complaint_date,
        "平台": c.platform,
        "店铺": c.shop_code,
        "订单编号": c.order_no,
        "售后单号": c.after_sale_no || "",
        "客户昵称": c.customer_nickname || "",
        "款号": c.style_no,
        "商品编码": c.sku_code,
        "商品名称": c.product_name || "",
        "颜色": c.color || "",
        "尺码": c.size || "",
        "供应商ID": c.supplier_id || "",
        "供应商名称": c.supplier_name || "",
        "上新批次": c.new_arrival_batch || "",
        "是否影响一次销售": c.affect_resale,
        "问题类型": c.problem_type,
        "问题描述": c.problem_desc,
        "严重程度": c.severity,
        "责任初判": c.responsibility,
        "处理状态": c.status,
        "理赔退退金额(元)": c.refund_amount || 0,
        "理赔补偿金额(元)": c.compensation_amount || 0,
        "处理结果": c.handle_result || "",
        "是否需要供应商跟进": c.need_supplier_follow,
        "是否计入质量统计": c.included_in_quality_stats,
        "登记人": c.created_by_name || c.created_by,
        "图片链接": imageUrls,
        "最后编辑时间": c.updated_at || "",
        "最后编辑人": c.updated_by_name || ""
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "商品投诉登记列表");

    // Write buffer options
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    return excelBuffer;
  }
};
