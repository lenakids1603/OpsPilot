/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

// ==========================================
// DB ENTITY SCHEMAS
// ==========================================

export interface Supplier {
  id: string;
  name: string;
  short_name: string;
  contact_name: string;
  phone: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export type BillType = "大货生产" | "辅料采购" | "代销结算" | "ODM开发" | "面辅料自采" | "其他";
export type SettlementMethod = "月结" | "批次结算" | "临时打款" | "代卖结算";
export type ReconciliationStatus = "draft" | "pending" | "diff" | "approved" | "partial_paid" | "settled" | "voided";

export interface ReconciliationBatch {
  id: string; // e.g., REC-202605-XXX
  bill_no: string;
  month: string; // e.g., "2026-05"
  supplier_id: string;
  supplier_name: string; // denormalized for lookups
  bill_type: BillType;
  settlement_method: SettlementMethod;
  status: ReconciliationStatus;
  
  // Amounts stored in cents integers
  system_inbound_amount: number;      // 系统到货金额
  supplier_bill_amount: number;       // 供应商账单金额
  return_amount: number;              // 退厂金额
  repair_return_amount: number;       // 返修回仓金额
  freight_amount: number;             // 运费金额
  other_adjustment_amount: number;    // 其他调整金额
  quality_deduction_amount: number;   // 质量扣款
  timeout_deduction_amount: number;   // 超时扣款
  
  calculated_payable_amount: number;  // 系统计算实际应付
  paid_amount: number;                // 已付款金额
  unpaid_amount: number;              // 待结清欠款
  diff_amount: number;                // 核对差异值 (供应商账单金额 - 系统计算实际应付)
  
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InboundItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  inbound_date: string;
  source_order_no: string;
  purchase_order_no: string;
  warehouse_receipt_no: string;
  style_code: string;
  sku_code: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number; // in cents
  amount: number; // in cents
  warehouse_operator: string;
  system_registered_at: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface BillItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  bill_line_no: number;
  style_code: string;
  sku_code: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number; // in cents
  amount: number; // in cents
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface DifferenceItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  diff_type: "数量差异" | "单价差异" | "金额差异" | "系统有供应商无" | "供应商有系统无" | "扣款未确认";
  style_code: string;
  sku_code: string;
  system_quantity: number;
  supplier_quantity: number;
  system_unit_price: number; // cents
  supplier_unit_price: number; // cents
  system_amount: number; // cents
  supplier_amount: number; // cents
  diff_amount: number; // cents
  status: "待确认" | "已确认" | "已忽略";
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface AdjustmentItem {
  id: string;
  batch_id: string;
  supplier_id: string;
  adjustment_type: "退厂" | "返修回仓" | "运费" | "其他" | "质量扣款" | "超时扣款";
  related_style_code: string;
  related_sku_code: string;
  amount: number; // cents, positive or negative? Handled as positive value in DB, sign is applied on equation
  responsibility_party: string;
  occurred_at: string;
  remark: string;
  attachment_url?: string;
  created_by: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  batch_id: string;
  supplier_id: string;
  payment_date: string;
  payer_entity: string;
  payer_account: string;
  receiver_name: string;
  receiver_account: string;
  amount: number; // cents
  remark: string;
  created_by: string;
  created_at: string;
}

export interface ReconciliationLog {
  id: string;
  batch_id: string;
  action_type: string; // e.g. "import", "approve", "add_payment", "recalculate", "add_adjustment"
  field_name?: string;
  old_value?: string;
  new_value?: string;
  operator_id: string;
  operator_name: string;
  operated_at: string;
  remark?: string;
}

export interface ImportBatch {
  id: string;
  import_type: "inbound" | "bill";
  file_name: string;
  status: "processing" | "success" | "failed";
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  created_by: string;
  created_at: string;
}

export interface RawImportRow {
  id: string;
  import_batch_id: string;
  row_index: number;
  raw_data_json: string;
  parse_status: "pending" | "success" | "failed";
  error_message?: string;
  created_at: string;
}

// Database schema
interface DbSchema {
  suppliers: Supplier[];
  batches: ReconciliationBatch[];
  inbound_items: InboundItem[];
  bill_items: BillItem[];
  differences: DifferenceItem[];
  adjustments: AdjustmentItem[];
  payments: PaymentRecord[];
  logs: ReconciliationLog[];
  import_batches: ImportBatch[];
  raw_import_rows: RawImportRow[];
}

const DATA_DIR = path.resolve(process.cwd(), "backend", "data");
const FILE_DB = path.join(DATA_DIR, "supplier_reconciliations.json");

// Singleton Store caches
let dbCache: DbSchema | null = null;

export class ReconciliationService {
  
  private static initDB() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(FILE_DB)) {
      try {
        dbCache = JSON.parse(fs.readFileSync(FILE_DB, "utf-8"));
        return;
      } catch (e) {
        console.error("Failed to read JSON DB, resetting...", e);
      }
    }

    // Populate with premium, high-fidelity default data matching the Stitch direction and screenshot
    const defaultDb: DbSchema = {
      suppliers: [
        { id: "SUP-01", name: "903服饰", short_name: "903", contact_name: "陈大春", phone: "13511110001", status: "active", created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
        { id: "SUP-02", name: "玖喆", short_name: "玖喆", contact_name: "何经理", phone: "13922220002", status: "active", created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
        { id: "SUP-03", name: "木木子", short_name: "木木子", contact_name: "林建华", phone: "13633330003", status: "active", created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
        { id: "SUP-04", name: "果之", short_name: "果之", contact_name: "马经理", phone: "13844440004", status: "active", created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
        { id: "SUP-05", name: "聚拓", short_name: "聚拓", contact_name: "吴经理", phone: "15955550005", status: "active", created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" }
      ],
      batches: [
        {
          id: "REC-202605-01",
          bill_no: "RECON-202605-01",
          month: "2026-05",
          supplier_id: "SUP-01",
          supplier_name: "903服饰",
          bill_type: "大货生产",
          settlement_method: "月结",
          status: "pending",
          system_inbound_amount: 85000000,      // 850,000.00 yuan
          supplier_bill_amount: 83550000,       // 835,500.00 yuan
          return_amount: 1200000,               // 12,000.00 yuan
          repair_return_amount: 0,
          freight_amount: 250000,               // +2,500.00 yuan
          other_adjustment_amount: 0,
          quality_deduction_amount: 500000,      // -5,000.00 yuan
          timeout_deduction_amount: 0,
          calculated_payable_amount: 83550000,
          paid_amount: 0,
          unpaid_amount: 83550000,
          diff_amount: 0,
          created_by: "finance@lenakids.com",
          created_at: "2026-05-20T09:00:00Z",
          updated_at: "2026-05-26T09:20:00Z"
        },
        {
          id: "REC-202605-02",
          bill_no: "RECON-202605-02",
          month: "2026-05",
          supplier_id: "SUP-02",
          supplier_name: "玖喆",
          bill_type: "辅料采购",
          settlement_method: "批次结算",
          status: "settled",
          system_inbound_amount: 12500000,      // 125,000.00
          supplier_bill_amount: 12420000,       // 124,200.00
          return_amount: 0,
          repair_return_amount: 0,
          freight_amount: 0,
          other_adjustment_amount: 0,
          quality_deduction_amount: 80000,       // -800.00
          timeout_deduction_amount: 0,
          calculated_payable_amount: 12420000,
          paid_amount: 12420000,                 // fully paid
          unpaid_amount: 0,
          diff_amount: 0,
          created_by: "finance@lenakids.com",
          created_at: "2026-05-21T10:15:00Z",
          updated_at: "2026-05-25T15:30:00Z"
        },
        {
          id: "REC-202605-03",
          bill_no: "RECON-202605-03",
          month: "2026-05",
          supplier_id: "SUP-03",
          supplier_name: "木木子",
          bill_type: "代销结算",
          settlement_method: "代卖结算",
          status: "diff",
          system_inbound_amount: 43020000,      // 430,200.00
          supplier_bill_amount: 37820000,       // 378,200.00 (which gives dynamic core diff of 5,400.00 yuan)
          return_amount: 4500000,               // -45,000.00
          repair_return_amount: 0,
          freight_amount: 0,
          other_adjustment_amount: 0,
          quality_deduction_amount: 1240000,     // -12,400.00
          timeout_deduction_amount: 0,
          calculated_payable_amount: 37280000,
          paid_amount: 20000000,                 // 200,000.00 paid
          unpaid_amount: 17280000,
          diff_amount: 540000,                  // diff = 37,820,000 - 37,280,000 = 540,000 cents (5,400 yuan)
          created_by: "finance@lenakids.com",
          created_at: "2026-05-22T11:40:00Z",
          updated_at: "2026-05-24T16:22:00Z"
        },
        {
          id: "REC-202605-04",
          bill_no: "RECON-202605-04",
          month: "2026-05",
          supplier_id: "SUP-04",
          supplier_name: "果之",
          bill_type: "ODM开发",
          settlement_method: "临时打款",
          status: "approved",
          system_inbound_amount: 62000000,      // 620,000.00
          supplier_bill_amount: 61770000,       // 617,700.00
          return_amount: 0,
          repair_return_amount: 0,
          freight_amount: 0,
          other_adjustment_amount: 0,
          quality_deduction_amount: 230000,      // -2,300.00
          timeout_deduction_amount: 0,
          calculated_payable_amount: 61770000,
          paid_amount: 0,
          unpaid_amount: 61770000,
          diff_amount: 0,
          approved_by: "boss@lenakids.com",
          approved_at: "2026-05-25T17:00:00Z",
          created_by: "purchase@lenakids.com",
          created_at: "2026-05-23T14:50:00Z",
          updated_at: "2026-05-25T17:00:00Z"
        },
        {
          id: "REC-202605-05",
          bill_no: "RECON-202605-05",
          month: "2026-05",
          supplier_id: "SUP-05",
          supplier_name: "聚拓",
          bill_type: "面辅料自采",
          settlement_method: "批次结算",
          status: "partial_paid",
          system_inbound_amount: 42560000,      // 425,600.00
          supplier_bill_amount: 41970000,       // 419,700.00
          return_amount: 560000,                // -5,600.00
          repair_return_amount: 0,
          freight_amount: 120000,               // +1,200.00
          other_adjustment_amount: 0,
          quality_deduction_amount: 150000,      // -1,500.00
          timeout_deduction_amount: 0,
          calculated_payable_amount: 41970000,
          paid_amount: 20000000,                 // 200,000.00
          unpaid_amount: 19970000,               // recalculated: 41,970,000 - 20,000,000 = 21,970,000
          diff_amount: 0,
          created_by: "finance@lenakids.com",
          created_at: "2026-05-24T16:00:00Z",
          updated_at: "2026-05-26T08:10:00Z"
        }
      ],
      inbound_items: [
        {
          id: "INB-101",
          batch_id: "REC-202605-01",
          supplier_id: "SUP-01",
          inbound_date: "2026-05-10",
          source_order_no: "SO-10029312",
          purchase_order_no: "PO-20260510-001",
          warehouse_receipt_no: "WR-20260510-01",
          style_code: "903-TY6623",
          sku_code: "903-TY6623-P90",
          product_name: "女童提花高弹哈衣",
          color: "樱桃粉",
          size: "90码",
          quantity: 20000,
          unit_price: 4250, // 42.5 yuan
          amount: 85000000, // 20000 * 42.5 yuan = 850,000
          warehouse_operator: "赵入库",
          system_registered_at: "2026-05-10T14:30:00Z",
          remark: "首期大货入仓，检测件数齐套",
          created_at: "2026-05-10T14:30:00Z",
          updated_at: "2026-05-10T14:30:00Z"
        },
        {
          id: "INB-301",
          batch_id: "REC-202605-03",
          supplier_id: "SUP-03",
          inbound_date: "2026-05-12",
          source_order_no: "SO-10029315",
          purchase_order_no: "PO-20260512-003",
          warehouse_receipt_no: "WR-20260512-04",
          style_code: "MMZ-XL0912",
          sku_code: "MMZ-XL0912-P73",
          product_name: "婴儿双层精梳棉睡裙",
          color: "浅桃粉",
          size: "73码",
          quantity: 17208,
          unit_price: 2500, // 25.0 yuan
          amount: 43020000, // 17208 * 25 yuan = 430,200.00
          warehouse_operator: "赵入库",
          system_registered_at: "2026-05-12T16:00:00Z",
          remark: "面料精梳入库",
          created_at: "2026-05-12T16:00:00Z",
          updated_at: "2026-05-12T16:00:00Z"
        }
      ],
      bill_items: [
        {
          id: "BIL-101",
          batch_id: "REC-202605-01",
          supplier_id: "SUP-01",
          bill_line_no: 1,
          style_code: "903-TY6623",
          sku_code: "903-TY6623-P90",
          product_name: "女童提花高弹哈衣",
          color: "樱桃粉",
          size: "90码",
          quantity: 20000,
          unit_price: 4250,
          amount: 85000000,
          remark: "申报2万套，金额契合",
          created_at: "2026-05-20T09:00:00Z",
          updated_at: "2026-05-20T09:00:00Z"
        },
        {
          id: "BIL-301",
          batch_id: "REC-202605-03",
          supplier_id: "SUP-03",
          bill_line_no: 1,
          style_code: "MMZ-XL0912",
          sku_code: "MMZ-XL0912-P73",
          product_name: "婴儿双层精梳棉睡裙",
          color: "浅桃粉",
          size: "73码",
          quantity: 14546,
          unit_price: 2600, // 26 yuan - contract was 25 yuan!
          amount: 37820056, // 14546 * 26 yuan = 378,196 + rounding
          remark: "申报数量14546件，账面申报价格比合同原售价单价高 1 元",
          created_at: "2026-05-22T11:40:00Z",
          updated_at: "2026-05-22T11:40:00Z"
        }
      ],
      differences: [
        {
          id: "DIF-301",
          batch_id: "REC-202605-03",
          supplier_id: "SUP-03",
          diff_type: "单价差异",
          style_code: "MMZ-XL0912",
          sku_code: "MMZ-XL0912-P73",
          system_quantity: 17208,
          supplier_quantity: 14546,
          system_unit_price: 2500, // 25 元
          supplier_unit_price: 2600, // 26 元
          system_amount: 43020000,
          supplier_amount: 37820000,
          diff_amount: 540000, // Overall sum difference
          status: "待确认",
          remark: "合同单价25，供应商以大货正价26申报。数量也有仓库短缺/退厂差异。",
          created_at: "2026-05-22T11:40:00Z",
          updated_at: "2026-05-22T11:40:00Z"
        }
      ],
      adjustments: [
        {
          id: "ADJ-101",
          batch_id: "REC-202605-01",
          supplier_id: "SUP-01",
          adjustment_type: "退厂",
          related_style_code: "903-TY6623",
          related_sku_code: "903-TY6623-P90",
          amount: 1200000, // 12,000.00 yuan
          responsibility_party: "供应商原因退港",
          occurred_at: "2026-05-12",
          remark: "不合格哈衣瑕疵品批量返厂退货",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-20T09:10:00Z"
        },
        {
          id: "ADJ-102",
          batch_id: "REC-202605-01",
          supplier_id: "SUP-01",
          adjustment_type: "运费",
          related_style_code: "",
          related_sku_code: "",
          amount: 250000, // +2500
          responsibility_party: "乐娜电商公摊",
          occurred_at: "2026-05-10",
          remark: "返工运费我方承担打款",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-20T09:12:00Z"
        },
        {
          id: "ADJ-103",
          batch_id: "REC-202605-01",
          supplier_id: "SUP-01",
          adjustment_type: "质量扣款",
          related_style_code: "903-TY6623",
          related_sku_code: "",
          amount: 500000, // -5,000.00
          responsibility_party: "供应商车间工艺瑕疵",
          occurred_at: "2026-05-15",
          remark: "首批大货开线针脚超标质量索扣",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-20T09:15:00Z"
        },
        {
          id: "ADJ-301",
          batch_id: "REC-202605-03",
          supplier_id: "SUP-03",
          adjustment_type: "退厂",
          related_style_code: "MMZ-XL0912",
          related_sku_code: "MMZ-XL0912-P73",
          amount: 4500000, // ¥45,000.00
          responsibility_party: "面料水洗不合格",
          occurred_at: "2026-05-14",
          remark: "水洗染色偏色，整批退回广州厂家",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-22T12:00:00Z"
        },
        {
          id: "ADJ-302",
          batch_id: "REC-202605-03",
          supplier_id: "SUP-03",
          adjustment_type: "质量扣款",
          related_style_code: "MMZ-XL0912",
          related_sku_code: "",
          amount: 1240000, // ¥12,400.00
          responsibility_party: "广州童布辅料部",
          occurred_at: "2026-05-18",
          remark: "童裙拉链顺滑度差，质检罚款扣减",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-22T12:05:00Z"
        }
      ],
      payments: [
        {
          id: "PAY-10029",
          batch_id: "REC-202605-05",
          supplier_id: "SUP-05",
          payment_date: "2026-05-25",
          payer_entity: "杭州乐娜童衣有限公司",
          payer_account: "招商银行 (对公端 9120)",
          receiver_name: "聚拓纺织服装厂",
          receiver_account: "CIB-62284892100",
          amount: 20000000, // ¥200,000.00
          remark: "先行支付该批次棉服采购订金",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-25T14:30:00Z"
        },
        {
          id: "PAY-10030",
          batch_id: "REC-202605-02",
          supplier_id: "SUP-02",
          payment_date: "2026-05-24",
          payer_entity: "杭州乐娜童衣有限公司",
          payer_account: "建设银行 (对公端 8813)",
          receiver_name: "玖喆辅料配饰行",
          receiver_account: "CCB-621720893321",
          amount: 12420000, // ¥124,200.00
          remark: "辅料采购大货货款完税全额结清",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-24T10:00:00Z"
        },
        {
          id: "PAY-10031",
          batch_id: "REC-202605-03",
          supplier_id: "SUP-03",
          payment_date: "2026-05-23",
          payer_entity: "杭州乐娜童衣有限公司",
          payer_account: "招商银行 (对公端 9120)",
          receiver_name: "木木子设计代理部",
          receiver_account: "ICBC-622202111222",
          amount: 20000000, // ¥200,000.00
          remark: "首期打款打网银",
          created_by: "finance@lenakids.com",
          created_at: "2026-05-23T16:00:00Z"
        }
      ],
      logs: [
        { id: "LOG-01", batch_id: "REC-202605-01", action_type: "create", operator_id: "system", operator_name: "系统自动跑批", operated_at: "2026-05-20T09:00:00Z", remark: "自动汇算 903服饰 5月到货应收账套" },
        { id: "LOG-02", batch_id: "REC-202605-03", action_type: "recalculate", operator_id: "finance@lenakids.com", operator_name: "陈财务", operated_at: "2026-05-24T16:22:00Z", remark: "重新核准差异计算，产生核对偏位 ¥5,400.00" }
      ],
      import_batches: [],
      raw_import_rows: []
    };

    dbCache = defaultDb;
    ReconciliationService.saveDB();
  }

  private static saveDB() {
    if (!dbCache) return;
    try {
      fs.writeFileSync(FILE_DB, JSON.stringify(dbCache, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write JSON DB to file", e);
    }
  }

  // Ensure DB Cache is hot
  private static getDB(): DbSchema {
    if (!dbCache) {
      ReconciliationService.initDB();
    }
    return dbCache!;
  }

  // ==========================================
  // CORE FORMULA AND STATUS LOGIC (AS MANDATED)
  // ==========================================

  /**
   * Calculates payable, unpaid, and diff amount in cents for a batch.
   * Modifies the batch object in-place.
   */
  public static calculateBatchFormulae(batch: ReconciliationBatch): void {
    // 1. Calculate values based on the strict formula
    // calculated_payable_amount = system_inbound_amount - return_amount + repair_return_amount + freight_amount + other_adjustment_amount - quality_deduction_amount - timeout_deduction_amount
    batch.calculated_payable_amount = 
      batch.system_inbound_amount 
      - batch.return_amount 
      + batch.repair_return_amount 
      + batch.freight_amount 
      + batch.other_adjustment_amount 
      - batch.quality_deduction_amount 
      - batch.timeout_deduction_amount;

    // 2. 待结清欠款 = 系统计算实际应付金额 - 已付款金额
    batch.unpaid_amount = batch.calculated_payable_amount - batch.paid_amount;
    if (batch.unpaid_amount < 0) {
      batch.unpaid_amount = 0; // Prevent minor pennies or overpayment turning negative in display
    }

    // 3. 核对差异 = 供应商账单金额 - 系统计算实际应付金额
    batch.diff_amount = batch.supplier_bill_amount - batch.calculated_payable_amount;
    
    // 4. Update status with strict rules in the Fourth block
    // draft / pending / diff / approved / partial_paid / settled / voided
    if (batch.status !== "voided" && batch.status !== "draft") {
      if (batch.diff_amount !== 0) {
        batch.status = "diff"; // 有差异优先
      } else {
        // No difference. If fully paid (unpaid <= 0) and is already approved/partial_paid/settled, it becomes settled!
        if (batch.unpaid_amount <= 0 && (batch.status === "approved" || batch.status === "partial_paid" || batch.status === "settled")) {
          batch.status = "settled";
        } else if (batch.paid_amount > 0 && (batch.status === "approved" || batch.status === "partial_paid")) {
          batch.status = "partial_paid";
        } else if (batch.status === "settled" || batch.status === "partial_paid" || batch.status === "approved") {
          // Keep approved status
        } else {
          batch.status = "pending"; // No difference and not approved yet
        }
      }
    }
    
    batch.updated_at = new Date().toISOString();
  }

  // ==========================================
  // BUSINESS OPERATIONS
  // ==========================================

  public static list(filters: {
    month?: string;
    supplier_id?: string;
    status?: string;
    bill_type?: string;
    settlement_method?: string;
    only_diff?: string;
  }) {
    const db = ReconciliationService.getDB();
    let result = [...db.batches];

    // Filter by month
    if (filters.month && filters.month !== "全部") {
      result = result.filter(b => b.month === filters.month);
    }
    // Filter by supplier
    if (filters.supplier_id && filters.supplier_id !== "全部") {
      result = result.filter(b => b.supplier_id === filters.supplier_id);
    }
    // Filter by status
    if (filters.status && filters.status !== "全部") {
      result = result.filter(b => b.status === filters.status);
    }
    // Filter by bill_type
    if (filters.bill_type && filters.bill_type !== "全部") {
      result = result.filter(b => b.bill_type === filters.bill_type);
    }
    // Filter by settlement_method
    if (filters.settlement_method && filters.settlement_method !== "全部") {
      result = result.filter(b => b.settlement_method === filters.settlement_method);
    }
    // Filter by only differences
    if (filters.only_diff === "true") {
      result = result.filter(b => b.diff_amount !== 0);
    }

    return result;
  }

  public static listSuppliers() {
    const db = ReconciliationService.getDB();
    return db.suppliers;
  }

  public static summary() {
    const db = ReconciliationService.getDB();
    let totalInbound = 0;
    let totalDeductions = 0; // adjustments return, quality, timeout deductions overall sum
    let totalPayable = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;
    let abnormalCount = 0;

    db.batches.forEach(b => {
      // Aggregate active batches only
      if (b.status !== "voided") {
        totalInbound += b.system_inbound_amount;
        
        // Sum of negative lines: return_amount, quality, timeout
        totalDeductions += (b.return_amount + b.quality_deduction_amount + b.timeout_deduction_amount);
        // Add freight/adjustments into offset as needed
        totalPayable += b.calculated_payable_amount;
        totalPaid += b.paid_amount;
        totalUnpaid += b.unpaid_amount;
        
        if (b.diff_amount !== 0) {
          abnormalCount++;
        }
      }
    });

    return {
      total_inbound: totalInbound,
      total_deductions: totalDeductions,
      total_payable: totalPayable,
      total_paid: totalPaid,
      total_unpaid: totalUnpaid,
      abnormal_count: abnormalCount
    };
  }

  public static getBatch(id: string): ReconciliationBatch | null {
    const db = ReconciliationService.getDB();
    return db.batches.find(b => b.id === id) || null;
  }

  public static getInboundItems(batchId: string): InboundItem[] {
    const db = ReconciliationService.getDB();
    return db.inbound_items.filter(item => item.batch_id === batchId);
  }

  public static getBillItems(batchId: string): BillItem[] {
    const db = ReconciliationService.getDB();
    return db.bill_items.filter(item => item.batch_id === batchId);
  }

  public static getDifferences(batchId: string): DifferenceItem[] {
    const db = ReconciliationService.getDB();
    return db.differences.filter(item => item.batch_id === batchId);
  }

  public static getAdjustments(batchId: string): AdjustmentItem[] {
    const db = ReconciliationService.getDB();
    return db.adjustments.filter(item => item.batch_id === batchId);
  }

  public static getPayments(batchId: string): PaymentRecord[] {
    const db = ReconciliationService.getDB();
    return db.payments.filter(item => item.batch_id === batchId);
  }

  public static getLogs(batchId: string): ReconciliationLog[] {
    const db = ReconciliationService.getDB();
    return db.logs.filter(item => item.batch_id === batchId);
  }

  // Recalculate and comparison algorithm
  public static recalculate(id: string, operator: { id: string; name: string }): ReconciliationBatch | null {
    const db = ReconciliationService.getDB();
    const batch = db.batches.find(b => b.id === id);
    if (!batch) return null;

    // Recalculate inbound sum from supplier_inbound_items
    const inboundItems = db.inbound_items.filter(item => item.batch_id === id);
    if (inboundItems.length > 0) {
      batch.system_inbound_amount = inboundItems.reduce((sum, item) => sum + item.amount, 0);
    }

    // Recalculate adjustments based on their types
    const adjs = db.adjustments.filter(item => item.batch_id === id);
    batch.return_amount = adjs.filter(a => a.adjustment_type === "退厂").reduce((sum, item) => sum + item.amount, 0);
    batch.repair_return_amount = adjs.filter(a => a.adjustment_type === "返修回仓").reduce((sum, item) => sum + item.amount, 0);
    batch.freight_amount = adjs.filter(a => a.adjustment_type === "运费").reduce((sum, item) => sum + item.amount, 0);
    batch.other_adjustment_amount = adjs.filter(a => a.adjustment_type === "其他").reduce((sum, item) => sum + item.amount, 0);
    batch.quality_deduction_amount = adjs.filter(a => a.adjustment_type === "质量扣款").reduce((sum, item) => sum + item.amount, 0);
    batch.timeout_deduction_amount = adjs.filter(a => a.adjustment_type === "超时扣款").reduce((sum, item) => sum + item.amount, 0);

    // Recalculate payment records sum
    const payRecs = db.payments.filter(item => item.batch_id === id);
    batch.paid_amount = payRecs.reduce((sum, item) => sum + item.amount, 0);

    // Run core matching algorithm to generate DifferenceItems
    ReconciliationService.automatchDifferences(id);

    // Run strict calculations
    ReconciliationService.calculateBatchFormulae(batch);

    // Add activity log
    const logId = "LOG-" + crypto.randomUUID().slice(0, 8);
    db.logs.push({
      id: logId,
      batch_id: id,
      action_type: "recalculate",
      operator_id: operator.id,
      operator_name: operator.name,
      operated_at: new Date().toISOString()
    });

    ReconciliationService.saveDB();
    return batch;
  }

  /**
   * Generates Differences automatically by comparing inbound items and supplier bill items
   */
  public static automatchDifferences(batchId: string): void {
    const db = ReconciliationService.getDB();
    const batch = db.batches.find(b => b.id === batchId);
    if (!batch) return;

    // Filter inbound and bill items
    const inbounds = db.inbound_items.filter(item => item.batch_id === batchId);
    const bills = db.bill_items.filter(item => item.batch_id === batchId);

    // Clear previous automated diff items for this batch
    db.differences = db.differences.filter(diff => diff.batch_id !== batchId);

    // Match by SKU code primarily, otherwise Style + Color + Size
    const inboundsByKey: Record<string, InboundItem[]> = {};
    inbounds.forEach(item => {
      const key = item.sku_code || `${item.style_code}|${item.color}|${item.size}`;
      if (!inboundsByKey[key]) inboundsByKey[key] = [];
      inboundsByKey[key].push(item);
    });

    const billsByKey: Record<string, BillItem[]> = {};
    bills.forEach(item => {
      const key = item.sku_code || `${item.style_code}|${item.color}|${item.size}`;
      if (!billsByKey[key]) billsByKey[key] = [];
      billsByKey[key].push(item);
    });

    const allKeys = new Set([...Object.keys(inboundsByKey), ...Object.keys(billsByKey)]);

    allKeys.forEach(key => {
      const systemRows = inboundsByKey[key] || [];
      const billRows = billsByKey[key] || [];

      const systemQty = systemRows.reduce((sum, r) => sum + r.quantity, 0);
      const systemAmt = systemRows.reduce((sum, r) => sum + r.amount, 0);
      const systemPrice = systemRows.length > 0 ? systemRows[0].unit_price : 0;

      const billQty = billRows.reduce((sum, r) => sum + r.quantity, 0);
      const billAmt = billRows.reduce((sum, r) => sum + r.amount, 0);
      const billPrice = billRows.length > 0 ? billRows[0].unit_price : 0;

      const sampleRow = systemRows[0] || billRows[0];
      const styleCode = sampleRow.style_code;
      const skuCode = sampleRow.sku_code;

      // 1. System only
      if (billRows.length === 0 && systemRows.length > 0) {
        db.differences.push({
          id: "DIF-" + crypto.randomUUID().slice(0, 8),
          batch_id: batchId,
          supplier_id: batch.supplier_id,
          diff_type: "系统有供应商无",
          style_code: styleCode,
          sku_code: skuCode,
          system_quantity: systemQty,
          supplier_quantity: 0,
          system_unit_price: systemPrice,
          supplier_unit_price: 0,
          system_amount: systemAmt,
          supplier_amount: 0,
          diff_amount: -systemAmt, // system invoice lacks this
          status: "待确认",
          remark: "系统到货登记已确认，但供应商结算未包含此项",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      // 2. Supplier only
      else if (systemRows.length === 0 && billRows.length > 0) {
        db.differences.push({
          id: "DIF-" + crypto.randomUUID().slice(0, 8),
          batch_id: batchId,
          supplier_id: batch.supplier_id,
          diff_type: "供应商有系统无",
          style_code: styleCode,
          sku_code: skuCode,
          system_quantity: 0,
          supplier_quantity: billQty,
          system_unit_price: 0,
          supplier_unit_price: billPrice,
          system_amount: 0,
          supplier_amount: billAmt,
          diff_amount: billAmt,
          status: "待确认",
          remark: "供应商账单报送此项，但系统到货履历并无匹配",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      // 3. Match comparison
      else {
        const qtyDiff = billQty - systemQty;
        const priceDiff = billPrice - systemPrice;
        const amtDiff = billAmt - systemAmt;

        if (priceDiff !== 0) {
          db.differences.push({
            id: "DIF-" + crypto.randomUUID().slice(0, 8),
            batch_id: batchId,
            supplier_id: batch.supplier_id,
            diff_type: "单价差异",
            style_code: styleCode,
            sku_code: skuCode,
            system_quantity: systemQty,
            supplier_quantity: billQty,
            system_unit_price: systemPrice,
            supplier_unit_price: billPrice,
            system_amount: systemAmt,
            supplier_amount: billAmt,
            diff_amount: amtDiff,
            status: "待确认",
            remark: `价格不一致：合同单价为 ¥${(systemPrice / 100).toFixed(2)} / 申报单价为 ¥${(billPrice / 100).toFixed(2)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else if (qtyDiff !== 0) {
          db.differences.push({
            id: "DIF-" + crypto.randomUUID().slice(0, 8),
            batch_id: batchId,
            supplier_id: batch.supplier_id,
            diff_type: "数量差异",
            style_code: styleCode,
            sku_code: skuCode,
            system_quantity: systemQty,
            supplier_quantity: billQty,
            system_unit_price: systemPrice,
            supplier_unit_price: billPrice,
            system_amount: systemAmt,
            supplier_amount: billAmt,
            diff_amount: amtDiff,
            status: "待确认",
            remark: `数量无法对准：系统到货量 ${systemQty} / 申购量 ${billQty} (相差 ${qtyDiff})`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else if (amtDiff !== 0) {
          db.differences.push({
            id: "DIF-" + crypto.randomUUID().slice(0, 8),
            batch_id: batchId,
            supplier_id: batch.supplier_id,
            diff_type: "金额差异",
            style_code: styleCode,
            sku_code: skuCode,
            system_quantity: systemQty,
            supplier_quantity: billQty,
            system_unit_price: systemPrice,
            supplier_unit_price: billPrice,
            system_amount: systemAmt,
            supplier_amount: billAmt,
            diff_amount: amtDiff,
            status: "待确认",
            remark: `金额比对差异 ¥${(amtDiff / 100).toFixed(2)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    });
  }

  public static approve(id: string, operator: { id: string; name: string }): ReconciliationBatch | null {
    const db = ReconciliationService.getDB();
    const batch = db.batches.find(b => b.id === id);
    if (!batch) return null;

    batch.status = "approved";
    batch.approved_by = operator.id;
    batch.approved_at = new Date().toISOString();
    
    // Recalculate forces settled if fully paid
    ReconciliationService.calculateBatchFormulae(batch);

    const logId = "LOG-" + crypto.randomUUID().slice(0, 8);
    db.logs.push({
      id: logId,
      batch_id: id,
      action_type: "approve",
      operator_id: operator.id,
      operator_name: operator.name,
      operated_at: new Date().toISOString(),
      new_value: "approved"
    });

    ReconciliationService.saveDB();
    return batch;
  }

  public static reopen(id: string, operator: { id: string; name: string }): ReconciliationBatch | null {
    const db = ReconciliationService.getDB();
    const batch = db.batches.find(b => b.id === id);
    if (!batch) return null;

    batch.status = "pending";
    batch.approved_by = undefined;
    batch.approved_at = undefined;

    ReconciliationService.calculateBatchFormulae(batch);

    const logId = "LOG-" + crypto.randomUUID().slice(0, 8);
    db.logs.push({
      id: logId,
      batch_id: id,
      action_type: "reopen",
      operator_id: operator.id,
      operator_name: operator.name,
      operated_at: new Date().toISOString(),
      new_value: "pending"
    });

    ReconciliationService.saveDB();
    return batch;
  }

  public static addAdjustment(batchId: string, adj: Omit<AdjustmentItem, "id" | "created_at">, operator: { id: string; name: string }): AdjustmentItem | null {
    const db = ReconciliationService.getDB();
    const batch = db.batches.find(b => b.id === batchId);
    if (!batch) return null;

    const newAdj: AdjustmentItem = {
      ...adj,
      id: "ADJ-" + crypto.randomUUID().slice(0, 8),
      created_at: new Date().toISOString()
    };

    db.adjustments.push(newAdj);

    // Apply adjustments to parent batch variables
    const val = adj.amount;
    switch (adj.adjustment_type) {
      case "退厂": batch.return_amount += val; break;
      case "返修回仓": batch.repair_return_amount += val; break;
      case "运费": batch.freight_amount += val; break;
      case "其他": batch.other_adjustment_amount += val; break;
      case "质量扣款": batch.quality_deduction_amount += val; break;
      case "超时扣款": batch.timeout_deduction_amount += val; break;
    }

    ReconciliationService.calculateBatchFormulae(batch);

    const logId = "LOG-" + crypto.randomUUID().slice(0, 8);
    db.logs.push({
      id: logId,
      batch_id: batchId,
      action_type: "add_adjustment",
      operator_id: operator.id,
      operator_name: operator.name,
      operated_at: new Date().toISOString(),
      remark: `新增扣减调整：${adj.adjustment_type} - ¥${(adj.amount / 100).toFixed(2)}`
    });

    ReconciliationService.saveDB();
    return newAdj;
  }

  public static addPayment(batchId: string, pay: Omit<PaymentRecord, "id" | "created_at">, operator: { id: string; name: string }): PaymentRecord | null {
    const db = ReconciliationService.getDB();
    const batch = db.batches.find(b => b.id === batchId);
    if (!batch) return null;

    const newPay: PaymentRecord = {
      ...pay,
      id: "PAY-" + crypto.randomUUID().slice(0, 8),
      created_at: new Date().toISOString()
    };

    db.payments.push(newPay);

    // Add to paid_amount on parent batch
    batch.paid_amount += pay.amount;

    ReconciliationService.calculateBatchFormulae(batch);

    const logId = "LOG-" + crypto.randomUUID().slice(0, 8);
    db.logs.push({
      id: logId,
      batch_id: batchId,
      action_type: "add_payment",
      operator_id: operator.id,
      operator_name: operator.name,
      operated_at: new Date().toISOString(),
      remark: `登记网银付款流水：实投 ¥${(pay.amount / 100).toFixed(2)} | 收款：${pay.receiver_name}`
    });

    ReconciliationService.saveDB();
    return newPay;
  }

  // Raw file logging imports
  public static createImportSession(type: "inbound" | "bill", filename: string, totalRows: number, operatorId: string): ImportBatch {
    const db = ReconciliationService.getDB();
    const session: ImportBatch = {
      id: "IMP-" + crypto.randomUUID().slice(0, 8),
      import_type: type,
      file_name: filename,
      status: "success",
      total_rows: totalRows,
      success_rows: totalRows,
      failed_rows: 0,
      created_by: operatorId,
      created_at: new Date().toISOString()
    };
    db.import_batches.push(session);
    ReconciliationService.saveDB();
    return session;
  }

  public static pushRawRows(sessionId: string, rows: any[]): void {
    const db = ReconciliationService.getDB();
    rows.forEach((r, idx) => {
      db.raw_import_rows.push({
        id: "RAW-" + crypto.randomUUID().slice(0, 8),
        import_batch_id: sessionId,
        row_index: idx + 1,
        raw_data_json: JSON.stringify(r),
        parse_status: "success",
        created_at: new Date().toISOString()
      });
    });
    ReconciliationService.saveDB();
  }

  public static insertInboundItemsBulk(batchId: string, items: Omit<InboundItem, "id" | "created_at" | "updated_at">[]): void {
    const db = ReconciliationService.getDB();
    const resultItems = items.map(item => ({
      ...item,
      id: "INB-" + crypto.randomUUID().slice(0, 8),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    db.inbound_items.push(...resultItems);
    ReconciliationService.saveDB();
  }

  public static insertBillItemsBulk(batchId: string, items: Omit<BillItem, "id" | "created_at" | "updated_at">[]): void {
    const db = ReconciliationService.getDB();
    const resultItems = items.map((item, index) => ({
      ...item,
      bill_line_no: index + 1,
      id: "BIL-" + crypto.randomUUID().slice(0, 8),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    db.bill_items.push(...resultItems);
    ReconciliationService.saveDB();
  }
}
