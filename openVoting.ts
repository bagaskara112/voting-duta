import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env["DIRECT_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.votingSetting.updateMany({
    data: {
      isOpen: true,
      startTime: new Date(Date.now() - 100000),
      endTime: new Date(Date.now() + 86400000 * 7), // 7 days from now
    },
  });
  console.log("✅ Voting opened successfully for testing.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
