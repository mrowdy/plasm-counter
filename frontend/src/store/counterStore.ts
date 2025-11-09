import { create } from 'zustand';
import { getCount, increment as apiIncrement, decrement as apiDecrement, ApiError } from '../api/client';

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
const POLLING_INTERVAL_MS = 2000;

let pollingIntervalId: ReturnType<typeof setInterval> | null = null;
let visibilityChangeHandler: (() => void) | null = null;

function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  }

  if (error.isBoundaryError()) {
    const message = error.message.toLowerCase();
    if (message.includes('maximum') || message.includes('max') || message.includes('1000000000')) {
      return `Counter is at maximum (${COUNTER_MAX.toLocaleString()})`;
    }
    if (message.includes('minimum') || message.includes('min') || message.includes('zero')) {
      return `Counter is at minimum (${COUNTER_MIN})`;
    }
    return error.message;
  }

  if (error.isNetworkError()) {
    return 'Network error. Please check your connection.';
  }

  if (error.isConcurrentConflict()) {
    return 'Update conflict. Please try again.';
  }

  return error.message || 'An error occurred';
}

async function performUpdate(
  currentValue: number,
  delta: number,
  apiCall: () => Promise<number>,
  set: (state: Partial<CounterState>) => void
): Promise<void> {
  const previousValue = currentValue;

  try {
    set({ value: currentValue + delta, loading: true, error: null });
    const newValue = await apiCall();
    set({ value: newValue, loading: false });
  } catch (error) {
    set({ value: previousValue, error: getErrorMessage(error), loading: false });
    console.error('Counter update failed:', error);
  }
}

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
      set({ error: getErrorMessage(error), loading: false });
      console.error('Failed to fetch counter value:', error);
    }
  },

  increment: async () => {
    const { value } = get();

    if (value >= COUNTER_MAX) {
      set({ error: `Counter is at maximum (${COUNTER_MAX.toLocaleString()})` });
      return;
    }

    await performUpdate(value, 1, apiIncrement, set);
  },

  decrement: async () => {
    const { value } = get();

    if (value <= COUNTER_MIN) {
      set({ error: `Counter is at minimum (${COUNTER_MIN})` });
      return;
    }

    await performUpdate(value, -1, apiDecrement, set);
  },

  setPolling: (enabled: boolean) => {
    if (enabled) {
      if (get().isPolling) return;

      set({ isPolling: true });

      const syncValue = async () => {
        try {
          set({ isSyncing: true });
          const value = await getCount();
          if (value !== get().value) {
            set({ value });
          }
        } catch (error) {
          console.warn('Background sync failed:', error);
        } finally {
          set({ isSyncing: false });
        }
      };

      const startPolling = () => {
        if (pollingIntervalId) clearInterval(pollingIntervalId);
        syncValue();
        pollingIntervalId = setInterval(syncValue, POLLING_INTERVAL_MS);
      };

      const stopPolling = () => {
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId);
          pollingIntervalId = null;
        }
      };

      visibilityChangeHandler = () => {
        if (document.visibilityState === 'visible') {
          startPolling();
        } else {
          stopPolling();
        }
      };

      document.addEventListener('visibilitychange', visibilityChangeHandler);

      if (document.visibilityState === 'visible') {
        startPolling();
      }
    } else {
      set({ isPolling: false, isSyncing: false });

      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
      }

      if (visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
        visibilityChangeHandler = null;
      }
    }
  },

  clearError: () => set({ error: null }),
}));
