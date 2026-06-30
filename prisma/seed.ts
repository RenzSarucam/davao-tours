import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDbUrl(url: string) {
  const u = new URL(url);
  return { host: u.hostname, port: u.port ? parseInt(u.port) : 3306, user: u.username || "root", password: u.password || undefined, database: u.pathname.replace(/^\//, ""), allowPublicKeyRetrieval: true };
}

const adapter = new PrismaMariaDb(parseDbUrl(process.env.DATABASE_URL as string));
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.vehicle.createMany({
    data: [
      {
        name: "Toyota Hi-Ace Super Grandia",
        type: "Van",
        capacity: 10,
        pricePerDay: 3500,
        plateNumber: "DAV-1234",
        description: "Comfortable 10-seater van with aircon, perfect for group tours and airport transfers.",
        isAvailable: true,
      },
      {
        name: "Hyundai County Coaster",
        type: "Coaster",
        capacity: 25,
        pricePerDay: 7000,
        plateNumber: "DAV-5678",
        description: "25-seater coaster ideal for large groups, corporate events, and island hopping.",
        isAvailable: true,
      },
      {
        name: "Ford Everest 4x4",
        type: "SUV",
        capacity: 7,
        pricePerDay: 4500,
        plateNumber: "DAV-9012",
        description: "7-seater SUV perfect for off-road adventures to Mt. Apo and surrounding areas.",
        isAvailable: true,
      },
      {
        name: "Toyota Innova",
        type: "Van",
        capacity: 8,
        pricePerDay: 2800,
        plateNumber: "DAV-3456",
        description: "Reliable 8-seater van for city tours and short trips around Davao City.",
        isAvailable: true,
      },
      {
        name: "Toyota Vios",
        type: "Sedan",
        capacity: 4,
        pricePerDay: 1800,
        plateNumber: "DAV-7890",
        description: "Fuel-efficient sedan for solo travelers and small groups.",
        isAvailable: true,
      },
    ],
  });
  console.log("✅ Seed data inserted successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
