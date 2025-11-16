import { useState } from 'react';
import FileList from '../components/FileList';
import FileEditor from '../components/FileEditor';
import FileUpload from '../components/FileUpload';

export default function Home() {
  const [activeTab, setActiveTab] = useState('browser');
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-2">🚀 Fantrove Data Manager</h1>
        <p className="text-lg">จัดการไฟล์ Repository fantrove-data ได้ง่ายๆ</p>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('browser')}
          className={`px-6 py-3 font-semibold ${
            activeTab === 'browser'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📂 Browser
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-6 py-3 font-semibold ${
            activeTab === 'editor'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ✏️ Editor
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-3 font-semibold ${
            activeTab === 'upload'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📤 Upload
        </button>
      </div>

      <div>
        {activeTab === 'browser' && <FileList />}
        {activeTab === 'editor' && <FileEditor />}
        {activeTab === 'upload' && <FileUpload />}
      </div>
    </div>
  );
}