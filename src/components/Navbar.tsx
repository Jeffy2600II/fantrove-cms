import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white py-4 mb-8">
      <div className="flex justify-between items-center px-4">
        <Link href="/" className="font-bold text-xl">Fantrove CMS</Link>
        <div>
          <Link href="/dashboard" className="mr-4">Dashboard</Link>
        </div>
      </div>
    </nav>
  )
}