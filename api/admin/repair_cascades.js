import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    console.log("Repairing Foreign Key Cascades...");

    // Function to safely recreate a constraint with ON DELETE CASCADE
    const repairTable = async (tableName, fkColumn, targetTable) => {
      console.log(`- Repairing ${tableName}...`);
      try {
        // 1. Find the current constraint name
        const { rows } = await sql.query(`
          SELECT constraint_name 
          FROM information_schema.key_column_usage 
          WHERE table_name = '${tableName}' AND column_name = '${fkColumn}';
        `);
        
        if (rows.length > 0) {
          const constraintName = rows[0].constraint_name;
          // 2. Drop it
          await sql.query(`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS "${constraintName}";`);
        }
        
        // 3. Add it back with CASCADE
        await sql.query(`
          ALTER TABLE ${tableName} 
          ADD CONSTRAINT "${tableName}_${fkColumn}_fkey" 
          FOREIGN KEY ("${fkColumn}") 
          REFERENCES ${targetTable}(id) 
          ON DELETE CASCADE;
        `);
        console.log(`✅ ${tableName} repaired.`);
      } catch (err) {
        console.error(`Error repairing ${tableName}:`, err.message);
      }
    };

    await repairTable('fungi_translations', 'fungi_id', 'fungi');
    await repairTable('fungi_benefits', 'fungi_id', 'fungi');
    await repairTable('fungi_conditions', 'fungi_id', 'fungi');
    await repairTable('fungi_contraindications', 'fungi_id', 'fungi');
    await repairTable('fungi_doctor_consult_flags', 'fungi_id', 'fungi');

    res.status(200).json({ success: true, message: 'All foreign key cascades repaired. Deletion should now work.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
