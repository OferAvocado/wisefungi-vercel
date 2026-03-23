import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '../.env.development.local') });

// Helper to slugify
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

async function sync() {
  console.log('--- STARTING FULL SYNC ---');

  // 1. Load Translations Map
  const transSrc = fs.readFileSync(path.join(__dirname, '../context/Translation_export.csv'), 'utf8');
  const transRows = parse(transSrc, { columns: true });
  const labelMap = {}; // he_label -> { en, ru, es }
  
  transRows.forEach(row => {
    labelMap[row.he] = { en: row.en, ru: row.ru, es: row.es };
    if (row.key && row.key !== row.he) labelMap[row.key] = { en: row.en, ru: row.ru, es: row.es };
  });

  // 2. Load Mushrooms
  const mushSrc = fs.readFileSync(path.join(__dirname, '../context/Mushroom_export.csv'), 'utf8');
  const mushRows = parse(mushSrc, { columns: true });

  for (const mush of mushRows) {
    const slug = mush.scientific_name.toLowerCase().replace(/ /g, '_');
    console.log(`Processing: ${mush.name} (${slug})`);

    // Upsert Fungi
    const fRes = await sql`
      INSERT INTO fungi (slug, scientific_name, featured_image, status)
      VALUES (${slug}, ${mush.scientific_name}, ${mush.mushroom_image_url}, 'published')
      ON CONFLICT (slug) DO UPDATE SET 
        scientific_name = EXCLUDED.scientific_name,
        featured_image = EXCLUDED.featured_image,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;
    const fId = fRes.rows[0].id;

    // Upsert Translations
    const keywords = JSON.parse(mush.search_keywords || '[]');
    await sql`
      INSERT INTO fungi_translations (fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage, search_keywords)
      VALUES (${fId}, 'he', ${mush.name}, ${mush.description}, ${mush.how_to_use}, ${mush.dosage}, ${keywords})
      ON CONFLICT (fungi_id, language_code) DO UPDATE SET 
        name = EXCLUDED.name,
        about_this_mushroom = EXCLUDED.about_this_mushroom,
        how_to_use = EXCLUDED.how_to_use,
        recommended_dosage = EXCLUDED.recommended_dosage,
        search_keywords = EXCLUDED.search_keywords,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Process Benefits
    const benefits = JSON.parse(mush.benefits || '[]');
    for (const bLabelHe of benefits) {
      const bSlug = slugify(bLabelHe) || 'benefit_' + Math.random().toString(36).substr(2, 5);
      const bRes = await sql`
        INSERT INTO benefits (slug) VALUES (${bSlug}) ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
      `;
      const bId = bRes.rows[0].id;
      
      const t = labelMap[bLabelHe] || { en: bLabelHe, ru: bLabelHe, es: bLabelHe }; // Fallback to HE if no translation
      for (const lang of ['he', 'en', 'ru', 'es']) {
        const lbl = lang === 'he' ? bLabelHe : t[lang];
        await sql`
          INSERT INTO benefit_translations (benefit_id, language_code, label)
          VALUES (${bId}, ${lang}, ${lbl}) ON CONFLICT (benefit_id, language_code) DO UPDATE SET label = EXCLUDED.label;
        `;
      }
      await sql`INSERT INTO fungi_benefits (fungi_id, benefit_id) VALUES (${fId}, ${bId}) ON CONFLICT DO NOTHING;`;
    }

    // Process Conditions
    const conditions = JSON.parse(mush.conditions_treated || '[]');
    for (const cLabelHe of conditions) {
      const cSlug = slugify(cLabelHe) || 'cond_' + Math.random().toString(36).substr(2, 5);
      const cRes = await sql`
        INSERT INTO conditions (slug) VALUES (${cSlug}) ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
      `;
      const cId = cRes.rows[0].id;

      const t = labelMap[cLabelHe] || { en: cLabelHe, ru: cLabelHe, es: cLabelHe };
      for (const lang of ['he', 'en', 'ru', 'es']) {
        const lbl = lang === 'he' ? cLabelHe : t[lang];
        await sql`
          INSERT INTO condition_translations (condition_id, language_code, label)
          VALUES (${cId}, ${lang}, ${lbl}) ON CONFLICT (condition_id, language_code) DO UPDATE SET label = EXCLUDED.label;
        `;
      }
      await sql`INSERT INTO fungi_conditions (fungi_id, condition_id) VALUES (${fId}, ${cId}) ON CONFLICT DO NOTHING;`;
    }

    // Process Contraindications
    const contra = JSON.parse(mush.contraindications || '[]');
    for (const ctLabelHe of contra) {
      const ctSlug = slugify(ctLabelHe) || 'contra_' + Math.random().toString(36).substr(2, 5);
      const ctRes = await sql`
        INSERT INTO contraindications (slug) VALUES (${ctSlug}) ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
      `;
      const ctId = ctRes.rows[0].id;

      for (const lang of ['he', 'en', 'ru', 'es']) {
        await sql`
          INSERT INTO contraindication_translations (contraindication_id, language_code, label)
          VALUES (${ctId}, ${lang}, ${ctLabelHe}) ON CONFLICT (contraindication_id, language_code) DO UPDATE SET label = EXCLUDED.label;
        `;
      }
      await sql`INSERT INTO fungi_contraindications (fungi_id, contraindication_id) VALUES (${fId}, ${ctId}) ON CONFLICT DO NOTHING;`;
    }

    // Process Doctor Flags
    const doctor = JSON.parse(mush.doctor_consultation_cases || '[]');
    for (const dLabelHe of doctor) {
      const dSlug = slugify(dLabelHe) || 'doc_' + Math.random().toString(36).substr(2, 5);
      const dRes = await sql`
        INSERT INTO doctor_consult_flags (slug) VALUES (${dSlug}) ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
      `;
      const dId = dRes.rows[0].id;

      for (const lang of ['he', 'en', 'ru', 'es']) {
        await sql`
          INSERT INTO doctor_consult_flag_translations (doctor_consult_flag_id, language_code, label)
          VALUES (${dId}, ${lang}, ${dLabelHe}) ON CONFLICT (doctor_consult_flag_id, language_code) DO UPDATE SET label = EXCLUDED.label;
        `;
      }
      await sql`INSERT INTO fungi_doctor_consult_flags (fungi_id, doctor_consult_flag_id) VALUES (${fId}, ${dId}) ON CONFLICT DO NOTHING;`;
    }
  }

  console.log('--- SYNC COMPLETED ---');
}

sync().catch(err => {
  console.error('Sync Error:', err);
  process.exit(1);
});
