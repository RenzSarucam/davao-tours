import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          where: {
            status: { in: ["pending", "confirmed"] },
            endDate: { gte: today },
          },
          include: { vehicle: { select: { name: true, type: true } } },
          orderBy: { startDate: "asc" },
        },
      },
    });

    // Compute realStatus per driver
    const result = drivers.map(d => {
      const isOnDutyToday = d.bookings.some(
        b => new Date(b.startDate) <= todayEnd && new Date(b.endDate) >= today
      );
      return {
        ...d,
        realStatus: d.status === "off" ? "off" : isOnDutyToday ? "on-duty" : "available",
      };
    });

    return Response.json(result);
  } catch (err) {
    console.error("[admin/drivers]", err);
    return Response.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}