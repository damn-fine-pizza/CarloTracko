import { create } from 'zustand';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

export const useUiStore = create<{ syncStatus: SyncStatus; lastSyncAt: string | null; setSyncStatus: (s: SyncStatus) => void; setLastSyncAt: (s: string | null) => void; }>((set) => ({
  syncStatus: navigator.onLine ? 'synced' : 'offline',
  lastSyncAt: null,
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
}));
