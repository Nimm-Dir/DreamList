/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        panelAlt: 'var(--panel-alt)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        accentHover: 'var(--accent-hover)',
        accentSoft: 'var(--accent-soft)',
        danger: 'var(--danger)',
      },
      fontSize: {
        base: 'var(--font-size-base)',
      },
    },
  },
  plugins: [],
}
