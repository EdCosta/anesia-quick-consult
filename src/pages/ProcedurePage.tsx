import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft, ClipboardCopy, BookOpen, Crown, CheckSquare, FileText, Globe, Eye, Save } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAutoTranslation } from '@/hooks/useAutoTranslation';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import Section, { BulletList } from '@/components/anesia/Section';
import IntubationGuide from '@/components/anesia/IntubationGuide';
import DrugDoseRow from '@/components/anesia/DrugDoseRow';
import PatientAnthropometrics from '@/components/anesia/PatientAnthropometrics';
import ProGate from '@/components/anesia/ProGate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { groupDrugs, GROUP_ORDER, GROUP_I18N_KEYS } from '@/lib/drugGroups';
import type { PatientWeights } from '@/lib/weightScalars';

export default function ProcedurePage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, resolve, resolveStr } = useLang();
  const { getProcedure, getDrug, guidelines, specialtiesData, loading } = useData();
  const [weightKg, setWeightKg] = useState<string>('');
  const [patientWeights, setPatientWeights] = useState<PatientWeights | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('anesia-favorites', []);
  const [recents, setRecents] = useLocalStorage<string[]>('anesia-recents', []);
  const [checklistMode, setChecklistMode] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showOriginal, setShowOriginal] = useState(false);
  const [savingTranslation, setSavingTranslation] = useState(false);
  const { isAdmin } = useIsAdmin();
  const procedure = getProcedure(id || '');
  const isFav = id ? favorites.includes(id) : false;

  // Check if content is using fallback (FR only)
  const isFallbackLang = lang !== 'fr' && !(procedure?.quick as any)?.[lang];

  // Auto-translation
  const contentFr = procedure ? (procedure.quick as any)?.fr : null;
  const { translatedContent, isTranslating, isAutoTranslated } = useAutoTranslation(
    id || '', lang, contentFr, isFallbackLang && !showOriginal
  );

  useEffect(() => {
    if (id && procedure) {
      setRecents((prev) => {
        const filtered = prev.filter((r) => r !== id);
        return [id, ...filtered].slice(0, 10);
      });
    }
  }, [id, procedure]);

  // Reset checklist when procedure changes
  useEffect(() => { setChecked({}); setChecklistMode(false); }, [id]);

  const recommendations = useMemo(() => {
    if (!procedure || !guidelines.length) return [];
    const procTags: string[] = (procedure as any).tags || [];
    const specialty = procedure.specialty.toLowerCase();

    const scored = guidelines.map(g => {
      let score = 0;
      const gTags: string[] = (g as any).tags || [];
      // Tag intersection scoring
      if (procTags.length > 0 && gTags.length > 0) {
        for (const tag of procTags) {
          if (gTags.includes(tag)) score += 2;
        }
      }
      // Category match fallback
      if (['airway', 'safety', 'pain', 'ponv', 'temperature'].includes(g.category)) score += 1;
      return { guideline: g, score };
    });
    return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(s => s.guideline);
  }, [procedure, guidelines]);

  const weight = parseFloat(weightKg) || null;

  const handleCopyChecklist = () => {
    if (!procedure) return;
    const quick = resolve(procedure.quick);
    if (!quick) return;
    const lines: string[] = [];
    const addSection = (title: string, items: string[]) => { if (items.length === 0) return; lines.push(`## ${title}`); items.forEach((item) => lines.push(`- ${item}`)); lines.push(''); };
    lines.push(`# ${resolveStr(procedure.titles)}`);
    lines.push('');
    addSection(t('preop'), quick.preop);
    addSection(t('intraop'), quick.intraop);
    addSection(t('postop'), quick.postop);
    if (quick.red_flags.length > 0) addSection(t('red_flags'), quick.red_flags);
    navigator.clipboard.writeText(lines.join('\n')).then(() => { toast.success(t('copied')); });
  };

  const handleGenerateSummary = () => {
    if (!procedure) return;
    const quick = resolve(procedure.quick);
    if (!quick) return;
    const lines: string[] = [];
    lines.push(`# ${resolveStr(procedure.titles)}`);
    lines.push(`${t('weight_kg')}: ${weightKg || '—'}`);
    lines.push('');
    const addSection = (title: string, items: string[]) => { if (items.length === 0) return; lines.push(`## ${title}`); items.forEach((item) => lines.push(`- ${item}`)); lines.push(''); };
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

    navigator.clipboard.writeText(lines.join('\n')).then(() => { toast.success(t('summary_copied')); });
  };

  if (loading) {
    return (<div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">{t('loading')}</p></div>);
  }

  if (!procedure) {
    return (<div className="container max-w-2xl py-8 text-center"><p className="text-muted-foreground">Procédure introuvable.</p><Link to="/" className="mt-4 inline-block text-accent hover:underline">{t('back')}</Link></div>);
  }

  const title = resolveStr(procedure.titles);

  // Use translated content if available, otherwise resolve normally
  let quick = resolve(procedure.quick);
  const deep = resolve(procedure.deep);

  if (isAutoTranslated && translatedContent && !showOriginal) {
    quick = translatedContent;
  }

  const specialtyDisplayName = (() => {
    const spec = specialtiesData.find((s) => s.id === procedure.specialty);
    if (spec && spec.name) return spec.name[lang] || spec.name['fr'] || procedure.specialty;
    return procedure.specialty;
  })();

  const toggleFav = () => {
    if (!id) return;
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  // Checklist progress
  const allItems = quick ? [...quick.preop, ...quick.intraop, ...quick.postop] : [];
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="container max-w-2xl space-y-5 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" />{t('back')}
          </Link>
          <h1 className="mt-2 text-xl font-bold text-foreground leading-tight">{title}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="secondary">{specialtyDisplayName}</Badge>
            {procedure.is_pro && (
              <Badge variant="outline" className="gap-0.5 border-accent text-accent text-[10px]">
                <Crown className="h-3 w-3" />PRO
              </Badge>
            )}
            {isAutoTranslated && !showOriginal && (
              <Badge variant="outline" className="gap-0.5 text-[10px]">
                <Globe className="h-3 w-3" />
                {t('auto_translated')}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {quick && (
            <>
              <button onClick={handleCopyChecklist} className="mt-1 p-1.5 text-muted-foreground hover:text-accent transition-colors" title={t('copy_checklist')}>
                <ClipboardCopy className="h-5 w-5" />
              </button>
              <button onClick={handleGenerateSummary} className="mt-1 p-1.5 text-muted-foreground hover:text-accent transition-colors" title={t('generate_summary')}>
                <FileText className="h-5 w-5" />
              </button>
            </>
          )}
          <button onClick={toggleFav} className="mt-1 p-1.5">
            <Star className={`h-6 w-6 ${isFav ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
          </button>
        </div>
      </div>

      {/* Translation / FR-only banner */}
      {isFallbackLang && !isAutoTranslated && !isTranslating && (
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
      {isAutoTranslated && isAdmin && !showOriginal && (
        <button
          disabled={savingTranslation}
          onClick={async () => {
            if (!procedure || !translatedContent) return;
            setSavingTranslation(true);
            try {
              const { error } = await supabase
                .from('procedures' as any)
                .update({
                  content: {
                    ...(procedure as any).content,
                    quick: { ...(procedure.quick || {}), [lang]: translatedContent },
                  },
                } as any)
                .eq('id', procedure.id);
              if (error) throw error;
              toast.success(t('translation_saved'));
            } catch (e: any) {
              toast.error(e.message || 'Save failed');
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
          onClick={() => { setChecklistMode(!checklistMode); if (checklistMode) setChecked({}); }}
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

      {/* Pro gate for pro procedures */}
      {procedure.is_pro ? (
        <ProGate>
          <ProcedureContent quick={quick} deep={deep} weight={weight} weightKg={weightKg} setWeightKg={setWeightKg} patientWeights={patientWeights} setPatientWeights={setPatientWeights} procedure={procedure} recommendations={recommendations} t={t} resolveStr={resolveStr} getDrug={getDrug} handleCopyChecklist={handleCopyChecklist} checklistMode={checklistMode} checked={checked} setChecked={setChecked} />
        </ProGate>
      ) : (
        <ProcedureContent quick={quick} deep={deep} weight={weight} weightKg={weightKg} setWeightKg={setWeightKg} patientWeights={patientWeights} setPatientWeights={setPatientWeights} procedure={procedure} recommendations={recommendations} t={t} resolveStr={resolveStr} getDrug={getDrug} handleCopyChecklist={handleCopyChecklist} checklistMode={checklistMode} checked={checked} setChecked={setChecked} />
      )}
    </div>
  );
}

function ChecklistBulletList({ items, prefix, checklistMode, checked, setChecked }: {
  items: string[]; prefix: string; checklistMode: boolean;
  checked: Record<string, boolean>; setChecked: (v: Record<string, boolean>) => void;
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
            <span className={`text-sm ${isChecked ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>{item}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ProcedureContent({ quick, deep, weight, weightKg, setWeightKg, patientWeights, setPatientWeights, procedure, recommendations, t, resolveStr, getDrug, handleCopyChecklist, checklistMode, checked, setChecked }: any) {
  return (
    <>
      {/* Key Points card */}
      {quick && quick.preop.length > 0 && (
        <Card className="border-l-4 border-l-accent clinical-shadow">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">{t('preop')}</h3>
            <ChecklistBulletList items={quick.preop.slice(0, 3)} prefix="preop-key" checklistMode={checklistMode} checked={checked} setChecked={setChecked} />
          </CardContent>
        </Card>
      )}

      {/* Risk Alerts card */}
      {quick && quick.red_flags.length > 0 && (
        <Card className="border-l-4 border-l-clinical-danger clinical-shadow">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-clinical-danger">{t('red_flags')}</h3>
            <BulletList items={quick.red_flags} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {quick && (
        <Tabs defaultValue="preop" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="preop" className="text-xs">{t('preop')}</TabsTrigger>
            <TabsTrigger value="intraop" className="text-xs">{t('intraop')}</TabsTrigger>
            <TabsTrigger value="postop" className="text-xs">{t('postop')}</TabsTrigger>
            <TabsTrigger value="detail" className="text-xs">{t('detail')}</TabsTrigger>
          </TabsList>

          <TabsContent value="preop" className="mt-3">
            <Card className="clinical-shadow"><CardContent className="p-4">
              <Section title={t('preop')} variant="preop">
                <ChecklistBulletList items={quick.preop} prefix="preop" checklistMode={checklistMode} checked={checked} setChecked={setChecked} />
              </Section>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="intraop" className="mt-3 space-y-3">
            <Card className="clinical-shadow"><CardContent className="p-4">
              <Section title={t('intraop')} variant="intraop">
                <ChecklistBulletList items={quick.intraop} prefix="intraop" checklistMode={checklistMode} checked={checked} setChecked={setChecked} />
              </Section>
            </CardContent></Card>
            <IntubationGuide />
          </TabsContent>

          <TabsContent value="postop" className="mt-3">
            <Card className="clinical-shadow"><CardContent className="p-4">
              <Section title={t('postop')} variant="postop">
                <ChecklistBulletList items={quick.postop} prefix="postop" checklistMode={checklistMode} checked={checked} setChecked={setChecked} />
              </Section>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="detail" className="mt-3 space-y-3">
            {deep && (
              <>
                <Card className="clinical-shadow"><CardContent className="p-4">
                  <Section title={t('clinical_notes')} variant="info"><BulletList items={deep.clinical} /></Section>
                </CardContent></Card>
                <Card className="clinical-shadow"><CardContent className="p-4">
                  <Section title={t('pitfalls')} variant="redflag"><BulletList items={deep.pitfalls} /></Section>
                </CardContent></Card>
                {deep.references.length > 0 && (
                  <Card className="clinical-shadow"><CardContent className="p-4">
                    <Section title={t('references_title')} variant="info">
                      <ul className="space-y-2">
                        {deep.references.map((ref: any, i: number) => (
                          <li key={i} className="text-xs text-card-foreground">
                            <span className="font-semibold">{ref.source}</span>
                            {ref.year && <span className="text-muted-foreground"> ({ref.year})</span>}
                            {ref.note && <span className="text-muted-foreground"> — {ref.note}</span>}
                          </li>
                        ))}
                      </ul>
                    </Section>
                  </CardContent></Card>
                )}
              </>
            )}

            {recommendations.length > 0 && (
              <Card className="clinical-shadow border-l-4 border-l-clinical-info">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-sm font-bold text-clinical-info flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {t('recommendations')}
                  </h3>
                  <div className="space-y-2">
                    {recommendations.map((g: any) => (
                      <Link key={g.id} to="/guidelines" className="block rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                        <p className="text-xs font-semibold text-card-foreground">{resolveStr(g.titles)}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px]">{g.category}</Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Drugs & Doses — grouped */}
      {quick && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">{t('drugs_doses')}</h2>
          {quick.drugs.length > 0 ? (
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
              <DrugGroupedList drugs={quick.drugs} getDrug={getDrug} weight={weight} patientWeights={patientWeights} t={t} />
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

function DrugGroupedList({ drugs, getDrug, weight, patientWeights, t }: any) {
  const grouped = groupDrugs(drugs);
  const activeGroups = GROUP_ORDER.filter(g => grouped[g].length > 0);

  if (activeGroups.length <= 1) {
    // No grouping needed if all in one group
    return (
      <div className="space-y-2">
        {drugs.map((drugRef: any, i: number) => {
          const drug = getDrug(drugRef.drug_id);
          if (!drug) return null;
          return (
            <DrugDoseRow key={`${drugRef.drug_id}-${drugRef.indication_tag}-${i}`} drug={drug} indicationTag={drugRef.indication_tag} weightKg={weight} patientWeights={patientWeights} />
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeGroups.map(group => (
        <Collapsible key={group} defaultOpen={group === 'induction'}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-1.5 px-1 text-sm font-semibold text-foreground hover:text-accent transition-colors">
            <span>{t(GROUP_I18N_KEYS[group])}</span>
            <Badge variant="secondary" className="text-[10px]">{grouped[group].length}</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-1">
            {grouped[group].map((drugRef: any, i: number) => {
              const drug = getDrug(drugRef.drug_id);
              if (!drug) return null;
              return (
                <DrugDoseRow key={`${drugRef.drug_id}-${drugRef.indication_tag}-${i}`} drug={drug} indicationTag={drugRef.indication_tag} weightKg={weight} patientWeights={patientWeights} />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
