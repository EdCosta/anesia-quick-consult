import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import {
  Activity,
  Stethoscope,
  Search,
  X,
  Star,
  Trash2,
} from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import type { Procedure } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import SpecialtyFilter from '@/components/anesia/SpecialtyFilter';
import ProcedureCard from '@/components/anesia/ProcedureCard';
import { QUICK_ACCESS_ITEMS } from '@/config/nav';

export default function Index() {
  const { t, lang } = useLang();
  const { procedures, specialties, loading } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('anesia-favorites', []);
  const [recents, setRecents] = useLocalStorage<string[]>('anesia-recents', []);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favoritesFirst, setFavoritesFirst] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const favoritesRef = useRef<HTMLDivElement>(null);
  const proceduresRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);

  // Floating search bar via IntersectionObserver
  useEffect(() => {
    const el = heroSearchRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingSearch(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(procedures, {
      keys: [
        { name: `titles.${lang}`, weight: 2 },
        { name: 'titles.fr', weight: 1.5 },
        { name: `synonyms.${lang}`, weight: 1.5 },
        { name: 'synonyms.fr', weight: 1 },
        { name: 'specialty', weight: 0.5 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
    });
  }, [procedures, lang]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return fuse.search(searchQuery).map((r) => r.item);
  }, [searchQuery, fuse]);

  const filteredResults = useMemo(() => {
    let source = searchResults ?? procedures;
    if (specialty) source = source.filter((p) => p.specialty === specialty);
    if (showOnlyFavorites) source = source.filter((p) => favorites.includes(p.id));
    if (favoritesFirst) {
      const favs = source.filter((p) => favorites.includes(p.id));
      const rest = source.filter((p) => !favorites.includes(p.id));
      return [...favs, ...rest];
    }
    return source;
  }, [searchResults, procedures, specialty, showOnlyFavorites, favoritesFirst, favorites]);

  const favProcedures = useMemo(
    () => favorites.map((id) => procedures.find((p) => p.id === id)).filter(Boolean) as Procedure[],
    [favorites, procedures]
  );

  const recentProcedures = useMemo(
    () => recents.map((id) => procedures.find((p) => p.id === id)).filter(Boolean) as Procedure[],
    [recents, procedures]
  );

  const handleClearSearch = () => {
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredResults.length > 0) {
      navigate(`/p/${filteredResults[0].id}`);
    }
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickAccess = (item: typeof QUICK_ACCESS_ITEMS[0]) => {
    if (item.to === '/') {
      // 1st button: scroll to procedures, clear search
      setSearchQuery('');
      setSpecialty(null);
      setShowOnlyFavorites(false);
      scrollTo(proceduresRef);
    } else {
      navigate(item.to);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  const searchInput = (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        placeholder={t('search_placeholder')}
        className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-10 text-base text-foreground placeholder:text-muted-foreground clinical-shadow focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
      />
      {searchQuery && (
        <button
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Floating search bar */}
      {showFloatingSearch && (
        <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b px-4 py-2 clinical-shadow">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={t('search_placeholder')}
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">
          <span className="text-accent">Anes</span>
          <span className="text-foreground">IA</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-8">{t('tagline')}</p>

        <div ref={heroSearchRef} className="w-full max-w-lg mb-6">
          {searchInput}
        </div>

        <div ref={specialtyRef} className="w-full max-w-lg mb-8">
          <SpecialtyFilter specialties={specialties} selected={specialty} onSelect={setSpecialty} />
        </div>

        <div className="w-full max-w-lg">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t('quick_access')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_ACCESS_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleQuickAccess(item)}
                aria-label={t(item.key)}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 clinical-shadow hover:clinical-shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <item.icon className="h-6 w-6 text-accent" />
                <span className="text-xs font-medium text-foreground text-center">{t(item.key)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="container py-6 space-y-6">
        {/* Stats — clickable */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => scrollTo(proceduresRef)}
            className="rounded-lg border bg-card p-4 clinical-shadow hover:clinical-shadow-md transition-shadow cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 text-accent">
              <Activity className="h-5 w-5" />
              <span className="text-2xl font-bold">{procedures.length}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('all_procedures')}</p>
          </button>
          <button
            onClick={() => scrollTo(specialtyRef)}
            className="rounded-lg border bg-card p-4 clinical-shadow hover:clinical-shadow-md transition-shadow cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 text-accent">
              <Stethoscope className="h-5 w-5" />
              <span className="text-2xl font-bold">{specialties.length}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('all_specialties')}</p>
          </button>
          <button
            onClick={() => scrollTo(favoritesRef)}
            className="rounded-lg border bg-card p-4 clinical-shadow hover:clinical-shadow-md transition-shadow cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 text-accent">
              <Star className="h-5 w-5" />
              <span className="text-2xl font-bold">{favorites.length}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {favorites.length === 0 ? t('no_favorites_hint') : t('favorites')}
            </p>
          </button>
        </div>

        {/* Favorites section — always visible */}
        <div ref={favoritesRef}>
          <section>
            <h2 className="mb-3 text-base font-bold text-foreground">{t('favorites')}</h2>
            {favProcedures.length > 0 ? (
              <div className="space-y-2">
                {favProcedures.map((p) => (
                  <ProcedureCard key={p.id} procedure={p} isFavorite onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-6 text-center clinical-shadow">
                <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">{t('no_favorites_empty')}</p>
                <button
                  onClick={() => scrollTo(proceduresRef)}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {t('view_all_procedures')}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Recents */}
        {recentProcedures.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">{t('recents')}</h2>
              <button
                onClick={() => setRecents([])}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('clear_recents')}
              </button>
            </div>
            <div className="space-y-2">
              {recentProcedures.map((p) => (
                <ProcedureCard
                  key={p.id}
                  procedure={p}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* All procedures / search results */}
        <div ref={proceduresRef}>
          <section>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-base font-bold text-foreground">
                {searchQuery ? t('results') : t('all_procedures')}
              </h2>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${showOnlyFavorites ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
                >
                  {t('only_favorites')}
                </button>
                <button
                  onClick={() => setFavoritesFirst(!favoritesFirst)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${favoritesFirst ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
                >
                  {t('favorites_first')}
                </button>
              </div>
            </div>
            {filteredResults.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">{t('no_results')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredResults.map((p) => (
                  <ProcedureCard
                    key={p.id}
                    procedure={p}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
