import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { Drug } from '@/lib/types';
import { calculateDose } from '@/lib/dose';
import { ChevronDown, ChevronUp, Beaker } from 'lucide-react';
import DilutionModal from './DilutionModal';

interface DrugDoseRowProps {
  drug: Drug;
  indicationTag: string;
  weightKg: number | null;
}

export default function DrugDoseRow({
  drug,
  indicationTag,
  weightKg,
}: DrugDoseRowProps) {
  const { t, resolveStr } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [selectedConc, setSelectedConc] = useState(0);
  const [dilutionOpen, setDilutionOpen] = useState(false);

  const drugName = resolveStr(drug.name);
  const rule = drug.dose_rules.find((r) => r.indication_tag === indicationTag);

  if (!rule) return null;

  const validConcentrations = drug.concentrations.filter(
    (c) => c.mg_per_ml !== null && c.mg_per_ml > 0
  );

  const currentConc = drug.concentrations[selectedConc] ?? null;

  const doseResult = calculateDose(rule, weightKg, currentConc);

  return (
    <>
      <div className="rounded-lg border bg-card p-3 animate-fade-in">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-semibold text-card-foreground">
                {drugName}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {rule.route}
              </span>
              {rule.unit_override && (
                <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                  {rule.unit_override}
                </span>
              )}
            </div>

            {/* No calc possible: protocol local */}
            {!doseResult.canCalc &&
              doseResult.reasonIfNoCalc === 'protocol_local' && (
                <p className="mt-1 text-xs italic text-accent-foreground">
                  {rule.unit_override
                    ? `${rule.unit_override} — ${t('protocol_local')}`
                    : t('protocol_local')}
                </p>
              )}

            {/* No calc: missing weight */}
            {!doseResult.canCalc &&
              doseResult.reasonIfNoCalc === 'enter_weight' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {rule.mg_per_kg} {t('mg_per_kg')}
                  {rule.max_mg !== null &&
                    ` · ${t('max_dose')}: ${rule.max_mg} mg`}
                  {' · '}
                  <span className="italic">{t('enter_weight')}</span>
                </p>
              )}

            {/* Calc OK */}
            {doseResult.canCalc && doseResult.doseMgFinal !== null && (
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <span className="text-muted-foreground">
                  {rule.mg_per_kg} {t('mg_per_kg')}
                </span>
                {rule.max_mg !== null && (
                  <span className="text-muted-foreground">
                    {t('max_dose')}: {rule.max_mg} mg
                  </span>
                )}
                <span className="font-semibold text-primary">
                  {t('dose_calc')}: {doseResult.doseMgFinal} mg
                </span>
                {doseResult.volumeMl !== null ? (
                  <span className="font-semibold text-primary">
                    {t('volume')}: {doseResult.volumeMl} mL
                  </span>
                ) : (
                  <span className="text-xs italic text-muted-foreground">
                    {t('volume_unavailable')}
                  </span>
                )}
              </div>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 border-t pt-3">
            {rule.notes.length > 0 && (
              <ul className="space-y-1">
                {rule.notes.map((n, i) => (
                  <li key={i} className="text-xs text-card-foreground">
                    • {n}
                  </li>
                ))}
              </ul>
            )}

            {/* Concentration selector — always visible if >1 */}
            {validConcentrations.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {t('concentration')}:
                </span>
                {validConcentrations.map((c, i) => {
                  const origIdx = drug.concentrations.indexOf(c);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedConc(origIdx)}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                        selectedConc === origIdx
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Prepare dilution button */}
            <button
              onClick={() => setDilutionOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/20 transition-colors"
            >
              <Beaker className="h-3.5 w-3.5" />
              {t('prepare_dilution')}
            </button>

            {drug.contraindications_notes.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-destructive">
                  {t('contraindications')}
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {drug.contraindications_notes.map((n, i) => (
                    <li key={i} className="text-xs text-card-foreground">
                      • {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {drug.renal_hepatic_notes.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {t('renal_hepatic')}
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {drug.renal_hepatic_notes.map((n, i) => (
                    <li key={i} className="text-xs text-card-foreground">
                      • {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <DilutionModal
        open={dilutionOpen}
        onOpenChange={setDilutionOpen}
        drugName={drugName}
        initialStockMgPerMl={
          currentConc?.mg_per_ml !== null && currentConc?.mg_per_ml! > 0
            ? currentConc!.mg_per_ml!
            : undefined
        }
      />
    </>
  );
}
