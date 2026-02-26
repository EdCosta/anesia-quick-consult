import { useState, useMemo, useEffect } from 'react';
import { Settings, User } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PatientWeights, Sex } from '@/lib/weightScalars';
import { computeWeights } from '@/lib/weightScalars';

interface PatientAnthropometricsProps {
  weightKg: string;
  onWeightChange: (v: string) => void;
  onWeightsChange: (w: PatientWeights | null) => void;
}

export default function PatientAnthropometrics({
  weightKg,
  onWeightChange,
  onWeightsChange,
}: PatientAnthropometricsProps) {
  const { t } = useLang();
  const [advanced, setAdvanced] = useLocalStorage('anesia-advanced-weight', false);
  const [heightCm, setHeightCm] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);

  const weight = parseFloat(weightKg) || null;
  const height = parseFloat(heightCm) || null;

  const weights = useMemo<PatientWeights | null>(() => {
    if (!weight || weight <= 0) return null;
    if (!advanced) return { tbw: weight, ibw: null, lbw: null, adjbw: null, bmi: null };
    return computeWeights(sex, height, weight);
  }, [weight, height, sex, advanced]);

  useEffect(() => {
    onWeightsChange(weights);
  }, [weights]);

  const round1 = (v: number | null) => (v !== null ? Math.round(v * 10) / 10 : '–');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground whitespace-nowrap">{t('weight_kg')}</label>
        <input
          type="number"
          value={weightKg}
          onChange={(e) => onWeightChange(e.target.value)}
          placeholder="70"
          min="1"
          max="300"
          className="w-24 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          onClick={() => setAdvanced(!advanced)}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            advanced
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          title={t('advanced_mode')}
        >
          <Settings className="h-3 w-3" />
          {t('advanced_mode')}
        </button>
        {!weight && <span className="text-xs text-muted-foreground">{t('enter_weight')}</span>}
      </div>

      {advanced && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2 animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-foreground">{t('height_cm')}</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170"
                min="50"
                max="250"
                className="w-20 rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-foreground">{t('sex')}</label>
              <div className="flex gap-1">
                {(['M', 'F'] as Sex[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSex(sex === s ? null : s)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      sex === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {s === 'M' ? t('male') : t('female')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {weights && weights.bmi !== null && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span><strong>{t('bmi')}:</strong> {round1(weights.bmi)}</span>
              <span><strong>{t('ibw')}:</strong> {round1(weights.ibw)} kg</span>
              <span><strong>{t('lbw')}:</strong> {round1(weights.lbw)} kg</span>
              <span><strong>{t('adjbw')}:</strong> {round1(weights.adjbw)} kg</span>
            </div>
          )}
          {advanced && (!sex || !height) && weight && (
            <p className="text-[11px] text-muted-foreground italic">
              {t('enter_height_sex')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
