import { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SpecialtyChipsProps {
  specialties: string[];
  selected: string | null;
  onSelect: (s: string | null) => void;
  maxVisible?: number;
}

export default function SpecialtyChips({
  specialties,
  selected,
  onSelect,
  maxVisible = 8,
}: SpecialtyChipsProps) {
  const { t } = useLang();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const visible = specialties.slice(0, maxVisible);
  const hasMore = specialties.length > maxVisible;

  const filteredAll = useMemo(() => {
    if (!search.trim()) return specialties;
    const q = search.toLowerCase();
    return specialties.filter((s) => s.toLowerCase().includes(q));
  }, [specialties, search]);

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    }`;

  const handleSelectFromDialog = (s: string) => {
    onSelect(s === selected ? null : s);
    setDialogOpen(false);
    setSearch('');
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
      {/* "All" chip */}
      <button onClick={() => onSelect(null)} className={chipClass(selected === null)}>
        {t('all_specialties')}
      </button>

      {/* Top N chips */}
      {visible.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s === selected ? null : s)}
          className={chipClass(selected === s)}
        >
          {s}
        </button>
      ))}

      {/* "+" button */}
      {hasMore && (
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSearch(''); }}>
          <DialogTrigger asChild>
            <button
              className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              aria-label={t('choose_specialties')}
            >
              <Plus className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{t('choose_specialties')}</DialogTitle>
            </DialogHeader>

            {/* Search inside dialog */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_specialties')}
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Full specialty list */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredAll.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('no_results')}</p>
              ) : (
                filteredAll.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectFromDialog(s)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      s === selected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))
              )}
            </div>

            {/* Clear button */}
            {selected && (
              <button
                onClick={() => { onSelect(null); setDialogOpen(false); setSearch(''); }}
                className="mt-2 w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                {t('clear')}
              </button>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
