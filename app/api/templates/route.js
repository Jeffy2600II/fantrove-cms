import { NextResponse } from 'next/server';
export async function GET() {
  // Return list of templates from /public/templates
  const templates = [
    { id: 'default-md', name: 'Markdown Default', path: '/templates/default.md' },
    { id: 'data-json', name: 'Data JSON', path: '/templates/data.json' }
  ];
  return NextResponse.json(templates);
}