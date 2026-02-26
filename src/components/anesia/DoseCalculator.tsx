import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import PatientAnthropometrics from './PatientAnthropometrics';
import DrugDoseRow from './DrugDoseRow';
import type { PatientWeights } from '@/lib/weightScalars';

export default function DoseCalculator() {
  const { t, resolveStr } = useLang();
  const { drugs } = useData();
  const [search, setSearch] = useState('');
  const [selectedDrugId, setSelectedDrugId] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState('');
  const [patientWeights, setPatientWeights] = useState<PatientWeights | null>(null);

  const weight = parseFloat(weightKg) || null;

  const filtered = useMemo(() => {
    if (!search.trim()) return drugs.slice(0, 20);
    const q = search.toLowerCase();
    return drugs.filter((d) => {
      const name = resolveStr(d.name).toLowerCase();
      return name.includes(q);
    });
  }, [drugs, search, resolveStr]);

  const selectedDrug = selectedDrugId ? drugs.find((d) => d.id === selectedDrugId) : null;

  return (
    <div className="space-y-4">
      {/* Drug search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedDrugId(null); }}
          placeholder={t('search_drug')}
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        {search && (
          <button onClick={() => { setSearch(''); setSelectedDrugId(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Drug list */}
      {!selectedDrug && (
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => { setSelectedDrugId(d.id); setSearch(resolveStr(d.name)); }}
              className="rounded-full px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {resolveStr(d.name)}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-xs text-muted-foreground">{t('no_results')}</p>}
        </div>
      )}

      {/* Selected drug: anthropometrics + dose rows */}
      {selectedDrug && (
        <>
          <PatientAnthropometrics
            weightKg={weightKg}
            onWeightChange={setWeightKg}
            onWeightsChange={setPatientWeights}
          />
          {selectedDrug.dose_rules.length > 0 ? (
            <div className="space-y-2">
              {selectedDrug.dose_rules.map((rule, i) => (
                <DrugDoseRow
                  key={`${selectedDrug.id}-${rule.indication_tag}-${i}`}
                  drug={selectedDrug}
                  indicationTag={rule.indication_tag}
                  weightKg={weight}
                  patientWeights={patientWeights}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('no_doses_configured')}</p>
          )}
        </>
      )}
    </div>
  );
}
