import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ExternalLink, Target } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StructuredContentList from '@/components/anesia/StructuredContentList';
import { trackEvent } from '@/lib/analytics';
import { buildPublicALRPath } from '@/lib/contentSeo';

export default function PublicALRPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { lang, resolve, resolveStr, t } = useLang();
  const { alrBlocks, loading } = useData();
  const block = alrBlocks.find((item) => item.id === id);
  const title = block ? resolveStr(block.titles) : 'ALR block';
  const canonicalPath = block ? buildPublicALRPath(block.id, title) : undefined;
  const description = block
    ? lang === 'fr'
      ? `${title}. Bloc ALR public avec indications, contre-indications, technique et drugs.`
      : lang === 'pt'
        ? `${title}. Bloco ALR publico com indicacoes, contraindicacoes, tecnica e fármacos.`
        : `${title}. Public regional anesthesia block with indications, contraindications, technique, and drugs.`
    : 'Regional block';

  usePageMeta({
    title: `${title} | AnesIA`,
    description,
    canonicalPath,
    type: 'article',
  });

  useEffect(() => {
    if (!block) return;
    trackEvent('public_alr_view', { blockId: block.id, region: block.region });
  }, [block]);

  const relatedBlocks = useMemo(() => {
    if (!block) return [];
    return alrBlocks.filter((item) => item.id !== block.id && item.region === block.region).slice(0, 4);
  }, [alrBlocks, block]);

  if (loading && !block) {
    return (
      <div className="container max-w-4xl py-10">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Chargement...' : lang === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="container max-w-4xl py-10">
        <Card className="clinical-shadow">
          <CardContent className="space-y-3 p-6">
            <p className="text-lg font-semibold text-foreground">
              {lang === 'fr'
                ? 'Bloc ALR introuvable'
                : lang === 'pt'
                  ? 'Bloco ALR nao encontrado'
                  : 'ALR block not found'}
            </p>
            <Link to="/topics/alr" className="text-sm text-primary hover:underline">
              {lang === 'fr' ? 'Voir ALR' : lang === 'pt' ? 'Ver ALR' : 'View ALR'}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const indications = resolve<string[]>(block.indications) ?? [];
  const contraindications = resolve<string[]>(block.contraindications) ?? [];
  const technique = resolve<string[]>(block.technique) ?? [];
  const drugs = resolve<string[]>(block.drugs) ?? [];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-5xl space-y-6 py-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 clinical-shadow sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{block.region}</Badge>
            <Badge variant="outline">ALR</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/alr">
                {t('alr_full')}
                <ArrowRight className="ml-2 h-4 w-4" />
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

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="clinical-shadow">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground">{t('indications')}</h2>
              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                <StructuredContentList items={indications} tone="success" />
              </div>
            </CardContent>
          </Card>
          <Card className="clinical-shadow">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground">{t('contraindications_alr')}</h2>
              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                <StructuredContentList items={contraindications} tone="danger" />
              </div>
            </CardContent>
          </Card>
          <Card className="clinical-shadow">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground">{t('technique')}</h2>
              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                <StructuredContentList items={technique} tone="warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="clinical-shadow">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground">{t('drugs_alr')}</h2>
              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                <StructuredContentList items={drugs} tone="info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {relatedBlocks.length > 0 && (
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                {lang === 'fr' ? 'Blocs lies' : lang === 'pt' ? 'Bloqueios relacionados' : 'Related blocks'}
              </h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedBlocks.map((item) => {
                const itemTitle = resolveStr(item.titles);
                return (
                  <Link
                    key={item.id}
                    to={buildPublicALRPath(item.id, itemTitle)}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4 transition-colors hover:border-accent/40"
                  >
                    <p className="text-sm font-semibold text-foreground">{itemTitle}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {(resolve<string[]>(item.indications) ?? []).slice(0, 1).join(' ')}
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
