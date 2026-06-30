import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDbUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port) : 3306,
    user: u.username || "root",
    password: u.password || undefined,
    database: u.pathname.replace(/^\//, ""),
    allowPublicKeyRetrieval: true,
    bigIntAsNumber: true,
  };
}

function createPrisma() {
  const config = parseDbUrl(process.env.DATABASE_URL as string);
  const adapter = new PrismaMariaDb(config);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;