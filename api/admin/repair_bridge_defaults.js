import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (auth !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  try {
    await sql`ALTER TABLE fungi_benefits ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE fungi_conditions ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE fungi_contraindications ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE fungi_doctor_consult_flags ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE fungi_interactions ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    
    res.status(200).json({ success: true, message: 'Bridge table defaults repaired' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
