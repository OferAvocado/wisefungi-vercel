import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = req.headers.authorization;
  if (auth !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  const { slug } = req.body;
  
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  try {
    // Delete from fungi table (cascades to translations)
    await sql`DELETE FROM fungi WHERE slug = ${slug};`;
    
    return res.status(200).json({ success: true, message: 'Fungi deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: error.message });
  }
}
