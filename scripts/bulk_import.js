import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CSV Parser for this specific file
function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',');
  const result = [];
  
  // Custom logic to handle quoted strings with commas
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && line[j+1] === '"') { // escaped quote
        current += '"';
        j++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = values[idx]?.trim();
    });
    result.push(obj);
  }
  return result;
}

const slugMap = {
  'Trametes versicolor': 'turkey_tail',
  'Cordyceps militaris': 'cordyceps',
  'Tremella fuciformis': 'tremella',
  'Ganoderma lucidum': 'reishi',
  'Hericium erinaceus': 'lions_mane',
  'Inonotus obliquus': 'chaga'
};

async function run() {
  const csvPath = path.join(__dirname, '../context/Mushroom_export.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const records = parseCSV(csvContent);
  
  console.log(`Parsed ${records.length} mushrooms from CSV.`);

  for (const record of records) {
    const slug = slugMap[record.scientific_name];
    if (!slug) {
      console.warn(`No slug found for scientific name: ${record.scientific_name}`);
      continue;
    }

    console.log(`Updating ${record.name} (${slug})...`);

    const payload = {
      lang: 'he',
      data: {
        name: record.name,
        subtitle: record.tagline,
        about: record.description,
        usage: record.how_to_use,
        dosage: record.dosage,
        keywords: JSON.parse(record.search_keywords || '[]'),
        benefits: JSON.parse(record.benefits || '[]'),
        conditions: JSON.parse(record.conditions_treated || '[]'),
        contraindications: JSON.parse(record.contraindications || '[]'),
        doctor_consultation: JSON.parse(record.doctor_consultation_cases || '[]'),
        image: `/assets/${slug}.png`
      }
    };

    try {
      const res = await fetch(`https://wisefungi.vercel.app/api/fungi?action=update&slug=${slug}&secret=wise-fungi-secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log(`Result for ${slug}:`, result);
    } catch (err) {
      console.error(`Error updating ${slug}:`, err.message);
    }
  }
}

run();
