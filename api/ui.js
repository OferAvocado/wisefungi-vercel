import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Allow cross-origin requests for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const lang = req.query.lang || 'he';

  try {
    const { rows } = await sql`
      SELECT key, value FROM ui_translations WHERE lang = ${lang} OR lang = 'all';
    `;
    
    // Convert to a neat dictionary object for the frontend
    const dict = {};
    rows.forEach(r => {
      dict[r.key] = r.value;
    });

    res.status(200).json(dict);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal Database Error' });
  }
}
