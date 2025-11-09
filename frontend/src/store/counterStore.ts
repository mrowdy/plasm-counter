import { create } from 'zustand';

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
    // Dummy implementation - just keeps current value
    set({ loading: false, error: null });
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
    // Dummy implementation - no actual polling
    set({ isPolling: enabled, isSyncing: false });
  },

  clearError: () => set({ error: null }),
}));
