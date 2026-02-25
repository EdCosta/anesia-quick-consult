import { useLang } from '@/contexts/LanguageContext';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useLang();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('search_placeholder')}
        className="h-12 w-full rounded-xl border bg-card pl-11 pr-4 text-base shadow-sm transition-shadow placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:shadow-md"
      />
    </div>
  );
}
