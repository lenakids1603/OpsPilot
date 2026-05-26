/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import { ComplaintService } from "../services/complaintService";

const router = Router();

// Configure multer file upload middleware using in-memory buffer storage
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // Strict 10MB limit
  }
});

// Helper to extract session details from custom HTTP headers
function getOperator(req: Request) {
  const email = (req.headers["x-user-email"] as string) || "service@lenakids.com";
  // Decode chinese characters correctly if passed as URI encoding, or default to generic
  let name = req.headers["x-user-name"] as string;
  if (name) {
    try {
      name = decodeURIComponent(name);
    } catch {
      // ignore
    }
  } else {
    name = "系统客服";
  }
  return {
    operator_id: email,
    operator_name: name
  };
}

// 1. GET Stats Dashboard Numbers
// Define this route BEFORE GET id, to prevent matching "stats" as an ID parameter in Express.
router.get("/product-complaints/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = ComplaintService.stats();
    res.json({
      success: true,
      data: stats,
      message: "投诉数据指标编译成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "获取投诉数据指标失败: " + error.message,
      error: error.message
    });
  }
});

// 2. GET Export List to Excel Spreadsheet
router.get("/product-complaints/export", async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      dateStart: req.query.dateStart as string,
      dateEnd: req.query.dateEnd as string,
      platform: req.query.platform as string,
      shop_code: req.query.shop_code as string,
      problem_type: req.query.problem_type as string,
      status: req.query.status as string,
      responsibility: req.query.responsibility as string,
      hasImg: req.query.hasImg as string,
      needFollow: req.query.needFollow as string,
      search: req.query.search as string
    };

    const buffer = ComplaintService.exportExcel(filters);

    // Format date string for filename (e.g., YYYYMMDD_HHmmss)
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const hhmmss = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `商品投诉登记_${yyyymmdd}_${hhmmss}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(filename)}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.end(buffer);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      message: "导出 Excel 报表失败: " + error.message,
      error: error.message
    });
  }
});

// 3. GET paginated Complaints search lists
router.get("/product-complaints", async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 25,
      dateStart: req.query.dateStart as string,
      dateEnd: req.query.dateEnd as string,
      platform: req.query.platform as string,
      shop_code: req.query.shop_code as string,
      problem_type: req.query.problem_type as string,
      status: req.query.status as string,
      responsibility: req.query.responsibility as string,
      hasImg: req.query.hasImg as string,
      needFollow: req.query.needFollow as string,
      search: req.query.search as string
    };

    const result = ComplaintService.list(filters);

    res.json({
      success: true,
      data: result,
      message: "读取投诉列表成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "反馈加载检索失败: " + error.message,
      error: error.message
    });
  }
});

// 4. POST Create Complaint
router.post("/product-complaints", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      complaint_date,
      platform,
      shop_code,
      order_no,
      after_sale_no,
      customer_nickname,
      customer_service_remark,
      style_no,
      sku_code,
      product_name,
      color,
      size,
      supplier_id,
      supplier_name,
      new_arrival_batch,
      affect_resale,
      problem_type,
      problem_desc,
      severity,
      responsibility,
      status,
      handle_result,
      refund_amount,
      compensation_amount,
      need_supplier_follow,
      included_in_quality_stats
    } = req.body;

    // Strict validation
    if (!complaint_date) {
      res.json({ success: false, message: "投诉日期为必填项" });
      return;
    }
    if (!platform) {
      res.json({ success: false, message: "所属平台为必填项" });
      return;
    }
    if (!shop_code) {
      res.json({ success: false, message: "受理店铺为必填项" });
      return;
    }
    if (!order_no) {
      res.json({ success: false, message: "订单编号为必填项" });
      return;
    }
    if (!style_no) {
      res.json({ success: false, message: "款式款号为必填项" });
      return;
    }
    if (!sku_code) {
      res.json({ success: false, message: "商品编码（SKU）为必填项" });
      return;
    }
    if (!problem_type) {
      res.json({ success: false, message: "对应问题大类为必填项" });
      return;
    }
    if (!problem_desc) {
      res.json({ success: false, message: "问题缺陷详细描述为必填项" });
      return;
    }
    if (!status) {
      res.json({ success: false, message: "处理状态为必填项" });
      return;
    }

    // Verify negative values for amounts
    if (refund_amount && Number(refund_amount) < 0) {
      res.json({ success: false, message: "退款金额不能小于 0" });
      return;
    }
    if (compensation_amount && Number(compensation_amount) < 0) {
      res.json({ success: false, message: "补偿金额不能小于 0" });
      return;
    }

    const { operator_id, operator_name } = getOperator(req);

    const record = ComplaintService.create({
      complaint_date,
      platform,
      shop_code,
      order_no,
      after_sale_no,
      customer_nickname,
      customer_service_remark,
      style_no,
      sku_code,
      product_name,
      color,
      size,
      supplier_id,
      supplier_name,
      new_arrival_batch,
      affect_resale: affect_resale || "否",
      problem_type,
      problem_desc,
      severity: severity || "一般",
      responsibility: responsibility || "待判定",
      status,
      handle_result,
      refund_amount: refund_amount ? Number(refund_amount) : 0,
      compensation_amount: compensation_amount ? Number(compensation_amount) : 0,
      need_supplier_follow: need_supplier_follow || "否",
      included_in_quality_stats: included_in_quality_stats || "是",
      created_by: operator_id,
      created_by_name: operator_name
    });

    res.json({
      success: true,
      data: record,
      message: "商品投诉登记归案成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "投诉落地存盘遭遇瓶颈: " + error.message,
      error: error.message
    });
  }
});

// 5. GET single complaint detail
router.get("/product-complaints/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const record = ComplaintService.get(req.params.id);
    if (!record) {
      res.json({
        success: false,
        message: "查找的投诉档期记录不存在"
      });
      return;
    }

    res.json({
      success: true,
      data: record,
      message: "读取投诉明细成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "获取单据细节失败: " + error.message,
      error: error.message
    });
  }
});

// 6. PATCH Update Complaint with Delta revision logs
router.patch("/product-complaints/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const body = req.body;

    // Checks for negatives
    if (body.refund_amount !== undefined && Number(body.refund_amount) < 0) {
      res.json({ success: false, message: "退款金额绝对不能小于 0" });
      return;
    }
    if (body.compensation_amount !== undefined && Number(body.compensation_amount) < 0) {
      res.json({ success: false, message: "补偿金额绝对不能小于 0" });
      return;
    }

    const { operator_id, operator_name } = getOperator(req);

    const record = ComplaintService.update(id, body, {
      operator_id,
      operator_name
    });

    if (!record) {
      res.json({
        success: false,
        message: "未匹配到可以编辑修改的对象记录"
      });
      return;
    }

    res.json({
      success: true,
      data: record,
      message: "投诉信息变更并保存日志成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "编辑保存时抛出崩溃: " + error.message,
      error: error.message
    });
  }
});

// 7. DELETE Soft delete complaint
router.delete("/product-complaints/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { operator_id, operator_name } = getOperator(req);

    const success = ComplaintService.delete(id, { operator_id, operator_name });
    if (!success) {
      res.json({
        success: false,
        message: "未匹配到能软删除的目标流水"
      });
      return;
    }

    res.json({
      success: true,
      data: true,
      message: "此客诉账期数据已成功软删除归档"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: false,
      message: "删除处理未尽完成: " + error.message,
      error: error.message
    });
  }
});

// 8. POST Upload complaint picture (supports JPEG, PNG, WEBP, up to 6 images/complaint)
router.post("/product-complaints/:id/images", fileUpload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const file = req.file;

    if (!file) {
      res.json({ success: false, message: "上传的图片流数据包为空" });
      return;
    }

    // Verify MIME types
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimeTypes.includes(file.mimetype)) {
      res.json({ success: false, message: "仅支持上传 JPG, JPEG, PNG, WEBP 类型的图片格式" });
      return;
    }

    // Check count of photos for this complaint
    const record = ComplaintService.get(id);
    if (!record) {
      res.json({ success: false, message: "对应主键客诉不存在" });
      return;
    }

    if (record.images && record.images.length >= 6) {
      res.json({ success: false, message: "单条投诉最多理赔上传 6 张佐证图片" });
      return;
    }

    const { operator_id, operator_name } = getOperator(req);

    // Call service to strip, compress, save standard display & thumbnail layout
    const imgRecord = await ComplaintService.processAndAddImage(id, {
      filename: file.originalname,
      buffer: file.buffer,
      uploaded_by: operator_id,
      uploaded_by_name: operator_name
    });

    res.json({
      success: true,
      data: imgRecord,
      message: "图片压缩打包上传并落地存储成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "上传理赔遭遇异常: " + error.message,
      error: error.message
    });
  }
});

// 9. DELETE single image
router.delete("/product-complaints/:id/images/:imageId", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const imageId = req.params.imageId;
    const { operator_id, operator_name } = getOperator(req);

    const success = ComplaintService.deleteImage(id, imageId, {
      operator_id,
      operator_name
    });

    if (!success) {
      res.json({
        success: false,
        message: "图片移除不成功：图片可能已不存在或未与该单协同"
      });
      return;
    }

    res.json({
      success: true,
      data: true,
      message: "问题佐证图片软删除注销成功！"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: false,
      message: "图片移库归纳中抛出崩溃: " + error.message,
      error: error.message
    });
  }
});

// 10. GET change logs revisions
router.get("/product-complaints/:id/change-logs", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const logs = ComplaintService.getChangeLogs(id);

    res.json({
      success: true,
      data: logs,
      message: "读取变更日志履历成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "获取操作历史轨迹异常: " + error.message,
      error: error.message
    });
  }
});

// Extra check: duplicate check route for order codes
router.get("/duplicate-order-check", (req: Request, res: Response) => {
  const orderNo = req.query.orderNo as string;
  const isDup = ComplaintService.checkDuplicateOrder(orderNo);
  res.json({
    success: true,
    data: { exist: isDup },
    message: isDup ? "该订单已登记过投诉，建议复查" : "该订单尚未登记客诉信息"
  });
});

export default router;
