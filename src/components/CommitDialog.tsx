import { useState } from 'react';

interface CommitDialogProps {
  defaultMessage?: string;
  onCommit: (message: string) => Promise<void>;
  onClose?: () => void;
}

export default function CommitDialog({ defaultMessage = '', onCommit, onClose }: CommitDialogProps) {
  const [message, setMessage] = useState(defaultMessage || '');
  const [loading, setLoading] = useState(false);

  async function handleCommit() {
    setLoading(true);
    try {
      await onCommit(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className="overlay"
        onClick={() => !loading && onClose && onClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 999,
        }}
      />
      <div
        className="commit-dialog"
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          background: 'white',
          padding: 16,
          borderRadius: 12,
          boxShadow: '0 6px 30px rgba(2,6,23,0.2)',
          zIndex: 1000,
          minWidth: 320,
        }}
      >
        <h3 style={{ margin: '0 0 12px 0' }}>Commit Changes</h3>
        <div style={{ marginBottom: 12 }}>
          <input
            className="input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Commit message..."
            disabled={loading}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="button"
            onClick={handleCommit}
            disabled={loading || !message.trim()}
            style={{ opacity: loading || !message.trim() ? 0.5 : 1 }}
          >
            {loading ? 'Committing...' : 'Commit'}
          </button>
          <button
            className="button"
            onClick={() => onClose && onClose()}
            disabled={loading}
            style={{ background: '#9ca3af', opacity: loading ? 0.5 : 1 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}