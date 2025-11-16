'use client';
import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import TopBar from '../layout/TopBar';
import FileList from './FileList';
import FileEditor from './FileEditor';
import BottomNav from '../layout/BottomNav';
import { useFileStore } from '../../lib/store';

export default function FileExplorer() {
  const openFile = useFileStore(s => s.openFile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // เปิด/ปิด sidebar สำหรับ mobile
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onOpenSidebar={openSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <FileList />
            </div>
            <div className="lg:col-span-2">
              {openFile
                ? <FileEditor />
                : <div className="card"><p className="text-gray-500">Select a file to edit or create a new one.</p></div>
              }
            </div>
          </div>
        </main>
      </div>
      <BottomNav onOpen={() => setSidebarOpen(true)} />
    </div>
  );
}