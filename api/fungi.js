import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Use manual URL parsing for maximum compatibility across environments
  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  const action = fullUrl.searchParams.get('action') || (req.body ? req.body.action : null);
  const slug = fullUrl.searchParams.get('slug') || (req.body ? req.body.slug : null);
  const secret = fullUrl.searchParams.get('secret') || req.headers.authorization;

  if (action && secret === 'wise-fungi-secret') {
    if (action === 'update' && slug) {
      try {
        const { lang, data } = req.body;
        await sql`
          UPDATE fungi_translations 
          SET 
            name = ${data.name}, tagline = ${data.subtitle}, about_this_mushroom = ${data.about},
            how_to_use = ${data.usage}, recommended_dosage = ${data.dosage},
            search_keywords = ${data.keywords || null}, 
            benefits_override = ${data.benefits ? JSON.stringify(data.benefits) : null},
            conditions_override = ${data.conditions ? JSON.stringify(data.conditions) : null},
            contraindications_override = ${data.contraindications ? JSON.stringify(data.contraindications) : null},
            doctor_consultations_override = ${data.doctor_consultation ? JSON.stringify(data.doctor_consultation) : null},
            updated_at = CURRENT_TIMESTAMP
          WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${slug}) AND language_code = ${lang};
        `;
        if (data.image) {
          await sql`UPDATE fungi SET featured_image = ${data.image} WHERE slug = ${slug}`;
        }

        if (data.interactions) {
          const intStr = JSON.stringify(data.interactions);
          await sql`
            INSERT INTO ui_translations (key, lang, value) VALUES (${'int_' + slug}, 'all', ${intStr})
            ON CONFLICT (key, lang) DO UPDATE SET value = EXCLUDED.value;
          `;
        }
        return res.status(200).json({ success: true, message: 'Updated successfully' });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
    if (action === 'update_ui') {
      try {
        const { lang, data } = req.body;
        for (const [key, value] of Object.entries(data)) {
          let strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
          await sql`
            INSERT INTO ui_translations (key, lang, value) VALUES (${key}, ${lang}, ${strVal})
            ON CONFLICT (key, lang) DO UPDATE SET value = EXCLUDED.value;
          `;
        }
        return res.status(200).json({ success: true });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
    if (action === 'delete' && slug) {
      try {
        await sql`DELETE FROM fungi WHERE slug = ${slug};`;
        return res.status(200).json({ success: true, message: `Fungi ${slug} deleted successfully` });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
    if (action === 'repair_cascades') {
      try {
        const repairTable = async (tableName, fkColumn, targetTable) => {
          const { rows } = await sql.query(`SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = '${tableName}' AND column_name = '${fkColumn}';`);
          if (rows.length > 0) { await sql.query(`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS "${rows[0].constraint_name}";`); }
          await sql.query(`ALTER TABLE ${tableName} ADD CONSTRAINT "${tableName}_${fkColumn}_fkey" FOREIGN KEY ("${fkColumn}") REFERENCES ${targetTable}(id) ON DELETE CASCADE;`);
        };
        await repairTable('fungi_translations', 'fungi_id', 'fungi');
        await repairTable('fungi_benefits', 'fungi_id', 'fungi');
        await repairTable('fungi_conditions', 'fungi_id', 'fungi');
        await repairTable('fungi_contraindications', 'fungi_id', 'fungi');
        await repairTable('fungi_doctor_consult_flags', 'fungi_id', 'fungi');
        await repairTable('fungi_interactions', 'fungi_id', 'fungi');
        return res.status(200).json({ success: true, message: 'Cascades repaired' });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
    if (action === 'migrate_v2') {
      try {
        await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS contraindications_override JSONB;`;
        await sql`ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS doctor_consultations_override TEXT;`;
        return res.status(200).json({ success: true, message: 'Schema migrated successfully' });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
  }

  // --- STANDARD SETUP (Only reach here if no action taken) ---
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Expect standard ISO lang code or fallback to 'he'
  const lang = req.query.lang || 'he';
  const restoreSecret = req.query.restoreSecret;

  if (req.query.restore === 'true' && restoreSecret === 'wise-fungi-secret') {
    try {
      // 1. Reset Global UI (Design/Theme)
      await sql`DELETE FROM ui_translations WHERE lang = 'all' OR key IN ('globalTheme', 'customStyles');`;
      
      // 2. Restore core fungi metadata (featured images)
      const updates = [
        { slug: 'reishi', img: '/assets/reishi.png', name: 'ריישי (Reishi)', tagline: 'Ganoderma lucidum - פטריית האלמוות' },
        { slug: 'lions_mane', img: '/assets/lions_mane.png', name: "רעמת האריה (Lion's Mane)", tagline: 'Hericium erinaceus - מזון למוח' },
        { slug: 'cordyceps', img: '/assets/cordyceps.png', name: 'קורדיספס (Cordyceps)', tagline: 'Cordyceps militaris - פטריית האנרגיה' },
        { slug: 'chaga', img: '/assets/chaga.png', name: "צ'אגה (Chaga)", tagline: 'Inonotus obliquus - הזהב השחור' },
        { slug: 'turkey_tail', img: '/assets/turkey_tail.png', name: 'זנב התרנגול (Turkey Tail)', tagline: 'Trametes versicolor - מגן המערכת' },
        { slug: 'tremella', img: '/assets/tremella.png', name: 'טרמלה (Tremella)', tagline: 'Tremella fuciformis - פטריית היופי' }
      ];

      for (const update of updates) {
        await sql`UPDATE fungi SET featured_image = ${update.img} WHERE slug = ${update.slug};`;
        await sql`UPDATE fungi_translations SET name = ${update.name}, tagline = ${update.tagline} WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${update.slug}) AND language_code = 'he';`;
      }

      return res.status(200).json({ success: true, message: 'Emergency restoration triggered successfully.' });
    } catch (e) {
      return res.status(500).json({ error: 'Restoration failed', details: e.message });
    }
  }

  try {
    // Single powerful aggregated query hitting the normalized new Vercel DB Architecture
    const { rows } = await sql`
      SELECT 
        f.id,
        f.slug,
        f.scientific_name,
        f.featured_image,
        ft.name,
        ft.tagline,
        ft.about_this_mushroom AS about,
        ft.how_to_use AS usage,
        ft.recommended_dosage AS dosage,
        ft.search_keywords,
        ft.search_aliases,
        
        COALESCE(
          ft.conditions_override,
          (
            SELECT json_agg(ct.label)::jsonb 
            FROM fungi_conditions fc
            JOIN conditions c ON fc.condition_id = c.id
            JOIN condition_translations ct ON c.id = ct.condition_id AND ct.language_code = ${lang}
            WHERE fc.fungi_id = f.id AND c.status = 'active'
          )
        ) AS conditions,
        
        COALESCE(
          ft.benefits_override,
          (
            SELECT json_agg(bt.label)::jsonb 
            FROM fungi_benefits fb
            JOIN benefits b ON fb.benefit_id = b.id
            JOIN benefit_translations bt ON b.id = bt.benefit_id AND bt.language_code = ${lang}
            WHERE fb.fungi_id = f.id AND b.status = 'active'
          )
        ) AS benefits,

        COALESCE(
          ft.contraindications_override,
          (
            SELECT json_agg(cnt.label)::jsonb 
            FROM fungi_contraindications fcon
            JOIN contraindications con ON fcon.contraindication_id = con.id
            JOIN contraindication_translations cnt ON con.id = cnt.contraindication_id AND cnt.language_code = ${lang}
            WHERE fcon.fungi_id = f.id AND con.status = 'active'
          )
        ) AS contraindications,

        COALESCE(
          ft.doctor_consultations_override,
          (
            SELECT json_agg(dct.label)::jsonb 
            FROM fungi_doctor_consult_flags fdc
            JOIN doctor_consult_flags dc ON fdc.doctor_consult_flag_id = dc.id
            JOIN doctor_consult_flag_translations dct ON dc.id = dct.doctor_consult_flag_id AND dct.language_code = ${lang}
            WHERE fdc.fungi_id = f.id AND dc.status = 'active'
          )
        ) AS doctor_consultations

      FROM fungi f
      JOIN fungi_translations ft ON f.id = ft.fungi_id
      WHERE f.status != 'archived' AND ft.language_code = ${lang}
      ORDER BY f.sort_order ASC;
    `;

    // Map the database rows to the exact structure the React UI expects (1-to-1 parity)
    let mushroomsObj = {};
    rows.forEach(row => {
      let docCons = row.doctor_consultations || [];
      // Handle cases where it might be a JSON string from the override
      if (typeof docCons === 'string') {
        try { docCons = JSON.parse(docCons); } catch(e) { docCons = [docCons]; }
      }
      
      mushroomsObj[row.slug] = {
        id: row.slug,
        name: row.name,
        subtitle: row.scientific_name,
        scientific_name: row.scientific_name,
        image: row.featured_image,
        keywords: row.search_keywords || [],
        detailed_data: {
          about: row.about,
          benefits: row.benefits || [],
          conditions: row.conditions || [],
          usage: row.usage,
          dosage: row.dosage,
          contraindications: row.contraindications || [],
          doctor_consultation: Array.isArray(docCons) ? docCons.join('. ') : String(docCons),
          detail_image: row.featured_image
        }
      };
    });

    res.status(200).json(mushroomsObj);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Database Error', details: error.message });
  }
}
