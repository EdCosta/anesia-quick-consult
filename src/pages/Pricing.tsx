import { Link } from 'react-router-dom';
import { Check, Crown } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import PublicPage from '@/components/anesia/PublicPage';
import { trackEvent } from '@/lib/analytics';

export default function Pricing() {
  const { lang } = useLang();

  const copy =
    lang === 'fr'
      ? {
          eyebrow: 'AnesIA',
          title: 'Un plan simple, avec un vrai apercu avant de payer.',
          description:
            'Le mode gratuit doit laisser comprendre la valeur. Le mode Pro debloque les guidelines, protocoles, ALR, personnalisation et contexte hopital.',
          free: 'Gratuit',
          pro: 'Pro',
          freeItems: ['Recherche d interventions', 'Favoris et recents', 'Calculateurs essentiels'],
          proItems: [
            'Guidelines avec references',
            'Protocoles et ALR complets',
            'Mode Pro et contexte hopital',
            'Assistant IA contextualise',
          ],
          cta: 'Voir mon compte',
        }
      : lang === 'pt'
        ? {
            eyebrow: 'AnesIA',
            title: 'Um plano simples, com preview real antes de pagar.',
            description:
              'O modo gratuito deve mostrar valor suficiente. O modo Pro desbloqueia guidelines, protocolos, ALR, personalizacao e contexto hospitalar.',
            free: 'Gratuito',
            pro: 'Pro',
            freeItems: ['Pesquisa de intervencoes', 'Favoritos e recentes', 'Calculadoras essenciais'],
            proItems: [
              'Guidelines com referencias',
              'Protocolos e ALR completos',
              'Modo Pro e contexto hospitalar',
              'Assistente IA contextualizado',
            ],
            cta: 'Ver conta',
          }
        : {
            eyebrow: 'AnesIA',
            title: 'A simple plan structure, with real preview before upgrade.',
            description:
              'Free mode should demonstrate value. Pro unlocks guidelines, protocols, ALR, personalization, and hospital context.',
            free: 'Free',
            pro: 'Pro',
            freeItems: ['Intervention search', 'Favorites and recents', 'Essential calculators'],
            proItems: [
              'Guidelines with references',
              'Full protocols and ALR',
              'Pro mode and hospital context',
              'Contextual AI assistant',
            ],
            cta: 'Open account',
          };

  return (
    <PublicPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      sections={[
        {
          title: lang === 'fr' ? 'Comparatif' : lang === 'pt' ? 'Comparacao' : 'Comparison',
          body: (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.25rem] border border-border bg-background/80 p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                    {copy.free}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {copy.freeItems.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 text-clinical-success" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-accent/40 bg-accent/5 p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <Crown className="h-4 w-4 text-accent" />
                  <span className="rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                    {copy.pro}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {copy.proItems.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 text-accent" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        },
        {
          title: lang === 'fr' ? 'Acces' : lang === 'pt' ? 'Acesso' : 'Access',
          body: (
            <p>
              <Link
                to="/account"
                onClick={() => trackEvent('pro_upgrade_click', { surface: 'pricing' })}
                className="font-semibold text-accent hover:underline"
              >
                {copy.cta}
              </Link>
            </p>
          ),
        },
      ]}
    />
  );
}
