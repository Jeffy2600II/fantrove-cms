'use client';
import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import DrawerSidebar from '../layout/DrawerSidebar';
import TopBar from '../layout/TopBar';
import FileList from '../workspace/FileList';
import FileEditor from '../workspace/FileEditor';
import BottomNav from '../layout/BottomNav';
import { useFileStore } from '../../lib/store';

export default function FileExplorer() {
  const openFile = useFileStore(s => s.openFile);
  const [showSidebar, setShowSidebar] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onOpenSidebar={() => setShowSidebar(true)}>
        <div className="hidden md:block text-sm text-gray-500">Mobile-first Platform</div>
      </TopBar>

      {/* DrawerSidebar for mobile */}
      <DrawerSidebar open={showSidebar} onClose={() => setShowSidebar(false)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />
        <main className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <FileList />
            </div>
            <div className="lg:col-span-2">
              {openFile ? <FileEditor /> : <div className="card"><p className="text-gray-500">Select a file to edit or create a new one.</p></div>}
            </div>
          </div>
        </main>
      </div>

      <BottomNav onOpen={() => setShowSidebar(true)} />
    </div>
  );
}