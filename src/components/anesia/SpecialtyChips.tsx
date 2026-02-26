import { useState, useMemo } from 'react';
import { Plus, Search, X, ChevronUp } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';

interface SpecialtyChipsProps {
  specialties: string[];
  selected: string | null;
  onSelect: (s: string | null) => void;
  maxVisible?: number;
}

export default function SpecialtyChips({
  specialties,
  selected,
  onSelect,
  maxVisible = 8,
}: SpecialtyChipsProps) {
  const { t, lang } = useLang();
  const { specialtiesData } = useData();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  // Map specialty slug -> multilingual name
  const getDisplayName = (slug: string) => {
    const spec = specialtiesData.find((s) => s.id === slug);
    if (spec && spec.name) {
      return spec.name[lang] || spec.name['fr'] || slug;
    }
    return slug;
  };

  const visible = specialties.slice(0, maxVisible);
  const hasMore = specialties.length > maxVisible;

  const filteredAll = useMemo(() => {
    if (!search.trim()) return specialties;
    const q = search.toLowerCase();
    return specialties.filter((s) => s.toLowerCase().includes(q));
  }, [specialties, search]);

  const chipClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    }`;

  const handleSelectFromPanel = (s: string) => {
    onSelect(s === selected ? null : s);
  };

  return (
    <div className="space-y-2">
      {/* Compact chip grid (wrap, no horizontal scroll) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* "All" chip */}
        <button onClick={() => onSelect(null)} className={chipClass(selected === null)}>
          {t('all_specialties')}
        </button>

        {/* Top N chips */}
        {visible.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s === selected ? null : s)}
            className={chipClass(selected === s)}
          >
            {getDisplayName(s)}
          </button>
        ))}

        {/* "+" button */}
        {hasMore && (
          <button
            onClick={() => { setExpanded(!expanded); if (expanded) setSearch(''); }}
            className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors ${
              expanded
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            aria-label={expanded ? t('close') : t('choose_specialties')}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Inline expandable panel */}
      {expanded && (
        <div className="rounded-lg border bg-card p-3 space-y-2 animate-fade-in">
          {/* Search inside panel */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_specialties')}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Grid of all specialties */}
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {filteredAll.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3 w-full">{t('no_results')}</p>
            ) : (
              filteredAll.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelectFromPanel(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    s === selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {getDisplayName(s)}
                </button>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {selected && (
              <button
                onClick={() => { onSelect(null); }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                {t('clear')}
              </button>
            )}
            <button
              onClick={() => { setExpanded(false); setSearch(''); }}
              className="ml-auto rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
