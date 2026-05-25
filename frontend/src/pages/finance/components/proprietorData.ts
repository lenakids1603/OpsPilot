/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProprietorInvoiceItem {
  id: string;
  shop: string;                         // 店铺, e.g. "莉娜kids DQ"
  name: string;                         // 个体户主体名称
  bank: string;                         // 银行名称
  accountNo: string;                    // 银行完整账号
  accountTail: string;                  // 账号尾号
  
  // 提现与资金
  withdraw2025: number;                 // 2025年提现金额
  withdraw2026: number;                 // 2026年提现金额
  withdrawTotal: number;                // 提现金额合计 (2025 + 2026)
  currentBalance: number;               // 当前账户余额
  balanceDate: string;                  // 余额数据日期
  
  // 1. 厂家开票
  manufacturerRatio: number;            // 厂家开票比例, default 0.70
  manufacturerPayable: number;          // 厂家应开票金额 (withdrawTotal * 0.70)
  manufacturerInvGeneral: number;       // 厂家普票
  manufacturerInvSpecial: number;       // 厂家专票
  manufacturerInvTotal: number;         // 厂家合计开票 (普票 + 专票)
  manufacturerInvReleased: number;      // 已放出票额 (if active, or "注销" status)
  manufacturerInvAvailable: number;     // 还能安排票额 (应开票 - 合计开票 - 已放出票额)
  manufacturerStatus: "可安排" | "已完成" | "超额" | "已注销" | "待复核";
  
  // 2. 赫得服务费
  hedeRatio: number;                    // 赫得服务费比例, default 0.13
  hedePayable: number;                  // 赫得应开票金额 (withdrawTotal * 0.13)
  hedePaid: number;                     // 个体户给赫得已打款
  hedeInvGeneral: number;               // 赫得普票
  hedeInvSpecial: number;               // 赫得专票
  hedeInvTotal: number;                 // 赫得合计开票 (普票 + 专票)
  hedeDiffAmt: number;                  // 打款与开票差异 (hedePaid - hedeInvTotal)
  hedeStatus: "已匹配" | "待补票" | "待打款" | "待复核";
  
  // 3. 千川投流
  qianchuanRatio: number;               // 千川投流比例, default 0.10
  qianchuanPayable: number;             // 千川应开票金额 (withdrawTotal * 0.10)
  qianchuanPaidLihewei: number;         // 莉禾唯已打款
  qianchuanPaidKeyi: number;            // 科衣已打款
  qianchuanPaidHuijian: number;         // 惠间已打款
  qianchuanPaidYurong: number;          // 玉融已打款
  qianchuanPaidTotal: number;           // 千川已打款合计 (Lihewei + Keyi + Huijian + Yurong)
  qianchuanInvGeneral: number;          // 千川普票
  qianchuanInvSpecial: number;          // 千川专票
  qianchuanInvTotal: number;            // 千川合计开票 (普票 + 专票)
  qianchuanDiffAmt: number;             // 打款与开票差异 (qianchuanPaidTotal - qianchuanInvTotal)
  qianchuanStatus: "已匹配" | "待补票" | "待打款" | "待复核";
  
  // 主体基本状态
  status: "正常" | "已注销" | "停止使用";
  owner: string;                        // 财务经办
  remarks?: string;
  originalDocs?: string;                // 原始数据表来源
  originalLine?: number;                // 来源行号
}

export const INITIAL_PROPRIETOR_DATA: ProprietorInvoiceItem[] = [
  {
    id: "PROP-001",
    shop: "莉娜kids DQ",
    name: "杭州萧山独去闲贸易商行（个体工商户）",
    bank: "中国银行杭州东新支行",
    accountNo: "6217853000000003741",
    accountTail: "3741",
    withdraw2025: 4478444.98,
    withdraw2026: 69000.00,
    withdrawTotal: 4547444.98,
    currentBalance: 12544.50,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 3183211.49,
    manufacturerInvGeneral: 1800000.00,
    manufacturerInvSpecial: 1312477.90,
    manufacturerInvTotal: 3112477.90,
    manufacturerInvReleased: 0,
    manufacturerInvAvailable: 70733.59,
    manufacturerStatus: "可安排",
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 591167.85,
    hedePaid: 591167.85,
    hedeInvGeneral: 400000.00,
    hedeInvSpecial: 191167.85,
    hedeInvTotal: 591167.85,
    hedeDiffAmt: 0,
    hedeStatus: "已匹配",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 454744.50,
    qianchuanPaidLihewei: 150000.00,
    qianchuanPaidKeyi: 100000.00,
    qianchuanPaidHuijian: 100000.00,
    qianchuanPaidYurong: 104744.50,
    qianchuanPaidTotal: 454744.50,
    qianchuanInvGeneral: 200000.00,
    qianchuanInvSpecial: 254744.50,
    qianchuanInvTotal: 454744.50,
    qianchuanDiffAmt: 0,
    qianchuanStatus: "已匹配",
    
    status: "正常",
    owner: "陈财务",
    remarks: "提现额度接近500万限制主体，后续新增收单将分流到其他新主体账户中",
    originalDocs: "个体户对公账户情况汇总表_2026年第1季.xlsx",
    originalLine: 12
  },
  {
    id: "PROP-002",
    shop: "莉娜kids SY",
    name: "杭州市拱墅区少芽服装经营部（个体工商户）",
    bank: "中国银行杭州东新支行",
    accountNo: "6217853000000003785",
    accountTail: "3785",
    withdraw2025: 5450000.00,
    withdraw2026: 0.00,
    withdrawTotal: 5450000.00,
    currentBalance: 0.00,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 3815000.00,
    manufacturerInvGeneral: 2000000.00,
    manufacturerInvSpecial: 1649239.00,
    manufacturerInvTotal: 3649239.00,
    manufacturerInvReleased: 165761.00, // 注销等额度放出
    manufacturerInvAvailable: 0,
    manufacturerStatus: "已注销",
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 708500.00,
    hedePaid: 708500.00,
    hedeInvGeneral: 708500.00,
    hedeInvSpecial: 0,
    hedeInvTotal: 708500.00,
    hedeDiffAmt: 0,
    hedeStatus: "已匹配",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 545000.00,
    qianchuanPaidLihewei: 200000.00,
    qianchuanPaidKeyi: 154500.00,
    qianchuanPaidHuijian: 100000.00,
    qianchuanPaidYurong: 90500.00,
    qianchuanPaidTotal: 545000.00,
    qianchuanInvGeneral: 545000.00,
    qianchuanInvSpecial: 0,
    qianchuanInvTotal: 545000.00,
    qianchuanDiffAmt: 0,
    qianchuanStatus: "已匹配",
    
    status: "已注销",
    owner: "陈财务",
    remarks: "2025年底主体注销注销完毕，额度清盘完毕",
    originalDocs: "工商注销核销单_少芽服装2025.pdf",
    originalLine: 1
  },
  {
    id: "PROP-003",
    shop: "莉娜kids XY",
    name: "杭州市临安区新安镇唯香童装经营部（个体户）",
    bank: "中国银行杭州东新支行",
    accountNo: "6217853000000005219",
    accountTail: "5219",
    withdraw2025: 3100000.00,
    withdraw2026: 1850000.00,
    withdrawTotal: 4950000.00, // 4.95M - Very close to 5M limit!
    currentBalance: 34500.00,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 3465000.00,
    manufacturerInvGeneral: 2000000.00,
    manufacturerInvSpecial: 1350000.00,
    manufacturerInvTotal: 3350000.00,
    manufacturerInvReleased: 0,
    manufacturerInvAvailable: 115000.00,
    manufacturerStatus: "可安排",
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 643500.00,
    hedePaid: 643500.00,
    hedeInvGeneral: 600000.00,
    hedeInvSpecial: 10000.00,
    hedeInvTotal: 610000.00,
    hedeDiffAmt: 33500.00, // hedePaid > hedeInvTotal -> 待补票
    hedeStatus: "待补票",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 495000.00,
    qianchuanPaidLihewei: 200000.00,
    qianchuanPaidKeyi: 120000.00,
    qianchuanPaidHuijian: 100000.00,
    qianchuanPaidYurong: 75000.00,
    qianchuanPaidTotal: 495000.00,
    qianchuanInvGeneral: 450000.00,
    qianchuanInvSpecial: 0,
    qianchuanInvTotal: 450000.00,
    qianchuanDiffAmt: 45000.00, // qianchuanPaidTotal > qianchuanInvTotal -> 待补票
    qianchuanStatus: "待补票",
    
    status: "停止使用", // Already stopped because close to 5M limit!
    owner: "陈财务",
    remarks: "限额预警：当前累计流出已达 495 万，已向各店铺通知‘停止使用’该主体并冻结收款流入，等待补开存量票务中",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 5
  },
  {
    id: "PROP-004",
    shop: "莉娜kids WT",
    name: "杭州市余杭区五常街道乐芽服饰店（个体户）",
    bank: "工商银行杭州文一西路支行",
    accountNo: "6212021200000006012",
    accountTail: "6012",
    withdraw2025: 1400000.00,
    withdraw2026: 1000000.00,
    withdrawTotal: 2400000.00,
    currentBalance: 456801.00,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 1680000.00,
    manufacturerInvGeneral: 1000000.00,
    manufacturerInvSpecial: 780000.00,
    manufacturerInvTotal: 1780000.00, // 1.78M > 1.68M calculation! -> 超额!
    manufacturerInvReleased: 0,
    manufacturerInvAvailable: -100000.00, // Negative!
    manufacturerStatus: "超额",
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 312000.00,
    hedePaid: 320000.00,
    hedeInvGeneral: 312000.00,
    hedeInvSpecial: 8000.00,
    hedeInvTotal: 320000.00,
    hedeDiffAmt: 0,
    hedeStatus: "已匹配",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 240000.00,
    qianchuanPaidLihewei: 100000.00,
    qianchuanPaidKeyi: 70000.00,
    qianchuanPaidHuijian: 40000.00,
    qianchuanPaidYurong: 30000.00,
    qianchuanPaidTotal: 240000.00,
    qianchuanInvGeneral: 240000.00,
    qianchuanInvSpecial: 0,
    qianchuanInvTotal: 240000.00,
    qianchuanDiffAmt: 0,
    qianchuanStatus: "已匹配",
    
    status: "正常",
    owner: "陈财务",
    remarks: "⚠️厂家开票存在溢出：累计普转并专合计开票178万，已超理论比例规定的168万额度，多出10万元待财务复核平账",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 18
  },
  {
    id: "PROP-005",
    shop: "莉娜kids ZW",
    name: "杭州市萧山区城厢街道莉娜宝贝装行（个体户）",
    bank: "中国银行杭州东新支行",
    accountNo: "6217853000000008811",
    accountTail: "8811",
    withdraw2025: 800000.00,
    withdraw2026: 400500.00,
    withdrawTotal: 1200500.00,
    currentBalance: 120000.00,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 840350.00,
    manufacturerInvGeneral: 500000.00,
    manufacturerInvSpecial: 240000.00,
    manufacturerInvTotal: 740000.00,
    manufacturerInvReleased: 0,
    manufacturerInvAvailable: 100350.00,
    manufacturerStatus: "可安排",
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 156065.00,
    hedePaid: 156065.00,
    hedeInvGeneral: 100000.00,
    hedeInvSpecial: 20000.00,
    hedeInvTotal: 120000.00,
    hedeDiffAmt: 36065.00, // hedePaid > hedeInvTotal -> 待补票
    hedeStatus: "待补票",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 120050.00,
    qianchuanPaidLihewei: 50000.00,
    qianchuanPaidKeyi: 40000.00,
    qianchuanPaidHuijian: 20000.00,
    qianchuanPaidYurong: 10050.00,
    qianchuanPaidTotal: 120050.00,
    qianchuanInvGeneral: 80000.00,
    qianchuanInvSpecial: 20000.00,
    qianchuanInvTotal: 100000.00,
    qianchuanDiffAmt: 20050.00, // qianchuanPaidTotal > qianchuanInvTotal -> 待补票
    qianchuanStatus: "待补票",
    
    status: "正常",
    owner: "陈财务",
    remarks: "赫得服务费与千川投流存在待补票。陈财务已通知赫得相关和莉禾唯财务补开普专底票中",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 24
  },
  {
    id: "PROP-006",
    shop: "莉娜kids SH",
    name: "杭州市上城区九堡街道惠禾服装店（个体店）",
    bank: "农业银行杭州九堡支行",
    accountNo: "6228481200000000014",
    accountTail: "0014",
    withdraw2025: 0.00,
    withdraw2026: 320000.00,
    withdrawTotal: 320000.00,
    currentBalance: 51200.00,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 224000.00,
    manufacturerInvGeneral: 0.00,
    manufacturerInvSpecial: 0.00,
    manufacturerInvTotal: 0.00,
    manufacturerInvReleased: 0,
    manufacturerInvAvailable: 224000.00,
    manufacturerStatus: "可安排",
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 41600.00,
    hedePaid: 10000.00, // hedePaid < hedePayable -> 待打款
    hedeInvGeneral: 10000.00,
    hedeInvSpecial: 0.00,
    hedeInvTotal: 10000.00,
    hedeDiffAmt: 0,
    hedeStatus: "待打款",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 32000.00,
    qianchuanPaidLihewei: 10000.00,
    qianchuanPaidKeyi: 0.00,
    qianchuanPaidHuijian: 0.00,
    qianchuanPaidYurong: 0.00,
    qianchuanPaidTotal: 10000.00, // Total qianchuan paid < qianchuanPayable -> 待打款
    qianchuanInvGeneral: 10000.00,
    qianchuanInvSpecial: 0.00,
    qianchuanInvTotal: 10000.00,
    qianchuanDiffAmt: 0,
    qianchuanStatus: "待打款",
    
    status: "正常",
    owner: "陈财务",
    remarks: "2026年新开立流水主体，出账规模尚小，正逐步按月度周转进行匹配",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 35
  },
  {
    id: "PROP-007",
    shop: "莉娜kids DQ",
    name: "杭州富阳区春江街道雨朵童趣商行（个体户）",
    bank: "招商银行杭州凤起支行",
    accountNo: "6214835600000008120",
    accountTail: "8120",
    withdraw2025: 1200000.00,
    withdraw2026: 600000.00,
    withdrawTotal: 1800000.00,
    currentBalance: 0.00,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 1260000.00,
    manufacturerInvGeneral: 600000.00,
    manufacturerInvSpecial: 660000.00,
    manufacturerInvTotal: 1260000.00,
    manufacturerInvReleased: 0,
    manufacturerInvAvailable: 0,
    manufacturerStatus: "已完成", // Available = 0
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 234000.00,
    hedePaid: 234000.00,
    hedeInvGeneral: 100000.00,
    hedeInvSpecial: 134000.00,
    hedeInvTotal: 234000.00,
    hedeDiffAmt: 0,
    hedeStatus: "已匹配",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 180000.00,
    qianchuanPaidLihewei: 80000.00,
    qianchuanPaidKeyi: 40000.00,
    qianchuanPaidHuijian: 40000.00,
    qianchuanPaidYurong: 20000.00,
    qianchuanPaidTotal: 180000.00,
    qianchuanInvGeneral: 80000.00,
    qianchuanInvSpecial: 100000.00,
    qianchuanInvTotal: 180000.00,
    qianchuanDiffAmt: 0,
    qianchuanStatus: "已匹配",
    
    status: "正常",
    owner: "陈财务",
    remarks: "数据对齐完美，无差异，下季度将开始第二批提现对流",
    originalDocs: "个体户对公账户情况汇总表_2026年第2季.xlsx",
    originalLine: 44
  },
  {
    id: "PROP-002B",
    shop: "莉娜kids SY",
    name: "建德市新安江麦可经营部（个体户）",
    bank: "中国农业银行建德支行",
    accountNo: "6228481200000004902",
    accountTail: "4902",
    withdraw2025: 2500000.00,
    withdraw2026: 0.00,
    withdrawTotal: 2500000.00,
    currentBalance: 0.00,
    balanceDate: "2026-05-16",
    
    // 1. 厂家
    manufacturerRatio: 0.70,
    manufacturerPayable: 1750000.00,
    manufacturerInvGeneral: 1000000.00,
    manufacturerInvSpecial: 750000.00,
    manufacturerInvTotal: 1750000.00,
    manufacturerInvReleased: 1750000.00, // 注销额放出
    manufacturerInvAvailable: 0,
    manufacturerStatus: "已注销",
    
    // 2. 赫得服务费
    hedeRatio: 0.13,
    hedePayable: 325000.00,
    hedePaid: 325000.00,
    hedeInvGeneral: 325000.00,
    hedeInvSpecial: 0,
    hedeInvTotal: 325000.00,
    hedeDiffAmt: 0,
    hedeStatus: "已匹配",
    
    // 3. 千川投流
    qianchuanRatio: 0.10,
    qianchuanPayable: 250000.00,
    qianchuanPaidLihewei: 100000.00,
    qianchuanPaidKeyi: 50000.00,
    qianchuanPaidHuijian: 50000.00,
    qianchuanPaidYurong: 50000.00,
    qianchuanPaidTotal: 250000.00,
    qianchuanInvGeneral: 250000.00,
    qianchuanInvSpecial: 0,
    qianchuanInvTotal: 250000.00,
    qianchuanDiffAmt: 0,
    qianchuanStatus: "已匹配",
    
    status: "已注销",
    owner: "陈财务",
    remarks: "已注销，存量发票与账目在工商注销前已经经办完妥",
    originalDocs: "建德主体档案核销表_2025B.xlsx",
    originalLine: 9
  }
];
