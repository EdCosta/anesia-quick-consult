import { Target, Hand, Footprints, StretchHorizontal, CircleDot } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

const REGIONS = [
  { icon: Hand, label: { fr: 'Membre supérieur', pt: 'Membro superior', en: 'Upper limb' }, blocks: ['Interscalénique', 'Supraclaviculaire', 'Axillaire'] },
  { icon: Footprints, label: { fr: 'Membre inférieur', pt: 'Membro inferior', en: 'Lower limb' }, blocks: ['Fémoral', 'Sciatique', 'Adducteur'] },
  { icon: StretchHorizontal, label: { fr: 'Tronc', pt: 'Tronco', en: 'Trunk' }, blocks: ['TAP block', 'Paravertébral', 'Érecteur du rachis'] },
  { icon: CircleDot, label: { fr: 'Tête & Cou', pt: 'Cabeça & Pescoço', en: 'Head & Neck' }, blocks: ['Scalp block', 'Cervical superficiel'] },
];

export default function ALR() {
  const { t, resolveStr } = useLang();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="h-6 w-6 text-accent" />
          {t('alr_full')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">ALR</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REGIONS.map((region, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 clinical-shadow hover:clinical-shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <region.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{resolveStr(region.label)}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {region.blocks.map(b => (
                <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
              ))}
            </div>
            <Badge variant="secondary" className="text-xs">{t('coming_soon')}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
