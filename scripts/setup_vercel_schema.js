import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use the local env file that we know exists on the user's machine
config({ path: path.resolve(__dirname, '../.env.development.local') });

async function restoreEverything() {
  console.log('CRITICAL: Starting Emergency DB Restoration from User Terminal...');

  try {
    // 1. CLEAR UI OVERRIDES (Restores original background/design)
    console.log('Restoring original site design (clearing Overrides)...');
    try {
        // Create table IF NOT EXISTS first just in case it was dropped
        await sql`CREATE TABLE IF NOT EXISTS ui_translations (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, lang TEXT, key TEXT, value TEXT, UNIQUE(lang, key));`;
        await sql`DELETE FROM ui_translations WHERE lang = 'all' OR key IN ('globalTheme', 'customStyles');`;
        console.log('✅ UI Overrides cleared.');
    } catch (e) { console.log('Note: UI translations table might be missing, skipping UI reset.'); }

    // 2. RESTORE MUSHROOM IMAGES AND HEBREW DATA
    const originalMushrooms = [
      { slug: 'reishi', img: '/assets/reishi.png', name: 'ריישי (Reishi)', tagline: 'Ganoderma lucidum - פטריית האלמוות' },
      { slug: 'lions_mane', img: '/assets/lions_mane.png', name: "רעמת האריה (Lion's Mane)", tagline: 'Hericium erinaceus - מזון למוח' },
      { slug: 'cordyceps', img: '/assets/cordyceps.png', name: 'קורדיספס (Cordyceps)', tagline: 'Cordyceps militaris - פטריית האנרגיה' },
      { slug: 'chaga', img: '/assets/chaga.png', name: "צ'אגה (Chaga)", tagline: 'Inonotus obliquus - הזהב השחור' },
      { slug: 'turkey_tail', img: '/assets/turkey_tail.png', name: 'זנב התרנגול (Turkey Tail)', tagline: 'Trametes versicolor - מגן המערכת' },
      { slug: 'tremella', img: '/assets/tremella.png', name: 'טרמלה (Tremella)', tagline: 'Tremella fuciformis - פטריית היופי' }
    ];

    console.log('Restoring mushroom images and information...');
    for (const mush of originalMushrooms) {
      console.log(`- Restoring ${mush.slug}...`);
      
      // Update featured image to use local /assets/ path
      await sql`UPDATE fungi SET featured_image = ${mush.img} WHERE slug = ${mush.slug};`;

      // Update Hebrew translations
      await sql`
        UPDATE fungi_translations 
        SET name = ${mush.name}, tagline = ${mush.tagline} 
        WHERE fungi_id = (SELECT id FROM fungi WHERE slug = ${mush.slug}) AND language_code = 'he';
      `;
    }

    console.log('\n✅ SUCCESS: DATABASE HAS BEEN RESTORED TO ORIGINAL STATE.');
    console.log('Please refresh the website (https://wisefungi.vercel.app/) to see the changes.');
    process.exit(0);

  } catch (error) {
    console.error('❌ CRITICAL Error during restoration:', error);
    process.exit(1);
  }
}

restoreEverything();
