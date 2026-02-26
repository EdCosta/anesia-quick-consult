import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { Drug } from '@/lib/types';
import type { PatientWeights } from '@/lib/weightScalars';
import { calculateDose } from '@/lib/dose';
import { ChevronDown, ChevronUp, Beaker, HelpCircle } from 'lucide-react';
import DilutionModal from './DilutionModal';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface DrugDoseRowProps {
  drug: Drug;
  indicationTag: string;
  weightKg: number | null;
  patientWeights?: PatientWeights | null;
}

export default function DrugDoseRow({
  drug,
  indicationTag,
  weightKg,
  patientWeights,
}: DrugDoseRowProps) {
  const { t, resolveStr, lang } = useLang();
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

  const doseResult = calculateDose(rule, weightKg, currentConc, {
    patientWeights: patientWeights ?? undefined,
  });

  const scalarLabel = (s: string | null) => {
    if (!s) return '';
    const map: Record<string, string> = { TBW: 'TBW', IBW: t('ibw'), LBW: t('lbw'), AdjBW: t('adjbw'), TITRATE: t('titrate_to_effect') };
    return map[s] || s;
  };

  const phaseLabel = (tag: string) => {
    const normalized = tag
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const pt = {
      inducao: 'Inducao',
      manutencao: 'Manutencao',
      analgesia: 'Analgesia',
      ponv: 'NVPO',
      profilaxia: 'Profilaxia',
      outro: 'Outro',
    };
    const fr = {
      inducao: 'Induction',
      manutencao: 'Entretien',
      analgesia: 'Analgésie',
      ponv: 'NVPO',
      profilaxia: 'Prophylaxie',
      outro: 'Autre',
    };
    const en = {
      inducao: 'Induction',
      manutencao: 'Maintenance',
      analgesia: 'Analgesia',
      ponv: 'PONV',
      profilaxia: 'Prophylaxis',
      outro: 'Other',
    };
    const dict = lang === 'pt' ? pt : lang === 'en' ? en : fr;

    if (/(induction|isr|intubation|curarisation)/.test(normalized)) return dict.inducao;
    if (/(entretien|maintenance|tiva)/.test(normalized)) return dict.manutencao;
    if (/(analges)/.test(normalized)) return dict.analgesia;
    if (/(ponv|nvpo)/.test(normalized)) return dict.ponv;
    if (/(prophyl|antibioprophylaxie|thromboprophylaxie|antifibrinolytique)/.test(normalized)) return dict.profilaxia;
    return dict.outro;
  };

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
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {phaseLabel(indicationTag)}
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
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
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
                {/* Scalar badge */}
                {doseResult.scalarUsed && doseResult.scalarUsed !== 'TBW' && (
                  <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {scalarLabel(doseResult.scalarUsed)} {doseResult.weightUsed}kg
                  </span>
                )}
                {doseResult.scalarUsed === 'TITRATE' && (
                  <span className="text-[10px] italic text-muted-foreground">
                    {t('titrate_to_effect')}
                  </span>
                )}
                {/* Dose Rationale "?" */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={t('dose_rationale')}
                    >
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 text-xs space-y-1.5" onClick={(e) => e.stopPropagation()}>
                    <p className="font-semibold text-foreground">{t('dose_rationale')}</p>
                    <p><strong>{t('scalar_used')}:</strong> {scalarLabel(doseResult.scalarUsed)}</p>
                    <p><strong>{t('weight_kg')}:</strong> {doseResult.weightUsed} kg</p>
                    <p>
                      {rule.mg_per_kg} mg/kg × {doseResult.weightUsed} kg = {doseResult.doseMgRaw} mg
                      {rule.max_mg !== null && doseResult.doseMgRaw !== doseResult.doseMgFinal && (
                        <span className="text-destructive"> → {t('max_dose')} {rule.max_mg} mg</span>
                      )}
                    </p>
                    <p className="italic text-muted-foreground">{t('validate_clinically')}</p>
                  </PopoverContent>
                </Popover>
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

            {/* Concentration selector */}
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
