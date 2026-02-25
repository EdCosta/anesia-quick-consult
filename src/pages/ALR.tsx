import { useMemo, useState } from 'react';
import { Target, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Fuse from 'fuse.js';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import type { ALRBlock } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const REGION_MAP: Record<string, string> = {
  upper_limb: 'upper_limb',
  lower_limb: 'lower_limb',
  trunk: 'trunk',
  head_neck: 'head_neck',
};

export default function ALR() {
  const { t, lang, resolveStr } = useLang();
  const { alrBlocks, loading } = useData();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(alrBlocks, {
        keys: [`titles.${lang}`, 'titles.fr', 'region'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [alrBlocks, lang]
  );

  const regions = useMemo(() => {
    const set = new Set(alrBlocks.map((b) => b.region));
    return Array.from(set).sort();
  }, [alrBlocks]);

  const filtered = useMemo(() => {
    let results: ALRBlock[] = search.trim()
      ? fuse.search(search).map((r) => r.item)
      : alrBlocks;
    if (region) results = results.filter((b) => b.region === region);
    return results;
  }, [search, region, fuse, alrBlocks]);

  const resolve = (obj: Partial<Record<string, string[]>> | undefined): string[] => {
    if (!obj) return [];
    return (obj as any)[lang] ?? (obj as any)['fr'] ?? (obj as any)['en'] ?? [];
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="h-6 w-6 text-accent" />
          {t('alr_full')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('alr')}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_alr')}
          className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      {/* Region chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setRegion(null)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!region ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
        >
          {t('all_regions')}
        </button>
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r === region ? null : r)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${r === region ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
          >
            {REGION_MAP[r] ? t(REGION_MAP[r]) : r}
          </button>
        ))}
      </div>

      {/* ALR blocks list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('no_results')}</p>
        ) : (
          filtered.map((block) => {
            const isOpen = expanded === block.id;
            return (
              <div key={block.id} className="rounded-xl border bg-card clinical-shadow overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : block.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {resolveStr(block.titles)}
                    </h3>
                    <Badge variant="secondary" className="mt-1 text-[11px]">
                      {REGION_MAP[block.region] ? t(REGION_MAP[block.region]) : block.region}
                    </Badge>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t pt-3 space-y-4">
                    <ALRSection title={t('indications')} items={resolve(block.indications)} />
                    <ALRSection title={t('contraindications_alr')} items={resolve(block.contraindications)} variant="danger" />
                    <ALRSection title={t('technique')} items={resolve(block.technique)} />
                    <ALRSection title={t('drugs_alr')} items={resolve(block.drugs)} variant="info" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ALRSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: 'danger' | 'info';
}) {
  if (items.length === 0) return null;
  const bulletColor =
    variant === 'danger' ? 'text-clinical-danger' : variant === 'info' ? 'text-clinical-info' : 'text-accent';
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-1">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-card-foreground flex gap-2">
            <span className={`${bulletColor} mt-0.5`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
