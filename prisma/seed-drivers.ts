import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDbUrl(url: string) {
  const u = new URL(url.replace(/^mysql:\/\//, "mariadb://"));
  return { host: u.hostname, port: u.port ? parseInt(u.port) : 3306, user: u.username || "root", password: u.password || undefined, database: u.pathname.replace(/^\//, ""), allowPublicKeyRetrieval: true };
}

const adapter = new PrismaMariaDb(parseDbUrl(process.env.DATABASE_URL as string));
const prisma = new PrismaClient({ adapter });

async function main() {
  const drivers = [
    {
      name: "Ramon Dela Cruz",
      phone: "09171234567",
      licenseNo: "N01-23-456789",
      experience: 8,
      status: "available",
      notes: "Experienced with mountain routes and island transfers",
    },
    {
      name: "Michael Santos",
      phone: "09281234567",
      licenseNo: "N01-22-112233",
      experience: 5,
      status: "available",
      notes: "Fluent in English, great with tourists",
    },
    {
      name: "Bong Reyes",
      phone: "09391234567",
      licenseNo: "N01-20-998877",
      experience: 10,
      status: "available",
      notes: "Senior driver, knows all Davao routes",
    },
  ];

  for (const d of drivers) {
    const existing = await prisma.driver.findUnique({ where: { licenseNo: d.licenseNo } });
    if (existing) {
      console.log(`⚠️  Skipping ${d.name} — already exists`);
      continue;
    }
    await prisma.driver.create({ data: d });
    console.log(`✅ Created driver: ${d.name} (${d.experience} yrs experience)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());