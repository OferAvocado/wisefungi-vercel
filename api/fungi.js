import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Allow cross-origin requests for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Expect standard ISO lang code or fallback to 'he'
  const lang = req.query.lang || 'he';

  try {
    // Single powerful aggregated query hitting the normalized new Vercel DB Architecture
    const { rows } = await sql`
      SELECT 
        f.id,
        f.slug,
        f.scientific_name,
        f.featured_image,
        ft.name,
        ft.about_this_mushroom AS about,
        ft.how_to_use AS usage,
        ft.recommended_dosage AS dosage,
        ft.search_keywords,
        ft.search_aliases,
        
        (
          SELECT json_agg(ct.label) 
          FROM fungi_conditions fc
          JOIN conditions c ON fc.condition_id = c.id
          JOIN condition_translations ct ON c.id = ct.condition_id AND ct.language_code = ${lang}::language_enum
          WHERE fc.fungi_id = f.id AND c.status = 'active'
        ) AS conditions,
        
        (
          SELECT json_agg(bt.label) 
          FROM fungi_benefits fb
          JOIN benefits b ON fb.benefit_id = b.id
          JOIN benefit_translations bt ON b.id = bt.benefit_id AND bt.language_code = ${lang}::language_enum
          WHERE fb.fungi_id = f.id AND b.status = 'active'
        ) AS benefits,

        (
          SELECT json_agg(cnt.label) 
          FROM fungi_contraindications fcon
          JOIN contraindications con ON fcon.contraindication_id = con.id
          JOIN contraindication_translations cnt ON con.id = cnt.contraindication_id AND cnt.language_code = ${lang}::language_enum
          WHERE fcon.fungi_id = f.id AND con.status = 'active'
        ) AS contraindications,

        (
          SELECT json_agg(dct.label) 
          FROM fungi_doctor_consult_flags fdc
          JOIN doctor_consult_flags dc ON fdc.doctor_consult_flag_id = dc.id
          JOIN doctor_consult_flag_translations dct ON dc.id = dct.doctor_consult_flag_id AND dct.language_code = ${lang}::language_enum
          WHERE fdc.fungi_id = f.id AND dc.status = 'active'
        ) AS doctor_consultations

      FROM fungi f
      JOIN fungi_translations ft ON f.id = ft.fungi_id
      WHERE f.status != 'archived' AND ft.language_code = ${lang}::language_enum
      ORDER BY f.sort_order ASC;
    `;

    // Map the database rows to the exact structure the React UI expects (1-to-1 parity)
    let mushroomsObj = {};
    rows.forEach(row => {
      mushroomsObj[row.slug] = {
        name: row.name,
        subtitle: row.scientific_name,
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
