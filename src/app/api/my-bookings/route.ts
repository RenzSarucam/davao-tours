import { getCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const bookings = await prisma.booking.findMany({
      where: { customerId: session.id },
      include: {
        vehicle: true,
        assignedDriver: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(bookings);
  } catch (err) {
    console.error("[my-bookings]", err);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}