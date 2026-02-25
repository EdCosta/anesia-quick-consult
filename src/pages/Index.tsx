import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useLang } from '@/contexts/LanguageContext';
import { useData, Procedure } from '@/contexts/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import SearchBar from '@/components/anesia/SearchBar';
import SpecialtyFilter from '@/components/anesia/SpecialtyFilter';
import ProcedureCard from '@/components/anesia/ProcedureCard';
import Disclaimer from '@/components/anesia/Disclaimer';

export default function Index() {
  const { t, lang } = useLang();
  const { procedures, specialties, loading } = useData();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
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
    if (!query.trim()) return null;
    return fuse.search(query).map(r => r.item);
  }, [query, fuse]);

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
    <div className="container max-w-2xl space-y-6 py-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-3xl font-bold text-primary">AnesIA</h1>
        <p className="text-sm text-muted-foreground">{t('disclaimer')}</p>
      </div>

      <SearchBar value={query} onChange={setQuery} />
      <SpecialtyFilter specialties={specialties} selected={specialty} onSelect={setSpecialty} />

      {/* Favorites */}
      {favProcedures.length > 0 && !query && (
        <section>
          <h2 className="mb-3 font-heading text-base font-bold text-foreground">{t('favorites')}</h2>
          <div className="space-y-2">
            {favProcedures.map(p => (
              <ProcedureCard
                key={p.id}
                procedure={p}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recents */}
      {recentProcedures.length > 0 && !query && (
        <section>
          <h2 className="mb-3 font-heading text-base font-bold text-foreground">{t('recents')}</h2>
          <div className="space-y-2">
            {recentProcedures.map(p => (
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

      {/* Results */}
      <section>
        <h2 className="mb-3 font-heading text-base font-bold text-foreground">
          {query ? t('results') : t('all_procedures')}
        </h2>
        {filteredResults.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('no_results')}</p>
        ) : (
          <div className="space-y-2">
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

      <Disclaimer />
    </div>
  );
}
