import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, LayoutDashboard, FileText, Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: ReactNode;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

const NAV_ITEMS = [
  { key: 'home', to: '/', icon: LayoutDashboard },
  { key: 'admin', to: '/admin-content', icon: Settings },
];

export default function AppLayout({ children, searchQuery, onSearchChange }: AppLayoutProps) {
  const { t } = useLang();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="container flex h-14 items-center gap-3">
          {/* Mobile hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 -ml-1" aria-label="Menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 font-heading text-lg font-bold shrink-0">
            <span className="text-accent">Anes</span>
            <span>IA</span>
          </Link>

          {/* Search bar (center) */}
          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={t('search_placeholder')}
                className="h-9 w-full rounded-lg bg-primary-foreground/10 pl-9 pr-3 text-sm text-primary-foreground placeholder:text-primary-foreground/40 border border-primary-foreground/15 focus:outline-none focus:bg-primary-foreground/15 transition-colors"
              />
            </div>
          </div>

          {/* Desktop nav */}
          {!isMobile && (
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(item => (
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

          <LanguageSwitcher />
        </div>

        {/* Mobile search */}
        {isMobile && (
          <div className="container pb-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={t('search_placeholder')}
                className="h-9 w-full rounded-lg bg-primary-foreground/10 pl-9 pr-3 text-sm text-primary-foreground placeholder:text-primary-foreground/40 border border-primary-foreground/15 focus:outline-none focus:bg-primary-foreground/15 transition-colors"
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile fullscreen menu */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur flex flex-col items-center justify-center gap-6 animate-fade-in"
          style={{ top: '0' }}
        >
          <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 p-2 text-foreground">
            <X className="h-6 w-6" />
          </button>
          {NAV_ITEMS.map(item => (
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
