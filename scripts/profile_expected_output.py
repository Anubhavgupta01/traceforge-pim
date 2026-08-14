import csv
import json
from collections import Counter
from pathlib import Path

source = Path('/home/ubuntu/upload/Unihack_ExpectedOutput-DeliveryFormat.csv')
target = Path('/home/ubuntu/traceforge-pim/docs/expected_output_profile.json')

with source.open(newline='', encoding='utf-8-sig') as handle:
    rows = list(csv.reader(handle))

headers = rows[0]
groups = Counter()
for header in headers:
    if header.startswith('Ref URL'):
        groups['reference_urls'] += 1
    elif header.startswith('ATTRIBUTE_LABEL'):
        groups['attribute_labels'] += 1
    elif header.startswith('ATTRIBUTE_VALUE'):
        groups['attribute_values'] += 1
    elif header.startswith('ATTRIBUTE_UOM'):
        groups['attribute_uoms'] += 1
    elif header.startswith('ITEM_FEATURES'):
        groups['item_features'] += 1
    else:
        groups['fixed_fields'] += 1

profile = {
    'header_count': len(headers),
    'sample_response_rows': max(0, len(rows) - 1),
    'headers': headers,
    'groups': groups,
    'fixed_headers': [header for header in headers if not (header.startswith('Ref URL') or header.startswith('ATTRIBUTE_') or header.startswith('ITEM_FEATURES'))],
}
target.write_text(json.dumps(profile, indent=2), encoding='utf-8')
print(json.dumps({
    'header_count': profile['header_count'],
    'sample_response_rows': profile['sample_response_rows'],
    'groups': dict(profile['groups']),
    'last_headers': headers[-12:],
}, indent=2))
