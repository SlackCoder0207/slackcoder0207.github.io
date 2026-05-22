import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ThemeConfig, ThemeId } from './types';
import { themes, clinicalArchive } from './theme';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: clinicalArchive,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => clinicalArchive);

  const setTheme = (id: ThemeId) => {
    const t = themes[id] ?? clinicalArchive;
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t.id);
    // Persist
    try {
      localStorage.setItem('riat-theme', t.id);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme.id === 'clinical' ? 'deconstruction' : 'clinical');
  };

  useEffect(() => {
    const saved = localStorage.getItem('riat-theme') as ThemeId | null;
    if (saved && themes[saved]) {
      setTheme(saved);
    } else {
      document.documentElement.setAttribute('data-theme', theme.id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
