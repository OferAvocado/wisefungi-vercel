import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Allow cross-origin requests for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const lang = req.query.lang || 'he';
  const fungiSlug = req.query.fungiSlug;

  try {
    let resultRows;

    if (fungiSlug) {
      // Return specific mushroom interactions joined securely
      const { rows } = await sql`
        SELECT 
          ii.slug,
          ii.interaction_type,
          ii.target_type,
          ii.evidence_level,
          iit.label,
          iit.short_description AS description,
          iit.details,
          fi.custom_note
        FROM fungi_interactions fi
        JOIN fungi f ON fi.fungi_id = f.id
        JOIN interaction_items ii ON fi.interaction_item_id = ii.id
        JOIN interaction_item_translations iit ON ii.id = iit.interaction_item_id AND iit.language_code = ${lang}::language_enum
        WHERE f.slug = ${fungiSlug} AND ii.status = 'active'
        ORDER BY fi.sort_order ASC;
      `;
      resultRows = rows;
    } else {
      // General interactions dictionary
      const { rows } = await sql`
        SELECT 
          ii.slug,
          ii.interaction_type,
          ii.target_type,
          ii.evidence_level,
          iit.label,
          iit.short_description AS description
        FROM interaction_items ii
        JOIN interaction_item_translations iit ON ii.id = iit.interaction_item_id AND iit.language_code = ${lang}::language_enum
        WHERE ii.status = 'active'
        ORDER BY ii.sort_order ASC;
      `;
      resultRows = rows;
    }

    res.status(200).json(resultRows);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Database Error' });
  }
}
