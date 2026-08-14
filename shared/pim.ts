export type RawProductInput = {
  Mfg_Part_Num?: string | null;
  Part_Desc?: string | null;
  E1_Brand?: string | null;
  Unilog_Brand?: string | null;
  DIB_Brand?: string | null;
  Part_Manuf?: string | null;
};

export type Evidence = {
  sourceType: "input" | "approved_demo_master" | "manufacturer_document" | "derived";
  sourceRef: string;
  excerpt: string;
  method: string;
  sourceUrl?: string | null;
};

export type ProductAttribute = {
  fieldKey: string;
  label: string;
  rawValue: string | null;
  normalizedValue: string | null;
  unit: string | null;
  isValidated: boolean;
  lovMatch: boolean;
  confidence: number;
  state: "proposed" | "approved" | "flagged" | "needs_review";
  evidence: Evidence;
};

export type ValidationIssue = {
  severity: "pass" | "warning" | "fail";
  code: string;
  message: string;
  fieldKey?: string;
};

export type AuditEvent = {
  action: string;
  fieldKey?: string;
  originalValue?: string | null;
  proposedValue?: string | null;
  approvedValue?: string | null;
  actor: string;
  note?: string | null;
  createdAt?: string;
};

export type EnrichedProductRecord = {
  id: string;
  batchId: string;
  sourceRow: number;
  input: RawProductInput;
  cleanedInput: RawProductInput;
  manufacturer: {
    canonical: string | null;
    code: string | null;
    brand: string | null;
    brandCode: string | null;
    method: "exact" | "alias" | "fuzzy" | "unresolved";
    score: number;
    candidates: Array<{ name: string; score: number }>;
    requiresReview: boolean;
    rationale: string;
  };
  classification: {
    classpath: string | null;
    confidence: number;
    rationale: string;
  };
  attributes: ProductAttribute[];
  descriptions: {
    productTitle: string;
    mobileDescription: string;
    invoiceDescription: string;
    shortDescription: string;
    longDescription: string;
  };
  validation: ValidationIssue[];
  confidence: {
    score: number;
    explanation: string[];
  };
  reviewStatus: "pending" | "needs_review" | "approved" | "flagged";
  processingStatus: "processed" | "failed";
  audit: AuditEvent[];
};

export type BatchMetrics = {
  total: number;
  processed: number;
  failed: number;
  validationRate: number;
  reviewQueueCount: number;
  lovComplianceRate: number;
  throughput: number;
};
