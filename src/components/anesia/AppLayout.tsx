import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, Building2, Crown, UserPlus, ChevronDown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { HEADER_ITEMS } from '@/config/nav';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useViewMode } from '@/hooks/useViewMode';
import { Badge } from '@/components/ui/badge';
import type { HospitalProfile } from '@/lib/types';

interface AppLayoutProps {
  children: ReactNode;
}

const HOSPITAL_PROFILE_ID_KEY = 'anesia-hospital-profile';
const HOSPITAL_PROFILE_DATA_KEY = 'anesia-hospital-profile-data';

type HospitalProfileRow = {
  id: string;
  name: string;
  country?: string | null;
  default_lang?: string | null;
  formulary?: HospitalProfile['formulary'] | null;
  protocol_overrides?: HospitalProfile['protocol_overrides'] | null;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { t, setLang } = useLang();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<HospitalProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(() =>
    localStorage.getItem(HOSPITAL_PROFILE_ID_KEY),
  );
  const { isPro } = useEntitlements();
  const { viewMode, setViewMode } = useViewMode();

  useEffect(() => {
    supabase
      .from('hospital_profiles')
      .select('id, name, country, default_lang, formulary, protocol_overrides')
      .then(({ data }) => {
        const rows = (data ?? []) as HospitalProfileRow[];
        if (rows.length === 0) return;

        setProfiles(
          rows.map((p) => ({
            id: p.id,
            name: p.name,
            country: p.country || undefined,
            default_lang: p.default_lang || 'fr',
            formulary: p.formulary || { drug_ids: [], presentations: [] },
            protocol_overrides: p.protocol_overrides || {},
          })),
        );
      });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeProfile || profiles.length === 0) return;
    if (!profiles.some((profile) => profile.id === activeProfile)) {
      setActiveProfile(null);
      localStorage.removeItem(HOSPITAL_PROFILE_ID_KEY);
    }
  }, [activeProfile, profiles]);

  useEffect(() => {
    if (!activeProfile) {
      localStorage.removeItem(HOSPITAL_PROFILE_DATA_KEY);
      window.dispatchEvent(new Event('anesia-hospital-profile-updated'));
      return;
    }

    const profile = profiles.find((item) => item.id === activeProfile);
    if (!profile) return;

    localStorage.setItem(HOSPITAL_PROFILE_DATA_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('anesia-hospital-profile-updated'));
  }, [activeProfile, profiles]);

  const isActive = (path: string) => location.pathname === path;
  const viewModeOptions = [
    { value: 'normal' as const, label: t('mode_normal') },
    { value: 'pro' as const, label: t('mode_pro') },
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
            {user && profiles.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="p-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                    title={t('hospital_profile')}
                  >
                    <Building2 className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <p className="text-xs font-semibold text-foreground mb-2">
                    {t('select_profile')}
                  </p>
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProfile(p.id);
                        localStorage.setItem(HOSPITAL_PROFILE_ID_KEY, p.id);
                        setLang(p.default_lang);
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
                        setActiveProfile(null);
                        localStorage.removeItem(HOSPITAL_PROFILE_ID_KEY);
                      }}
                      className="w-full mt-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      {t('clear')}
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )}
            {/* Plan badge - links to /account */}
            {user && (
              <Link to="/account">
                <Badge
                  variant={isPro ? 'default' : 'secondary'}
                  className="text-[10px] gap-0.5 cursor-pointer hover:opacity-80"
                >
                  {isPro && <Crown className="h-2.5 w-2.5" />}
                  {isPro ? t('plan_pro') : t('plan_free')}
                </Badge>
              </Link>
            )}
            {/* Compact view mode selector */}
            <div className="group relative shrink-0">
              <button
                type="button"
                title={t('switch_mode')}
                className="inline-flex h-8 min-w-[5.25rem] items-center justify-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2.5 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30"
                aria-haspopup="listbox"
              >
                {viewMode === 'pro' && <Crown className="h-3 w-3" />}
                <span>{activeViewMode.label}</span>
                <ChevronDown className="h-3 w-3 text-primary-foreground/70 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
              </button>

              <div className="absolute left-0 top-full z-50 hidden pt-1 group-hover:block group-focus-within:block">
                <div className="min-w-full rounded-xl border border-border bg-card p-1 shadow-lg">
                  {availableViewModes.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setViewMode(option.value)}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {option.value === 'pro' && <Crown className="h-3 w-3" />}
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
                  <LogIn className="h-3.5 w-3.5 shrink-0" />
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
    </div>
  );
}
