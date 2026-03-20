'use server';

import { prisma } from "@/lib/prisma";

export async function getBenefits(language_code: "en" | "he" | "es" | "ru" = "en") {
  return await prisma.benefit.findMany({
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' },
    include: {
      translations: {
        where: { language_code },
        select: { label: true }
      }
    }
  });
}

export async function getConditions(language_code: "en" | "he" | "es" | "ru" = "en") {
  return await prisma.condition.findMany({
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' },
    include: {
      translations: {
        where: { language_code },
        select: { label: true }
      }
    }
  });
}

export async function getContraindications(language_code: "en" | "he" | "es" | "ru" = "en") {
  return await prisma.contraindication.findMany({
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' },
    include: {
      translations: {
        where: { language_code },
        select: { label: true }
      }
    }
  });
}

export async function getDoctorConsultFlags(language_code: "en" | "he" | "es" | "ru" = "en") {
  return await prisma.doctorConsultFlag.findMany({
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' },
    include: {
      translations: {
        where: { language_code },
        select: { label: true }
      }
    }
  });
}

export async function getInteractionItems(language_code: "en" | "he" | "es" | "ru" = "en") {
  return await prisma.interactionItem.findMany({
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' },
    include: {
      translations: {
        where: { language_code },
        select: { label: true }
      }
    }
  });
}
