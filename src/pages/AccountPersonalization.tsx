import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AccountSettingsNav from '@/components/anesia/AccountSettingsNav';
import { useUITheme } from '@/hooks/useUITheme';
import type { UIThemeKey } from '@/lib/uiTheme';

export default function AccountPersonalization() {
  const { lang, t, resolveStr } = useLang();
  const navigate = useNavigate();
  const { themeKey, setThemeKey, themes } = useUITheme();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    if (!user) {
      navigate('/auth?mode=signin');
    }
  }, [checkingAuth, navigate, user]);

  const copy = useMemo(() => {
    if (lang === 'fr') {
      return {
        title: 'Personnalisation',
        subtitle: 'Choisissez un theme de couleurs global pour l application.',
        active: 'Actif',
        apply: 'Appliquer',
        previewTitle: 'Apercu',
        previewText:
          'Ce bloc montre le rendu des couleurs principales, secondaires et accents.',
      };
    }
    if (lang === 'pt') {
      return {
        title: 'Personalizacao',
        subtitle: 'Escolhe um tema global de cores para a aplicacao.',
        active: 'Ativo',
        apply: 'Aplicar',
        previewTitle: 'Pre-visualizacao',
        previewText:
          'Este bloco mostra o resultado das cores principais, secundarias e acentos.',
      };
    }
    return {
      title: 'Personalization',
      subtitle: 'Choose a global color theme for the application.',
      active: 'Active',
      apply: 'Apply',
      previewTitle: 'Preview',
      previewText: 'This block shows primary, secondary, and accent color rendering.',
    };
  }, [lang]);

  return (
    <div className="container max-w-4xl space-y-5 py-6">
      <Link to="/account/settings" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <AccountSettingsNav active="personalization" />

      <div className="grid gap-4 md:grid-cols-2">
        {themes.map((theme) => {
          const isActive = theme.key === themeKey;
          return (
            <Card key={theme.key} className={isActive ? 'border-primary' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{resolveStr(theme.label)}</span>
                  {isActive && (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3.5 w-3.5" />
                      {copy.active}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{resolveStr(theme.description)}</p>
                <div className="flex items-center gap-2">
                  {theme.swatches.map((hex) => (
                    <span
                      key={`${theme.key}-${hex}`}
                      className="h-7 w-7 rounded-full border border-border"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  className="w-full gap-2"
                  variant={isActive ? 'secondary' : 'outline'}
                  onClick={() => setThemeKey(theme.key as UIThemeKey)}
                >
                  <Palette className="h-4 w-4" />
                  {copy.apply}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{copy.previewTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{copy.previewText}</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Primary
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              Secondary
            </span>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Accent
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
