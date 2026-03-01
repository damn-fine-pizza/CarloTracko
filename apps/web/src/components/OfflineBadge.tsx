export function OfflineBadge() {
  if (navigator.onLine) return null;
  return <span className='rounded bg-slate-700 px-2 py-1 text-xs'>Offline</span>;
}
