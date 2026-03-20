'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getAdmins() {
  return await prisma.admin.findMany({
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      status: true,
      last_login_at: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function createAdmin(data: { full_name: string; email: string; password_raw: string; role: 'super_admin' | 'editor' | 'translator' }) {
  const hashedPassword = await bcrypt.hash(data.password_raw, 10);
  
  const result = await prisma.admin.create({
    data: {
      full_name: data.full_name,
      email: data.email,
      password_hash: hashedPassword,
      role: data.role,
      status: 'active',
      totp_enabled: false,
    }
  });

  revalidatePath('/admin/users');
  return { success: true, id: result.id };
}

export async function toggleAdminStatus(id: string, currentStatus: 'active' | 'disabled') {
  await prisma.admin.update({
    where: { id },
    data: { status: currentStatus === 'active' ? 'disabled' : 'active' }
  });
  revalidatePath('/admin/users');
}
