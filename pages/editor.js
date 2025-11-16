import FileEditor from '../components/FileEditor';
import FileUpload from '../components/FileUpload';

export default function EditorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📝 File Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileEditor />
        <FileUpload />
      </div>
    </div>
  );
}