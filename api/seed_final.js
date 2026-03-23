import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const auth = req.headers.authorization;
  if (auth !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  const mushrooms = [
    {
        "benefits": ["חיזוק חזק של מערכת החיסון","תמיכה אונקולוגית משלימה (PSK/PSP)","איזון פלורת מעיים ומיקרוביום","נוגד חמצון חזק","הגנה מפני זיהומים ויראליים ובקטריאליים","וויסות דלקת ועיכול","תמיכה בהתאוששות אחרי טיפול אונקולוגי"],
        "conditions_treated": ["חיסון חלש","סרטן (תמיכה משלימה)","מחלות אוטואימוניות","מחלות חורף וזיהומים ויראליים","מעי רגיז (IBS)","מעי דליף","קרוהן","קוליטיס כיבית","צליאק ורגישות לגלוטן","פרקינסון","סוכרת סוג 1","דלקות בדרכי השתן","קנדידה","וסקוליטיס","HPV","עייפות קשורה לטיפול אונקולוגי"],
        "description": "זנב התרנגול (Trametes versicolor) היא אחת הפטריות הנחקרות ביותר בעולם. מכילה PSK ו-PSP, שני פוליסכרידים שהוכחו כיעילים בחיזוק מערכת החיסון.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה.",
        "name": "זנב התרנגול",
        "scientific_name": "Trametes versicolor",
        "slug": "turkey_tail",
        "image": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80",
        "keywords": ["חיסון","סרטן","immune","cancer","gut health", "иммунитет", "рак", "inmunidad", "cáncer", "PSK", "PSP"]
    },
    {
        "benefits": ["הגברת אנרגיה וחיוניות","שיפור ביצועים וסיבולת ספורטיביים","תמיכה בתפקוד הריאות וקליטת חמצן"],
        "description": "קורדיספס (Cordyceps militaris) היא פטרייה ייחודית הידועה ביכולתה להגביר אנרגיה ולשפר ביצועים ספורטיביים.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום.",
        "how_to_use": "מומלץ לקחת בבוקר על בטן ריקה.",
        "name": "קורדיספס",
        "scientific_name": "Cordyceps militaris",
        "slug": "cordyceps",
        "image": "https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=600&q=80",
        "keywords": ["אנרגיה","performance","energy","fatigue", "энергия", "спорты", "energía", "rendimiento", "ATP"]
    },
    {
        "benefits": ["לחות עור מעמיקה","עידוד ייצור קולגן","נוגד חמצון חזק"],
        "description": "טרמלה (Tremella fuciformis) נחשבת לבריאות העור ברפואה הסינית כבר מאות שנים.",
        "dosage": "500–1000 מ\"ג ביום.",
        "how_to_use": "מומלץ לקחת בבוקר או בערב.",
        "name": "טרמלה",
        "scientific_name": "Tremella fuciformis",
        "slug": "tremella",
        "image": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
        "keywords": ["עור","skin","collagen","beauty", "кожа", "красота", "piel", "belleza", "hidratación"]
    },
    {
        "benefits": ["שיפור איכות השינה","הפחתת לחץ וחרדה","חיזוק מערכת החיסון"],
        "description": "ריישי (Ganoderma lucidum), המכונה 'מלכת הפטריות', ידועה בתכונות מרגיעות עמוקות.",
        "dosage": "500–1000 מ\"ג ביום.",
        "how_to_use": "מומלץ לקחת בערב, כשעה לפני השינה.",
        "name": "ריישי",
        "scientific_name": "Ganoderma lucidum",
        "slug": "reishi",
        "image": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=600&q=80",
        "keywords": ["שינה","sleep","stress","anxiety", "сон", "стресс", "sueño", "estrés", "relajación"]
    },
    {
        "benefits": ["שיפור זיכרון וריכוז","עידוד ייצור NGF","תמיכה בשיקום עצבי"],
        "description": "רעמת האריה (Hericium erinaceus) ידועה בתכונותיה לתמיכה בתפקוד קוגניטיבי וריכוז.",
        "dosage": "500–1000 מ\"ג ביום.",
        "how_to_use": "מומלץ לקחת בבוקר על בטן ריקה.",
        "name": "רעמת האריה",
        "scientific_name": "Hericium erinaceus",
        "slug": "lions_mane",
        "image": "https://media.base44.com/images/public/69987acaab66604ab48d5f4d/fd00a63b9_1000183647-removebg-preview.png",
        "keywords": ["ריכוז","focus","memory","brain fog", "мозг", "память", "memoria", "concentración", "cerebro", "NGF"]
    },
    {
        "benefits": ["נוגד חמצון חזק ביותר","הפחתת דלקת מערכתית","וויסות רמות סוכר"],
        "description": "צ'אגה (Inonotus obliquus) מדורגת כאחד מהמזונות העשירים ביותר בנוגדי חמצון בעולם.",
        "dosage": "500–1000 מ\"ג ביום.",
        "how_to_use": "מומלץ לקחת בבוקר על בטן ריקה.",
        "name": "צ'אגה",
        "scientific_name": "Inonotus obliquus",
        "slug": "chaga",
        "image": "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=600&q=80",
        "keywords": ["דלקת","antioxidant","inflammation","sugar", "антиоксидант", "сахар", "antioxidante", "azúcar", "antiinflamatorio"]
    }
  ];

  try {
    // Force set defaults just in case they are missing on Vercel
    await sql`ALTER TABLE fungi ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE fungi ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;`;
    await sql`ALTER TABLE fungi ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;`;
    await sql`ALTER TABLE fungi_translations ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE fungi_translations ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;`;
    await sql`ALTER TABLE fungi_translations ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;`;

    for (const m of mushrooms) {
        // Upsert Fungi
        const fRes = await sql`
          INSERT INTO fungi (slug, scientific_name, featured_image, status)
          VALUES (${m.slug}, ${m.scientific_name}, ${m.image}, 'published')
          ON CONFLICT (slug) DO UPDATE SET 
            scientific_name = EXCLUDED.scientific_name,
            featured_image = EXCLUDED.featured_image,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id;
        `;
        const fId = fRes.rows[0].id;

        // Hebrew Translation
        await sql`
          INSERT INTO fungi_translations (fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage)
          VALUES (${fId}, 'he', ${m.name}, ${m.description}, ${m.how_to_use}, ${m.dosage})
          ON CONFLICT (fungi_id, language_code) DO UPDATE SET 
            name = EXCLUDED.name,
            about_this_mushroom = EXCLUDED.about_this_mushroom,
            how_to_use = EXCLUDED.how_to_use,
            recommended_dosage = EXCLUDED.recommended_dosage,
            updated_at = CURRENT_TIMESTAMP;
        `;

        // English Placeholder
        await sql`
          INSERT INTO fungi_translations (fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage)
          VALUES (${fId}, 'en', ${m.slug.replace('_', ' ').toUpperCase()}, 'Auto-generated En description', 'Usage instructions', 'Dosage info')
          ON CONFLICT (fungi_id, language_code) DO NOTHING;
        `;

        for (const kw of m.keywords) {
            await sql`
              INSERT INTO search_index (fungi_id, keyword, language_code, category)
              VALUES (${fId}, ${kw}, 'he', 'topic') ON CONFLICT DO NOTHING;
            `;
        }
    }

    res.status(200).json({ success: true, message: 'Fungi content updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
