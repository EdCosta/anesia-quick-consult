import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, Building2, Crown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { HEADER_ITEMS } from '@/config/nav';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEntitlements } from '@/hooks/useEntitlements';
import { Badge } from '@/components/ui/badge';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(() => localStorage.getItem('anesia-hospital-profile'));
  const { plan, isPro } = useEntitlements();

  useEffect(() => {
    supabase.from('hospital_profiles' as any).select('id, name').then(({ data }) => {
      if (data) setProfiles((data as any[]).map((p: any) => ({ id: p.id, name: p.name })));
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="container flex h-14 items-center gap-3">
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 -ml-1" aria-label="Menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-0.5 font-heading text-lg font-bold shrink-0">
            <span className="text-accent">Anes</span>
            <span>IA</span>
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <nav className="flex-1 flex items-center justify-center gap-1">
              {HEADER_ITEMS.map(item => (
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
                  <p className="text-xs font-semibold text-foreground mb-2">{t('select_profile')}</p>
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setActiveProfile(p.id); localStorage.setItem('anesia-hospital-profile', p.id); }}
                      className={`w-full text-left rounded px-2 py-1.5 text-xs transition-colors ${
                        activeProfile === p.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                  {activeProfile && (
                    <button
                      onClick={() => { setActiveProfile(null); localStorage.removeItem('anesia-hospital-profile'); }}
                      className="w-full mt-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      {t('clear')}
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )}
            {/* Plan badge */}
            {user && (
              <Badge variant={isPro ? 'default' : 'secondary'} className="text-[10px] gap-0.5">
                {isPro && <Crown className="h-2.5 w-2.5" />}
                {isPro ? t('plan_pro') : t('plan_free')}
              </Badge>
            )}
            <LanguageSwitcher />
            {user ? (
              <button
                onClick={async () => { await supabase.auth.signOut(); }}
                className="p-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                aria-label={t('sign_out')}
                title={t('sign_out')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="p-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                aria-label={t('sign_in')}
                title={t('sign_in')}
              >
                <LogIn className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur flex flex-col items-center justify-center gap-6 animate-fade-in">
          <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 p-2 text-foreground">
            <X className="h-6 w-6" />
          </button>
          {HEADER_ITEMS.map(item => (
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
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
