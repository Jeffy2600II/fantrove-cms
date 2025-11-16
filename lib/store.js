import create from 'zustand';

export const useFileStore = create((set, get) => ({
  currentPath: '',
  files: [],
  selected: [],
  openFile: null,
  editorContent: '',
  editorSha: null,
  isLoading: false,
  toast: null,
  
  setPath: (p) => set({ currentPath: p }),
  setFiles: (files) => set({ files }),
  setSelected: (s) => set({ selected: s }),
  setOpenFile: (f) => set({ openFile: f }),
  setEditorContent: (c) => set({ editorContent: c }),
  setEditorSha: (s) => set({ editorSha: s }),
  setLoading: (l) => set({ isLoading: l }),
  setToast: (t) => set({ toast: t }),
}));