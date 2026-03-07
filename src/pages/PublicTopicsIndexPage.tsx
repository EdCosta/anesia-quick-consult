import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PUBLIC_TOPICS } from '@/lib/publicTopics';

export default function PublicTopicsIndexPage() {
  const { lang } = useLang();

  usePageMeta({
    title: lang === 'fr' ? 'Themes | AnesIA' : lang === 'pt' ? 'Temas | AnesIA' : 'Topics | AnesIA',
    description:
      lang === 'fr'
        ? 'Pages publiques par theme clinique pour l anesthesie.'
        : lang === 'pt'
          ? 'Paginas publicas por tema clinico para anestesia.'
          : 'Public pages by clinical anesthesia topic.',
    canonicalPath: '/topics',
    type: 'website',
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-6xl space-y-6 py-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 clinical-shadow sm:p-8">
          <Badge variant="secondary">
            {lang === 'fr' ? 'Themes publics' : lang === 'pt' ? 'Temas publicos' : 'Public topics'}
          </Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {lang === 'fr' ? 'Themes cliniques' : lang === 'pt' ? 'Temas clinicos' : 'Clinical topics'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {lang === 'fr'
              ? 'Pages publiques pour les themes qui tirent le plus de recherche et de valeur pratique.'
              : lang === 'pt'
                ? 'Paginas publicas para os temas com mais procura e valor pratico.'
                : 'Public pages for the topics with the strongest search intent and practical value.'}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PUBLIC_TOPICS.map((topic) => (
            <Link key={topic.slug} to={`/topics/${topic.slug}`}>
              <Card className="h-full rounded-[1.5rem] border-border/70 bg-card/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 clinical-shadow">
                <CardContent className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-foreground">{topic.label[lang]}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {topic.summary[lang]}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-accent">
                    {lang === 'fr' ? 'Voir le theme' : lang === 'pt' ? 'Ver tema' : 'View topic'}
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
