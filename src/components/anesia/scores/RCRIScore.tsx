import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { calcRCRI, type RCRIInputs } from '@/lib/scores';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const FIELDS: { key: keyof RCRIInputs; label: string }[] = [
  { key: 'highRiskSurgery', label: 'high_risk_surgery' },
  { key: 'ischemicHeart', label: 'ischemic_heart' },
  { key: 'congestiveHeart', label: 'congestive_heart' },
  { key: 'cerebrovascular', label: 'cerebrovascular' },
  { key: 'insulinTherapy', label: 'insulin_therapy' },
  { key: 'creatinineElevated', label: 'creatinine_elevated' },
];

const EMPTY: RCRIInputs = {
  highRiskSurgery: false,
  ischemicHeart: false,
  congestiveHeart: false,
  cerebrovascular: false,
  insulinTherapy: false,
  creatinineElevated: false,
};

export default function RCRIScore() {
  const { t } = useLang();
  const [inputs, setInputs] = useState<RCRIInputs>(EMPTY);
  const result = calcRCRI(inputs);

  const toggle = (key: keyof RCRIInputs) => setInputs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={inputs[f.key]} onCheckedChange={() => toggle(f.key)} />
            <span className="text-sm text-foreground">{t(f.label)}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <span className="text-2xl font-bold text-foreground">{result.score}/6</span>
        <div>
          <Badge
            variant={result.category === 'low' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {t(`risk_${result.category}`)}
          </Badge>
          <p className="text-xs mt-0.5 text-muted-foreground">{result.details}</p>
        </div>
      </div>
    </div>
  );
}
