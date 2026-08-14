import { describe, expect, it } from "vitest";
import { serializeExportRows } from "./pimDb";
import {
  cleanInput,
  enrichRecord,
  normalizeDimensionToken,
} from "./pimPipeline";

describe("TraceForge deterministic enrichment rules", () => {
  it("maps all configured supplier placeholder values to null", () => {
    const cleaned = cleanInput({
      Mfg_Part_Num: "DCB518ASTS06G",
      Part_Desc: 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc',
      E1_Brand: "-- Unbranded --",
      Unilog_Brand: "-- No Unilog Brand --",
      DIB_Brand: "-- No DIB Brand --",
      Part_Manuf: "Freud Inc (2435)",
    });
    expect(cleaned.E1_Brand).toBeNull();
    expect(cleaned.Unilog_Brand).toBeNull();
    expect(cleaned.DIB_Brand).toBeNull();
  });

  it("normalizes decimal and fractional inch tokens with an explicit space-before-unit convention", () => {
    expect(normalizeDimensionToken(".5", '"')).toEqual({
      value: "1/2",
      unit: "in",
    });
    expect(normalizeDimensionToken("4-1/2", '"')).toEqual({
      value: "4-1/2",
      unit: "in",
    });
    expect(normalizeDimensionToken("20", "mm")).toEqual({
      value: "20",
      unit: "mm",
    });
  });

  it("builds description fields only from validated parsed values", () => {
    const record = enrichRecord(
      {
        Mfg_Part_Num: "49-94-0013",
        Part_Desc: '49-94-0013 Milw 5"x.045"x7/8" Metal Cut Off Disc',
        E1_Brand: "-- Unbranded --",
        Unilog_Brand: "-- No Unilog Brand --",
        DIB_Brand: "-- No DIB Brand --",
        Part_Manuf: "Milwaukee Accessory (4031)",
      },
      "test-batch",
      2
    );
    expect(record.descriptions.productTitle).toContain("Milwaukee®");
    expect(record.descriptions.productTitle).toContain(
      "5 in x 0.045 in x 7/8 in"
    );
    expect(record.descriptions.invoiceDescription.length).toBeLessThanOrEqual(
      40
    );
    expect(record.attributes.every(attribute => attribute.isValidated)).toBe(
      true
    );
    expect(
      record.validation.some(issue => issue.code === "CONSTRAINT_GATE")
    ).toBe(true);
  });

  it("routes insufficient evidence to reviewer attention instead of generating certainty", () => {
    const record = enrichRecord(
      {
        Mfg_Part_Num: "UNKNOWN",
        Part_Desc: "Industrial consumable",
        Part_Manuf: "Unknown Supplier",
      },
      "test-batch",
      3
    );
    expect(record.reviewStatus).toBe("needs_review");
    expect(record.manufacturer.canonical).toBeNull();
    expect(record.confidence.explanation.join(" ")).toContain("Needs Review");
  });

  it("creates an append-only enrichment audit event with evidence-ready field provenance", () => {
    const record = enrichRecord(
      {
        Mfg_Part_Num: "DCB518ASTS06G",
        Part_Desc: 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc',
        Part_Manuf: "Freud Inc (2435)",
      },
      "audit-batch",
      2
    );
    expect(record.audit).toHaveLength(1);
    expect(record.audit[0]).toMatchObject({
      action: "enriched",
      actor: "TraceForge deterministic pipeline",
    });
    expect(
      record.attributes.every(
        attribute => attribute.evidence.sourceType === "manufacturer_document"
      )
    ).toBe(true);
    expect(record.attributes[0]?.evidence.sourceUrl).toContain(
      "diablotools.com"
    );
  });

  it("serializes normalized attribute and validation metadata for CSV/JSON export", () => {
    const exported = serializeExportRows(
      [
        {
          id: "record-1",
          batchId: "batch-1",
          sourceRow: 2,
          mfgPartNum: "SKU-1",
          manufacturer: "Example",
          brand: "Example®",
          classpath: "Abrasives",
          recordConfidence: 89,
          reviewStatus: "approved",
        },
      ] as any,
      [
        {
          productRecordId: "record-1",
          fieldKey: "grit",
          normalizedValue: "P150",
          unit: null,
          isValidated: true,
          evidenceSourceType: "input",
        },
      ] as any,
      [
        {
          productRecordId: "record-1",
          severity: "pass",
          code: "CONSTRAINT_GATE",
          message: "Validated",
        },
      ] as any
    );
    expect(exported[0]?.attributes).toEqual([
      {
        field: "grit",
        value: "P150",
        unit: null,
        validated: true,
        evidenceSource: "input",
      },
    ]);
    expect(exported[0]?.validation).toEqual([
      { severity: "pass", code: "CONSTRAINT_GATE", message: "Validated" },
    ]);
  });
});
