import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Security check: Only allow admin
  const token = req.headers.authorization || '';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'wise-fungi-secret';

  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized admin access' });
  }

  try {
    const { timeframe = '7d', startDate, endDate } = req.query;
    
    let start = new Date();
    let end = new Date();

    if (timeframe === '24h') {
      start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (timeframe === '7d') {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30d') {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'ytd') {
      start = new Date(new Date().getFullYear(), 0, 1);
    } else if (timeframe === 'all') {
      start = new Date(0); // Epoch start
    } else if (timeframe === 'custom') {
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required for custom timeframe' });
      }
      
      start = new Date(startDate);
      // If the user selects a date (e.g. 2026-06-01), make it start at midnight local time
      start.setHours(0, 0, 0, 0);

      end = new Date(endDate);
      // Make end date cover the entire day (up to 23:59:59.999)
      end.setHours(23, 59, 59, 999);
    } else {
      // Default fallback: 7 days
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    // 1. Total & Unique Visitors & Average Duration
    const visitorsResult = await sql`
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT visitor_hash) as unique_visitors,
        COALESCE(AVG(duration), 0) as avg_duration
      FROM analytics_events
      WHERE timestamp >= ${startISO} AND timestamp <= ${endISO}
    `;

    // 2. Top Paths
    const pathsResult = await sql`
      SELECT 
        path,
        COUNT(*) as views
      FROM analytics_events
      WHERE timestamp >= ${startISO} AND timestamp <= ${endISO}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `;

    // 3. Geographic Data (All countries with visits inside timeframe)
    const geoResult = await sql`
      SELECT 
        country,
        COUNT(*) as visits
      FROM analytics_events
      WHERE timestamp >= ${startISO} AND timestamp <= ${endISO}
      GROUP BY country
      ORDER BY visits DESC
      LIMIT 250
    `;

    // 4. Time series data (for the chart)
    const durationMs = end.getTime() - start.getTime();
    const useHourBucket = durationMs <= 36 * 60 * 60 * 1000;
    const bucket = useHourBucket ? 'hour' : 'day';

    const seriesResult = await sql`
      SELECT 
        date_trunc(${bucket}, timestamp) as time_bucket,
        COUNT(*) as visits
      FROM analytics_events
      WHERE timestamp >= ${startISO} AND timestamp <= ${endISO}
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `;

    res.status(200).json({
      overview: {
        total_visits: parseInt(visitorsResult.rows[0]?.total_visits || 0, 10),
        unique_visitors: parseInt(visitorsResult.rows[0]?.unique_visitors || 0, 10),
        avg_duration: Math.round(parseFloat(visitorsResult.rows[0]?.avg_duration || 0))
      },
      topPaths: pathsResult.rows,
      geo: geoResult.rows,
      series: seriesResult.rows.map(row => ({
        time_bucket: row.time_bucket,
        visits: parseInt(row.visits || 0, 10)
      }))
    });

  } catch (error) {
    console.error('Analytics admin error:', error);
    res.status(500).json({ error: error.message });
  }
}
