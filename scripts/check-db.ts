import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const sql = postgres(url, { max: 1 });
  try {
    const [baseCol] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'base_currency'
      ) AS exists
    ` as unknown as Array<{ exists: boolean }>;

    const [expensesTable] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'expenses'
      ) AS exists
    ` as unknown as Array<{ exists: boolean }>;

    const [ratesTable] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'currency_rates'
      ) AS exists
    ` as unknown as Array<{ exists: boolean }>;

    console.log('Database check:');
    console.log('- trips.base_currency column:', baseCol?.exists ? 'FOUND' : 'MISSING');
    console.log('- expenses table:', expensesTable?.exists ? 'FOUND' : 'MISSING');
    console.log('- currency_rates table:', ratesTable?.exists ? 'FOUND' : 'MISSING');

    if (!baseCol?.exists || !expensesTable?.exists || !ratesTable?.exists) {
      console.log('\nAction: Apply your migrations to this DATABASE_URL (npm run db:push) and re-run this check.');
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('DB check failed:', err);
  process.exit(1);
});
