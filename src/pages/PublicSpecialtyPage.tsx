import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ExternalLink, Layers3, ListChecks } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  buildPublicSpecialtyPath,
  findSpecialtyBySlug,
  getSpecialtyDisplayName,
  specialtyMatchesSlug,
} from '@/lib/specialties';
import { buildPublicProcedurePath } from '@/lib/procedureSeo';
import { trackEvent } from '@/lib/analytics';

export default function PublicSpecialtyPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { lang, resolveStr } = useLang();
  const { procedureIndex, specialtiesData, indexLoading } = useData();

  const fallbackSpecialties = useMemo(
    () => Array.from(new Set(procedureIndex.map((procedure) => procedure.specialty).filter(Boolean))),
    [procedureIndex],
  );

  const specialtyMatch = useMemo(
    () => findSpecialtyBySlug(slug, specialtiesData, fallbackSpecialties),
    [fallbackSpecialties, slug, specialtiesData],
  );

  const procedures = useMemo(
    () =>
      procedureIndex
        .filter((procedure) =>
          specialtyMatchesSlug(procedure.specialty, specialtyMatch, specialtiesData),
        )
        .sort((left, right) => resolveStr(left.titles).localeCompare(resolveStr(right.titles))),
    [procedureIndex, resolveStr, specialtyMatch, specialtiesData],
  );

  const displayName = specialtyMatch
    ? getSpecialtyDisplayName(specialtyMatch.label, specialtiesData, lang) || specialtyMatch.label
    : '';
  const canonicalPath = specialtyMatch
    ? buildPublicSpecialtyPath(specialtyMatch.label, specialtiesData)
    : undefined;
  const description = displayName
    ? lang === 'fr'
      ? `Procedures d anesthesie en ${displayName}. Acces public par specialite avec checklists et liens directs.`
      : lang === 'pt'
        ? `Procedimentos de anestesia em ${displayName}. Acesso publico por especialidade com checklists e links diretos.`
        : `Anesthesia procedures in ${displayName}. Public specialty hub with checklists and direct links.`
    : 'Specialty procedures';

  usePageMeta({
    title: displayName ? `${displayName} | AnesIA` : 'Specialty | AnesIA',
    description,
    canonicalPath,
    type: 'website',
  });

  useEffect(() => {
    if (!specialtyMatch) return;
    trackEvent('public_specialty_view', {
      specialty: specialtyMatch.id,
      procedures: procedures.length,
    });
  }, [procedures.length, specialtyMatch]);

  useEffect(() => {
    if (!specialtyMatch || !canonicalPath) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: displayName,
      description,
      url: new URL(canonicalPath, window.location.origin).toString(),
      numberOfItems: procedures.length,
      inLanguage: lang,
      publisher: {
        '@type': 'Organization',
        name: 'AnesIA',
      },
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [canonicalPath, description, displayName, lang, procedures.length, specialtyMatch]);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();

    for (const procedure of procedures) {
      for (const tag of procedure.tags.slice(0, 5)) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [procedures]);

  if (indexLoading && procedureIndex.length === 0) {
    return (
      <div className="container max-w-5xl py-10">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Chargement...' : lang === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!specialtyMatch || procedures.length === 0) {
    return (
      <div className="container max-w-4xl py-10">
        <Card className="clinical-shadow">
          <CardContent className="space-y-3 p-6">
            <p className="text-lg font-semibold text-foreground">
              {lang === 'fr'
                ? 'Specialite introuvable'
                : lang === 'pt'
                  ? 'Especialidade nao encontrada'
                  : 'Specialty not found'}
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
      <div className="container max-w-6xl space-y-6 py-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 clinical-shadow sm:p-8">
          <Badge variant="secondary">{displayName}</Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {displayName}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {lang === 'fr' ? 'Procedures' : lang === 'pt' ? 'Procedimentos' : 'Procedures'}
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-foreground">
                <Layers3 className="h-5 w-5 text-accent" />
                {procedures.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {lang === 'fr' ? 'Contenu Pro' : lang === 'pt' ? 'Conteudo Pro' : 'Pro content'}
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {procedures.filter((procedure) => procedure.is_pro).length}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {lang === 'fr' ? 'Themes' : lang === 'pt' ? 'Temas' : 'Topics'}
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-foreground">
                <ListChecks className="h-5 w-5 text-accent" />
                {topTags.length}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/">
                {lang === 'fr' ? 'Ouvrir l app' : lang === 'pt' ? 'Abrir a app' : 'Open app'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                to="/pricing"
                onClick={() =>
                  trackEvent('public_specialty_cta_click', {
                    specialty: specialtyMatch.id,
                    target: 'pricing',
                  })
                }
              >
                {lang === 'fr' ? 'Voir Pro' : lang === 'pt' ? 'Ver Pro' : 'View Pro'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {topTags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {topTags.map((tag) => (
                <Badge key={tag} variant="outline" className="border-border/70">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {procedures.map((procedure) => {
            const title = resolveStr(procedure.titles);
            const summary = procedure.quick[lang]?.preop?.[0] || procedure.quick.fr?.preop?.[0] || '';

            return (
              <Link
                key={procedure.id}
                to={buildPublicProcedurePath(procedure.id, title)}
                className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow transition-all hover:-translate-y-0.5 hover:border-accent/40"
                onClick={() =>
                  trackEvent('public_specialty_procedure_click', {
                    specialty: specialtyMatch.id,
                    procedureId: procedure.id,
                  })
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{displayName}</Badge>
                  {procedure.is_pro && (
                    <Badge variant="outline" className="border-accent text-accent">
                      PRO
                    </Badge>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-semibold leading-tight text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-3">
                  {summary}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-accent">
                  {lang === 'fr'
                    ? 'Voir la fiche'
                    : lang === 'pt'
                      ? 'Ver a ficha'
                      : 'View overview'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
