import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Security check: Only allow admin to run setup
  const token = req.headers.authorization || '';
  if (token !== 'wise-fungi-secret') {
    return res.status(401).json({ error: 'Unauthorized setup attempt' });
  }

  try {
    // Create analytics_events table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        path VARCHAR(500) NOT NULL,
        country VARCHAR(100),
        visitor_hash VARCHAR(64) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp DESC);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_events(path);
    `;

    res.status(200).json({ message: 'Analytics tables created successfully' });
  } catch (error) {
    console.error('Analytics setup error:', error);
    res.status(500).json({ error: error.message });
  }
}
