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
        user: {
          select: {
            name: true,
          }
        }
      }
    });

    const sanitizedLogs = logs.map(log => {
      let description = log.description || "";
      if (log.action === "login" && log.user) {
        description = `${log.user.name} telah masuk ke sistem.`;
      } else {
        // Fallback: Mask any emails in log descriptions (just in case)
        description = description.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (email) => {
          const [localPart, domain] = email.split("@");
          if (localPart.length <= 3) {
            return "***@" + domain;
          }
          return localPart.substring(0, 3) + "***@" + domain;
        });
      }
      return {
        id: log.id,
        action: log.action,
        description,
        createdAt: log.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: sanitizedLogs,
    });
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data log" },
      { status: 500 }
    );
  }
}
