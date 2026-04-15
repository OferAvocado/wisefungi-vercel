import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS benefits_override JSONB;`;
    await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS conditions_override JSONB;`;
    res.status(200).json({ success: true, message: 'Migration successful!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
