import { useLocalStorage } from './useLocalStorage';
import { useEntitlements } from './useEntitlements';

export type ViewMode = 'normal' | 'pro';

export function useViewMode() {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('anesia-view-mode', 'normal');
  const { isPro, loading } = useEntitlements();
  const isProView = viewMode === 'pro';

  return { viewMode, setViewMode, isProView, isPro, loading };
}
