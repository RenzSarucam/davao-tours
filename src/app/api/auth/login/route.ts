import { prisma } from "@/lib/prisma";
import { setAdminSession, setCustomerSession } from "@/lib/auth";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password)
    return Response.json({ error: "Email and password are required." }, { status: 400 });

  // Check customer first
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (customer) {
    if (!(await bcrypt.compare(password, customer.password)))
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    await setCustomerSession({ id: customer.id, email: customer.email, name: customer.name, role: "customer" });
    return Response.json({ success: true, name: customer.name, role: "customer" });
  }

  // Check admin (username = email field for admin)
  const admin = await prisma.user.findUnique({ where: { username: email } });
  if (admin) {
    if (!(await bcrypt.compare(password, admin.password)))
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    await setAdminSession({ id: admin.id, username: admin.username, name: admin.name, role: "admin" });
    return Response.json({ success: true, name: admin.name, role: "admin" });
  }

  return Response.json({ error: "Invalid email or password." }, { status: 401 });
}