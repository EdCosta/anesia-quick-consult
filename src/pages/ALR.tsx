import { useMemo, useState } from 'react';
import { Target, Search, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import Fuse from 'fuse.js';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useContentLimits } from '@/hooks/useContentLimits';
import { useEntitlements } from '@/hooks/useEntitlements';
import type { ALRBlock } from '@/lib/types';
import ProFeaturePage from '@/components/anesia/ProFeaturePage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

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

const TABS: { key: TabKey; labelKey: string; bulletClass: string }[] = [
  { key: 'indications', labelKey: 'indications', bulletClass: 'text-accent' },
  { key: 'contraindications', labelKey: 'contraindications_alr', bulletClass: 'text-clinical-danger' },
  { key: 'technique', labelKey: 'technique', bulletClass: 'text-accent' },
  { key: 'drugs', labelKey: 'drugs_alr', bulletClass: 'text-clinical-info' },
];

export default function ALR() {
  const { t, lang, resolveStr } = useLang();
  const { alrBlocks, loading } = useData();
  const { isPro, loading: entitlementLoading } = useEntitlements();
  const { alr: alrLimit, isLimited } = useContentLimits();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, TabKey>>({});
  const [showProModal, setShowProModal] = useState(false);

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

  const visibleItems = isLimited ? filtered.slice(0, alrLimit) : filtered;
  const lockedCount = isLimited ? Math.max(0, filtered.length - alrLimit) : 0;

  const resolve = (obj: Partial<Record<string, string[]>> | undefined): string[] => {
    if (!obj) return [];
    return (obj as any)[lang] ?? (obj as any)['fr'] ?? (obj as any)['en'] ?? [];
  };

  const getTabForBlock = (id: string): TabKey => activeTab[id] ?? 'indications';

  const handleExpand = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      // Default to indications tab, preserve if already set
      if (!activeTab[id]) {
        setActiveTab((prev) => ({ ...prev, [id]: 'indications' }));
      }
    }
  };

  if (loading || entitlementLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!isPro) {
    return <ProFeaturePage title={t('alr_full')} description={t('pro_feature_desc')} />;
  }

  return (
    <div className="container py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-accent shrink-0" />
        <h1 className="text-xl font-bold text-foreground">{t('alr_full')}</h1>
      </div>

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
            {visibleItems.map((block) => {
              const isOpen = expanded === block.id;
              const indications = resolve(block.indications);
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
                          const items = resolve(
                            key === 'indications'
                              ? block.indications
                              : key === 'contraindications'
                                ? block.contraindications
                                : key === 'technique'
                                  ? block.technique
                                  : block.drugs,
                          );
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
                              {t(labelKey)}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tab content */}
                      <div className="px-4 py-3">
                        {TABS.map(({ key, bulletClass }) => {
                          if (currentTab !== key) return null;
                          const items = resolve(
                            key === 'indications'
                              ? block.indications
                              : key === 'contraindications'
                                ? block.contraindications
                                : key === 'technique'
                                  ? block.technique
                                  : block.drugs,
                          );
                          if (items.length === 0) return (
                            <p key={key} className="text-xs text-muted-foreground italic">—</p>
                          );
                          return (
                            <ul key={key} className="space-y-1.5">
                              {items.map((item, i) => (
                                <li key={i} className="text-xs text-card-foreground flex gap-2">
                                  <span className={`${bulletClass} mt-0.5 shrink-0`}>•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {lockedCount > 0 && (
              <button
                onClick={() => setShowProModal(true)}
                className="w-full rounded-xl border-2 border-dashed border-muted p-5 text-center hover:bg-muted/10 transition-colors"
              >
                <Lock className="h-5 w-5 mx-auto text-muted-foreground mb-1.5" />
                <p className="text-sm font-medium text-foreground">
                  {lockedCount} {t('content_locked')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('upgrade_to_unlock')}</p>
              </button>
            )}
          </>
        )}
      </div>

      <Dialog open={showProModal} onOpenChange={setShowProModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              {t('pro_feature')}
            </DialogTitle>
            <DialogDescription>{t('pro_feature_desc')}</DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setShowProModal(false);
              navigate('/account');
            }}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('upgrade_pro')}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
