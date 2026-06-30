import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/packages/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  const pkg = await prisma.tourPackage.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      destination: body.destination,
      duration: Number(body.duration),
      price: Number(body.price),
      description: body.description || null,
      includes: body.includes ? JSON.stringify(body.includes) : null,
      isActive: body.isActive,
    },
  });
  return Response.json(pkg);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/packages/[id]">) {
  const { id } = await ctx.params;
  await prisma.tourPackage.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}