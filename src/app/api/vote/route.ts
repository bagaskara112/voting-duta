import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // 1. Authentication Check
    if (!session?.user || session.user.role !== "VOTER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Hanya pemilih terdaftar yang dapat memberikan suara." },
        { status: 401 }
      );
    }

    const { candidateId } = await req.json();

    if (!candidateId) {
      return NextResponse.json(
        { success: false, message: "Kandidat tidak valid." },
        { status: 400 }
      );
    }

    // 2. Voting Settings Check
    const settings = await prisma.votingSetting.findFirst();
    const now = new Date();

    if (
      !settings?.isOpen ||
      now < settings.startTime ||
      now > settings.endTime
    ) {
      return NextResponse.json(
        { success: false, message: "Sesi pemilihan saat ini sedang ditutup." },
        { status: 403 }
      );
    }

    // 3. Database Transaction (Prevent Double Voting)
    // We use a transaction to ensure atomicity. If any of these fail, the whole operation rolls back.
    void await prisma.$transaction(async (tx) => {
      // Check if user has already voted (lock row for update to prevent race conditions if possible, 
      // but Prisma handles this gracefully with unique constraints on the Vote table).
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user || user.hasVoted) {
        throw new Error("ALREADY_VOTED");
      }

      // Check if candidate exists and is active
      const candidate = await tx.candidate.findUnique({
        where: { id: candidateId },
      });

      if (!candidate || !candidate.isActive) {
        throw new Error("INVALID_CANDIDATE");
      }

      // Record the vote
      await tx.vote.create({
        data: {
          userId: user.id,
          candidateId: candidate.id,
        },
      });

      // Update user status
      await tx.user.update({
        where: { id: user.id },
        data: {
          hasVoted: true,
          votedAt: new Date(),
        },
      });

      // Create transparency log (Name is logged, but choice is NOT logged in the VoteLog)
      // The Vote table connects user and candidate, but VoteLog is for public transparency
      await tx.voteLog.create({
        data: {
          userId: user.id,
          action: "vote",
          description: `${user.name} telah memberikan hak suaranya.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Suara Anda berhasil direkam. Terima kasih telah berpartisipasi!",
    });

  } catch (error: unknown) {
    console.error("Voting error:", error);

    const message = error instanceof Error ? error.message : "";
    const code = typeof error === "object" && error !== null && "code" in error
      ? (error as { code: string }).code
      : "";

    if (message === "ALREADY_VOTED") {
      return NextResponse.json(
        { success: false, message: "Anda sudah memberikan hak suara. Satu akun hanya dapat memilih satu kali." },
        { status: 403 }
      );
    }
  
    if (message === "INVALID_CANDIDATE") {
      return NextResponse.json(
        { success: false, message: "Kandidat tidak valid atau sudah tidak aktif." },
        { status: 400 }
      );
    }

    // Prisma Unique Constraint violation on Vote table (userId is unique)
    if (code === 'P2002') {
      return NextResponse.json(
        { success: false, message: "Anda sudah memberikan hak suara (Terdeteksi oleh sistem)." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}
