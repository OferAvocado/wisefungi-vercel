import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

// This is a serverless function, we need to embed the data or find a way to read it.
// Since we can't easily read local files from Vercel Functions in production after build without 'fs' hacks,
// we'll just use a small script that the user can run locally if possible, 
// OR we'll embed the core restoration data here.

export default async function handler(req, res) {
  // Allow GET with secret for easier testing/restoration from browser
  let secret = req.body?.secret || req.query?.secret;
  
  if (secret !== 'wise-fungi-secret') return res.status(403).json({ error: 'Unauthorized' });

  try {
    console.log("Starting site-wide data restoration...");

    // 1. Reset Global UI (Design/Theme)
    await sql`DELETE FROM ui_translations WHERE lang = 'all' OR key IN ('globalTheme', 'customStyles');`;
    
    // 2. Restore core fungi metadata (featured images)
    const updates = [
      { slug: 'reishi', img: '/assets/reishi.png', name: 'ריישי (Reishi)', tagline: 'Ganoderma lucidum - פטריית האלמוות' },
      { slug: 'lions_mane', img: '/assets/lions_mane.png', name: "רעמת האריה (Lion's Mane)", tagline: 'Hericium erinaceus - מזון למוח' },
      { slug: 'cordyceps', img: '/assets/cordyceps.png', name: 'קורדיספס (Cordyceps)', tagline: 'Cordyceps militaris - פטריית האנרגיה' },
      { slug: 'chaga', img: '/assets/chaga.png', name: "צ'אגה (Chaga)", tagline: 'Inonotus obliquus - הזהב השחור' },
      { slug: 'turkey_tail', img: '/assets/turkey_tail.png', name: 'זנב התרנגול (Turkey Tail)', tagline: 'Trametes versicolor - מגן המערכת' },
      { slug: 'tremella', img: '/assets/tremella.png', name: 'טרמלה (Tremella)', tagline: 'Tremella fuciformis - פטריית היופי' }
    ];

    for (const update of updates) {
      await sql`UPDATE fungi SET featured_image = ${update.img} WHERE slug = ${update.slug};`;
      await sql`
        UPDATE fungi_translations 
        SET name = ${update.name}, tagline = ${update.tagline} 
        WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${update.slug}) AND language_code = 'he';
      `;
    }

    // 3. Re-seed default UI texts in Hebrew (original state)
    const uiDefaults = [
        { key: 'hero_title', val: 'פטריות מרפא מבוססות מחקר' },
        { key: 'hero_subtitle', val: 'גלו את כוחן של פטריות המרפא — מידע מדעי, שימוש נכון ועצות בטיחות לכל מצב.' }
    ];

    for (const ui of uiDefaults) {
        await sql`
            INSERT INTO ui_translations (key, value, lang) 
            VALUES (${ui.key}, ${ui.val}, 'he')
            ON CONFLICT (key, lang) DO UPDATE SET value = EXCLUDED.value;
        `;
    }

    res.status(200).json({ success: true, message: 'Site design and images restored to original state.' });
  } catch (error) {
    console.error('Restoration Error:', error);
    res.status(500).json({ error: error.message });
  }
}
