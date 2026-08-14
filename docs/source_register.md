# TraceForge PIM Source Register

This register distinguishes **methodology sources** from **record-level product evidence**. It excludes marketplace and distributor listings from the enrichment hierarchy.

| Source | Type | Used for | Scope and caution |
|---|---|---|---|
| [ETIM International](https://www.etim-international.com/) | Standards body | Explaining why class/attribute structure matters in technical product data [1] | Methodology context only; not used to assert product-specific facts. |
| [ECLASS Standard](https://eclass.eu/en/eclass-standard) | Standards body | Explaining unambiguous classification and product description [2] | Methodology context only; not used to assert product-specific facts. |
| [UNSPSC](https://www.ungm.org/public/unspsc) | Classification system | Explaining global product/service classification [3] | Methodology context only; no UNSPSC code is inferred in the MVP without a controlled mapping. |
| [Diablo DCB518ASTS06G](https://diablotools.com/products/DCB518ASTS06G) | Manufacturer-owned product page | Corroborates the demo sanding-belt record’s dimensions, grit, pack quantity, and material [4] | Applied only to exact MPN `DCB518ASTS06G`. |
| [3M 775L](https://www.3m.com/3M/en_US/p/d/b40064963/) | Manufacturer-owned product-family page | Corroborates 775L product-family form, abrasive material, and published grit range [5] | Labeled as family-level evidence; does not assert unlisted variant details. |

## Evidence rules

Every populated attribute retains `sourceType`, `sourceRef`, `excerpt`, `extractionMethod`, and an optional manufacturer URL. Source types are `input`, `approved_demo_master`, `manufacturer_document`, and `derived`. Derived fields never introduce a new technical claim; the description builder merely assembles validated values.

> **Review rule:** If a manufacturer source does not corroborate a value, the prototype retains the original input evidence and routes insufficient confidence to review. It does not retrieve product facts from marketplace or distributor pages.

## References

[1]: https://www.etim-international.com/ "ETIM International"
[2]: https://eclass.eu/en/eclass-standard "ECLASS Standard"
[3]: https://www.ungm.org/public/unspsc "UNSPSC"
[4]: https://diablotools.com/products/DCB518ASTS06G "Diablo DCB518ASTS06G"
[5]: https://www.3m.com/3M/en_US/p/d/b40064963/ "3M 775L"
