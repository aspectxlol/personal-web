'use client';

import { useState } from 'react';

interface ToggleProps {
  label?: string;
  onText?: string;
  offText?: string;
}

export function Toggle({ label = 'Toggle', onText = 'Enabled', offText = 'Disabled' }: ToggleProps) {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="my-6 p-6 border border-purple-400/30 rounded-lg bg-purple-400/5 inline-block">
      <p className="font-mono text-sm mb-4">
        {label}: <span className={`font-bold text-lg ${isOn ? 'text-purple-400' : 'text-slate-400'}`}>
          {isOn ? onText : offText}
        </span>
      </p>
      <button
        onClick={() => setIsOn(!isOn)}
        className={`px-6 py-2 rounded font-mono text-sm transition ${
          isOn
            ? 'bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30'
            : 'bg-slate-500/20 border border-slate-500/50 hover:bg-slate-500/30'
        }`}
      >
        {isOn ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  );
}
