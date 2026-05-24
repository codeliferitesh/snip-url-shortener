// ============================================================
// Theme Store — Dark/Light mode with system preference
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  resolved: 'dark' | 'light';
  setTheme: (t: Theme) => void;
}

function resolveTheme(t: Theme): 'dark' | 'light' {
  if (t === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return t;
}

function applyTheme(resolved: 'dark' | 'light') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme:    'dark',
      resolved: 'dark',

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ theme, resolved });
      },
    }),
    { name: 'snip-theme' }
  )
);

// Initialize theme on load
export function initTheme() {
  const { theme, setTheme } = useThemeStore.getState();
  setTheme(theme);

  // Listen for system preference changes
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      useThemeStore.getState().setTheme('system');
    }
  });
}
