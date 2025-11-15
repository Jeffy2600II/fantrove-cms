import { useEffect } from 'react';

interface NotificationProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Notification({ type = 'info', message = '', onClose }: NotificationProps) {
  useEffect(() => {
    const t = setTimeout(() => {
      onClose && onClose();
    }, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  const title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info';

  return (
    <div
      className="notification"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 20,
        top: 20,
        background: bgColor,
        color: 'white',
        padding: '10px 14px',
        borderRadius: 8,
        zIndex: 2000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '14px' }}>{message}</div>
      <div style={{ marginTop: 8 }}>
        <button
          className="button"
          onClick={() => onClose && onClose()}
          style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', fontSize: '12px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}