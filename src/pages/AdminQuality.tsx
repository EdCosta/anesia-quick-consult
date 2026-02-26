import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Pill } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminQuality() {
  const { t, resolve } = useLang();
  const { procedures, drugs } = useData();

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
    for (const d of drugs) {
      if (!d.dose_rules || d.dose_rules.length === 0) {
        drugsNoDosing.push(d.id);
      }
    }

    return { noDrugs, missingInfo, drugsNoDosing };
  }, [procedures, drugs, resolve]);

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
            <Badge variant="secondary" className="text-[10px]">{issues.missingInfo.length + issues.drugsNoDosing.length}</Badge>
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
          {issues.drugsNoDosing.length === 0 && issues.missingInfo.length === 0 && (
            <p className="text-sm text-muted-foreground">✅ {t('no_results')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
