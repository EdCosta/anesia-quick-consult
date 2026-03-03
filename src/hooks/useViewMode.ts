import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useEntitlements } from './useEntitlements';
import { useHospitalProfile } from './useHospitalProfile';

export type ViewMode = 'normal' | 'pro';

function normalizeViewMode(value: string): ViewMode {
  return value === 'pro' ? 'pro' : 'normal';
}

export function useViewMode() {
  const [storedViewMode, setStoredViewMode] = useLocalStorage<string>('anesia-view-mode', 'normal');
  const { isPro, loading } = useEntitlements();
  const hospitalProfile = useHospitalProfile();
  const normalizedStoredViewMode = normalizeViewMode(storedViewMode);
  const viewMode = isPro ? normalizedStoredViewMode : 'normal';
  const isProView = viewMode === 'pro';
  const isHospitalView = !!hospitalProfile;

  const setViewMode = useCallback(
    (nextMode: ViewMode) => {
      setStoredViewMode(nextMode === 'pro' && !isPro ? 'normal' : nextMode);
    },
    [isPro, setStoredViewMode],
  );

  useEffect(() => {
    if (storedViewMode !== viewMode) {
      setStoredViewMode(viewMode);
    }
  }, [storedViewMode, viewMode, setStoredViewMode]);

  return { viewMode, setViewMode, isProView, isHospitalView, isPro, loading };
}
