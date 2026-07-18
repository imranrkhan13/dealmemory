'use client';

import { useEffect, useState } from 'react';

type Props = {
  getText: () => string | null | undefined;
  label?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function CopyButton({ getText, label = 'Copy', className, disabled, ariaLabel }: Props) {
  const [copied, setCopied] = useState(false);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    let to: number | undefined = undefined;
    if (copied) {
      to = window.setTimeout(() => setCopied(false), 2000);
    }
    return () => {
      if (to) window.clearTimeout(to);
    };
  }, [copied]);

  const onCopy = async () => {
    if (disabled) return;
    const text = getText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      // trigger micro animation
      setAnim(true);
      setCopied(true);
      window.setTimeout(() => setAnim(false), 300);
    } catch {
      // noop
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={[
        'relative inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all',
        'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500',
        copied ? 'border-green-300 bg-green-50 text-green-700' : '',
        anim ? 'scale-95' : 'scale-100',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className ?? '',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'inline-block h-4 w-4 rounded-full transition-all',
          copied ? 'bg-green-600' : 'bg-gray-400',
        ].join(' ')}
      />
      <span className="transition-opacity">
        {copied ? 'Copied!' : label}
      </span>
    </button>
  );
}