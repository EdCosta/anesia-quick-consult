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
  const viewMode = loading ? normalizedStoredViewMode : isPro ? normalizedStoredViewMode : 'normal';
  const isProView = viewMode === 'pro';
  const isHospitalView = !!hospitalProfile;

  const setViewMode = useCallback(
    (nextMode: ViewMode) => {
      if (nextMode === 'pro' && !isPro && !loading) {
        setStoredViewMode('normal');
        return;
      }

      setStoredViewMode(nextMode);
    },
    [isPro, loading, setStoredViewMode],
  );

  const setViewModeForPlan = useCallback(
    (plan: 'free' | 'pro') => {
      setStoredViewMode(plan === 'pro' ? 'pro' : 'normal');
    },
    [setStoredViewMode],
  );

  useEffect(() => {
    if (loading) return;

    const nextStoredViewMode = isPro ? normalizedStoredViewMode : 'normal';
    if (storedViewMode !== nextStoredViewMode) {
      setStoredViewMode(nextStoredViewMode);
    }
  }, [isPro, loading, normalizedStoredViewMode, setStoredViewMode, storedViewMode]);

  return { viewMode, setViewMode, setViewModeForPlan, isProView, isHospitalView, isPro, loading };
}
