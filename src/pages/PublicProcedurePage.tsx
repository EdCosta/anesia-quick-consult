import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock3, ExternalLink, ShieldAlert } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BulletList } from '@/components/anesia/Section';
import { buildPublicSpecialtyPath, getSpecialtyDisplayName } from '@/lib/specialties';
import { buildPublicProcedurePath } from '@/lib/procedureSeo';
import { trackEvent } from '@/lib/analytics';

function estimateReadingMinutesFromQuick(itemCount: number) {
  return Math.max(1, Math.round(itemCount / 5));
}

export default function PublicProcedurePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { lang, resolve, resolveStr } = useLang();
  const { getProcedure, procedureIndex, specialtiesData, loading } = useData();
  const procedure = getProcedure(id);
  const title = procedure ? resolveStr(procedure.titles) : 'Procedure';
  const quick = procedure ? resolve(procedure.quick) : null;
  const deep = procedure ? resolve(procedure.deep) : null;
  const specialtyLabel = procedure
    ? getSpecialtyDisplayName(procedure.specialty, specialtiesData, lang)
    : '';
  const specialtyPath = procedure
    ? buildPublicSpecialtyPath(procedure.specialty, specialtiesData)
    : undefined;
  const checklistCount = quick
    ? quick.preop.length + quick.intraop.length + quick.postop.length + quick.red_flags.length
    : 0;
  const canonicalPath = procedure ? buildPublicProcedurePath(procedure.id, title) : undefined;
  const description = procedure
    ? lang === 'fr'
      ? `${title} en ${specialtyLabel}. Apercu public avec checklist, red flags et points cliniques.`
      : lang === 'pt'
        ? `${title} em ${specialtyLabel}. Preview publica com checklist, red flags e pontos clinicos.`
        : `${title} in ${specialtyLabel}. Public preview with checklist, red flags, and key clinical points.`
    : 'Procedure preview';

  usePageMeta({
    title: `${title} | AnesIA`,
    description,
    canonicalPath,
    type: 'article',
  });

  useEffect(() => {
    if (!procedure) return;
    trackEvent('public_procedure_view', { procedureId: procedure.id, specialty: procedure.specialty });
  }, [procedure]);

  useEffect(() => {
    if (!procedure || !canonicalPath) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: title,
      description,
      url: new URL(canonicalPath, window.location.origin).toString(),
      about: {
        '@type': 'MedicalProcedure',
        name: title,
      },
      inLanguage: lang,
      publisher: {
        '@type': 'Organization',
        name: 'AnesIA',
      },
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [canonicalPath, description, lang, procedure, title]);

  const clinicalHighlights = useMemo(() => {
    if (!deep) return [];
    return deep.clinical.slice(0, 4);
  }, [deep]);

  const relatedProcedures = useMemo(() => {
    if (!procedure) return [];

    return procedureIndex
      .filter(
        (candidate) => candidate.id !== procedure.id && candidate.specialty === procedure.specialty,
      )
      .slice(0, 4);
  }, [procedure, procedureIndex]);

  if (loading && !procedure) {
    return (
      <div className="container max-w-4xl py-10">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Chargement...' : lang === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!procedure || !quick) {
    return (
      <div className="container max-w-4xl py-10">
        <Card className="clinical-shadow">
          <CardContent className="space-y-3 p-6">
            <p className="text-lg font-semibold text-foreground">
              {lang === 'fr'
                ? 'Procedure introuvable'
                : lang === 'pt'
                  ? 'Procedimento nao encontrado'
                  : 'Procedure not found'}
            </p>
            <Link to="/" className="text-sm text-primary hover:underline">
              {lang === 'fr' ? 'Retour' : lang === 'pt' ? 'Voltar' : 'Back'}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-5xl space-y-6 py-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 clinical-shadow sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {specialtyPath ? (
              <Link to={specialtyPath} className="inline-flex">
                <Badge variant="secondary" className="transition-colors hover:bg-secondary/80">
                  {specialtyLabel}
                </Badge>
              </Link>
            ) : (
              <Badge variant="secondary">{specialtyLabel}</Badge>
            )}
            {procedure.is_pro && (
              <Badge variant="outline" className="border-accent text-accent">
                PRO
              </Badge>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {lang === 'fr' ? 'Checklist' : lang === 'pt' ? 'Checklist' : 'Checklist'}
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{checklistCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {lang === 'fr' ? 'Lecture' : lang === 'pt' ? 'Leitura' : 'Reading'}
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-foreground">
                <Clock3 className="h-5 w-5 text-accent" />
                {estimateReadingMinutesFromQuick(checklistCount)} min
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {lang === 'fr' ? 'Mise a jour' : lang === 'pt' ? 'Atualizacao' : 'Updated'}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {procedure.updated_at ? new Date(procedure.updated_at).toLocaleDateString(lang) : '—'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link
                to={`/p/${procedure.id}`}
                onClick={() =>
                  trackEvent('public_procedure_cta_click', {
                    procedureId: procedure.id,
                    target: 'app_procedure',
                  })
                }
              >
                {lang === 'fr' ? 'Ouvrir dans l app' : lang === 'pt' ? 'Abrir na app' : 'Open in app'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/specialties">
                {lang === 'fr'
                  ? 'Toutes les specialites'
                  : lang === 'pt'
                    ? 'Todas as especialidades'
                    : 'All specialties'}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                to="/pro/checkout"
                onClick={() =>
                  trackEvent('public_procedure_cta_click', {
                    procedureId: procedure.id,
                    target: 'pro_checkout',
                  })
                }
              >
                {lang === 'fr' ? 'Debloquer Pro' : lang === 'pt' ? 'Desbloquear Pro' : 'Unlock Pro'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {lang === 'fr' ? 'Preop' : lang === 'pt' ? 'Pre-op' : 'Preop'}
            </h2>
            <div className="mt-3 text-sm leading-6 text-muted-foreground">
              <BulletList items={quick.preop} />
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {lang === 'fr' ? 'Intraop' : lang === 'pt' ? 'Intra-op' : 'Intraop'}
            </h2>
            <div className="mt-3 text-sm leading-6 text-muted-foreground">
              <BulletList items={quick.intraop} />
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {lang === 'fr' ? 'Postop' : lang === 'pt' ? 'Pos-op' : 'Postop'}
            </h2>
            <div className="mt-3 text-sm leading-6 text-muted-foreground">
              <BulletList items={quick.postop} />
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-destructive/20 bg-card/80 p-5 clinical-shadow sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Red flags
            </h2>
            <div className="mt-3 text-sm leading-6 text-muted-foreground">
              <BulletList items={quick.red_flags} />
            </div>
          </section>
        </div>

        {clinicalHighlights.length > 0 && (
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {lang === 'fr' ? 'Points cliniques' : lang === 'pt' ? 'Pontos clinicos' : 'Clinical highlights'}
            </h2>
            <div className="mt-3 text-sm leading-6 text-muted-foreground">
              <BulletList items={clinicalHighlights} />
            </div>
          </section>
        )}

        {relatedProcedures.length > 0 && (
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                {lang === 'fr'
                  ? 'Procedures liees'
                  : lang === 'pt'
                    ? 'Procedimentos relacionados'
                    : 'Related procedures'}
              </h2>
              {specialtyPath && (
                <Link to={specialtyPath} className="text-sm font-medium text-accent hover:underline">
                  {lang === 'fr'
                    ? 'Voir la specialite'
                    : lang === 'pt'
                      ? 'Ver especialidade'
                      : 'View specialty'}
                </Link>
              )}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedProcedures.map((candidate) => {
                const candidateTitle = resolveStr(candidate.titles);

                return (
                  <Link
                    key={candidate.id}
                    to={buildPublicProcedurePath(candidate.id, candidateTitle)}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4 transition-colors hover:border-accent/40"
                    onClick={() =>
                      trackEvent('public_related_procedure_click', {
                        procedureId: procedure.id,
                        relatedProcedureId: candidate.id,
                      })
                    }
                  >
                    <p className="text-sm font-semibold text-foreground">{candidateTitle}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-3">
                      {candidate.quick[lang]?.preop?.[0] || candidate.quick.fr?.preop?.[0] || ''}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
