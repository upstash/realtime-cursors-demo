import { realtime } from "@/lib/realtime";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  await realtime.emit("update", body);
  return Response.json({ success: true });
}
