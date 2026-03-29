import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  const { action, slug } = req.body;

  try {
    if (action === 'delete') {
      console.log(`Deleting mushroom: ${slug}`);
      await sql`DELETE FROM fungi WHERE slug = ${slug};`;
      return res.status(200).json({ success: true, message: `Deleted ${slug}` });
    }
    
    if (action === 'repair') {
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
      return res.status(200).json({ success: true, message: 'Cascades Repaired' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Manager Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
