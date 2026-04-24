import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (secret !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Delete only the ones that are NOT the correct 6 slugs
    const { rowCount } = await sql`
      DELETE FROM fungi 
      WHERE slug NOT IN ('reishi', 'lions_mane', 'cordyceps', 'chaga', 'turkey_tail', 'tremella');
    `;
    
    return res.status(200).json({ success: true, message: `Deleted ${rowCount} extra mushrooms. Now maintaining only core 6.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
