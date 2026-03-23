import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = req.headers.authorization;
  if (auth !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  const { lang, data } = req.body; 

  if (!lang || !data) return res.status(400).json({ error: 'Missing parameters' });

  try {
    // Process an object of key -> value updates
    for (const [k, v] of Object.entries(data)) {
        await sql`
            INSERT INTO ui_translations (key, lang, value)
            VALUES (${k}, ${lang}, ${v})
            ON CONFLICT (key, lang)
            DO UPDATE SET value = EXCLUDED.value;
        `;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update UI Error:', error);
    res.status(500).json({ error: 'Internal Database Error', details: error.message });
  }
}
