import { useMemo, useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Fuse from 'fuse.js';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useViewMode } from '@/hooks/useViewMode';
import type { Guideline } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import ProFeaturePage from '@/components/anesia/ProFeaturePage';

const CATEGORY_MAP: Record<string, string> = {
  airway: 'airway_cat',
  hemodynamics: 'hemodynamics',
  temperature: 'temperature_cat',
  pain: 'pain',
  ponv: 'ponv',
  fluid: 'fluid',
  safety: 'safety',
};

export default function Guidelines() {
  const { t, lang, resolveStr, resolve } = useLang();
  const { guidelines, loading } = useData();
  const { isProView } = useViewMode();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(guidelines, {
        keys: [`titles.${lang}`, 'titles.fr', 'category', 'source', 'version', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [guidelines, lang],
  );

  const categories = useMemo(() => {
    const set = new Set(guidelines.map((g) => g.category));
    return Array.from(set).sort();
  }, [guidelines]);

  const filtered = useMemo(() => {
    let results: Guideline[] = search.trim() ? fuse.search(search).map((r) => r.item) : guidelines;
    if (category) results = results.filter((g) => g.category === category);
    return results;
  }, [search, category, fuse, guidelines]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!isProView) {
    return <ProFeaturePage title={t('guidelines')} description={t('guidelines_desc')} />;
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" />
          {t('guidelines')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('guidelines_desc')}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_guidelines')}
          className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!category ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
        >
          {t('all_categories')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === category ? null : cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${cat === category ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
          >
            {CATEGORY_MAP[cat] ? t(CATEGORY_MAP[cat]) : cat}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 items-start">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8 md:col-span-2">
            {t('no_results')}
          </p>
        ) : (
          <>
            {filtered.map((g) => {
              const isOpen = expanded === g.id;
              const items = resolve<string[]>(g.items) ?? [];
              return (
                <div
                  key={g.id}
                  className={`rounded-xl border bg-card clinical-shadow overflow-hidden ${isOpen ? 'md:col-span-2' : ''}`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : g.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">
                        {resolveStr(g.titles)}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[11px]">
                          {CATEGORY_MAP[g.category] ? t(CATEGORY_MAP[g.category]) : g.category}
                        </Badge>
                        {g.source && (
                          <Badge variant="outline" className="text-[11px]">
                            {g.source}
                          </Badge>
                        )}
                        {g.version && (
                          <Badge variant="outline" className="text-[11px]">
                            v{g.version}
                          </Badge>
                        )}
                        {g.evidence_grade && (
                          <Badge variant="outline" className="text-[11px]">
                            E{g.evidence_grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t pt-3 space-y-3">
                      <ul className="space-y-1.5">
                        {items.map((item, i) => (
                          <li key={i} className="text-xs text-card-foreground flex gap-2">
                            <span className="text-accent mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {g.references.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                            {t('references_label')}
                          </p>
                          {g.references.map((ref, i) => (
                            <p key={i} className="text-[11px] text-muted-foreground">
                              {ref.source}
                              {ref.year && ` (${ref.year})`}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
