import { useUiStore } from '../stores/ui.store';

export function SyncIndicator() {
  const { syncStatus, lastSyncAt } = useUiStore();
  const color = syncStatus === 'synced' ? 'bg-emerald-400' : syncStatus === 'syncing' ? 'bg-orange-400 animate-pulse' : 'bg-slate-400';
  return <div className='flex items-center gap-2 text-xs text-slate-300'><span className={`inline-block h-2 w-2 rounded-full ${color}`} />{lastSyncAt ? `Last sync ${new Date(lastSyncAt).toLocaleTimeString()}` : 'No sync yet'}</div>;
}
