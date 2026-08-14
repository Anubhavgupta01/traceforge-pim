import { readFile } from 'node:fs/promises';
import { processBatch, getLatestDashboard } from '../server/pimDb.ts';

function parseLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

const text = await readFile('/home/ubuntu/upload/Unihack_SampleDataset-Input.csv', 'utf8');
const lines = text.trim().split(/\r?\n/);
const headers = parseLine(lines[0]);
const rows = lines.slice(1).map(line => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] ?? ''])));
const started = Date.now();
const result = await processBatch('Unihack_SampleDataset-Input.csv', rows);
const dashboard = await getLatestDashboard();
console.log(JSON.stringify({
  batchId: result.batchId,
  elapsedMs: Date.now() - started,
  resultMetrics: result.metrics,
  dashboardMetrics: dashboard.metrics,
  persistedRecords: dashboard.records.length,
  persistedErrors: dashboard.errors.length,
}, null, 2));
