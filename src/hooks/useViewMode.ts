import { useLocalStorage } from './useLocalStorage';
import { useEntitlements } from './useEntitlements';
import { useEffect } from 'react';

export type ViewMode = 'normal' | 'pro';

export function useViewMode() {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('anesia-view-mode', 'normal');
  const { isPro } = useEntitlements();

  useEffect(() => {
    if (viewMode === 'pro' && !isPro) {
      setViewMode('normal');
    }
  }, [viewMode, isPro, setViewMode]);

  const safeViewMode = viewMode === 'pro' && isPro ? 'pro' : 'normal';
  const isProView = safeViewMode === 'pro';

  return { viewMode: safeViewMode, setViewMode, isProView, isPro };
}
