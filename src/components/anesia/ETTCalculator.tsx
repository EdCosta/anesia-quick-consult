import { useState, useMemo } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { calculateETT, type ETTInput } from '@/lib/ett';
import { Card, CardContent } from '@/components/ui/card';

export default function ETTCalculator() {
  const { t } = useLang();

  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');

  const input: ETTInput = useMemo(
    () => ({
      ageYears: ageYears ? parseFloat(ageYears) : null,
      ageMonths: ageMonths ? parseFloat(ageMonths) : null,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      heightCm: heightCm ? parseFloat(heightCm) : null,
      sex: sex || null,
    }),
    [ageYears, ageMonths, weightKg, heightCm, sex],
  );

  const hasInput = ageYears || ageMonths || weightKg || heightCm || sex;
  const result = hasInput ? calculateETT(input) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-foreground">{t('ett_calculator')}</h3>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('age_years')}</label>
          <input
            type="number"
            min="0"
            max="100"
            value={ageYears}
            onChange={(e) => setAgeYears(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('age_months')}</label>
          <input
            type="number"
            min="0"
            max="11"
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('weight_kg')}</label>
          <input
            type="number"
            min="0.5"
            max="300"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="kg"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('height_cm')}</label>
          <input
            type="number"
            min="30"
            max="250"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('sex')}</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as 'male' | 'female' | '')}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">—</option>
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
          </select>
        </div>
      </div>

      {/* Result */}
      {result && (
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4 space-y-2">
            <h4 className="text-sm font-bold text-accent uppercase tracking-wide">
              {t('ett_result')}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">{t('ett_cuffed')}:</span>
              <span className="font-semibold">{result.ettCuffed} mm</span>

              {result.ettUncuffed != null && (
                <>
                  <span className="text-muted-foreground">{t('ett_uncuffed')}:</span>
                  <span className="font-semibold">{result.ettUncuffed} mm</span>
                </>
              )}

              <span className="text-muted-foreground">{t('oral_depth')}:</span>
              <span className="font-semibold">{result.oralDepthCm} cm</span>

              <span className="text-muted-foreground">{t('nasal_depth')}:</span>
              <span className="font-semibold">{result.nasalDepthCm} cm</span>

              <span className="text-muted-foreground">{t('blade_size')}:</span>
              <span className="font-semibold">{result.bladeSuggestion}</span>

              <span className="text-muted-foreground">{t('lma_size')}:</span>
              <span className="font-semibold">{result.lmaSize}</span>
            </div>

            {result.notes.length > 0 && (
              <div className="text-xs text-clinical-warning mt-1">
                {result.notes.map((n, i) => (
                  <p key={i}>⚠ {t(n)}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg bg-clinical-warning-bg p-3 text-xs text-disclaimer-text">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{t('ett_disclaimer')}</span>
      </div>
    </div>
  );
}
