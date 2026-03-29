import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Disable caching for ALL requests to ensure admin actions are reflected immediately
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Debug-Handler-Method', req.method);

  // Allow cross-origin requests for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- CRITICAL ACTION HANDLER ---
  if (req.method === 'POST') {
    res.setHeader('X-Debug-Action', 'hit');
    const auth = req.headers.authorization;
    if (auth !== 'wise-fungi-secret') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, slug } = req.body;
    
    if (action === 'delete') {
      try {
        await sql`DELETE FROM fungi WHERE slug = ${slug};`;
        return res.status(200).json({ success: true, message: `Fungi ${slug} deleted successfully` });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
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
        return res.status(200).json({ success: true, message: 'Cascades repaired successfully.' });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
    
    return res.status(400).json({ error: 'Invalid action' });
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
        
        (
          SELECT json_agg(ct.label) 
          FROM fungi_conditions fc
          JOIN conditions c ON fc.condition_id = c.id
          JOIN condition_translations ct ON c.id = ct.condition_id AND ct.language_code = ${lang}
          WHERE fc.fungi_id = f.id AND c.status = 'active'
        ) AS conditions,
        
        (
          SELECT json_agg(bt.label) 
          FROM fungi_benefits fb
          JOIN benefits b ON fb.benefit_id = b.id
          JOIN benefit_translations bt ON b.id = bt.benefit_id AND bt.language_code = ${lang}
          WHERE fb.fungi_id = f.id AND b.status = 'active'
        ) AS benefits,

        (
          SELECT json_agg(cnt.label) 
          FROM fungi_contraindications fcon
          JOIN contraindications con ON fcon.contraindication_id = con.id
          JOIN contraindication_translations cnt ON con.id = cnt.contraindication_id AND cnt.language_code = ${lang}
          WHERE fcon.fungi_id = f.id AND con.status = 'active'
        ) AS contraindications,

        (
          SELECT json_agg(dct.label) 
          FROM fungi_doctor_consult_flags fdc
          JOIN doctor_consult_flags dc ON fdc.doctor_consult_flag_id = dc.id
          JOIN doctor_consult_flag_translations dct ON dc.id = dct.doctor_consult_flag_id AND dct.language_code = ${lang}
          WHERE fdc.fungi_id = f.id AND dc.status = 'active'
        ) AS doctor_consultations

      FROM fungi f
      JOIN fungi_translations ft ON f.id = ft.fungi_id
      WHERE f.status != 'archived' AND ft.language_code = ${lang}
      ORDER BY f.sort_order ASC;
    `;

    // Map the database rows to the exact structure the React UI expects (1-to-1 parity)
    let mushroomsObj = {};
    rows.forEach(row => {
      mushroomsObj[row.slug] = {
        name: row.name,
        subtitle: row.tagline || row.scientific_name,
        image: row.featured_image,
        keywords: row.search_keywords || [],
        detailed_data: {
          about: row.about,
          benefits: row.benefits || [],
          conditions: row.conditions || [],
          usage: row.usage,
          dosage: row.dosage,
          contraindications: row.contraindications || [],
          doctor_consultation: row.doctor_consultations ? row.doctor_consultations.join('. ') : ''
        }
      };
    });

    res.status(200).json(mushroomsObj);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Database Error', details: error.message });
  }
}
