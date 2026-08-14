# Project TODO

- [x] Profile the supplied 1,000-row input CSV and record baseline missingness, placeholder prevalence, representative abrasives patterns, and input errors.
- [x] Locate and inspect the supplied labelled input-versus-output workbook and available master-data/reference files; document file availability and evaluation limitations.
- [x] Define the canonical 20–30 field product intelligence schema, dynamic attribute/evidence structure, validation states, confidence explanation, and three-state field audit model.
- [x] Add database tables and schema migrations for product records, normalized attributes, evidence, validation issues, processing batches, row errors, field approvals, and audit events.
- [x] Implement ingestion from CSV and pasted single-row data with explicit null mapping for all Unilog placeholder variants and row-level error reporting.
- [x] Implement deterministic abrasives parsing for dimensions, fractional and decimal inches, grit, disc/belt type, pack quantity, material, and intended use from MPN and description.
- [x] Implement canonical manufacturer and brand resolution with exact/fuzzy methods, candidate scores, low-confidence review flags, and approved-list fallback data.
- [x] Implement UOM/fraction normalization with approved spacing, casing, decimal-to-fraction conversion, and per-field normalization evidence.
- [x] Implement constrained product description generation for title, mobile, invoice, short, and long descriptions using only validated input fields.
- [x] Implement field-level evidence, validation checks, explainable confidence scoring, conflict detection, and Needs Review routing.
- [x] Implement reviewer actions to approve, edit, and flag records or fields while preserving original, proposed, and approved values in a complete audit trail.
- [x] Implement CSV and JSON export for enriched records with review and validation metadata.
- [x] Build the polished dashboard shell, navigation, upload and paste experience, batch status table, progress state, and quality-metric cards.
- [x] Build the elegant product record review screen with raw input, proposed values, evidence/provenance, confidence rationale, validation state, and reviewer controls.
- [x] Build the evaluation report view with held-out/labelled metrics, coverage denominators, per-attribute breakdowns, and known limitations.
- [x] Populate a curated, labelled demo dataset from the provided sample rows; do not fabricate customer reviews, ratings, or testimonials.
- [x] Write unit and integration tests for placeholder cleaning, parser rules, normalization, validation, description constraints, confidence/review states, audit logging, and exports.
- [x] Validate the full 1,000-row batch flow, examine interface screenshots at desktop and mobile sizes, and resolve observed defects.
- [x] Write a concise README/runbook covering architecture, input/output contracts, source hierarchy, evaluation method, limitations, and live-demo instructions.

