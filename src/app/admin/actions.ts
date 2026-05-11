"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function toggleVotingStatus(isOpen: boolean) {
  await verifyAdmin();
  
  // Update the first voting setting row
  await prisma.votingSetting.updateMany({
    data: { isOpen }
  });
  
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/results");
  return { success: true, isOpen };
}

export async function addCandidate(data: { order: string; name: string; faculty: string; major: string; vision: string; mission: string; photo: string; programWork?: string; isActive: boolean }) {
  await verifyAdmin();
  
  const candidate = await prisma.candidate.create({
    data: {
      order: parseInt(data.order),
      name: data.name,
      faculty: data.faculty,
      major: data.major,
      vision: data.vision,
      mission: data.mission,
      photo: data.photo || "",
      programWork: data.programWork || "",
    }
  });
  
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, candidate };
}

export async function updateCandidate(id: string, data: { order: string; name: string; faculty: string; major: string; vision: string; mission: string; photo: string; programWork?: string; isActive: boolean }) {
  await verifyAdmin();
  
  const candidate = await prisma.candidate.update({
    where: { id },
    data: {
      order: parseInt(data.order),
      name: data.name,
      faculty: data.faculty,
      major: data.major,
      vision: data.vision,
      mission: data.mission,
      photo: data.photo || "",
      programWork: data.programWork || undefined,
      isActive: data.isActive,
    }
  });
  
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, candidate };
}

export async function deleteCandidate(id: string) {
  await verifyAdmin();
  
  // Prevent deletion if votes exist
  const votes = await prisma.vote.count({ where: { candidateId: id } });
  if (votes > 0) {
    return { success: false, message: "Kandidat tidak dapat dihapus karena sudah memiliki suara masuk." };
  }
  
  await prisma.candidate.delete({
    where: { id }
  });
  
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}
