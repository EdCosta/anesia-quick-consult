import { ChevronDown } from 'lucide-react';
import { useLang, Lang } from '@/contexts/LanguageContext';

const LANG_LABELS: Record<Lang, string> = { fr: 'FR', pt: 'PT', en: 'EN' };
const LANGS: Lang[] = ['fr', 'en', 'pt'];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const currentLabel = LANG_LABELS[lang];
  const availableLangs = LANGS.filter((candidate) => candidate !== lang);

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        className="inline-flex h-8 min-w-[3.5rem] items-center justify-center gap-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-2 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30"
        aria-haspopup="listbox"
        title={currentLabel}
      >
        <span>{currentLabel}</span>
        <ChevronDown className="h-3 w-3 text-primary-foreground/70 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>

      <div className="absolute left-0 top-full z-50 hidden pt-1 group-hover:block group-focus-within:block">
        <div className="min-w-full rounded-lg border border-border bg-card p-1 shadow-lg">
          {availableLangs.map((languageOption) => (
            <button
              key={languageOption}
              type="button"
              onClick={() => setLang(languageOption)}
              className="w-full rounded-md px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {LANG_LABELS[languageOption]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
