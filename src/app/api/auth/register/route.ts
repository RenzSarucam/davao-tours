import { prisma } from "@/lib/prisma";
import { setCustomerSession } from "@/lib/auth";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { name, email, phone, password } = await request.json();

  if (!name || !email || !password)
    return Response.json({ error: "Name, email and password are required." }, { status: 400 });

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing)
    return Response.json({ error: "Email is already registered." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const customer = await prisma.customer.create({
    data: { name, email, phone: phone || null, password: hashed },
  });

  await setCustomerSession({ id: customer.id, email: customer.email, name: customer.name, role: "customer" });
  return Response.json({ success: true, name: customer.name, role: "customer" }, { status: 201 });
}