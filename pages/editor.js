import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues (CodeMirror heavy)
const IDEEditor = dynamic(() => import('../components/IDEEditor'), { ssr: false });

export default function EditorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🛠 Fantrove Mini IDE (Mobile-first)</h1>
      <p className="text-sm text-gray-500">ออกแบบมาเพื่ออุปกรณ์ขนาดเล็กเป็นหลัก — รองรับการแก้ไขไฟล์, tabs, autosave, format, download</p>

      <IDEEditor />
    </div>
  );
}