# TraceForge PIM — Evaluation Summary

## Scope

This prototype evaluates deterministic ingestion, normalization, validation, traceability, and review routing on the supplied 1,000-row UniHack input CSV. It does **not** report labelled field accuracy because the referenced 200-row input-versus-output workbook was not attached to the workspace. The evaluation view makes this absence explicit rather than inferring accuracy from unlabelled rows.

## Verified checks

| Check | Method | Result |
|---|---|---:|
| Input volume | Reproducible persistent batch run against supplied CSV | 1,000 rows processed |
| Parse failures | Source rows without an executable description | 0 rows |
| Placeholder removal | Pre-ingestion audit of defined placeholder strings | 100% of `Unilog_Brand`, 79.9% of `E1_Brand`, and 75.5% of `DIB_Brand` values were normalized to null where applicable |
| Rule compliance | Populated MVP attributes accepted by the configured deterministic rule set | 100% in the latest run |
| Review escalation | Records lacking confident coverage from the representative demo master/rules | 955 records routed to Needs Review |
| Unit tests | `pnpm test` | 7/7 tests passed |
| Type contract | `pnpm check` | Passed |

## Interpretation

The high review count is intentional: the currently available workspace lacks the full approved manufacturer/brand list and controlled LOV workbooks. Rather than converting sparse identity strings into unsupported canonical assertions, the prototype escalates uncertainty to a human reviewer. This is the desired safety behavior for a commerce-data workflow.

The interface’s validation rate is the proportion of records with no warning/fail validation condition, while LOV compliance measures populated fields accepted by the configured MVP rule set. These measures answer different questions and must not be conflated with field-level ground-truth accuracy.

## Next benchmark

Once the labelled 200-row workbook is supplied, the team should freeze a development/held-out split and report manufacturer/brand exact-match rate, per-attribute normalized accuracy, description-format compliance, provenance coverage, review precision, and coverage denominators. Rows with blank or inconsistent supplied labels should be reported separately rather than counted silently as correct.
