import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS contraindications_override JSONB;`;
    await sql`ALTER TABLE fungi_translations DROP COLUMN IF EXISTS doctor_consultations_override;`;
    await sql`ALTER TABLE fungi_translations ADD COLUMN doctor_consultations_override JSONB;`;
    res.status(200).json({ success: true, message: 'Migration done (JSONB fix)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
