import { Minus, Plus } from 'lucide-react';

const COUNTER_MAX = 1_000_000_000;
const COUNTER_MIN = 0;

const buttonBaseClass = 'w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';

interface CounterButtonProps {
  variant: 'increment' | 'decrement';
  icon: React.ReactNode;
  label: string;
}

function CounterButton({ variant, icon, label }: CounterButtonProps) {
  const variantClass = variant === 'increment'
    ? 'bg-success-600 hover:bg-success-700'
    : 'bg-error-600 hover:bg-error-700';

  const disabledClass = 'disabled:bg-gray-300 dark:disabled:bg-gray-700';

  return (
    <button
      className={`${buttonBaseClass} ${variantClass} ${disabledClass}`}
      aria-label={`${label} counter`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function Counter() {
  const value = 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-12 border border-gray-100 dark:border-gray-800">
        <div className="text-7xl md:text-8xl font-bold text-primary-700 dark:text-primary-300 tabular-nums tracking-tight text-center">
          {value.toLocaleString()}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <CounterButton
          variant="decrement"
          icon={<Minus className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />}
          label="Decrement"
        />
        <CounterButton
          variant="increment"
          icon={<Plus className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />}
          label="Increment"
        />
      </div>

      <div className="text-center space-y-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Range: {COUNTER_MIN.toLocaleString()} - {COUNTER_MAX.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
