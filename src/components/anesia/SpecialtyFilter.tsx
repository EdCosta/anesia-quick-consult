import { useLang } from '@/contexts/LanguageContext';

interface SpecialtyFilterProps {
  specialties: string[];
  selected: string | null;
  onSelect: (s: string | null) => void;
}

export default function SpecialtyFilter({ specialties, selected, onSelect }: SpecialtyFilterProps) {
  const { t } = useLang();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
          selected === null
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {t('all_specialties')}
      </button>
      {specialties.map(s => (
        <button
          key={s}
          onClick={() => onSelect(s === selected ? null : s)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            selected === s
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
