import { useLocalStorage } from './useLocalStorage';
import { useEntitlements } from './useEntitlements';

export type ViewMode = 'normal' | 'pro';

export function useViewMode() {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('anesia-view-mode', 'normal');
  const { isPro } = useEntitlements();

  // TODO: re-enable entitlement check before going to production
  // const isProView = viewMode === 'pro' && isPro;
  const isProView = viewMode === 'pro';

  return { viewMode, setViewMode, isProView, isPro };
}
