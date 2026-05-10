import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 5; // Frequent revalidation for the "ticker" feel

export async function GET() {
  try {
    // Only fetch the 20 most recent logs for the public ticker
    const logs = await prisma.voteLog.findMany({
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data log" },
      { status: 500 }
    );
  }
}
