import { useState } from 'react';
import { apiClient } from '../utils/api';

export default function FileEditor() {
  const [filePath, setFilePath] = useState('');
  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sha, setSha] = useState(null);
  
  const handleRead = async () => {
    if (!filePath) {
      setMessage('⚠️ กรุณาใส่ path ของไฟล์');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      const data = await apiClient.get(`/github/files?path=${filePath}&type=file`);
      setContent(data.content);
      setSha(data.sha);
      setMessage('✅ ไฟล์ถูกโหลดสำเร็จ');
    } catch (error) {
      setMessage(`❌ ${error.message}`);
      setContent('');
      setSha(null);
    }
    setLoading(false);
  };
  
  const handleSave = async () => {
    if (!filePath || !content) {
      setMessage('⚠️ กรุณาใส่ path และเนื้อหา');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      await apiClient.post('/github/edit', {
        path: filePath,
        content,
        message: commitMessage || `Update ${filePath}`,
        sha: sha || null,
      });
      setMessage('✅ บันทึกไฟล์สำเร็จ!');
      setSha(null);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
    setLoading(false);
  };
  
  const handleCreate = async () => {
    if (!filePath || !content) {
      setMessage('⚠️ กรุณาใส่ path และเนื้อหา');
      return;
    }
    
    setLoading(true);
    setMessage('');
    try {
      await apiClient.post('/github/edit', {
        path: filePath,
        content,
        message: commitMessage || `Create ${filePath}`,
      });
      setMessage('✅ สร้างไฟล์สำเร็จ!');
      setContent('');
      setFilePath('');
      setCommitMessage('');
      setSha(null);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
    setLoading(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">✏️ File Editor</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">File Path</label>
          <input
            type="text"
            placeholder="เช่น: data/users.json หรือ docs/README.md"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Commit Message</label>
          <input
            type="text"
            placeholder="บรรยายการเปลี่ยนแปลง (ตัวเลือก)"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRead}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'กำลังโหลด...' : '📖 อ่านไฟล์'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !sha}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'กำลังบันทึก...' : '💾 บันทึก'}
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            {loading ? 'กำลังสร้าง...' : '➕ สร้างใหม่'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เนื้อหาไฟล์จะปรากฏที่นี่"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}