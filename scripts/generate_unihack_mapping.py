import csv
from pathlib import Path

source = Path('/home/ubuntu/upload/Unihack_ExpectedOutput-DeliveryFormat.csv')
target = Path('/home/ubuntu/traceforge-pim/docs/unihack_delivery_mapping.md')

with source.open(newline='', encoding='utf-8-sig') as handle:
    headers = next(csv.reader(handle))

mapped = {
    'MFR URL': 'First unique manufacturer-owned evidence URL from validated attributes.',
    'PART_NUMBER': 'Resolved manufacturer part number (`mfgPartNum`).',
    'Dept': 'First segment of validated `Classpath`.',
    'Class': 'Second segment of validated `Classpath`.',
    'Fine': 'Third segment of validated `Classpath`.',
    'SKU - MY_PART_NUMBER': 'Uses manufacturer part number because no distributor SKU is supplied.',
    'Mfg_Part_Num': 'Retained cleaned source MPN.',
    'Part_Desc': 'Retained cleaned source description.',
    'E1_Brand': 'Retained source brand; configured placeholders are blank.',
    'Unilog_Brand': 'Retained source brand; configured placeholders are blank.',
    'DIB_Brand': 'Retained source brand; configured placeholders are blank.',
    'Part_Manuf': 'Retained source supplier manufacturer.',
    'MANUFACTURER_NAME': 'Canonical resolved manufacturer when evidence threshold passes.',
    'BRAND_NAME': 'Canonical resolved brand when evidence threshold passes.',
    'TRADE_NAME': 'Validated `productLine` attribute.',
    'MANUFACTURER_PART_NUMBER': 'Resolved manufacturer part number (`mfgPartNum`).',
    'Classpath': 'Validated deterministic abrasives category path.',
    'MOBILE_DESC': 'Deterministic validated mobile description.',
    'INVOICE_DESC': 'Deterministic validated invoice description.',
    'SHORT_DESC': 'Deterministic validated short description.',
    'LONG_DESC1': 'Deterministic validated long description.',
    'RETAIL_DESC': 'Uses deterministic short description.',
    'MARKETING_DESCRIPTION': 'Uses deterministic long description.',
    'Application': 'Validated `intendedUse` attribute.',
    'Product Name': 'Deterministic validated product title.',
    'Selling Qty': 'Numeric portion of validated `packQuantity`.',
    'Selling UOM': 'UOM portion of validated `packQuantity`.',
    'LENGTH': 'Second parsed value of a two/three-part dimensions attribute.',
    'LENGTH_UOM': 'UOM of the mapped length dimension.',
    'WIDTH': 'First parsed value of a two/three-part dimensions attribute.',
    'WIDTH_UOM': 'UOM of the mapped width dimension.',
}

def status_for(header):
    if header in mapped:
        return 'Mapped', mapped[header]
    if header.startswith('Ref URL'):
        return 'Conditional', 'Populated only with additional unique manufacturer-owned evidence URLs; otherwise blank.'
    if header.startswith('ITEM_FEATURES_'):
        return 'Conditional', 'Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists.'
    if header.startswith('ATTRIBUTE_LABEL '):
        return 'Conditional', 'Ranked validated attribute label; blank after the available validated-attribute count.'
    if header.startswith('ATTRIBUTE_VALUE '):
        return 'Conditional', 'Ranked validated attribute normalized value; blank after the available validated-attribute count.'
    if header.startswith('ATTRIBUTE_UOM '):
        return 'Conditional', 'Ranked validated attribute UOM; blank when unitless or unavailable.'
    return 'Intentionally blank', 'No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field.'

lines = [
    '# UniHack Delivery Format — Field-by-Field Mapping',
    '',
    'This document records the exact behavior of the dedicated 252-column UniHack delivery export. The header list is copied in the supplied order and must not be changed. `Mapped` fields are populated only from validated evidence. `Conditional` fields are populated only when their stated condition is met. `Intentionally blank` fields remain empty until an approved source, master list, or controlled mapping is supplied.',
    '',
    '| # | Required header | Export status | Source or policy |',
    '|---:|---|---|---|',
]

for index, header in enumerate(headers, start=1):
    status, rationale = status_for(header)
    lines.append(f'| {index} | `{header}` | **{status}** | {rationale} |')

lines.extend([
    '',
    '## Submission safety rule',
    '',
    'The export always writes all 252 columns in the exact supplied order. An empty field is a deliberate statement of unavailable evidence, not a missing column and not a guessed value. The dedicated test suite fingerprints the source template header sequence and verifies every generated row has 252 fields.',
])
target.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Generated {target} with {len(headers)} header mappings.')
