'use client';

import { useState } from 'react';

interface CounterProps {
  initial?: number;
  label?: string;
}

export function Counter({ initial = 0, label = 'Count' }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div className="my-6 p-6 border border-cyan-400/30 rounded-lg bg-cyan-400/5 inline-block">
      <p className="font-mono text-sm mb-4">
        {label}: <span className="text-cyan-400 font-bold text-lg">{count}</span>
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded hover:bg-red-500/30 transition text-sm font-mono"
        >
          Decrement
        </button>
        <button
          onClick={() => setCount(initial)}
          className="px-4 py-2 bg-slate-500/20 border border-slate-500/50 rounded hover:bg-slate-500/30 transition text-sm font-mono"
        >
          Reset
        </button>
        <button
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded hover:bg-cyan-500/30 transition text-sm font-mono"
        >
          Increment
        </button>
      </div>
    </div>
  );
}
