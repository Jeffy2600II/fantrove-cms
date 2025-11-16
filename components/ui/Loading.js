'use client';
export default function Loading({ text = 'Loading...' }) {
  return <div className="p-4 text-center text-gray-500">{text}</div>;
}