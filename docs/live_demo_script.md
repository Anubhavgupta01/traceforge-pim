# TraceForge PIM — Four-Minute Live Demo Script

## Opening — 0:00 to 0:25

“Industrial catalogues often arrive as compressed supplier strings. The risk is not just missing data; it is **plausible but unsupported product data**. TraceForge PIM turns that risk into a visible reviewable workflow.”

## Input — 0:25 to 0:55

Open **Intake studio**. Paste or upload the supplied UniHack row for `DCB518ASTS06G`. Point out that supplier-placeholder brands are accepted at the boundary but immediately normalized to null. Explain that a malformed CSV header or malformed row is reported before processing.

## Enrichment — 0:55 to 1:35

Run the single-record preview. Highlight the deterministic extraction of sanding-belt type, `1/2 in x 18 in` dimensions, pack quantity, and resolved Diablo brand. State that the product title and descriptions are not free text: they are assembled only from fields that passed validation.

## Evidence and confidence — 1:35 to 2:15

Open the selected record in **Review queue**. Show a field evidence card: raw input/excerpt, extraction method, source type, and the Diablo manufacturer URL. Open “Why this score?” and explain that entity-match method, parsed-field coverage, category confidence, and unresolved warnings are displayed rather than hidden behind a single opaque score.

## Human review — 2:15 to 2:55

Approve one field, edit a second field, or flag an uncertain field. Point to the three-state history—**original**, **proposed**, and **approved**—plus the append-only reviewer action. This is the moment to emphasize that TraceForge refuses to automatically publish low-confidence data.

## Scale and export — 2:55 to 3:30

Return to **Command center** and show the verified 1,000-row batch. Open **Product records** to demonstrate status filtering, validation/review states, and CSV/JSON export. Call out the review queue as an operational triage signal, not a hidden error rate.

## Close — 3:30 to 4:00

“TraceForge is not a generic text generator. It is a constraint-first product-intelligence workflow: it cleans sparse inputs, proves each output, escalates uncertainty, and gives merchandisers a scalable path from messy catalogue data to commerce-ready records.”
