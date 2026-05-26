/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { ReconciliationService } from "../services/reconciliationService";

const router = Router();

// Configure multer file upload middleware using in-memory buffer storage
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper to extract session details from custom HTTP headers
function getOperator(req: Request) {
  const email = (req.headers["x-user-email"] as string) || "finance@lenakids.com";
  let name = req.headers["x-user-name"] as string;
  if (name) {
    try {
      name = decodeURIComponent(name);
    } catch {
      // ignore
    }
  } else {
    name = "陈财务";
  }
  return {
    id: email,
    name: name
  };
}

// 1. GET list of suppliers
router.get("/suppliers", async (req: Request, res: Response) => {
  try {
    const data = ReconciliationService.listSuppliers();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(550).json({ success: false, message: error.message });
  }
});

// 2. GET summary metadata for top metrics cards
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const stats = ReconciliationService.summary();
    res.json({
      success: true,
      data: stats,
      message: "汇总统计拉取成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "获取合并指标财务统计失败: " + error.message
    });
  }
});

// 3. GET primary reconciliation batches list supporting multiple filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const filters = {
      month: req.query.month as string,
      supplier_id: req.query.supplier_id as string,
      status: req.query.status as string,
      bill_type: req.query.bill_type as string,
      settlement_method: req.query.settlement_method as string,
      only_diff: req.query.only_diff as string
    };

    const batches = ReconciliationService.list(filters);
    res.json({
      success: true,
      data: batches,
      message: "读取主核对账单成功"
    });
  } catch (error: any) {
    res.json({
      success: false,
      data: null,
      message: "加载核对批次账本失败: " + error.message
    });
  }
});

// 4. GET single reconciliation batch detail
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const batch = ReconciliationService.getBatch(req.params.id);
    if (!batch) {
      res.json({ success: false, message: "对应结算期批次不存在" });
      return;
    }
    res.json({ success: true, data: batch });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 5. GET sub-items: System inbound items
router.get("/:id/inbound-items", async (req: Request, res: Response) => {
  try {
    const data = ReconciliationService.getInboundItems(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 6. GET sub-items: Supplier bill items
router.get("/:id/bill-items", async (req: Request, res: Response) => {
  try {
    const data = ReconciliationService.getBillItems(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 7. GET sub-items: Differences details matching result
router.get("/:id/differences", async (req: Request, res: Response) => {
  try {
    const data = ReconciliationService.getDifferences(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 8. GET sub-items: Adjustments deductions and supplements
router.get("/:id/adjustments", async (req: Request, res: Response) => {
  try {
    const data = ReconciliationService.getAdjustments(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 9. GET sub-items: Payments ledger records
router.get("/:id/payments", async (req: Request, res: Response) => {
  try {
    const data = ReconciliationService.getPayments(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 10. GET sub-items: Change logs
router.get("/:id/logs", async (req: Request, res: Response) => {
  try {
    const data = ReconciliationService.getLogs(req.params.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 11. POST Recalculate and automatched discrepancies triggers
router.post("/:id/recalculate", async (req: Request, res: Response) => {
  try {
    const op = getOperator(req);
    const updated = ReconciliationService.recalculate(req.params.id, op);
    if (!updated) {
      res.json({ success: false, message: "重算失败，找不到对应批次单据" });
      return;
    }
    res.json({
      success: true,
      data: updated,
      message: "主表金额及差异勾稽已成功刷新自动匹配！"
    });
  } catch (error: any) {
    res.json({ success: false, message: "核算公式运算中崩溃: " + error.message });
  }
});

// 12. POST Mark Approved
router.post("/:id/approve", async (req: Request, res: Response) => {
  try {
    const op = getOperator(req);
    const updated = ReconciliationService.approve(req.params.id, op);
    if (!updated) {
      res.json({ success: false, message: "未找到结算批次" });
      return;
    }
    res.json({
      success: true,
      data: updated,
      message: "结算批次单已通过财务核准！应付正式生效"
    });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 13. POST Reopen (reconcile again)
router.post("/:id/reopen", async (req: Request, res: Response) => {
  try {
    const op = getOperator(req);
    const updated = ReconciliationService.reopen(req.params.id, op);
    if (!updated) {
      res.json({ success: false, message: "未找到结算批次" });
      return;
    }
    res.json({
      success: true,
      data: updated,
      message: "该批核对账套已撤销核准，重置为[核对中]状态"
    });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

// 14. POST Add unique Adjustment
router.post("/:id/adjustments", async (req: Request, res: Response) => {
  try {
    const op = getOperator(req);
    const { adjustment_type, related_style_code, related_sku_code, amount, responsibility_party, occurred_at, remark } = req.body;
    
    if (!adjustment_type || !amount) {
      res.json({ success: false, message: "调整项类型和变动金额为必填款" });
      return;
    }

    const item = ReconciliationService.addAdjustment(req.params.id, {
      batch_id: req.params.id,
      supplier_id: req.body.supplier_id || "SUP-01",
      adjustment_type,
      related_style_code: related_style_code || "",
      related_sku_code: related_sku_code || "",
      amount: Math.round(Number(amount)), // in cents
      responsibility_party: responsibility_party || "对公摊销",
      occurred_at: occurred_at || new Date().toISOString().split("T")[0],
      remark: remark || "",
      created_by: op.id
    }, op);

    res.json({
      success: true,
      data: item,
      message: `成功计入单批公摊扣费 / 其它调整项 ¥${(Number(amount) / 100).toFixed(2)}`
    });
  } catch (error: any) {
    res.json({ success: false, message: "扣款登记失败: " + error.message });
  }
});

// 15. POST Add Payment record
router.post("/:id/payments", async (req: Request, res: Response) => {
  try {
    const op = getOperator(req);
    const { payment_date, payer_entity, payer_account, receiver_name, receiver_account, amount, remark } = req.body;

    if (!amount) {
      res.json({ success: false, message: "付款核销金额为必填项" });
      return;
    }

    const pay = ReconciliationService.addPayment(req.params.id, {
      batch_id: req.params.id,
      supplier_id: req.body.supplier_id || "SUP-01",
      payment_date: payment_date || new Date().toISOString().split("T")[0],
      payer_entity: payer_entity || "杭州乐娜童衣有限公司",
      payer_account: payer_account || "招商银行 (对公端 9120)",
      receiver_name: receiver_name || "默认供应商往来户",
      receiver_account: receiver_account || "",
      amount: Math.round(Number(amount)), // in cents
      remark: remark || "",
      created_by: op.id
    }, op);

    res.json({
      success: true,
      data: pay,
      message: "网银已付结算流水登记过账成功！"
    });
  } catch (error: any) {
    res.json({ success: false, message: "付款流水账目登记失败: " + error.message });
  }
});

// 16. POST Import Inbound warehouse csv/excel items
router.post("/import-inbound", fileUpload.single("file"), async (req: Request, res: Response) => {
  try {
    const op = getOperator(req);
    let parsedRows: any[] = [];
    let fileName = "file-inbound-mock.json";

    if (req.file) {
      fileName = req.file.originalname;
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert sheet coordinates to clean JSON Rows
      parsedRows = XLSX.utils.sheet_to_json(worksheet);
    } else {
      parsedRows = req.body.rows || [];
    }

    if (parsedRows.length === 0) {
      // Create artificial beautiful items for premium simulation
      parsedRows = [
        {
          inbound_date: "2026-05-20",
          source_order_no: "SO-100401",
          purchase_order_no: "PO-20260515-090",
          warehouse_receipt_no: "WR-20260520-09",
          style_code: "903-TY8001",
          sku_code: "903-TY8001-C100",
          product_name: "爆款卡通纯棉家居爬衣",
          color: "奶油黄",
          size: "100码",
          quantity: 3000,
          unit_price: 35.00,
          amount: 105000.00,
          warehouse_operator: "赵入库",
          remark: "大货质检入仓"
        }
      ];
    }

    const totalRows = parsedRows.length;
    const session = ReconciliationService.createImportSession("inbound", fileName, totalRows, op.id);
    ReconciliationService.pushRawRows(session.id, parsedRows);

    // Write Inbound items bulk
    // Select batch ID (default dynamically to REC-202605-01 for simplicity or based on body)
    const targetBatchId = req.body.batch_id || "REC-202605-01";
    const batch = ReconciliationService.getBatch(targetBatchId);
    
    if (batch) {
      const dbItems = parsedRows.map(row => ({
        batch_id: targetBatchId,
        supplier_id: batch.supplier_id,
        inbound_date: row.inbound_date || new Date().toISOString().split("T")[0],
        source_order_no: row.source_order_no || `SO-${Math.floor(Math.random() * 900000) + 100000}`,
        purchase_order_no: row.purchase_order_no || `PO-20260515-${Math.floor(Math.random() * 900) + 100}`,
        warehouse_receipt_no: row.warehouse_receipt_no || `WR-20260520-${Math.floor(Math.random() * 90) + 10}`,
        style_code: row.style_code || "TY-001",
        sku_code: row.sku_code || "TY-001-SKU",
        product_name: row.product_name || "未知到货商品",
        color: row.color || "无色",
        size: row.size || "均码",
        quantity: Number(row.quantity) || 0,
        unit_price: Math.round((Number(row.unit_price) || 0) * 100), // convert yuan float to cents int
        amount: Math.round((Number(row.amount) || (Number(row.quantity) * Number(row.unit_price)) || 0) * 100),
        warehouse_operator: row.warehouse_operator || "赵入库",
        system_registered_at: new Date().toISOString(),
        remark: row.remark || "表格批处理导入"
      }));

      ReconciliationService.insertInboundItemsBulk(targetBatchId, dbItems);
      // Run recalculate
      ReconciliationService.recalculate(targetBatchId, op);
    }

    res.json({
      success: true,
      data: { session, rowsParsed: totalRows },
      message: `🎉 成功解析并导入 ${totalRows} 行系统实际妥收仓储到货记录！系统已自动启动双向契约对对碰。`
    });
  } catch (error: any) {
    res.json({ success: false, message: "解析仓库明细包失败: " + error.message });
  }
});

// 17. POST Import Supplier bill csv/excel declaration rows
router.post("/import-supplier-bill", fileUpload.single("file"), async (req: Request, res: Response) => {
  try {
    const op = getOperator(req);
    let parsedRows: any[] = [];
    let fileName = "file-bill-mock.xlsx";

    if (req.file) {
      fileName = req.file.originalname;
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      parsedRows = XLSX.utils.sheet_to_json(worksheet);
    } else {
      parsedRows = req.body.rows || [];
    }

    if (parsedRows.length === 0) {
      // Mock rows
      parsedRows = [
        {
          style_code: "903-TY8001",
          sku_code: "903-TY8001-C100",
          product_name: "爆款卡通纯棉家居爬衣",
          color: "奶油黄",
          size: "100码",
          quantity: 3000,
          unit_price: 36.50, // Proves diff of 1.50 yuan
          amount: 109500.00,
          remark: "供应商申报结算大货款"
        }
      ];
    }

    const totalRows = parsedRows.length;
    const session = ReconciliationService.createImportSession("bill", fileName, totalRows, op.id);
    ReconciliationService.pushRawRows(session.id, parsedRows);

    const targetBatchId = req.body.batch_id || "REC-202605-01";
    const batch = ReconciliationService.getBatch(targetBatchId);

    if (batch) {
      // Update supplier_bill_amount based on sum of imported rows
      const sumAmt = parsedRows.reduce((sum, row) => sum + (Number(row.amount) || (Number(row.quantity) * Number(row.unit_price)) || 0), 0);
      batch.supplier_bill_amount = Math.round(sumAmt * 100);

      const dbItems = parsedRows.map((row, index) => ({
        batch_id: targetBatchId,
        supplier_id: batch.supplier_id,
        bill_line_no: index + 1,
        style_code: row.style_code || "TY-001",
        sku_code: row.sku_code || "TY-001-SKU",
        product_name: row.product_name || "申账货品",
        color: row.color || "无",
        size: row.size || "均码",
        quantity: Number(row.quantity) || 0,
        unit_price: Math.round((Number(row.unit_price) || 0) * 100),
        amount: Math.round((Number(row.amount) || (Number(row.quantity) * Number(row.unit_price)) || 0) * 100),
        remark: row.remark || "供应商账单报送行"
      }));

      ReconciliationService.insertBillItemsBulk(targetBatchId, dbItems);
      // Run recalculate
      ReconciliationService.recalculate(targetBatchId, op);
    }

    res.json({
      success: true,
      data: { session, rowsParsed: totalRows },
      message: `🎉 成功解析并对仗导入 ${totalRows} 行供应商申核表格大单明细，系统正实时匹配差异！`
    });
  } catch (error: any) {
    res.json({ success: false, message: "供应商大单解析对仗失败: " + error.message });
  }
});

export default router;
