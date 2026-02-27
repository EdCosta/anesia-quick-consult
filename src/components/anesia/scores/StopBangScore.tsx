import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { calcSTOPBANG, type STOPBANGInputs } from '@/lib/scores';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const FIELDS: { key: keyof STOPBANGInputs; label: string }[] = [
  { key: 'snore', label: 'snore' },
  { key: 'tired', label: 'tired' },
  { key: 'observed', label: 'observed_apnea' },
  { key: 'pressure', label: 'blood_pressure' },
  { key: 'bmiOver35', label: 'bmi_over_35' },
  { key: 'ageOver50', label: 'age_over_50' },
  { key: 'neckOver40', label: 'neck_circumference' },
  { key: 'male', label: 'gender_male' },
];

const EMPTY: STOPBANGInputs = {
  snore: false,
  tired: false,
  observed: false,
  pressure: false,
  bmiOver35: false,
  ageOver50: false,
  neckOver40: false,
  male: false,
};

export default function StopBangScore() {
  const { t } = useLang();
  const [inputs, setInputs] = useState<STOPBANGInputs>(EMPTY);
  const result = calcSTOPBANG(inputs);

  const toggle = (key: keyof STOPBANGInputs) =>
    setInputs((prev) => ({ ...prev, [key]: !prev[key] }));

  const riskColor =
    result.category === 'high'
      ? 'text-destructive'
      : result.category === 'moderate'
        ? 'text-orange-500'
        : 'text-green-600';

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
        <span className="text-2xl font-bold text-foreground">{result.score}/8</span>
        <div>
          <Badge
            variant={result.category === 'low' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {t(`risk_${result.category}`)}
          </Badge>
          <p className={`text-xs mt-0.5 font-medium ${riskColor}`}>{result.details}</p>
        </div>
      </div>
    </div>
  );
}
