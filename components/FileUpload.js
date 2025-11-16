import { useState } from 'react';
import { apiClient } from '../utils/api';

export default function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePath(selectedFile.name);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setMessage('⚠️ กรุณาเลือกไฟล์');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        try {
          await apiClient.post('/github/edit', {
            path: filePath,
            content,
            message: commitMessage || `Upload ${filePath}`,
          });
          setMessage('✅ อัปโหลดไฟล์สำเร็จ!');
          setFile(null);
          setFilePath('');
          setCommitMessage('');
          if (onSuccess) onSuccess();
        } catch (error) {
          setMessage(`❌ ${error.message}`);
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">📤 Upload File</h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            {file ? (
              <div>
                <p className="text-lg font-semibold">📎 {file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold">📁 Click to select or drag files</p>
                <p className="text-sm text-gray-500">Max 5MB</p>
              </div>
            )}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Destination Path</label>
          <input
            type="text"
            placeholder="เช่น: uploads/myfile.json"
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

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
        >
          {loading ? 'กำลังอัปโหลด...' : '📤 อัปโหลด'}
        </button>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}