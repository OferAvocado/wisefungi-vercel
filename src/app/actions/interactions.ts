'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInteractionItem(data: {
  slug: string;
  interaction_type: 'high_risk' | 'moderate_interaction' | 'helpful_combination' | 'unknown_insufficient_research';
  target_type: 'medication' | 'supplement' | 'herb' | 'condition' | 'food' | 'substance' | 'general';
  evidence_level: 'clinical_evidence' | 'limited_research' | 'traditional_use' | 'unknown';
  translations: {
    language_code: "en" | "he" | "es" | "ru";
    label: string;
    short_description?: string;
    details?: string;
  }[]
}) {
  const result = await prisma.interactionItem.create({
    data: {
      slug: data.slug,
      interaction_type: data.interaction_type,
      target_type: data.target_type,
      evidence_level: data.evidence_level,
      translations: { create: data.translations }
    }
  });

  revalidatePath('/admin/interactions');
  return result;
}

export async function deleteInteractionItem(id: string) {
  await prisma.interactionItem.delete({ where: { id }});
  revalidatePath('/admin/interactions');
}
