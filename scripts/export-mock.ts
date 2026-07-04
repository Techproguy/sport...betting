// Exports the seeded in-memory mock database to mock/*.json (build-time deliverable).
// Run: npx tsx scripts/export-mock.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { db, currentUser } from '../src/lib/mock/db';

const out = resolve(process.cwd(), 'mock');
mkdirSync(out, { recursive: true });

const data = db();

const files: Record<string, unknown> = {
  'users.json': data.users,
  'events.json': data.events,
  'bets.json': data.bets,
  'transactions.json': data.transactions,
  'kyc.json': data.kyc,
  'admin.json': { admins: data.admins, auditLogs: data.audit, fraudCases: data.fraud },
  'reports.json': { series: data.series, promotions: data.promotions },
  'wallet.json': {
    account: currentUser(),
    paymentMethods: [
      { id: 'pm_1', type: 'Visa', last4: '4242', default: true, expiry: '08/28' },
      { id: 'pm_2', type: 'Mastercard', last4: '5588', default: false, expiry: '11/27' },
      { id: 'pm_3', type: 'ACH', bank: 'Chase', last4: '1234', default: false },
      { id: 'pm_4', type: 'PayPal', email: 'alex.morgan@email.com', default: false },
    ],
    notifications: data.notifications,
  },
};

for (const [name, value] of Object.entries(files)) {
  writeFileSync(resolve(out, name), JSON.stringify(value, null, 2));
  const count = Array.isArray(value) ? value.length : Object.keys(value as object).length;
  console.log(`✓ mock/${name} (${count} ${Array.isArray(value) ? 'records' : 'keys'})`);
}

console.log('Done.');
