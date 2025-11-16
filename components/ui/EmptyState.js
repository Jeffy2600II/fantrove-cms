'use client';
export default function EmptyState({ title = 'Empty', message = 'No items' }) {
  return (
    <div className="text-center p-6 text-gray-500">
      <div className="text-2xl mb-2">—</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm">{message}</div>
    </div>
  );
}