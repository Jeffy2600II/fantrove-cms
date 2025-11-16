import { NextResponse } from 'next/server';
import * as Git from '../../../lib/github.js';

// Simple API route that proxies to lib/github.js (server-side)
export async function GET(request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || '';
  const type = url.searchParams.get('type') || null;
  try {
    if (type === 'file') {
      const file = await Git.getFileContent(path);
      return NextResponse.json(file);
    } else {
      const list = await Git.listDirectory(path);
      return NextResponse.json(list);
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  const { path, content, message, sha } = body;
  try {
    const res = await Git.createOrUpdateFile(path, content, message || `Update ${path}`, sha);
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { path, sha } = body;
    const res = await Git.deleteFile(path, sha);
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}