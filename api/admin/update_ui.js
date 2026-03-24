import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = req.headers.authorization;
  if (auth !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  const { lang, data } = req.body; 

  if (!lang || !data) return res.status(400).json({ error: 'Missing parameters' });

  try {
    // --- AUTO TRANSLATION ENGINE ---
    const translateText = async (text, fromL, toL) => {
        if (!text || typeof text !== 'string' || text.trim() === '') return text;
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromL}|${toL}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.responseStatus === 200) return json.responseData.translatedText;
            return text;
        } catch(err) { return text; }
    };

    const targetLangs = ['he', 'en', 'ru', 'es'].filter(l => l !== lang);

    for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'object' && v !== null) {
            await sql`
                INSERT INTO ui_translations (key, lang, value)
                VALUES (${k}, 'all', ${JSON.stringify(v)})
                ON CONFLICT (key, lang)
                DO UPDATE SET value = EXCLUDED.value;
            `;
            continue;
        }

        await sql`
            INSERT INTO ui_translations (key, lang, value)
            VALUES (${k}, ${lang}, ${String(v)})
            ON CONFLICT (key, lang)
            DO UPDATE SET value = EXCLUDED.value;
        `;

        if (k.startsWith('int_')) continue; // Skip translating raw json interactions manually stored

        for (const tLang of targetLangs) {
             const tText = await translateText(v, lang, tLang);
             await sql`
                 INSERT INTO ui_translations (key, lang, value)
                 VALUES (${k}, ${tLang}, ${tText})
                 ON CONFLICT (key, lang) DO UPDATE SET value = EXCLUDED.value;
             `;
        }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update UI Error:', error);
    res.status(500).json({ error: 'Internal Database Error', details: error.message });
  }
}
