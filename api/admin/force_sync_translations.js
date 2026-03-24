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
    // 1. Get all english translations
    const { rows } = await sql`
      SELECT fungi_id, name, tagline FROM fungi_translations WHERE language_code = 'en';
    `;

    const targetLangs = ['he', 'ru', 'es'];

    for (const row of rows) {
      if (!row.name && !row.tagline) continue;
      
      for (const tLang of targetLangs) {
         const tName = await translateText(row.name, 'en', tLang);
         const tTagline = await translateText(row.tagline, 'en', tLang);

         await sql`
            UPDATE fungi_translations 
            SET name = ${tName}, tagline = ${tTagline}, updated_at = CURRENT_TIMESTAMP
            WHERE fungi_id = ${row.fungi_id} AND language_code = ${tLang};
         `;
      }
    }

    res.status(200).json({ success: true, message: 'All English names & taglines have been retroactively translated!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
