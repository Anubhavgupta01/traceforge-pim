import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  auditEvents,
  batchRowErrors,
  fieldApprovals,
  processingBatches,
  productAttributes,
  productRecords,
  validationIssues,
} from "../drizzle/schema";
import type {
  BatchMetrics,
  EnrichedProductRecord,
  RawProductInput,
} from "../shared/pim";
import { getDb } from "./db";
import { buildDescriptions, enrichRecord, getInputHash } from "./pimPipeline";

function chunks<T>(items: T[], chunkSize = 250): T[][] {
  const result: T[][] = [];
  for (let start = 0; start < items.length; start += chunkSize)
    result.push(items.slice(start, start + chunkSize));
  return result;
}

export async function processBatch(
  sourceName: string,
  rows: RawProductInput[],
  options?: {
    batchId?: string;
    sourceOffset?: number;
    totalRows?: number;
    finalize?: boolean;
  }
) {
  const started = Date.now();
  const batchId = options?.batchId ?? `batch_${nanoid(10)}`;
  const records = rows.map((row, index) =>
    enrichRecord(row, batchId, (options?.sourceOffset ?? 0) + index + 2)
  );
  const db = await getDb();

  if (db) {
    const [existingBatch] = await db
      .select()
      .from(processingBatches)
      .where(eq(processingBatches.id, batchId))
      .limit(1);
    if (!existingBatch) {
      await db.insert(processingBatches).values({
        id: batchId,
        sourceName,
        totalRows: options?.totalRows ?? rows.length,
        status: "processing",
      });
    }
    const recordRows = records.map(record => ({
      id: record.id,
      batchId,
      sourceRow: record.sourceRow,
      mfgPartNum: record.cleanedInput.Mfg_Part_Num ?? null,
      rawDescription: record.cleanedInput.Part_Desc ?? "",
      rawManufacturer: record.cleanedInput.Part_Manuf ?? null,
      rawE1Brand: record.cleanedInput.E1_Brand ?? null,
      rawUnilogBrand: record.cleanedInput.Unilog_Brand ?? null,
      rawDibBrand: record.cleanedInput.DIB_Brand ?? null,
      manufacturer: record.manufacturer.canonical,
      manufacturerCode: record.manufacturer.code,
      brand: record.manufacturer.brand,
      brandCode: record.manufacturer.brandCode,
      matchMethod: record.manufacturer.method,
      matchScore: record.manufacturer.score,
      classpath: record.classification.classpath,
      recordConfidence: record.confidence.score,
      reviewStatus: record.reviewStatus,
      processingStatus: record.processingStatus,
      inputHash: getInputHash(record.input),
    }));
    const attributeRows = records.flatMap(record =>
      record.attributes.map(attribute => ({
        productRecordId: record.id,
        fieldKey: attribute.fieldKey,
        label: attribute.label,
        rawValue: attribute.rawValue,
        normalizedValue: attribute.normalizedValue,
        unit: attribute.unit,
        isValidated: attribute.isValidated,
        lovMatch: attribute.lovMatch,
        confidence: attribute.confidence,
        evidenceSourceType: attribute.evidence.sourceType,
        sourceRef: attribute.evidence.sourceRef,
        sourceUrl: attribute.evidence.sourceUrl ?? null,
        excerpt: attribute.evidence.excerpt,
        extractionMethod: attribute.evidence.method,
        fieldState: attribute.state,
      }))
    );
    const approvalRows = records.flatMap(record =>
      record.attributes.map(attribute => ({
        productRecordId: record.id,
        fieldKey: attribute.fieldKey,
        originalValue: attribute.rawValue,
        proposedValue: attribute.normalizedValue,
        approvedValue: null,
        status: "proposed" as const,
      }))
    );
    const issueRows = records.flatMap(record =>
      record.validation.map(issue => ({
        productRecordId: record.id,
        fieldKey: issue.fieldKey ?? null,
        severity: issue.severity,
        code: issue.code,
        message: issue.message,
      }))
    );
    const auditRows = records.map(record => ({
      productRecordId: record.id,
      action: "enriched",
      actor: "TraceForge deterministic pipeline",
      note: record.audit[0]?.note ?? null,
    }));
    const errorRows = records
      .filter(record => record.processingStatus === "failed")
      .map(record => ({
        batchId,
        sourceRow: record.sourceRow,
        mfgPartNum: record.cleanedInput.Mfg_Part_Num ?? null,
        reason: "Part_Desc is required to derive a structured record.",
      }));
    for (const batch of chunks(recordRows))
      await db.insert(productRecords).values(batch);
    for (const batch of chunks(attributeRows))
      await db.insert(productAttributes).values(batch);
    for (const batch of chunks(approvalRows))
      await db.insert(fieldApprovals).values(batch);
    for (const batch of chunks(issueRows))
      await db.insert(validationIssues).values(batch);
    for (const batch of chunks(auditRows))
      await db.insert(auditEvents).values(batch);
    for (const batch of chunks(errorRows))
      await db.insert(batchRowErrors).values(batch);
    const currentProcessed = existingBatch?.processedRows ?? 0;
    const currentFailed = existingBatch?.failedRows ?? 0;
    const finalize = options?.finalize ?? true;
    await db
      .update(processingBatches)
      .set({
        processedRows:
          currentProcessed +
          records.filter(record => record.processingStatus === "processed")
            .length,
        failedRows:
          currentFailed +
          records.filter(record => record.processingStatus === "failed").length,
        status: finalize ? "complete" : "processing",
        finishedAt: finalize ? new Date() : null,
      })
      .where(eq(processingBatches.id, batchId));
  }

  return { batchId, records, metrics: calculateMetrics(records, started) };
}

export function calculateMetrics(
  records: EnrichedProductRecord[],
  startedAt: number
): BatchMetrics {
  const processed = records.filter(
    record => record.processingStatus === "processed"
  );
  const allAttributes = records.flatMap(record => record.attributes);
  const validationPassing = records.filter(record =>
    record.validation.every(issue => issue.severity === "pass")
  );
  return {
    total: records.length,
    processed: processed.length,
    failed: records.length - processed.length,
    validationRate: records.length
      ? Math.round((validationPassing.length / records.length) * 100)
      : 0,
    reviewQueueCount: records.filter(
      record => record.reviewStatus === "needs_review"
    ).length,
    lovComplianceRate: allAttributes.length
      ? Math.round(
          (allAttributes.filter(attribute => attribute.lovMatch).length /
            allAttributes.length) *
            100
        )
      : 0,
    throughput: records.length
      ? Number(
          (
            records.length / Math.max(0.01, (Date.now() - startedAt) / 1000)
          ).toFixed(1)
        )
      : 0,
  };
}

export async function getLatestDashboard() {
  const db = await getDb();
  if (!db)
    return {
      batches: [],
      records: [],
      errors: [],
      metrics: null as BatchMetrics | null,
    };
  const batches = await db
    .select()
    .from(processingBatches)
    .orderBy(desc(processingBatches.startedAt))
    .limit(8);
  const latestBatch = batches[0];
  if (!latestBatch)
    return {
      batches,
      records: [],
      errors: [],
      metrics: null as BatchMetrics | null,
    };
  const records = await db
    .select()
    .from(productRecords)
    .where(eq(productRecords.batchId, latestBatch.id))
    .orderBy(productRecords.sourceRow)
    .limit(1000);
  const errors = await db
    .select()
    .from(batchRowErrors)
    .where(eq(batchRowErrors.batchId, latestBatch.id))
    .orderBy(batchRowErrors.sourceRow);
  const [attrs, issues] = await Promise.all([
    db.select().from(productAttributes),
    db.select().from(validationIssues),
  ]);
  const recordAttrs = attrs.filter(attribute =>
    records.some(record => record.id === attribute.productRecordId)
  );
  const validationPassing = records.filter(record =>
    issues
      .filter(issue => issue.productRecordId === record.id)
      .every(issue => issue.severity === "pass")
  ).length;
  const metrics: BatchMetrics = {
    total: latestBatch.totalRows,
    processed: latestBatch.processedRows,
    failed: latestBatch.failedRows,
    validationRate: records.length
      ? Math.round((validationPassing / records.length) * 100)
      : 0,
    reviewQueueCount: records.filter(
      record => record.reviewStatus === "needs_review"
    ).length,
    lovComplianceRate: recordAttrs.length
      ? Math.round(
          (recordAttrs.filter(attribute => attribute.lovMatch).length /
            recordAttrs.length) *
            100
        )
      : 0,
    throughput: latestBatch.finishedAt
      ? Number(
          (
            latestBatch.processedRows /
            Math.max(
              0.01,
              (latestBatch.finishedAt.getTime() -
                latestBatch.startedAt.getTime()) /
                1000
            )
          ).toFixed(1)
        )
      : 0,
  };
  return { batches, records, errors, metrics };
}

export async function getRecordDetail(recordId: string) {
  const db = await getDb();
  if (!db) return null;
  const [record] = await db
    .select()
    .from(productRecords)
    .where(eq(productRecords.id, recordId))
    .limit(1);
  if (!record) return null;
  const [attributes, issues, approvals, audit] = await Promise.all([
    db
      .select()
      .from(productAttributes)
      .where(eq(productAttributes.productRecordId, recordId)),
    db
      .select()
      .from(validationIssues)
      .where(eq(validationIssues.productRecordId, recordId)),
    db
      .select()
      .from(fieldApprovals)
      .where(eq(fieldApprovals.productRecordId, recordId)),
    db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.productRecordId, recordId))
      .orderBy(desc(auditEvents.createdAt)),
  ]);
  const descriptionAttributes = attributes.map(attribute => ({
    fieldKey: attribute.fieldKey,
    label: attribute.label,
    rawValue: attribute.rawValue,
    normalizedValue: attribute.normalizedValue,
    unit: attribute.unit,
    isValidated: attribute.isValidated,
    lovMatch: attribute.lovMatch,
    confidence: attribute.confidence,
    state: attribute.fieldState,
    evidence: {
      sourceType: attribute.evidenceSourceType as
        | "input"
        | "approved_demo_master"
        | "manufacturer_document"
        | "derived",
      sourceRef: attribute.sourceRef,
      sourceUrl: attribute.sourceUrl,
      excerpt: attribute.excerpt ?? "",
      method: attribute.extractionMethod,
    },
  }));
  const descriptions = buildDescriptions(
    record.mfgPartNum,
    record.brand,
    descriptionAttributes
  );
  const confidenceExplanation = [
    `${record.matchMethod} manufacturer/brand resolution scored ${record.matchScore}% based on supplied identity strings and the configured master candidates.`,
    `${descriptionAttributes.filter(attribute => attribute.isValidated).length}/${descriptionAttributes.length} extracted attributes are currently validated.`,
    `${issues.filter(issue => issue.severity !== "pass").length} validation warning(s) or failure(s) remain visible to the reviewer.`,
    record.reviewStatus === "needs_review"
      ? "This record remains in Needs Review because at least one configured confidence gate did not pass."
      : `Record state is ${record.reviewStatus}.`,
  ];
  return {
    record,
    attributes,
    issues,
    approvals,
    audit,
    descriptions,
    confidenceExplanation,
  };
}

export function serializeExportRows(
  records: Array<typeof productRecords.$inferSelect>,
  attributes: Array<typeof productAttributes.$inferSelect>,
  issues: Array<typeof validationIssues.$inferSelect>
) {
  return records.map(record => ({
    ...record,
    attributes: attributes
      .filter(attribute => attribute.productRecordId === record.id)
      .map(attribute => ({
        field: attribute.fieldKey,
        value: attribute.normalizedValue,
        unit: attribute.unit,
        validated: attribute.isValidated,
        evidenceSource: attribute.evidenceSourceType,
      })),
    validation: issues
      .filter(issue => issue.productRecordId === record.id)
      .map(issue => ({
        severity: issue.severity,
        code: issue.code,
        message: issue.message,
      })),
  }));
}

export async function exportBatch(batchId: string) {
  const db = await getDb();
  if (!db) return [];
  const records = await db
    .select()
    .from(productRecords)
    .where(eq(productRecords.batchId, batchId))
    .orderBy(productRecords.sourceRow);
  const attributes = await db.select().from(productAttributes);
  const issues = await db.select().from(validationIssues);
  return serializeExportRows(records, attributes, issues);
}

export async function reviewField(input: {
  recordId: string;
  fieldKey: string;
  action: "approve" | "edit" | "flag";
  approvedValue?: string;
  note?: string;
  actor?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  const [attribute] = await db
    .select()
    .from(productAttributes)
    .where(eq(productAttributes.productRecordId, input.recordId));
  const current =
    attribute && attribute.fieldKey === input.fieldKey
      ? attribute
      : (
          await db
            .select()
            .from(productAttributes)
            .where(eq(productAttributes.productRecordId, input.recordId))
        ).find(item => item.fieldKey === input.fieldKey);
  if (!current) throw new Error("The requested field was not found.");
  const state =
    input.action === "approve"
      ? "approved"
      : input.action === "flag"
        ? "flagged"
        : "approved";
  const finalValue =
    input.action === "edit"
      ? (input.approvedValue ?? current.normalizedValue)
      : input.action === "approve"
        ? current.normalizedValue
        : null;
  await db
    .update(productAttributes)
    .set({
      normalizedValue: finalValue,
      fieldState: state,
      isValidated: input.action !== "flag",
    })
    .where(eq(productAttributes.id, current.id));
  await db.insert(fieldApprovals).values({
    productRecordId: input.recordId,
    fieldKey: input.fieldKey,
    originalValue: current.rawValue,
    proposedValue: current.normalizedValue,
    approvedValue: finalValue,
    status:
      input.action === "approve"
        ? "approved"
        : input.action === "edit"
          ? "edited"
          : "flagged",
    reviewer: input.actor ?? "Reviewer",
  });
  await db.insert(auditEvents).values({
    productRecordId: input.recordId,
    fieldKey: input.fieldKey,
    action: input.action,
    originalValue: current.rawValue,
    proposedValue: current.normalizedValue,
    approvedValue: finalValue,
    actor: input.actor ?? "Reviewer",
    note: input.note ?? null,
  });
  const recordStatus = input.action === "flag" ? "flagged" : "approved";
  await db
    .update(productRecords)
    .set({ reviewStatus: recordStatus })
    .where(eq(productRecords.id, input.recordId));
  return getRecordDetail(input.recordId);
}
