import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { calcCaprini, type CapriniInputs } from '@/lib/scores';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type Group = { label: string; keys: (keyof CapriniInputs)[] };

const GROUPS: Group[] = [
  {
    label: '1 pt',
    keys: ['age41to60', 'minorSurgery', 'bmiOver25', 'swollenLegs', 'varicoseVeins', 'pregnancy', 'oralContraceptives', 'sepsis', 'seriousLungDisease', 'acuteMI', 'chf', 'medicalPatientBedRest', 'ibd'],
  },
  {
    label: '2 pts',
    keys: ['age61to74', 'majorSurgery', 'arthroscopy', 'malignancy', 'laparoscopy', 'bedRestOver72h', 'immobilizingCast', 'centralVenousAccess'],
  },
  {
    label: '3 pts',
    keys: ['ageOver75', 'historyDVTPE', 'familyHistoryThrombosis', 'factorVLeiden', 'prothrombinMutation', 'lupusAnticoagulant', 'heparinInducedThrombocytopenia'],
  },
  {
    label: '5 pts',
    keys: ['stroke', 'elHipKneeFx', 'multipleTrauma', 'acuteSpinalCordInjury'],
  },
];

const LABELS: Record<string, string> = {
  age41to60: 'caprini_age_41_60', age61to74: 'caprini_age_61_74', ageOver75: 'caprini_age_75',
  minorSurgery: 'caprini_minor_surgery', majorSurgery: 'caprini_major_surgery',
  bmiOver25: 'caprini_bmi_25', swollenLegs: 'caprini_swollen_legs', varicoseVeins: 'caprini_varicose',
  pregnancy: 'caprini_pregnancy', oralContraceptives: 'caprini_oc', sepsis: 'caprini_sepsis',
  seriousLungDisease: 'caprini_lung', acuteMI: 'caprini_mi', chf: 'caprini_chf',
  medicalPatientBedRest: 'caprini_bed_rest_med', ibd: 'caprini_ibd',
  arthroscopy: 'caprini_arthroscopy', malignancy: 'caprini_malignancy',
  laparoscopy: 'caprini_laparoscopy', bedRestOver72h: 'caprini_bed_rest_72',
  immobilizingCast: 'caprini_cast', centralVenousAccess: 'caprini_cvc',
  historyDVTPE: 'caprini_dvt_pe', familyHistoryThrombosis: 'caprini_family_thromb',
  factorVLeiden: 'caprini_factor_v', prothrombinMutation: 'caprini_prothrombin',
  lupusAnticoagulant: 'caprini_lupus', heparinInducedThrombocytopenia: 'caprini_hit',
  stroke: 'caprini_stroke', elHipKneeFx: 'caprini_hip_knee',
  multipleTrauma: 'caprini_trauma', acuteSpinalCordInjury: 'caprini_spinal',
};

function emptyCaprini(): CapriniInputs {
  const o: any = {};
  GROUPS.forEach(g => g.keys.forEach(k => { o[k] = false; }));
  // add missing keys not in display groups
  o.historyUnexplainedStillbirth = false;
  o.abnormalPulmonaryFunction = false;
  o.anticardiolipinAntibodies = false;
  o.homocysteine = false;
  o.otherThrombophilia = false;
  return o as CapriniInputs;
}

export default function CapriniScore() {
  const { t } = useLang();
  const [inputs, setInputs] = useState<CapriniInputs>(emptyCaprini);
  const result = calcCaprini(inputs);

  const toggle = (key: keyof CapriniInputs) =>
    setInputs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-3">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="text-xs font-bold text-muted-foreground mb-1">{g.label}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {g.keys.map((k) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={inputs[k]} onCheckedChange={() => toggle(k)} />
                <span className="text-xs text-foreground">{t(LABELS[k] || k)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <span className="text-2xl font-bold text-foreground">{result.score}</span>
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
