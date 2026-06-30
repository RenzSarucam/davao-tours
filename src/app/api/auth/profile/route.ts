import { NextRequest } from "next/server";
import { getCustomerSession, setCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, currentPassword, newPassword } = body;

  if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { id: session.id } });
  if (!customer) return Response.json({ error: "Account not found" }, { status: 404 });

  // If changing password, verify current password
  if (newPassword) {
    if (!currentPassword) return Response.json({ error: "Current password is required" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, customer.password);
    if (!valid) return Response.json({ error: "Current password is incorrect" }, { status: 400 });
    if (newPassword.length < 6) return Response.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const updateData: Record<string, string> = { name: name.trim() };
  if (phone) updateData.phone = phone.trim();
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12);

  const updated = await prisma.customer.update({
    where: { id: session.id },
    data: updateData,
  });

  // Refresh the session cookie with updated name
  await setCustomerSession({ id: updated.id, name: updated.name, email: updated.email, role: "customer" });

  return Response.json({ success: true, name: updated.name });
}