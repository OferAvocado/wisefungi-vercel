import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const result = await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS contraindications_override JSONB;`;
    const result2 = await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS doctor_consultations_override TEXT;`;
    res.status(200).json({ success: true, message: 'Migration done' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
