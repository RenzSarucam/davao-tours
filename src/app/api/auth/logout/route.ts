import { clearAdminSession, clearCustomerSession } from "@/lib/auth";

export async function POST() {
  await clearAdminSession();
  await clearCustomerSession();
  return Response.json({ success: true });
}