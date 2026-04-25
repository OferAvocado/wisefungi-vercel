import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const { rows } = await sql.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          JOIN information_schema.referential_constraints AS rc
            ON tc.constraint_name = rc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'fungi';
    `);
    res.status(200).json({ foreign_keys: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
