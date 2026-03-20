'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addFungiBenefit(fungiId: string, benefitId: string, isPrimary: boolean = false) {
  const result = await prisma.fungiBenefit.create({
    data: {
      fungi_id: fungiId,
      benefit_id: benefitId,
      is_primary: isPrimary,
      sort_order: 0,
    }
  });
  revalidatePath(`/admin/fungi/${fungiId}`);
  return result;
}

export async function removeFungiBenefit(fungiId: string, benefitId: string) {
  await prisma.fungiBenefit.deleteMany({
    where: { fungi_id: fungiId, benefit_id: benefitId }
  });
  revalidatePath(`/admin/fungi/${fungiId}`);
}

export async function addFungiCondition(fungiId: string, conditionId: string) {
    const result = await prisma.fungiCondition.create({
      data: {
        fungi_id: fungiId,
        condition_id: conditionId,
        is_primary: false,
        sort_order: 0,
      }
    });
    revalidatePath(`/admin/fungi/${fungiId}`);
    return result;
}

export async function removeFungiCondition(fungiId: string, conditionId: string) {
    await prisma.fungiCondition.deleteMany({
      where: { fungi_id: fungiId, condition_id: conditionId }
    });
    revalidatePath(`/admin/fungi/${fungiId}`);
}
