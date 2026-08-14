import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { serializeUnihackDeliveryRows } from "./pimDb";
import { UNIHACK_DELIVERY_HEADERS } from "../shared/unihackDelivery";

describe("UniHack delivery export", () => {
  it("preserves all 252 required headers in the supplied order", () => {
    const headerLine = `${UNIHACK_DELIVERY_HEADERS.join(",")}\r\n`;
    const hash = createHash("sha256").update(headerLine).digest("hex");
    expect(UNIHACK_DELIVERY_HEADERS).toHaveLength(252);
    expect(hash).toBe(
      "c664bceeebdc04d47d82213400f8a8f1c5ad87002a32cab828cbb03be8fc1892"
    );
  });

  it("maps only supported, validated data and leaves unsupported delivery fields blank", () => {
    const [row] = serializeUnihackDeliveryRows(
      [
        {
          id: "record-1",
          batchId: "batch-1",
          sourceRow: 2,
          mfgPartNum: "DCB518ASTS06G",
          rawDescription: 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc',
          rawManufacturer: "Freud Inc (2435)",
          rawE1Brand: null,
          rawUnilogBrand: null,
          rawDibBrand: null,
          manufacturer: "Freud, Inc.",
          brand: "Diablo®",
          classpath: "Abrasives > Coated Abrasives > Sanding Belts",
        },
      ] as any,
      [
        {
          productRecordId: "record-1",
          fieldKey: "productType",
          label: "Product Type",
          normalizedValue: "Sanding Belt",
          unit: null,
          isValidated: true,
          fieldState: "proposed",
        },
        {
          productRecordId: "record-1",
          fieldKey: "dimensions",
          label: "Dimensions",
          normalizedValue: "1/2 in x 18 in",
          unit: "in",
          isValidated: true,
          fieldState: "proposed",
        },
        {
          productRecordId: "record-1",
          fieldKey: "packQuantity",
          label: "Pack Quantity",
          normalizedValue: "6 EA",
          unit: "EA",
          isValidated: true,
          fieldState: "proposed",
        },
        {
          productRecordId: "record-1",
          fieldKey: "intendedUse",
          label: "Application",
          normalizedValue: "Sanding",
          unit: null,
          isValidated: true,
          fieldState: "proposed",
        },
        {
          productRecordId: "record-1",
          fieldKey: "weight",
          label: "Weight",
          normalizedValue: "9 lb",
          unit: "lb",
          isValidated: false,
          fieldState: "needs_review",
        },
      ] as any
    );

    expect(row).toHaveProperty("MFR URL");
    expect(row.Mfg_Part_Num).toBe("DCB518ASTS06G");
    expect(row.MANUFACTURER_NAME).toBe("Freud, Inc.");
    expect(row.BRAND_NAME).toBe("Diablo®");
    expect(row.Dept).toBe("Abrasives");
    expect(row.Class).toBe("Coated Abrasives");
    expect(row.Fine).toBe("Sanding Belts");
    expect(row["Selling Qty"]).toBe("6");
    expect(row["Selling UOM"]).toBe("EA");
    expect(row.WIDTH).toBe("1/2");
    expect(row.LENGTH).toBe("18");
    expect(row.Application).toBe("Sanding");
    expect(row["ATTRIBUTE_LABEL 1"]).toBe("Product Type");
    expect(row["ATTRIBUTE_LABEL 5"]).toBe("");
    expect(row.UPC).toBe("");
    expect(row["List Price"]).toBe("");
    expect(row["Actual Image (Yes/No)"]).toBe("");
  });
});
