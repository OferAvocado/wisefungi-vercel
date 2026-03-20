// @ts-nocheck
/* eslint-disable */
import { prisma } from "@/lib/prisma";
import ClientHome from "@/components/ClientHome";

// Forces the page to re-evaluate at request time to ensure fresh DB data
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch from the live DB!
  const dbFungi = await prisma.fungi.findMany({
    where: { status: 'published' },
    include: {
      translations: true,
      benefits: { include: { benefit: { include: { translations: true } } } },
      conditions: { include: { condition: { include: { translations: true } } } },
      contraindications: { include: { contraindication: { include: { translations: true } } } },
      doctor_consult_flags: { include: { doctor_consult_flag: { include: { translations: true } } } },
      interactions: { include: { interaction_item: { include: { translations: true } } } }
    },
    orderBy: { sort_order: 'asc' }
  });

  // Map the raw relationship tree from Prisma into the exact format ClientHome expects (from original App.jsx)
  const mappedFungi = dbFungi.map((f) => {
    // We prioritize Hebrew ('he') translation since the system targets Hebrew users.
    const heTranslation = f.translations.find(t => t.language_code === 'he') || f.translations[0];
    
    return {
      id: f.id,
      slug: f.slug, 
      name: heTranslation?.name || f.scientific_name,
      subtitle: f.scientific_name,
      image: f.featured_image || `/assets/${f.slug.replace('-', '_')}.png`, // Fallback for UX migration
      detailed_data: {
        about: heTranslation?.about_this_mushroom || '',
        usage: heTranslation?.how_to_use || '',
        dosage: heTranslation?.recommended_dosage || '',
        benefits: f.benefits.map(b => {
          const t = b.benefit.translations.find(tr => tr.language_code === 'he') || b.benefit.translations[0];
          return t?.label || b.benefit.slug;
        }),
        conditions: f.conditions.map(c => {
          const t = c.condition.translations.find(tr => tr.language_code === 'he') || c.condition.translations[0];
          return t?.label || c.condition.slug;
        }),
        contraindications: f.contraindications.map(ci => {
          const t = ci.contraindication.translations.find(tr => tr.language_code === 'he') || ci.contraindication.translations[0];
          return t?.label || ci.contraindication.slug;
        }),
        doctor_consultation: f.doctor_consult_flags.map(dcf => {
          const t = dcf.doctor_consult_flag.translations.find(tr => tr.language_code === 'he') || dcf.doctor_consult_flag.translations[0];
          return t?.label || dcf.doctor_consult_flag.slug;
        }),
        interactions: f.interactions.map(int => {
          const t = int.interaction_item.translations.find(tr => tr.language_code === 'he') || int.interaction_item.translations[0];
          return {
            name: t?.label || int.interaction_item.slug,
            details: t?.details || t?.short_description || '',
            type: int.interaction_item.interaction_type,
            evidence: int.interaction_item.evidence_level,
          };
        }),
      }
    };
  });

  return <ClientHome initialFungi={mappedFungi} />;
}
