// @ts-nocheck
/* eslint-disable */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const heDataPath = path.join(process.cwd(), 'src', 'locales', 'he.json');
    const heDataRaw = fs.readFileSync(heDataPath, 'utf8');
    const heData = JSON.parse(heDataRaw);

    const intDataPath = path.join(process.cwd(), 'public', 'assets', 'original_interactions.json');
    const intDataRaw = fs.readFileSync(intDataPath, 'utf8');
    const intData = JSON.parse(intDataRaw);

    const mushrooms = heData.mushrooms;
    
    const nameMap = {
      'reishi': 'Reishi',
      'lions_mane': "Lion's Mane",
      'cordyceps': 'Cordyceps',
      'chaga': 'Chaga',
      'turkey_tail': 'Turkey Tail',
      'tremella': 'Tremella'
    };

    let count = 0;

    for (const [key, slug] of Object.entries(nameMap)) {
      const mushHe = mushrooms[key];
      if (!mushHe) continue;

      const pFungus = await prisma.fungi.upsert({
        where: { slug: key },
        update: {},
        create: {
          slug: key,
          scientific_name: mushHe.subtitle,
          status: 'published',
          sort_order: count++,
          featured_image: mushHe.image,
          translations: {
            create: {
              language_code: 'he',
              name: mushHe.name,
              about_this_mushroom: mushHe.detailed_data.about,
              how_to_use: mushHe.detailed_data.usage || '',
              recommended_dosage: mushHe.detailed_data.dosage || ''
            }
          }
        }
      });

      const benefits = mushHe.detailed_data.benefits || [];
      for (const ben of benefits) {
        const benSlug = ben.replace(/[\s"'/]+/g, '-');
        const pBen = await prisma.taxonomy_benefit.upsert({
          where: { slug: benSlug },
          update: {},
          create: {
            slug: benSlug,
            translations: { create: { language_code: 'he', label: ben } }
          }
        });
        const existingLink = await prisma.fungi_benefit.findFirst({ where: { fungi_id: pFungus.id, benefit_id: pBen.id } });
        if (!existingLink) await prisma.fungi_benefit.create({ data: { fungi_id: pFungus.id, benefit_id: pBen.id }});
      }

      const conditions = mushHe.detailed_data.conditions || [];
      for (const cond of conditions) {
        const condSlug = cond.replace(/[\s"'/]+/g, '-');
        const pCond = await prisma.taxonomy_condition.upsert({
          where: { slug: condSlug },
          update: {},
          create: {
            slug: condSlug,
            translations: { create: { language_code: 'he', label: cond } }
          }
        });
        const existingLink = await prisma.fungi_condition.findFirst({ where: { fungi_id: pFungus.id, condition_id: pCond.id } });
        if (!existingLink) await prisma.fungi_condition.create({ data: { fungi_id: pFungus.id, condition_id: pCond.id }});
      }

      const contraindications = mushHe.detailed_data.contraindications || [];
      for (const contra of contraindications) {
        const contraSlug = contra.replace(/[\s"'/]+/g, '-');
        const pContra = await prisma.taxonomy_contraindication.upsert({
          where: { slug: contraSlug },
          update: {},
          create: {
            slug: contraSlug,
            translations: { create: { language_code: 'he', label: contra } }
          }
        });
        const existingLink = await prisma.fungi_contraindication.findFirst({ where: { fungi_id: pFungus.id, contraindication_id: pContra.id } });
        if (!existingLink) await prisma.fungi_contraindication.create({ data: { fungi_id: pFungus.id, contraindication_id: pContra.id }});
      }

      const doctorConsultations = mushHe.detailed_data.doctor_consultation;
      if (doctorConsultations) {
        const docFlags = doctorConsultations.split(',').map(s => s.trim());
        for (const flag of docFlags) {
          if(!flag) continue;
          const flagSlug = flag.replace(/[\s"'/]+/g, '-');
          const pFlag = await prisma.taxonomy_doctor_consult_flag.upsert({
            where: { slug: flagSlug },
            update: {},
            create: {
              slug: flagSlug,
              translations: { create: { language_code: 'he', label: flag } }
            }
          });
          const existingLink = await prisma.fungi_doctor_consult_flag.findFirst({ where: { fungi_id: pFungus.id, doctor_consult_flag_id: pFlag.id } });
          if (!existingLink) await prisma.fungi_doctor_consult_flag.create({ data: { fungi_id: pFungus.id, doctor_consult_flag_id: pFlag.id }});
        }
      }

      const mushInts = intData[slug];
      if (mushInts) {
        const types = [
          { key: 'do_not_combine', type: 'high_risk' },
          { key: 'use_caution', type: 'moderate_interaction' },
          { key: 'potential_synergy', type: 'synergy' },
          { key: 'insufficient', type: 'no_interaction' }
        ];

        for (const t of types) {
          const items = mushInts[t.key] || [];
          for (const item of items) {
             const intNameEn = typeof item.name === 'object' ? item.name.en : item.name;
             const intNameHe = typeof item.name === 'object' ? item.name.he : item.name;
             const why = typeof item.why === 'object' ? item.why.he : item.why;
             
             const intSlug = intNameEn.replace(/[\s"'/()]+/g, '-').toLowerCase();

             const pInt = await prisma.taxonomy_interaction.upsert({
               where: { slug: intSlug },
               update: {},
               create: {
                 slug: intSlug,
                 interaction_type: t.type,
                 evidence_level: item.evidence || 'limited',
                 translations: {
                   create: {
                     language_code: 'he',
                     label: intNameHe,
                     short_description: why,
                     details: why
                   }
                 }
               }
             });

             const existingLink = await prisma.fungi_interaction.findFirst({ where: { fungi_id: pFungus.id, interaction_item_id: pInt.id } });
             if (!existingLink) await prisma.fungi_interaction.create({ data: { fungi_id: pFungus.id, interaction_item_id: pInt.id }});
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Database seeded perfectly with 6 primary mushrooms!" });
  } catch(e) {
    return NextResponse.json({ error: String(e), stack: e?.stack || '' }, { status: 500 });
  }
}
