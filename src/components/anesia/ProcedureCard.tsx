import { Link } from 'react-router-dom';
import { Star, ArrowRight, Crown, Lock } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import type { Procedure } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProcedureCardProps {
  procedure: Procedure;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  locked?: boolean;
  onLockedClick?: () => void;
}

export default function ProcedureCard({ procedure, isFavorite, onToggleFavorite, locked, onLockedClick }: ProcedureCardProps) {
  const { resolveStr, lang } = useLang();
  const { specialtiesData } = useData();
  const title = resolveStr(procedure.titles);

  const specialtyDisplayName = (() => {
    const spec = specialtiesData.find((s) => s.id === procedure.specialty);
    if (spec && spec.name) return spec.name[lang] || spec.name['fr'] || procedure.specialty;
    return procedure.specialty;
  })();

  if (locked) {
    return (
      <Card className="clinical-shadow opacity-60 cursor-pointer" onClick={onLockedClick}>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-tight text-card-foreground">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-[11px]">{specialtyDisplayName}</Badge>
              <Badge variant="outline" className="text-[10px] gap-0.5 border-muted text-muted-foreground">
                <Lock className="h-2.5 w-2.5" />PRO
              </Badge>
            </div>
          </div>
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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
                {specialtyDisplayName}
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
