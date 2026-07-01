import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Returns booked date ranges for a specific vehicle
// GET /api/vehicles/availability?vehicleId=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    if (!vehicleId) return Response.json({ error: "vehicleId required" }, { status: 400 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        vehicleId: Number(vehicleId),
        status: { in: ["pending", "confirmed"] },
        endDate: { gte: today },
      },
      select: { startDate: true, endDate: true, status: true },
      orderBy: { startDate: "asc" },
    });

    return Response.json(bookings);
  } catch (err) {
    console.error("[vehicles/availability]", err);
    return Response.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}