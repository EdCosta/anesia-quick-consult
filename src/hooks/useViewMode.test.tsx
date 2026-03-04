import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useViewMode } from './useViewMode';

const mockUseLocalStorage = vi.fn();
const mockUseEntitlements = vi.fn();
const mockUseHospitalProfile = vi.fn();

vi.mock('./useLocalStorage', () => ({
  useLocalStorage: (...args: unknown[]) => mockUseLocalStorage(...args),
}));

vi.mock('./useEntitlements', () => ({
  useEntitlements: () => mockUseEntitlements(),
}));

vi.mock('./useHospitalProfile', () => ({
  useHospitalProfile: () => mockUseHospitalProfile(),
}));

describe('useViewMode', () => {
  beforeEach(() => {
    mockUseLocalStorage.mockReset();
    mockUseEntitlements.mockReset();
    mockUseHospitalProfile.mockReset();
    mockUseHospitalProfile.mockReturnValue(null);
  });

  it('preserves the stored pro mode while entitlements are still loading', () => {
    const setStoredViewMode = vi.fn();

    mockUseLocalStorage.mockReturnValue(['pro', setStoredViewMode]);
    mockUseEntitlements.mockReturnValue({ plan: 'free', isPro: false, loading: true });

    const { result } = renderHook(() => useViewMode());

    expect(result.current.viewMode).toBe('pro');
    expect(result.current.isProView).toBe(true);
    expect(setStoredViewMode).not.toHaveBeenCalled();
  });

  it('falls back to normal and persists that once a free plan is confirmed', () => {
    const setStoredViewMode = vi.fn();
    let loading = true;

    mockUseLocalStorage.mockReturnValue(['pro', setStoredViewMode]);
    mockUseEntitlements.mockImplementation(() => ({
      plan: 'free',
      isPro: false,
      loading,
    }));

    const { result, rerender } = renderHook(() => useViewMode());

    expect(result.current.viewMode).toBe('pro');
    expect(setStoredViewMode).not.toHaveBeenCalled();

    loading = false;
    rerender();

    expect(result.current.viewMode).toBe('normal');
    expect(setStoredViewMode).toHaveBeenCalledWith('normal');
  });
});
