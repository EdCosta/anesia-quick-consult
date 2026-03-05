import { useMemo, useState } from 'react';
import { ClipboardCheck, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Fuse from 'fuse.js';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useViewMode } from '@/hooks/useViewMode';
import type { Protocole } from '@/lib/types';
import StructuredContentList from '@/components/anesia/StructuredContentList';
import { Badge } from '@/components/ui/badge';
import ProFeaturePage from '@/components/anesia/ProFeaturePage';

const CATEGORY_MAP: Record<string, string> = {
  safety: 'safety',
  emergency: 'emergency',
  preop: 'preop_cat',
  ponv: 'ponv',
};

const CATEGORY_COLOR: Record<string, string> = {
  safety: 'border-l-clinical-info',
  emergency: 'border-l-clinical-danger',
  preop: 'border-l-clinical-warning',
  ponv: 'border-l-clinical-success',
};

const CATEGORY_DOT: Record<string, string> = {
  safety: 'bg-clinical-info',
  emergency: 'bg-clinical-danger',
  preop: 'bg-clinical-warning',
  ponv: 'bg-clinical-success',
};

export default function Protocoles() {
  const { t, lang, resolveStr, resolve } = useLang();
  const { protocoles, loading } = useData();
  const { isProView } = useViewMode();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(protocoles, {
        keys: [`titles.${lang}`, 'titles.fr', 'category', 'source', 'version', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [protocoles, lang],
  );

  const categories = useMemo(() => {
    const set = new Set(protocoles.map((p) => p.category));
    return Array.from(set).sort();
  }, [protocoles]);

  const filtered = useMemo(() => {
    let results: Protocole[] = search.trim() ? fuse.search(search).map((r) => r.item) : protocoles;
    if (category) results = results.filter((p) => p.category === category);
    return results;
  }, [search, category, fuse, protocoles]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!isProView) {
    return <ProFeaturePage title={t('protocoles')} description={t('protocoles_desc')} />;
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-accent" />
          {t('protocoles')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('protocoles_desc')}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_protocoles')}
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
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${cat === category ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${CATEGORY_DOT[cat] ?? 'bg-muted-foreground'}`}
            />
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
            {filtered.map((p) => {
              const isOpen = expanded === p.id;
              const steps = resolve<string[]>(p.steps) ?? [];
              const borderColor = CATEGORY_COLOR[p.category] ?? 'border-l-muted';
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border border-l-4 bg-card clinical-shadow overflow-hidden ${borderColor} ${isOpen ? 'md:col-span-2' : ''}`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">
                        {resolveStr(p.titles)}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[p.category] ?? 'bg-muted-foreground'}`}
                          />
                          {CATEGORY_MAP[p.category] ? t(CATEGORY_MAP[p.category]) : p.category}
                        </span>
                        {p.source && (
                          <Badge variant="outline" className="text-[11px]">
                            {p.source}
                          </Badge>
                        )}
                        {p.version && (
                          <Badge variant="outline" className="text-[11px]">
                            v{p.version}
                          </Badge>
                        )}
                        {p.evidence_grade && (
                          <Badge variant="outline" className="text-[11px]">
                            E{p.evidence_grade}
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
                    <div className="space-y-3 border-t px-4 pb-4 pt-3">
                      <StructuredContentList items={steps} ordered tone="info" />
                      {p.references.length > 0 && (
                        <div className="border-t pt-3">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                            {t('references_label')}
                          </p>
                          <div className="space-y-0.5">
                            {p.references.map((ref, i) => {
                              const meta = [ref.year ? String(ref.year) : null, ref.note, ref.doi, ref.pmid]
                                .filter(Boolean)
                                .join(' • ');

                              return (
                                <p key={i} className="text-[11px] leading-4 text-muted-foreground">
                                  <span className="font-medium text-card-foreground">{ref.source}</span>
                                  {meta && <span>{` — ${meta}`}</span>}
                                </p>
                              );
                            })}
                          </div>
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
