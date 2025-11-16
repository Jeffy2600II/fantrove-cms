'use client';
export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="bg-white rounded-lg p-4 z-10 max-w-lg w-full">{children}</div>
    </div>
  );
}