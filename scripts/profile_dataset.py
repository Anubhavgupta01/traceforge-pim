import csv
import json
import re
from collections import Counter
from pathlib import Path

INPUT_PATH = Path('/home/ubuntu/upload/Unihack_SampleDataset-Input.csv')
OUTPUT_PATH = Path('/home/ubuntu/traceforge-pim/docs/data_audit.json')
PLACEHOLDERS = {
    '-- unbranded --',
    '-- no unilog brand --',
    '-- no dib brand --',
    '',
    'n/a',
    'na',
    'null',
    'none',
}

def is_placeholder(value: str | None) -> bool:
    return (value or '').strip().casefold() in PLACEHOLDERS

def main() -> None:
    with INPUT_PATH.open(newline='', encoding='utf-8-sig') as source:
        rows = list(csv.DictReader(source))

    columns = list(rows[0].keys()) if rows else []
    null_counts = {
        column: sum(is_placeholder(row.get(column)) for row in rows)
        for column in columns
    }
    manufacturer_counts = Counter((row.get('Part_Manuf') or '').strip() for row in rows)
    descs = [(row.get('Part_Desc') or '') for row in rows]
    summary = {
        'row_count': len(rows),
        'columns': columns,
        'placeholder_counts': null_counts,
        'placeholder_rates': {
            column: round((count / len(rows)) * 100, 2) if rows else 0
            for column, count in null_counts.items()
        },
        'description_length': {
            'min': min(map(len, descs)) if descs else 0,
            'max': max(map(len, descs)) if descs else 0,
            'average': round(sum(map(len, descs)) / len(descs), 2) if descs else 0,
        },
        'top_manufacturers': [
            {'raw_value': value, 'count': count}
            for value, count in manufacturer_counts.most_common(15)
        ],
        'pattern_counts': {
            'mentions_disc': sum(bool(re.search(r'\bdisc\b', value, re.I)) for value in descs),
            'mentions_belt': sum(bool(re.search(r'\bbelt\b', value, re.I)) for value in descs),
            'mentions_grit': sum(bool(re.search(r'\bP\d{2,4}\b', value, re.I)) for value in descs),
            'mentions_dimensions': sum(bool(re.search(r'\d+(?:-\d+/\d+|/\d+|\.\d+)?\s*(?:x|×)', value, re.I)) for value in descs),
            'mentions_pack_quantity': sum(bool(re.search(r'\b\d+\s*(?:pc|pcs|disc|pack|box)\b', value, re.I)) for value in descs),
        },
        'representative_rows': rows[:8],
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(summary, indent=2), encoding='utf-8')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
