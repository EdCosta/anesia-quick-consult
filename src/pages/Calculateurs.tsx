import { useEffect, useState } from 'react';
import {
  Calculator,
  Pill,
  Stethoscope,
  Brain,
  Heart,
  Wind,
  Activity,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useContentLimits } from '@/hooks/useContentLimits';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ETTCalculator from '@/components/anesia/ETTCalculator';
import DoseCalculator from '@/components/anesia/DoseCalculator';
import StopBangScore from '@/components/anesia/scores/StopBangScore';
import RCRIScore from '@/components/anesia/scores/RCRIScore';
import ApfelScore from '@/components/anesia/scores/ApfelScore';
import CapriniScore from '@/components/anesia/scores/CapriniScore';
import { buildPathWithSource } from '@/lib/checkoutAttribution';

const CALCULATORS = [
  { id: 'dose', icon: Pill, label: 'dose_calc_title', available: true },
  { id: 'ett', icon: Stethoscope, label: 'ett_calculator', available: true },
  { id: 'stop_bang', icon: Brain, label: 'stop_bang', available: true },
  { id: 'rcri', icon: Heart, label: 'rcri', available: true },
  { id: 'apfel', icon: Wind, label: 'apfel', available: true },
  { id: 'caprini', icon: Activity, label: 'caprini', available: true },
];

const COMPONENTS: Record<string, React.FC> = {
  dose: DoseCalculator,
  ett: ETTCalculator,
  stop_bang: StopBangScore,
  rcri: RCRIScore,
  apfel: ApfelScore,
  caprini: CapriniScore,
};

export default function Calculateurs() {
  const { t } = useLang();
  const { calculators: calcLimit, isLimited } = useContentLimits();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(() => searchParams.get('open'));
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (expanded) next.set('open', expanded);
    else next.delete('open');

    const current = searchParams.toString();
    const updated = next.toString();
    if (current !== updated) {
      setSearchParams(next, { replace: true });
    }
  }, [expanded, searchParams, setSearchParams]);

  const visibleCalcs = isLimited ? CALCULATORS.slice(0, calcLimit) : CALCULATORS;
  const lockedCalcs = isLimited ? CALCULATORS.slice(calcLimit) : [];

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="h-6 w-6 text-accent" />
          {t('calculateurs')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('calculateurs_desc')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCalcs.map((calc) => {
          const Component = COMPONENTS[calc.id];
          const isOpen = expanded === calc.id;
          const isWideCalculator = calc.id === 'dose';
          const shouldExpandWide = isOpen && isWideCalculator;

          return (
            <div
              key={calc.id}
              className={shouldExpandWide ? 'sm:col-span-2 lg:col-span-3' : undefined}
            >
              <div
                className={
                  shouldExpandWide ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-start' : ''
                }
              >
                <div
                  onClick={() => setExpanded(isOpen ? null : calc.id)}
                  className="rounded-xl border bg-card p-5 clinical-shadow transition-shadow hover:clinical-shadow-md cursor-pointer border-l-4 border-l-accent"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-accent/10 p-2">
                      <calc.icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground flex-1">{t(calc.label)}</h3>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <Badge variant="default" className="text-xs">
                    {t('available')}
                  </Badge>
                </div>

                {isOpen && Component && (
                  <div
                    className={`rounded-xl border bg-card p-5 clinical-shadow ${
                      shouldExpandWide ? 'sm:col-span-1 lg:col-span-2' : 'mt-3'
                    }`}
                  >
                    <Component />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {lockedCalcs.map((calc) => (
          <div key={calc.id}>
            <div
              onClick={() => setShowProModal(true)}
              className="rounded-xl border bg-card p-5 clinical-shadow opacity-60 cursor-pointer border-l-4 border-l-muted"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-muted/30 p-2">
                  <calc.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground flex-1">{t(calc.label)}</h3>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {t('content_locked')}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showProModal} onOpenChange={setShowProModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              {t('pro_feature')}
            </DialogTitle>
            <DialogDescription>{t('pro_feature_desc')}</DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setShowProModal(false);
              navigate(buildPathWithSource('/account', 'calculators'));
            }}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('upgrade_pro')}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
