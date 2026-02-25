import { useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import {
  Activity,
  Stethoscope,
  BookOpen,
  Search,
  X,
  Target,
  Calculator,
} from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import type { Procedure } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import SpecialtyFilter from '@/components/anesia/SpecialtyFilter';
import ProcedureCard from '@/components/anesia/ProcedureCard';

const QUICK_ACCESS = [
  { key: 'procedures_title', to: '/', icon: Activity, color: 'text-accent' },
  {
    key: 'calculateurs',
    to: '/calculateurs',
    icon: Calculator,
    color: 'text-clinical-info',
  },
  {
    key: 'guidelines',
    to: '/guidelines',
    icon: BookOpen,
    color: 'text-clinical-warning',
  },
  {
    key: 'alr',
    to: '/alr',
    icon: Target,
    color: 'text-clinical-danger',
  },
];

export default function Index() {
  const { t, lang } = useLang();
  const { procedures, specialties, loading } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    'anesia-favorites',
    []
  );
  const [recents] = useLocalStorage<string[]>('anesia-recents', []);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const source = searchResults ?? procedures;
    if (!specialty) return source;
    return source.filter((p) => p.specialty === specialty);
  }, [searchResults, procedures, specialty]);

  const favProcedures = useMemo(
    () =>
      favorites
        .map((id) => procedures.find((p) => p.id === id))
        .filter(Boolean) as Procedure[],
    [favorites, procedures]
  );

  const recentProcedures = useMemo(
    () =>
      recents
        .map((id) => procedures.find((p) => p.id === id))
        .filter(Boolean) as Procedure[],
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero section — always visible */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">
          <span className="text-accent">Anes</span>
          <span className="text-foreground">IA</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-8">{t('tagline')}</p>

        <div className="w-full max-w-lg mb-6">
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
        </div>

        <div className="w-full max-w-lg mb-8">
          <SpecialtyFilter
            specialties={specialties}
            selected={specialty}
            onSelect={setSpecialty}
          />
        </div>

        <div className="w-full max-w-lg">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            {t('quick_access')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACCESS.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 clinical-shadow hover:clinical-shadow-md transition-shadow"
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
                <span className="text-xs font-medium text-foreground">
                  {t(item.key)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard content — always visible, natural scroll */}
      <div className="container py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border bg-card p-4 clinical-shadow">
            <div className="flex items-center gap-2 text-accent">
              <Activity className="h-5 w-5" />
              <span className="text-2xl font-bold">{procedures.length}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('all_procedures')}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 clinical-shadow">
            <div className="flex items-center gap-2 text-accent">
              <Stethoscope className="h-5 w-5" />
              <span className="text-2xl font-bold">{specialties.length}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('all_specialties')}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 clinical-shadow hidden sm:block">
            <div className="flex items-center gap-2 text-accent">
              <BookOpen className="h-5 w-5" />
              <span className="text-2xl font-bold">{favorites.length}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('favorites')}
            </p>
          </div>
        </div>

        {/* Favorites & Recents */}
        {(favProcedures.length > 0 || recentProcedures.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favProcedures.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-bold text-foreground">
                  {t('favorites')}
                </h2>
                <div className="space-y-2">
                  {favProcedures.map((p) => (
                    <ProcedureCard
                      key={p.id}
                      procedure={p}
                      isFavorite
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}
            {recentProcedures.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-bold text-foreground">
                  {t('recents')}
                </h2>
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
          </div>
        )}

        {/* All procedures / search results */}
        <section>
          <h2 className="mb-3 text-base font-bold text-foreground">
            {searchQuery ? t('results') : t('all_procedures')}
          </h2>
          {filteredResults.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t('no_results')}
            </p>
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
  );
}
