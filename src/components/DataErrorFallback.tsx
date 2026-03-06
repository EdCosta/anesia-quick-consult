import { AlertTriangle } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export function DataErrorFallback({ error }: { error: string }) {
  const { lang, t } = useLang();
  const helpText =
    lang === 'fr'
      ? 'Une erreur a empeche le chargement du contenu clinique.'
      : lang === 'pt'
        ? 'O carregamento do conteudo clinico falhou.'
        : 'Clinical content failed to load.';
  const retryText =
    lang === 'fr' ? 'Retour a l accueil' : lang === 'pt' ? 'Voltar ao inicio' : 'Back to home';

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="max-w-md rounded-[1.75rem] border border-destructive/30 bg-card p-6 text-center clinical-shadow">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">{t('data_load_error')}</p>
        <p className="mt-2 text-sm text-muted-foreground">{helpText}</p>
        <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.assign('/');
          }}
          className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {retryText}
        </button>
      </div>
    </div>
  );
}
