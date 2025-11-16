import { NextResponse } from 'next/server';
// Folders in Git are simulated by creating placeholder .gitkeep files or creating commits with folder path.
// For simplicity we create a .gitkeep file when creating a folder.
import * as Git from '../../../lib/github.js';

export async function POST(request) {
  try {
    const { path } = await request.json();
    if (!path) return NextResponse.json({ error: 'Path required' }, { status: 400 });
    const p = path.endsWith('/') ? `${path}.gitkeep` : `${path}/.gitkeep`;
    const res = await Git.createOrUpdateFile(p, '', `Create folder ${path}`);
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}