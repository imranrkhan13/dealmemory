import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0b1015',
          soft: '#555b61',
          faint: '#9b9ea2',
        },
        paper: {
          DEFAULT: '#f4f4f6',
          deep: '#ececef',
        },
        canvas: '#f5f5f5',
        line: {
          DEFAULT: '#e9e9ec',
          strong: '#d6d7da',
        },
        accent: {
          DEFAULT: '#0562ef',
          deep: '#0446c9',
          tint: '#eff4ff',
          line: '#cfdcfb',
        },
        muted: '#f1f2f4',
        success: {
          DEFAULT: '#1a7f4b',
          tint: '#edf7f0',
        },
        warn: {
          DEFAULT: '#8a5a00',
          tint: '#fbf4e6',
        },
        danger: {
          DEFAULT: '#b42318',
          tint: '#fdf1f0',
        },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        card: '10px',
      },
      boxShadow: {
        '2xs': '0 1px 1px rgba(11, 16, 21, 0.04)',
        xs: '0 1px 2px rgba(11, 16, 21, 0.05)',
        sm: '0 1px 2px rgba(11, 16, 21, 0.05)',
        md: '0 4px 12px -4px rgba(11, 16, 21, 0.12)',
        lg: '0 8px 24px -8px rgba(11, 16, 21, 0.16)',
        xl: '0 16px 40px -16px rgba(11, 16, 21, 0.2)',
        '2xl': '0 24px 56px -24px rgba(11, 16, 21, 0.24)',
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
    },
  },
  plugins: [],
};

export default config;
