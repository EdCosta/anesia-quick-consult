import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Activity, Stethoscope, BookOpen } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData, Procedure } from '@/contexts/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import SpecialtyFilter from '@/components/anesia/SpecialtyFilter';
import ProcedureCard from '@/components/anesia/ProcedureCard';
import { useState } from 'react';

interface IndexProps {
  searchQuery: string;
}

export default function Index({ searchQuery }: IndexProps) {
  const { t, lang } = useLang();
  const { procedures, specialties, loading } = useData();

  const [specialty, setSpecialty] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('anesia-favorites', []);
  const [recents] = useLocalStorage<string[]>('anesia-recents', []);

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
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return fuse.search(searchQuery).map(r => r.item);
  }, [searchQuery, fuse]);

  const filteredResults = useMemo(() => {
    const source = searchResults ?? procedures;
    if (!specialty) return source;
    return source.filter(p => p.specialty === specialty);
  }, [searchResults, procedures, specialty]);

  const favProcedures = useMemo(
    () => favorites.map(id => procedures.find(p => p.id === id)).filter(Boolean) as Procedure[],
    [favorites, procedures]
  );

  const recentProcedures = useMemo(
    () => recents.map(id => procedures.find(p => p.id === id)).filter(Boolean) as Procedure[],
    [recents, procedures]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4 clinical-shadow">
          <div className="flex items-center gap-2 text-accent">
            <Activity className="h-5 w-5" />
            <span className="text-2xl font-bold">{procedures.length}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('all_procedures')}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 clinical-shadow">
          <div className="flex items-center gap-2 text-accent">
            <Stethoscope className="h-5 w-5" />
            <span className="text-2xl font-bold">{specialties.length}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('all_specialties')}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 clinical-shadow hidden sm:block">
          <div className="flex items-center gap-2 text-accent">
            <BookOpen className="h-5 w-5" />
            <span className="text-2xl font-bold">{favorites.length}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('favorites')}</p>
        </div>
      </div>

      <SpecialtyFilter specialties={specialties} selected={specialty} onSelect={setSpecialty} />

      {/* Favorites & Recents side by side */}
      {!searchQuery && (favProcedures.length > 0 || recentProcedures.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favProcedures.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">{t('favorites')}</h2>
              <div className="space-y-2">
                {favProcedures.map(p => (
                  <ProcedureCard key={p.id} procedure={p} isFavorite onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          )}
          {recentProcedures.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">{t('recents')}</h2>
              <div className="space-y-2">
                {recentProcedures.map(p => (
                  <ProcedureCard key={p.id} procedure={p} isFavorite={favorites.includes(p.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Results */}
      <section>
        <h2 className="mb-3 text-base font-bold text-foreground">
          {searchQuery ? t('results') : t('all_procedures')}
        </h2>
        {filteredResults.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('no_results')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredResults.map(p => (
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
  );
}
