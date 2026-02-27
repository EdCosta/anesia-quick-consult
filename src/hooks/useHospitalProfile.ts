import { useEffect, useState } from 'react';
import type { HospitalProfile } from '@/lib/types';

const STORAGE_KEY = 'anesia-hospital-profile-data';

function readStoredProfile(): HospitalProfile | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as HospitalProfile;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function useHospitalProfile() {
  const [profile, setProfile] = useState<HospitalProfile | null>(() => readStoredProfile());

  useEffect(() => {
    const sync = () => setProfile(readStoredProfile());
    window.addEventListener('storage', sync);
    window.addEventListener('anesia-hospital-profile-updated', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('anesia-hospital-profile-updated', sync as EventListener);
    };
  }, []);

  return profile;
}
