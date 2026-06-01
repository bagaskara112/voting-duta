import { PrismaClient } from '../src/generated/prisma'
const prisma = new PrismaClient()

async function main() {
  console.log("Memulai proses reset data uji coba...")

  // 1. Delete all votes
  const deletedVotes = await prisma.vote.deleteMany()
  console.log(`- Berhasil menghapus ${deletedVotes.count} data suara (votes).`)

  // 2. Delete all vote logs
  const deletedLogs = await prisma.voteLog.deleteMany()
  console.log(`- Berhasil menghapus ${deletedLogs.count} log aktivitas.`)

  // 3. Reset all users' voting status
  const updatedUsers = await prisma.user.updateMany({
    data: {
      hasVoted: false,
      votedAt: null
    }
  })
  console.log(`- Berhasil mereset status voting untuk ${updatedUsers.count} akun pengguna.`)

  console.log("Reset data uji coba selesai!")
}

main()
  .catch(e => {
    console.error("Terjadi kesalahan:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
