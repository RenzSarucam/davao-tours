import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        vehicle: true,
        assignedDriver: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(bookings);
  } catch (err) {
    console.error("[admin/bookings]", err);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}