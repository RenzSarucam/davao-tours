import { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    if (file.size > 10 * 1024 * 1024)
      return Response.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type))
      return Response.json({ error: "Only JPG, PNG, or WEBP allowed" }, { status: 400 });

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `proof_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    return Response.json({ url: `/uploads/proofs/${filename}` });
  } catch (err) {
    console.error("[upload/proof]", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}