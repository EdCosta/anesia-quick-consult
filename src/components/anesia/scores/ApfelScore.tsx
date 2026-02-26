import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { calcApfel, type ApfelInputs } from '@/lib/scores';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const FIELDS: { key: keyof ApfelInputs; label: string }[] = [
  { key: 'femaleGender', label: 'female_gender' },
  { key: 'nonSmoker', label: 'non_smoker' },
  { key: 'ponvHistory', label: 'ponv_history' },
  { key: 'postopOpioids', label: 'postop_opioids' },
];

const EMPTY: ApfelInputs = { femaleGender: false, nonSmoker: false, ponvHistory: false, postopOpioids: false };

export default function ApfelScore() {
  const { t } = useLang();
  const [inputs, setInputs] = useState<ApfelInputs>(EMPTY);
  const result = calcApfel(inputs);

  const toggle = (key: keyof ApfelInputs) =>
    setInputs((prev) => ({ ...prev, [key]: !prev[key] }));

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
        <span className="text-2xl font-bold text-foreground">{result.score}/4</span>
        <div>
          <Badge variant={result.category === 'low' ? 'secondary' : 'destructive'} className="text-xs">
            {t(`risk_${result.category}`)}
          </Badge>
          <p className="text-xs mt-0.5 text-muted-foreground">{result.details}</p>
        </div>
      </div>
    </div>
  );
}
