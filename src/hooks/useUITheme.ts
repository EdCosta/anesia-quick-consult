import { useCallback, useEffect, useState } from 'react';
import {
  applyUITheme,
  persistUIThemeKey,
  readStoredUIThemeKey,
  resolveUIThemeKey,
  UI_THEMES,
  type UIThemeKey,
} from '@/lib/uiTheme';

export function useUITheme() {
  const [themeKey, setThemeKeyState] = useState<UIThemeKey>(() => readStoredUIThemeKey());

  useEffect(() => {
    applyUITheme(themeKey);
  }, [themeKey]);

  const setThemeKey = useCallback((nextThemeKey: UIThemeKey) => {
    const resolved = resolveUIThemeKey(nextThemeKey);
    persistUIThemeKey(resolved);
    setThemeKeyState(resolved);
  }, []);

  return {
    themeKey,
    setThemeKey,
    themes: UI_THEMES,
  };
}
