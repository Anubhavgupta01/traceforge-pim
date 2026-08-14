import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const processingBatches = mysqlTable("processingBatches", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sourceName: varchar("sourceName", { length: 255 }).notNull(),
  totalRows: int("totalRows").notNull(),
  processedRows: int("processedRows").notNull().default(0),
  failedRows: int("failedRows").notNull().default(0),
  status: mysqlEnum("status", ["processing", "complete", "failed"]).notNull().default("processing"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  finishedAt: timestamp("finishedAt"),
});

export const productRecords = mysqlTable("productRecords", {
  id: varchar("id", { length: 96 }).primaryKey(),
  batchId: varchar("batchId", { length: 64 }).notNull(),
  sourceRow: int("sourceRow").notNull(),
  mfgPartNum: varchar("mfgPartNum", { length: 255 }),
  rawDescription: text("rawDescription").notNull(),
  rawManufacturer: varchar("rawManufacturer", { length: 500 }),
  rawE1Brand: varchar("rawE1Brand", { length: 255 }),
  rawUnilogBrand: varchar("rawUnilogBrand", { length: 255 }),
  rawDibBrand: varchar("rawDibBrand", { length: 255 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  manufacturerCode: varchar("manufacturerCode", { length: 100 }),
  brand: varchar("brand", { length: 255 }),
  brandCode: varchar("brandCode", { length: 100 }),
  matchMethod: varchar("matchMethod", { length: 80 }).notNull(),
  matchScore: int("matchScore").notNull(),
  classpath: varchar("classpath", { length: 500 }),
  recordConfidence: int("recordConfidence").notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "needs_review", "approved", "flagged"])
    .notNull()
    .default("pending"),
  processingStatus: mysqlEnum("processingStatus", ["processed", "failed"]).notNull().default("processed"),
  inputHash: varchar("inputHash", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productAttributes = mysqlTable("productAttributes", {
  id: int("id").autoincrement().primaryKey(),
  productRecordId: varchar("productRecordId", { length: 96 }).notNull(),
  fieldKey: varchar("fieldKey", { length: 120 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  rawValue: text("rawValue"),
  normalizedValue: text("normalizedValue"),
  unit: varchar("unit", { length: 50 }),
  isValidated: boolean("isValidated").notNull().default(false),
  lovMatch: boolean("lovMatch").notNull().default(false),
  confidence: int("confidence").notNull(),
  evidenceSourceType: varchar("evidenceSourceType", { length: 80 }).notNull(),
  sourceRef: varchar("sourceRef", { length: 255 }).notNull(),
  sourceUrl: text("sourceUrl"),
  excerpt: text("excerpt"),
  extractionMethod: varchar("extractionMethod", { length: 120 }).notNull(),
  fieldState: mysqlEnum("fieldState", ["proposed", "approved", "flagged", "needs_review"])
    .notNull()
    .default("proposed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const validationIssues = mysqlTable("validationIssues", {
  id: int("id").autoincrement().primaryKey(),
  productRecordId: varchar("productRecordId", { length: 96 }).notNull(),
  fieldKey: varchar("fieldKey", { length: 120 }),
  severity: mysqlEnum("severity", ["pass", "warning", "fail"]).notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  message: text("message").notNull(),
  isResolved: boolean("isResolved").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const fieldApprovals = mysqlTable("fieldApprovals", {
  id: int("id").autoincrement().primaryKey(),
  productRecordId: varchar("productRecordId", { length: 96 }).notNull(),
  fieldKey: varchar("fieldKey", { length: 120 }).notNull(),
  originalValue: text("originalValue"),
  proposedValue: text("proposedValue"),
  approvedValue: text("approvedValue"),
  status: mysqlEnum("status", ["proposed", "approved", "edited", "flagged"])
    .notNull()
    .default("proposed"),
  reviewer: varchar("reviewer", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  productRecordId: varchar("productRecordId", { length: 96 }).notNull(),
  fieldKey: varchar("fieldKey", { length: 120 }),
  action: varchar("action", { length: 100 }).notNull(),
  originalValue: text("originalValue"),
  proposedValue: text("proposedValue"),
  approvedValue: text("approvedValue"),
  actor: varchar("actor", { length: 255 }).notNull().default("Reviewer"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const batchRowErrors = mysqlTable("batchRowErrors", {
  id: int("id").autoincrement().primaryKey(),
  batchId: varchar("batchId", { length: 64 }).notNull(),
  sourceRow: int("sourceRow").notNull(),
  mfgPartNum: varchar("mfgPartNum", { length: 255 }),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
