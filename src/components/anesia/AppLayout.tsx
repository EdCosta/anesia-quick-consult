import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { HEADER_ITEMS } from '@/config/nav';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
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

          <div className="ml-auto">
            <LanguageSwitcher />
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
