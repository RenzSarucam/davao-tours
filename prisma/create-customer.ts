import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

function parseDbUrl(url: string) {
  const u = new URL(url);
  return { host: u.hostname, port: u.port ? parseInt(u.port) : 3306, user: u.username || "root", password: u.password || undefined, database: u.pathname.replace(/^\//, ""), allowPublicKeyRetrieval: true };
}

const adapter = new PrismaMariaDb(parseDbUrl(process.env.DATABASE_URL as string));
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.customer.findUnique({ where: { email: "renz@gmail.com" } });
  if (existing) {
    console.log("⚠️  Account already exists:", existing.email);
    return;
  }

  const hashed = await bcrypt.hash("user123", 12);
  const customer = await prisma.customer.create({
    data: {
      name: "Renz Carl",
      email: "renz@gmail.com",
      password: hashed,
      phone: "09123456789",
    },
  });

  console.log("✅ Customer account created!");
  console.log(`   Name     : ${customer.name}`);
  console.log(`   Email    : ${customer.email}`);
  console.log(`   Password : user123`);
  console.log(`   Phone    : ${customer.phone}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());