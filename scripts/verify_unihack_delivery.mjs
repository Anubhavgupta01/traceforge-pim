import { readFile } from 'node:fs/promises';
import { exportUnihackDelivery, getLatestDashboard } from '../server/pimDb.ts';
import { UNIHACK_DELIVERY_HEADERS } from '../shared/unihackDelivery.ts';

const template = await readFile('/home/ubuntu/upload/Unihack_ExpectedOutput-DeliveryFormat.csv', 'utf8');
const suppliedHeaders = template.split(/\r?\n/, 1)[0].split(',');
const dashboard = await getLatestDashboard();
const batchId = dashboard.batches[0]?.id;
if (!batchId) throw new Error('No persisted batch is available for delivery-export verification.');
const rows = await exportUnihackDelivery(batchId);
const headerMatch = JSON.stringify(suppliedHeaders) === JSON.stringify(UNIHACK_DELIVERY_HEADERS);
const rowWidthsValid = rows.every(row => Object.keys(row).length === UNIHACK_DELIVERY_HEADERS.length);
console.log(JSON.stringify({ batchId, rowCount: rows.length, expectedHeaderCount: suppliedHeaders.length, generatedHeaderCount: UNIHACK_DELIVERY_HEADERS.length, headerMatch, rowWidthsValid, firstMpn: rows[0]?.Mfg_Part_Num ?? null }, null, 2));
process.exit(headerMatch && rowWidthsValid ? 0 : 1);
