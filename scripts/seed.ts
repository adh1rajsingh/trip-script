import 'dotenv/config';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';

type UserRow = { id: string; clerk_id: string; email: string };
type TripRow = { id: string; destination: string; share_id?: string | null };
type ItineraryRow = { id: string; name: string };

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const sql = postgres(url, { max: 1 });



  async function columnExists(table: string, column: string): Promise<boolean> {
    const [row] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}
      ) AS exists
    ` as unknown as Array<{ exists: boolean }>;
    return !!row?.exists;
  }

  // 1) Demo user (use provided Clerk ID if set, else random)
  const providedClerkId = process.env.SEED_CLERK_ID?.trim();
  const providedEmail = process.env.SEED_EMAIL?.trim();
  const demoClerkId = providedClerkId || ('demo_clerk_' + uuidv4().slice(0, 8));
  const demoEmail = providedEmail || `demo.${Math.random().toString(36).slice(2, 6)}@example.com`;

  const [user] = await sql`
    insert into users (clerk_id, email, first_name, last_name)
    values (${demoClerkId}, ${demoEmail}, 'Demo', 'User')
    on conflict (clerk_id) do update set email = excluded.email, updated_at = now()
    returning *
  ` as unknown as UserRow[];

  // 2) Demo trip next month (5 days in Paris)
  const start = new Date();
  start.setMonth(start.getMonth() + 1);
  start.setDate(10);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const shareId = uuidv4();
  const hasBaseCurrency = await columnExists('trips', 'base_currency');
  const hasIsPublic = await columnExists('trips', 'is_public');
  const hasShareId = await columnExists('trips', 'share_id');

  let tripInsertSql;
  if (hasBaseCurrency && hasIsPublic && hasShareId) {
    tripInsertSql = sql`
      insert into trips (user_id, destination, start_date, end_date, base_currency, is_public, share_id)
      values (${user.id}, 'Paris, France', ${start}, ${end}, 'USD', true, ${shareId})
      returning *
    `;
  } else if (hasIsPublic && hasShareId) {
    tripInsertSql = sql`
      insert into trips (user_id, destination, start_date, end_date, is_public, share_id)
      values (${user.id}, 'Paris, France', ${start}, ${end}, true, ${shareId})
      returning *
    `;
  } else {
    tripInsertSql = sql`
      insert into trips (user_id, destination, start_date, end_date)
      values (${user.id}, 'Paris, France', ${start}, ${end})
      returning *
    `;
  }
  const [trip] = await (tripInsertSql as unknown as Promise<TripRow[]>);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    days.push(new Date(d));
  }

  // 4) Itinerary items with geo for Paris
  const parisSpots = [
    { name: 'Eiffel Tower', lat: 48.85837, lng: 2.294481, address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris' },
    { name: 'Louvre Museum', lat: 48.860611, lng: 2.337644, address: 'Rue de Rivoli, 75001 Paris' },
    { name: 'Notre-Dame Cathedral', lat: 48.853, lng: 2.3499, address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris' },
    { name: 'Montmartre & Sacré-Cœur', lat: 48.8867, lng: 2.3431, address: '35 Rue du Chevalier de la Barre, 75018 Paris' },
    { name: 'Seine River Cruise', lat: 48.8584, lng: 2.2945, address: 'Bateaux area near Eiffel Tower' },
    { name: 'Musée d’Orsay', lat: 48.8600, lng: 2.3266, address: '1 Rue de la Légion d’Honneur, 75007 Paris' },
  ];

  type InsertedItem = { id: string; name: string };
  const insertedItems: InsertedItem[] = [];
  for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
    const d = days[dayIdx];
    const spotsForDay = parisSpots.slice(dayIdx, dayIdx + 3);
    for (let i = 0; i < spotsForDay.length; i++) {
      const s = spotsForDay[i];
      const [row] = await sql`
        insert into itinerary_items (trip_id, name, description, date, latitude, longitude, address, "order")
        values (${trip.id}, ${s.name}, ${`Visit ${s.name}`}, ${d}, ${s.lat}, ${s.lng}, ${s.address}, ${i})
        returning *
      ` as unknown as ItineraryRow[];
      insertedItems.push({ id: row.id, name: row.name });
    }
  }





  console.log('Demo user:', { id: user.id, clerkId: user.clerk_id, email: user.email });
  if (!providedClerkId) {
    console.log('Note: To attach seeded trips to your Clerk account, set SEED_CLERK_ID and SEED_EMAIL and re-run npm run seed.');
  }
  console.log('Demo trip:', { id: trip.id, destination: trip.destination, shareId: trip.share_id ?? null });
  console.log('Open your trip:', `/trips/${trip.id}`);
  if (hasShareId) console.log('Public share URL:', `/share/${trip.share_id}`);

  await sql.end({ timeout: 5 });
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
