import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json(null);
  return Response.json({ id: session.id, name: session.name, role: session.role, email: session.email });
}