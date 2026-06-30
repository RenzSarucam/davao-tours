import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

function parseDbUrl(url: string) {
  const u = new URL(url.replace(/^mysql:\/\//, "mariadb://"));
  return { host: u.hostname, port: u.port ? parseInt(u.port) : 3306, user: u.username || "root", password: u.password || undefined, database: u.pathname.replace(/^\//, ""), allowPublicKeyRetrieval: true };
}

const adapter = new PrismaMariaDb(parseDbUrl(process.env.DATABASE_URL as string));
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("⚠️  Admin user already exists. Skipping.");
    return;
  }

  const hashed = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.create({
    data: {
      username: "admin",
      password: hashed,
      name: "Renz Admin",
      role: "admin",
    },
  });

  console.log(`✅ Admin user created:`);
  console.log(`   Username : ${user.username}`);
  console.log(`   Password : admin123`);
  console.log(`   Name     : ${user.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());