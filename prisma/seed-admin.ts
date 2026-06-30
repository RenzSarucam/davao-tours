import { PrismaClient } from "@prisma/client";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaSqlite({ url: dbPath });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

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