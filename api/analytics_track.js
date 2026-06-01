const { sql } = require('@vercel/postgres');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const { path } = req.body || {};
    if (!path) {
      return res.status(400).end();
    }

    // Extract headers (Vercel specific)
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown';
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Ignore bots
    if (/bot|crawler|spider|crawling/i.test(userAgent)) {
      return res.status(204).end(); // Silent ignore
    }

    // Privacy-focused daily hash: salt changes every day so it can't track cross-day sessions,
    // but tracks unique visitors within a 24-hour window perfectly.
    const dateSalt = new Date().toISOString().split('T')[0];
    const visitorHash = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}-${dateSalt}-wise-fungi`)
      .digest('hex');

    // Fire & Forget Insertion (don't await it to save latency, but since Vercel functions
    // suspend after response, we must await it. We keep it as fast as possible.)
    await sql`
      INSERT INTO analytics_events (event_type, path, country, visitor_hash)
      VALUES ('page_view', ${path}, ${country}, ${visitorHash})
    `;

    return res.status(204).end(); // 204 No Content for max performance
  } catch (error) {
    // Fail silently so we don't break the client
    console.error('Analytics tracking error:', error);
    return res.status(204).end();
  }
};
