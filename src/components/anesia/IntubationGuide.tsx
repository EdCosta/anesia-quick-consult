import { useLang } from '@/contexts/LanguageContext';
import { getNeonateTable } from '@/lib/ett';
import ETTCalculator from './ETTCalculator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const GUIDE_CONTENT: Record<string, Record<'fr' | 'en' | 'pt', string[]>> = {
  checklist: {
    fr: [
      'Vérifier matériel : ETT (2 tailles), laryngoscope, mandrin, aspiration, capnographe',
      'Position : sniffing position (alignement axe oral-pharyngé-laryngé)',
      'Pré-oxygénation : FiO₂ 100 % pendant 3 min (ou 8 respirations profondes)',
      'Plan A : laryngoscopie directe/vidéo → intubation',
      'Plan B : masque laryngé (ML) → ventilation de sauvetage',
      'Plan C : cricothyroïdotomie (urgence CICO)',
    ],
    en: [
      'Check equipment: ETT (2 sizes), laryngoscope, stylet, suction, capnograph',
      'Position: sniffing position (align oral-pharyngeal-laryngeal axes)',
      'Pre-oxygenation: FiO₂ 100% for 3 min (or 8 vital capacity breaths)',
      'Plan A: direct/video laryngoscopy → intubation',
      'Plan B: supraglottic airway (LMA) → rescue ventilation',
      'Plan C: cricothyrotomy (CICO emergency)',
    ],
    pt: [
      'Verificar material: ETT (2 tamanhos), laringoscópio, mandril, aspiração, capnógrafo',
      'Posição: sniffing position (alinhamento eixo oral-faríngeo-laríngeo)',
      'Pré-oxigenação: FiO₂ 100% durante 3 min (ou 8 respirações profundas)',
      'Plano A: laringoscopia direta/vídeo → intubação',
      'Plano B: máscara laríngea (ML) → ventilação de resgate',
      'Plano C: cricotirotomia (emergência CICO)',
    ],
  },
  pediatric_rules: {
    fr: [
      'ETT cuffé (recommandé) ID = (âge/4) + 3.5',
      'ETT non cuffé ID = (âge/4) + 4.0',
      'Profondeur orale ≈ 3 × ID ou (âge/2) + 12 cm',
      'Nasal : profondeur orale + 2 à 3 cm',
      'Pression du cuff : objectif 20–25 cmH₂O',
      'Si enfant petit/grand pour l\'âge : ajuster ± 0.5 mm',
    ],
    en: [
      'Cuffed ETT (preferred) ID = (age/4) + 3.5',
      'Uncuffed ETT ID = (age/4) + 4.0',
      'Oral depth ≈ 3 × ID or (age/2) + 12 cm',
      'Nasal: oral depth + 2–3 cm',
      'Cuff pressure target: 20–25 cmH₂O',
      'If child small/large for age: adjust ± 0.5 mm',
    ],
    pt: [
      'ETT cuffado (recomendado) ID = (idade/4) + 3.5',
      'ETT não cuffado ID = (idade/4) + 4.0',
      'Profundidade oral ≈ 3 × ID ou (idade/2) + 12 cm',
      'Nasal: profundidade oral + 2 a 3 cm',
      'Pressão do cuff: objectivo 20–25 cmH₂O',
      'Se criança pequena/grande para a idade: ajustar ± 0.5 mm',
    ],
  },
  adult_rules: {
    fr: [
      'Femme : ETT 7.0–7.5 (6.5 si petite/VAD ; 7.5 si grande)',
      'Homme : ETT 7.5–8.0 (8.5 si grand et robuste)',
      'Profondeur orale : Femme ~20–21 cm ; Homme ~22–23 cm',
      'Ajuster par taille : +1 cm si >185 cm, −1 cm si <160 cm',
      'Confirmer par capnographie + auscultation bilatérale',
    ],
    en: [
      'Female: ETT 7.0–7.5 (6.5 if short/DAW; 7.5 if tall)',
      'Male: ETT 7.5–8.0 (8.5 if tall and robust)',
      'Oral depth: Female ~20–21 cm; Male ~22–23 cm',
      'Adjust by height: +1 cm if >185 cm, −1 cm if <160 cm',
      'Confirm with capnography + bilateral auscultation',
    ],
    pt: [
      'Mulher: ETT 7.0–7.5 (6.5 se baixa/VAD; 7.5 se alta)',
      'Homem: ETT 7.5–8.0 (8.5 se alto e robusto)',
      'Profundidade oral: Mulher ~20–21 cm; Homem ~22–23 cm',
      'Ajustar por altura: +1 cm se >185 cm, −1 cm se <160 cm',
      'Confirmar com capnografia + auscultação bilateral',
    ],
  },
  armed_tube: {
    fr: [
      'Envisager tube armé en : décubitus ventral, chirurgie cervicale, ORL (risque de compression/coudure)',
    ],
    en: [
      'Consider reinforced (armed) tube for: prone position, cervical surgery, ENT (risk of kinking)',
    ],
    pt: [
      'Considerar tubo armado em: decúbito ventral, cirurgia cervical, ORL (risco de compressão/dobra)',
    ],
  },
};

export default function IntubationGuide() {
  const { t, lang } = useLang();
  const neonateTable = getNeonateTable();
  const l = lang as 'fr' | 'en' | 'pt';

  const resolveList = (key: string): string[] =>
    GUIDE_CONTENT[key]?.[l] ?? GUIDE_CONTENT[key]?.['fr'] ?? [];

  return (
    <div className="space-y-3">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="intubation-guide" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 text-sm font-bold hover:no-underline">
            🫁 {t('intubation_guide')}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {/* Checklist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-accent mb-2">
                Checklist
              </h4>
              <ul className="space-y-1">
                {resolveList('checklist').map((item, i) => (
                  <li key={i} className="text-xs text-foreground flex gap-2">
                    <span className="text-accent shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pediatric */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-accent mb-2">
                {t('pediatric')}
              </h4>
              <ul className="space-y-1">
                {resolveList('pediatric_rules').map((item, i) => (
                  <li key={i} className="text-xs text-foreground flex gap-2">
                    <span className="text-accent shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Neonate table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-accent mb-2">
                {t('neonate')}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-1 pr-2">{t('weight_kg')}</th>
                      <th className="text-left py-1 pr-2">{t('ett_cuffed')}</th>
                      <th className="text-left py-1 pr-2">{t('ett_uncuffed')}</th>
                      <th className="text-left py-1 pr-2">{t('oral_depth')}</th>
                      <th className="text-left py-1">{t('blade_size')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {neonateTable.map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-1 pr-2 font-medium">{row.weightRange} kg</td>
                        <td className="py-1 pr-2">{row.ettCuffed}</td>
                        <td className="py-1 pr-2">{row.ettUncuffed}</td>
                        <td className="py-1 pr-2">{row.depthCm} cm</td>
                        <td className="py-1">{row.blade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Adult */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-accent mb-2">
                {t('adult')}
              </h4>
              <ul className="space-y-1">
                {resolveList('adult_rules').map((item, i) => (
                  <li key={i} className="text-xs text-foreground flex gap-2">
                    <span className="text-accent shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Armed tube */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-accent mb-2">
                {t('armed_tube')}
              </h4>
              <ul className="space-y-1">
                {resolveList('armed_tube').map((item, i) => (
                  <li key={i} className="text-xs text-foreground flex gap-2">
                    <span className="text-accent shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ETT Calculator */}
            <div className="pt-2 border-t">
              <ETTCalculator />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
