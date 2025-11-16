import { NextRequest } from "next/server";
import { listFiles } from "../../../lib/github";

export async function GET(req: NextRequest) {
  const url = new URL(req.url!);
  const folder = url.searchParams.get("folder") || "";
  try {
    const files = await listFiles(folder);
    return new Response(JSON.stringify(files), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}