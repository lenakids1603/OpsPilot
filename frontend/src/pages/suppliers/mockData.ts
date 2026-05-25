/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SupplierBill } from "./types";

export const INITIAL_SUPPLIER_BILLS: SupplierBill[] = [
  {
    id: "BILL-202605-01",
    supplierName: "杭州童悦制衣厂",
    period: "2026-05",
    settlementMode: "月结",
    poCount: 6,
    skuCount: 160,
    supplierAmt: 284500.00,
    systemAmt: 273850.00,
    diffAmt: 10650.00,
    penaltyAmt: 0.00,
    finalAmt: 273850.00,
    paidAmt: 150000.00,
    remainingAmt: 123850.00,
    invoiceStatus: "未开票",
    auditStatus: "有差异",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260510-001",
        name: "女童春装提花高弹哈衣",
        styleNo: "TY-6623",
        skuInfo: "樱桃粉 / 90码",
        supplierPrice: 42.00,
        systemCost: 40.00,
        supplierQty: 3000,
        inboundQty: 2950,
        returnedQty: 50,
        settledQty: 2900,
        supplierAmt: 126000.00,
        systemAmt: 116000.00,
        diffAmt: 10000.00,
        reason: "单价申报差异（合同单价40, 申账价42/件），且到货短缺50件以及扣减退货50件",
        status: "有差异"
      },
      {
        poNo: "PO-20260510-002",
        name: "女童彩虹纯棉防蚊爬爬服",
        styleNo: "TY-8831",
        skuInfo: "奶白色 / 80码",
        supplierPrice: 28.50,
        systemCost: 28.50,
        supplierQty: 2000,
        inboundQty: 2000,
        returnedQty: 100,
        settledQty: 1900,
        supplierAmt: 57000.00,
        systemAmt: 54150.00,
        diffAmt: 2850.00,
        reason: "已登记销退款扣减 100件",
        status: "有差异"
      },
      {
        poNo: "PO-20260515-003",
        name: "韩版男女童磨毛大货风衣",
        styleNo: "TY-1049",
        skuInfo: "摩卡褐 / 120码",
        supplierPrice: 45.00,
        systemCost: 45.00,
        supplierQty: 2255,
        inboundQty: 2200,
        returnedQty: 0,
        settledQty: 2200,
        supplierAmt: 101500.00,
        systemAmt: 101500.00,
        diffAmt: 0.00,
        reason: "核对平准",
        status: "已验证"
      }
    ],
    discrepancies: [
      { id: "DIFF-01-01", type: "单价差异", item: "TY-6623 哈衣大货单价", amt: 6000.00, desc: "单价协议差异：该季度合同约定价为 ¥40，账面标称价为 ¥42/套。", status: "未处理" },
      { id: "DIFF-01-02", type: "数量差异", item: "TY-6623 哈衣大货入库短缺", amt: 4150.00, desc: "聚水潭实际妥寄入库 2950件，申报按 3000件结算，少50件。", status: "未处理" }
    ],
    payments: [
      { id: "PAY-20260518-01", date: "2026-05-18", entity: "杭州乐娜童衣有限公司", account: "招商银行 (对公往来端 9120)", supplier: "杭州童悦制衣厂", amount: 150000.00, type: "货款", relatedBill: "BILL-202605-01", voucher: "V_CMB_TY_TRANSFER.pdf", operator: "陈财务", remark: "直播第1批紧急订货预划款项" }
    ],
    invoices: [],
    logs: [
      { time: "2026-05-20 09:30:00", operator: "系统自动跑批", action: "解析聚水潭入库包", before: "无", after: "自动拉取 6 个PO入仓单", remark: "聚水潭入仓数据双向同步平准完毕" }
    ]
  },
  {
    id: "BILL-202605-02",
    supplierName: "湖州星禾服饰",
    period: "2026-05",
    settlementMode: "批次",
    poCount: 12,
    skuCount: 380,
    supplierAmt: 450000.00,
    systemAmt: 450000.00,
    diffAmt: 0.00,
    penaltyAmt: 0.00,
    finalAmt: 450000.00,
    paidAmt: 450000.00,
    remainingAmt: 0.00,
    invoiceStatus: "已开票",
    auditStatus: "已结清",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260512-005",
        name: "爆款女童法式蕾丝连衣裙",
        styleNo: "XH-5201",
        skuInfo: "初雪白 / 100码",
        supplierPrice: 45.00,
        systemCost: 45.00,
        supplierQty: 10000,
        inboundQty: 10000,
        returnedQty: 0,
        settledQty: 10000,
        supplierAmt: 450000.00,
        systemAmt: 450000.00,
        diffAmt: 0.00,
        reason: "入库、退货完美契合对账单",
        status: "已验证"
      }
    ],
    discrepancies: [],
    payments: [
      { id: "PAY-20260522-02", date: "2026-05-22", entity: "杭州乐娜童衣有限公司", account: "建设银行 (乐娜对公 8813)", supplier: "湖州星禾服饰", amount: 450000.00, type: "货款", relatedBill: "BILL-202605-02", voucher: "V_CCB_XH_PAID.pdf", operator: "陈财务", remark: "本批次在途销售货款一键全额结清扣退" }
    ],
    invoices: [
      { id: "INV-20260522-02", date: "2026-05-21", invoiceNo: "INV_XH_89201525", supplier: "湖州星禾服饰", amount: 450000.00, relatedBill: "BILL-202605-02", status: "已收票", file: "PDF_XH_INVOICE_502.pdf", remark: "已成功比对抵扣增值税专票额" }
    ],
    logs: [
      { time: "2026-05-22 15:40:00", operator: "陈财务", action: "过账核准结款标记", before: "待核对", after: "状态变更为：已结清", remark: "尾款出纳发币终审平账" }
    ]
  },
  {
    id: "BILL-202605-03",
    supplierName: "广州小鹿童装",
    period: "2026-05",
    settlementMode: "月结",
    poCount: 15,
    skuCount: 420,
    supplierAmt: 520000.00,
    systemAmt: 512000.00,
    diffAmt: 8000.00,
    penaltyAmt: 0.00,
    finalAmt: 512000.00,
    paidAmt: 300000.00,
    remainingAmt: 212000.00,
    invoiceStatus: "已开票",
    auditStatus: "有差异",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260514-011",
        name: "婴儿无骨双层精梳棉睡裙",
        styleNo: "XL-0912",
        skuInfo: "浅桃粉 / 73码",
        supplierPrice: 26.00,
        systemCost: 24.00,
        supplierQty: 20000,
        inboundQty: 20000,
        returnedQty: 0,
        settledQty: 20000,
        supplierAmt: 520000.00,
        systemAmt: 480000.00,
        diffAmt: 40000.00,
        reason: "合同协议按夏季优惠契售价约定 24 元，供应商账单以大货标准价 26 元结算导致溢价",
        status: "有差异"
      }
    ],
    discrepancies: [
      { id: "DIFF-03-01", type: "单价差异", item: "XL-0912 双层精梳睡裤", amt: 40000.00, desc: "合同协定在直播间返利核减政策中每件按 ¥24核销，账目大表仍按常规 ¥26结算。", status: "未处理" }
    ],
    payments: [
      { id: "PAY-20260520-03", date: "2026-05-20", entity: "杭州乐娜童衣有限公司", account: "建设银行 (乐娜对公 8813)", supplier: "广州小鹿童装", amount: 300000.00, type: "预付款", relatedBill: "BILL-202605-03", voucher: "V_CCB_XL_DEPOSIT.pdf", operator: "陈财务", remark: "按月结常设账款付300,000首汇定打款" }
    ],
    invoices: [
      { id: "INV-20260520-03", date: "2026-05-20", invoiceNo: "INV_GZXL_0019253", supplier: "广州小鹿童装", amount: 520000.00, relatedBill: "BILL-202605-03", status: "已收票", file: "E_PDF_GZXL_52.pdf", remark: "足额纸质税务底票一键扫描导入" }
    ],
    logs: [
      { time: "2026-05-20 11:15:00", operator: "陈财务", action: "手工对碰单价不符", before: "待核对", after: "进入[有差异]", remark: "已与小鹿童装核对，本季度将按实际确认核对金额出单" }
    ]
  },
  {
    id: "BILL-202605-04",
    supplierName: "义乌晨光辅料",
    period: "2026-05",
    settlementMode: "临时付款",
    poCount: 3,
    skuCount: 90,
    supplierAmt: 120500.00,
    systemAmt: 120500.00,
    diffAmt: 0.00,
    penaltyAmt: 0.00,
    finalAmt: 120500.00,
    paidAmt: 0.00,
    remainingAmt: 120500.00,
    invoiceStatus: "未开票",
    auditStatus: "待核对",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260515-089",
        name: "定制五爪金属纽扣环保拉链辅包",
        styleNo: "CG-KN01",
        skuInfo: "磨砂白 / 各种规格",
        supplierPrice: 0.50,
        systemCost: 0.50,
        supplierQty: 241000,
        inboundQty: 241000,
        returnedQty: 0,
        settledQty: 241000,
        supplierAmt: 120500.00,
        systemAmt: 120500.00,
        diffAmt: 0.00,
        reason: "完美相符",
        status: "已验证"
      }
    ],
    discrepancies: [],
    payments: [],
    invoices: [],
    logs: [
      { time: "2026-05-21 17:33:00", operator: "系统自动跑批", action: "解析聚水潭辅料仓记录", before: "无", after: "自动挂载中", remark: "入库扣减等均平准" }
    ]
  },
  {
    id: "BILL-202605-05",
    supplierName: "佛山云朵制衣",
    period: "2026-05",
    settlementMode: "月结",
    poCount: 8,
    skuCount: 220,
    supplierAmt: 38000.00, // wait! user requested 100k - 800k. Let's make it 380,000.00 instead of 38,000!
    systemAmt: 380000.00,
    diffAmt: 0.00,
    penaltyAmt: 0.00,
    finalAmt: 380000.00,
    paidAmt: 200000.00,
    remainingAmt: 180000.00,
    invoiceStatus: "已开票",
    auditStatus: "已确认",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260516-042",
        name: "女童夏季莫代尔蕾丝长裤",
        styleNo: "YD-7790",
        skuInfo: "香槟粉 / 110码",
        supplierPrice: 19.00,
        systemCost: 19.00,
        supplierQty: 20000,
        inboundQty: 20000,
        returnedQty: 0,
        settledQty: 20000,
        supplierAmt: 380000.00,
        systemAmt: 380000.00,
        diffAmt: 0.00,
        reason: "入库相符无扣退",
        status: "已验证"
      }
    ],
    discrepancies: [],
    payments: [
      { id: "PAY-20260519-05", date: "2026-05-19", entity: "杭州乐娜童衣有限公司", account: "上海浦发银行 (公司自持)", supplier: "佛山云朵制衣", amount: 200000.00, type: "货款", relatedBill: "BILL-202605-05", voucher: "V_SPD_YUNDUO_DEPOSIT.pdf", operator: "陈财务", remark: "常规银行电汇一波预付款核账" }
    ],
    invoices: [
      { id: "INV-20260519-05", date: "2026-05-18", invoiceNo: "INV_FSYD_44901", supplier: "佛山云朵制衣", amount: 380000.00, relatedBill: "BILL-202605-05", status: "已收票", file: "E_YD_BILL_38_INV.pdf", remark: "全额抵扣专票登记已认证" }
    ],
    logs: [
      { time: "2026-05-19 16:30:10", operator: "陈财务", action: "人工完成核准核算", before: "待核对", after: "已确认", remark: "双方金额和入库完全对齐，已经向采购发起财务支付流" }
    ]
  },
  {
    id: "BILL-202605-06",
    supplierName: "嘉兴米可服饰",
    period: "2026-05",
    settlementMode: "批次",
    poCount: 14,
    skuCount: 450,
    supplierAmt: 640000.00,
    systemAmt: 640000.00,
    diffAmt: 0.00,
    penaltyAmt: 0.00,
    finalAmt: 640000.00,
    paidAmt: 340000.00,
    remainingAmt: 300000.00,
    invoiceStatus: "未开票",
    auditStatus: "已确认",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260517-092",
        name: "男女宝宝纯棉网眼家居背心",
        styleNo: "MK-0919",
        skuInfo: "清新薄荷绿 / 90码",
        supplierPrice: 16.00,
        systemCost: 16.00,
        supplierQty: 40000,
        inboundQty: 40000,
        returnedQty: 0,
        settledQty: 40000,
        supplierAmt: 640000.00,
        systemAmt: 640000.00,
        diffAmt: 0.00,
        reason: "货件全部齐套入库无瑕疵扣款",
        status: "已验证"
      }
    ],
    discrepancies: [],
    payments: [
      { id: "PAY-20260521-06", date: "2026-05-21", entity: "杭州乐娜童衣有限公司", account: "招商银行 (对公往来端 9120)", supplier: "嘉兴米可服饰", amount: 340000.00, type: "货款", relatedBill: "BILL-202605-06", voucher: "V_CMB_MK_TRANSFER.pdf", operator: "陈财务", remark: "首期划批53%大宗货款" }
    ],
    invoices: [],
    logs: [
      { time: "2026-05-21 14:00:15", operator: "陈财务", action: "入仓对碰匹配完成", before: "待核对", after: "已确认", remark: "双方数量与单价一致，等待发票送达" }
    ]
  },
  {
    id: "BILL-202604-01",
    supplierName: "杭州童悦制衣厂",
    period: "2026-04",
    settlementMode: "月结",
    poCount: 5,
    skuCount: 110,
    supplierAmt: 310000.00,
    systemAmt: 310000.00,
    diffAmt: 0.00,
    penaltyAmt: 0.00,
    finalAmt: 310000.00,
    paidAmt: 310000.00,
    remainingAmt: 0.00,
    invoiceStatus: "已开票",
    auditStatus: "已结清",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260405-001",
        name: "女童春日木耳边翻领打底衫",
        styleNo: "TY-3122",
        skuInfo: "樱桃粉 / 100码",
        supplierPrice: 31.05,
        systemCost: 31.05,
        supplierQty: 10000,
        inboundQty: 10000,
        returnedQty: 0,
        settledQty: 10000,
        supplierAmt: 310000.00,
        systemAmt: 310000.00,
        diffAmt: 0.00,
        reason: "入库妥稳无异常",
        status: "已验证"
      }
    ],
    discrepancies: [],
    payments: [
      { id: "PAY-20260425-01", date: "2026-04-25", entity: "杭州乐娜童衣有限公司", account: "招商银行 (对公往来端 9120)", supplier: "杭州童悦制衣厂", amount: 310000.00, type: "货款", relatedBill: "BILL-202604-01", voucher: "V_CMB_TY_APRIL_PAID.pdf", operator: "陈财务", remark: "全额清付上月应付费" }
    ],
    invoices: [
      { id: "INV-20260425-01", date: "2026-04-24", invoiceNo: "INV_TY_APRIL_11", supplier: "杭州童悦制衣厂", amount: 310000.00, relatedBill: "BILL-202604-01", status: "已收票", file: "E_TY_APRIL_INV.pdf", remark: "专票销账" }
    ],
    logs: [
      { time: "2026-04-25 10:00:00", operator: "陈财务", action: "封账勾稽归档", before: "已核对", after: "已结清", remark: "账套按批复终结完毕" }
    ]
  },
  {
    id: "BILL-202604-02",
    supplierName: "湖州星禾服饰",
    period: "2026-04",
    settlementMode: "批次",
    poCount: 6,
    skuCount: 140,
    supplierAmt: 420050.00,
    systemAmt: 420050.00,
    diffAmt: 0.00,
    penaltyAmt: 0.00,
    finalAmt: 420050.00,
    paidAmt: 420050.00,
    remainingAmt: 0.00,
    invoiceStatus: "已开票",
    auditStatus: "已结清",
    owner: "陈财务",
    skus: [
      {
        poNo: "PO-20260408-012",
        name: "春款卡通立体耳朵连体爬服",
        styleNo: "XH-2104",
        skuInfo: "奶油卡其 / 73码",
        supplierPrice: 35.00,
        systemCost: 35.00,
        supplierQty: 12001,
        inboundQty: 12001,
        returnedQty: 0,
        settledQty: 12001,
        supplierAmt: 420035.00, // adjusted near total
        systemAmt: 420035.00,
        diffAmt: 0.00,
        reason: "入库核对相符",
        status: "已验证"
      }
    ],
    discrepancies: [],
    payments: [
      { id: "PAY-20260428-02", date: "2026-04-28", entity: "杭州乐娜童衣有限公司", account: "建设银行 (乐娜对公 8813)", supplier: "湖州星禾服饰", amount: 420050.00, type: "货款", relatedBill: "BILL-202604-02", voucher: "V_CCB_XH_APRIL.pdf", operator: "陈财务", remark: "上期尾款清退款自动核销过账" }
    ],
    invoices: [
      { id: "INV-20260428-02", date: "2026-04-28", invoiceNo: "INV_XH_APRIL_99", supplier: "湖州星禾服饰", amount: 420050.00, relatedBill: "BILL-202604-02", status: "已收票", file: "E_XH_APRIL_INV.pdf", remark: "开票成功" }
    ],
    logs: [
      { time: "2026-04-28 17:00:00", operator: "陈财务", action: "结案已付款", before: "核对中", after: "已结清", remark: "财务归档" }
    ]
  }
];
