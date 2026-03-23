import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Basic authorization check
  const auth = req.headers.authorization;
  if (auth !== 'wise-fungi-secret') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug, lang, data } = req.body;

  try {
    // Update the core fungi_translations table for this specific language
    // Map JSON names to DB column names (about_this_mushroom, how_to_use, etc.)
    await sql`
      UPDATE fungi_translations 
      SET 
        name = ${data.name},
        tagline = ${data.subtitle},
        about_this_mushroom = ${data.about},
        how_to_use = ${data.usage},
        recommended_dosage = ${data.dosage},
        updated_at = CURRENT_TIMESTAMP
      WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${slug}) 
      AND language_code = ${lang}::language_enum;
    `;

    if (data.interactions) {
      const intStr = JSON.stringify(data.interactions);
      await sql`
        INSERT INTO ui_translations (key, lang, value)
        VALUES (${'int_' + slug}, 'all', ${intStr})
        ON CONFLICT (key, lang)
        DO UPDATE SET value = EXCLUDED.value;
      `;
    }

    // Note: To edit benefits/conditions linked rows specifically, 
    // we would need more complex logic to sync relations. 
    // For now, we update the core textual data.

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: error.message });
  }
}
