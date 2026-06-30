import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/vehicles/[id]">) {
  const { id } = await ctx.params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: Number(id) },
    include: { bookings: true },
  });
  if (!vehicle) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(vehicle);
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/vehicles/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  const vehicle = await prisma.vehicle.update({
    where: { id: Number(id) },
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
      isAvailable: body.isAvailable,
    },
  });
  return Response.json(vehicle);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/vehicles/[id]">) {
  const { id } = await ctx.params;
  await prisma.vehicle.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}