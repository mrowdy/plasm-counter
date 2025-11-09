import { useEffect } from 'react';
import { XCircle, Minus, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { useCounterStore } from '../store/counterStore';

const COUNTER_MAX = 1_000_000_000;
const COUNTER_MIN = 0;

const buttonBaseClass = 'w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';

interface CounterButtonProps {
  onClick: () => void;
  disabled: boolean;
  variant: 'increment' | 'decrement';
  icon: React.ReactNode;
  label: string;
}

function CounterButton({ onClick, disabled, variant, icon, label }: CounterButtonProps) {
  const variantClass = variant === 'increment'
    ? 'bg-success-600 hover:bg-success-700'
    : 'bg-error-600 hover:bg-error-700';

  const disabledClass = 'disabled:bg-gray-300 dark:disabled:bg-gray-700';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBaseClass} ${variantClass} ${disabledClass}`}
      aria-label={`${label} counter`}
      aria-disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      onClick={onDismiss}
      className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-error-100 dark:hover:bg-error-900/40 group"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-error-600 dark:text-error-400 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-medium text-error-800 dark:text-error-200">{message}</p>
          <p className="text-xs text-error-600 dark:text-error-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to dismiss
          </p>
        </div>
      </div>
    </div>
  );
}

function BoundaryWarning({ type }: { type: 'min' | 'max' }) {
  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-400 rounded-full">
      <AlertTriangle className="w-4 h-4" />
      At {type === 'min' ? 'minimum' : 'maximum'}
    </span>
  );
}

export default function Counter() {
  const { value, error, isSyncing, increment, decrement, fetchCount, setPolling, clearError } = useCounterStore();

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    setPolling(true);
    return () => setPolling(false);
  }, [setPolling]);

  const isAtMin = value === COUNTER_MIN;
  const isAtMax = value === COUNTER_MAX;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-12 border border-gray-100 dark:border-gray-800">
        <div className={`absolute top-4 right-4 transition-opacity duration-100 ${isSyncing ? 'opacity-100' : 'opacity-0'}`}>
          <Loader2 className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>

        <div className="text-7xl md:text-8xl font-bold text-primary-700 dark:text-primary-300 tabular-nums tracking-tight text-center">
          {value.toLocaleString()}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <CounterButton
          onClick={decrement}
          disabled={isAtMin}
          variant="decrement"
          icon={<Minus className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />}
          label="Decrement"
        />
        <CounterButton
          onClick={increment}
          disabled={isAtMax}
          variant="increment"
          icon={<Plus className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />}
          label="Increment"
        />
      </div>

      <div className="text-center space-y-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Range: {COUNTER_MIN.toLocaleString()} - {COUNTER_MAX.toLocaleString()}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs">
          {isAtMin && <BoundaryWarning type="min" />}
          {isAtMax && <BoundaryWarning type="max" />}
        </div>
      </div>
    </div>
  );
}
