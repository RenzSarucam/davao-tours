import { getCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return Response.json(null);

  const customer = await prisma.customer.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, phone: true },
  });

  return Response.json(customer);
}