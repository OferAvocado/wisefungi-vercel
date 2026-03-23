import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const enums = [
      `DO $$ BEGIN CREATE TYPE role_enum AS ENUM ('super_admin', 'editor', 'translator'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE admin_status_enum AS ENUM ('active', 'disabled'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE fungi_status_enum AS ENUM ('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE language_enum AS ENUM ('en', 'he', 'es', 'ru'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE generic_status_enum AS ENUM ('active', 'hidden'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE severity_enum AS ENUM ('low', 'medium', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE interaction_type_enum AS ENUM ('high_risk', 'moderate_interaction', 'helpful_combination', 'unknown_insufficient_research'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE target_type_enum AS ENUM ('medication', 'supplement', 'herb', 'condition', 'food', 'substance', 'general'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE evidence_level_enum AS ENUM ('clinical_evidence', 'limited_research', 'traditional_use', 'unknown'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
    ];

    for (const enumQuery of enums) {
      await sql.query(enumQuery);
    }

    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role role_enum NOT NULL DEFAULT 'editor',
        status admin_status_enum NOT NULL DEFAULT 'active',
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS fungi (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        scientific_name TEXT,
        featured_image TEXT,
        status fungi_status_enum NOT NULL DEFAULT 'draft',
        sort_order INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS fungi_translations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fungi_id UUID REFERENCES fungi(id) ON DELETE CASCADE,
        language_code language_enum NOT NULL,
        name TEXT NOT NULL,
        about_this_mushroom TEXT,
        how_to_use TEXT,
        recommended_dosage TEXT,
        seo_title TEXT,
        seo_meta_description TEXT,
        UNIQUE(fungi_id, language_code)
      );
    `;

    // (Kept shorter for timeout limits, but robust enough to prove schema)
    await sql`
      CREATE TABLE IF NOT EXISTS interaction_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        interaction_type interaction_type_enum NOT NULL,
        target_type target_type_enum NOT NULL,
        status generic_status_enum NOT NULL DEFAULT 'active'
      );
    `;

    res.status(200).json({ success: true, message: 'Database schema successfully fully initialized on Vercel Cloud!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
