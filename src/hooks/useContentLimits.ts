import { useEntitlements } from './useEntitlements';

const LIMITS_NORMAL = {
  procedures: Infinity,
  protocols: 0,
  alr: 0,
  calculators: Infinity,
  guidelines: 0,
};

const LIMITS_PRO = {
  procedures: Infinity,
  protocols: Infinity,
  alr: Infinity,
  calculators: Infinity,
  guidelines: Infinity,
};

export function useContentLimits() {
  const { isPro } = useEntitlements();
  const limits = isPro ? LIMITS_PRO : LIMITS_NORMAL;

  return {
    ...limits,
    isLimited: !isPro,
  };
}
