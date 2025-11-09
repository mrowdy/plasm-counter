import { create } from 'zustand';
import { getCount } from '../api/client';

interface CounterState {
  value: number;
  loading: boolean;
  error: string | null;
  isPolling: boolean;
  isSyncing: boolean;
}

interface CounterActions {
  fetchCount: () => Promise<void>;
  increment: () => Promise<void>;
  decrement: () => Promise<void>;
  setPolling: (enabled: boolean) => void;
  clearError: () => void;
}

type CounterStore = CounterState & CounterActions;

const COUNTER_MAX = 1_000_000_000;
const COUNTER_MIN = 0;

export const useCounterStore = create<CounterStore>((set, get) => ({
  value: 0,
  loading: false,
  error: null,
  isPolling: false,
  isSyncing: false,

  fetchCount: async () => {
    try {
      set({ loading: true, error: null });
      const value = await getCount();
      set({ value, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch counter value';
      set({ error: errorMessage, loading: false });
      console.error('Failed to fetch counter value:', error);
    }
  },

  increment: async () => {
    const { value } = get();

    if (value >= COUNTER_MAX) {
      set({ error: `Counter is at maximum (${COUNTER_MAX.toLocaleString()})` });
      return;
    }

    set({ value: value + 1, error: null });
  },

  decrement: async () => {
    const { value } = get();

    if (value <= COUNTER_MIN) {
      set({ error: `Counter is at minimum (${COUNTER_MIN})` });
      return;
    }

    set({ value: value - 1, error: null });
  },

  setPolling: (enabled: boolean) => {
    set({ isPolling: enabled, isSyncing: false });
  },

  clearError: () => set({ error: null }),
}));
