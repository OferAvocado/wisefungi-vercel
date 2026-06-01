const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Security check: Only allow admin
  const token = req.headers.authorization || '';
  if (token !== 'wise-fungi-secret') {
    return res.status(401).json({ error: 'Unauthorized admin access' });
  }

  try {
    const { timeframe = '7d' } = req.query;
    
    let timeInterval = '7 days';
    if (timeframe === '24h') timeInterval = '24 hours';
    if (timeframe === '30d') timeInterval = '30 days';
    
    const timeFilter = timeframe === 'all' 
      ? sql`1=1` 
      : sql`timestamp >= CURRENT_TIMESTAMP - ${timeInterval}::interval`;

    // 1. Total & Unique Visitors
    const visitorsResult = await sql`
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT visitor_hash) as unique_visitors
      FROM analytics_events
      WHERE ${timeFilter}
    `;

    // 2. Top Paths
    const pathsResult = await sql`
      SELECT 
        path,
        COUNT(*) as views
      FROM analytics_events
      WHERE ${timeFilter}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;

    // 3. Geographic Data (Top Countries)
    const geoResult = await sql`
      SELECT 
        country,
        COUNT(*) as visits
      FROM analytics_events
      WHERE ${timeFilter}
      GROUP BY country
      ORDER BY visits DESC
      LIMIT 10
    `;

    // 4. Time series data (for a chart)
    // Grouping by day (or hour if 24h)
    let seriesResult;
    if (timeframe === '24h') {
      seriesResult = await sql`
        SELECT 
          date_trunc('hour', timestamp) as time_bucket,
          COUNT(*) as visits
        FROM analytics_events
        WHERE ${timeFilter}
        GROUP BY time_bucket
        ORDER BY time_bucket ASC
      `;
    } else {
      seriesResult = await sql`
        SELECT 
          date_trunc('day', timestamp) as time_bucket,
          COUNT(*) as visits
        FROM analytics_events
        WHERE ${timeFilter}
        GROUP BY time_bucket
        ORDER BY time_bucket ASC
      `;
    }

    res.status(200).json({
      overview: visitorsResult.rows[0],
      topPaths: pathsResult.rows,
      geo: geoResult.rows,
      series: seriesResult.rows
    });

  } catch (error) {
    console.error('Analytics admin error:', error);
    res.status(500).json({ error: error.message });
  }
};
