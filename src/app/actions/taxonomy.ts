'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TaxonomyType = 'benefits' | 'conditions' | 'contraindications' | 'doctor_consult_flags';

export async function createTaxonomyItem(type: TaxonomyType, data: {
  slug: string;
  translations: {
    language_code: "en" | "he" | "es" | "ru";
    label: string;
    short_description?: string;
  }[]
}) {
  let result;
  
  if (type === 'benefits') {
    result = await prisma.benefit.create({
      data: {
        slug: data.slug,
        translations: { create: data.translations }
      }
    });
  } else if (type === 'conditions') {
    result = await prisma.condition.create({
      data: {
        slug: data.slug,
        translations: { create: data.translations }
      }
    });
  } else if (type === 'contraindications') {
    result = await prisma.contraindication.create({
      data: {
        slug: data.slug,
        severity: 'medium', // Default
        translations: { create: data.translations }
      }
    });
  } else if (type === 'doctor_consult_flags') {
    result = await prisma.doctorConsultFlag.create({
      data: {
        slug: data.slug,
        severity: 'high', // Default
        translations: { create: data.translations }
      }
    });
  }

  revalidatePath('/admin/taxonomy');
  return result;
}

export async function deleteTaxonomyItem(type: TaxonomyType, id: string) {
  if (type === 'benefits') await prisma.benefit.delete({ where: { id }});
  else if (type === 'conditions') await prisma.condition.delete({ where: { id }});
  else if (type === 'contraindications') await prisma.contraindication.delete({ where: { id }});
  else if (type === 'doctor_consult_flags') await prisma.doctorConsultFlag.delete({ where: { id }});
  
  revalidatePath('/admin/taxonomy');
}
