import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const auth = req.headers.authorization;
  if (auth !== 'wise-fungi-secret') return res.status(401).json({ error: 'Unauthorized' });

  const mushrooms = [
    {
        "name": "זנב התרנגול",
        "scientific_name": "Trametes versicolor",
        "description": "זנב התרנגול (Trametes versicolor) היא אחת הפטריות הנחקרות ביותר בעולם. מכילה PSK ו-PSP, שני פוליסכרידים שהוכחו כיעילים בחיזוק מערכת החיסון. ביפן משמשת כתוספת מאושרת לטיפול בסרטן על ידי המשרד לבריאות במשך דשרות. תומכת במיקרוביום המעיים, מגנה מפני זיהומים ומווסת החיסון גם במקרים של דיכוי או חיסון חלש.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80",
        "tagline": "מגן החיסון - לחיזוק מקסימלי",
        "benefits": ["חיזוק חזק של מערכת החיסון","תמיכה אונקולוגית משלימה","איזון פלורת מעיים","נוגד חמצון חזק","הגנה מפני זיהומים","וויסות דלקת","התאוששות אחרי טיפול אונקולוגי"],
        "conditions": ["חיסון חלש","סרטן","מחלות אוטואימוניות","מחלות חורף","מעי רגיז","מעי דליף","קרוהן","קוליטיס כיבית","צליאק","פרקינסון","סוכרת סוג 1","דלקות בדרכי השתן","קנדידה","וסקוליטיס","HPV","עייפות אחרי טיפול"],
        "contraindications": ["רגישות ידועה לפטריות"],
        "doctor_consult": ["בטיפול בסרטן","מחלות אוטואימוניות","ילדים","הריון","תרופות מדכאות חיסון"],
        "keywords": ["חיסון","סרטן","immune","cancer","gut health"]
    },
    {
        "name": "קורדיספס",
        "scientific_name": "Cordyceps militaris",
        "description": "קורדיספס היא פטרייה המגבירה אנרגיה וסיבולת.",
        "dosage": "500-1000 מ\"ג ביום",
        "how_to_use": "בבוקר על בטן ריקה",
        "mushroom_image_url": "https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=600&q=80",
        "tagline": "אנרגיה וחיוניות",
        "benefits": ["הגברת אנרגיה","סיבולת ספורטיבית","בריאות הריאות"],
        "conditions": ["עייפות כרונית","אסתמה","אנמיה"],
        "contraindications": ["מחלות אוטואימוניות"],
        "doctor_consult": ["הריון","ילדים"],
        "keywords": ["אנרגיה","energy","fatigue"]
    },
    {
        "name": "טרמלה",
        "scientific_name": "Tremella fuciformis",
        "description": "פטריית השלג ללחות והצערת העור.",
        "dosage": "500-1000 מ\"ג ביום",
        "how_to_use": "בוקר או ערב",
        "mushroom_image_url": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
        "tagline": "הידרציה ויופי",
        "benefits": ["לחות עור","קולגן","אנטי אייג'ינג"],
        "conditions": ["יובש בעור","קמטים","אובדן גמישות"],
        "contraindications": ["רגישות לפיטריות"],
        "doctor_consult": ["הריון"],
        "keywords": ["עור","skin","beauty"]
    },
    {
        "name": "ריישי",
        "scientific_name": "Ganoderma lucidum",
        "description": "מלכת הפטריות להרגעה ושינה שקטה.",
        "dosage": "500-1000 מ\"ג ביום",
        "how_to_use": "שעה לפני השינה",
        "mushroom_image_url": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=600&q=80",
        "tagline": "איזון ורוגע",
        "benefits": ["שיפור שינה","הורדת לחץ","איזון חיסוני"],
        "conditions": ["אינסומניה","חרדה","לחץ דם גבוה"],
        "contraindications": ["מדללי דם"],
        "doctor_consult": ["הריון","תרופות לב"],
        "keywords": ["שינה","stress","sleep"]
    },
    {
        "name": "רעמת האריה",
        "scientific_name": "Hericium erinaceus",
        "description": "מזון למוח, שיפור קוגנטיבי וזיכרון.",
        "dosage": "500-1000 מ\"ג ביום",
        "how_to_use": "בוקר על בטן ריקה",
        "mushroom_image_url": "https://media.base44.com/images/public/69987acaab66604ab48d5f4d/fd00a63b9_1000183647-removebg-preview.png",
        "tagline": "מיקוד וזיכרון",
        "benefits": ["שיפור זיכרון","ריכוז","NGF"],
        "conditions": ["ערפל מחשבתי","ADHD","אלצהיימר"],
        "contraindications": ["רגישות לפיטריות"],
        "doctor_consult": ["תרופות פסיכיאטריות"],
        "keywords": ["ריכוז","focus","memory"]
    },
    {
        "name": "צ'אגה",
        "scientific_name": "Inonotus obliquus",
        "description": "מלך הנוגדי חמצון להגנה על התאים.",
        "dosage": "500-1000 מ\"ג ביום",
        "how_to_use": "בוקר על בטן ריקה",
        "mushroom_image_url": "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=600&q=80",
        "tagline": "הגנה אנטיאוקסידנטית",
        "benefits": ["נוגד חמצון","הורדת דלקת","איזון סוכר"],
        "conditions": ["דלקת כרונית","סוכרת","פסוריאזיס"],
        "contraindications": ["מדללי דם","בעיות כליה"],
        "doctor_consult": ["הריון"],
        "keywords": ["חמצון","inflammation","antioxidant"]
    }
  ];

  const slugify = (t) => {
    if (!t) return randomUUID().substring(0,8);
    return t.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]+/g, '');
  };

  try {
    const now = new Date();
    
    // Cleanup if needed? No, let's keep and update.

    for (const m of mushrooms) {
        const fId = randomUUID();
        const fSlug = slugify(m.scientific_name);

        await sql`
          INSERT INTO fungi (id, slug, scientific_name, featured_image, status, created_at, updated_at)
          VALUES (${fId}, ${fSlug}, ${m.scientific_name}, ${m.mushroom_image_url}, 'published', ${now}, ${now})
          ON CONFLICT (slug) DO UPDATE SET 
            scientific_name = EXCLUDED.scientific_name,
            featured_image = EXCLUDED.featured_image,
            updated_at = EXCLUDED.updated_at
          RETURNING id;
        `;
        
        const finalFId = (await sql`SELECT id FROM fungi WHERE slug = ${fSlug}`).rows[0].id;

        await sql`
          INSERT INTO fungi_translations (id, fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage, search_keywords, created_at, updated_at)
          VALUES (${randomUUID()}, ${finalFId}, 'he', ${m.name}, ${m.description}, ${m.how_to_use}, ${m.dosage}, ${m.keywords}, ${now}, ${now})
          ON CONFLICT (fungi_id, language_code) DO UPDATE SET 
            name = EXCLUDED.name,
            about_this_mushroom = EXCLUDED.about_this_mushroom,
            how_to_use = EXCLUDED.how_to_use,
            recommended_dosage = EXCLUDED.recommended_dosage,
            search_keywords = EXCLUDED.search_keywords,
            updated_at = EXCLUDED.updated_at;
        `;

        // Clear existing many-to-many to ensure clean slate for this mushroom
        await sql`DELETE FROM fungi_benefits WHERE fungi_id = ${finalFId};`;
        await sql`DELETE FROM fungi_conditions WHERE fungi_id = ${finalFId};`;
        await sql`DELETE FROM fungi_contraindications WHERE fungi_id = ${finalFId};`;
        await sql`DELETE FROM fungi_doctor_consult_flags WHERE fungi_id = ${finalFId};`;

        // Benefits
        for (const bLabel of m.benefits) {
            const bSlug = slugify(bLabel) || 'b_' + randomUUID().substring(0,8);
            await sql`
              INSERT INTO benefits (id, slug, created_at, updated_at)
              VALUES (${randomUUID()}, ${bSlug}, ${now}, ${now})
              ON CONFLICT (slug) DO UPDATE SET updated_at = EXCLUDED.updated_at;
            `;
            const bId = (await sql`SELECT id FROM benefits WHERE slug = ${bSlug}`).rows[0].id;
            await sql`INSERT INTO benefit_translations (id, benefit_id, language_code, label) VALUES (${randomUUID()}, ${bId}, 'he', ${bLabel}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_benefits (id, fungi_id, benefit_id, created_at, updated_at) VALUES (${randomUUID()}, ${finalFId}, ${bId}, ${now}, ${now}) ON CONFLICT DO NOTHING;`;
        }

        // Conditions
        for (const cLabel of m.conditions) {
            const cSlug = slugify(cLabel) || 'c_' + randomUUID().substring(0,8);
            await sql`
              INSERT INTO conditions (id, slug, created_at, updated_at)
              VALUES (${randomUUID()}, ${cSlug}, ${now}, ${now})
              ON CONFLICT (slug) DO UPDATE SET updated_at = EXCLUDED.updated_at;
            `;
            const cId = (await sql`SELECT id FROM conditions WHERE slug = ${cSlug}`).rows[0].id;
            await sql`INSERT INTO condition_translations (id, condition_id, language_code, label) VALUES (${randomUUID()}, ${cId}, 'he', ${cLabel}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_conditions (id, fungi_id, condition_id, created_at, updated_at) VALUES (${randomUUID()}, ${finalFId}, ${cId}, ${now}, ${now}) ON CONFLICT DO NOTHING;`;
        }

        // Contra
        for (const ctLabel of m.contraindications) {
            const ctSlug = slugify(ctLabel) || 'ct_' + randomUUID().substring(0,8);
            await sql`
              INSERT INTO contraindications (id, slug, created_at, updated_at)
              VALUES (${randomUUID()}, ${ctSlug}, ${now}, ${now})
              ON CONFLICT (slug) DO UPDATE SET updated_at = EXCLUDED.updated_at;
            `;
            const ctId = (await sql`SELECT id FROM contraindications WHERE slug = ${ctSlug}`).rows[0].id;
            await sql`INSERT INTO contraindication_translations (id, contraindication_id, language_code, label) VALUES (${randomUUID()}, ${ctId}, 'he', ${ctLabel}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_contraindications (id, fungi_id, contraindication_id, created_at, updated_at) VALUES (${randomUUID()}, ${finalFId}, ${ctId}, ${now}, ${now}) ON CONFLICT DO NOTHING;`;
        }

        // Doctor
        for (const dLabel of m.doctor_consult) {
            const dSlug = slugify(dLabel) || 'd_' + randomUUID().substring(0,8);
            await sql`
              INSERT INTO doctor_consult_flags (id, slug, created_at, updated_at)
              VALUES (${randomUUID()}, ${dSlug}, ${now}, ${now})
              ON CONFLICT (slug) DO UPDATE SET updated_at = EXCLUDED.updated_at;
            `;
            const dId = (await sql`SELECT id FROM doctor_consult_flags WHERE slug = ${dSlug}`).rows[0].id;
            await sql`INSERT INTO doctor_consult_flag_translations (id, doctor_consult_flag_id, language_code, label) VALUES (${randomUUID()}, ${dId}, 'he', ${dLabel}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_doctor_consult_flags (id, fungi_id, doctor_consult_flag_id, created_at, updated_at) VALUES (${randomUUID()}, ${finalFId}, ${dId}, ${now}, ${now}) ON CONFLICT DO NOTHING;`;
        }
    }

    res.status(200).json({ success: true, message: 'MEGA UPDATE V3 COMPLETED' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
