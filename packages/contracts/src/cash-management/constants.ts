export const CashEntryType = {
  IN: "IN",
  OUT: "OUT",
} as const;
export type CashEntryType = (typeof CashEntryType)[keyof typeof CashEntryType];

export const CashManagementProductKey = "cash-management";
export type CashManagementProductKey = typeof CashManagementProductKey;

export const CashManagementBillingFeatureKeys = {
  maxLocations: "cash-management.maxLocations",
  maxEntriesPerMonth: "cash-management.maxEntriesPerMonth",
  maxReceiptsPerMonth: "cash-management.maxReceiptsPerMonth",
  canExport: "cash-management.canExport",
  dailyClosing: "cash-management.dailyClosing",
  aiAssistant: "cash-management.aiAssistant",
  multilingualAiHelp: "cash-management.multilingualAiHelp",
  issueDetection: "cash-management.issueDetection",
  closingGuidance: "cash-management.closingGuidance",
  teamAccess: "cash-management.teamAccess",
  consolidatedOverview: "cash-management.consolidatedOverview",
} as const;
export type CashManagementBillingFeatureKey =
  (typeof CashManagementBillingFeatureKeys)[keyof typeof CashManagementBillingFeatureKeys];

export const CashManagementBillingMetricKeys = {
  entries: "cash.entries",
  receipts: "cash.receipts",
  locations: "cash.locations",
} as const;
export type CashManagementBillingMetricKey =
  (typeof CashManagementBillingMetricKeys)[keyof typeof CashManagementBillingMetricKeys];

export const CashEntrySourceType = {
  MANUAL: "MANUAL",
  SALES: "SALES",
  EXPENSE: "EXPENSE",
  DIFFERENCE: "DIFFERENCE", // For daily close differences
} as const;
export type CashEntrySourceType = (typeof CashEntrySourceType)[keyof typeof CashEntrySourceType];

export const DailyCloseStatus = {
  OPEN: "OPEN",
  SUBMITTED: "SUBMITTED",
  LOCKED: "LOCKED",
} as const;
export type DailyCloseStatus = (typeof DailyCloseStatus)[keyof typeof DailyCloseStatus];
