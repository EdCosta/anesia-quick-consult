import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import type { Procedure } from '@/contexts/DataContext';

interface ProcedureCardProps {
  procedure: Procedure;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function ProcedureCard({ procedure, isFavorite, onToggleFavorite }: ProcedureCardProps) {
  const { resolveStr } = useLang();
  const title = resolveStr(procedure.titles);

  return (
    <div className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30 animate-fade-in">
      <Link to={`/p/${procedure.id}`} className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-semibold leading-tight text-card-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
          {procedure.specialty}
        </span>
      </Link>
      <button
        onClick={e => { e.preventDefault(); onToggleFavorite(procedure.id); }}
        className="shrink-0 p-1.5 transition-colors"
        aria-label="Toggle favorite"
      >
        <Star
          className={`h-5 w-5 ${isFavorite ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`}
        />
      </button>
    </div>
  );
}
