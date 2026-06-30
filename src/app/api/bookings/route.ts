import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(bookings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: Number(body.vehicleId) },
  });
  if (!vehicle) return Response.json({ error: "Vehicle not found" }, { status: 404 });

  const conflict = await prisma.booking.findFirst({
    where: {
      vehicleId: Number(body.vehicleId),
      status: { not: "cancelled" },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });
  if (conflict) {
    return Response.json({ error: "Vehicle is not available for selected dates" }, { status: 409 });
  }

  // Use customer-selected driver if provided, else auto-assign most experienced
  let assignedDriverId: number | null = null;
  if (body.needsDriver) {
    if (body.assignedDriverId) {
      assignedDriverId = Number(body.assignedDriverId);
    } else {
      const driver = await prisma.driver.findFirst({
        where: { status: "available" },
        orderBy: { experience: "desc" },
      });
      if (driver) assignedDriverId = driver.id;
    }
  }

  const booking = await prisma.booking.create({
    data: {
      vehicleId: Number(body.vehicleId),
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      startDate,
      endDate,
      totalPrice: vehicle.pricePerDay * days,
      status: "pending",
      notes: body.notes || null,
      needsDriver: !!body.needsDriver,
      assignedDriverId,
      licenseHolderName: body.needsDriver ? null : (body.licenseHolderName || null),
      licenseImageUrl: body.needsDriver ? null : (body.licenseImageUrl || null),
    },
    include: { vehicle: true, assignedDriver: true },
  });

  return Response.json(booking, { status: 201 });
}
