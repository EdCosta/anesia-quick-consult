import { useLang, Lang } from '@/contexts/LanguageContext';

const LANG_LABELS: Record<Lang, string> = { fr: 'FR', pt: 'PT', en: 'EN' };
const LANGS: Lang[] = ['fr', 'pt', 'en'];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
            lang === l
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
