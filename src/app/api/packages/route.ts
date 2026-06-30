import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const packages = await prisma.tourPackage.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(packages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const pkg = await prisma.tourPackage.create({
    data: {
      name: body.name,
      destination: body.destination,
      duration: Number(body.duration),
      price: Number(body.price),
      description: body.description || null,
      includes: body.includes ? JSON.stringify(body.includes) : null,
      isActive: body.isActive ?? true,
    },
  });
  return Response.json(pkg, { status: 201 });
}