import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const drivers = await prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(drivers);
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