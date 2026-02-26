import { Link } from 'react-router-dom';
import { Star, ArrowRight, Crown } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import type { Procedure } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProcedureCardProps {
  procedure: Procedure;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function ProcedureCard({ procedure, isFavorite, onToggleFavorite }: ProcedureCardProps) {
  const { resolveStr } = useLang();
  const title = resolveStr(procedure.titles);

  return (
    <Card className="clinical-shadow hover:clinical-shadow-md transition-all hover:-translate-y-0.5 cursor-pointer animate-fade-in">
      <CardContent className="flex items-center gap-3 p-4">
        <Link to={`/p/${procedure.id}`} className="min-w-0 flex-1 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-tight text-card-foreground">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-[11px]">
                {procedure.specialty}
              </Badge>
              {procedure.is_pro && (
                <Badge variant="outline" className="text-[10px] gap-0.5 border-accent text-accent">
                  <Crown className="h-2.5 w-2.5" />PRO
                </Badge>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
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
      </CardContent>
    </Card>
  );
}
