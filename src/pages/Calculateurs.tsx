import { Calculator, Pill, Activity, Weight, Stethoscope } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

const CALCULATORS = [
  { icon: Pill, label: { fr: 'Calculateur de doses', pt: 'Calculador de doses', en: 'Dose calculator' }, available: true },
  { icon: Activity, label: { fr: 'Score de Mallampati', pt: 'Score de Mallampati', en: 'Mallampati score' }, available: false },
  { icon: Stethoscope, label: { fr: 'Score ASA', pt: 'Score ASA', en: 'ASA score' }, available: false },
  { icon: Weight, label: { fr: 'IMC', pt: 'IMC', en: 'BMI' }, available: false },
];

export default function Calculateurs() {
  const { t, resolveStr } = useLang();

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
        {CALCULATORS.map((calc, i) => (
          <div
            key={i}
            className={`rounded-xl border bg-card p-5 clinical-shadow transition-shadow ${
              calc.available ? 'hover:clinical-shadow-md cursor-pointer border-l-4 border-l-accent' : 'opacity-70'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <calc.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{resolveStr(calc.label)}</h3>
            </div>
            <Badge variant={calc.available ? 'default' : 'secondary'} className="text-xs">
              {calc.available ? t('available') : t('coming_soon')}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
