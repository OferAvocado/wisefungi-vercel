import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const langs = ['he', 'en', 'es', 'ru'];
    const dataMap = {};
    for (const lang of langs) {
      const filePath = path.join(process.cwd(), 'src', 'locales', \\.json\);
      dataMap[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const slugs = ['reishi', 'lions_mane', 'cordyceps', 'chaga', 'turkey_tail', 'tremella'];

    for (const slug of slugs) {
      const fRes = await sql\SELECT id FROM fungi WHERE slug = \\;
      if (!fRes.rows.length) continue;
      const fungi_id = fRes.rows[0].id;

      for (const [lang, data] of Object.entries(dataMap)) {
        const mush = data.mushrooms[slug];
        if (!mush) continue;

        const name = mush.name || '';
        const tagline = mush.subtitle || '';
        const about = mush.detailed_data?.about || '';
        const usage = mush.detailed_data?.usage || '';
        const dosage = mush.detailed_data?.dosage || '';
        
        const benefits = JSON.stringify(mush.detailed_data?.benefits || []);
        const conditions = JSON.stringify(mush.detailed_data?.conditions || []);
        const contra = JSON.stringify(mush.detailed_data?.contraindications || []);
        
        let drRaw = mush.detailed_data?.doctor_consultation;
        if (!Array.isArray(drRaw)) drRaw = [drRaw].filter(Boolean);
        const dr = JSON.stringify(drRaw);

        await sql\
          INSERT INTO fungi_translations (
            fungi_id, language_code, name, tagline, about_this_mushroom, how_to_use, recommended_dosage,
            benefits_override, conditions_override, contraindications_override, doctor_consultations_override
          )
          VALUES (
            \, \, \, \, \, \, \,
            \, \, \, \
          )
          ON CONFLICT (fungi_id, language_code) DO UPDATE SET 
            name = EXCLUDED.name,
            tagline = EXCLUDED.tagline,
            about_this_mushroom = EXCLUDED.about_this_mushroom,
            how_to_use = EXCLUDED.how_to_use,
            recommended_dosage = EXCLUDED.recommended_dosage,
            benefits_override = EXCLUDED.benefits_override,
            conditions_override = EXCLUDED.conditions_override,
            contraindications_override = EXCLUDED.contraindications_override,
            doctor_consultations_override = EXCLUDED.doctor_consultations_override,
            updated_at = CURRENT_TIMESTAMP;
        \;
      }
    }
    res.status(200).json({ success: true, message: 'All 4 languages successfully seeded to Vercel Postgres.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
