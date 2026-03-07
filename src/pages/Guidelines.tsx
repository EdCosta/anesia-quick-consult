import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import ShareButton from '@/components/anesia/ShareButton';
import { buildPublicGuidelinePath } from '@/lib/contentSeo';
import Fuse from 'fuse.js';
import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useContentLimits } from '@/hooks/useContentLimits';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { Guideline } from '@/lib/types';
import StructuredContentList from '@/components/anesia/StructuredContentList';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/lib/analytics';
import { buildPathWithSource } from '@/lib/checkoutAttribution';

const CATEGORY_MAP: Record<string, string> = {
  airway: 'airway_cat',
  hemodynamics: 'hemodynamics',
  temperature: 'temperature_cat',
  pain: 'pain',
  ponv: 'ponv',
  fluid: 'fluid',
  safety: 'safety',
};

const CATEGORY_COLOR: Record<string, string> = {
  airway: 'border-l-clinical-info',
  hemodynamics: 'border-l-clinical-danger',
  temperature: 'border-l-clinical-warning',
  pain: 'border-l-accent',
  ponv: 'border-l-clinical-success',
  fluid: 'border-l-primary',
  safety: 'border-l-muted-foreground',
};

const CATEGORY_DOT: Record<string, string> = {
  airway: 'bg-clinical-info',
  hemodynamics: 'bg-clinical-danger',
  temperature: 'bg-clinical-warning',
  pain: 'bg-accent',
  ponv: 'bg-clinical-success',
  fluid: 'bg-primary',
  safety: 'bg-muted-foreground',
};

export default function Guidelines() {
  const { t, lang, resolveStr, resolve } = useLang();
  const { guidelines, loading } = useData();
  const { guidelines: guidelineLimit, isLimited } = useContentLimits();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState<string | null>(() => searchParams.get('category'));
  const [expanded, setExpanded] = useState<string | null>(() => searchParams.get('open'));
  usePageMeta({
    title: `${t('guidelines')} | AnesIA`,
    description:
      lang === 'fr'
        ? 'Recommandations et bonnes pratiques en anesthesie.'
        : lang === 'pt'
          ? 'Recomendacoes e boas praticas em anestesia.'
          : 'Anesthesia recommendations and best practices.',
  });

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

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (search.trim()) next.set('search', search);
    else next.delete('search');

    if (category) next.set('category', category);
    else next.delete('category');

    if (expanded) next.set('open', expanded);
    else next.delete('open');

    const current = searchParams.toString();
    const updated = next.toString();
    if (current !== updated) {
      setSearchParams(next, { replace: true });
    }
  }, [category, expanded, search, searchParams, setSearchParams]);

  const antibioprophylaxieLabel = 'Antibioprophylaxie';
  const visible = isLimited ? filtered.slice(0, guidelineLimit) : filtered;
  const hiddenCount = isLimited ? Math.max(filtered.length - visible.length, 0) : 0;

  useEffect(() => {
    if (!isLimited || hiddenCount <= 0) return;
    trackEvent('pro_preview_view', { surface: 'guidelines', hiddenCount });
  }, [hiddenCount, isLimited]);

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
          <BookOpen className="h-6 w-6 text-accent" />
          {t('guidelines')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('guidelines_desc')}</p>
        <Link
          to="/guidelines/antibioprophylaxie"
          className="mt-2 inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/15"
        >
          {antibioprophylaxieLabel}
        </Link>
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
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${cat === category ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${CATEGORY_DOT[cat] ?? 'bg-muted-foreground'}`}
            />
            {CATEGORY_MAP[cat] ? t(CATEGORY_MAP[cat]) : cat}
          </button>
        ))}
      </div>

      {isLimited && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 clinical-shadow">
          <p className="text-sm font-semibold text-foreground">{t('pro_feature')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === 'fr'
              ? 'Vous voyez un extrait des guidelines. Passez a Pro pour toutes les references et la navigation complete.'
              : lang === 'pt'
                ? 'Estas a ver uma amostra das guidelines. Passa para Pro para ter todas as referencias e navegacao completa.'
                : 'You are seeing a preview of the guidelines. Upgrade to Pro for full references and complete navigation.'}
          </p>
          <Link
            to={buildPathWithSource('/account', 'guidelines')}
            onClick={() => {
              trackEvent('guidelines_upgrade_click', { hiddenCount });
              trackEvent('pro_upgrade_click', { surface: 'guidelines', hiddenCount });
            }}
            className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('upgrade_pro')}
          </Link>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 items-start">
        {visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8 md:col-span-2">
            {t('no_results')}
          </p>
        ) : (
          <>
            {visible.map((g) => {
              const isOpen = expanded === g.id;
              const items = resolve<string[]>(g.items) ?? [];
              const borderColor = CATEGORY_COLOR[g.category] ?? 'border-l-muted';
              return (
                <div
                  key={g.id}
                  className={`rounded-xl border border-l-4 bg-card clinical-shadow overflow-hidden ${borderColor} ${isOpen ? 'md:col-span-2' : ''}`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : g.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">
                        {resolveStr(g.titles)}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[g.category] ?? 'bg-muted-foreground'}`}
                          />
                          {CATEGORY_MAP[g.category] ? t(CATEGORY_MAP[g.category]) : g.category}
                        </span>
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
                    <div className="space-y-3 border-t px-4 pb-4 pt-3">
                      <StructuredContentList items={items} tone="accent" />
                      {g.references.length > 0 && (
                        <div className="border-t pt-3">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                            {t('references_label')}
                          </p>
                          <div className="space-y-0.5">
                            {g.references.map((ref, i) => {
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
                      <div className="border-t pt-3 flex justify-end">
                        <ShareButton
                          url={buildPublicGuidelinePath(g.id, resolveStr(g.titles))}
                          title={resolveStr(g.titles)}
                          variant="icon"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {hiddenCount > 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card/70 p-4 text-sm text-muted-foreground md:col-span-2">
                <p className="font-medium text-foreground">
                  {lang === 'fr'
                    ? `${hiddenCount} guideline(s) supplementaire(s) en Pro`
                    : lang === 'pt'
                      ? `${hiddenCount} guideline(s) adicionais em Pro`
                      : `${hiddenCount} more guideline(s) in Pro`}
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
