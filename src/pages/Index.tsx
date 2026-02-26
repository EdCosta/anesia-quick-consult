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
  Zap,
  Calculator,
  Eraser,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import type { Procedure } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSpecialtyUsage } from '@/hooks/useSpecialtyUsage';
import SpecialtyChips from '@/components/anesia/SpecialtyChips';
import ProcedureCard from '@/components/anesia/ProcedureCard';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export default function Index() {
  const { t, lang, resolveStr } = useLang();
  const { procedures, specialtiesData, loading } = useData();
  const navigate = useNavigate();
  const { increment: incrementSpecialty, getSorted: getSortedSpecialties } = useSpecialtyUsage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [favorites, setFavorites] = useLocalStorage<string[]>('anesia-favorites', []);
  const [recents, setRecents] = useLocalStorage<string[]>('anesia-recents', []);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favoritesFirst, setFavoritesFirst] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [favsExpanded, setFavsExpanded] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const proceduresRef = useRef<HTMLDivElement>(null);
  const recentsRef = useRef<HTMLDivElement>(null);

  const isSearching = searchQuery.trim().length > 0;

  // Use specialtiesData from DB as primary source, sorted by usage then sort_base
  const sortedSpecialties = useMemo(() => {
    const dbIds = specialtiesData.map((s) => s.id);
    if (dbIds.length > 0) {
      return getSortedSpecialties(dbIds);
    }
    // Fallback: derive from procedures
    const set = new Set(procedures.map((p) => p.specialty));
    return getSortedSpecialties(Array.from(set));
  }, [specialtiesData, procedures, getSortedSpecialties]);

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

  const handleSelectSpecialties = (specs: string[]) => {
    setSelectedSpecialties(specs);
    specs.forEach((s) => incrementSpecialty(s));
  };

  const handleProcedureClick = (proc: Procedure) => {
    incrementSpecialty(proc.specialty);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return fuse.search(searchQuery).map((r) => r.item);
  }, [searchQuery, fuse]);

  const filteredResults = useMemo(() => {
    let source = searchResults ?? procedures;
    if (selectedSpecialties.length > 0) source = source.filter((p) => selectedSpecialties.includes(p.specialty));
    if (showOnlyFavorites) source = source.filter((p) => favorites.includes(p.id));
    if (favoritesFirst) {
      const favs = source.filter((p) => favorites.includes(p.id));
      const rest = source.filter((p) => !favorites.includes(p.id));
      return [...favs, ...rest];
    }
    return source;
  }, [searchResults, procedures, selectedSpecialties, showOnlyFavorites, favoritesFirst, favorites]);

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
      handleProcedureClick(filteredResults[0]);
      navigate(`/p/${filteredResults[0].id}`);
    }
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearAll = () => {
    setSearchQuery('');
    setSelectedSpecialties([]);
    setShowOnlyFavorites(false);
    setFavoritesFirst(false);
    setFabOpen(false);
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

  const FAVS_COLLAPSED_COUNT = 3;
  const showFavsToggle = favProcedures.length > FAVS_COLLAPSED_COUNT;
  const visibleFavs = favsExpanded ? favProcedures : favProcedures.slice(0, FAVS_COLLAPSED_COUNT);

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
      <div className="flex flex-col items-center justify-center pt-8 pb-4 px-4 bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-4xl sm:text-5xl font-bold mb-1">
          <span className="text-accent">Anes</span>
          <span className="text-foreground">IA</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-5">{t('tagline')}</p>

        <div ref={heroSearchRef} className="w-full max-w-lg mb-3">
          {searchInput}
        </div>

        {/* Smart specialty chips */}
        <div className="w-full max-w-lg mb-2">
          <SpecialtyChips
            specialties={sortedSpecialties}
            selected={selectedSpecialties}
            onSelect={handleSelectSpecialties}
          />
        </div>

        {/* Inline search results when searching */}
        {isSearching && (
          <div className="w-full max-w-lg mt-3">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">{t('results')}</h2>
            {filteredResults.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">{t('no_results')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredResults.map((p) => (
                  <div key={p.id} onClick={() => handleProcedureClick(p)}>
                    <ProcedureCard
                      procedure={p}
                      isFavorite={favorites.includes(p.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard content — hidden when searching */}
      {!isSearching && (
        <div className="container py-4 space-y-5">
          {/* Favorites — compact & collapsible */}
          {favProcedures.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-foreground">{t('favorites')}</h2>
                {showFavsToggle && (
                  <button
                    onClick={() => setFavsExpanded(!favsExpanded)}
                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    {favsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {favsExpanded ? t('close') : `${t('view_all_procedures')} (${favProcedures.length})`}
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {visibleFavs.map((p) => (
                  <div key={p.id} onClick={() => handleProcedureClick(p)}>
                    <ProcedureCard procedure={p} isFavorite onToggleFavorite={toggleFavorite} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recents — horizontal scroll */}
          {recentProcedures.length > 0 && (
            <section ref={recentsRef}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-foreground">{t('recents')}</h2>
                <button
                  onClick={() => setRecents([])}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title={t('clear_recents')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-2 snap-x scrollbar-none">
                {recentProcedures.map((p) => (
                  <Link
                    key={p.id}
                    to={`/p/${p.id}`}
                    onClick={() => handleProcedureClick(p)}
                    className="snap-start shrink-0 w-40 rounded-lg border bg-card p-3 clinical-shadow hover:clinical-shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <p className="text-xs font-semibold text-card-foreground leading-tight line-clamp-2">
                      {resolveStr(p.titles)}
                    </p>
                    <Badge variant="secondary" className="mt-1.5 text-[10px]">{p.specialty}</Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All procedures */}
          <div ref={proceduresRef}>
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h2 className="text-sm font-bold text-foreground">{t('all_procedures')}</h2>
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
                    <div key={p.id} onClick={() => handleProcedureClick(p)}>
                      <ProcedureCard
                        procedure={p}
                        isFavorite={favorites.includes(p.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* FAB — Quick Access */}
      <div className="fixed bottom-6 right-6 z-40">
        <Popover open={fabOpen} onOpenChange={setFabOpen}>
          <PopoverTrigger asChild>
            <button
              className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95"
              aria-label={t('quick_access')}
            >
              <Zap className="h-6 w-6" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-52 p-2">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { setShowOnlyFavorites(prev => !prev); scrollTo(proceduresRef); setFabOpen(false); }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <Star className="h-4 w-4 text-accent" />
                {t('only_favorites')}
              </button>
              <button
                onClick={() => { scrollTo(recentsRef); setFabOpen(false); }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <Clock className="h-4 w-4 text-accent" />
                {t('recents')}
              </button>
              <button
                onClick={() => { navigate('/calculateurs'); setFabOpen(false); }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <Calculator className="h-4 w-4 text-accent" />
                {t('ett_calculator')}
              </button>
              <button
                onClick={() => { navigate('/preanest'); setFabOpen(false); }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <Stethoscope className="h-4 w-4 text-accent" />
                {t('preanest')}
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <Eraser className="h-4 w-4 text-accent" />
                {t('clear_filters')}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
