import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(vehicles);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const vehicle = await prisma.vehicle.create({
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
      isAvailable: body.isAvailable ?? true,
    },
  });
  return Response.json(vehicle, { status: 201 });
}