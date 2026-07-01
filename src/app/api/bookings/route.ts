import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(bookings);
  } catch (err) {
    console.error("[bookings GET]", err);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerSession = await getCustomerSession();

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const days = Math.max(1, Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ));

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(body.vehicleId) },
    });
    if (!vehicle) return Response.json({ error: "Vehicle not found" }, { status: 404 });

    const conflict = await prisma.booking.findFirst({
      where: {
        vehicleId: Number(body.vehicleId),
        status: { not: "cancelled" },
        OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
      },
    });
    if (conflict) {
      return Response.json({ error: "Vehicle is not available for selected dates" }, { status: 409 });
    }

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

    const totalPrice = vehicle.pricePerDay * days;
    const reservationFee = Math.round(totalPrice * 0.30);
    const remainingBalance = totalPrice - reservationFee;

    const booking = await prisma.booking.create({
      data: {
        vehicleId: Number(body.vehicleId),
        customerId: customerSession?.id ?? null,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        startDate,
        endDate,
        totalPrice,
        status: "pending",
        notes: body.notes || null,
        needsDriver: !!body.needsDriver,
        assignedDriverId,
        licenseHolderName: body.needsDriver ? null : (body.licenseHolderName || null),
        licenseImageUrl: body.needsDriver ? null : (body.licenseImageUrl || null),
        paymentMethod: body.paymentMethod || "cash",
        reservationFee,
        remainingBalance,
        reservationFeeMethod: body.reservationFeeMethod || null,
      },
      include: { vehicle: true },
    });

    return Response.json(booking, { status: 201 });
  } catch (err) {
    console.error("[bookings POST]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}