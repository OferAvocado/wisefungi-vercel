import { sql } from '@vercel/postgres';

async function migrateDb() {
  try {
    await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS benefits_override JSONB;`;
    await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS conditions_override JSONB;`;
    console.log("Migration successful!");
  } catch(e) {
    console.error(e);
  }
}
migrateDb();
