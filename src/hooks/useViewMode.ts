import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useEntitlements } from './useEntitlements';
import { useHospitalProfile } from './useHospitalProfile';

export type ViewMode = 'normal' | 'pro';

function normalizeViewMode(value: string): ViewMode {
  return value === 'pro' ? 'pro' : 'normal';
}

export function useViewMode() {
  const [storedViewMode, setViewMode] = useLocalStorage<string>('anesia-view-mode', 'normal');
  const { isPro, loading } = useEntitlements();
  const hospitalProfile = useHospitalProfile();
  const viewMode = normalizeViewMode(storedViewMode);
  const isProView = viewMode === 'pro';
  const isHospitalView = !!hospitalProfile;

  useEffect(() => {
    if (storedViewMode !== viewMode) {
      setViewMode(viewMode);
    }
  }, [storedViewMode, viewMode, setViewMode]);

  return { viewMode, setViewMode, isProView, isHospitalView, isPro, loading };
}
