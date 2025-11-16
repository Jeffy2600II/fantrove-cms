import dynamic from 'next/dynamic';
import FileExplorer from '../components/workspace/FileExplorer';

export default function DashboardPage() {
  return (
    <main className="container py-6">
      <FileExplorer />
    </main>
  );
}