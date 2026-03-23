const fs = require('fs');
const path = require('path');
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.development.local' });

function parseCSV(csvText) {
  const result = [];
  const lines = csvText.split('\n');
  if (lines.length === 0) return result;
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple regex for CSV parsing (handles quotes)
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal);
    
    const obj = {};
    headers.forEach((h, index) => {
      let head = h.replace(/"/g, '');
      let val = (values[index] || '').replace(/^"(.*)"$/, '$1'); // remove surrounding quotes
      obj[head] = val;
    });
    result.push(obj);
  }
  return result;
}

async function seed() {
  const client = await db.connect();
  
  console.log("Connected to Vercel Postgres!");

  // --- Seed Search Index ---
  console.log("Seeding Search Index...");
  const searchCsv = fs.readFileSync(path.join(__dirname, 'context', 'SearchIndex_export.csv'), 'utf-8').replace(/\r/g, '');
  const searchIndex = parseCSV(searchCsv);

  await client.sql`
    CREATE TABLE IF NOT EXISTS search_index (
      id VARCHAR(255) PRIMARY KEY,
      mushroom_name_he VARCHAR(255),
      language VARCHAR(50),
      mushroom_name_en VARCHAR(255),
      keyword VARCHAR(255),
      category VARCHAR(255),
      created_date TIMESTAMP,
      updated_date TIMESTAMP,
      created_by_id VARCHAR(255),
      is_sample BOOLEAN
    );
  `;
  
  for (const item of searchIndex) {
    if(!item.id) continue;
    await client.sql`
      INSERT INTO search_index (id, mushroom_name_he, language, mushroom_name_en, keyword, category, created_date, updated_date, created_by_id, is_sample)
      VALUES (${item.id}, ${item.mushroom_name_he}, ${item.language}, ${item.mushroom_name_en}, ${item.keyword}, ${item.category}, ${item.created_date ? new Date(item.created_date) : null}, ${item.updated_date ? new Date(item.updated_date) : null}, ${item.created_by_id}, ${item.is_sample === 'true'})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // --- Seed Translations ---
  console.log("Seeding Translations...");
  const transCsv = fs.readFileSync(path.join(__dirname, 'context', 'Translation_export.csv'), 'utf-8').replace(/\r/g, '');
  const translations = parseCSV(transCsv);

  await client.sql`
    CREATE TABLE IF NOT EXISTS translations (
      id VARCHAR(255) PRIMARY KEY,
      key VARCHAR(255),
      category VARCHAR(255),
      en TEXT,
      he TEXT,
      es TEXT,
      ru TEXT,
      created_date TIMESTAMP,
      updated_date TIMESTAMP,
      created_by_id VARCHAR(255),
      is_sample BOOLEAN
    );
  `;
  
  for (const item of translations) {
    if(!item.id) continue;
    await client.sql`
      INSERT INTO translations (id, key, category, en, he, es, ru, created_date, updated_date, created_by_id, is_sample)
      VALUES (${item.id}, ${item.key}, ${item.category}, ${item.en}, ${item.he}, ${item.es}, ${item.ru}, ${item.created_date ? new Date(item.created_date) : null}, ${item.updated_date ? new Date(item.updated_date) : null}, ${item.created_by_id}, ${item.is_sample === 'true'})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // --- Seed Interactions ---
  console.log("Seeding Interactions...");
  const interCsv = fs.readFileSync(path.join(__dirname, 'context', 'Interaction_export.csv'), 'utf-8').replace(/\r/g, '');
  const interactions = parseCSV(interCsv);

  await client.sql`
    CREATE TABLE IF NOT EXISTS interactions (
      id VARCHAR(255) PRIMARY KEY,
      interaction_type VARCHAR(255),
      mechanism TEXT,
      substance_a VARCHAR(255),
      substance_b VARCHAR(255),
      confidence VARCHAR(50),
      created_date TIMESTAMP,
      updated_date TIMESTAMP,
      created_by_id VARCHAR(255),
      is_sample BOOLEAN
    );
  `;
  
  for (const item of interactions) {
    if(!item.id) continue;
    await client.sql`
      INSERT INTO interactions (id, interaction_type, mechanism, substance_a, substance_b, confidence, created_date, updated_date, created_by_id, is_sample)
      VALUES (${item.id}, ${item.interaction_type}, ${item.mechanism}, ${item.substance_a}, ${item.substance_b}, ${item.confidence}, ${item.created_date ? new Date(item.created_date) : null}, ${item.updated_date ? new Date(item.updated_date) : null}, ${item.created_by_id}, ${item.is_sample === 'true'})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  console.log("Seeding complete!");
  client.release();
}

seed().catch(err => console.error("Error seeding DB:", err));
