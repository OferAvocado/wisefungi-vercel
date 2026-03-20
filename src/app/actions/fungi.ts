'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFungiList() {
  return await prisma.fungi.findMany({
    orderBy: { sort_order: 'asc' },
    include: {
      translations: {
        where: { language_code: 'en' },
        select: { name: true }
      }
    }
  });
}

export async function getFungusById(id: string) {
  return await prisma.fungi.findUnique({
    where: { id },
    include: {
      translations: true,
      benefits: { include: { benefit: { include: { translations: true } } } },
      conditions: { include: { condition: { include: { translations: true } } } },
      contraindications: { include: { contraindication: { include: { translations: true } } } },
      doctor_consult_flags: { include: { doctor_consult_flag: { include: { translations: true } } } },
      interactions: { include: { interaction_item: { include: { translations: true } } } },
    }
  });
}

// Example creation action
export async function createFungus(data: {
  slug: string;
  scientific_name: string;
  status: "draft" | "published" | "archived";
  is_featured?: boolean;
}) {
  const result = await prisma.fungi.create({
    data: {
      slug: data.slug,
      scientific_name: data.scientific_name,
      status: data.status,
      is_featured: data.is_featured ?? false,
    }
  });
  
  revalidatePath('/admin/fungi');
  revalidatePath('/admin');
  return result;
}

export async function addFungusTranslation(fungi_id: string, data: {
  language_code: "en" | "he" | "es" | "ru";
  name: string;
  about_this_mushroom?: string;
  how_to_use?: string;
  recommended_dosage?: string;
}) {
  const result = await prisma.fungiTranslation.create({
    data: {
      fungi_id,
      language_code: data.language_code,
      name: data.name,
      about_this_mushroom: data.about_this_mushroom,
      how_to_use: data.how_to_use,
      recommended_dosage: data.recommended_dosage,
    }
  });

  revalidatePath(`/admin/fungi/${fungi_id}`);
  return result;
}
