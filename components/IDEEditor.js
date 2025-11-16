import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Toolbar from './Toolbar';
import FileTree from './FileTree';
import { detectLanguageFromPath, debounce, formatContent } from '../utils/editorUtils';
import { apiClient } from '../utils/api';
import { useHotkeys } from 'react-hotkeys-hook';

// dynamic import to avoid SSR issues
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';

export default function IDEEditor() {
  const [openTabs, setOpenTabs] = useState([]); // {path, content, sha, dirty, lang}
  const [activePath, setActivePath] = useState(null);
  const [wrap, setWrap] = useState(true);
  const autosaveTimers = useRef({});
  
  const getTab = (path) => openTabs.find((t) => t.path === path);
  
  // Keyboard save: Ctrl/Cmd+S
  useHotkeys('ctrl+s, command+s', (e) => {
    e.preventDefault();
    handleSaveActive();
  });
  
  useEffect(() => {
    // restore last opened tabs from localStorage (small devices)
    const saved = localStorage.getItem('ide:openTabs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOpenTabs(parsed);
        if (parsed.length) setActivePath(parsed[0].path);
      } catch (e) {
        // ignore
      }
    }
  }, []);
  
  useEffect(() => {
    // persist openTabs metadata (not heavy content)
    const meta = openTabs.map((t) => ({ path: t.path, sha: t.sha }));
    localStorage.setItem('ide:openTabs', JSON.stringify(meta));
  }, [openTabs]);
  
  const openFile = async (path) => {
    // if already open, activate
    const existing = getTab(path);
    if (existing) {
      setActivePath(path);
      return;
    }
    try {
      const res = await apiClient.get(`/github/files?path=${path}&type=file`);
      const content = res.content || '';
      const sha = res.sha || null;
      const lang = detectLanguageFromPath(path);
      const tab = { path, content, sha, dirty: false, lang };
      setOpenTabs((t) => [tab, ...t]);
      setActivePath(path);
    } catch (e) {
      alert(`ไม่สามารถเปิดไฟล์: ${e.message}`);
    }
  };
  
  const closeTab = (path) => {
    setOpenTabs((tabs) => tabs.filter((t) => t.path !== path));
    if (activePath === path) {
      const remaining = openTabs.filter((t) => t.path !== path);
      setActivePath(remaining.length ? remaining[0].path : null);
    }
  };
  
  const updateActiveContent = (content) => {
    setOpenTabs((tabs) =>
      tabs.map((t) => (t.path === activePath ? { ...t, content, dirty: true } : t))
    );
    // autosave to localStorage per-file (debounced)
    if (autosaveTimers.current[activePath]) clearTimeout(autosaveTimers.current[activePath]);
    autosaveTimers.current[activePath] = setTimeout(() => {
      localStorage.setItem(`ide:unsaved:${activePath}`, JSON.stringify({ content: getTab(activePath)?.content }));
    }, 800);
  };
  
  const handleSaveActive = useCallback(async () => {
    const tab = getTab(activePath);
    if (!tab) return;
    try {
      const payload = {
        path: tab.path,
        content: tab.content,
        message: `Update ${tab.path}`,
        sha: tab.sha || null,
      };
      await apiClient.post('/github/edit', payload);
      // mark saved
      setOpenTabs((tabs) => tabs.map((t) => (t.path === tab.path ? { ...t, dirty: false } : t)));
      localStorage.removeItem(`ide:unsaved:${tab.path}`);
      alert('Saved ✔');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  }, [activePath, openTabs]);
  
  const handleFormat = () => {
    const tab = getTab(activePath);
    if (!tab) return;
    try {
      const formatted = formatContent(tab.content, tab.lang);
      setOpenTabs((tabs) => tabs.map((t) => (t.path === tab.path ? { ...t, content: formatted, dirty: true } : t)));
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleDownload = () => {
    const tab = getTab(activePath);
    if (!tab) return;
    const blob = new Blob([tab.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tab.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const toggleWrap = () => setWrap((v) => !v);
  
  const activeTab = getTab(activePath);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1">
        <FileTree onOpen={openFile} />
      </div>

      <div className="lg:col-span-3 flex flex-col h-[70vh]">
        {/* Tabs */}
        <div className="flex gap-2 items-center overflow-x-auto px-2 py-1 bg-gray-50 border-b">
          {openTabs.length === 0 && <div className="text-sm text-gray-500 px-2">No open files</div>}
          {openTabs.map((t) => (
            <div
              key={t.path}
              className={`px-3 py-1 rounded flex items-center gap-2 text-sm cursor-pointer ${
                t.path === activePath ? 'bg-white shadow' : 'bg-transparent'
              }`}
              onClick={() => setActivePath(t.path)}
            >
              <span className="truncate max-w-xs">{t.path.split('/').pop()}</span>
              {t.dirty && <span className="text-red-500">●</span>}
              <button onClick={(e) => { e.stopPropagation(); closeTab(t.path); }} className="ml-1 text-xs text-gray-400">✕</button>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          {!activeTab && (
            <div className="h-full flex items-center justify-center text-gray-400">
              เปิดไฟล์จาก tree ทางซ้ายหรืออัปโหลดไฟล์
            </div>
          )}

          {activeTab && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <CodeMirror
                  value={activeTab.content || ''}
                  extensions={[
                    activeTab.lang === 'json' ? json() : activeTab.lang === 'javascript' ? javascript() : activeTab.lang === 'markdown' ? markdown() : [],
                    // add basic editor options
                  ]}
                  onChange={(value) => updateActiveContent(value)}
                  height="100%"
                  basicSetup={{
                    highlightActiveLine: true,
                    lineNumbers: true,
                    autocompletion: true,
                    defaultKeymap: true,
                  }}
                  theme="light"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace' }}
                />
              </div>

              <Toolbar
                onSave={handleSaveActive}
                onFormat={handleFormat}
                onDownload={handleDownload}
                onToggleWrap={toggleWrap}
                canSave={activeTab.dirty}
                isWrapped={wrap}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}