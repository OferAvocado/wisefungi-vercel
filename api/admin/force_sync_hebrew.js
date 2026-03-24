import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Translate Text Function
  const translateText = async (text, fromL, toL) => {
    if (!text || typeof text !== 'string' || text.trim() === '') return text;
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromL}|${toL}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.responseStatus === 200) return json.responseData.translatedText;
        return text;
    } catch(err) { return text; }
  };

  try {
    const targetLangs = ['en', 'ru', 'es'];

    // 1. Sync UI Translations from Hebrew
    const uiRes = await sql`SELECT key, value FROM ui_translations WHERE lang = 'he'`;
    for (const row of uiRes.rows) {
        if (row.key.startsWith('int_') || row.key === 'globalTheme') continue;
        
        for (const tLang of targetLangs) {
             const tText = await translateText(row.value, 'he', tLang);
             await sql`
                 INSERT INTO ui_translations (key, lang, value)
                 VALUES (${row.key}, ${tLang}, ${tText})
                 ON CONFLICT (key, lang) DO UPDATE SET value = EXCLUDED.value;
             `;
        }
    }

    // 2. Sync Fungi Translations (Deep text) from Hebrew
    const fungiRes = await sql`
      SELECT fungi_id, name, tagline, about_this_mushroom, how_to_use, recommended_dosage 
      FROM fungi_translations WHERE language_code = 'he'
    `;

    for (const row of fungiRes.rows) {
      for (const tLang of targetLangs) {
         let tName = null, tTagline = null;
         
         // Only translate name and tagline if it's NOT English, since user manually edited English ones
         if (tLang !== 'en') {
             tName = await translateText(row.name, 'he', tLang);
             tTagline = await translateText(row.tagline, 'he', tLang);
         }

         const tAbout = await translateText(row.about_this_mushroom, 'he', tLang);
         const tUsage = await translateText(row.how_to_use, 'he', tLang);
         const tDosage = await translateText(row.recommended_dosage, 'he', tLang);

         if (tLang !== 'en') {
             await sql`
                UPDATE fungi_translations 
                SET 
                  name = ${tName}, 
                  tagline = ${tTagline},
                  about_this_mushroom = ${tAbout},
                  how_to_use = ${tUsage},
                  recommended_dosage = ${tDosage},
                  updated_at = CURRENT_TIMESTAMP
                WHERE fungi_id = ${row.fungi_id} AND language_code = ${tLang};
             `;
         } else {
             await sql`
                UPDATE fungi_translations 
                SET 
                  about_this_mushroom = ${tAbout},
                  how_to_use = ${tUsage},
                  recommended_dosage = ${tDosage},
                  updated_at = CURRENT_TIMESTAMP
                WHERE fungi_id = ${row.fungi_id} AND language_code = ${tLang};
             `;
         }
      }
    }

    res.status(200).json({ success: true, message: 'All Hebrew edits synchronized across en, ru, es!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
