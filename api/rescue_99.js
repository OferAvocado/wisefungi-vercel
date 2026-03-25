import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    console.log('RESCUE_99: Starting DB Restoration...');
    
    // We are restoring the HEBREW data and ORIGINAL images (/assets/)
    // This will definitely remove the burgers!
    const originalMushrooms = [
      { slug: 'reishi', img: '/assets/reishi.png', name: 'ריישי (Reishi)', tagline: 'Ganoderma lucidum - פטריית האלמוות' },
      { slug: 'lions_mane', img: '/assets/lions_mane.png', name: "רעמת האריה (Lion's Mane)", tagline: 'Hericium erinaceus - מזון למוח' },
      { slug: 'cordyceps', img: '/assets/cordyceps.png', name: 'קורדיספס (Cordyceps)', tagline: 'Cordyceps militaris - פטריית האנרגיה' },
      { slug: 'chaga', img: '/assets/chaga.png', name: "צ'אגה (Chaga)", tagline: 'Inonotus obliquus - הזהב השחור' },
      { slug: 'turkey_tail', img: '/assets/turkey_tail.png', name: 'זנב התרנגול (Turkey Tail)', tagline: 'Trametes versicolor - מגן המערכת' },
      { slug: 'tremella', img: '/assets/tremella.png', name: 'טרמלה (Tremella)', tagline: 'Tremella fuciformis - פטריית היופי' }
    ];

    for (const mush of originalMushrooms) {
      await sql`UPDATE fungi SET featured_image = ${mush.img} WHERE slug = ${mush.slug};`;
      await sql`
        UPDATE fungi_translations 
        SET name = ${mush.name}, tagline = ${mush.tagline} 
        WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${mush.slug}) AND language_code = 'he';
      `;
    }

    // Reset UI Overrides
    await sql`DELETE FROM ui_translations WHERE lang = 'all' OR key IN ('globalTheme', 'customStyles');`;

    res.status(200).json({ success: true, message: 'RESCUE SUCCESS: Site design and images restored in DB.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
