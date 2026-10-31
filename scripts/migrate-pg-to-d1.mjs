// One-off data migration: Neon Postgres → Cloudflare D1 (SQLite dialect).
//
// Usage:
//   DATABASE_URL="postgres://..." node scripts/migrate-pg-to-d1.mjs [--out /tmp/redocor-data.sql]
//   npx wrangler d1 execute redocor --remote --file=/tmp/redocor-data.sql -y
//
// Reads every business table from the source PG database and emits
// `INSERT OR REPLACE` statements with SQLite-compatible literals:
//   - boolean            → 1/0
//   - timestamp(tz)      → epoch milliseconds (schema uses mode 'timestamp_ms')
//   - json/jsonb/array   → JSON text
// Rows are emitted parents-first so D1's foreign-key enforcement holds.
import { writeFileSync } from 'node:fs';
import postgres from 'postgres';

const outIndex = process.argv.indexOf('--out');
const OUT_FILE =
  outIndex > -1 ? process.argv[outIndex + 1] : '/tmp/redocor-data.sql';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL (source Postgres) is required');
  process.exit(1);
}

// Parents before children (FK order). Tables missing from the source are skipped.
const TABLES = [
  'user',
  'role',
  'permission',
  'role_permission',
  'user_role',
  'session',
  'account',
  'verification',
  'config',
  'taxonomy',
  'post',
  'order',
  'subscription',
  'credit',
  'apikey',
  'ai_task',
  'chat',
  'chat_message',
  'ticket',
  'ticket_message',
  'invite_code',
  'user_invite',
  'free_design_usage',
];

const CHUNK_ROWS = 25;

function sqlLiteral(value, dataType) {
  if (value === null || value === undefined) return 'NULL';
  if (dataType === 'boolean') return value ? '1' : '0';
  if (
    dataType.startsWith('timestamp') ||
    dataType === 'date' ||
    dataType.endsWith('time')
  ) {
    const ms =
      value instanceof Date ? value.getTime() : new Date(value).getTime();
    if (Number.isNaN(ms)) throw new Error(`Unparseable date: ${value}`);
    return String(ms);
  }
  if (dataType === 'json' || dataType === 'jsonb' || dataType.endsWith('[]')) {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return `'${text.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'object') {
    // postgres.js returns Date for timestamps and arrays for ARRAY columns;
    // anything else object-shaped is JSON content too.
    const text =
      value instanceof Date ? String(value.getTime()) : JSON.stringify(value);
    return `'${text.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

const sql = postgres(DATABASE_URL, { max: 1 });

try {
  await main();
} catch (error) {
  console.error('migration failed:', error.message);
  process.exit(1);
} finally {
  await sql.end();
}

async function main() {
  const existing = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public'`;
  const existingNames = new Set(existing.map((r) => r.table_name));
  const tables = TABLES.filter((t) => existingNames.has(t));
  const missing = TABLES.filter((t) => !existingNames.has(t));
  if (missing.length)
    console.log('skipped (not in source):', missing.join(', '));

  const statements = [];
  const summary = [];

  for (const t of tables) {
    const cols = await sql`
      select column_name, data_type from information_schema.columns
      where table_schema = 'public' and table_name = ${t}
      order by ordinal_position`;
    const colList = cols.map((c) => `"${c.column_name}"`).join(', ');
    const rows = await sql.unsafe(`select * from "${t}"`);
    for (let i = 0; i < rows.length; i += CHUNK_ROWS) {
      const chunk = rows.slice(i, i + CHUNK_ROWS);
      const values = chunk
        .map(
          (row) =>
            `(${cols
              .map((c) => sqlLiteral(row[c.column_name], c.data_type))
              .join(', ')})`
        )
        .join(',\n  ');
      statements.push(
        `INSERT OR REPLACE INTO "${t}" (${colList}) VALUES\n  ${values};`
      );
    }
    summary.push(`${t}: ${rows.length} rows`);
  }

  writeFileSync(OUT_FILE, statements.join('\n\n') + '\n');
  console.log(summary.join('\n'));
  console.log(
    `\n${statements.length} INSERT statements → ${OUT_FILE}\n` +
      `Apply with: npx wrangler d1 execute redocor --remote --file=${OUT_FILE} -y`
  );
}
