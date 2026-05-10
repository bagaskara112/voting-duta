import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Revalidate every 10 seconds to allow caching but keep it fresh
export const revalidate = 10;

export async function GET() {
  try {
    // We want to return candidates and their vote counts securely
    // 1. Get all active candidates
    const candidates = await prisma.candidate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        order: true,
        name: true,
        faculty: true,
        major: true,
      },
      orderBy: { order: "asc" },
    });

    // 2. Aggregate votes
    const voteCounts = await prisma.vote.groupBy({
      by: ["candidateId"],
      _count: {
        id: true,
      },
    });

    // 3. Map votes to candidates
    const totalVotesAll = await prisma.vote.count();
    
    const results = candidates.map(candidate => {
      const voteData = voteCounts.find(v => v.candidateId === candidate.id);
      const voteCount = voteData?._count.id || 0;
      const percentage = totalVotesAll > 0 ? (voteCount / totalVotesAll) * 100 : 0;
      
      return {
        ...candidate,
        voteCount,
        percentage: Number(percentage.toFixed(2))
      };
    });

    // Sort by most votes descending for the chart display
    // Wait, let's keep it sorted by order, or maybe return both? 
    // Usually results are sorted by count.
    const sortedResults = [...results].sort((a, b) => b.voteCount - a.voteCount);

    return NextResponse.json({
      success: true,
      totalVotesAll,
      data: sortedResults,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Failed to fetch results:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data hasil" },
      { status: 500 }
    );
  }
}
