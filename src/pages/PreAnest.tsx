import { useState, useMemo } from 'react';
import { Stethoscope, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import Fuse from 'fuse.js';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateRecommendations, type PreAnestInput, type PreAnestOutput } from '@/lib/preanest-rules';
import { getSpecialtyDisplayName } from '@/lib/specialties';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const COMORBIDITIES = ['hta', 'diabetes', 'saos', 'obesity', 'cardiopathy', 'renal', 'liver', 'respiratory'];
const ANTICOAG_OPTIONS = ['none', 'aspirin', 'clopidogrel', 'doac', 'avk', 'lmwh', 'dual_antiplatelet'];

  const DEFAULT_INPUT: PreAnestInput = {
  age: 50, sex: 'M', weight: 70, height: 170, asa: 2,
  comorbidities: [], otherComorbidities: '',
  mallampati: 1, mouthOpening: 'normal', cervicalMobility: 'normal',
  anticoagulation: 'none', allergies: '',
  procedureId: '', specialty: '', surgeryType: '',
  context: 'inpatient',
};

export default function PreAnest() {
  const { t, lang, resolveStr } = useLang();
  const { procedures, specialtiesData } = useData();
  const [saved, setSaved] = useLocalStorage<PreAnestInput>('anesia-preanest-last', DEFAULT_INPUT);
  const [input, setInput] = useState<PreAnestInput>(saved);
  const [result, setResult] = useState<PreAnestOutput | null>(null);
  const [procSearch, setProcSearch] = useState('');
  const [showProcList, setShowProcList] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const fuse = useMemo(() => new Fuse(procedures, {
    keys: [`titles.${lang}`, 'titles.fr', 'specialty'],
    threshold: 0.4,
    ignoreLocation: true,
  }), [procedures, lang]);

  const procResults = useMemo(() => {
    if (!procSearch.trim()) return procedures.slice(0, 10);
    return fuse.search(procSearch).slice(0, 10).map(r => r.item);
  }, [procSearch, fuse, procedures]);

  const set = <K extends keyof PreAnestInput>(key: K, val: PreAnestInput[K]) => {
    setInput(prev => ({ ...prev, [key]: val }));
  };

  const toggleComorbidity = (c: string) => {
    set('comorbidities', input.comorbidities.includes(c)
      ? input.comorbidities.filter(x => x !== c)
      : [...input.comorbidities, c]);
  };

  const handleGenerate = () => {
    setSaved(input);
    setResult(generateRecommendations(input));
    setExpandedBlock('preop');
  };

  const selectedProc = procedures.find(p => p.id === input.procedureId);

  const blocks = result ? [
    { key: 'preop', label: t('preop'), items: result.preop, color: 'text-accent' },
    { key: 'intraop', label: t('intraop'), items: result.intraop, color: 'text-clinical-info' },
    { key: 'postop', label: t('postop'), items: result.postop, color: 'text-clinical-warning' },
    { key: 'redFlags', label: t('red_flags'), items: result.redFlags, color: 'text-clinical-danger' },
  ] : [];

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-accent" />
          {t('preanest')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('preanest_desc')}</p>
      </div>

      {/* Patient form */}
      <Card className="clinical-shadow">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground">{t('patient')}</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">{t('age_years')}</Label>
              <input type="number" value={input.age} onChange={e => set('age', +e.target.value)} min={0} max={120}
                className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
            <div>
              <Label className="text-xs">{t('sex')}</Label>
              <select value={input.sex} onChange={e => set('sex', e.target.value as 'M' | 'F')}
                className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option value="M">{t('male')}</option>
                <option value="F">{t('female')}</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">{t('weight_kg')}</Label>
              <input type="number" value={input.weight} onChange={e => set('weight', +e.target.value)} min={1} max={300}
                className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
            <div>
              <Label className="text-xs">{t('height_cm')}</Label>
              <input type="number" value={input.height} onChange={e => set('height', +e.target.value)} min={30} max={250}
                className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
          </div>

          <div>
            <Label className="text-xs">ASA</Label>
            <select value={input.asa} onChange={e => set('asa', +e.target.value as 1|2|3|4|5)}
              className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
              {[1,2,3,4,5].map(v => <option key={v} value={v}>ASA {v}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-xs">{t('comorbidities')}</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {COMORBIDITIES.map(c => (
                <button key={c} onClick={() => toggleComorbidity(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${input.comorbidities.includes(c) ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}>
                  {t(`comorb_${c}`)}
                </button>
              ))}
            </div>
            <input type="text" value={input.otherComorbidities} onChange={e => set('otherComorbidities', e.target.value)}
              placeholder={t('other_comorbidities')} className="w-full mt-2 h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>

          {/* Airway */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Mallampati</Label>
              <select value={input.mallampati} onChange={e => set('mallampati', +e.target.value as 1|2|3|4)}
                className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                {[1,2,3,4].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">{t('mouth_opening')}</Label>
              <select value={input.mouthOpening} onChange={e => set('mouthOpening', e.target.value as 'normal'|'limited')}
                className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option value="normal">{t('normal')}</option>
                <option value="limited">{t('limited')}</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">{t('cervical_mobility')}</Label>
              <select value={input.cervicalMobility} onChange={e => set('cervicalMobility', e.target.value as 'normal'|'limited')}
                className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option value="normal">{t('normal')}</option>
                <option value="limited">{t('limited')}</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs">{t('anticoagulation')}</Label>
            <select value={input.anticoagulation} onChange={e => set('anticoagulation', e.target.value)}
              className="w-full mt-1 h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
              {ANTICOAG_OPTIONS.map(o => <option key={o} value={o}>{t(`anticoag_${o}`)}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-xs">{t('allergies')}</Label>
            <input type="text" value={input.allergies} onChange={e => set('allergies', e.target.value)}
              placeholder={t('allergies_placeholder')} className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </CardContent>
      </Card>

      {/* Surgery form */}
      <Card className="clinical-shadow">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground">{t('surgery')}</h3>

          <div className="relative">
            <Label className="text-xs">{t('select_procedure')}</Label>
            <input type="text" value={procSearch} onChange={e => { setProcSearch(e.target.value); setShowProcList(true); }}
              onFocus={() => setShowProcList(true)}
              placeholder={selectedProc ? resolveStr(selectedProc.titles) : t('search_placeholder')}
              className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            {showProcList && procResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-md border bg-card shadow-lg">
                {procResults.map(p => (
                  <button key={p.id} onClick={() => { set('procedureId', p.id); set('specialty', p.specialty); setProcSearch(''); setShowProcList(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors">
                    {resolveStr(p.titles)} <span className="text-muted-foreground">({getSpecialtyDisplayName(p.specialty, specialtiesData, lang)})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">{t('context')}</Label>
            <div className="flex gap-2 mt-1">
              {(['ambulatory', 'inpatient', 'emergency'] as const).map(c => (
                <button key={c} onClick={() => set('context', c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${input.context === c ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent/50'}`}>
                  {t(`ctx_${c}`)}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate}
            className="w-full h-10 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors">
            {t('generate_recommendations')}
          </button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {blocks.map(block => {
            const isOpen = expandedBlock === block.key;
            return (
              <Card key={block.key} className="clinical-shadow overflow-hidden">
                <button onClick={() => setExpandedBlock(isOpen ? null : block.key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
                  <h3 className={`text-sm font-bold ${block.color}`}>
                    {block.key === 'redFlags' && <AlertTriangle className="inline h-4 w-4 mr-1" />}
                    {block.label} ({block.items.length})
                  </h3>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <CardContent className="px-4 pb-4 pt-0">
                    <ul className="space-y-1.5">
                      {block.items.map((item, i) => (
                        <li key={i} className="text-xs text-card-foreground flex gap-2">
                          <span className={`${block.color} mt-0.5`}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
