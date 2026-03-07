import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, ExternalLink } from 'lucide-react';
import ShareButton from '@/components/anesia/ShareButton';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StructuredContentList from '@/components/anesia/StructuredContentList';
import { trackEvent } from '@/lib/analytics';
import { buildPublicProtocolPath } from '@/lib/contentSeo';

export default function PublicProtocolPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { lang, resolve, resolveStr, t } = useLang();
  const { protocoles, loading } = useData();
  const protocol = protocoles.find((item) => item.id === id);
  const title = protocol ? resolveStr(protocol.titles) : 'Protocol';
  const steps = protocol ? resolve<string[]>(protocol.steps) ?? [] : [];
  const canonicalPath = protocol ? buildPublicProtocolPath(protocol.id, title) : undefined;
  const description = protocol
    ? lang === 'fr'
      ? `${title}. Protocole public d anesthesie avec etapes et references.`
      : lang === 'pt'
        ? `${title}. Protocolo publico de anestesia com passos e referencias.`
        : `${title}. Public anesthesia protocol with steps and references.`
    : 'Protocol';

  usePageMeta({
    title: `${title} | AnesIA`,
    description,
    canonicalPath,
    type: 'article',
  });

  useEffect(() => {
    if (!protocol) return;
    trackEvent('public_protocol_view', {
      protocolId: protocol.id,
      category: protocol.category,
    });
  }, [protocol]);

  const relatedProtocols = useMemo(() => {
    if (!protocol) return [];
    return protocoles
      .filter((item) => item.id !== protocol.id && item.category === protocol.category)
      .slice(0, 4);
  }, [protocol, protocoles]);

  if (loading && !protocol) {
    return (
      <div className="container max-w-4xl py-10">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Chargement...' : lang === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="container max-w-4xl py-10">
        <Card className="clinical-shadow">
          <CardContent className="space-y-3 p-6">
            <p className="text-lg font-semibold text-foreground">
              {lang === 'fr'
                ? 'Protocole introuvable'
                : lang === 'pt'
                  ? 'Protocolo nao encontrado'
                  : 'Protocol not found'}
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
      <div className="container max-w-5xl space-y-6 py-8">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 clinical-shadow sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{protocol.category}</Badge>
            {protocol.source && <Badge variant="outline">{protocol.source}</Badge>}
            {protocol.evidence_grade && <Badge variant="outline">E{protocol.evidence_grade}</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/protocoles">
                {t('protocoles')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">
                {lang === 'fr' ? 'Voir Pro' : lang === 'pt' ? 'Ver Pro' : 'View Pro'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <ShareButton title={title} />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">{t('protocoles')}</h2>
          </div>
          <div className="mt-4 text-sm leading-6 text-muted-foreground">
            <StructuredContentList items={steps} ordered tone="info" />
          </div>
          {protocol.references.length > 0 && (
            <div className="mt-5 border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('references_label')}
              </p>
              <div className="mt-3 space-y-2">
                {protocol.references.map((ref, index) => {
                  const meta = [ref.year ? String(ref.year) : null, ref.note, ref.doi, ref.pmid]
                    .filter(Boolean)
                    .join(' • ');

                  return (
                    <p key={`${ref.source}-${index}`} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{ref.source}</span>
                      {meta && <span>{` — ${meta}`}</span>}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {relatedProtocols.length > 0 && (
          <section className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {lang === 'fr'
                ? 'Protocoles lies'
                : lang === 'pt'
                  ? 'Protocolos relacionados'
                  : 'Related protocols'}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedProtocols.map((item) => {
                const itemTitle = resolveStr(item.titles);
                return (
                  <Link
                    key={item.id}
                    to={buildPublicProtocolPath(item.id, itemTitle)}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4 transition-colors hover:border-accent/40"
                  >
                    <p className="text-sm font-semibold text-foreground">{itemTitle}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {(resolve<string[]>(item.steps) ?? []).slice(0, 1).join(' ')}
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
