import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Allow cross-origin requests for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Ensure reviews table exists
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'אנונימי',
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Auto-seed if empty
    const { rows: countRows } = await sql`SELECT COUNT(*) FROM reviews;`;
    const count = parseInt(countRows[0].count, 10);
    
    if (count === 0) {
      const defaultReviews = [
        {
          name: 'ניקולטה',
          rating: 5,
          comment: 'אתר מטורף מדהים כמה מפורט ונוח לשימוש איזה כיף שיש אתר ישראלי אותנטי כזה הבנתי שבנוסף יש קבוצה בווצאפ להסברה על הפטריות ועל שימוש נכון מדהים ממליצה ממש !'
        }
      ];

      for (const r of defaultReviews) {
        await sql`
          INSERT INTO reviews (name, rating, comment, created_at)
          VALUES (${r.name}, ${r.rating}, ${r.comment}, NOW());
        `;
      }
    }

    // 3. Handle GET: retrieve last 4 reviews
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, name, rating, comment, created_at 
        FROM reviews 
        ORDER BY created_at DESC 
        LIMIT 4;
      `;
      return res.status(200).json(rows);
    }

    // 4. Handle POST: add, delete, or update reviews
    if (req.method === 'POST') {
      const { action, id, name, rating, comment, secret } = req.body || {};

      // Admin Actions (requires secret verification)
      if (action && (secret === 'wise-fungi-secret' || req.headers.authorization === 'wise-fungi-secret')) {
        if (action === 'delete') {
          if (!id) {
            return res.status(400).json({ error: 'Missing review ID' });
          }
          await sql`DELETE FROM reviews WHERE id = ${id};`;
          return res.status(200).json({ success: true, message: 'Review deleted successfully' });
        }
        
        if (action === 'update') {
          if (!id) {
            return res.status(400).json({ error: 'Missing review ID' });
          }
          const score = parseInt(rating, 10);
          if (isNaN(score) || score < 1 || score > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
          }
          if (!comment || !comment.trim()) {
            return res.status(400).json({ error: 'Comment must not be empty' });
          }
          await sql`
            UPDATE reviews 
            SET name = ${name || 'אנונימי'}, rating = ${score}, comment = ${comment.trim()} 
            WHERE id = ${id};
          `;
          return res.status(200).json({ success: true, message: 'Review updated successfully' });
        }
      }

      const reviewerName = name && name.trim() ? name.trim() : 'אנונימי';
      const score = parseInt(rating, 10);
      const text = comment ? comment.trim() : '';

      if (isNaN(score) || score < 1 || score > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      if (!text) {
        return res.status(400).json({ error: 'Comment must not be empty' });
      }

      await sql`
        INSERT INTO reviews (name, rating, comment)
        VALUES (${reviewerName}, ${score}, ${text});
      `;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Reviews API error:', err);
    return res.status(500).json({ error: 'Internal Database Error', details: err.message });
  }
}
