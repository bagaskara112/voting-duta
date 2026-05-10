import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  // Protect the route
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Fetch Candidates & Results
    const candidates = await prisma.candidate.findMany({ orderBy: { order: "asc" } });
    const voteCounts = await prisma.vote.groupBy({
      by: ["candidateId"],
      _count: { id: true },
    });
    
    // 2. Fetch Voter Attendance (Users who have voted)
    const voters = await prisma.user.findMany({
      where: { role: "VOTER", hasVoted: true },
      select: { name: true, email: true },
      orderBy: { name: "asc" }
    });

    // Generate CSV Content
    let csvContent = "";

    // Section 1: Final Results
    csvContent += "REKAPITULASI HASIL SUARA\n";
    csvContent += "No. Urut,Nama Kandidat,Fakultas,Total Suara\n";
    
    let totalAllVotes = 0;
    for (const candidate of candidates) {
      const vData = voteCounts.find(v => v.candidateId === candidate.id);
      const count = vData?._count.id || 0;
      totalAllVotes += count;
      csvContent += `${candidate.order},"${candidate.name}","${candidate.faculty}",${count}\n`;
    }
    
    csvContent += `,,,TOTAL SUARA SAH,${totalAllVotes}\n\n\n`;

    // Section 2: Voter Attendance
    csvContent += "DAFTAR KEHADIRAN PEMILIH\n";
    csvContent += "No,Nama,Email\n";
    
    voters.forEach((voter, index) => {
      csvContent += `${index + 1},"${voter.name}","${voter.email}"\n`;
    });

    // Return as CSV File Download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv; charset=utf-8");
    headers.set("Content-Disposition", `attachment; filename="Laporan_Pemilihan_${new Date().toISOString().split('T')[0]}.csv"`);

    return new NextResponse(csvContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Failed to generate CSV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
