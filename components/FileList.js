import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

export default function FileList({ currentPath = '' }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [path, setPath] = useState(currentPath);
  
  useEffect(() => {
    fetchFiles();
  }, [path]);
  
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(`/github/list?path=${path}`);
      setFiles(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  
  const handleDelete = async (fileName, sha) => {
    if (!confirm(`ยืนยันการลบ ${fileName}?`)) return;
    
    try {
      await apiClient.delete('/github/delete', {
        path: path ? `${path}/${fileName}` : fileName,
        sha,
      });
      fetchFiles();
      alert('ลบไฟล์สำเร็จ!');
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };
  
  const handleNavigate = (fileName, type) => {
    if (type === 'dir') {
      setPath(path ? `${path}/${fileName}` : fileName);
    }
  };
  
  const handleGoBack = () => {
    if (path) {
      const parts = path.split('/');
      parts.pop();
      setPath(parts.join('/'));
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">📂 {path || 'Root'}</h2>
        {path && (
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ⬅️ กลับ
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">กำลังโหลด...</p>}
      {error && <p className="text-red-500">❌ {error}</p>}

      {!loading && files.length === 0 && (
        <p className="text-gray-400">ไม่มีไฟล์ในโฟลเดอร์นี้</p>
      )}

      {!loading && files.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 text-left">ชื่อ</th>
                <th className="border p-2 text-left">ประเภท</th>
                <th className="border p-2 text-right">ขนาด</th>
                <th className="border p-2 text-center">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.sha} className="hover:bg-gray-100">
                  <td className="border p-2">
                    {file.type === 'dir' ? (
                      <button
                        onClick={() => handleNavigate(file.name, file.type)}
                        className="text-blue-500 hover:underline"
                      >
                        📁 {file.name}
                      </button>
                    ) : (
                      <span>📄 {file.name}</span>
                    )}
                  </td>
                  <td className="border p-2">{file.type}</td>
                  <td className="border p-2 text-right">
                    {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '-'}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDelete(file.name, file.sha)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      🗑️ ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}