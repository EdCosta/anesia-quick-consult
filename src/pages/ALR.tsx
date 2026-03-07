import { useEffect, useMemo, useState } from 'react';
import { Target, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Fuse from 'fuse.js';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useContentLimits } from '@/hooks/useContentLimits';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { ALRBlock } from '@/lib/types';
import StructuredContentList from '@/components/anesia/StructuredContentList';
import { trackEvent } from '@/lib/analytics';
import { buildPathWithSource } from '@/lib/checkoutAttribution';

const REGION_MAP: Record<string, string> = {
  upper_limb: 'upper_limb',
  lower_limb: 'lower_limb',
  trunk: 'trunk',
  head_neck: 'head_neck',
};

// Left-border + tab accent color per region
const REGION_COLOR: Record<string, string> = {
  upper_limb: 'border-l-clinical-info',
  lower_limb: 'border-l-clinical-success',
  trunk: 'border-l-clinical-warning',
  head_neck: 'border-l-accent',
};

const REGION_DOT: Record<string, string> = {
  upper_limb: 'bg-clinical-info',
  lower_limb: 'bg-clinical-success',
  trunk: 'bg-clinical-warning',
  head_neck: 'bg-accent',
};

type TabKey = 'indications' | 'contraindications' | 'technique' | 'drugs';

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'indications', labelKey: 'indications' },
  { key: 'contraindications', labelKey: 'contraindications_alr' },
  { key: 'technique', labelKey: 'technique' },
  { key: 'drugs', labelKey: 'drugs_alr' },
];

const TAB_TONE: Record<TabKey, 'success' | 'danger' | 'warning' | 'info'> = {
  indications: 'success',
  contraindications: 'danger',
  technique: 'warning',
  drugs: 'info',
};

export default function ALR() {
  const { t, lang, resolveStr, resolve } = useLang();
  const { alrBlocks, loading } = useData();
  const { alr: alrLimit, isLimited } = useContentLimits();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, TabKey>>({});
  usePageMeta({
    title: `${t('alr_full')} | AnesIA`,
    description:
      lang === 'fr'
        ? 'Blocs ALR, indications, contre-indications et techniques.'
        : lang === 'pt'
          ? 'Bloqueios ALR, indicacoes, contraindicacoes e tecnicas.'
          : 'Regional anesthesia blocks, indications, contraindications, and technique.',
  });

  const fuse = useMemo(
    () =>
      new Fuse(alrBlocks, {
        keys: [`titles.${lang}`, 'titles.fr', 'region'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [alrBlocks, lang],
  );

  const regions = useMemo(() => {
    const set = new Set(alrBlocks.map((b) => b.region));
    return Array.from(set).sort();
  }, [alrBlocks]);

  const filtered = useMemo(() => {
    let results: ALRBlock[] = search.trim() ? fuse.search(search).map((r) => r.item) : alrBlocks;
    if (region) results = results.filter((b) => b.region === region);
    return results;
  }, [search, region, fuse, alrBlocks]);

  const getTabForBlock = (id: string): TabKey => activeTab[id] ?? 'indications';

  const handleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  const visible = isLimited ? filtered.slice(0, alrLimit) : filtered;
  const hiddenCount = isLimited ? Math.max(filtered.length - visible.length, 0) : 0;

  useEffect(() => {
    if (!isLimited || hiddenCount <= 0) return;
    trackEvent('pro_preview_view', { surface: 'alr', hiddenCount });
  }, [hiddenCount, isLimited]);

  return (
    <div className="container py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-accent shrink-0" />
        <h1 className="text-xl font-bold text-foreground">{t('alr_full')}</h1>
      </div>

      {isLimited && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 clinical-shadow">
          <p className="text-sm font-semibold text-foreground">{t('pro_feature')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === 'fr'
              ? 'Vous voyez un extrait ALR. Passez a Pro pour tous les blocs, techniques et details.'
              : lang === 'pt'
                ? 'Estas a ver uma amostra de ALR. Passa para Pro para ter todos os bloqueios, tecnicas e detalhes.'
                : 'You are seeing an ALR preview. Upgrade to Pro for all blocks, techniques, and details.'}
          </p>
          <Link
            to={buildPathWithSource('/account', 'alr')}
            onClick={() => {
              trackEvent('alr_upgrade_click', { hiddenCount });
              trackEvent('pro_upgrade_click', { surface: 'alr', hiddenCount });
            }}
            className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('upgrade_pro')}
          </Link>
        </div>
      )}

      {/* Search + region filters on the same row (or stacked on mobile) */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_alr')}
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => setRegion(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${!region ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
          >
            {t('all_regions')}
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r === region ? null : r)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-colors ${r === region ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${REGION_DOT[r] ?? 'bg-muted-foreground'}`} />
              {REGION_MAP[r] ? t(REGION_MAP[r]) : r}
            </button>
          ))}
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('no_results')}</p>
        ) : (
          <>
            {visible.map((block) => {
              const isOpen = expanded === block.id;
              const indications = resolve<string[]>(block.indications) ?? [];
              const borderColor = REGION_COLOR[block.region] ?? 'border-l-muted';
              const currentTab = getTabForBlock(block.id);

              return (
                <div
                  key={block.id}
                  className={`rounded-xl border border-l-4 bg-card overflow-hidden transition-shadow ${borderColor} ${isOpen ? 'clinical-shadow' : ''}`}
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() => handleExpand(block.id)}
                    className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="text-sm font-semibold text-card-foreground leading-tight">
                        {resolveStr(block.titles)}
                      </h3>
                      {/* Preview: first 2 indications when collapsed */}
                      {!isOpen && indications.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {indications.slice(0, 2).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <span className="text-[11px] text-muted-foreground hidden sm:block">
                        {REGION_MAP[block.region] ? t(REGION_MAP[block.region]) : block.region}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded: tabs + content */}
                  {isOpen && (
                    <div className="border-t">
                      {/* Tab bar */}
                      <div className="flex border-b overflow-x-auto scrollbar-none">
                        {TABS.map(({ key, labelKey }) => {
                          const items = resolve<string[]>(
                            key === 'indications'
                              ? block.indications
                              : key === 'contraindications'
                                ? block.contraindications
                                : key === 'technique'
                                  ? block.technique
                                  : block.drugs,
                          ) ?? [];
                          if (items.length === 0) return null;
                          const isActive = currentTab === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setActiveTab((prev) => ({ ...prev, [block.id]: key }))}
                              className={`flex-1 min-w-0 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                                isActive
                                  ? 'border-accent text-accent'
                                  : 'border-transparent text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <span>{t(labelKey)}</span>
                                <span
                                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                    isActive
                                      ? 'bg-accent/10 text-accent'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {items.length}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Tab content */}
                      <div className="px-4 py-3">
                        {TABS.map(({ key }) => {
                          if (currentTab !== key) return null;
                          const items = resolve<string[]>(
                            key === 'indications'
                              ? block.indications
                              : key === 'contraindications'
                                ? block.contraindications
                                : key === 'technique'
                                  ? block.technique
                                  : block.drugs,
                          ) ?? [];
                          if (items.length === 0) return (
                            <p key={key} className="text-xs text-muted-foreground italic">—</p>
                          );
                          return <StructuredContentList key={key} items={items} tone={TAB_TONE[key]} />;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {hiddenCount > 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card/70 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {lang === 'fr'
                    ? `${hiddenCount} bloc(s) supplementaire(s) en Pro`
                    : lang === 'pt'
                      ? `${hiddenCount} bloqueio(s) adicionais em Pro`
                      : `${hiddenCount} more block(s) in Pro`}
                </p>
                <p className="mt-1">{t('upgrade_to_unlock')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
