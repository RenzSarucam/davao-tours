import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find vehicle IDs that have conflicting bookings
      const busyBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["pending", "confirmed"] },
          OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
        },
        select: { vehicleId: true },
      });
      const busyIds = [...new Set(busyBookings.map(b => b.vehicleId))];

      const vehicles = await prisma.vehicle.findMany({
        where: {
          isAvailable: true,
          id: { notIn: busyIds.length ? busyIds : [-1] },
        },
        orderBy: { createdAt: "desc" },
      });
      return Response.json(vehicles);
    }

    const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json(vehicles);
  } catch (err) {
    console.error("[vehicles GET]", err);
    return Response.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const vehicle = await prisma.vehicle.create({
    data: {
      name: body.name,
      type: body.type,
      capacity: Number(body.capacity),
      pricePerDay: Number(body.pricePerDay),
      imageUrl: body.imageUrl || null,
      description: body.description || null,
      plateNumber: body.plateNumber,
      color: body.color || null,
      year: body.year ? Number(body.year) : null,
      amenities: body.amenities ? JSON.stringify(body.amenities) : null,
      isAvailable: body.isAvailable ?? true,
    },
  });
  return Response.json(vehicle, { status: 201 });
}