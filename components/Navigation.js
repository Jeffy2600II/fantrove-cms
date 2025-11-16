import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-400">
            📁 Fantrove Data Manager
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-700 rounded"
          >
            ☰
          </button>

          <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex space-x-4">
              <Link href="/" className="px-3 py-2 hover:bg-gray-700 rounded">
                🏠 หน้าแรก
              </Link>
              <Link href="/editor" className="px-3 py-2 hover:bg-gray-700 rounded">
                ✏️ Editor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}