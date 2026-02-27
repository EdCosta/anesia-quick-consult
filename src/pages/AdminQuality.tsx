import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Languages, Pill, Tags } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function AdminQuality() {
  const { t, resolve } = useLang();
  const { procedures, drugs, guidelines } = useData();
  const [missingTranslations, setMissingTranslations] = useState<Array<{ proc: string; lang: 'en' | 'pt' }>>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [{ data: procedureRows, error: procError }, { data: translationRows, error: transError }] = await Promise.all([
          supabase.from('procedures' as any).select('id, titles, content'),
          supabase.from('procedure_translations' as any).select('procedure_id, lang, section'),
        ]);

        if (procError) throw procError;
        if (transError) throw transError;
        if (!active) return;

        const translationKeys = new Set(
          ((translationRows as any[]) || [])
            .filter((row) => row.section === 'quick')
            .map((row) => `${row.procedure_id}:${row.lang}`)
        );

        const gaps: Array<{ proc: string; lang: 'en' | 'pt' }> = [];
        for (const row of (procedureRows as any[]) || []) {
          for (const lang of ['en', 'pt'] as const) {
            const hasInlineQuick = !!row.content?.quick?.[lang];
            const hasPersistedQuick = translationKeys.has(`${row.id}:${lang}`);
            if (!hasInlineQuick && !hasPersistedQuick) {
              gaps.push({ proc: row.id, lang });
            }
          }
        }

        setMissingTranslations(gaps);
      } catch {
        if (!active) return;

        const fallbackGaps: Array<{ proc: string; lang: 'en' | 'pt' }> = [];
        for (const procedure of procedures) {
          for (const lang of ['en', 'pt'] as const) {
            const quick = procedure.quick[lang];
            const sameAsFrench = JSON.stringify(quick) === JSON.stringify(procedure.quick.fr);
            if (sameAsFrench) fallbackGaps.push({ proc: procedure.id, lang });
          }
        }
        setMissingTranslations(fallbackGaps);
      }
    })();

    return () => {
      active = false;
    };
  }, [procedures]);

  const issues = useMemo(() => {
    const noDrugs: string[] = [];
    const missingInfo: { proc: string; drug: string }[] = [];

    for (const p of procedures) {
      const quick = resolve(p.quick);
      if (!quick || !quick.drugs || quick.drugs.length === 0) {
        noDrugs.push(p.id);
        continue;
      }
      for (const dr of quick.drugs) {
        if (!dr.indication_tag) {
          missingInfo.push({ proc: p.id, drug: dr.drug_id });
        }
      }
    }

    const drugsNoDosing: string[] = [];
    const drugsNoUnits: { drug: string; indication: string }[] = [];
    for (const d of drugs) {
      if (!d.dose_rules || d.dose_rules.length === 0) {
        drugsNoDosing.push(d.id);
        continue;
      }

      for (const rule of d.dose_rules) {
        if (rule.mg_per_kg == null && !rule.unit_override) {
          drugsNoUnits.push({ drug: d.id, indication: rule.indication_tag });
        }
      }
    }

    const guidelinesNoTags = guidelines
      .filter((guideline) => guideline.tags.length === 0)
      .map((guideline) => guideline.id);

    return { noDrugs, missingInfo, drugsNoDosing, drugsNoUnits, guidelinesNoTags };
  }, [procedures, drugs, guidelines, resolve]);

  return (
    <div className="container max-w-2xl space-y-5 py-6">
      <Link to="/admin-content" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" />{t('back')}
      </Link>

      <h1 className="text-xl font-bold text-foreground">{t('quality_dashboard')}</h1>

      <Card className="clinical-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Pill className="h-4 w-4 text-destructive" />
            {t('missing_drugs')}
            <Badge variant="destructive" className="text-[10px]">{issues.noDrugs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {issues.noDrugs.length === 0 ? (
            <p className="text-sm text-muted-foreground">✅ {t('no_results')}</p>
          ) : (
            <ul className="space-y-1">
              {issues.noDrugs.map(id => (
                <li key={id}>
                  <Link to={`/p/${id}`} className="text-sm text-accent hover:underline">{id}</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="clinical-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            {t('missing_units')}
            <Badge variant="secondary" className="text-[10px]">{issues.missingInfo.length + issues.drugsNoDosing.length + issues.drugsNoUnits.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {issues.drugsNoDosing.map(id => (
            <p key={id} className="text-sm text-muted-foreground">
              Drug: <span className="font-medium text-foreground">{id}</span> — no dosing rules
            </p>
          ))}
          {issues.missingInfo.map((m, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              <Link to={`/p/${m.proc}`} className="text-accent hover:underline">{m.proc}</Link>
              {' → '}<span className="font-medium text-foreground">{m.drug}</span>
            </p>
          ))}
          {issues.drugsNoUnits.map((item, i) => (
            <p key={`${item.drug}-${item.indication}-${i}`} className="text-sm text-muted-foreground">
              Drug: <span className="font-medium text-foreground">{item.drug}</span> — missing unit for <span className="font-medium text-foreground">{item.indication}</span>
            </p>
          ))}
          {issues.drugsNoDosing.length === 0 && issues.missingInfo.length === 0 && issues.drugsNoUnits.length === 0 && (
            <p className="text-sm text-muted-foreground">✅ {t('no_results')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="clinical-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Languages className="h-4 w-4 text-accent" />
            Missing quick translations
            <Badge variant="secondary" className="text-[10px]">{missingTranslations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {missingTranslations.map((item, i) => (
            <p key={`${item.proc}-${item.lang}-${i}`} className="text-sm text-muted-foreground">
              <Link to={`/p/${item.proc}`} className="text-accent hover:underline">{item.proc}</Link>
              {' → '}<span className="font-medium text-foreground">{item.lang.toUpperCase()}</span>
            </p>
          ))}
          {missingTranslations.length === 0 && (
            <p className="text-sm text-muted-foreground">✅ {t('no_results')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="clinical-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tags className="h-4 w-4 text-accent" />
            Guidelines without tags
            <Badge variant="secondary" className="text-[10px]">{issues.guidelinesNoTags.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {issues.guidelinesNoTags.map((id) => (
            <p key={id} className="text-sm text-muted-foreground">
              <Link to="/guidelines" className="text-accent hover:underline">{id}</Link>
            </p>
          ))}
          {issues.guidelinesNoTags.length === 0 && (
            <p className="text-sm text-muted-foreground">✅ {t('no_results')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
