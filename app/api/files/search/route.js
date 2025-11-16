import { NextResponse } from 'next/server';
export async function POST(request) {
  const { q } = await request.json();
  // For demo, return empty or mock. In real, use GitHub search API.
  if (!q) return NextResponse.json([]);
  return NextResponse.json([{ name: 'mock.json', path: 'mock.json', type: 'file' }]);
}