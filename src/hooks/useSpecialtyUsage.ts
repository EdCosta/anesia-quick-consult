import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCallback, useMemo } from 'react';

type SpecialtyUsage = Record<string, number>;

export function useSpecialtyUsage() {
  const [usage, setUsage] = useLocalStorage<SpecialtyUsage>('anesia-specialty-usage', {});

  const increment = useCallback(
    (specialtyId: string) => {
      setUsage((prev) => ({ ...prev, [specialtyId]: (prev[specialtyId] || 0) + 1 }));
    },
    [setUsage]
  );

  const getSorted = useCallback(
    (allSpecialties: string[]): string[] => {
      return [...allSpecialties].sort((a, b) => (usage[b] || 0) - (usage[a] || 0));
    },
    [usage]
  );

  return { usage, increment, getSorted };
}
