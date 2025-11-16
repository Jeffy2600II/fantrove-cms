import { NextRequest } from "next/server";
import { commitFile, createFile, deleteFile } from "../../../lib/github";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filename, content, sha, message, isNew, deleteFile: isDelete } = body;
  try {
    if (isDelete) {
      await deleteFile(filename, sha!, message || "Delete file");
    } else if (isNew) {
      await createFile(filename, content, message || "Create file");
    } else {
      await commitFile(filename, content, sha!, message || "Update file");
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}