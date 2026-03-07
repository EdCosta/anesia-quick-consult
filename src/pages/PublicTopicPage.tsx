import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ExternalLink, FileText, ShieldPlus, Stethoscope } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trackEvent } from '@/lib/analytics';
import { PUBLIC_TOPICS, getPublicTopic } from '@/lib/publicTopics';
import { buildPublicALRPath, buildPublicGuidelinePath, buildPublicProtocolPath } from '@/lib/contentSeo';
import { buildPublicProcedurePath } from '@/lib/procedureSeo';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function PublicTopicPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { lang, resolve, resolveStr } = useLang();
  const { procedureIndex, guidelines, protocoles, alrBlocks, loading } = useData();
  const topic = getPublicTopic(slug);

  const tokenSet = useMemo(() => new Set((topic?.tokens || []).map((token) => normalize(token))), [topic]);

  const procedures = useMemo(() => {
    if (!topic) return [];

    return procedureIndex.filter((procedure) => {
      const title = resolveStr(procedure.titles);
      const tags = procedure.tags || [];
      const synonyms = Object.values(procedure.synonyms || {}).flat();
      const haystack = [title, procedure.specialty, ...tags, ...synonyms].map(normalize);
      return haystack.some((entry) => [...tokenSet].some((token) => entry.includes(token)));
    });
  }, [procedureIndex, resolveStr, tokenSet, topic]);

  const relatedGuidelines = useMemo(() => {
    if (!topic) return [];

    return guidelines.filter((guideline) => {
      const title = resolveStr(guideline.titles);
      const entries = [title, guideline.category, guideline.source || '', ...(guideline.tags || [])].map(
        normalize,
      );
      return entries.some((entry) => [...tokenSet].some((token) => entry.includes(token)));
    });
  }, [guidelines, resolveStr, tokenSet, topic]);

  const relatedProtocols = useMemo(() => {
    if (!topic) return [];

    return protocoles.filter((protocol) => {
      const title = resolveStr(protocol.titles);
      const entries = [title, protocol.category, protocol.source || '', ...(protocol.tags || [])].map(
        normalize,
      );
      return entries.some((entry) => [...tokenSet].some((token) => entry.includes(token)));
    });
  }, [protocoles, resolveStr, tokenSet, topic]);

  const relatedAlr = useMemo(() => {
    if (!topic) return [];
    if (topic.slug === 'alr') return alrBlocks.slice(0, 6);

    return alrBlocks.filter((block) => {
      const title = resolveStr(block.titles);
      const entries = [title, block.region, ...(block.tags || [])].map(normalize);
      return entries.some((entry) => [...tokenSet].some((token) => entry.includes(token)));
    });
  }, [alrBlocks, resolveStr, tokenSet, topic]);

  usePageMeta({
    title: topic ? `${topic.label[lang]} | AnesIA` : 'Topic | AnesIA',
    description: topic?.summary[lang] || 'Clinical topic',
    canonicalPath: topic ? `/topics/${topic.slug}` : undefined,
    type: 'website',
  });

  useEffect(() => {
    if (!topic) return;
    trackEvent('public_topic_view', {
      topic: topic.slug,
      procedures: procedures.length,
      guidelines: relatedGuidelines.length,
      protocols: relatedProtocols.length,
      alr: relatedAlr.length,
    });
  }, [procedures.length, relatedAlr.length, relatedGuidelines.length, relatedProtocols.length, topic]);

  if (loading && !topic) {
    return (
      <div className="container max-w-5xl py-10">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Chargement...' : lang === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container max-w-4xl py-10">
        <Card className="clinical-shadow">
          <CardContent className="space-y-3 p-6">
            <p className="text-lg font-semibold text-foreground">
              {lang === 'fr' ? 'Theme introuvable' : lang === 'pt' ? 'Tema nao encontrado' : 'Topic not found'}
            </p>
            <Link to="/topics" className="text-sm text-primary hover:underline">
              {lang === 'fr' ? 'Voir les themes' : lang === 'pt' ? 'Ver temas' : 'View topics'}
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
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{topic.label[lang]}</Badge>
            <Badge variant="outline">{PUBLIC_TOPICS.length} topics</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {topic.label[lang]}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {topic.summary[lang]}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Procedures</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{procedures.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Guidelines</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{relatedGuidelines.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Protocols</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{relatedProtocols.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">ALR</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{relatedAlr.length}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/">
                {lang === 'fr' ? 'Ouvrir l app' : lang === 'pt' ? 'Abrir a app' : 'Open app'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/topics">
                {lang === 'fr' ? 'Tous les themes' : lang === 'pt' ? 'Todos os temas' : 'All topics'}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">
                {lang === 'fr' ? 'Voir Pro' : lang === 'pt' ? 'Ver Pro' : 'View Pro'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {procedures.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                {lang === 'fr' ? 'Procedures liees' : lang === 'pt' ? 'Procedimentos relacionados' : 'Related procedures'}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {procedures.slice(0, 6).map((procedure) => {
                const title = resolveStr(procedure.titles);
                const snippet = resolve(procedure.quick)?.preop?.[0] || '';
                return (
                  <Link
                    key={procedure.id}
                    to={buildPublicProcedurePath(procedure.id, title)}
                    className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow transition-all hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-3">{snippet}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {(relatedGuidelines.length > 0 || relatedProtocols.length > 0 || relatedAlr.length > 0) && (
          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-[1.5rem] border-border/70 bg-card/80 clinical-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <h2 className="text-base font-semibold text-foreground">Guidelines</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {relatedGuidelines.slice(0, 4).map((guideline) => (
                    <Link
                      key={guideline.id}
                      to={
                        guideline.id === 'antibioprophylaxie'
                          ? '/guidelines/antibioprophylaxie'
                          : buildPublicGuidelinePath(guideline.id, resolveStr(guideline.titles))
                      }
                      className="block rounded-xl border border-border/70 bg-background/80 p-3 transition-colors hover:border-accent/40"
                    >
                      <p className="text-sm font-semibold text-foreground">{resolveStr(guideline.titles)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{guideline.category}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border-border/70 bg-card/80 clinical-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <ShieldPlus className="h-4 w-4 text-accent" />
                  <h2 className="text-base font-semibold text-foreground">Protocols</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {relatedProtocols.slice(0, 4).map((protocol) => (
                    <Link
                      key={protocol.id}
                      to={buildPublicProtocolPath(protocol.id, resolveStr(protocol.titles))}
                      className="block rounded-xl border border-border/70 bg-background/80 p-3 transition-colors hover:border-accent/40"
                    >
                      <p className="text-sm font-semibold text-foreground">{resolveStr(protocol.titles)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{protocol.category}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border-border/70 bg-card/80 clinical-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-accent" />
                  <h2 className="text-base font-semibold text-foreground">ALR</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {relatedAlr.slice(0, 4).map((block) => (
                    <Link
                      key={block.id}
                      to={buildPublicALRPath(block.id, resolveStr(block.titles))}
                      className="block rounded-xl border border-border/70 bg-background/80 p-3 transition-colors hover:border-accent/40"
                    >
                      <p className="text-sm font-semibold text-foreground">{resolveStr(block.titles)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{block.region}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
