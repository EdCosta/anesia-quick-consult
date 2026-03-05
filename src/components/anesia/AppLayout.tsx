import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Building2, Crown, UserPlus, ChevronDown, Loader2, KeyRound } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { HEADER_ITEMS } from '@/config/nav';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useViewMode } from '@/hooks/useViewMode';
import { resolveEntitlementPlanForUser } from '@/hooks/useEntitlements';
import { Badge } from '@/components/ui/badge';
import { isSupportedLang } from '@/i18n';
import type { HospitalProfile } from '@/lib/types';
import AIWidget from './AIWidget';

interface AppLayoutProps {
  children: ReactNode;
}

const HOSPITAL_PROFILE_ID_KEY = 'anesia-hospital-profile';
const HOSPITAL_PROFILE_DATA_KEY = 'anesia-hospital-profile-data';

type HospitalProfileSettings = {
  id: string;
  country?: string | null;
  default_lang?: string | null;
  formulary?: HospitalProfile['formulary'] | null;
  protocol_overrides?: HospitalProfile['protocol_overrides'] | null;
};

type HospitalProfileRow = {
  id: string;
  name: string;
  settings?: unknown;
  country?: string | null;
  default_lang?: string | null;
  formulary?: HospitalProfile['formulary'] | null;
  protocol_overrides?: HospitalProfile['protocol_overrides'] | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStoredHospitalProfileId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(HOSPITAL_PROFILE_ID_KEY);
}

function getHospitalProfileDisplayName(name: string) {
  const normalized = name.trim();
  if (/(saint|st)[\s.-]*pierre/i.test(normalized)) {
    return 'CHU St Pierre';
  }
  return normalized;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { t, setLang, lang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<HospitalProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [activeProfile, setActiveProfile] = useState<string | null>(() => readStoredHospitalProfileId());
  const { viewMode, setViewMode, setViewModeForPlan, isPro, loading } = useViewMode();

  const clearHospitalMode = () => {
    setActiveProfile(null);
    localStorage.removeItem(HOSPITAL_PROFILE_ID_KEY);
  };

  const applyHospitalMode = (profile: HospitalProfile) => {
    setViewMode('pro');
    setActiveProfile(profile.id);
    localStorage.setItem(HOSPITAL_PROFILE_ID_KEY, profile.id);
    setLang(profile.default_lang);
  };

  useEffect(() => {
    setLoadingProfiles(true);
    supabase
      .from('hospital_profiles' as any)
      .select('id, name, settings, country, default_lang, formulary, protocol_overrides')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading hospital profiles:', error);
          setLoadingProfiles(false);
          return;
        }

        const rows: HospitalProfileRow[] = Array.isArray(data)
          ? data.flatMap((row) => {
              if (!isRecord(row)) return [];
              if (typeof row.id !== 'string' || typeof row.name !== 'string') return [];

              return [
                {
                  id: row.id,
                  name: row.name,
                  settings: row.settings,
                  country: typeof row.country === 'string' ? row.country : null,
                  default_lang: typeof row.default_lang === 'string' ? row.default_lang : null,
                  formulary: isRecord(row.formulary)
                    ? (row.formulary as HospitalProfile['formulary'])
                    : null,
                  protocol_overrides: isRecord(row.protocol_overrides)
                    ? (row.protocol_overrides as HospitalProfile['protocol_overrides'])
                    : null,
                },
              ];
            })
          : [];
        if (rows.length === 0) {
          setProfiles([]);
          setLoadingProfiles(false);
          return;
        }

        setProfiles(
          rows.map((p) => {
            const settings = isRecord(p.settings) ? (p.settings as HospitalProfileSettings) : {};
            const defaultLangSource = p.default_lang ?? settings.default_lang;
            const defaultLang = isSupportedLang(defaultLangSource) ? defaultLangSource : 'fr';

            return {
              id: p.id,
              name: getHospitalProfileDisplayName(p.name),
              country: p.country || settings.country || undefined,
              default_lang: defaultLang,
              formulary: p.formulary || settings.formulary || { drug_ids: [], presentations: [] },
              protocol_overrides: p.protocol_overrides || settings.protocol_overrides || {},
            };
          }),
        );
        setLoadingProfiles(false);
      });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user?.id) {
        void resolveEntitlementPlanForUser(session.user.id).then((plan) => {
          setViewModeForPlan(plan);
        });
        return;
      }

      if (event === 'SIGNED_OUT') {
        setViewModeForPlan('free');
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [setViewModeForPlan]);

  useEffect(() => {
    if (!activeProfile || profiles.length === 0) return;
    if (!profiles.some((profile) => profile.id === activeProfile)) {
      clearHospitalMode();
    }
  }, [activeProfile, profiles]);

  useEffect(() => {
    if (loading) return;
    if (!isPro && activeProfile) {
      clearHospitalMode();
    }
  }, [activeProfile, isPro, loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!activeProfile) {
      localStorage.removeItem(HOSPITAL_PROFILE_DATA_KEY);
      window.dispatchEvent(new Event('anesia-hospital-profile-updated'));
      return;
    }

    const profile = profiles.find((item) => item.id === activeProfile);
    if (!profile) return;

    localStorage.setItem(HOSPITAL_PROFILE_DATA_KEY, JSON.stringify(profile));
    setLang(profile.default_lang);
    window.dispatchEvent(new Event('anesia-hospital-profile-updated'));
  }, [activeProfile, profiles, setLang]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const hospitalModeLabel =
    lang === 'fr' ? 'Hospitalier' : lang === 'pt' ? 'Hospitalar' : 'Hospital';
  const selectedMode = isPro && activeProfile ? 'hospital' : viewMode;
  const viewModeOptions = [
    { value: 'normal' as const, label: t('mode_normal') },
    { value: 'pro' as const, label: t('mode_pro') },
    { value: 'hospital' as const, label: hospitalModeLabel },
  ];
  const activeViewMode =
    viewModeOptions.find((option) => option.value === selectedMode) ?? viewModeOptions[0];
  const availableViewModes = viewModeOptions.filter((option) => option.value !== selectedMode);
  const isHospitalModeActive = selectedMode === 'hospital';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="container flex h-14 items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 -ml-1"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-0.5 font-heading text-lg font-bold shrink-0"
          >
            <span className="text-accent">Anes</span>
            <span>IA</span>
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <nav className="flex-1 flex items-center justify-center gap-1">
              {HEADER_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive(item.to)
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Hospital profile selector */}
            {isPro && (
              <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition-colors ${
                    isHospitalModeActive
                      ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30'
                      : 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15'
                  }`}
                  title={t('hospital_profile')}
                >
                  <Building2 className="h-4 w-4" />
                  <span>{t('hospital_profile')}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <p className="mb-2 text-xs font-semibold text-foreground">
                  {t('select_profile')}
                </p>
                {loadingProfiles ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No hospital profiles loaded yet.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Apply the St Pierre hospital profile migration in Supabase to make it selectable.
                    </p>
                  </div>
                ) : (
                  <>
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          applyHospitalMode(p);
                        }}
                        className={`w-full text-left rounded px-2 py-1.5 text-xs transition-colors ${
                          activeProfile === p.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="block">{p.name}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {[p.country, p.default_lang.toUpperCase()].filter(Boolean).join(' · ')}
                        </span>
                      </button>
                    ))}
                    {activeProfile && (
                      <button
                        onClick={() => {
                          clearHospitalMode();
                        }}
                        className="mt-1 w-full rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                      >
                        {t('clear')}
                      </button>
                    )}
                  </>
                )}
              </PopoverContent>
              </Popover>
            )}
            {/* Plan badge - links to /account */}
            {user && isPro && (
              <Link to="/account">
                <Badge variant="default" className="text-[10px] gap-0.5 cursor-pointer hover:opacity-80">
                  <Crown className="h-2.5 w-2.5" />
                  {t('plan_pro')}
                </Badge>
              </Link>
            )}
            {/* Compact view mode selector */}
            <div className="group relative shrink-0">
                <button
                  type="button"
                  title={t('switch_mode')}
                  className={`inline-flex h-8 min-w-[5.25rem] items-center justify-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    isHospitalModeActive
                      ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30 focus-visible:ring-emerald-200/40'
                      : 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 focus-visible:ring-primary-foreground/30'
                  }`}
                  aria-haspopup="listbox"
                >
                {selectedMode === 'pro' && <Crown className="h-3 w-3" />}
                {selectedMode === 'hospital' && <Building2 className="h-3 w-3" />}
                <span>{activeViewMode.label}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform group-hover:rotate-180 group-focus-within:rotate-180 ${
                    isHospitalModeActive ? 'text-emerald-100/80' : 'text-primary-foreground/70'
                  }`}
                />
              </button>

              <div className="absolute left-0 top-full z-50 hidden pt-1 group-hover:block group-focus-within:block">
                <div className="min-w-full rounded-xl border border-border bg-card p-1 shadow-lg">
                  {availableViewModes.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if ((option.value === 'pro' || option.value === 'hospital') && !isPro && !loading) {
                          navigate('/account');
                          return;
                        }

                        if (option.value === 'normal') {
                          clearHospitalMode();
                          setViewMode('normal');
                          return;
                        }

                        if (option.value === 'pro') {
                          clearHospitalMode();
                          setViewMode('pro');
                          return;
                        }

                        const profile = profiles.find((item) => item.id === activeProfile) || profiles[0];
                        if (!profile) return;
                        applyHospitalMode(profile);
                      }}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {option.value === 'pro' && <Crown className="h-3 w-3" />}
                      {option.value === 'hospital' && <Building2 className="h-3 w-3" />}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <LanguageSwitcher />
            {user ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
                className="group inline-flex h-9 w-9 items-center gap-2 overflow-hidden rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-2.5 text-primary-foreground/75 transition-all duration-200 hover:w-32 hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:w-32 focus-visible:text-primary-foreground"
                aria-label={t('sign_out')}
                title={t('sign_out')}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="pointer-events-none whitespace-nowrap text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {t('sign_out')}
                </span>
              </button>
            ) : (
              <>
                <Link
                  to="/auth?mode=signup"
                  className="group inline-flex h-9 w-9 items-center gap-2 overflow-hidden rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2.5 text-primary-foreground transition-all duration-200 hover:w-36 hover:bg-primary-foreground/15 focus-visible:w-36"
                  aria-label={t('sign_up')}
                  title={t('sign_up')}
                >
                  <UserPlus className="h-3.5 w-3.5 shrink-0" />
                  <span className="pointer-events-none whitespace-nowrap text-xs font-semibold opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {t('sign_up')}
                  </span>
                </Link>
                <Link
                  to="/auth?mode=signin"
                  className="group inline-flex h-9 w-9 items-center gap-2 overflow-hidden rounded-full border border-primary-foreground/20 px-2.5 text-primary-foreground/85 transition-all duration-200 hover:w-32 hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:w-32"
                  aria-label={t('sign_in')}
                  title={t('sign_in')}
                >
                  <KeyRound className="h-3.5 w-3.5 shrink-0" />
                  <span className="pointer-events-none whitespace-nowrap text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {t('sign_in')}
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur flex flex-col items-center justify-center gap-6 animate-fade-in">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
          {HEADER_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 text-xl font-semibold transition-colors ${
                isActive(item.to) ? 'text-accent' : 'text-foreground hover:text-accent'
              }`}
            >
              <item.icon className="h-6 w-6" />
              {t(item.key)}
            </Link>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">{children}</div>
      <AIWidget />
    </div>
  );
}
