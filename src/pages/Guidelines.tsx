import { BookOpen, Wind, Heart, Thermometer, Pill, Brain, Droplets } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { icon: Wind, label: { fr: 'Voies aériennes', pt: 'Via aérea', en: 'Airway' } },
  { icon: Heart, label: { fr: 'Hémodynamique', pt: 'Hemodinâmica', en: 'Hemodynamics' } },
  { icon: Thermometer, label: { fr: 'Température', pt: 'Temperatura', en: 'Temperature' } },
  { icon: Pill, label: { fr: 'Douleur & Analgésie', pt: 'Dor & Analgesia', en: 'Pain & Analgesia' } },
  { icon: Brain, label: { fr: 'PONV', pt: 'NVPO', en: 'PONV' } },
  { icon: Droplets, label: { fr: 'Remplissage vasculaire', pt: 'Reposição volêmica', en: 'Fluid management' } },
];

export default function Guidelines() {
  const { t, resolveStr } = useLang();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" />
          {t('guidelines')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('guidelines_desc')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 clinical-shadow hover:clinical-shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <cat.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{resolveStr(cat.label)}</h3>
            </div>
            <Badge variant="secondary" className="text-xs">{t('coming_soon')}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
