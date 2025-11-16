import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mt-10 text-center">
      <h1 className="font-bold text-3xl mb-4">Welcome to Fantrove CMS</h1>
      <p>แก้ไขและ commit ไฟล์ JSON data ของคุณได้ง่าย ๆ ผ่านหน้าเว็บนี้</p>
      <Link href="/dashboard" className="underline text-indigo-600 mt-8 block text-lg">
        Go to dashboard
      </Link>
    </div>
  )
}