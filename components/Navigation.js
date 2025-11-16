'use client';
import Link from 'next/link';
export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-3">
      <div className="container flex justify-between items-center">
        <Link href="/" className="text-blue-300 font-semibold">Fantrove Platform</Link>
        <div className="hidden md:flex gap-3">
          <Link href="/" className="px-3 py-1 hover:bg-gray-700 rounded">Dashboard</Link>
          <Link href="/workspace" className="px-3 py-1 hover:bg-gray-700 rounded">Workspace</Link>
        </div>
      </div>
    </nav>
  );
}