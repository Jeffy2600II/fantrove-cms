import { useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '../lib/api';
import { useFileStore } from '../lib/store';

export function useFileManager() {
  const setFiles = useFileStore(state => state.setFiles);
  const setLoading = useFileStore(state => state.setLoading);
  const setToast = useFileStore(state => state.setToast);
  
  const fetchFiles = useCallback(async (path = '') => {
    setLoading(true);
    try {
      const res = await apiGet(`/api/files?path=${encodeURIComponent(path || '')}`);
      setFiles(res);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    } finally {
      setLoading(false);
    }
  }, [setFiles, setLoading, setToast]);
  
  const readFile = useCallback(async (path) => {
    setLoading(true);
    try {
      const res = await apiGet(`/api/files?path=${encodeURIComponent(path)}&type=file`);
      return res;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);
  
  const saveFile = useCallback(async ({ path, content, message, sha }) => {
    setLoading(true);
    try {
      const res = await apiPost('/api/files', { path, content, message, sha });
      setToast({ type: 'success', message: 'Saved' });
      return res;
    } catch (e) {
      setToast({ type: 'error', message: e.message });
      throw e;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setToast]);
  
  const removeFile = useCallback(async ({ path, sha }) => {
    setLoading(true);
    try {
      const res = await apiDelete('/api/files', { path, sha });
      setToast({ type: 'success', message: 'Deleted' });
      return res;
    } catch (e) {
      setToast({ type: 'error', message: e.message });
      throw e;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setToast]);
  
  return { fetchFiles, readFile, saveFile, removeFile };
}