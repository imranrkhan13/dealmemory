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
        'relative inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink-soft  transition-all',
        'hover:bg-accent-tint hover:text-accent hover:border-accent-line focus:outline-none focus:ring-2 focus:ring-accent',
        copied ? 'border-success/40 bg-success-tint text-success hover:bg-success-tint' : '',
        anim ? 'scale-95' : 'scale-100',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className ?? '',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'inline-block h-3.5 w-3.5 rounded-full transition-all',
          copied ? 'bg-success ' : 'bg-line',
        ].join(' ')}
      />
      <span className="transition-opacity">
        {copied ? 'Copied!' : label}
      </span>
    </button>
  );
}
