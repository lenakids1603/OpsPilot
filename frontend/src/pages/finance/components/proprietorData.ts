/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BankAccount {
  bankName: string;
  branchName: string;
  accountNo: string;
  balance: number;
  isPrimary: boolean;
  remark: string;
}

export interface SupplierInvoiceDetail {
  supplierName: string;
  paidAmount: number;
  payableInvoiceAmount: number; // 应开票金额
  invoicedAmount: number;       // 已开票金额
  pendingAmount: number;        // 待开票金额
  normalInvoiceAmount: number;  // 普票金额
  specialInvoiceAmount: number; // 专票金额
  lastInvoiceDate: string;
  status: "已完成" | "待补票" | "疑似超开";
  remark: string;
}

export interface SupplierInvoiceInfo {
  payableAmount: number;        // 供应商应开金额
  invoicedAmount: number;       // 供应商已开金额
  pendingAmount: number;        // 供应商待开金额
  details: SupplierInvoiceDetail[];
}

export interface OperatorInvoiceDetail {
  operatorName: string;
  paidAmount: number;
  payableInvoiceAmount: number; // 应开服务费
  invoicedAmount: number;       // 已开票额
  pendingAmount: number;        // 待开票额
  normalInvoiceAmount: number;  // 普票金额
  specialInvoiceAmount: number; // 专票金额
  invoiceDate: string;
  status: "已完成" | "待补票" | "疑似超开";
  remark: string;
}

export interface OperatorInvoiceInfo {
  payableAmount: number;        // 运营商应开金额
  invoicedAmount: number;       // 运营商已开金额
  pendingAmount: number;        // 运营商待开金额
  details: OperatorInvoiceDetail[];
}

export interface AdInvoiceDetail {
  platformName: string;         // 平台或投流主体
  payeeName: string;            // 收款方 / 开票方
  paidAmount: number;
  payableInvoiceAmount: number; // 应开票面额
  invoicedAmount: number;       // 已开发票
  pendingAmount: number;        // 待开票
  normalInvoiceAmount: number;  // 普票金额
  specialInvoiceAmount: number; // 专票金额
  status: "已完成" | "待补票" | "疑似超开";
  remark: string;
}

export interface AdInvoiceInfo {
  payableAmount: number;        // 广告费应开金额
  invoicedAmount: number;       // 广告费已开金额
  pendingAmount: number;        // 广告费待开金额
  details: AdInvoiceDetail[];
}

export interface ProprietorInvoiceItem {
  id: string;
  shop: string;                         // 店铺, e.g. "莉娜kids DQ"
  name: string;                         // 个体户主体名称
  platforms: string[];                  // 平台标签 e.g. ["抖音"]
  status: "正常" | "待补票" | "异常" | "额度预警" | "已注销" | "停止使用"; // 状态标签
  withdrawnAmount: number;              // 累计已提现金额
  withdraw2025: number;                 // 2025年已提现
  withdraw2026: number;                 // 2026年已提现
  annualLimit: number;                  // 年度流水上限 (¥5,000,000)
  annualUsedAmount: number;             // 年度累计流水
  currentBalance: number;               // 当前对公余额
  balanceDate: string;                  // 余额数据日期
  bankAccounts: BankAccount[];          // 银行账户
  supplierInvoice: SupplierInvoiceInfo; // 供应商发票情况汇总及自表页
  operatorInvoice: OperatorInvoiceInfo; // 运营商发票情况汇总及自表页
  adInvoice: AdInvoiceInfo;             // 广告投流发票情况汇总及自表页
  owner: string;                        // 经办
  remarks?: string;
  originalDocs?: string;
  originalLine?: number;

  // Compatibility properties
  withdrawTotal?: number;
  manufacturerPayable?: number;
  manufacturerInvTotal?: number;
  manufacturerInvGeneral?: number;
  manufacturerInvSpecial?: number;
  manufacturerInvReleased?: number;
  manufacturerInvAvailable?: number;
  manufacturerStatus?: string;
  hedePayable?: number;
  hedePaid?: number;
  hedeInvGeneral?: number;
  hedeInvSpecial?: number;
  hedeInvTotal?: number;
  hedeDiffAmt?: number;
  hedeStatus?: string;
  qianchuanPayable?: number;
  qianchuanPaidLihewei?: number;
  qianchuanPaidKeyi?: number;
  qianchuanPaidHuijian?: number;
  qianchuanPaidYurong?: number;
  qianchuanPaidTotal?: number;
  qianchuanInvGeneral?: number;
  qianchuanInvSpecial?: number;
  qianchuanInvTotal?: number;
  qianchuanDiffAmt?: number;
  qianchuanStatus?: string;
  accountTail?: string;
  bank?: string;
  accountNo?: string;
  manufacturerRatio?: number;
  hedeRatio?: number;
  qianchuanRatio?: number;
}

export const INITIAL_PROPRIETOR_DATA: ProprietorInvoiceItem[] = [
  {
    id: "PROP-001",
    shop: "莉娜kids DQ",
    name: "杭州萧山独去闲贸易商行（个体工商户）",
    platforms: ["抖音", "小红书"],
    status: "正常",
    withdrawnAmount: 4547444.98,
    withdraw2025: 4478444.98,
    withdraw2026: 69000.00,
    annualLimit: 5000000,
    annualUsedAmount: 4547444.98,
    currentBalance: 12544.50,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "中国银行",
        branchName: "杭州东新支行",
        accountNo: "6217853000000003741",
        balance: 12544.50,
        isPrimary: true,
        remark: "主交易回扣账户"
      },
      {
        bankName: "杭州联合银行",
        branchName: "萧山支行",
        accountNo: "6214830100000009981",
        balance: 0.00,
        isPrimary: false,
        remark: "备用出账户"
      }
    ],
    supplierInvoice: {
      payableAmount: 3183211.49,
      invoicedAmount: 3112477.90,
      pendingAmount: 70733.59,
      details: [
        {
          supplierName: "织里童装源头厂家A",
          paidAmount: 2000000.00,
          payableInvoiceAmount: 2000000.00,
          invoicedAmount: 1950000.00,
          pendingAmount: 50000.00,
          normalInvoiceAmount: 1000000.00,
          specialInvoiceAmount: 950000.00,
          lastInvoiceDate: "2026-05-10",
          status: "待补票",
          remark: "剩余尾款发票催收中"
        },
        {
          supplierName: "萧山本地针织供应商B",
          paidAmount: 1183211.49,
          payableInvoiceAmount: 1183211.49,
          invoicedAmount: 1162477.90,
          pendingAmount: 20733.59,
          normalInvoiceAmount: 800000.00,
          specialInvoiceAmount: 362477.90,
          lastInvoiceDate: "2026-05-12",
          status: "待补票",
          remark: "部分专票税点核对中"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 591167.85,
      invoicedAmount: 591167.85,
      pendingAmount: 0.00,
      details: [
        {
          operatorName: "赫得代运营公司",
          paidAmount: 591167.85,
          payableInvoiceAmount: 591167.85,
          invoicedAmount: 591167.85,
          pendingAmount: 0.00,
          normalInvoiceAmount: 400000.00,
          specialInvoiceAmount: 191167.85,
          invoiceDate: "2026-05-14",
          status: "已完成",
          remark: "账目完全匹配"
        }
      ]
    },
    adInvoice: {
      payableAmount: 454744.50,
      invoicedAmount: 454744.50,
      pendingAmount: 0.00,
      details: [
        {
          platformName: "抖音千川",
          payeeName: "巨量引擎",
          paidAmount: 254744.50,
          payableInvoiceAmount: 254744.50,
          invoicedAmount: 254744.50,
          pendingAmount: 0.00,
          normalInvoiceAmount: 100000.00,
          specialInvoiceAmount: 154744.50,
          status: "已完成",
          remark: "月结开具完毕"
        },
        {
          platformName: "小红书聚光",
          payeeName: "行吟信息",
          paidAmount: 200000.00,
          payableInvoiceAmount: 200000.00,
          invoicedAmount: 200000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 200000.00,
          specialInvoiceAmount: 0,
          status: "已完成",
          remark: "聚光直投开票核销"
        }
      ]
    },
    owner: "陈财务",
    remarks: "提现额度接近500万限制主体，后续新增收单将分流到其他新主体账户中",
    originalDocs: "个体户对公账户情况汇总表_2026年第1季.xlsx",
    originalLine: 12
  },
  {
    id: "PROP-002",
    shop: "莉娜kids SY",
    name: "建德市新安江某某服装店",
    platforms: ["抖音", "淘宝"],
    status: "待补票",
    withdrawnAmount: 2500000.00,
    withdraw2025: 2500000.00,
    withdraw2026: 0.00,
    annualLimit: 5000000,
    annualUsedAmount: 2500000.00,
    currentBalance: 154600.00,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "中国农业银行",
        branchName: "建德支行",
        accountNo: "6228481200000004902",
        balance: 154600.00,
        isPrimary: true,
        remark: "建德本地公户"
      }
    ],
    supplierInvoice: {
      payableAmount: 1750000.00,
      invoicedAmount: 1650000.00,
      pendingAmount: 100000.00,
      details: [
        {
          supplierName: "常熟外贸厂供应商A",
          paidAmount: 900050.00,
          payableInvoiceAmount: 900000.00,
          invoicedAmount: 850000.00,
          pendingAmount: 50000.00,
          normalInvoiceAmount: 850000.00,
          specialInvoiceAmount: 0.00,
          lastInvoiceDate: "2026-05-08",
          status: "待补票",
          remark: "常熟A厂仍有5万货款票未催回"
        },
        {
          supplierName: "湖州供应商B (羽绒服)",
          paidAmount: 849950.00,
          payableInvoiceAmount: 850000.00,
          invoicedAmount: 800000.00,
          pendingAmount: 50000.00,
          normalInvoiceAmount: 400000.00,
          specialInvoiceAmount: 400000.00,
          lastInvoiceDate: "2026-05-11",
          status: "待补票",
          remark: "羽绒服开票期延后"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 325000.00,
      invoicedAmount: 300000.00,
      pendingAmount: 25000.00,
      details: [
        {
          operatorName: "赫得代运营公司",
          paidAmount: 325000.00,
          payableInvoiceAmount: 325000.00,
          invoicedAmount: 300000.00,
          pendingAmount: 25000.00,
          normalInvoiceAmount: 300000.00,
          specialInvoiceAmount: 0.00,
          invoiceDate: "2026-05-12",
          status: "待补票",
          remark: "赫得服务费待补差额票"
        }
      ]
    },
    adInvoice: {
      payableAmount: 250000.00,
      invoicedAmount: 200000.00,
      pendingAmount: 50000.00,
      details: [
        {
          platformName: "抖音千川",
          payeeName: "巨量引擎",
          paidAmount: 150000.00,
          payableInvoiceAmount: 150000.00,
          invoicedAmount: 120000.00,
          pendingAmount: 30000.00,
          normalInvoiceAmount: 120000.00,
          specialInvoiceAmount: 0.00,
          status: "待补票",
          remark: "千川代理待吐票"
        },
        {
          platformName: "淘宝直通车",
          payeeName: "阿里妈妈",
          paidAmount: 100000.00,
          payableInvoiceAmount: 100000.00,
          invoicedAmount: 80000.00,
          pendingAmount: 20000.00,
          normalInvoiceAmount: 80000.00,
          specialInvoiceAmount: 0,
          status: "待补票",
          remark: "直通车发票正在补开"
        }
      ]
    },
    owner: "陈财务",
    remarks: "目前正在主攻该主体的待收底票核减工作，供应商待开10万",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 9
  },
  {
    id: "PROP-003",
    shop: "莉娜kids XY",
    name: "杭州市临安区新安镇唯香童装经营部（个体户）",
    platforms: ["天猫", "抖音"],
    status: "额度预警",
    withdrawnAmount: 4950000.00,
    withdraw2025: 3100000.00,
    withdraw2026: 1850000.00,
    annualLimit: 5000000,
    annualUsedAmount: 4950000.00,
    currentBalance: 34500.00,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "中国银行",
        branchName: "东新支行",
        accountNo: "6217853000000005219",
        balance: 34500.00,
        isPrimary: true,
        remark: "主收单网银公户"
      }
    ],
    supplierInvoice: {
      payableAmount: 3465000.00,
      invoicedAmount: 3350000.00,
      pendingAmount: 115000.00,
      details: [
        {
          supplierName: "义乌针织小商品童配件厂",
          paidAmount: 1500000.00,
          payableInvoiceAmount: 1500000.00,
          invoicedAmount: 1450000.00,
          pendingAmount: 50000.00,
          normalInvoiceAmount: 1450000.00,
          specialInvoiceAmount: 0,
          lastInvoiceDate: "2026-05-09",
          status: "待补票",
          remark: "义乌配件货源"
        },
        {
          supplierName: "织里源头厂家B",
          paidAmount: 1965000.00,
          payableInvoiceAmount: 1965000.00,
          invoicedAmount: 1900000.00,
          pendingAmount: 65000.00,
          normalInvoiceAmount: 1000000.00,
          specialInvoiceAmount: 900000.00,
          lastInvoiceDate: "2026-05-12",
          status: "待补票",
          remark: "大批量厂家直供"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 643500.00,
      invoicedAmount: 610000.00,
      pendingAmount: 33500.00,
      details: [
        {
          operatorName: "瑾曜代运营公司",
          paidAmount: 643500.00,
          payableInvoiceAmount: 643500.00,
          invoicedAmount: 610000.00,
          pendingAmount: 33500.00,
          normalInvoiceAmount: 500000.00,
          specialInvoiceAmount: 110000.00,
          invoiceDate: "2026-05-12",
          status: "待补票",
          remark: "服务费进度稍慢"
        }
      ]
    },
    adInvoice: {
      payableAmount: 495000.00,
      invoicedAmount: 450000.00,
      pendingAmount: 45000.00,
      details: [
        {
          platformName: "淘宝直通车",
          payeeName: "阿里妈妈",
          paidAmount: 300000.00,
          payableInvoiceAmount: 300000.00,
          invoicedAmount: 280000.00,
          pendingAmount: 20000.00,
          normalInvoiceAmount: 280000.00,
          specialInvoiceAmount: 0,
          status: "待补票",
          remark: "直通车发票催收"
        },
        {
          platformName: "抖音千川",
          payeeName: "巨量引擎",
          paidAmount: 195000.00,
          payableInvoiceAmount: 195000.00,
          invoicedAmount: 170000.00,
          pendingAmount: 25000.00,
          normalInvoiceAmount: 170000.00,
          specialInvoiceAmount: 0,
          status: "待补票",
          remark: "投流待补余额"
        }
      ]
    },
    owner: "陈财务",
    remarks: "限额预警：当前累计流出已达 495 万，已向各店铺通知‘停止使用’该主体并冻结收款流入，等待补开存量票务中",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 5
  },
  {
    id: "PROP-004",
    shop: "莉娜kids WT",
    name: "杭州市余杭区五常街道乐芽服饰店（个体户）",
    platforms: ["快手", "抖音"],
    status: "异常",
    withdrawnAmount: 2400000.00,
    withdraw2025: 1400000.00,
    withdraw2026: 1000000.00,
    annualLimit: 5000000,
    annualUsedAmount: 2400000.00,
    currentBalance: 456801.00,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "工商银行",
        branchName: "杭州文一西路支行",
        accountNo: "6212021200000006012",
        balance: 456801.00,
        isPrimary: true,
        remark: "五常网银基本对公"
      }
    ],
    supplierInvoice: {
      payableAmount: 1680000.00,
      invoicedAmount: 1780000.00,
      pendingAmount: -100000.00,
      details: [
        {
          supplierName: "快供货源源头厂家C",
          paidAmount: 1680000.00,
          payableInvoiceAmount: 1680000.00,
          invoicedAmount: 1780000.00,
          pendingAmount: -100000.00,
          normalInvoiceAmount: 1000000.00,
          specialInvoiceAmount: 780000.00,
          lastInvoiceDate: "2026-05-11",
          status: "疑似超开",
          remark: "累计开票178万，已超理论额168万，核查拼装中"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 312050.00,
      invoicedAmount: 312050.00,
      pendingAmount: 0.00,
      details: [
        {
          operatorName: "玉融运营商",
          paidAmount: 312050.00,
          payableInvoiceAmount: 312050.00,
          invoicedAmount: 312050.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 300200.00,
          specialInvoiceAmount: 11850.00,
          invoiceDate: "2026-05-15",
          status: "已完成",
          remark: "完美匹配"
        }
      ]
    },
    adInvoice: {
      payableAmount: 240000.00,
      invoicedAmount: 240000.00,
      pendingAmount: 0.00,
      details: [
        {
          platformName: "快手磁力金牛",
          payeeName: "磁力金牛",
          paidAmount: 240000.00,
          payableInvoiceAmount: 240000.00,
          invoicedAmount: 240000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 240000.00,
          specialInvoiceAmount: 0,
          status: "已完成",
          remark: "开票无差异"
        }
      ]
    },
    owner: "陈财务",
    remarks: "⚠️厂家开票存在溢出：累计普专合计开票178万，已超理论比例规定的168万额度，多出10万元待财务复核平账",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 18
  },
  {
    id: "PROP-005",
    shop: "莉娜kids ZW",
    name: "杭州市萧山区城厢街道莉娜宝贝装行（个体户）",
    platforms: ["抖音", "小红书"],
    status: "待补票",
    withdrawnAmount: 1200500.00,
    withdraw2025: 800000.00,
    withdraw2026: 400500.00,
    annualLimit: 5000000,
    annualUsedAmount: 1200500.00,
    currentBalance: 120000.00,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "中国银行",
        branchName: "东新支行",
        accountNo: "6217853000000008811",
        balance: 120000.00,
        isPrimary: true,
        remark: "萧山城厢网银"
      }
    ],
    supplierInvoice: {
      payableAmount: 840350.00,
      invoicedAmount: 740000.00,
      pendingAmount: 100350.00,
      details: [
        {
          supplierName: "海宁皮革及童装大衣厂",
          paidAmount: 840350.00,
          payableInvoiceAmount: 840350.00,
          invoicedAmount: 740000.00,
          pendingAmount: 100350.00,
          normalInvoiceAmount: 500000.00,
          specialInvoiceAmount: 240000.00,
          lastInvoiceDate: "2026-05-10",
          status: "待补票",
          remark: "皮革厂由于错峰需要等候出底"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 156065.00,
      invoicedAmount: 120000.00,
      pendingAmount: 36065.00,
      details: [
        {
          operatorName: "莉禾唯代运营团队",
          paidAmount: 156065.00,
          payableInvoiceAmount: 156065.00,
          invoicedAmount: 120000.00,
          pendingAmount: 36065.00,
          normalInvoiceAmount: 100000.00,
          specialInvoiceAmount: 20000.00,
          invoiceDate: "2026-05-15",
          status: "待补票",
          remark: "服务费差异待核销"
        }
      ]
    },
    adInvoice: {
      payableAmount: 120050.00,
      invoicedAmount: 100000.00,
      pendingAmount: 20050.00,
      details: [
        {
          platformName: "抖音千川广告",
          payeeName: "巨量引擎",
          paidAmount: 120050.00,
          payableInvoiceAmount: 120050.00,
          invoicedAmount: 100000.00,
          pendingAmount: 20050.00,
          normalInvoiceAmount: 80000.00,
          specialInvoiceAmount: 20000.00,
          status: "待补票",
          remark: "千川待收开票差额"
        }
      ]
    },
    owner: "陈财务",
    remarks: "赫得服务费与千川投流存在待补票。陈财务已通知赫得相关和莉禾唯财务补开普专底票中",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 24
  },
  {
    id: "PROP-006",
    shop: "莉娜kids SH",
    name: "杭州市上城区九堡街道惠禾服装店（个体店）",
    platforms: ["小红书", "天猫"],
    status: "正常",
    withdrawnAmount: 320000.00,
    withdraw2025: 0.00,
    withdraw2026: 320000.00,
    annualLimit: 5000000,
    annualUsedAmount: 320000.00,
    currentBalance: 51200.00,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "农业银行",
        branchName: "九堡支行",
        accountNo: "6228481200000000014",
        balance: 51200.00,
        isPrimary: true,
        remark: "九堡新设立公户"
      }
    ],
    supplierInvoice: {
      payableAmount: 224000.00,
      invoicedAmount: 224000.00,
      pendingAmount: 0.00,
      details: [
        {
          supplierName: "九堡周转服饰城商家",
          paidAmount: 224000.00,
          payableInvoiceAmount: 224000.00,
          invoicedAmount: 224000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 224000.00,
          specialInvoiceAmount: 0,
          lastInvoiceDate: "2026-05-14",
          status: "已完成",
          remark: "结算已闭环"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 41600.00,
      invoicedAmount: 41600.00,
      pendingAmount: 0.00,
      details: [
        {
          operatorName: "惠间代运营",
          paidAmount: 41600.00,
          payableInvoiceAmount: 41600.00,
          invoicedAmount: 41600.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 41600.00,
          specialInvoiceAmount: 0,
          invoiceDate: "2026-05-15",
          status: "已完成",
          remark: "无差漏"
        }
      ]
    },
    adInvoice: {
      payableAmount: 32000.00,
      invoicedAmount: 32000.00,
      pendingAmount: 0.00,
      details: [
        {
          platformName: "小红书聚光",
          payeeName: "行吟信息",
          paidAmount: 32000.00,
          payableInvoiceAmount: 32000.00,
          invoicedAmount: 32000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 32000.00,
          specialInvoiceAmount: 0,
          status: "已完成",
          remark: "新账期内已清"
        }
      ]
    },
    owner: "陈财务",
    remarks: "2026年新开立流水主体，出账规模尚小，正逐步按月度周转进行匹配",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 35
  },
  {
    id: "PROP-007",
    shop: "莉娜kids DQ",
    name: "杭州富阳区春江街道雨朵童趣商行（个体户）",
    platforms: ["淘宝", "抖音"],
    status: "正常",
    withdrawnAmount: 1800000.00,
    withdraw2025: 1200000.00,
    withdraw2026: 600000.00,
    annualLimit: 5000000,
    annualUsedAmount: 1800000.00,
    currentBalance: 0.00,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "招商银行",
        branchName: "杭州凤起支行",
        accountNo: "6214835600000008120",
        balance: 0.00,
        isPrimary: true,
        remark: "富阳清算挂载"
      }
    ],
    supplierInvoice: {
      payableAmount: 1260000.00,
      invoicedAmount: 1260000.00,
      pendingAmount: 0.00,
      details: [
        {
          supplierName: "常熟代购档口B",
          paidAmount: 600000.00,
          payableInvoiceAmount: 600000.00,
          invoicedAmount: 600000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 600000.00,
          specialInvoiceAmount: 0,
          lastInvoiceDate: "2026-05-10",
          status: "已完成",
          remark: "完全回收"
        },
        {
          supplierName: "富阳本地针织厂",
          paidAmount: 660000.00,
          payableInvoiceAmount: 660000.00,
          invoicedAmount: 660000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 0,
          specialInvoiceAmount: 660000.00,
          lastInvoiceDate: "2026-05-11",
          status: "已完成",
          remark: "已足额返还专用发票"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 234000.00,
      invoicedAmount: 234000.00,
      pendingAmount: 0.00,
      details: [
        {
          operatorName: "赫得代运营团队",
          paidAmount: 234000.00,
          payableInvoiceAmount: 234000.00,
          invoicedAmount: 234000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 100000.00,
          specialInvoiceAmount: 134000.00,
          invoiceDate: "2026-05-11",
          status: "已完成",
          remark: "全票清账"
        }
      ]
    },
    adInvoice: {
      payableAmount: 180000.00,
      invoicedAmount: 180000.00,
      pendingAmount: 0.00,
      details: [
        {
          platformName: "淘宝直通车/超级推荐",
          payeeName: "阿里妈妈",
          paidAmount: 180000.00,
          payableInvoiceAmount: 180000.00,
          invoicedAmount: 180000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 80000.00,
          specialInvoiceAmount: 100000.00,
          status: "已完成",
          remark: "发票匹配无遗漏"
        }
      ]
    },
    owner: "陈财务",
    remarks: "数据对齐完美，无差异，下季度将开始第二批提现对流",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 44
  },
  {
    id: "PROP-008",
    shop: "莉娜kids SY",
    name: "建德市新安江麦可经营部（个体户）",
    platforms: ["抖音", "淘宝"],
    status: "已注销",
    withdrawnAmount: 2500000.00,
    withdraw2025: 2500000.00,
    withdraw2026: 0.00,
    annualLimit: 5000000,
    annualUsedAmount: 2500000.00,
    currentBalance: 0.00,
    balanceDate: "2026-05-16",
    bankAccounts: [
      {
        bankName: "农业银行",
        branchName: "建德支行",
        accountNo: "6228481200000004902",
        balance: 0.00,
        isPrimary: true,
        remark: "注销零余额"
      }
    ],
    supplierInvoice: {
      payableAmount: 1750000.00,
      invoicedAmount: 1750000.00,
      pendingAmount: 0.00,
      details: [
        {
          supplierName: "清算承接厂家",
          paidAmount: 1750000.00,
          payableInvoiceAmount: 1750000.00,
          invoicedAmount: 1750000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 1000000.00,
          specialInvoiceAmount: 750000.00,
          lastInvoiceDate: "2025-12-10",
          status: "已完成",
          remark: "清盘核对归档"
        }
      ]
    },
    operatorInvoice: {
      payableAmount: 325000.00,
      invoicedAmount: 325000.00,
      pendingAmount: 0.00,
      details: [
        {
          operatorName: "赫得服务费机构",
          paidAmount: 325000.00,
          payableInvoiceAmount: 325000.00,
          invoicedAmount: 325000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 325000.00,
          specialInvoiceAmount: 0,
          invoiceDate: "2025-12-15",
          status: "已完成",
          remark: "注销前已核平"
        }
      ]
    },
    adInvoice: {
      payableAmount: 250000.00,
      invoicedAmount: 250000.00,
      pendingAmount: 0.00,
      details: [
        {
          platformName: "巨量投放服务",
          payeeName: "巨量引擎",
          paidAmount: 250000.00,
          payableInvoiceAmount: 250000.00,
          invoicedAmount: 250000.00,
          pendingAmount: 0.00,
          normalInvoiceAmount: 250000.00,
          specialInvoiceAmount: 0,
          status: "已完成",
          remark: "广告费清账核算"
        }
      ]
    },
    owner: "陈财务",
    remarks: "已注销，存量发票与账目在工商注销前已经经办完妥",
    originalDocs: "建德主体档案核销表_2025B.xlsx",
    originalLine: 9
  }
];
