import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/bookings/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const booking = await prisma.booking.update({
    where: { id: Number(id) },
    data: { status: body.status },
    include: { vehicle: true },
  });
  return Response.json(booking);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/bookings/[id]">
) {
  const { id } = await ctx.params;
  await prisma.booking.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}
