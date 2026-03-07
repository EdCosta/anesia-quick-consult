import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  ClipboardCopy,
  BookOpen,
  Building2,
  Crown,
  CheckSquare,
  FileText,
  Globe,
  Eye,
  Printer,
  Save,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAutoTranslation } from '@/hooks/useAutoTranslation';
import { useHospitalProfile } from '@/hooks/useHospitalProfile';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useViewMode } from '@/hooks/useViewMode';
import { useRecommendationTags } from '@/hooks/useRecommendationTags';
import { useAIProcedureContext } from '@/contexts/AIProcedureContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import Section, { BulletList } from '@/components/anesia/Section';
import IntubationGuide from '@/components/anesia/IntubationGuide';
import DrugDoseRow from '@/components/anesia/DrugDoseRow';
import PatientAnthropometrics from '@/components/anesia/PatientAnthropometrics';
import ProGate from '@/components/anesia/ProGate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { groupDrugs, GROUP_ORDER, GROUP_I18N_KEYS } from '@/lib/drugGroups';
import {
  prefetchProcedureById,
  readPrefetchedProcedure,
} from '@/data/services/procedurePrefetch';
import { buildPublicProcedurePath } from '@/lib/procedureSeo';
import {
  buildPublicALRPath,
  buildPublicGuidelinePath,
  buildPublicProtocolPath,
} from '@/lib/contentSeo';
import {
  getRelatedALRBlocks,
  getRelatedGuidelines,
  getRelatedProtocols,
} from '@/lib/procedureRelations';
import {
  getHospitalProcedureContext,
  getHospitalProcedureIds,
  isStPierreProcedure,
  resolveHospitalProcedureId,
} from '@/lib/hospitalProfile';
import { getSpecialtyDisplayName } from '@/lib/specialties';
import { trackEvent } from '@/lib/analytics';
import type { PatientWeights } from '@/lib/weightScalars';
import type {
  ALRBlock,
  Drug,
  EvidenceGrade,
  Guideline,
  HospitalProcedureContext,
  Protocole,
  Procedure,
  ProcedureDeep,
  ProcedureQuick,
  SupportedLang,
} from '@/lib/types';

function getGuidelineYear(guideline: Guideline) {
  return Math.max(0, ...guideline.references.map((ref) => ref.year || 0));
}

function getLatestReferenceYear(procedure: Procedure | null) {
  if (!procedure) return null;
  const years = Object.values(procedure.deep).flatMap((content) =>
    content.references.map((reference) => reference.year || 0),
  );
  const latest = Math.max(0, ...years);
  return latest > 0 ? latest : null;
}

function getPrimaryReferenceSource(procedure: Procedure | null) {
  if (!procedure) return null;

  const references = Object.values(procedure.deep).flatMap((content) => content.references);
  const sorted = [...references].sort((left, right) => (right.year || 0) - (left.year || 0));
  return sorted[0]?.source || null;
}

function getBestEvidenceGrade(values: Array<EvidenceGrade | undefined>): EvidenceGrade | null {
  if (values.includes('A')) return 'A';
  if (values.includes('B')) return 'B';
  if (values.includes('C')) return 'C';
  return null;
}

function getEvidenceBadgeClass(grade: EvidenceGrade | null) {
  if (grade === 'A') {
    return 'border-emerald-300/70 bg-emerald-50 text-emerald-700';
  }
  if (grade === 'B') {
    return 'border-amber-300/70 bg-amber-50 text-amber-700';
  }
  if (grade === 'C') {
    return 'border-rose-300/70 bg-rose-50 text-rose-700';
  }
  return 'border-border bg-background text-muted-foreground';
}

function getLatestClinicalReviewDate(
  procedure: Procedure,
  recommendations: Guideline[],
  relatedProtocols: Protocole[],
) {
  const values = [
    procedure.updated_at,
    ...recommendations.flatMap((item) => [item.review_at, item.published_at]),
    ...relatedProtocols.flatMap((item) => [item.review_at, item.published_at]),
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => right.getTime() - left.getTime());

  return values[0] || null;
}

function estimateReadingMinutes(procedure: Procedure, quick: ProcedureQuick | null | undefined) {
  const quickItems = quick
    ? quick.preop.length + quick.intraop.length + quick.postop.length + quick.red_flags.length
    : 0;
  const deepWords = Object.values(procedure.deep)
    .flatMap((content) => [...content.clinical, ...content.pitfalls])
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round((quickItems * 18 + deepWords) / 180));
}

function resolveLocalizedHospitalTitle(
  value: HospitalProcedureContext['title'],
  lang: SupportedLang,
): string | null {
  if (!value) return null;
  return value[lang] || value.fr || value.en || value.pt || null;
}

function resolveLocalizedHospitalSummary(
  value: HospitalProcedureContext['summary'],
  lang: SupportedLang,
): string[] {
  if (!value) return [];
  return value[lang] || value.fr || value.en || value.pt || [];
}

function formatHospitalSourcePages(pages: number[] | undefined): string | null {
  if (!pages || pages.length === 0) return null;
  return `${pages.length === 1 ? 'p.' : 'pp.'} ${pages.join(', ')}`;
}

function formatProcedureUpdatedAt(value: string | undefined, lang: SupportedLang) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getReferenceHref(reference: {
  url?: string;
  doi?: string;
  pmid?: string;
}) {
  if (reference.url) return reference.url;
  if (reference.doi) return `https://doi.org/${reference.doi}`;
  if (reference.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`;
  return null;
}

type ProcedureTranslationInsert = TablesInsert<'procedure_translations'>;

type ProcedureContentProps = {
  quick: ProcedureQuick | null | undefined;
  deep: ProcedureDeep | null | undefined;
  weight: number | null;
  weightKg: string;
  setWeightKg: (value: string) => void;
  patientWeights: PatientWeights | null;
  setPatientWeights: (value: PatientWeights | null) => void;
  procedure: Procedure;
  recommendations: Guideline[];
  relatedProtocols: Protocole[];
  relatedAlrBlocks: ALRBlock[];
  lang: SupportedLang;
  t: (key: string) => string;
  resolveStr: (value: { fr?: string; en?: string; pt?: string }) => string;
  resolve: <T>(value: { fr?: T; en?: T; pt?: T } | undefined) => T | undefined;
  getDrug: (id: string) => Drug | undefined;
  drugsLoading: boolean;
  handleCopyChecklist: () => void;
  checklistMode: boolean;
  checked: Record<string, boolean>;
  setChecked: (value: Record<string, boolean>) => void;
};

type DrugGroupedListProps = {
  drugs: ProcedureQuick['drugs'];
  getDrug: (id: string) => Drug | undefined;
  weight: number | null;
  patientWeights: PatientWeights | null;
  t: (key: string) => string;
  expandAllSignal: number;
};

async function loadProcedureOnDemand(id: string): Promise<Procedure | null> {
  const prefetched = readPrefetchedProcedure(id);
  if (prefetched) {
    return prefetched;
  }

  try {
    return await prefetchProcedureById(id);
  } catch (error) {
    console.warn('[AnesIA] Direct procedure fetch from Supabase failed', error);
  }

  return null;
}

export default function ProcedurePage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, resolve, resolveStr } = useLang();
  const { getProcedure, getDrug, drugs, guidelines, protocoles, alrBlocks, specialtiesData, loading } = useData();
  const [weightKg, setWeightKg] = useState<string>('');
  const [patientWeights, setPatientWeights] = useState<PatientWeights | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('anesia-favorites', []);
  const [recents, setRecents] = useLocalStorage<string[]>('anesia-recents', []);
  const [checklistMode, setChecklistMode] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showOriginal, setShowOriginal] = useState(false);
  const [savingTranslation, setSavingTranslation] = useState(false);
  const [translationSaved, setTranslationSaved] = useState(false);
  const [directProcedure, setDirectProcedure] = useState<Procedure | null>(null);
  const [directProcedureLoading, setDirectProcedureLoading] = useState(false);
  const [attemptedProcedureId, setAttemptedProcedureId] = useState<string | null>(null);
  const { isAdmin } = useIsAdmin();
  const { isPro, isProView, isHospitalView } = useViewMode();
  const { setProcedureContext } = useAIProcedureContext();
  const hospitalProfile = useHospitalProfile();
  const requestedProcedureId = id || '';
  const resolvedProcedureId = useMemo(
    () => resolveHospitalProcedureId(requestedProcedureId, hospitalProfile, isHospitalView),
    [requestedProcedureId, hospitalProfile, isHospitalView],
  );
  const hospitalProcedureIds = useMemo(
    () => (isHospitalView ? getHospitalProcedureIds(hospitalProfile) : null),
    [hospitalProfile, isHospitalView],
  );
  const isProcedureInHospitalScope =
    !requestedProcedureId || !hospitalProcedureIds || hospitalProcedureIds.has(resolvedProcedureId);
  const procedure = isProcedureInHospitalScope
    ? getProcedure(resolvedProcedureId) || directProcedure
    : null;
  const favoriteId = procedure?.id || requestedProcedureId || null;
  const isFav = favoriteId ? favorites.includes(favoriteId) : false;
  const guidelineIds = useMemo(() => guidelines.map((guideline) => guideline.id), [guidelines]);
  const { procedureTagIds, guidelineTagIds } = useRecommendationTags(procedure?.id, guidelineIds);
  const formularyDrugIds = useMemo(() => {
    if (!isHospitalView) return null;
    const ids = hospitalProfile?.formulary?.drug_ids || [];
    return ids.length > 0 ? new Set(ids) : null;
  }, [hospitalProfile, isHospitalView]);

  const applyHospitalFormulary = useCallback(
    (content: ProcedureQuick | null | undefined): ProcedureQuick | null | undefined => {
      if (!content || !formularyDrugIds) return content;
      return {
        ...content,
        drugs: content.drugs.filter((drugRef) => formularyDrugIds.has(drugRef.drug_id)),
      };
    },
    [formularyDrugIds],
  );

  useEffect(() => {
    setDirectProcedure(readPrefetchedProcedure(resolvedProcedureId));
    setDirectProcedureLoading(false);
    setAttemptedProcedureId(null);
  }, [resolvedProcedureId]);

  useEffect(() => {
    if (
      !resolvedProcedureId ||
      !isProcedureInHospitalScope ||
      procedure ||
      directProcedureLoading ||
      attemptedProcedureId === resolvedProcedureId
    ) {
      return;
    }

    let cancelled = false;

    setDirectProcedureLoading(true);
    setAttemptedProcedureId(resolvedProcedureId);
    void loadProcedureOnDemand(resolvedProcedureId)
      .then((loaded) => {
        if (cancelled) return;
        setDirectProcedure(loaded);
      })
      .finally(() => {
        setDirectProcedureLoading(false);
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedProcedureId, isProcedureInHospitalScope, procedure]);

  const isTranslatedFallback = useCallback(
    <T,>(content: Partial<Record<typeof lang, T>> | undefined) =>
      lang !== 'fr' &&
      !!content?.fr &&
      JSON.stringify(content[lang]) === JSON.stringify(content.fr),
    [lang],
  );

  // Auto-translation
  const contentFr = procedure?.quick?.fr || null;
  const contentDeepFr = procedure?.deep?.fr || null;
  const isQuickFallbackLang = !!procedure && isTranslatedFallback(procedure.quick);
  const isDeepFallbackLang = !!procedure && isTranslatedFallback(procedure.deep);
  const quickTranslation = useAutoTranslation(
    procedure?.id || resolvedProcedureId,
    lang,
    'quick',
    contentFr,
    isPro && isProView && isQuickFallbackLang && !showOriginal,
  );
  const deepTranslation = useAutoTranslation(
    procedure?.id || resolvedProcedureId,
    lang,
    'deep',
    contentDeepFr,
    isPro && isProView && isDeepFallbackLang && !showOriginal,
  );

  useEffect(() => {
    if (favoriteId && procedure) {
      setRecents((prev) => {
        const filtered = prev.filter((r) => r !== favoriteId);
        return [favoriteId, ...filtered].slice(0, 10);
      });
    }
  }, [favoriteId, procedure, setRecents]);

  // Reset checklist when procedure changes
  useEffect(() => {
    setChecked({});
    setChecklistMode(false);
  }, [requestedProcedureId]);
  useEffect(() => {
    setTranslationSaved(false);
  }, [requestedProcedureId, lang]);

  const isTranslating = quickTranslation.isTranslating || deepTranslation.isTranslating;
  const isAutoTranslated = quickTranslation.isAutoTranslated || deepTranslation.isAutoTranslated;
  const hasFallbackContent = isQuickFallbackLang || isDeepFallbackLang;
  const isPersisted =
    quickTranslation.isPersisted && (isDeepFallbackLang ? deepTranslation.isPersisted : true);
  const reviewStatus = quickTranslation.reviewStatus ?? deepTranslation.reviewStatus;
  const procedureTitle = procedure ? resolveStr(procedure.titles) : t('procedure_not_found');
  const specialtyDisplayName = procedure
    ? getSpecialtyDisplayName(procedure.specialty, specialtiesData, lang)
    : '';
  const procedureMetaDescription = procedure
    ? lang === 'fr'
      ? `${procedureTitle} - ${specialtyDisplayName}. Checklist rapide, points critiques et doses associees.`
      : lang === 'pt'
        ? `${procedureTitle} - ${specialtyDisplayName}. Checklist rapida, pontos criticos e doses associadas.`
        : `${procedureTitle} - ${specialtyDisplayName}. Quick checklist, key risks, and associated dosing.`
    : t('procedure_not_found_hint');
  usePageMeta({
    title: `${procedureTitle} | AnesIA`,
    description: procedureMetaDescription,
  });

  const recommendations = useMemo(() => {
    if (!procedure || !guidelines.length) return [];
    return getRelatedGuidelines(
      procedure,
      procedureTitle,
      guidelines,
      lang,
      resolveStr,
      procedureTagIds,
      guidelineTagIds,
    );
  }, [procedure, guidelines, lang, procedureTagIds, guidelineTagIds, procedureTitle, resolveStr]);
  const relatedProtocols = useMemo(() => {
    if (!procedure || !protocoles.length) return [];
    return getRelatedProtocols(procedure, procedureTitle, protocoles, resolveStr);
  }, [procedure, procedureTitle, protocoles, resolveStr]);

  const relatedAlrBlocks = useMemo(() => {
    if (!procedure || !alrBlocks.length) return [];
    return getRelatedALRBlocks(procedure, procedureTitle, alrBlocks, lang, resolveStr, resolve);
  }, [alrBlocks, procedure, procedureTitle, lang, resolve, resolveStr]);

  const weight = parseFloat(weightKg) || null;

  useEffect(() => {
    if (!requestedProcedureId) {
      setProcedureContext(null);
      return;
    }

    const currentProcedureId = procedure?.id || resolvedProcedureId || requestedProcedureId;
    const currentProcedureTitle = procedure ? resolveStr(procedure.titles) : undefined;

    setProcedureContext({
      procedureId: currentProcedureId,
      procedureTitle: currentProcedureTitle,
    });

    return () => {
      setProcedureContext(null);
    };
  }, [
    procedure,
    requestedProcedureId,
    resolvedProcedureId,
    resolveStr,
    setProcedureContext,
  ]);

  useEffect(() => {
    if (!procedure) return;
    trackEvent('procedure_page_view', {
      procedureId: procedure.id,
      specialty: procedure.specialty,
      lang,
      hospitalView: isHospitalView,
    });
  }, [procedure, lang, isHospitalView]);

  const handleCopyChecklist = () => {
    if (!procedure) return;
    const quick = applyHospitalFormulary(resolve(procedure.quick));
    if (!quick) return;
    const lines: string[] = [];
    const addSection = (title: string, items: string[]) => {
      if (items.length === 0) return;
      lines.push(`## ${title}`);
      items.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    };
    lines.push(`# ${resolveStr(procedure.titles)}`);
    lines.push('');
    addSection(t('preop'), quick.preop);
    addSection(t('intraop'), quick.intraop);
    addSection(t('postop'), quick.postop);
    if (quick.red_flags.length > 0) addSection(t('red_flags'), quick.red_flags);
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      trackEvent('procedure_checklist_copied', { procedureId: procedure.id });
      toast.success(t('copied'));
    });
  };

  const handleGenerateSummary = () => {
    if (!procedure) return;
    const quick = applyHospitalFormulary(resolve(procedure.quick));
    if (!quick) return;
    const lines: string[] = [];
    lines.push(`# ${resolveStr(procedure.titles)}`);
    lines.push(`${t('weight_kg')}: ${weightKg || '—'}`);
    lines.push('');
    const addSection = (title: string, items: string[]) => {
      if (items.length === 0) return;
      lines.push(`## ${title}`);
      items.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    };
    addSection(t('preop'), quick.preop);
    addSection(t('intraop'), quick.intraop);
    addSection(t('postop'), quick.postop);
    if (quick.red_flags.length > 0) addSection(t('red_flags'), quick.red_flags);

    // Add drug doses if weight is set
    if (weight && quick.drugs.length > 0) {
      lines.push(`## ${t('drugs_doses')}`);
      for (const dr of quick.drugs) {
        const drug = getDrug(dr.drug_id);
        if (drug) lines.push(`- ${resolveStr(drug.name)} (${dr.indication_tag})`);
      }
      lines.push('');
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      trackEvent('procedure_summary_copied', { procedureId: procedure.id });
      toast.success(t('summary_copied'));
    });
  };

  const shouldShowInitialSkeleton =
    !procedure && (directProcedureLoading || (loading && attemptedProcedureId === null));

  const handleRetryProcedureLoad = () => {
    setDirectProcedure(null);
    setDirectProcedureLoading(false);
    setAttemptedProcedureId(null);
  };

  if (shouldShowInitialSkeleton) {
    return <ProcedurePageSkeleton />;
  }

  if (!procedure) {
    const loadingHint =
      loading || directProcedureLoading
        ? lang === 'fr'
          ? 'Les donnees live sont encore en cours de chargement. Vous pouvez relancer cette intervention.'
          : lang === 'pt'
            ? 'Os dados live ainda estao a carregar. Podes tentar recarregar esta intervencao.'
            : 'Live data is still loading. You can retry this procedure.'
        : lang === 'fr'
          ? "Cette intervention n'a pas pu etre chargee depuis la source active."
          : lang === 'pt'
            ? 'Nao foi possivel carregar esta intervencao a partir da fonte ativa.'
            : 'This procedure could not be loaded from the active source.';

    return (
      <div className="container max-w-2xl py-8">
        <div className="rounded-2xl border border-dashed border-border bg-card/70 px-6 py-8 text-center clinical-shadow">
          <p className="text-base font-semibold text-foreground">{t('procedure_not_found')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('procedure_not_found_hint')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{loadingHint}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={handleRetryProcedureLoad}>
              {lang === 'fr' ? 'Reessayer' : lang === 'pt' ? 'Tentar novamente' : 'Retry'}
            </Button>
            <Button asChild>
              <Link to="/">{t('back')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const title = procedureTitle;

  // Use translated content if available, otherwise resolve normally
  let quick = resolve(procedure.quick);
  let deep = resolve(procedure.deep);

  if (quickTranslation.translatedContent && !showOriginal) {
    quick = quickTranslation.translatedContent;
  }

  if (deepTranslation.translatedContent && !showOriginal) {
    deep = deepTranslation.translatedContent;
  }

  const standardQuick = quick;
  quick = applyHospitalFormulary(quick);
  const latestReferenceYear = getLatestReferenceYear(procedure);
  const estimatedReadingMinutes = estimateReadingMinutes(procedure, quick);
  const updatedAtLabel = formatProcedureUpdatedAt(procedure.updated_at, lang);
  const referenceCount = Object.values(procedure.deep).reduce(
    (sum, content) => sum + content.references.length,
    0,
  );
  const primaryReferenceSource = getPrimaryReferenceSource(procedure);
  const quickChecklistCount = quick
    ? quick.preop.length + quick.intraop.length + quick.postop.length
    : 0;
  const hospitalProcedureContext = isHospitalView
    ? getHospitalProcedureContext(hospitalProfile, requestedProcedureId, procedure.id)
    : null;
  const hospitalContextTitle = resolveLocalizedHospitalTitle(hospitalProcedureContext?.title, lang);
  const hospitalContextSummary = resolveLocalizedHospitalSummary(hospitalProcedureContext?.summary, lang);
  const hospitalContextSourcePages = formatHospitalSourcePages(hospitalProcedureContext?.source_pages);
  const showStPierreBadge = isStPierreProcedure(procedure.id, hospitalProfile, isHospitalView);
  const strongestEvidenceGrade = getBestEvidenceGrade([
    ...recommendations.map((item) => item.evidence_grade),
    ...relatedProtocols.map((item) => item.evidence_grade),
  ]);
  const latestClinicalReviewDate = getLatestClinicalReviewDate(
    procedure,
    recommendations,
    relatedProtocols,
  );
  const latestClinicalReviewLabel = latestClinicalReviewDate
    ? latestClinicalReviewDate.toLocaleDateString(lang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const hiddenHospitalDrugRefs =
    isHospitalView && standardQuick && quick
      ? standardQuick.drugs.filter(
          (drugRef) =>
            !quick.drugs.some(
              (activeDrugRef) =>
                activeDrugRef.drug_id === drugRef.drug_id &&
                activeDrugRef.indication_tag === drugRef.indication_tag,
            ),
        )
      : [];
  const hiddenHospitalDrugNames = hiddenHospitalDrugRefs
    .map((drugRef) => getDrug(drugRef.drug_id))
    .filter((drug): drug is NonNullable<typeof drug> => !!drug)
    .map((drug) => resolveStr(drug.name))
    .filter((value, index, current) => current.indexOf(value) === index)
    .slice(0, 4);
  const linkedHospitalProcedures = (hospitalProcedureContext?.linked_procedure_ids || [])
    .map((procedureId) => getProcedure(procedureId))
    .filter((item): item is Procedure => !!item);
  const hospitalDeltaCount =
    hospitalContextSummary.length +
    hiddenHospitalDrugRefs.length +
    (hospitalProcedureContext?.linked_procedure_ids?.length || 0);
  const trustSourceCount = recommendations.length + relatedProtocols.length;

  const toggleFav = () => {
    if (!favoriteId) return;
    trackEvent('procedure_favorite_toggle', { procedureId: favoriteId, nextState: !isFav });
    setFavorites((prev) =>
      prev.includes(favoriteId) ? prev.filter((f) => f !== favoriteId) : [...prev, favoriteId],
    );
  };

  const handlePrintProcedure = () => {
    trackEvent('procedure_print', { procedureId: procedure.id });
    window.print();
  };

  // Checklist progress
  const allItems = quick ? [...quick.preop, ...quick.intraop, ...quick.postop] : [];
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="container max-w-2xl space-y-5 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Link>
          <h1 className="mt-2 text-xl font-bold text-foreground leading-tight">{title}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="secondary">{specialtyDisplayName}</Badge>
            {showStPierreBadge && (
              <Badge variant="outline" className="text-[10px] border-primary text-primary">
                CHU St Pierre
              </Badge>
            )}
            {procedure.is_pro && (
              <Badge variant="outline" className="gap-0.5 border-accent text-accent text-[10px]">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
            )}
            {isAutoTranslated && !showOriginal && (
              <Badge variant="outline" className="gap-0.5 text-[10px]">
                <Globe className="h-3 w-3" />
                {t('auto_translated')}
              </Badge>
            )}
            {isAutoTranslated && !showOriginal && (translationSaved || reviewStatus) && (
              <Badge variant="secondary" className="text-[10px]">
                {translationSaved || reviewStatus === 'approved'
                  ? 'Reviewed'
                  : reviewStatus === 'rejected'
                    ? 'Rejected'
                    : 'Pending review'}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to={buildPublicProcedurePath(procedure.id, title)}
            className="mt-1 p-1.5 text-muted-foreground hover:text-accent transition-colors"
            title={lang === 'fr' ? 'Page publique' : lang === 'pt' ? 'Pagina publica' : 'Public page'}
          >
            <Globe className="h-5 w-5" />
          </Link>
          {quick && (
            <>
              <button
                onClick={handleCopyChecklist}
                className="mt-1 p-1.5 text-muted-foreground hover:text-accent transition-colors"
                title={t('copy_checklist')}
              >
                <ClipboardCopy className="h-5 w-5" />
              </button>
              <button
                onClick={handleGenerateSummary}
                className="mt-1 p-1.5 text-muted-foreground hover:text-accent transition-colors"
                title={t('generate_summary')}
              >
                <FileText className="h-5 w-5" />
              </button>
              <button
                onClick={handlePrintProcedure}
                className="mt-1 p-1.5 text-muted-foreground hover:text-accent transition-colors"
                title={lang === 'fr' ? 'Imprimer / PDF' : lang === 'pt' ? 'Imprimir / PDF' : 'Print / PDF'}
              >
                <Printer className="h-5 w-5" />
              </button>
            </>
          )}
          <button onClick={toggleFav} className="mt-1 p-1.5">
            <Star
              className={`h-6 w-6 ${isFav ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`}
            />
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="clinical-shadow">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'Lecture' : lang === 'pt' ? 'Leitura' : 'Reading'}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {estimatedReadingMinutes} min
            </p>
          </CardContent>
        </Card>
        <Card className="clinical-shadow">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'Checklist' : lang === 'pt' ? 'Checklist' : 'Checklist'}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">{quickChecklistCount}</p>
          </CardContent>
        </Card>
        <Card className="clinical-shadow">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'References' : lang === 'pt' ? 'Referencias' : 'References'}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">{referenceCount}</p>
          </CardContent>
        </Card>
        <Card className="clinical-shadow">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'Evidence' : lang === 'pt' ? 'Evidencia' : 'Evidence'}
            </p>
            <div className="mt-2">
              <Badge variant="outline" className={getEvidenceBadgeClass(strongestEvidenceGrade)}>
                {strongestEvidenceGrade
                  ? `E${strongestEvidenceGrade}`
                  : lang === 'fr'
                    ? 'Aucune'
                    : lang === 'pt'
                      ? 'Sem grade'
                      : 'No grade'}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {trustSourceCount > 0
                ? lang === 'fr'
                  ? `${trustSourceCount} source(s) reliee(s)`
                  : lang === 'pt'
                    ? `${trustSourceCount} fonte(s) relacionadas`
                    : `${trustSourceCount} linked source(s)`
                : lang === 'fr'
                  ? 'Pas encore de source structuree'
                  : lang === 'pt'
                    ? 'Sem fonte estruturada ainda'
                    : 'No structured source yet'}
            </p>
          </CardContent>
        </Card>
        <Card className="clinical-shadow">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'Clinical review' : lang === 'pt' ? 'Revisao clinica' : 'Clinical review'}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {latestClinicalReviewLabel ?? updatedAtLabel ?? '—'}
            </p>
            {latestReferenceYear && (
              <p className="mt-1 text-xs text-muted-foreground">
                {lang === 'fr'
                  ? `Source recente ${latestReferenceYear}`
                  : lang === 'pt'
                    ? `Fonte mais recente ${latestReferenceYear}`
                    : `Latest source ${latestReferenceYear}`}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="clinical-shadow">
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'Primary source' : lang === 'pt' ? 'Fonte chave' : 'Primary source'}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {primaryReferenceSource || '—'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {updatedAtLabel
                ? lang === 'fr'
                  ? `Intervention mise a jour ${updatedAtLabel}`
                  : lang === 'pt'
                    ? `Intervencao atualizada em ${updatedAtLabel}`
                    : `Intervention updated ${updatedAtLabel}`
                : lang === 'fr'
                  ? 'Pas de date de mise a jour structuree'
                  : lang === 'pt'
                    ? 'Sem data estruturada de atualizacao'
                    : 'No structured update date yet'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'Trust layer' : lang === 'pt' ? 'Camada de confianca' : 'Trust layer'}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {lang === 'fr'
                ? `${recommendations.length} guidelines, ${relatedProtocols.length} protocoles`
                : lang === 'pt'
                  ? `${recommendations.length} guidelines, ${relatedProtocols.length} protocolos`
                  : `${recommendations.length} guidelines, ${relatedProtocols.length} protocols`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {lang === 'fr'
                ? 'Relies a cette intervention pour le contexte et la verification.'
                : lang === 'pt'
                  ? 'Ligados a esta intervencao para contexto e verificacao.'
                  : 'Linked to this intervention for context and verification.'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === 'fr' ? 'Hospital delta' : lang === 'pt' ? 'Delta hospitalar' : 'Hospital delta'}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {isHospitalView
                ? lang === 'fr'
                  ? `${hospitalDeltaCount} adaptation(s) locale(s)`
                  : lang === 'pt'
                    ? `${hospitalDeltaCount} adaptacao(oes) local(is)`
                    : `${hospitalDeltaCount} local adaptation(s)`
                : lang === 'fr'
                  ? 'Standard content'
                  : lang === 'pt'
                    ? 'Conteudo standard'
                    : 'Standard content'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isHospitalView && hiddenHospitalDrugNames.length > 0
                ? hiddenHospitalDrugNames.join(', ')
                : lang === 'fr'
                  ? 'Aucune difference locale marquee sur le formulary.'
                  : lang === 'pt'
                    ? 'Sem diferenca local marcada no formulary.'
                    : 'No marked local formulary delta.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Translation / FR-only banner */}
      {hasFallbackContent && !isAutoTranslated && !isTranslating && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
          <span>🌐</span>
          <span>{t('content_fr_only')}</span>
        </div>
      )}

      {isTranslating && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
          <span>⏳</span>
          <span>{t('translating')}</span>
        </div>
      )}

      {hospitalContextSummary.length > 0 && (
        <Card className="border-l-4 border-l-primary clinical-shadow">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                {hospitalProfile?.name}
              </h2>
              {hospitalContextSourcePages && (
                <Badge variant="secondary" className="text-[10px]">
                  {hospitalContextSourcePages}
                </Badge>
              )}
            </div>
            {hospitalContextTitle && hospitalContextTitle !== hospitalProfile?.name && (
              <p className="mt-1 text-xs font-medium text-muted-foreground">{hospitalContextTitle}</p>
            )}
            <div className="mt-3">
              <BulletList items={hospitalContextSummary} />
            </div>
          </CardContent>
        </Card>
      )}

      {isHospitalView && (hospitalContextSummary.length > 0 || hiddenHospitalDrugRefs.length > 0) && (
        <Card className="clinical-shadow">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {lang === 'fr'
                    ? 'Standard vs mode hopital'
                    : lang === 'pt'
                      ? 'Standard vs modo hospital'
                      : 'Standard vs hospital mode'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {lang === 'fr'
                    ? 'Ce qui change vraiment quand le mode hopital est actif.'
                    : lang === 'pt'
                      ? 'O que muda realmente quando o modo hospital esta ativo.'
                      : 'What materially changes when hospital mode is active.'}
                </p>
              </div>
              <Badge variant="outline">{hospitalDeltaCount}</Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lang === 'fr' ? 'Standard baseline' : lang === 'pt' ? 'Baseline standard' : 'Standard baseline'}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  <li>
                    {lang === 'fr'
                      ? `${standardQuick?.drugs.length || 0} medicament(s) lies a l intervention`
                      : lang === 'pt'
                        ? `${standardQuick?.drugs.length || 0} farmaco(s) ligados a intervencao`
                        : `${standardQuick?.drugs.length || 0} intervention-linked drugs`}
                  </li>
                  <li>
                    {lang === 'fr'
                      ? `${standardQuick?.preop.length || 0} items pre-op`
                      : lang === 'pt'
                        ? `${standardQuick?.preop.length || 0} itens pre-op`
                        : `${standardQuick?.preop.length || 0} pre-op items`}
                  </li>
                  <li>
                    {lang === 'fr'
                      ? `${standardQuick?.intraop.length || 0} items per-op`
                      : lang === 'pt'
                        ? `${standardQuick?.intraop.length || 0} itens intra-op`
                        : `${standardQuick?.intraop.length || 0} intra-op items`}
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {lang === 'fr' ? 'Local delta' : lang === 'pt' ? 'Delta local' : 'Local delta'}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  <li>
                    {lang === 'fr'
                      ? `${hospitalContextSummary.length} adaptation(s) contextuelle(s)`
                      : lang === 'pt'
                        ? `${hospitalContextSummary.length} adaptacao(oes) contextuais`
                        : `${hospitalContextSummary.length} contextual adaptation(s)`}
                  </li>
                  <li>
                    {lang === 'fr'
                      ? `${hiddenHospitalDrugRefs.length} medicament(s) filtres par le formulary`
                      : lang === 'pt'
                        ? `${hiddenHospitalDrugRefs.length} farmaco(s) filtrados pelo formulary`
                        : `${hiddenHospitalDrugRefs.length} drug(s) filtered by formulary`}
                  </li>
                  <li>
                    {lang === 'fr'
                      ? `${linkedHospitalProcedures.length} intervention(s) associee(s)`
                      : lang === 'pt'
                        ? `${linkedHospitalProcedures.length} intervencao(oes) associada(s)`
                        : `${linkedHospitalProcedures.length} linked intervention(s)`}
                  </li>
                </ul>
              </div>
            </div>

            {hiddenHospitalDrugNames.length > 0 && (
              <div className="rounded-xl border border-amber-300/50 bg-amber-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  {lang === 'fr'
                    ? 'Filtered by local formulary'
                    : lang === 'pt'
                      ? 'Filtrado pelo formulary local'
                      : 'Filtered by local formulary'}
                </p>
                <p className="mt-2 text-sm text-foreground">{hiddenHospitalDrugNames.join(', ')}</p>
              </div>
            )}

            {linkedHospitalProcedures.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {lang === 'fr'
                    ? 'Linked local interventions'
                    : lang === 'pt'
                      ? 'Intervencoes locais associadas'
                      : 'Linked local interventions'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {linkedHospitalProcedures.slice(0, 4).map((linkedProcedure) => (
                    <Link
                      key={linkedProcedure.id}
                      to={`/p/${linkedProcedure.id}`}
                      className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {resolveStr(linkedProcedure.titles)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toggle original / translated */}
      {isAutoTranslated && (
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
        >
          <Eye className="h-3.5 w-3.5" />
          {showOriginal ? t('view_translated') : t('view_original')}
        </button>
      )}

      {/* Admin save translation */}
      {isAutoTranslated && isAdmin && !showOriginal && !isPersisted && !translationSaved && (
        <button
          disabled={savingTranslation}
          onClick={async () => {
            const translationsToSave = [
              { section: 'quick', translated: quickTranslation.translatedContent },
              { section: 'deep', translated: deepTranslation.translatedContent },
            ].filter(
              (
                entry,
              ): entry is { section: 'quick' | 'deep'; translated: Record<string, unknown> } =>
                !!entry.translated,
            );
            if (!procedure || translationsToSave.length === 0) return;
            setSavingTranslation(true);
            try {
              const { data: userData } = await supabase.auth.getUser();
              const timestamp = new Date().toISOString();
              const payload: ProcedureTranslationInsert[] = translationsToSave.map((entry) => ({
                  procedure_id: procedure.id,
                  lang,
                  section: entry.section,
                  translated_content: entry.translated,
                  generated_at: timestamp,
                  review_status: 'approved',
                  reviewed_at: timestamp,
                  reviewed_by: userData.user?.id ?? null,
                }));
              const { error } = await supabase.from('procedure_translations').upsert(
                payload,
                { onConflict: 'procedure_id,lang,section' },
              );
              if (error) throw error;
              setTranslationSaved(true);
              toast.success(t('translation_saved'));
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Save failed');
            } finally {
              setSavingTranslation(false);
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {savingTranslation ? t('translation_saving') : t('save_translation')}
        </button>
      )}

      {/* Toolbar: checklist mode */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant={checklistMode ? 'default' : 'outline'}
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => {
            setChecklistMode(!checklistMode);
            if (checklistMode) setChecked({});
          }}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          {t('checklist_mode')}
        </Button>
        {checklistMode && allItems.length > 0 && (
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <Progress value={(checkedCount / allItems.length) * 100} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {checkedCount}/{allItems.length}
            </span>
          </div>
        )}
      </div>

      <ProcedureContent
        quick={quick}
        deep={deep}
        weight={weight}
        weightKg={weightKg}
        setWeightKg={setWeightKg}
        patientWeights={patientWeights}
        setPatientWeights={setPatientWeights}
        procedure={procedure}
        recommendations={recommendations}
        relatedProtocols={relatedProtocols}
        relatedAlrBlocks={relatedAlrBlocks}
        lang={lang}
        t={t}
        resolveStr={resolveStr}
        resolve={resolve}
        getDrug={getDrug}
        drugsLoading={loading && drugs.length === 0}
        handleCopyChecklist={handleCopyChecklist}
        checklistMode={checklistMode}
        checked={checked}
        setChecked={setChecked}
      />
    </div>
  );
}

function ProcedurePageSkeleton() {
  return (
    <div className="container max-w-2xl space-y-5 py-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-2 w-36 rounded-full" />
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border bg-card p-4 clinical-shadow">
          <Skeleton className="h-4 w-24" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 clinical-shadow">
          <Skeleton className="h-4 w-28" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-md" />
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4 clinical-shadow">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-36" />
        <div className="rounded-xl border bg-card p-4 clinical-shadow">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4 clinical-shadow">
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistBulletList({
  items,
  prefix,
  checklistMode,
  checked,
  setChecked,
}: {
  items: string[];
  prefix: string;
  checklistMode: boolean;
  checked: Record<string, boolean>;
  setChecked: (v: Record<string, boolean>) => void;
}) {
  if (!checklistMode) return <BulletList items={items} />;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => {
        const key = `${prefix}-${i}`;
        const isChecked = !!checked[key];
        return (
          <li key={key} className="flex items-start gap-2">
            <Checkbox
              checked={isChecked}
              onCheckedChange={(v) => setChecked({ ...checked, [key]: !!v })}
              className="mt-0.5"
            />
            <span
              className={`text-sm ${isChecked ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}
            >
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ProcedureContent({
  quick,
  deep,
  weight,
  weightKg,
  setWeightKg,
  patientWeights,
  setPatientWeights,
  procedure,
  recommendations,
  relatedProtocols,
  relatedAlrBlocks,
  lang,
  t,
  resolveStr,
  resolve,
  getDrug,
  drugsLoading,
  handleCopyChecklist,
  checklistMode,
  checked,
  setChecked,
}: ProcedureContentProps) {
  const [expandAllDrugsSignal, setExpandAllDrugsSignal] = useState(0);

  return (
    <>
      {/* Key Points card */}
      {quick && quick.preop.length > 0 && (
        <Card className="border-l-4 border-l-accent clinical-shadow">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
              {t('preop')}
            </h3>
            <ChecklistBulletList
              items={quick.preop.slice(0, 3)}
              prefix="preop-key"
              checklistMode={checklistMode}
              checked={checked}
              setChecked={setChecked}
            />
          </CardContent>
        </Card>
      )}

      {/* Risk Alerts card */}
      {quick && quick.red_flags.length > 0 && (
        <Card className="border-l-4 border-l-clinical-danger clinical-shadow">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-clinical-danger">
              {t('red_flags')}
            </h3>
            <BulletList items={quick.red_flags} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {quick && (
        <Tabs defaultValue="preop" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="preop" className="text-xs">
              {t('preop')}
            </TabsTrigger>
            <TabsTrigger value="intraop" className="text-xs">
              {t('intraop')}
            </TabsTrigger>
            <TabsTrigger value="postop" className="text-xs">
              {t('postop')}
            </TabsTrigger>
            <TabsTrigger value="detail" className="text-xs">
              {t('detail')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preop" className="mt-3">
            <Card className="clinical-shadow">
              <CardContent className="p-4">
                <Section title={t('preop')} variant="preop">
                  <ChecklistBulletList
                    items={quick.preop}
                    prefix="preop"
                    checklistMode={checklistMode}
                    checked={checked}
                    setChecked={setChecked}
                  />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intraop" className="mt-3 space-y-3">
            <Card className="clinical-shadow">
              <CardContent className="p-4">
                <Section title={t('intraop')} variant="intraop">
                  <ChecklistBulletList
                    items={quick.intraop}
                    prefix="intraop"
                    checklistMode={checklistMode}
                    checked={checked}
                    setChecked={setChecked}
                  />
                </Section>
              </CardContent>
            </Card>
            <IntubationGuide />
          </TabsContent>

          <TabsContent value="postop" className="mt-3">
            <Card className="clinical-shadow">
              <CardContent className="p-4">
                <Section title={t('postop')} variant="postop">
                  <ChecklistBulletList
                    items={quick.postop}
                    prefix="postop"
                    checklistMode={checklistMode}
                    checked={checked}
                    setChecked={setChecked}
                  />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail" className="mt-3 space-y-3">
            <ProGate>
              <>
                {deep && (
                  <>
                    <Card className="clinical-shadow">
                      <CardContent className="p-4">
                        <Section title={t('clinical_notes')} variant="info">
                          <BulletList items={deep.clinical} />
                        </Section>
                      </CardContent>
                    </Card>
                    <Card className="clinical-shadow">
                      <CardContent className="p-4">
                        <Section title={t('pitfalls')} variant="redflag">
                          <BulletList items={deep.pitfalls} />
                        </Section>
                      </CardContent>
                    </Card>
                    {deep.references.length > 0 && (
                      <Card className="clinical-shadow">
                        <CardContent className="p-4">
                          <Section title={t('references_title')} variant="info">
                            <ul className="space-y-2">
                              {deep.references.map((ref, i: number) => {
                                const href = getReferenceHref(ref);

                                return (
                                  <li key={i} className="text-xs text-card-foreground">
                                    {href ? (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold text-accent hover:underline"
                                        onClick={() =>
                                          trackEvent('procedure_reference_open', {
                                            procedureId: procedure.id,
                                            referenceIndex: i,
                                          })
                                        }
                                      >
                                        {ref.source}
                                      </a>
                                    ) : (
                                      <span className="font-semibold">{ref.source}</span>
                                    )}
                                    {ref.year && (
                                      <span className="text-muted-foreground"> ({ref.year})</span>
                                    )}
                                    {ref.note && (
                                      <span className="text-muted-foreground"> - {ref.note}</span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </Section>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {(recommendations.length > 0 ||
                  relatedProtocols.length > 0 ||
                  relatedAlrBlocks.length > 0) && (
                  <div className="grid gap-3 lg:grid-cols-3">
                    {recommendations.length > 0 && (
                      <Card className="clinical-shadow border-l-4 border-l-clinical-info">
                        <CardContent className="p-4">
                          <h3 className="mb-3 text-sm font-bold text-clinical-info flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            {t('recommendations')}
                          </h3>
                          <div className="space-y-2">
                            {recommendations.map((g: Guideline) => (
                              <Link
                                key={g.id}
                                to={buildPublicGuidelinePath(g.id, resolveStr(g.titles))}
                                className="block rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                              >
                                <p className="text-xs font-semibold text-card-foreground">
                                  {resolveStr(g.titles)}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {g.category}
                                  </Badge>
                                  {g.organization && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {g.organization}
                                    </Badge>
                                  )}
                                  {!!g.recommendation_strength && (
                                    <Badge variant="outline" className="text-[10px]">
                                      S{g.recommendation_strength}
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {relatedProtocols.length > 0 && (
                      <Card className="clinical-shadow border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <h3 className="mb-3 text-sm font-bold text-primary flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            {lang === 'fr'
                              ? 'Protocoles lies'
                              : lang === 'pt'
                                ? 'Protocolos relacionados'
                                : 'Related protocols'}
                          </h3>
                          <div className="space-y-2">
                            {relatedProtocols.map((protocol: Protocole) => (
                              <Link
                                key={protocol.id}
                                to={buildPublicProtocolPath(protocol.id, resolveStr(protocol.titles))}
                                className="block rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                              >
                                <p className="text-xs font-semibold text-card-foreground">
                                  {resolveStr(protocol.titles)}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {protocol.category}
                                  </Badge>
                                  {protocol.version && (
                                    <Badge variant="outline" className="text-[10px]">
                                      v{protocol.version}
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {relatedAlrBlocks.length > 0 && (
                      <Card className="clinical-shadow border-l-4 border-l-accent">
                        <CardContent className="p-4">
                          <h3 className="mb-3 text-sm font-bold text-accent flex items-center gap-1.5">
                            <Globe className="h-4 w-4" />
                            {lang === 'fr'
                              ? 'ALR liee'
                              : lang === 'pt'
                                ? 'ALR relacionada'
                                : 'Related regional blocks'}
                          </h3>
                          <div className="space-y-2">
                            {relatedAlrBlocks.map((block: ALRBlock) => (
                              <Link
                                key={block.id}
                                to={buildPublicALRPath(block.id, resolveStr(block.titles))}
                                className="block rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                              >
                                <p className="text-xs font-semibold text-card-foreground">
                                  {resolveStr(block.titles)}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {block.region}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px]">
                                    {(resolve<string[]>(block.indications) ?? []).length}{' '}
                                    {lang === 'fr' ? 'indications' : lang === 'pt' ? 'indicacoes' : 'indications'}
                                  </Badge>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            </ProGate>
          </TabsContent>
        </Tabs>
      )}

      {/* Drugs & Doses — grouped */}
      {quick && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground">{t('drugs_doses')}</h2>
            {quick.drugs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => setExpandAllDrugsSignal((current) => current + 1)}
              >
                {t('expand_all')}
              </Button>
            )}
          </div>
          {drugsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : quick.drugs.length > 0 ? (
            <>
              <Card className="clinical-shadow">
                <CardContent className="p-3">
                  <PatientAnthropometrics
                    weightKg={weightKg}
                    onWeightChange={setWeightKg}
                    onWeightsChange={setPatientWeights}
                  />
                </CardContent>
              </Card>
              <DrugGroupedList
                drugs={quick.drugs}
                getDrug={getDrug}
                weight={weight}
                patientWeights={patientWeights}
                t={t}
                expandAllSignal={expandAllDrugsSignal}
              />
            </>
          ) : (
            <Card className="clinical-shadow border-l-4 border-l-muted">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('no_doses_configured')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function DrugGroupedList({
  drugs,
  getDrug,
  weight,
  patientWeights,
  t,
  expandAllSignal,
}: DrugGroupedListProps) {
  const grouped = useMemo(() => groupDrugs(drugs), [drugs]);
  const activeGroups = useMemo(
    () => GROUP_ORDER.filter((group) => grouped[group].length > 0),
    [grouped],
  );
  const buildInitialOpenGroups = () =>
    Object.fromEntries(activeGroups.map((group, index) => [group, index === 0]));
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    buildInitialOpenGroups(),
  );

  useEffect(() => {
    setOpenGroups((prev) =>
      Object.fromEntries(
        activeGroups.map((group) => [
          group,
          expandAllSignal > 0 ? true : (prev[group] ?? group === activeGroups[0]),
        ]),
      ),
    );
  }, [activeGroups, expandAllSignal]);

  if (activeGroups.length <= 1) {
    // No grouping needed if all in one group
    return (
      <div className="space-y-2">
        {drugs.map((drugRef, i: number) => {
          const drug = getDrug(drugRef.drug_id);
          if (!drug) return null;
          return (
            <DrugDoseRow
              key={`${drugRef.drug_id}-${drugRef.indication_tag}-${i}`}
              drug={drug}
              indicationTag={drugRef.indication_tag}
              weightKg={weight}
              patientWeights={patientWeights}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeGroups.map((group) => (
        <Collapsible
          key={group}
          open={!!openGroups[group]}
          onOpenChange={(isOpen) => setOpenGroups((prev) => ({ ...prev, [group]: isOpen }))}
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-1.5 px-1 text-sm font-semibold text-foreground hover:text-accent transition-colors rounded hover:bg-muted/30">
            {openGroups[group] ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span>{t(GROUP_I18N_KEYS[group])}</span>
            <Badge variant="secondary" className="text-[10px]">
              {grouped[group].length}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-5 pt-1">
            {grouped[group].map((drugRef, i: number) => {
              const drug = getDrug(drugRef.drug_id);
              if (!drug) return null;
              return (
                <DrugDoseRow
                  key={`${drugRef.drug_id}-${drugRef.indication_tag}-${i}`}
                  drug={drug}
                  indicationTag={drugRef.indication_tag}
                  weightKg={weight}
                  patientWeights={patientWeights}
                />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
