import { sql } from '@vercel/postgres';

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
        "benefits": ["חיזוק חזק של מערכת החיסון","תמיכה אונקולוגית משלימה (PSK/PSP)","איזון פלורת מעיים ומיקרוביום","נוגד חמצון חזק","הגנה מפני זיהומים ויראליים ובקטריאליים","וויסות דלקת ועיכול","תמיכה בהתאוששות אחרי טיפול אונקולוגי"],
        "conditions": ["חיסון חלש","סרטן (תמיכה משלימה)","מחלות אוטואימוניות","מחלות חורף וזיהומים ויראליים","מעי רגיז (IBS)","מעי דליף","קרוהן","קוליטיס כיבית","צליאק ורגישות לגלוטן","פרקינסון","סוכרת סוג 1","דלקות בדרכי השתן","קנדידה","וסקוליטיס","HPV","עייפות קשורה לטיפול אונקולוגי"],
        "contraindications": ["רגישות ידועה לפטריות"],
        "doctor_consult": ["בטיפול בסרטן — תמיד לתאם עם האונקולוג","מחלות אוטואימוניות פעילות","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון","שימוש בתרופות מדכאות חיסון (לאחר השתלה)"],
        "keywords": ["חיסון","סרטן","immune","cancer","gut health", "иммунитет", "рак", "inmunidad", "cáncer"]
    },
    {
        "name": "קורדיספס",
        "scientific_name": "Cordyceps militaris",
        "description": "קורדיספס (Cordyceps militaris) היא פטרייה ייחודית שגדלה במקור על זחלים בהרים הגבוהים של טיבט (כיום מגודלת בעיקר בתרבות). ידועה ביכולתה להגביר אנרגיה, לשפר ביצועים ספורטיביים ולתמוך בתפקוד נשימתי. פועלת על ידי הגברת ייצור ATP (אנרגיה תאית) ושיפור קליטת חמצן בתאים. נחשבת לאדפטוגן אנרגטי מרכזי ברפואה הסינית.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=600&q=80",
        "tagline": "אנרגיה, חיוניות וביצועים",
        "benefits": ["הגברת אנרגיה וחיוניות","שיפור ביצועים וסיבולת ספורטיביים","תמיכה בתפקוד הריאות וקליטת חמצן","שיפור ייצור ATP (אנרגיה תאית)","תמיכה בתפקוד הכליות","שיפור זרימת דם","תמיכה בתפקוד מיני","הגנה אנטי-אוקסידנטית","חיזוק מערכת החיסון"],
        "conditions": ["עייפות כרונית","חוסר אנרגיה","ביצועים ספורטיביים נמוכים","בעיות נשימה ואסתמה","אנמיה","דיכאון","יתר לחץ דם","כולסטרול גבוה","סוכרת סוג 2","מחלות לב וכלי דם","בעיות תפקוד מיני","מחלות כליה קלות","סרטן (תמיכה משלימה)","פיברומיאלגיה","זיהומים ויראליים חוזרים","PCOS","גאוט","השמנת יתר"],
        "contraindications": ["מחלות אוטואימוניות פעילות — עלול לעורר את מערכת החיסון","רגישות ידועה לפטריות","תרופות לסוכרת — עלול להוריד סוכר בדם ולגרום להיפוגליקמיה"],
        "doctor_consult": ["מחלות לב חמורות","מחלות כליה מתקדמות","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון","שימוש בתרופות מדכאות חיסון (לאחר השתלה)"],
        "keywords": ["אנרגיה","performance","energy","fatigue", "энергия", "спорты", "energía", "rendimiento"]
    },
    {
        "name": "טרמלה",
        "scientific_name": "Tremella fuciformis",
        "description": "טרמלה (Tremella fuciformis), המכונה 'פטריית הנסיכה' או 'פטריית השלג', היא פט­רייה זכוכית לבנה-סגולה טרופית אסיה. נחשבת לבריאות העור ברפואה הסינית כבר מאות שנים — יכולה לשמור עד 500 פעמים את משקלה במים. עשירה בפוליסכרידים המסייעים לבריאות רקמות חיבור ועור זוהר. נעשת למרכיב הנדרש ביותר בתעשיית יופי ובריאות.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר או בערב. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
        "tagline": "הידרציה ויופי מבפנים",
        "benefits": ["לחות עור מעמיקה (שומרת עד 500 פעמים משקלה במים)","עידוד ייצור קולגן","נוגד חמצון חזק","הבהקת העור ואחידות גוון","תכונות אנטי-אייג'ינג","חיזוק מערכת החיסון","הפחתת דלקות","תמיכה ברקמות חיבור ומפרקים","תמיכה בבריאות המוח ועצבים"],
        "conditions": ["יובש כרוני בעור","הזדקנות עור וקמטים","אובדן גמישות ואלסטיות","עור קהה חסר זוהר","נוקשות וכאבי מפרקים","בעיות רקמות חיבור","דלקת פאשיה","אקזמה","פסוריאזיס","סקלרודרמה","נשירת שיער והקרחה","בעיות ראייה","תמיכה בבריאות המוח והעצבים"],
        "contraindications": ["רגישות ידועה לפטריות"],
        "doctor_consult": ["שימוש בתרופות ייעודיות לעור","מחלות עור כרוניות (אקזמה, פסוריאזיס, סקלרודרמה)","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון"],
        "keywords": ["עור","skin","collagen","beauty", "кожа", "красота", "piel", "belleza"]
    },
    {
        "name": "ריישי",
        "scientific_name": "Ganoderma lucidum",
        "description": "ריישי (Ganoderma lucidum), המכונה 'מלכת הפטריות' ו'פטריית האלמוות', נמצאת בשימוש ברפואה הסינית המסורתית למעלה מ-2,000 שנה. היא ידועה בתכונות מרגיעות עמוקות, חיזוק מערכת החיסון ותמיכה בשינה איכותית. מכילה טריטרפנים וביתא-גלוקנים הפועלים על מערכת העצבים האוטונומית ומערכת החיסון. נחשבת לאדפטוגן הקלאסי ביותר ברפואה המסורתית.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בערב, כ-1 שעה לפני השינה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=600&q=80",
        "tagline": "פטריית האלמוות - הרגעה ואיזון",
        "benefits": ["שיפור איכות השינה","הפחתת לחץ וחרדה","חיזוק ווויסות מערכת החיסון","הרגעה עמוקה של מערכת העצבים","איזון לחץ דם","הפחתת כולסטרול","תמיכה בבריאות הכבד","נוגד חמצון חזק","תמיכה אונקולוגית משלימה"],
        "conditions": ["אינסומניה ובעיות שינה","חרדה ומתח כרוני","דיכאון","PTSD וטראומה","אסתמה ואלרגיות","אנדומטריוזיס","אנמיה","דלקת מפרקים","דלקות כרוניות","דלקות בדרכי השתן","הפטיטיס (דלקת כבד)","גאוט (שיגדון)","השמנת יתר","יתר לחץ דם","כולסטרול גבוה","מיגרנות","כבד שומני","מחלות אוטואימוניות","מחלות לב וכלי דם","סוכרת סוג 1 וסוג 2","סרטן (תמיכה משלימה)","פיברומיאלגיה","פסוריאזיס","סקלרודרמה","צליאק","קרוהן","קוליטיס כיבית","וסקוליטיס","גיל המעבר"],
        "contraindications": ["נוגדי קרישה (וורפרין, אספירין) — ריישי מדלל דם, הסיכון לדימום עולה","לפני ניתוח — להפסיק שבועיים מראש","תרופות לסוכרת — עלול להוריד סוכר בדם ולגרום להיפוגליקמיה","תרופות להורדת לחץ דם — אפקט מצטבר לירידת לחץ דם","רגישות ידועה לפטריות"],
        "doctor_consult": ["מחלות כבד קיימות","שימוש בתרופות מדכאות חיסון (לאחר השתלה)","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון"],
        "keywords": ["שינה","sleep","stress","anxiety", "сон", "стресс", "sueño", "estrés"]
    },
    {
        "name": "רעמת האריה",
        "scientific_name": "Hericium erinaceus",
        "description": "רעמת האריה (Hericium erinaceus) היא פטרייה ייחודית בעלת מראה לבן ומשולב בשיער, המכונה 'פטריית החכמה'. היא ידועה בתכונותיה לתמיכה בתפקוד קוגניטיבי, זיכרון, ריכוז וחידוש תאי עצב. מחקרים מדעיים מראים כי היא מעודדת ייצור NGF (גורם גדילה עצבי) בגוף — חלבון חיוני לצמיחה, תחזוקה ושרידות של נוירונים. נחקרת ביפן, סין וארה\"ב לשימוש במחלות נוירודגנרטיביות ובתמיכה במצב רוח.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל .ביום.",
        "how_to_use": ".ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן",
        "mushroom_image_url": "https://media.base44.com/images/public/69987acaab66604ab48d5f4d/fd00a63b9_1000183647-removebg-preview.png",
        "tagline": "מזון למוח ולמערכת העצבים",
        "benefits": ["שיפור זיכרון וריכוז","עידוד ייצור NGF — גורם גדילה עצבי","הפחתת ערפל מחשבתי","תמיכה בשחזור ושיקום עצבי","הפחתת דלקת נוירולוגית","עזרה במצבי חרדה קלים","תמיכה במחלות נוירודגנרטיביות","תמיכה בבריאות מערכת העיכול (ציר מעי-מוח)"],
        "conditions": ["בעיות זיכרון ואלצהיימר","דמנציה","ירידה קוגניטיבית הקשורה לגיל","ערפל מחשבתי (Brain Fog)","קשיי ריכוז וקשב (ADHD)","דיכאון","חרדה והתקפי חרדה","PTSD","כאבי ראש כרוניים ומיגרנות","פרקינסון","טרשת נפוצה","פיברומיאלגיה","נוירופתיה (כאב עצבי, נימול, עקצוצים)","מחלות אוטואימוניות","מעי רגיז (IBS)","מעי דליף","קרוהן","קוליטיס כיבית","צליאק ורגישות לגלוטן","פסוריאזיס","סקלרודרמה","סרטן (תמיכה משלימה)"],
        "contraindications": ["לפני ניתוח — להפסיק שבועיים מראש","רגישות ידוע לפיטריות"],
        "doctor_consult": ["בשימוש יחד עם תרופות פסיכיאטריות (נוגדי דיכאון, תרופות לחרדה)","היסטוריה של הפרעות נפשיות קשות (פסיכוזה, מאניה)","הריון, הנקה או תכנון הריון","ילדים מתחת לגיל 18"],
        "keywords": ["ריכוז","focus","memory","brain fog", "мозг", "память", "memoria", "concentración"]
    },
    {
        "name": "צ'אגה",
        "scientific_name": "Inonotus obliquus",
        "description": "צ'אגה (Inonotus obliquus) היא פטרייה הגדלת על עצי ליבנה בצפון אירופה ורוסיה. שימושה הרפואי מתועד למאה ה-12 באירופה. היא מדורגת כאחד מהמזונות העשירים ביותר בנוגדי חמצון בעולם (עם אחד מערכי ORAC הגבוהים בטבע). פועלת נגד דלקת, מאטה הזדקנות, ומסייעת בוויסות רמות הסוכר בדם.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=600&q=80",
        "tagline": "מלך הנוגדי חמצון - אנטי אייג'ינג",
        "benefits": ["נוגד חמצון חזק ביותר (אחד הגבוהים בטבע)","הפחתת דלקת מערכתית","סייע בוויסות רמות סוכר","תכונות אנטי-אייג'ינג","תמיכה בבריאות העור","חיזוק מערכת החיסון","הפחתת כולסטרול","עיכול סרטן (PSK/PSP — סינרגיסטי לכימותרפיה ביפן)"],
        "conditions": ["דלקת כרונית","סטרס חמצוני","הזדקנות מואצת","מחלות עור","זיהומים חוזרים","התאוששות אחרי מחלות","סרטן (תמיכה משלימה)","סוכרת ועמידות לאינסולין","כולסטרול גבוה","כבד שומני","מחלות אוטואימוניות","דלקת מפרקים","פסוריאזיס","אלרגיות","וסקוליטיס"],
        "contraindications": ["מדללי דם (וורפרין, אספירין) — צ'אגה מדלל דם וסיכון דימום עולה","לפני ניתוח — להפסיק שבועיים מראש","רגישות ידועה לפטריות","מחלת כליות — צ'אגה עשירה באוקסלטים, עלול להעמיס על הכליות","תרופות לסוכרת — עלול להוריד סוכר בדם ולגרום להיפוגליקמיה"],
        "doctor_consult": ["ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון","שימוש בתרופות מדכאות חיסון (לאחר השתלה)"],
        "keywords": ["דלקת","antioxidant","inflammation","sugar", "антиоксидант", "сахар", "antioxidante", "azúcar"]
    }
  ];

  const translationMap = {
    // Basic Terms only, the rest will be AI translated or fallback
    "חיזוק חזק של מערכת החיסון": { en: "Strong immune system support", ru: "Сильная поддержка иммунитета", es: "Fuerte apoyo al sistema inmunológico" },
    "עייפות כרונית": { en: "Chronic fatigue", ru: "Хроническая усталость", es: "Fatiga crónica" },
    "לחות עור מעמיקה": { en: "Deep skin hydration", ru: "Глубокое увлажнение кожи", es: "Hidratación profunda de la piel" }
  };

  const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

  try {
    // 0. Ensure Defaults Again just in case
    await sql`ALTER TABLE fungi ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE fungi_translations ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE benefits ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE conditions ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE contraindications ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    await sql`ALTER TABLE doctor_consult_flags ALTER COLUMN id SET DEFAULT gen_random_uuid();`;

    for (const m of mushrooms) {
        const slug = m.scientific_name.toLowerCase().replace(/ /g, '_');

        // 1. Fungi
        const fRes = await sql`
          INSERT INTO fungi (slug, scientific_name, featured_image, status)
          VALUES (${slug}, ${m.scientific_name}, ${m.mushroom_image_url}, 'published')
          ON CONFLICT (slug) DO UPDATE SET 
            scientific_name = EXCLUDED.scientific_name,
            featured_image = EXCLUDED.featured_image,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id;
        `;
        const fId = fRes.rows[0].id;

        // 2. Trans HE
        await sql`
          INSERT INTO fungi_translations (fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage, search_keywords)
          VALUES (${fId}, 'he', ${m.name}, ${m.description}, ${m.how_to_use}, ${m.dosage}, ${m.keywords})
          ON CONFLICT (fungi_id, language_code) DO UPDATE SET 
            name = EXCLUDED.name,
            about_this_mushroom = EXCLUDED.about_this_mushroom,
            how_to_use = EXCLUDED.how_to_use,
            recommended_dosage = EXCLUDED.recommended_dosage,
            search_keywords = EXCLUDED.search_keywords,
            updated_at = CURRENT_TIMESTAMP;
        `;

        // 3. Clear existing relations to re-sync
        await sql`DELETE FROM fungi_benefits WHERE fungi_id = ${fId};`;
        await sql`DELETE FROM fungi_conditions WHERE fungi_id = ${fId};`;
        await sql`DELETE FROM fungi_contraindications WHERE fungi_id = ${fId};`;
        await sql`DELETE FROM fungi_doctor_consult_flags WHERE fungi_id = ${fId};`;

        // 4. Benefits
        for (const bL of m.benefits) {
            const bS = slugify(bL);
            const bRes = await sql`
              INSERT INTO benefits (slug, created_at, updated_at) 
              VALUES (${bS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const bId = bRes.rows[0].id;
            await sql`INSERT INTO benefit_translations (benefit_id, language_code, label, created_at, updated_at) VALUES (${bId}, 'he', ${bL}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_benefits (fungi_id, benefit_id) VALUES (${fId}, ${bId}) ON CONFLICT DO NOTHING;`;
        }

        // 5. Conditions
        for (const cL of m.conditions) {
            const cS = slugify(cL);
            const cRes = await sql`
              INSERT INTO conditions (slug, created_at, updated_at) 
              VALUES (${cS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const cId = cRes.rows[0].id;
            await sql`INSERT INTO condition_translations (condition_id, language_code, label, created_at, updated_at) VALUES (${cId}, 'he', ${cL}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_conditions (fungi_id, condition_id) VALUES (${fId}, ${cId}) ON CONFLICT DO NOTHING;`;
        }

        // 6. Contra
        for (const ctL of m.contraindications) {
            const ctS = slugify(ctL);
            const ctRes = await sql`
              INSERT INTO contraindications (slug, created_at, updated_at) 
              VALUES (${ctS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const ctId = ctRes.rows[0].id;
            await sql`INSERT INTO contraindication_translations (contraindication_id, language_code, label, created_at, updated_at) VALUES (${ctId}, 'he', ${ctL}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_contraindications (fungi_id, contraindication_id) VALUES (${fId}, ${ctId}) ON CONFLICT DO NOTHING;`;
        }

        // 7. Doctor
        for (const dL of m.doctor_consult) {
            const dS = slugify(dL);
            const dRes = await sql`
              INSERT INTO doctor_consult_flags (slug, created_at, updated_at) 
              VALUES (${dS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const dId = dRes.rows[0].id;
            await sql`INSERT INTO doctor_consult_flag_translations (doctor_consult_flag_id, language_code, label, created_at, updated_at) VALUES (${dId}, 'he', ${dL}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_doctor_consult_flags (fungi_id, doctor_consult_flag_id) VALUES (${fId}, ${dId}) ON CONFLICT DO NOTHING;`;
        }
    }

    res.status(200).json({ success: true, message: 'MEGA SYNC COMPLETED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
