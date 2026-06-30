import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/drivers/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  const driver = await prisma.driver.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      phone: body.phone,
      licenseNo: body.licenseNo,
      experience: Number(body.experience) || 0,
      status: body.status,
      notes: body.notes || null,
    },
  });
  return Response.json(driver);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/drivers/[id]">) {
  const { id } = await ctx.params;
  await prisma.driver.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}