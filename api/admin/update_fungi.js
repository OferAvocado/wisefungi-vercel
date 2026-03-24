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
        search_keywords = ${data.keywords ? JSON.stringify(data.keywords) : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${slug}) 
      AND language_code = ${lang}::language_enum;
    `;

    // --- AUTO TRANSLATION ENGINE ---
    const translateText = async (text, fromL, toL) => {
        if (!text || text.trim() === '') return text;
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromL}|${toL}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.responseStatus === 200) return json.responseData.translatedText;
            return text;
        } catch(err) { return text; }
    };

    const targetLangs = ['he', 'en', 'ru', 'es'].filter(l => l !== lang);
    const fungiIdResult = await sql`SELECT id FROM fungi WHERE slug = ${slug}`;
    const fId = fungiIdResult.rows[0].id;

    for (const tLang of targetLangs) {
        const tName = await translateText(data.name, lang, tLang);
        const tSub = await translateText(data.subtitle, lang, tLang);
        const tAbout = await translateText(data.about, lang, tLang);
        const tUsage = await translateText(data.usage, lang, tLang);
        const tDosage = await translateText(data.dosage, lang, tLang);
        
        let tKws = null;
        if(data.keywords && data.keywords.length > 0) {
           tKws = [];
           for(const kw of data.keywords) { tKws.push(await translateText(kw, lang, tLang)); }
           tKws = JSON.stringify(tKws);
        }

        await sql`
            INSERT INTO fungi_translations (id, fungi_id, language_code, name, tagline, about_this_mushroom, how_to_use, recommended_dosage, search_keywords, created_at, updated_at)
            VALUES (gen_random_uuid(), ${fId}, ${tLang}::language_enum, ${tName}, ${tSub}, ${tAbout}, ${tUsage}, ${tDosage}, ${tKws}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (fungi_id, language_code) DO UPDATE SET
              name = EXCLUDED.name,
              tagline = EXCLUDED.tagline,
              about_this_mushroom = EXCLUDED.about_this_mushroom,
              how_to_use = EXCLUDED.how_to_use,
              recommended_dosage = EXCLUDED.recommended_dosage,
              search_keywords = EXCLUDED.search_keywords,
              updated_at = CURRENT_TIMESTAMP;
        `;
    }

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
