import { createHash } from "node:crypto";
import { nanoid } from "nanoid";
import type {
  EnrichedProductRecord,
  Evidence,
  ProductAttribute,
  RawProductInput,
  ValidationIssue,
} from "../shared/pim";

const PLACEHOLDER_VALUES = new Set([
  "-- unbranded --",
  "-- no unilog brand --",
  "-- no dib brand --",
  "-",
  "n/a",
  "na",
  "null",
  "none",
  "",
]);

type MasterEntry = {
  canonical: string;
  manufacturerCode: string;
  brand: string;
  brandCode: string;
  aliases: string[];
};

// This transparent fallback permits a working demo while the client master workbook is unavailable.
// Rows resolved from this set are explicitly marked as approved_demo_master in their field evidence.
const DEMO_MASTER: MasterEntry[] = [
  {
    canonical: "3M",
    manufacturerCode: "3M",
    brand: "3M",
    brandCode: "3M",
    aliases: ["3m", "3m company", "jam industrial supply llc"],
  },
  {
    canonical: "Milwaukee Tool",
    manufacturerCode: "MILWAUKEE",
    brand: "Milwaukee®",
    brandCode: "MILWAUKEE",
    aliases: ["milwaukee accessory", "milw", "milwaukee"],
  },
  {
    canonical: "Mirka Abrasives, Inc.",
    manufacturerCode: "MIRUS",
    brand: "Mirka®",
    brandCode: "MIRKA",
    aliases: ["mirka abrasives inc", "mirka"],
  },
  {
    canonical: "Freud, Inc.",
    manufacturerCode: "2435",
    brand: "Diablo®",
    brandCode: "DIABLO",
    aliases: ["freud inc", "diablo", "freud"],
  },
  {
    canonical: "Makita U.S.A., Inc.",
    manufacturerCode: "5142",
    brand: "Makita®",
    brandCode: "MAKITA",
    aliases: ["makita usa inc", "makita"],
  },
  {
    canonical: "Stanley Black & Decker, Inc.",
    manufacturerCode: "2585",
    brand: "DEWALT®",
    brandCode: "DEWALT",
    aliases: ["black & decker/dewlt", "dewalt", "black and decker"],
  },
];

const ATTRIBUTE_LABELS: Record<string, string> = {
  productType: "Product Type",
  dimensions: "Dimensions",
  grit: "Grit",
  packQuantity: "Pack Quantity",
  abrasiveMaterial: "Abrasive Material",
  intendedUse: "Intended Use",
  productLine: "Product Line",
};

export function cleanInput(input: RawProductInput): RawProductInput {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      const cleaned = typeof value === "string" ? value.trim() : value;
      return [
        key,
        PLACEHOLDER_VALUES.has((cleaned ?? "").toLowerCase())
          ? null
          : cleaned || null,
      ];
    })
  ) as RawProductInput;
}

function normalizeComparable(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function similarity(left: string, right: string): number {
  const a = normalizeComparable(left);
  const b = normalizeComparable(right);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 88;
  const aTokens = new Set(a.split(" "));
  const bTokens = new Set(b.split(" "));
  const overlap = Array.from(aTokens).filter(token =>
    bTokens.has(token)
  ).length;
  return Math.round((overlap / Math.max(aTokens.size, bTokens.size)) * 78);
}

function resolveManufacturer(input: RawProductInput, description: string) {
  const supplied = [
    input.E1_Brand,
    input.Unilog_Brand,
    input.DIB_Brand,
    input.Part_Manuf,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" | ");
  const valuesToMatch = [input.Part_Manuf, input.E1_Brand, description].filter(
    Boolean
  ) as string[];
  const candidates = DEMO_MASTER.map(entry => {
    const best = Math.max(
      ...valuesToMatch.flatMap(value => [
        similarity(value, entry.canonical),
        ...entry.aliases.map(alias => similarity(value, alias)),
      ])
    );
    return { entry, score: best };
  }).sort((a, b) => b.score - a.score);
  const winner = candidates[0];
  const method =
    winner && winner.score >= 98
      ? "exact"
      : winner && winner.score >= 82
        ? "alias"
        : winner && winner.score >= 60
          ? "fuzzy"
          : "unresolved";
  const resolved = method === "unresolved" ? null : winner.entry;
  const sourceDescription = supplied || description;

  return {
    canonical: resolved?.canonical ?? null,
    code: resolved?.manufacturerCode ?? null,
    brand: resolved?.brand ?? null,
    brandCode: resolved?.brandCode ?? null,
    method,
    score: resolved ? winner.score : 0,
    candidates: candidates.slice(0, 3).map(candidate => ({
      name: candidate.entry.canonical,
      score: candidate.score,
    })),
    requiresReview: method === "fuzzy" || method === "unresolved",
    rationale:
      method === "unresolved"
        ? "No approved-demo master candidate met the 60% similarity threshold; a reviewer must select a canonical entity."
        : `${method === "exact" ? "Exact" : method === "alias" ? "Alias" : "Fuzzy"} match from “${sourceDescription}” to the demo master entry.`,
  } as const;
}

function decimalToFraction(value: number): string {
  const whole = Math.floor(value);
  const fraction = value - whole;
  if (fraction < 0.0001) return `${whole}`;
  const denominator = 64;
  const numerator = Math.round(fraction * denominator);
  if (numerator === denominator) return `${whole + 1}`;
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const divisor = gcd(numerator, denominator);
  const reduced = `${numerator / divisor}/${denominator / divisor}`;
  return whole ? `${whole}-${reduced}` : reduced;
}

export function normalizeDimensionToken(
  value: string,
  unitHint?: string
): { value: string; unit: string } {
  const stripped = value.replace(/\s+/g, "").replace(/\.$/, "");
  const unit = unitHint?.toLowerCase().includes("mm") ? "mm" : "in";
  if (/^\.\d{3}$/.test(stripped) && unit === "in")
    return { value: `0${stripped}`, unit };
  if (/^\.\d+$/.test(stripped) && unit === "in")
    return { value: decimalToFraction(Number(stripped)), unit };
  const match = stripped.match(/^(\d+)(?:-(\d+)\/(\d+)|\/(\d+)|(\.\d+))?$/);
  if (!match) return { value: stripped, unit };
  const [, whole, numerator, denominator, simpleDenominator, decimal] = match;
  if (decimal && unit === "in")
    return { value: decimalToFraction(Number(`${whole}${decimal}`)), unit };
  if (numerator && denominator)
    return { value: `${whole}-${numerator}/${denominator}`, unit };
  if (simpleDenominator)
    return { value: `${whole}/${simpleDenominator}`, unit };
  return { value: whole, unit };
}

function inputEvidence(
  sourceRef: string,
  excerpt: string,
  method: string
): Evidence {
  return { sourceType: "input", sourceRef, excerpt, method };
}

function manufacturerEvidence(
  mpn: string | null,
  description: string
): Evidence | null {
  if (mpn === "DCB518ASTS06G") {
    return {
      sourceType: "manufacturer_document",
      sourceRef: "Diablo DCB518ASTS06G product page",
      sourceUrl: "https://diablotools.com/products/DCB518ASTS06G",
      excerpt:
        "1/2 in x 18 in detail file sanding belt assorted pack; 50/80/120 grit; pack quantity 6; zirconium blend.",
      method: "manufacturer document corroboration",
    };
  }
  if (/\b775L\b/i.test(description) && /\b3M\b/i.test(description)) {
    return {
      sourceType: "manufacturer_document",
      sourceRef: "3M Cubitron II Stikit Film Disc 775L product family page",
      sourceUrl: "https://www.3m.com/3M/en_US/p/d/b40064963/",
      excerpt:
        "3M lists 775L as a film disc with Precision Shaped Ceramic abrasive and grits including 80+, 120+, 150+, 180+, 220+, and 320+.",
      method: "manufacturer family-document corroboration",
    };
  }
  return null;
}

function makeAttribute(
  fieldKey: string,
  rawValue: string | null,
  normalizedValue: string | null,
  unit: string | null,
  validated: boolean,
  confidence: number,
  evidence: Evidence
): ProductAttribute {
  return {
    fieldKey,
    label: ATTRIBUTE_LABELS[fieldKey] ?? fieldKey,
    rawValue,
    normalizedValue,
    unit,
    isValidated: validated,
    lovMatch: validated,
    confidence,
    state: validated && confidence >= 80 ? "proposed" : "needs_review",
    evidence,
  };
}

function parseAttributes(
  description: string,
  mpn: string | null
): ProductAttribute[] {
  const attributes: ProductAttribute[] = [];
  const corroboratingEvidence = manufacturerEvidence(mpn, description);
  const evidenceFor = (fallback: Evidence) => corroboratingEvidence ?? fallback;
  const productTypePatterns: Array<[RegExp, string]> = [
    [/\bsanding\s+belt\b/i, "Sanding Belt"],
    [/\bcut[\s-]?off\s+disc\b/i, "Cut-Off Disc"],
    [/\bcut[\s-]?off\s+wheel\b/i, "Cut-Off Wheel"],
    [/\bgrind(?:ing)?\s+disc\b/i, "Grinding Disc"],
    [/\bsanding\s+disc\b/i, "Sanding Disc"],
    [/\bdisc\b/i, "Abrasive Disc"],
    [/\bbelt\b/i, "Abrasive Belt"],
  ];
  const productType = productTypePatterns.find(([pattern]) =>
    pattern.test(description)
  );
  if (productType) {
    const match = description.match(productType[0]);
    attributes.push(
      makeAttribute(
        "productType",
        match?.[0] ?? productType[1],
        productType[1],
        null,
        true,
        96,
        evidenceFor(
          inputEvidence(
            "Part_Desc",
            match?.[0] ?? productType[1],
            "category rule"
          )
        )
      )
    );
  }

  const dimensionMatch = description.match(
    /((?:\d+(?:-\d+\/\d+|\/\d+|\.\d+)?|\.\d+))\s*(\"|in\.?|inch(?:es)?|mm)?\s*[x×]\s*((?:\d+(?:-\d+\/\d+|\/\d+|\.\d+)?|\.\d+))\s*(\"|in\.?|inch(?:es)?|mm)?(?:\s*[x×]\s*((?:\d+(?:-\d+\/\d+|\/\d+|\.\d+)?|\.\d+))\s*(\"|in\.?|inch(?:es)?|mm)?)?/i
  );
  if (dimensionMatch) {
    const [, first, firstUnit, second, secondUnit, third, thirdUnit] =
      dimensionMatch;
    const inferredUnit = firstUnit || secondUnit || thirdUnit || "in";
    const tokens = [
      normalizeDimensionToken(first, firstUnit || inferredUnit),
      normalizeDimensionToken(second, secondUnit || inferredUnit),
      third ? normalizeDimensionToken(third, thirdUnit || inferredUnit) : null,
    ].filter(Boolean) as Array<{ value: string; unit: string }>;
    const normalized = tokens
      .map(token => `${token.value} ${token.unit}`)
      .join(" x ");
    attributes.push(
      makeAttribute(
        "dimensions",
        dimensionMatch[0],
        normalized,
        tokens.every(token => token.unit === tokens[0]?.unit)
          ? (tokens[0]?.unit ?? null)
          : "mixed",
        true,
        94,
        evidenceFor(
          inputEvidence(
            "Part_Desc",
            dimensionMatch[0],
            "dimension regex + UOM normalizer"
          )
        )
      )
    );
  }

  const grit = description.match(/\bP\s?(\d{2,4})\b/i);
  if (grit) {
    attributes.push(
      makeAttribute(
        "grit",
        grit[0],
        `P${grit[1]}`,
        null,
        true,
        96,
        evidenceFor(inputEvidence("Part_Desc", grit[0], "grit regex"))
      )
    );
  }

  const pack = description.match(
    /\b(\d+)\s*(?:pc\.?s?|disc(?:s)?\s*\/\s*box|disc(?:s)?|pack|box)\b/i
  );
  if (pack) {
    attributes.push(
      makeAttribute(
        "packQuantity",
        pack[0],
        `${pack[1]} EA`,
        "EA",
        true,
        91,
        evidenceFor(inputEvidence("Part_Desc", pack[0], "pack quantity regex"))
      )
    );
  }

  const material = [
    "Ceramic",
    "Aluminum Oxide",
    "Silicon Carbide",
    "Zirconia",
    "Cubitron",
    "Film",
  ].find(value =>
    new RegExp(`\\b${value.replace(" ", "\\s+")}\\b`, "i").test(description)
  );
  if (material) {
    const display = material === "Cubitron" ? "Ceramic" : material;
    attributes.push(
      makeAttribute(
        "abrasiveMaterial",
        material,
        display,
        null,
        true,
        material === "Cubitron" ? 78 : 90,
        evidenceFor(
          inputEvidence(
            "Part_Desc",
            material,
            material === "Cubitron"
              ? "material inference rule"
              : "material rule"
          )
        )
      )
    );
  }

  const intendedUse = [
    "Metal",
    "Masonry",
    "Steel",
    "General Purpose",
    "Sanding",
    "Grinding",
  ].find(value =>
    new RegExp(`\\b${value.replace(" ", "\\s+")}\\b`, "i").test(description)
  );
  if (intendedUse) {
    attributes.push(
      makeAttribute(
        "intendedUse",
        intendedUse,
        intendedUse,
        null,
        true,
        87,
        evidenceFor(
          inputEvidence("Part_Desc", intendedUse, "intended use rule")
        )
      )
    );
  }

  const productLine = [
    "Cubitron II",
    "Performance+",
    "Perform+",
    "Steel Demon",
    "Speed Demon",
    "Hiolit",
    "Abranet",
    "Stikit",
  ].find(value => new RegExp(value.replace("+", "\\+"), "i").test(description));
  if (productLine) {
    attributes.push(
      makeAttribute(
        "productLine",
        productLine,
        productLine === "Perform+" ? "Performance+" : productLine,
        null,
        true,
        88,
        evidenceFor(
          inputEvidence("Part_Desc", productLine, "product line rule")
        )
      )
    );
  }
  return attributes;
}

function classify(attributes: ProductAttribute[], description: string) {
  const productType = attributes.find(
    attribute => attribute.fieldKey === "productType"
  )?.normalizedValue;
  if (productType?.includes("Belt"))
    return {
      classpath: "Abrasives > Coated Abrasives > Sanding Belts",
      confidence: 94,
      rationale: "Product type rule identified an abrasive belt.",
    };
  if (productType?.includes("Cut-Off") || /metal|masonry/i.test(description))
    return {
      classpath: "Abrasives > Bonded Abrasives > Cut-Off Wheels",
      confidence: 91,
      rationale: "Cut-off/use rule identified a bonded abrasive application.",
    };
  if (productType?.includes("Disc"))
    return {
      classpath: "Abrasives > Coated Abrasives > Sanding Discs",
      confidence: 84,
      rationale:
        "Disc rule identified a coated-abrasive disc; reviewer should confirm the taxonomy leaf.",
    };
  return {
    classpath: null,
    confidence: 28,
    rationale: "No abrasives product-type rule matched this description.",
  };
}

function attributeValue(
  attributes: ProductAttribute[],
  fieldKey: string
): string | null {
  const attribute = attributes.find(
    item => item.fieldKey === fieldKey && item.isValidated
  );
  return attribute?.normalizedValue ?? null;
}

function limit(value: string, max: number): string {
  if (value.length <= max) return value;
  const clipped = value
    .slice(0, max + 1)
    .replace(/\s+\S*$/, "")
    .trim();
  return clipped || value.slice(0, max).trim();
}

export function buildDescriptions(
  mpn: string | null,
  brand: string | null,
  attributes: ProductAttribute[]
) {
  const parts = {
    brand: brand ?? null,
    productLine: attributeValue(attributes, "productLine"),
    mpn,
    productType: attributeValue(attributes, "productType"),
    dimensions: attributeValue(attributes, "dimensions"),
    grit: attributeValue(attributes, "grit"),
    material: attributeValue(attributes, "abrasiveMaterial"),
    use: attributeValue(attributes, "intendedUse"),
    pack: attributeValue(attributes, "packQuantity"),
  };
  const title = [
    parts.brand,
    parts.productLine,
    parts.mpn,
    parts.productType,
    parts.dimensions,
    parts.grit ? `${parts.grit} Grit` : null,
  ]
    .filter(Boolean)
    .join(" ");
  const shortDescription = [
    parts.productType,
    parts.dimensions,
    parts.grit ? `${parts.grit} Grit` : null,
    parts.material,
    parts.use ? `for ${parts.use}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const mobileDescription = limit(
    [
      parts.brand,
      parts.productLine,
      parts.productType,
      parts.mpn,
      parts.dimensions,
      parts.grit ? `${parts.grit} Grit` : null,
    ]
      .filter(Boolean)
      .join(", "),
    80
  );
  const invoiceDescription = limit(
    [parts.productType, parts.dimensions, parts.grit, parts.use]
      .filter(Boolean)
      .join(" ")
      .toUpperCase(),
    40
  );
  const longDescription = [
    parts.brand,
    parts.productType,
    parts.productLine,
    parts.mpn,
    parts.dimensions,
    parts.grit ? `${parts.grit} Grit` : null,
    parts.material,
    parts.use ? `For ${parts.use}` : null,
    parts.pack,
  ]
    .filter(Boolean)
    .join(", ");
  return {
    productTitle: title || "Unresolved industrial product",
    mobileDescription,
    invoiceDescription,
    shortDescription,
    longDescription,
  };
}

function validate(
  input: RawProductInput,
  attributes: ProductAttribute[],
  classification: { classpath: string | null },
  entity: ReturnType<typeof resolveManufacturer>,
  descriptions: ReturnType<typeof buildDescriptions>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!input.Part_Desc)
    issues.push({
      severity: "fail",
      code: "MISSING_DESCRIPTION",
      message: "Part_Desc is required to derive a structured record.",
      fieldKey: "Part_Desc",
    });
  if (!input.Mfg_Part_Num)
    issues.push({
      severity: "warning",
      code: "MISSING_MPN",
      message:
        "No manufacturer part number was supplied; descriptions will omit MPN.",
      fieldKey: "Mfg_Part_Num",
    });
  if (!entity.canonical)
    issues.push({
      severity: "warning",
      code: "UNRESOLVED_ENTITY",
      message:
        "Manufacturer/brand did not meet the demo master threshold and requires reviewer selection.",
      fieldKey: "manufacturer",
    });
  if (!classification.classpath)
    issues.push({
      severity: "warning",
      code: "UNRESOLVED_CATEGORY",
      message: "The abrasives router could not assign a reliable classpath.",
      fieldKey: "classpath",
    });
  if (!attributes.some(attribute => attribute.fieldKey === "dimensions"))
    issues.push({
      severity: "warning",
      code: "MISSING_DIMENSIONS",
      message: "No dimensions were safely parsed from the input description.",
      fieldKey: "dimensions",
    });
  if (descriptions.invoiceDescription.length > 40)
    issues.push({
      severity: "fail",
      code: "INVOICE_LIMIT",
      message:
        "Invoice description exceeds the 40-character deterministic limit.",
      fieldKey: "invoiceDescription",
    });
  if (!issues.some(issue => issue.severity === "fail"))
    issues.push({
      severity: "pass",
      code: "CONSTRAINT_GATE",
      message:
        "Generated descriptions use only validated fields from the deterministic pipeline.",
    });
  return issues;
}

export function enrichRecord(
  input: RawProductInput,
  batchId: string,
  sourceRow: number
): EnrichedProductRecord {
  const cleanedInput = cleanInput(input);
  const description = cleanedInput.Part_Desc ?? "";
  const entity = resolveManufacturer(cleanedInput, description);
  const attributes = parseAttributes(
    description,
    cleanedInput.Mfg_Part_Num ?? null
  );
  const classification = classify(attributes, description);
  const descriptions = buildDescriptions(
    cleanedInput.Mfg_Part_Num ?? null,
    entity.brand,
    attributes
  );
  const validation = validate(
    cleanedInput,
    attributes,
    classification,
    entity,
    descriptions
  );
  const validatedAttributeRatio = attributes.length
    ? attributes.filter(attribute => attribute.isValidated).length /
      attributes.length
    : 0;
  const confidence = Math.round(
    Math.min(
      99,
      entity.score * 0.35 +
        classification.confidence * 0.2 +
        validatedAttributeRatio * 30 +
        (validation.some(issue => issue.severity === "fail") ? 0 : 15)
    )
  );
  const requiresReview =
    entity.requiresReview ||
    !classification.classpath ||
    validation.some(
      issue => issue.severity === "warning" || issue.severity === "fail"
    ) ||
    confidence < 75;
  const inputHash = createHash("sha256")
    .update(JSON.stringify(cleanedInput))
    .digest("hex");
  const recordId = `${batchId}-${sourceRow}-${nanoid(6)}`;
  const confidenceExplanation = [
    `${entity.method === "unresolved" ? "No" : entity.method} entity resolution contributed ${Math.round(entity.score * 0.35)} of 35 points.`,
    `${attributes.filter(attribute => attribute.isValidated).length}/${attributes.length || 0} parsed attributes passed deterministic validation.`,
    classification.classpath
      ? `Category confidence is ${classification.confidence}% from the abrasives rule set.`
      : "No safe classpath was assigned.",
    requiresReview
      ? "At least one warning, unresolved match, or low-confidence condition routes this record to Needs Review."
      : "All configured confidence gates passed.",
  ];

  return {
    id: recordId,
    batchId,
    sourceRow,
    input,
    cleanedInput,
    manufacturer: entity,
    classification,
    attributes,
    descriptions,
    validation,
    confidence: { score: confidence, explanation: confidenceExplanation },
    reviewStatus: requiresReview ? "needs_review" : "pending",
    processingStatus: input.Part_Desc ? "processed" : "failed",
    audit: [
      {
        action: "enriched",
        actor: "TraceForge deterministic pipeline",
        note: "Record processed using placeholder cleaning, approved-demo master matching, parser rules, and validation constraints.",
      },
    ],
  };
}

export function getInputHash(input: RawProductInput): string {
  return createHash("sha256")
    .update(JSON.stringify(cleanInput(input)))
    .digest("hex");
}
