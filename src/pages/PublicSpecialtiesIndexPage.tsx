import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers3 } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { buildPublicSpecialtyPath, getSpecialtyDisplayName } from '@/lib/specialties';

export default function PublicSpecialtiesIndexPage() {
  const { lang } = useLang();
  const { procedureIndex, specialtiesData, indexLoading } = useData();

  const specialties = useMemo(() => {
    const counts = new Map<string, number>();

    for (const procedure of procedureIndex) {
      const key = procedure.specialty;
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([specialty, count]) => ({
        specialty,
        count,
        label: getSpecialtyDisplayName(specialty, specialtiesData, lang),
        path: buildPublicSpecialtyPath(specialty, specialtiesData),
      }));
  }, [lang, procedureIndex, specialtiesData]);

  const description =
    lang === 'fr'
      ? 'Index public des specialites anesthesiques avec procedures et checklists cliniques.'
      : lang === 'pt'
        ? 'Indice publico das especialidades anestesicas com procedimentos e checklists clinicas.'
        : 'Public index of anesthesia specialties with procedures and clinical checklists.';

  usePageMeta({
    title:
      lang === 'fr'
        ? 'Specialites | AnesIA'
        : lang === 'pt'
          ? 'Especialidades | AnesIA'
          : 'Specialties | AnesIA',
    description,
    canonicalPath: '/specialties',
    type: 'website',
  });

  if (indexLoading && procedureIndex.length === 0) {
    return (
      <div className="container max-w-6xl py-10">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Chargement...' : lang === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-6xl space-y-6 py-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 clinical-shadow sm:p-8">
          <Badge variant="secondary">
            {lang === 'fr' ? 'Index public' : lang === 'pt' ? 'Indice publico' : 'Public index'}
          </Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {lang === 'fr'
              ? 'Specialites'
              : lang === 'pt'
                ? 'Especialidades'
                : 'Specialties'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-foreground">
            <Layers3 className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">
              {specialties.length}{' '}
              {lang === 'fr'
                ? 'specialites indexees'
                : lang === 'pt'
                  ? 'especialidades indexadas'
                  : 'indexed specialties'}
            </span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {specialties.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="h-full rounded-[1.5rem] border-border/70 bg-card/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 clinical-shadow">
                <CardContent className="p-5">
                  <Badge variant="secondary">{item.count}</Badge>
                  <h2 className="mt-3 text-lg font-semibold text-foreground">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {lang === 'fr'
                      ? `${item.count} procedures accessibles en navigation publique.`
                      : lang === 'pt'
                        ? `${item.count} procedimentos acessiveis em navegacao publica.`
                        : `${item.count} procedures available in public navigation.`}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-accent">
                    {lang === 'fr'
                      ? 'Voir la specialite'
                      : lang === 'pt'
                        ? 'Ver especialidade'
                        : 'View specialty'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
