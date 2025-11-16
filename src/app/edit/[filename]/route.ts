import { NextRequest } from "next/server";
import { getFileContent } from "../../../../lib/github";

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const file = await getFileContent(params.filename);
    return new Response(JSON.stringify(file), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}