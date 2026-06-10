import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const { id, path, duration = 0 } = req.body || {};
    if (!path || !id) {
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
      INSERT INTO analytics_events (id, event_type, path, country, visitor_hash, duration)
      VALUES (${id}, 'page_view', ${path}, ${country}, ${visitorHash}, ${duration})
      ON CONFLICT (id) DO UPDATE SET duration = EXCLUDED.duration
    `;

    return res.status(204).end(); // 204 No Content for max performance
  } catch (error) {
    // Fail silently so we don't break the client
    console.error('Analytics tracking error:', error);
    return res.status(204).end();
  }
}
