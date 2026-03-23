import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '../.env.local') });

// Translation Map for terms from Translation_export.csv
const termMap = {
  // Hebrew Label -> { en, ru, es }
  "אלצהיימר": { en: "Alzheimer's", ru: "Болезнь Альцгеймера", es: "Alzheimer" },
  "דמנציה": { en: "Dementia", ru: "Деменция", es: "Demencia" },
  "ירידה קוגניטיבית": { en: "Cognitive decline", ru: "Когнитивное снижение", es: "Deterioro cognitivo" },
  "דיכאון": { en: "Depression", ru: "Депрессия", es: "Depresión" },
  "חרדה": { en: "Anxiety", ru: "Тревога", es: "Ansiedad" },
  "PTSD / פוסט טראומה": { en: "PTSD", ru: "ПТСР", es: "TEPT" },
  "טראומה": { en: "Trauma", ru: "Травма", es: "Trauma" },
  "פרקינסון": { en: "Parkinson's", ru: "Болезнь Паркинсона", es: "Parkinson" },
  "טרשת נפוצה": { en: "Multiple sclerosis", ru: "Рассеянный склероз", es: "Esclerosis múltiple" },
  "מחלות אוטואימוניות": { en: "Autoimmune diseases", ru: "Аутоиммунные заболевания", es: "Enfermedades autoinmunes" },
  "קרוהן": { en: "Crohn's disease", ru: "Болезнь Крона", es: "Enfermedad de Crohn" },
  "קוליטיס כיבית": { en: "Ulcerative colitis", ru: "Язвенный колит", es: "Colitis ulcerosa" },
  "מעי רגיז (IBS)": { en: "Irritable bowel syndrome (IBS)", ru: "Синдром раздражённого кишечника", es: "Síndrome del intestino irritable (SII)" },
  "מעי דולף": { en: "Leaky gut", ru: "Синдром дырявого кишечника", es: "Intestino permeable" },
  "צליאק": { en: "Celiac disease", ru: "Целиакия", es: "Celiaquía" },
  "קנדידה": { en: "Candidiasis", ru: "Кандидоз", es: "Candidiasis" },
  "סרטן": { en: "Cancer", ru: "Рак", es: "Cáncer" },
  "פיברומיאלגיה": { en: "Fibromyalgia", ru: "Фибромиалгия", es: "Fibromialgia" },
  "פסוריאזיס": { en: "Psoriasis", ru: "Псориаз", es: "Psoriasis" },
  "סקלרודרמה": { en: "Scleroderma", ru: "Склеродермия", es: "Esclerodermia" },
  "וסקוליטיס": { en: "Vasculitis", ru: "Васкулит", es: "Vasculitis" },
  "סכרת סוג 1": { en: "Type 1 diabetes", ru: "Диабет 1 типа", es: "Diabetes tipo 1" },
  "סכרת סוג 2": { en: "Type 2 diabetes", ru: "Диабет 2 типа", es: "Diabetes tipo 2" },
  "לחץ דם גבוה": { en: "High blood pressure", ru: "Высокое кровяное давление", es: "Hipertensión arterial" },
  "כולסטרול גבוה": { en: "High cholesterol", ru: "Высокий холестерин", es: "Colesterol elevado" },
  "מחלות לב וכלי דם": { en: "Cardiovascular diseases", ru: "Сердечно-сосудистые заболевания", es: "Enfermedades cardiovasculares" },
  "כבד שומני / הפטיטיס": { en: "Fatty liver / Hepatitis", ru: "Жировая болезнь печени", es: "Hígado graso" },
  "אסתמה": { en: "Asthma", ru: "Астма", es: "Asma" },
  "אלרגיות עונתיות": { en: "Seasonal allergies", ru: "Сезонная аллергия", es: "Alergias estacionales" },
  "מיגרנה / כאב ראש כרוני": { en: "Migraine", ru: "Мигрень", es: "Migraña" },
  "דלקת פרקים (ארתריטיס)": { en: "Arthritis", ru: "Артрит", es: "Artritis" },
  "דלקת כרונית": { en: "Chronic inflammation", ru: "Хроническое воспаление", es: "Inflamación crónica" },
  "עייפות כרונית": { en: "Chronic fatigue", ru: "Хроническая усталость", es: "Fatiga crónica" },
  "נדודי שינה (אינסומניה)": { en: "Insomnia", ru: "Бессонница", es: "Insomnio" },
  "אנדומטריוזיס": { en: "Endometriosis", ru: "Эндометриоз", es: "Endometriosis" },
  "אנמיה": { en: "Anemia", ru: "Анемия", es: "Anemia" },
  "גאוט": { en: "Gout", ru: "Подагра", es: "Gota" },
  "השמנת יתר": { en: "Obesity", ru: "Ожирение", es: "Obesidad" },
  "זיהומי שתן": { en: "Urinary tract infections", ru: "Инфекции мочевыводящих путей", es: "Infecciones urinarias" },
  "עור יבש כרוני": { en: "Chronic dry skin", ru: "Хроническая сухость кожи", es: "Piel seca" },
  "קמטים ואובדן גמישות": { en: "Wrinkles", ru: "Мורщины", es: "Arrugas" },
  "אקזמה": { en: "Eczema", ru: "Экзема", es: "Eccema" },
  "כאבי מפרקים": { en: "Joint pain", ru: "Боль в суставах", es: "Dolor articular" },
  "ערפל מחשבתי": { en: "Brain fog", ru: "Туман в голове", es: "Niebla mental" },
  "סטרס / לחץ נפשי": { en: "Stress", ru: "Стресс", es: "Estrés" },
  "שיפור שינה": { en: "Improved sleep", ru: "Улучшение сна", es: "Mejora del sueño" },
  "זיכרון": { en: "Memory", ru: "Память", es: "Memoria" },
  "ריכוז": { en: "Concentration", ru: "Концентрация", es: "Concentración" },
  "אנרגיה": { en: "Energy", ru: "Энергия", es: "Energía" },
  "חיזוק מערכת חיסון": { en: "Immune boost", ru: "Укрепление иммунитета", es: "Refuerzo inmune" },
  "נוגד חמצון": { en: "Antioxidant", ru: "Антиоксидант", es: "Antioxidante" },
  "בריאות העור": { en: "Skin health", ru: "Здоровье кожи", es: "Salud de la piel" },
  "לחות העור": { en: "Skin hydration", ru: "Увлажнение кожи", es: "Hidratación de la piel" },
  "ייצור קולגן": { en: "Collagen production", ru: "Выработка коллагена", es: "Producción de colágeno" },
  "ביצועים פיזיים": { en: "Physical performance", ru: "Физическая производительность", es: "Rendimiento físico" },
  "סיבולת": { en: "Endurance", ru: "Выносливость", es: "Resistencia" },
  "תפקוד ריאות ונשימה": { en: "Lung function", ru: "Функция лёгких", es: "Función pulmonar" },
  "מיקרביום ומעי": { en: "Gut microbiome", ru: "Кишечный микробиом", es: "Microbioma intestinal" },
  "אנטי אייג'ינג": { en: "Anti-aging", ru: "Антивозрастной эффект", es: "Antienvejecimiento" },
  "גורם גדילה עצבי (NGF)": { en: "NGF", ru: "NGF", es: "NGF" }
};

async function seed() {
  const mushroomDataFile = path.join(__dirname, '../context/Mushroom_export.csv');
  const csvContent = fs.readFileSync(mushroomDataFile, 'utf8');
  const records = parse(csvContent, { columns: true });

  for (const record of records) {
    const slug = record.scientific_name.toLowerCase().replace(/ /g, '_'); // fallback slug
    const sciName = record.scientific_name;
    const img = record.mushroom_image_url;
    
    console.log(`Processing mushroom: ${record.name} (${sciName})`);

    // 1. Upsert Fungi
    const fungiResult = await sql`
      INSERT INTO fungi (slug, scientific_name, featured_image, status, sort_order)
      VALUES (${slug}, ${sciName}, ${img}, 'published', (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM fungi))
      ON CONFLICT (slug) DO UPDATE SET 
        scientific_name = EXCLUDED.scientific_name,
        featured_image = EXCLUDED.featured_image
      RETURNING id;
    `;
    const fungiId = fungiResult.rows[0].id;

    // 2. Insert Translations (Hebrew)
    await sql`
      INSERT INTO fungi_translations (fungi_id, language_code, name, about_this_mushroom, how_to_use, recommended_dosage)
      VALUES (${fungiId}, 'he', ${record.name}, ${record.description}, ${record.how_to_use}, ${record.dosage})
      ON CONFLICT (fungi_id, language_code) DO UPDATE SET 
        name = EXCLUDED.name,
        about_this_mushroom = EXCLUDED.about_this_mushroom,
        how_to_use = EXCLUDED.how_to_use,
        recommended_dosage = EXCLUDED.recommended_dosage;
    `;

    // 2b. Add Keywords to Search Index
    const keywords = JSON.parse(record.search_keywords || '[]');
    for (const kw of keywords) {
      await sql`
        INSERT INTO search_index (fungi_id, keyword, language_code, category)
        VALUES (${fungiId}, ${kw}, 'he', 'topic')
        ON CONFLICT DO NOTHING;
      `;
    }

    // 3. Process Benefits
    const benefits = JSON.parse(record.benefits || '[]');
    for (const bLabelHe of benefits) {
      // Create benefit entry
      const bRes = await sql`
        INSERT INTO benefits (status) VALUES ('active') RETURNING id;
      `;
      const bId = bRes.rows[0].id;
      
      const termTranslation = termMap[bLabelHe] || { en: bLabelHe, ru: bLabelHe, es: bLabelHe };
      
      // Register translations for the benefit
      const langs = ['he', 'en', 'ru', 'es'];
      for (const l of langs) {
        const lbl = l === 'he' ? bLabelHe : termTranslation[l];
        await sql`
          INSERT INTO benefit_translations (benefit_id, language_code, label)
          VALUES (${bId}, ${l}, ${lbl})
          ON CONFLICT (benefit_id, language_code) DO NOTHING;
        `;
      }

      // Link to fungi
      await sql`
        INSERT INTO fungi_benefits (fungi_id, benefit_id) VALUES (${fungiId}, ${bId}) ON CONFLICT DO NOTHING;
      `;
    }

    // 4. Process Conditions
    const conditions = JSON.parse(record.conditions_treated || '[]');
    for (const cLabelHe of conditions) {
      const cRes = await sql`
        INSERT INTO conditions (status) VALUES ('active') RETURNING id;
      `;
      const cId = cRes.rows[0].id;
      
      const termTranslation = termMap[cLabelHe] || { en: cLabelHe, ru: cLabelHe, es: cLabelHe };
      
      const langs = ['he', 'en', 'ru', 'es'];
      for (const l of langs) {
        const lbl = l === 'he' ? cLabelHe : termTranslation[l];
        await sql`
          INSERT INTO condition_translations (condition_id, language_code, label)
          VALUES (${cId}, ${l}, ${lbl})
          ON CONFLICT (condition_id, language_code) DO NOTHING;
        `;
      }

      await sql`
        INSERT INTO fungi_conditions (fungi_id, condition_id) VALUES (${fungiId}, ${cId}) ON CONFLICT DO NOTHING;
      `;
    }

    // 5. Contraindications
    const contra = JSON.parse(record.contraindications || '[]');
    for (const ctLabelHe of contra) {
      const ctRes = await sql`
        INSERT INTO contraindications (status) VALUES ('active') RETURNING id;
      `;
      const ctId = ctRes.rows[0].id;
      
      const langs = ['he', 'en', 'ru', 'es'];
      for (const l of langs) {
        await sql`
          INSERT INTO contraindication_translations (contraindication_id, language_code, label)
          VALUES (${ctId}, ${l}, ${ctLabelHe})
          ON CONFLICT DO NOTHING;
        `;
      }

      await sql`
        INSERT INTO fungi_contraindications (fungi_id, contraindication_id) VALUES (${fungiId}, ${ctId}) ON CONFLICT DO NOTHING;
      `;
    }
  }
  
  console.log("Seeding completed successfully!");
}

seed().catch(err => {
  console.error("Critical seeding error:", err);
  process.exit(1);
});
