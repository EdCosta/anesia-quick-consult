import { useState, useEffect, ReactNode, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Building2,
  Crown,
  UserPlus,
  ChevronDown,
  Loader2,
  KeyRound,
  Settings2,
  CircleHelp,
  ShieldCheck,
  FileText,
  Info,
  Mail,
  Sparkles,
  Layers3,
  LayoutGrid,
} from 'lucide-react';
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
import { buildPathWithSource } from '@/lib/checkoutAttribution';

const AIWidget = lazy(() => import('./AIWidget'));

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
      .from('hospital_profiles')
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
  const isHospitalModeActive = isPro && viewMode === 'pro' && !!activeProfile;
  const settingsLabel =
    lang === 'fr' ? 'Parametres' : lang === 'pt' ? 'Definicoes' : 'Settings';
  const viewModeOptions = [
    { value: 'normal' as const, label: t('mode_normal') },
    { value: 'pro' as const, label: t('mode_pro') },
  ];
  const footerLinks = [
    { to: '/topics', label: lang === 'fr' ? 'Themes' : lang === 'pt' ? 'Temas' : 'Topics', icon: Sparkles },
    { to: '/specialties', label: lang === 'fr' ? 'Specialites' : lang === 'pt' ? 'Especialidades' : 'Specialties', icon: Layers3 },
    { to: '/pricing', label: lang === 'fr' ? 'Tarifs' : lang === 'pt' ? 'Precos' : 'Pricing', icon: Crown },
    { to: '/faq', label: 'FAQ', icon: CircleHelp },
    { to: '/about', label: lang === 'fr' ? 'A propos' : lang === 'pt' ? 'Sobre' : 'About', icon: Info },
    { to: '/contact', label: lang === 'fr' ? 'Contact' : lang === 'pt' ? 'Contacto' : 'Contact', icon: Mail },
    { to: '/privacy', label: lang === 'fr' ? 'Confidentialite' : lang === 'pt' ? 'Privacidade' : 'Privacy', icon: ShieldCheck },
    { to: '/terms', label: lang === 'fr' ? "Conditions" : lang === 'pt' ? 'Termos' : 'Terms', icon: FileText },
  ];
  const languageOptions = [
    { value: 'fr' as const, label: 'FR' },
    { value: 'en' as const, label: 'EN' },
    { value: 'pt' as const, label: 'PT' },
  ];
  const primaryDesktopNavKeys = ['home', 'guidelines', 'protocoles', 'alr'];
  const primaryDesktopNavItems = HEADER_ITEMS.filter((item) => primaryDesktopNavKeys.includes(item.key));
  const exploreItems = [
    ...HEADER_ITEMS.filter((item) => !primaryDesktopNavKeys.includes(item.key)).map((item) => ({
      to: item.to,
      label: t(item.key),
      icon: item.icon,
    })),
    ...footerLinks.slice(0, 3),
  ];
  const secondaryNavItems = footerLinks.slice(0, 3);
  const mobileUtilityLinks = user
    ? [
        { to: buildPathWithSource('/account', 'mobile_menu'), label: t('account'), icon: Crown },
        { to: '/account/settings', label: settingsLabel, icon: Settings2 },
      ]
    : [
        { to: '/pricing', label: lang === 'fr' ? 'Tarifs' : lang === 'pt' ? 'Precos' : 'Pricing', icon: Crown },
        { to: '/auth?mode=signup', label: t('sign_up'), icon: UserPlus },
        { to: '/auth?mode=signin', label: t('sign_in'), icon: KeyRound },
      ];
  const activeViewMode =
    viewModeOptions.find((option) => option.value === viewMode) ?? viewModeOptions[0];
  const availableViewModes = viewModeOptions.filter((option) => option.value !== viewMode);

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
              {primaryDesktopNavItems.map((item) => (
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
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      exploreItems.some((item) => location.pathname.startsWith(item.to))
                        ? 'bg-primary-foreground/15 text-primary-foreground'
                        : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>{lang === 'fr' ? 'Explorer' : lang === 'pt' ? 'Explorar' : 'Explore'}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-primary-foreground/70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-56 p-1">
                  {exploreItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </PopoverContent>
              </Popover>
            </nav>
          )}

          {!isMobile && (
            <div className="ml-auto flex items-center gap-2">
            {/* Hospital profile selector */}
            {isPro && viewMode === 'pro' && (
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
                          className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
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
            {/* Compact view mode selector */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title={t('switch_mode')}
                  className="inline-flex h-8 min-w-[5.25rem] items-center justify-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2.5 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30"
                  aria-haspopup="listbox"
                >
                  {viewMode === 'pro' && <Crown className="h-3 w-3" />}
                  <span>{activeViewMode.label}</span>
                  <ChevronDown className="h-3 w-3 text-primary-foreground/70" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-1">
                {availableViewModes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (option.value === 'pro' && !isPro && !loading) {
                        navigate(buildPathWithSource('/account', 'header_view_mode'));
                        return;
                      }

                      if (option.value === 'normal') {
                        setViewMode('normal');
                        return;
                      }

                      setViewMode('pro');
                    }}
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {option.value === 'pro' && <Crown className="h-3 w-3" />}
                    <span>{option.label}</span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <LanguageSwitcher />
            {user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30"
                    aria-label={settingsLabel}
                    title={settingsLabel}
                  >
                    <Settings2 className="h-4 w-4 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-44 p-1">
                  <Link
                    to={buildPathWithSource('/account', 'header_user_menu')}
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>{t('account')}</span>
                    {isPro && (
                      <Badge variant="secondary" className="ml-auto text-[9px]">
                        {t('plan_pro')}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    to="/account/settings"
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>{settingsLabel}</span>
                  </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut();
                      }}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{t('sign_out')}</span>
                    </button>
                </PopoverContent>
              </Popover>
            ) : (
              <>
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30"
                  aria-label={t('sign_up')}
                  title={t('sign_up')}
                >
                  <UserPlus className="h-3.5 w-3.5 shrink-0" />
                  <span>{t('sign_up')}</span>
                </Link>
                <Link
                  to="/auth?mode=signin"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-primary-foreground/20 px-3 text-xs font-medium text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30"
                  aria-label={t('sign_in')}
                  title={t('sign_in')}
                >
                  <KeyRound className="h-3.5 w-3.5 shrink-0" />
                  <span>{t('sign_in')}</span>
                </Link>
              </>
            )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background/95 backdrop-blur animate-fade-in">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="container flex min-h-screen flex-col justify-center gap-8 py-20">
            <div className="space-y-4">
              {primaryDesktopNavItems.map((item) => (
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

            <div className="space-y-3 border-t border-border/70 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Explore
              </p>
              {exploreItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 text-lg font-semibold transition-colors ${
                    location.pathname.startsWith(item.to)
                      ? 'text-accent'
                      : 'text-foreground hover:text-accent'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="space-y-4 border-t border-border/70 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {lang === 'fr' ? 'Contexte' : lang === 'pt' ? 'Contexto' : 'Context'}
              </p>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {lang === 'fr' ? 'Langue' : lang === 'pt' ? 'Idioma' : 'Language'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLang(option.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        lang === option.value
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border bg-background text-foreground hover:border-accent/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t('switch_mode')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {viewModeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (option.value === 'pro' && !isPro && !loading) {
                          setMenuOpen(false);
                          navigate(buildPathWithSource('/account', 'mobile_menu_view_mode'));
                          return;
                        }

                        if (option.value === 'normal') {
                          setViewMode('normal');
                          return;
                        }

                        setViewMode('pro');
                      }}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        viewMode === option.value
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border bg-background text-foreground hover:border-accent/40'
                      }`}
                    >
                      {option.value === 'pro' && <Crown className="h-3.5 w-3.5" />}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isPro && viewMode === 'pro' && profiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('hospital_profile')}
                  </p>
                  <div className="grid gap-2">
                    {profiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => applyHospitalMode(profile)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                          activeProfile === profile.id
                            ? 'border-accent bg-accent/10 text-foreground'
                            : 'border-border bg-background text-foreground hover:border-accent/40'
                        }`}
                      >
                        <span className="block font-medium">{profile.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {[profile.country, profile.default_lang.toUpperCase()].filter(Boolean).join(' · ')}
                        </span>
                      </button>
                    ))}
                    {activeProfile && (
                      <button
                        type="button"
                        onClick={clearHospitalMode}
                        className="rounded-xl border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                      >
                        {t('clear')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-border/70 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {user ? settingsLabel : 'Access'}
              </p>
              {mobileUtilityLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-semibold text-foreground transition-colors hover:text-accent"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              {user && (
                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false);
                    await supabase.auth.signOut();
                  }}
                  className="flex items-center gap-3 text-lg font-semibold text-foreground transition-colors hover:text-accent"
                >
                  <LogOut className="h-5 w-5" />
                  {t('sign_out')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border/80 bg-card/80">
        <div className="container flex flex-col gap-4 py-6 text-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md space-y-1.5">
            <p className="font-semibold text-foreground">
              {lang === 'fr'
                ? 'AnesIA centralise les outils et contenus de consultation anesthesique.'
                : lang === 'pt'
                  ? 'O AnesIA centraliza ferramentas e conteudo para consulta anestesica.'
                  : 'AnesIA centralizes tools and content for anesthesia consultation.'}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === 'fr'
                ? 'Concu pour aller vite au bloc, avec des parcours plus clairs entre contenu standard, Pro et mode hopital.'
                : lang === 'pt'
                  ? 'Pensado para acelerar o bloco, com percursos mais claros entre conteudo standard, Pro e modo hospital.'
                  : 'Built for fast clinical access, with clearer paths between standard content, Pro access, and hospital mode.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs sm:grid-cols-3">
            {footerLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <AIWidget />
      </Suspense>
    </div>
  );
}
