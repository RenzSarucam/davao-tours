import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      // Return only drivers available for these dates (no conflicting bookings, not day-off)
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find driver IDs who have conflicting bookings
      const busyBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["pending", "confirmed"] },
          assignedDriverId: { not: null },
          OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
        },
        select: { assignedDriverId: true },
      });
      const busyIds = busyBookings
        .map(b => b.assignedDriverId)
        .filter((id): id is number => id !== null);

      const drivers = await prisma.driver.findMany({
        where: {
          status: { not: "off" },
          id: { notIn: busyIds.length ? busyIds : [-1] },
        },
        orderBy: { experience: "desc" },
      });
      return Response.json(drivers);
    }

    // No date filter — return all with their upcoming bookings for admin use
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(drivers);
  } catch (err) {
    console.error("[drivers GET]", err);
    return Response.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const driver = await prisma.driver.create({
    data: {
      name: body.name,
      phone: body.phone,
      licenseNo: body.licenseNo,
      experience: Number(body.experience) || 0,
      status: body.status || "available",
      notes: body.notes || null,
    },
  });
  return Response.json(driver, { status: 201 });
}