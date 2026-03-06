import { useViewMode } from './useViewMode';

const LIMITS_NORMAL = {
  procedures: 16,
  protocols: 2,
  alr: 2,
  calculators: 3,
  guidelines: 3,
};

const LIMITS_PRO = {
  procedures: Infinity,
  protocols: Infinity,
  alr: Infinity,
  calculators: Infinity,
  guidelines: Infinity,
};

export function useContentLimits() {
  const { isProView, loading } = useViewMode();
  const hasUnlockedContent = !loading && isProView;
  const limits = hasUnlockedContent ? LIMITS_PRO : LIMITS_NORMAL;

  return {
    ...limits,
    isLimited: !hasUnlockedContent,
  };
}
