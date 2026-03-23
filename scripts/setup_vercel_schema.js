import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../.env.development.local') });

async function setupSchema() {
  console.log('Connecting to Vercel Postgres and initializing schema...');

  try {
    // 1. Create ENUMs (using IF NOT EXISTS wrapped in a block since PG doesn't support IF NOT EXISTS directly for Types until PG 12+, but we can just drop them safely if we wipe, or catch the error)
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
    console.log('✅ ENUMs created successfully');

    // 2. Create Admin Table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role role_enum NOT NULL DEFAULT 'editor',
        status admin_status_enum NOT NULL DEFAULT 'active',
        password_hash TEXT NOT NULL,
        totp_enabled BOOLEAN DEFAULT false,
        totp_secret TEXT,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Create Core Fungi Table
    await sql`
      CREATE TABLE IF NOT EXISTS fungi (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        scientific_name TEXT,
        featured_image TEXT,
        status fungi_status_enum NOT NULL DEFAULT 'draft',
        sort_order INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create Fungi Translations
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
        search_keywords TEXT[],
        search_aliases TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fungi_id, language_code)
      );
    `;

    // 5. Benefits & Relations
    await sql`
      CREATE TABLE IF NOT EXISTS benefits (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        status generic_status_enum NOT NULL DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS benefit_translations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        benefit_id UUID REFERENCES benefits(id) ON DELETE CASCADE,
        language_code language_enum NOT NULL,
        label TEXT NOT NULL,
        short_description TEXT,
        search_aliases TEXT[],
        seo_title TEXT,
        seo_meta_description TEXT,
        UNIQUE(benefit_id, language_code)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fungi_benefits (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fungi_id UUID REFERENCES fungi(id) ON DELETE CASCADE,
        benefit_id UUID REFERENCES benefits(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fungi_id, benefit_id)
      );
    `;

    // 6. Conditions & Relations
    await sql`
      CREATE TABLE IF NOT EXISTS conditions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        status generic_status_enum NOT NULL DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS condition_translations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        condition_id UUID REFERENCES conditions(id) ON DELETE CASCADE,
        language_code language_enum NOT NULL,
        label TEXT NOT NULL,
        short_description TEXT,
        search_aliases TEXT[],
        seo_title TEXT,
        seo_meta_description TEXT,
        UNIQUE(condition_id, language_code)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fungi_conditions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fungi_id UUID REFERENCES fungi(id) ON DELETE CASCADE,
        condition_id UUID REFERENCES conditions(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fungi_id, condition_id)
      );
    `;

    // 7. Contraindications
    await sql`
      CREATE TABLE IF NOT EXISTS contraindications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        status generic_status_enum NOT NULL DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        severity severity_enum NOT NULL DEFAULT 'medium',
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS contraindication_translations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        contraindication_id UUID REFERENCES contraindications(id) ON DELETE CASCADE,
        language_code language_enum NOT NULL,
        label TEXT NOT NULL,
        short_description TEXT,
        search_aliases TEXT[],
        UNIQUE(contraindication_id, language_code)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fungi_contraindications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fungi_id UUID REFERENCES fungi(id) ON DELETE CASCADE,
        contraindication_id UUID REFERENCES contraindications(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fungi_id, contraindication_id)
      );
    `;

    // 8. Doctor Consult Flags
    await sql`
      CREATE TABLE IF NOT EXISTS doctor_consult_flags (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        status generic_status_enum NOT NULL DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        severity severity_enum NOT NULL DEFAULT 'medium',
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS doctor_consult_flag_translations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        doctor_consult_flag_id UUID REFERENCES doctor_consult_flags(id) ON DELETE CASCADE,
        language_code language_enum NOT NULL,
        label TEXT NOT NULL,
        short_description TEXT,
        search_aliases TEXT[],
        UNIQUE(doctor_consult_flag_id, language_code)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fungi_doctor_consult_flags (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fungi_id UUID REFERENCES fungi(id) ON DELETE CASCADE,
        doctor_consult_flag_id UUID REFERENCES doctor_consult_flags(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fungi_id, doctor_consult_flag_id)
      );
    `;

    // 9. Interactions
    await sql`
      CREATE TABLE IF NOT EXISTS interaction_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        interaction_type interaction_type_enum NOT NULL,
        target_type target_type_enum NOT NULL,
        evidence_level evidence_level_enum NOT NULL DEFAULT 'unknown',
        status generic_status_enum NOT NULL DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS interaction_item_translations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        interaction_item_id UUID REFERENCES interaction_items(id) ON DELETE CASCADE,
        language_code language_enum NOT NULL,
        label TEXT NOT NULL,
        short_description TEXT,
        details TEXT,
        search_aliases TEXT[],
        UNIQUE(interaction_item_id, language_code)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fungi_interactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fungi_id UUID REFERENCES fungi(id) ON DELETE CASCADE,
        interaction_item_id UUID REFERENCES interaction_items(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        custom_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fungi_id, interaction_item_id)
      );
    `;

    console.log('✅ ALL TABLES CREATED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    process.exit(1);
  }
}

setupSchema();
