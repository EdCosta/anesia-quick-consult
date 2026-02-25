import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';

export default function AppHeader() {
  const { t } = useLang();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
              A
            </span>
            AnesIA
          </Link>
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            <Link
              to="/"
              className={`transition-colors hover:text-primary ${
                location.pathname === '/' ? 'font-medium text-primary' : 'text-muted-foreground'
              }`}
            >
              {t('home')}
            </Link>
            <Link
              to="/admin-content"
              className={`transition-colors hover:text-primary ${
                location.pathname === '/admin-content' ? 'font-medium text-primary' : 'text-muted-foreground'
              }`}
            >
              {t('admin')}
            </Link>
          </nav>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
