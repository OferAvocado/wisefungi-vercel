import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // 1. Add tagline to fungi_translations
    await sql.query(`
      ALTER TABLE fungi_translations ADD COLUMN IF NOT EXISTS tagline TEXT;
    `);

    // 2. Create UI translations table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ui_translations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) NOT NULL,
        lang VARCHAR(10) NOT NULL,
        value TEXT NOT NULL,
        UNIQUE(key, lang)
      );
    `);

    // 3. Populate default UI translations for Hebrew if empty
    const { rows } = await sql`SELECT count(*) FROM ui_translations WHERE lang = 'he'`;
    if (parseInt(rows[0].count) === 0) {
      await sql`INSERT INTO ui_translations (key, lang, value) VALUES ('hero_title', 'he', 'חכמת הפטריות')`;
      await sql`INSERT INTO ui_translations (key, lang, value) VALUES ('hero_subtitle', 'he', 'גלו את הכוח המרפא של פטריות מרפא מתקדמות. חוכמה עתיקה פוגשת מדע מודרני מבוסס ראיות.')`;
      await sql`INSERT INTO ui_translations (key, lang, value) VALUES ('search_placeholder', 'he', 'חפשו פטרייה, יתרון או מצב בריאותי...')`;
    }

    res.status(200).json({ success: true, message: 'DB setup complete' });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
