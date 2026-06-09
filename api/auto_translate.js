import { sql } from '@vercel/postgres';

// Use standard global fetch (available in Node 18+)
const fetchApi = fetch;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function translateString(text, targetLang) {
  if (!text) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=he&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetchApi(url);
    if (!res.ok) {
      if (res.status === 429) {
        console.warn(`Rate limited. Waiting 2s...`);
        await sleep(2000);
        return translateString(text, targetLang);
      }
      return text;
    }
    const json = await res.json();
    return json[0].map(x => x[0]).join('');
  } catch(e) {
    console.error(`Translation error:`, e.message);
    return text;
  }
}

async function translateArray(arr, to) {
  if (!arr || !Array.isArray(arr)) return arr;
  const translated = [];
  for (const item of arr) {
    translated.push(await translateString(item, to));
    await sleep(200); // polite delay
  }
  return translated;
}

const langsToUpdate = ['en', 'es', 'ru'];

// Hardcoded explicit translations for names to avoid bad literal translations
const hardcodedNames = {
  turkey_tail: { en: 'Turkey Tail', es: 'Cola de Pavo', ru: 'Хвост индейки' },
  lions_mane: { en: "Lion's Mane", es: "Melena de León", ru: "Львиная грива" },
  tremella: { en: 'Tremella', es: 'Tremella', ru: 'Тремелла' },
  cordyceps: { en: 'Cordyceps', es: 'Cordyceps', ru: 'Кордицепс' },
  chaga: { en: 'Chaga', es: 'Chaga', ru: 'Чага' },
  reishi: { en: 'Reishi', es: 'Reishi', ru: 'Рейши' }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const secret = req.headers.authorization;
  if (secret !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  const { type, slug, key } = req.body;

  try {
    if (type === 'fungi' && slug) {
      // 1. Get fungi ID and slug
      const fungiRes = await sql`SELECT id, slug FROM fungi WHERE slug = ${slug}`;
      if (fungiRes.rowCount === 0) return res.status(404).json({ error: 'Mushroom not found' });
      const fungiId = fungiRes.rows[0].id;
      const actualSlug = fungiRes.rows[0].slug;

      // 2. Get Hebrew content
      const heRes = await sql`SELECT * FROM fungi_translations WHERE fungi_id = ${fungiId} AND language_code = 'he'`;
      if (heRes.rowCount === 0) return res.status(404).json({ error: 'Hebrew translation not found' });
      const heRow = heRes.rows[0];

      // 3. Translate to each language
      for (const lang of langsToUpdate) {
        const name = hardcodedNames[actualSlug]?.[lang] || await translateString(heRow.name, lang);
        const tagline = await translateString(heRow.tagline, lang);
        const about = await translateString(heRow.about_this_mushroom, lang);
        const usage = await translateString(heRow.how_to_use, lang);
        const dosage = await translateString(heRow.recommended_dosage, lang);
        
        let benefits = null;
        if (heRow.benefits_override && typeof heRow.benefits_override === 'object') {
          benefits = {};
          if (heRow.benefits_override.primary) benefits.primary = await translateArray(heRow.benefits_override.primary, lang);
          if (heRow.benefits_override.secondary) benefits.secondary = await translateArray(heRow.benefits_override.secondary, lang);
        }

        let indications = null;
        if (heRow.indications && Array.isArray(heRow.indications)) {
          indications = await translateArray(heRow.indications, lang);
        }

        // Update DB
        await sql`
          UPDATE fungi_translations
          SET 
            name = ${name}, 
            tagline = ${tagline}, 
            about_this_mushroom = ${about},
            how_to_use = ${usage}, 
            recommended_dosage = ${dosage},
            benefits_override = ${benefits ? JSON.stringify(benefits) : null},
            indications = ${indications ? JSON.stringify(indications) : null}
          WHERE fungi_id = ${fungiId} AND language_code = ${lang}
        `;
      }
      return res.status(200).json({ success: true });
    }

    if (type === 'ui' && key) {
      // For drug interactions
      const heRes = await sql`SELECT value FROM ui_translations WHERE key = ${key} AND language_code = 'he'`;
      if (heRes.rowCount === 0) return res.status(404).json({ error: 'Hebrew UI not found' });
      
      let parsed;
      try { parsed = JSON.parse(heRes.rows[0].value); } catch(e) { parsed = {}; }

      for (const lang of langsToUpdate) {
        const newDict = {};
        for (const [catName, arr] of Object.entries(parsed)) {
          newDict[catName] = [];
          for (const item of arr) {
            let itemName = typeof item.name === 'string' ? item.name : item.name?.he;
            let itemWhy = typeof item.why === 'string' ? item.why : item.why?.he;
            
            const translatedName = itemName ? await translateString(itemName, lang) : '';
            const translatedWhy = itemWhy ? await translateString(itemWhy, lang) : '';
            
            newDict[catName].push({
              name: translatedName,
              type: item.type,
              why: translatedWhy
            });
            await sleep(100);
          }
        }
        await sql`
          UPDATE ui_translations
          SET value = ${JSON.stringify(newDict)}
          WHERE key = ${key} AND language_code = ${lang}
        `;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid request' });
  } catch (err) {
    console.error('Translation error:', err);
    return res.status(500).json({ error: err.message });
  }
}
