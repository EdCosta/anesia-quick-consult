import { useViewMode } from './useViewMode';

const LIMITS_NORMAL = {
  procedures: 5,
  protocols: 3,
  alr: 3,
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
  const { isProView } = useViewMode();
  const limits = isProView ? LIMITS_PRO : LIMITS_NORMAL;

  return {
    ...limits,
    isLimited: !isProView,
  };
}
