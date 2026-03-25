import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Use a different secret or check for it in multiple ways
  const secret = req.query.secret || req.body?.secret;
  if (secret !== 'wise-fungi-secret') {
    return res.status(403).json({ error: 'Unauthorized', message: 'Provide secret in query or body' });
  }

  try {
    console.log("CRITICAL: Starting Emergency DB Restoration...");

    // 1. CLEAR UI OVERRIDES
    console.log("Clearing UI translations...");
    await sql`DELETE FROM ui_translations WHERE lang = 'all' OR key IN ('globalTheme', 'customStyles');`;

    // 2. RESTORE MUSHROOM METADATA & HEBREW INFO
    // These are the DRAWING-STYLE images from /public/assets/
    const originalMushrooms = [
      { slug: 'reishi', img: '/assets/reishi.png', name: 'ריישי (Reishi)', tagline: 'Ganoderma lucidum - פטריית האלמוות' },
      { slug: 'lions_mane', img: '/assets/lions_mane.png', name: "רעמת האריה (Lion's Mane)", tagline: 'Hericium erinaceus - מזון למוח' },
      { slug: 'cordyceps', img: '/assets/cordyceps.png', name: 'קורדיספס (Cordyceps)', tagline: 'Cordyceps militaris - פטריית האנרגיה' },
      { slug: 'chaga', img: '/assets/chaga.png', name: "צ'אגה (Chaga)", tagline: 'Inonotus obliquus - הזהב השחור' },
      { slug: 'turkey_tail', img: '/assets/turkey_tail.png', name: 'זנב התרנגול (Turkey Tail)', tagline: 'Trametes versicolor - מגן המערכת' },
      { slug: 'tremella', img: '/assets/tremella.png', name: 'טרמלה (Tremella)', tagline: 'Tremella fuciformis - פטריית היופי' }
    ];

    for (const mush of originalMushrooms) {
      console.log(`Restoring ${mush.slug}...`);
      
      // Update featured image
      await sql`UPDATE fungi SET featured_image = ${mush.img} WHERE slug = ${mush.slug};`;

      // Update basic info in Hebrew
      await sql`
        UPDATE fungi_translations 
        SET name = ${mush.name}, tagline = ${mush.tagline} 
        WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${mush.slug}) AND language_code = 'he';
      `;
      
      // Clear external-sourced benefits/conditions that might be incorrect
      // Note: We are keeping the IDs, but updating the translated strings if they were changed
    }

    // 3. Restore Search Index entries (optional but good)
    
    return res.status(200).json({ 
      success: true, 
      message: 'SUCCESS: Site design and original images have been restored in the database.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('CRITICAL Restoration Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Restoration failed', 
      details: error.message 
    });
  }
}
