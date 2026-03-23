const fs = require('fs');

try {
  const csv = fs.readFileSync('context/Interaction_export.csv', 'utf8');
  const lines = csv.split('\n');
  const headers = lines[0].trim().split(',');

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    let values = [];
    let inString = false;
    let curr = '';
    for (let c of lines[i]) {
      if (c === '"') inString = !inString;
      else if (c === ',' && !inString) {
        values.push(curr);
        curr = '';
      } else {
        curr += c;
      }
    }
    values.push(curr);
    
    let row = {};
    for(let j=0; j<headers.length; j++) {
      if(headers[j]) {
        row[headers[j]] = values[j] ? values[j].trim() : '';
      }
    }
    data.push(row);
  }
  fs.writeFileSync('src/assets/interactionsData.json', JSON.stringify(data, null, 2));
  console.log('Saved to src/assets/interactionsData.json, total records: ' + data.length);
} catch (e) {
  console.error("Error: ", e);
}
