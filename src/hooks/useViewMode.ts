import { useLocalStorage } from './useLocalStorage';
import { useEntitlements } from './useEntitlements';

export type ViewMode = 'normal' | 'pro';

export function useViewMode() {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('anesia-view-mode', 'normal');
  const { isPro } = useEntitlements();

  // isProView = user selected pro AND actually has entitlement
  const isProView = viewMode === 'pro' && isPro;

  return { viewMode, setViewMode, isProView, isPro };
}
