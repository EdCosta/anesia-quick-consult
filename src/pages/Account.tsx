import { useLang } from '@/contexts/LanguageContext';
import { useEntitlements } from '@/hooks/useEntitlements';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FREE_FEATURES = [
  {
    key: 'free_feature_1',
    fr: 'Procédures Quick',
    en: 'Quick procedures',
    pt: 'Procedimentos Quick',
  },
  {
    key: 'free_feature_2',
    fr: 'Calculateurs de base',
    en: 'Basic calculators',
    pt: 'Calculadoras básicas',
  },
  {
    key: 'free_feature_3',
    fr: 'Favoris et récents locaux',
    en: 'Local favorites and recents',
    pt: 'Favoritos e recentes locais',
  },
];

const PRO_FEATURES = [
  {
    key: 'pro_feature_1',
    fr: 'Contenu Deep des procédures',
    en: 'Deep procedure content',
    pt: 'Conteúdo Deep dos procedimentos',
  },
  {
    key: 'pro_feature_2',
    fr: 'Guidelines complètes et références',
    en: 'Full guidelines and references',
    pt: 'Guidelines completas e referências',
  },
  {
    key: 'pro_feature_3',
    fr: 'Protocoles et ALR',
    en: 'Protocols and ALR',
    pt: 'Protocolos e ALR',
  },
  {
    key: 'pro_feature_4',
    fr: 'Quality checks et validations',
    en: 'Quality checks and validations',
    pt: 'Quality checks e validações',
  },
  {
    key: 'pro_feature_5',
    fr: 'Export / offline packs (MVP)',
    en: 'Export / offline packs (MVP)',
    pt: 'Export / packs offline (MVP)',
  },
];

export default function Account() {
  const { t, lang } = useLang();
  const { plan, isPro, loading } = useEntitlements();

  return (
    <div className="container max-w-lg space-y-5 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <h1 className="text-xl font-bold text-foreground">{t('account')}</h1>

      {/* Current Plan */}
      <Card className="clinical-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {t('current_plan')}
            <Badge variant={isPro ? 'default' : 'secondary'} className="gap-0.5">
              {isPro && <Crown className="h-3 w-3" />}
              {isPro ? t('plan_pro') : t('plan_free')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          ) : isPro ? (
            <p className="text-sm text-muted-foreground">
              {lang === 'fr'
                ? 'Vous bénéficiez de toutes les fonctionnalités Pro.'
                : lang === 'pt'
                  ? 'Tem acesso a todas as funcionalidades Pro.'
                  : 'You have access to all Pro features.'}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang === 'fr'
                ? 'Passez à Pro pour débloquer toutes les fonctionnalités.'
                : lang === 'pt'
                  ? 'Atualize para Pro para desbloquear todas as funcionalidades.'
                  : 'Upgrade to Pro to unlock all features.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <div className="grid gap-4">
        {/* Free */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t('plan_free')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5">
            {FREE_FEATURES.map((f) => (
              <div key={f.key} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {f[lang]}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-accent/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-accent" />
              {t('plan_pro')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5">
            {FREE_FEATURES.map((f) => (
              <div key={f.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {f[lang]}
              </div>
            ))}
            {PRO_FEATURES.map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-2 text-sm text-foreground font-medium"
              >
                <Crown className="h-3.5 w-3.5 text-accent shrink-0" />
                {f[lang]}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Button */}
      {!isPro && (
        <Button className="w-full gap-2" size="lg" disabled>
          <Lock className="h-4 w-4" />
          {t('coming_soon')}
        </Button>
      )}
    </div>
  );
}
