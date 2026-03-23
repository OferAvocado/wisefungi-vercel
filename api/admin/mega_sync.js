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
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום. *המינון הוא כללי ויש להתאים אישית לפי איך שהגוף מגיב לפיטריה..",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80",
        "tagline": "מגן החיסון - לחיזוק מקסימלי",
        "benefits": ["חיזוק חזק של מערכת החיסון","תמיכה אונקולוגית משלימה (PSK/PSP)","איזון פלורת מעיים ומיקרוביום","נוגד חמצון חזק","הגנה מפני זיהומים ויראליים ובקטריאליים","וויסות דלקת ועיכול","תמיכה בהתאוששות אחרי טיפול אונקולוגי"],
        "conditions": ["חיסון חלש","סרטן (תמיכה משלימה)","מחלות אוטואימוניות","מחלות חורף וזיהומים ויראליים","מעי רגיז (IBS)","מעי דליף","קרוהן","קוליטיס כיבית","צליאק ורגישות לגלוטן","פרקינסון","סוכרת סוג 1","דלקות בדרכי השתן","קנדידה","וסקוליטיס","HPV","עייפות קשורה לטיפול אונקולוגי"],
        "contraindications": ["רגישות ידועה לפטריות"],
        "doctor_consult": ["בטיפול בסרטן — תמיד לתאם עם האונקולוג","מחלות אוטואימוניות פעילות","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון","שימוש בתרופות מדכאות חיסון (לאחר השתלה)"],
        "keywords": ["חיסון","סרטן","זיהום","שפעת","HPV","מעיים","פלורה","חולשה","immune","cancer","infection","gut health","IBS","דלקות מעי","PSK","PSP","בטא גלוקן","מיקרוביום","אימונומודולציה","תמיכה אונקולוגית","כימותרפיה","מחלות אוטואימוניות","קרוהן","קוליטיס","צליאק","גלוטן","gluten","celiac","פרקינסון","סוכרת סוג 1","וסקוליטיס","זיהומי חורף","צינון","חום","כאבי בטן","גזים","עצירות","constipation","diarrhea","רגישות ללקטוז","לקטוז","lactose intolerance","dairy","שילוב עם ריישי","שילוב עם רעמת האריה"]
    },
    {
        "name": "קורדיספס",
        "scientific_name": "Cordyceps militaris",
        "description": "קורדיספס (Cordyceps militaris) היא פטרייה ייחודית שגדלה במקור על זחלים בהרים הגבוהים של טיבט (כיום מגודלת בעיקר בתרבות). ידועה ביכולתה להגביר אנרגיה, לשפר ביצועים ספורטיביים ולתמוך בתפקוד נשימתי. פועלת על ידי הגברת ייצור ATP (אנרגיה תאית) ושיפור קליטת חמצן בתאים. נחשבת לאדפטוגן אנרגטי מרכזי ברפואה הסינית.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום. *המינון הוא כללי ויש להתאים אישית לפי איך שהגוף מגיב לפיטריה.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=600&q=80",
        "tagline": "אנרגיה, חיוניות וביצועים",
        "benefits": ["הגברת אנרגיה וחיוניות","שיפור ביצועים וסיבולת ספורטיביים","תמיכה בתפקוד הריאות וקליטת חמצן","שיפור ייצור ATP (אנרגיה תאית)","תמיכה בתפקוד הכליות","שיפור זרימת דם","תמיכה בתפקוד מיני","הגנה אנטי-אוקסידנטית","חיזוק מערכת החיסון"],
        "conditions": ["עייפות כרונית","חוסר אנרגיה","ביצועים ספורטיביים נמוכים","בעיות נשימה ואסתמה","אנמיה","דיכאון","יתר לחץ דם","כולסטרול גבוה","סוכרת סוג 2","מחלות לב וכלי דם","בעיות תפקוד מיני","מחלות כליה קלות","סרטן (תמיכה משלימה)","פיברומיאלגיה","זיהומים ויראליים חוזרים","PCOS","גאוט","השמנת יתר"],
        "contraindications": ["מחלות אוטואימוניות פעילות — עלול לעורר את מערכת החיסון","רגישות ידועה לפטריות","תרופות לסוכרת — עלול להוריד סוכר בדם ולגרום להיפוגליקמיה"],
        "doctor_consult": ["מחלות לב חמורות","מחלות כליה מתקדמות","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון","שימוש בתרופות מדכאות חיסון (לאחר השתלה)"],
        "keywords": ["אנרגיה","עייפות","ספורט","חשק מיני","ריאות","כליות","חיוניות","ביצועים","energy","fatigue","libido","performance","פיברומיאלגיה","CFS","עייפות פיזית","סיבולת","ATP","ספורטאים","עייפות כרונית","מיטוכונדריה","סוכרת סוג 2","דלקת כרונית","בעיות זקפה","ED","אימפוטנציה","חשק מיני נמוך","PCOS","אסתמה","בריאות ריאות","שילוב עם ריישי","שילוב עם צ'אגה"]
    },
    {
        "name": "טרמלה",
        "scientific_name": "Tremella fuciformis",
        "description": "טרמלה (Tremella fuciformis), המכונה 'פטריית הנסיכה' או 'פטריית השלג', היא פט­רייה זכוכית לבנה-סגולה טרופית אסיה. נחשבת לבריאות העור ברפואה הסינית כבר מאות שנים — יכולה לשמור עד 500 פעמים את משקלה במים. עשירה בפוליסכרידים המסייעים לבריאות רקמות חיבור ועור זוהר. נעשת למרכיב הנדרש ביותר בתעשיית יופי ובריאות.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום. *המינון הוא כללי ויש להתאים אישית לפי איך שהגוף מגיב לפיטריה.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר או בערב. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
        "tagline": "הידרציה ויופי מבפנים",
        "benefits": ["לחות עור מעמיקה (שומרת עד 500 פעמים משקלה במים)","עידוד ייצור קולגן","נוגד חמצון חזק","הבהקת העור ואחידות גוון","תכונות אנטי-אייג'ינג","חיזוק מערכת החיסון","הפחתת דלקות","תמיכה ברקמות חיבור ומפרקים","תמיכה בבריאות המוח ועצבים"],
        "conditions": ["יובש כרוני בעור","הזדקנות עור וקמטים","אובדן גמישות ואלסטיות","עור קהה חסר זוהר","נוקשות וכאבי מפרקים","בעיות רקמות חיבור","דלקת פאשיה","אקזמה","פסוריאזיס","סקלרודרמה","נשירת שיער והקרחה","בעיות ראייה","תמיכה בבריאות המוח והעצבים"],
        "contraindications": ["רגישות ידועה לפטריות"],
        "doctor_consult": ["שימוש בתרופות ייעודיות לעור","מחלות עור כרוניות (אקזמה, פסוריאזיס, סקלרודרמה)","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון"],
        "keywords": ["עור","לחות","קולגן","נוגד חמצון","הידרציה","אנטי אייג'ינג","skin","collagen","anti-aging","moisture","עור יבש","קמטים","זוהר עור","בריאות העור","hydration","glow","hyaluronic acid","beauty","נשירת שיער","הקרחה","hair loss","vision","עור בוגר","יובש כרוני","נוקשות מפרקים","אקזמה","פסוריאזיס","סקלרודרמה"]
    },
    {
        "name": "ריישי",
        "scientific_name": "Ganoderma lucidum",
        "description": "ריישי (Ganoderma lucidum), המכונה 'מלכת הפטריות' ו'פטריית האלמוות', נמצאת בשימוש ברפואה הסינית המסורתית למעלה מ-2,000 שנה. היא ידועה בתכונות מרגיעות עמוקות, חיזוק מערכת החיסון ותמיכה בשינה איכותית. מכילה טריטרפנים וביתא-גלוקנים הפועלים על מערכת העצבים האוטונומית ומערכת החיסון. נחשבת לאדפטוגן הקלאסי ביותר ברפואה המסורתית.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום. *המינון הוא כללי ויש להתאים אישית לפי איך שהגוף מגיב לפיטריה.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בערב, כ-1 שעה לפני השינה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=600&q=80",
        "tagline": "פטריית האלמוות - הרגעה ואיזון",
        "benefits": ["שיפור איכות השינה","הפחתת לחץ וחרדה","חיזוק ווויסות מערכת החיסון","הרגעה עמוקה של מערכת העצבים","איזון לחץ דם","הפחתת כולסטרול","תמיכה בבריאות הכבד","נוגד חמצון חזק","תמיכה אונקולוגית משלימה"],
        "conditions": ["אינסומניה ובעיות שינה","חרדה ומתח כרוני","דיכאון","PTSD וטראומה","אסתמה ואלרגיות","אנדומטריוזיס","אנמיה","דלקת מפרקים","דלקות כרוניות","זיהומי שתן","הפטיטיס","גאוט","השמנת יתר","יתר לחץ דם","כולסטרול גבוה","מיגרנה","כבד שומני","מחלות אוטואימוניות","מחלות לב","סוכרת","סרטן","פיברומיאלגיה","פסוריאזיס","סקלרודרמה","צליאק","קרוהן","קוליטיס","וסקוליטיס","גיל המעבר"],
        "contraindications": ["נוגדי קרישה (וורפרין, אספירין) — ריישי מדלל דם, הסיכון לדימום עולה","לפני ניתוח — להפסיק שבועיים מראש","תרופות לסוכרת — עלול להוריד סוכר בדם ולגרום להיפוגליקמיה","תרופות להורדת לחץ דם — אפקט מצטבר לירידת לחץ דם","רגישות ידועה לפטריות"],
        "doctor_consult": ["מחלות כבד קיימות","שימוש בתרופות מדכאות חיסון (לאחר השתלה)","ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון"],
        "keywords": ["שינה","נדודי שינה","לחץ","חרדה","לחץ דם","כולסטרול","עייפות","כבד","חיסון","רגיעה","stress","anxiety","sleep","blood pressure","פיברומיאלגיה","CFS","אוטואימוני","אלרגיות","PTSD","טראומה","אדפטוגן","תמיכה אונקולוגית","סרטן","כימותרפיה","אינסומניה","קושי להירדם","דיכאון","כאב כרוני","כבד שומני","כולסטרול גבוה","גיל המעבר","menopause"]
    },
    {
        "name": "רעמת האריה",
        "scientific_name": "Hericium erinaceus",
        "description": "רעמת האריה (Hericium erinaceus) היא פטרייה ייחודית בעלת מראה לבן ומשולב בשיער, המכונה 'פטריית החכמה'. היא ידועה בתכונותיה לתמיכה בתפקוד קוגניטיבי, זיכרון, ריכוז וחידוש תאי עצב. מחקרים מדעיים מראים כי היא מעודדת ייצור NGF (גורם גדילה עצבי) בגוף — חלבון חיוני לצמיחה, תחזוקה ושרידות של נוירונים. נחקרת ביפן, סין וארה\"ב לשימוש במחלות נוירודגנרטיביות ובתמיכה במצב רוח.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל .ביום. *המינון הוא כללי ויש להתאים אישית לפי איך שהגוף מגיב לפיטריה.",
        "how_to_use": ".ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן",
        "mushroom_image_url": "https://media.base44.com/images/public/69987acaab66604ab48d5f4d/fd00a63b9_1000183647-removebg-preview.png",
        "tagline": "מזון למוח ולמערכת העצבים",
        "benefits": ["שיפור זיכרון וריכוז","עידוד ייצור NGF — גורם גדילה עצבי","הפחתת ערפל מחשבתי","תמיכה בשחזור ושיקום עצבי","הפחתת דלקת נוירולוגית","עזרה במצבי חרדה קלים","תמיכה במחלות נוירודגנרטיביות","תמיכה בבריאות מערכת העיכול (ציר מעי-מוח)"],
        "conditions": ["בעיות זיכרון","אלצהיימר","דמנציה","ירידה קוגניטיבית","ערפל מחשבתי (Brain Fog)","ריכוז וקשב (ADHD)","דיכאון","חרדה","התקפי חרדה","PTSD","כאבי ראש","מיגרנות","פרקינסון","טרשת נפוצה","פיברומיאלגיה","נוירופתיה (כאב עצבי, נימול, עקצוצים)","מחלות אוטואימוניות","מעי רגיז (IBS)","מעי דליף","קרוהן","קוליטיס כיבית","צליאק","פסוריאזיס","סקלרודרמה","סרטן"],
        "contraindications": ["לפני ניתוח — להפסיק שבועיים מראש","רגישות ידוע לפיטריות"],
        "doctor_consult": ["בשימוש יחד עם תרופות פסיכיאטריות (נוגדי דיכאון, תרופות לחרדה)","היסטוריה של הפרעות נפשיות קשות (פסיכוזה, מאניה)","הריון, הנקה או תכנון הריון","ילדים מתחת לגיל 18"],
        "keywords": ["ריכוז","זיכרון","קשב","מוח","ADHD","אלצהיימר","חרדה","ערפל מחשבתי","brain fog","dementia","focus","memory","פיברומיאלגיה","PTSD","פרקינסון","נוירופתיה","NGF","nerve growth factor","ניוון עצבי","טרשת נפוצה","brain health","תפקוד מנטלי","בריאות המוח"]
    },
    {
        "name": "צ'אגה",
        "scientific_name": "Inonotus obliquus",
        "description": "צ'אגה (Inonotus obliquus) היא פטרייה הגדלת על עצי ליבנה בצפון אירופה ורוסיה. שימושה הרפואי מתועד למאה ה-12 באירופה. היא מדורגת כאחד מהמזונות העשירים ביותר בנוגדי חמצון בעולם (עם אחד מערכי ORAC הגבוהים בטבע). פועלת נגד דלקת, מאטה הזדקנות, ומסייעת בוויסות רמות הסוכר בדם.",
        "dosage": "בקפסולות: 500–1000 מ\"ג ביום. בתמצית: 1–2 מ\"ל ביום. *המינון הוא כללי ויש להתאים אישית לפי איך שהגוף מגיב לפיטריה.",
        "how_to_use": "ניתן לצרוך כתמצית נוזלית או קפסולות. מומלץ לקחת בבוקר על בטן ריקה. לא לאכול כשעה-שעתיים לאחר מכן.",
        "mushroom_image_url": "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=600&q=80",
        "tagline": "מלך הנוגדי חמצון - אנטי אייג'ינג",
        "benefits": ["נוגד חמצון חזק ביותר (אחד הגבוהים בטבע)","הפחתת דלקת מערכתית","סייע בוויסות רמות סוכר","תכונות אנטי-אייג'ינג","תמיכה בבריאות העור","חיזוק מערכת החיסון","הפחתת כולסטרול","עיכול סרטן (PSK/PSP — סינרגיסטי לכימותרפיה ביפן)"],
        "conditions": ["דלקת כרונית","סטרס חמצוני","הזדקנות מואצת","מחלות עור","זיהומים חוזרים","התאוששות אחרי מחלות","סרטן (תמיכה משלימה)","סוכרת ועמידות לאינסולין","כולסטרול גבוה","כבד שומני","מחלות אוטואימוניות","דלקת מפרקים","פסוריאזיס","אלרגיות","וסקוליטיס"],
        "contraindications": ["מדללי דם (וורפרין, אספירין) — צ'אגה מדלל דם וסיכון דימום עולה","לפני ניתוח — להפסיק שבועיים מראש","רגישות ידועה לפטריות","מחלת כליות — צ'אגה עשירה באוקסלטים, עלול להעמיס על הכליות","תרופות לסוכרת — עלול להוריד סוכר בדם ולגרום להיפוגליקמיה"],
        "doctor_consult": ["ילדים מתחת לגיל 18","הריון, הנקה או תכנון הריון","שימוש בתרופות מדכאות חיסון (לאחר השתלה)"],
        "keywords": ["נוגד חמצון","דלקת","סוכר בדם","סוכרת","עור","חיסון","אנטי אייג'ינג","antioxidant","inflammation","blood sugar","skin","immune","כולסטרול","לחץ דם","כאבי מפרקים","פסוריאזיס","אקזמה","ORAC","סטרס חמצוני","כבד שומני","סרטן","תמיכה אונקולוגית","זיהומים חוזרים"]
    }
  ];

  const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

  try {
    for (const m of mushrooms) {
        const slug = m.scientific_name.toLowerCase().replace(/ /g, '_');

        // 1. Fungi
        const fRes = await sql`
          INSERT INTO fungi (id, slug, scientific_name, featured_image, status, created_at, updated_at)
          VALUES (${randomUUID()}, ${slug}, ${m.scientific_name}, ${m.mushroom_image_url}, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (slug) DO UPDATE SET 
            scientific_name = EXCLUDED.scientific_name,
            featured_image = EXCLUDED.featured_image,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id;
        `;
        const fId = fRes.rows[0].id;

        // 2. Trans HE
        await sql`
          INSERT INTO fungi_translations (id, fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage, search_keywords, created_at, updated_at)
          VALUES (${randomUUID()}, ${fId}, 'he', ${m.name}, ${m.description}, ${m.how_to_use}, ${m.dosage}, ${m.keywords}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (fungi_id, language_code) DO UPDATE SET 
            name = EXCLUDED.name,
            about_this_mushroom = EXCLUDED.about_this_mushroom,
            how_to_use = EXCLUDED.how_to_use,
            recommended_dosage = EXCLUDED.recommended_dosage,
            search_keywords = EXCLUDED.search_keywords,
            updated_at = CURRENT_TIMESTAMP;
        `;

        // English Placeholder
        await sql`
          INSERT INTO fungi_translations (id, fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage, search_keywords, created_at, updated_at)
          VALUES (${randomUUID()}, ${fId}, 'en', ${slug.toUpperCase()}, 'Auto-generated desc', 'Usage instructions', 'Dosage', ${m.keywords}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (fungi_id, language_code) DO NOTHING;
        `;

        // 3. Clear Relations
        await sql`DELETE FROM fungi_benefits WHERE fungi_id = ${fId};`;
        await sql`DELETE FROM fungi_conditions WHERE fungi_id = ${fId};`;
        await sql`DELETE FROM fungi_contraindications WHERE fungi_id = ${fId};`;
        await sql`DELETE FROM fungi_doctor_consult_flags WHERE fungi_id = ${fId};`;

        // 4. Benefits
        for (const bL of m.benefits) {
            const bS = slugify(bL) || 'b_' + randomUUID().substring(0,8);
            const bRes = await sql`
              INSERT INTO benefits (id, slug, created_at, updated_at) 
              VALUES (${randomUUID()}, ${bS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const bId = bRes.rows[0].id;
            await sql`INSERT INTO benefit_translations (id, benefit_id, language_code, label) VALUES (${randomUUID()}, ${bId}, 'he', ${bL}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_benefits (id, fungi_id, benefit_id) VALUES (${randomUUID()}, ${fId}, ${bId}) ON CONFLICT DO NOTHING;`;
        }

        // 5. Conditions
        for (const cL of m.conditions) {
            const cS = slugify(cL) || 'c_' + randomUUID().substring(0,8);
            const cRes = await sql`
              INSERT INTO conditions (id, slug, created_at, updated_at) 
              VALUES (${randomUUID()}, ${cS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const cId = cRes.rows[0].id;
            await sql`INSERT INTO condition_translations (id, condition_id, language_code, label) VALUES (${randomUUID()}, ${cId}, 'he', ${cL}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_conditions (id, fungi_id, condition_id) VALUES (${randomUUID()}, ${fId}, ${cId}) ON CONFLICT DO NOTHING;`;
        }

        // 6. Contra
        for (const ctL of m.contraindications) {
            const ctS = slugify(ctL) || 'ct_' + randomUUID().substring(0,8);
            const ctRes = await sql`
              INSERT INTO contraindications (id, slug, created_at, updated_at) 
              VALUES (${randomUUID()}, ${ctS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const ctId = ctRes.rows[0].id;
            await sql`INSERT INTO contraindication_translations (id, contraindication_id, language_code, label) VALUES (${randomUUID()}, ${ctId}, 'he', ${ctL}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_contraindications (id, fungi_id, contraindication_id) VALUES (${randomUUID()}, ${fId}, ${ctId}) ON CONFLICT DO NOTHING;`;
        }

        // 7. Doctor
        for (const dL of m.doctor_consult) {
            const dS = slugify(dL) || 'd_' + randomUUID().substring(0,8);
            const dRes = await sql`
              INSERT INTO doctor_consult_flags (id, slug, created_at, updated_at) 
              VALUES (${randomUUID()}, ${dS}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id;
            `;
            const dId = dRes.rows[0].id;
            await sql`INSERT INTO doctor_consult_flag_translations (id, doctor_consult_flag_id, language_code, label) VALUES (${randomUUID()}, ${dId}, 'he', ${dL}) ON CONFLICT DO NOTHING;`;
            await sql`INSERT INTO fungi_doctor_consult_flags (id, fungi_id, doctor_consult_flag_id) VALUES (${randomUUID()}, ${fId}, ${dId}) ON CONFLICT DO NOTHING;`;
        }
    }

    res.status(200).json({ success: true, message: 'MEGA UPDATE COMPLETED' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
