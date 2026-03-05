import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import type { SupportedLang } from '@/lib/types';

type I18n = Partial<Record<SupportedLang, string>>;

interface AbxRow {
  specialty: I18n;
  intervention: I18n;
  sfar: I18n;
  upToDate?: I18n;
}

const SFAR_URL = 'https://sfar.org/antibioprophylaxie-en-chirurgie-et-medecine-interventionnelle/';
const UPTODATE_URL =
  'https://www.uptodate.com/contents/antimicrobial-prophylaxis-for-prevention-of-surgical-site-infection-in-adults';

const UI_COPY: Record<SupportedLang, Record<string, string>> = {
  fr: {
    title: 'Antibioprophylaxie: SFAR + UpToDate',
    subtitle:
      "Tableau pratique par spécialité/intervention avec schéma SFAR et complément UpToDate lorsqu’il diffère.",
    sourceSfar: 'Source SFAR (RFE 2024)',
    sourceUtd: 'Source UpToDate (tables comparées)',
    important:
      'Validation clinique obligatoire: protocole local, allergies, colonisation MRSA/BLSE, fonction rénale, poids, grossesse, risque infectieux.',
    search: 'Filtrer par spécialité, intervention, molécule, dose...',
    colSpecialty: 'Spécialité',
    colIntervention: 'Intervention',
    colRegimen: 'Schéma',
    sfarLabel: 'SFAR',
    uptodateLabel: 'UpToDate',
    noResults: 'Aucun résultat.',
  },
  pt: {
    title: 'Antibioprofilaxia: SFAR + UpToDate',
    subtitle:
      'Tabela prática por especialidade/intervenção com esquema SFAR e complemento UpToDate quando diferente.',
    sourceSfar: 'Fonte SFAR (RFE 2024)',
    sourceUtd: 'Fonte UpToDate (tabelas comparadas)',
    important:
      'Validação clínica obrigatória: protocolo local, alergias, colonização MRSA/BLSE, função renal, peso, gravidez e risco infecioso.',
    search: 'Filtrar por especialidade, intervenção, molécula, dose...',
    colSpecialty: 'Especialidade',
    colIntervention: 'Intervenção',
    colRegimen: 'Esquema',
    sfarLabel: 'SFAR',
    uptodateLabel: 'UpToDate',
    noResults: 'Sem resultados.',
  },
  en: {
    title: 'Antibiotic prophylaxis: SFAR + UpToDate',
    subtitle:
      'Practical specialty/procedure table with SFAR regimen and UpToDate details where it differs.',
    sourceSfar: 'SFAR source (2024 guideline)',
    sourceUtd: 'UpToDate source (compared tables)',
    important:
      'Clinical validation required: local protocol, allergies, MRSA/ESBL colonization, renal function, weight, pregnancy, infection risk.',
    search: 'Filter by specialty, procedure, drug, dose...',
    colSpecialty: 'Specialty',
    colIntervention: 'Procedure',
    colRegimen: 'Regimen',
    sfarLabel: 'SFAR',
    uptodateLabel: 'UpToDate',
    noResults: 'No results.',
  },
};

const ROWS: AbxRow[] = [
  {
    specialty: { fr: 'Neurochirurgie' },
    intervention: { fr: 'Craniotomie élective / dérivation LCR / pompe intrathécale' },
    sfar: { fr: 'Céfazoline 2 g IVL; réinjection 1 g si durée > 4 h puis q4h.' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h) OU vancomycine 15 mg/kg (max 2 g, q12h) OU clindamycine 900 mg IV (q6h).',
    },
  },
  {
    specialty: { fr: 'Neurochirurgie' },
    intervention: { fr: 'Biopsie cérébrale / dérivation lombaire externe' },
    sfar: { fr: 'PAS D’ANTIBIOPROPHYLAXIE.' },
  },

  {
    specialty: { fr: 'ORL / Maxillo-facial / Ophtalmologie' },
    intervention: { fr: 'Chirurgie ORL propre avec prothèse (hors tympanostomie)' },
    sfar: { fr: 'Selon geste: céfazoline ou amoxicilline-clavulanate.' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h) OU céfuroxime 1,5 g IV (q4h) OU vancomycine 15 mg/kg (max 2 g) OU clindamycine 900 mg IV.',
    },
  },
  {
    specialty: { fr: 'ORL / Maxillo-facial / Ophtalmologie' },
    intervention: { fr: 'Chirurgie ORL propre-contaminée (ex: carcinologique cervico-faciale)' },
    sfar: { fr: 'Amoxicilline/Clavulanate 2 g IVL (redose q2h); ± poursuite postop selon geste.' },
    upToDate: {
      fr: 'Céfazoline (2 g/3 g selon poids) + métronidazole 500 mg IV OU céfuroxime 1,5 g IV + métronidazole 500 mg IV OU ampicilline-sulbactam 3 g IV.',
    },
  },
  {
    specialty: { fr: 'ORL / Maxillo-facial / Ophtalmologie' },
    intervention: { fr: 'Adénoïdectomie / chirurgie rhinologique sans greffon' },
    sfar: { fr: 'PAS D’ANTIBIOPROPHYLAXIE.' },
    upToDate: { fr: 'Chirurgie ORL propre: généralement pas de prophylaxie de routine.' },
  },
  {
    specialty: { fr: 'ORL / Maxillo-facial / Ophtalmologie' },
    intervention: { fr: 'Cataracte' },
    sfar: {
      fr: 'Céfuroxime intracamérulaire 1 mg/0,1 mL dose unique (alternative moxifloxacine intracamérulaire).',
    },
  },

  {
    specialty: { fr: 'Cardiaque' },
    intervention: { fr: 'Pontage coronaire / stimulateur / dispositifs ventriculaires' },
    sfar: {
      fr: 'Céfazoline 2 g IVL (redose q4h) ou céfuroxime 1,5 g IVL (redose q2h); schéma CEC spécifique possible.',
    },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h) OU céfuroxime 1,5 g IV (q4h) OU vancomycine 15 mg/kg (max 2 g) OU clindamycine 900 mg IV (q6h).',
    },
  },

  {
    specialty: { fr: 'Chirurgie vasculaire' },
    intervention: { fr: 'Chirurgie artérielle avec prothèse / aorte abdominale / incision inguinale' },
    sfar: { fr: 'Céfazoline 2 g IVL (redose q4h) ou céfuroxime 1,5 g IVL (redose q2h).' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h) OU vancomycine 15 mg/kg (max 2 g) OU clindamycine 900 mg IV (q6h).',
    },
  },
  {
    specialty: { fr: 'Chirurgie vasculaire' },
    intervention: { fr: 'Amputation de membre inférieur pour ischémie' },
    sfar: { fr: 'Souvent amoxicilline/clavulanate en contexte non septique selon tableau.' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h) OU vancomycine 15 mg/kg (max 2 g) OU clindamycine 900 mg IV (q6h).',
    },
  },
  {
    specialty: { fr: 'Procédures percutanées' },
    intervention: { fr: 'Angiographie/angioplastie/stent (sans facteur de risque infectieux)' },
    sfar: { fr: 'Majoritairement PAS D’ANTIBIOPROPHYLAXIE (selon acte/risque).' },
    upToDate: { fr: 'Pas de prophylaxie de routine.' },
  },
  {
    specialty: { fr: 'Procédures percutanées' },
    intervention: { fr: 'Endoprothèse (endograft) / accès veineux tunnelisé à haut risque' },
    sfar: { fr: 'AP possible selon acte et facteurs de risque.' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV; si allergie: vancomycine 15 mg/kg (max 2 g) ou clindamycine 900 mg.',
    },
  },

  {
    specialty: { fr: 'Thoracique non cardiaque' },
    intervention: { fr: 'Lobectomie / pneumonectomie / résection pulmonaire / thoracotomie' },
    sfar: { fr: 'Céfazoline (ou céfuroxime, ou amoxicilline/clavulanate selon contexte).' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h) OU ampicilline-sulbactam 3 g IV (q2h) OU vancomycine 15 mg/kg (max 2 g) OU clindamycine 900 mg IV (q6h).',
    },
  },

  {
    specialty: { fr: 'Orthopédie / Traumatologie' },
    intervention: { fr: 'Chirurgie propre main/genou/pied sans matériel implanté' },
    sfar: { fr: 'Selon geste: souvent pas d’AP de routine.' },
    upToDate: { fr: 'Pas de prophylaxie de routine.' },
  },
  {
    specialty: { fr: 'Orthopédie / Traumatologie' },
    intervention: {
      fr: 'Rachis, fracture de hanche, fixation interne, arthroplastie totale, ablation de matériel',
    },
    sfar: { fr: 'Céfazoline 2 g IVL (redose q4h); alternatives selon allergie/écologie.' },
    upToDate: {
      fr: 'Sans colonisation MRSA: céfazoline 2 g/3 g selon poids (q4h). Colonisation MRSA: céfazoline + vancomycine 15 mg/kg (max 2 g). Allergie sévère bêta-lactamines: vancomycine seule.',
    },
  },

  {
    specialty: { fr: 'Sein / Plastique' },
    intervention: {
      fr: 'Réduction mammaire, mammoplastie, tumorectomie, mastectomie prophylactique',
    },
    sfar: { fr: 'Selon tableau SFAR: souvent PAS D’AP pour gestes de plus faible risque.' },
    upToDate: { fr: 'Pas de prophylaxie de routine.' },
  },
  {
    specialty: { fr: 'Sein / Plastique' },
    intervention: { fr: 'Chirurgie carcinologique mammaire (ex: curage axillaire, mastectomie cancer)' },
    sfar: { fr: 'Céfazoline 2 g IVL (redose q4h) selon type de geste et reconstruction.' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h) OU vancomycine 15 mg/kg (max 2 g) OU clindamycine 900 mg IV (q6h).',
    },
  },

  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: { fr: 'Chirurgie gastroduodénale avec ouverture de la lumière digestive' },
    sfar: { fr: 'Souvent céfazoline (ou alternatives selon acte).' },
    upToDate: { fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h).' },
  },
  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: {
      fr: 'Chirurgie gastroduodénale sans ouverture de lumière (vagotomie sélective, anti-reflux)',
    },
    sfar: { fr: 'AP selon type de chirurgie et facteurs de risque.' },
    upToDate: { fr: 'Haut risque uniquement: céfazoline 2 g/3 g selon poids (q4h).' },
  },
  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: { fr: 'Chirurgie biliaire/pancréatique (ouverte ou laparoscopie haut risque)' },
    sfar: { fr: 'Céfazoline ou céfuroxime selon profil; pas d’AP dans certains profils bas risque.' },
    upToDate: {
      fr: 'Céfazoline 2 g/3 g selon poids (préféré) OU céfotétan 2 g (q6h) OU céfoxitine 2 g (q2h) OU ampicilline-sulbactam 3 g (q2h). Laparoscopie bas risque: pas d’AP.',
    },
  },
  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: { fr: 'Appendicectomie' },
    sfar: { fr: 'Céfoxitine 2 g IVL (redose q2h) dans le tableau adulte.' },
    upToDate: {
      fr: 'Option préférée: céfazoline 2 g/3 g selon poids + métronidazole 500 mg IV. Alternatives: céfoxitine 2 g (q2h) ou céfotétan 2 g (q6h).',
    },
  },
  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: { fr: 'Chirurgie de l’intestin grêle non obstrué' },
    sfar: { fr: 'Schéma dépendant du geste (souvent céfoxitine en chirurgie d’ouverture digestive).' },
    upToDate: { fr: 'Céfazoline 2 g/3 g selon poids (q4h).' },
  },
  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: { fr: 'Chirurgie de l’intestin grêle obstrué' },
    sfar: { fr: 'Céfoxitine 2 g IVL (redose q2h) fréquent selon tableau.' },
    upToDate: {
      fr: 'Option préférée: céfazoline 2 g/3 g selon poids + métronidazole 500 mg IV. Alternatives: céfoxitine 2 g (q2h) ou céfotétan 2 g (q6h).',
    },
  },
  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: { fr: 'Cure de hernie' },
    sfar: { fr: 'Hernie de l’aine sans prothèse: souvent PAS D’AP; avec prothèse: AP discutée.' },
    upToDate: { fr: 'Céfazoline 2 g/3 g selon poids (q4h).' },
  },
  {
    specialty: { fr: 'Digestif / Bariatrique' },
    intervention: { fr: 'Chirurgie colorectale' },
    sfar: { fr: 'Préparation orale veille: tobramycine 200 mg + métronidazole 1 g per os.' },
    upToDate: {
      fr: 'Parentéral préféré: céfazoline 2 g/3 g + métronidazole 500 mg IV. Alternatives: céfoxitine 2 g, céfotétan 2 g, ampicilline-sulbactam 3 g. Option orale avec préparation colique: néomycine + érythromycine ou néomycine + métronidazole.',
    },
  },

  {
    specialty: { fr: 'Gynécologie / Obstétrique' },
    intervention: {
      fr: 'Hystérectomie (abdominale, vaginale, coelioscopique/robotique) + reconstruction pelvienne',
    },
    sfar: { fr: 'Selon geste: céfoxitine 2 g IVL (q2h) ou céfazoline/céfuroxime (q4h/q2h).' },
    upToDate: {
      fr: 'ACOG: céfazoline 2 g/3 g selon poids OU céfoxitine 2 g OU céfotétan 2 g. Alternatives allergie: ampicilline-sulbactam 3 g ou clindamycine/vancomycine + gentamicine/aztréonam/fluoroquinolone; ou métronidazole + gentamicine/fluoroquinolone.',
    },
  },
  {
    specialty: { fr: 'Gynécologie / Obstétrique' },
    intervention: { fr: 'Césarienne (membranes intactes, pas de travail)' },
    sfar: { fr: 'Céfazoline 2 g IVL; redose si durée > 4 h.' },
    upToDate: {
      fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV. Alternative allergie immédiate: clindamycine 900 mg + gentamicine 5 mg/kg.',
    },
  },
  {
    specialty: { fr: 'Gynécologie / Obstétrique' },
    intervention: { fr: 'Césarienne en travail / membranes rompues' },
    sfar: { fr: 'Céfazoline 2 g IVL (redose selon durée).' },
    upToDate: {
      fr: 'Céfazoline 2 g/3 g selon poids + azithromycine 500 mg IV. Alternative allergie: clindamycine 900 mg + gentamicine 5 mg/kg + azithromycine 500 mg IV.',
    },
  },
  {
    specialty: { fr: 'Gynécologie / Obstétrique' },
    intervention: { fr: 'Évacuation utérine (avortement chirurgical, aspiration, D&C, D&E)' },
    sfar: { fr: 'Selon contexte: souvent pas d’AP de routine pour gestes courts non compliqués.' },
    upToDate: { fr: 'Doxycycline 200 mg per os (dose unique).' },
  },
  {
    specialty: { fr: 'Gynécologie / Obstétrique' },
    intervention: {
      fr: 'Laparoscopie diagnostique, stérilisation tubaire, hystéroscopie/cystoscopie simple, DIU, biopsie endomètre',
    },
    sfar: { fr: 'Plusieurs de ces gestes: PAS D’ANTIBIOPROPHYLAXIE.' },
    upToDate: { fr: 'Pas de prophylaxie de routine.' },
  },
  {
    specialty: { fr: 'Gynécologie / Obstétrique' },
    intervention: { fr: 'Hystérosalpingographie / chromotubation' },
    sfar: { fr: 'Pas d’AP systématique hors facteurs de risque.' },
    upToDate: {
      fr: 'Pas d’AP de routine; si antécédent PID/trompes pathologiques: doxycycline 100 mg x2/j pendant 5 jours (et chromotubation: céfazoline 2 g IV préop + doxycycline).',
    },
  },

  {
    specialty: { fr: 'Urologie' },
    intervention: { fr: 'RTUP / chirurgie urologique ouverte-laparoscopique avec entrée voies urinaires' },
    sfar: { fr: 'Céfazoline 2 g IVL (q4h) ou céfuroxime 1,5 g IVL (q2h).' },
    upToDate: { fr: 'Céfazoline <120 kg: 2 g IV, ≥120 kg: 3 g IV (q4h).' },
  },
  {
    specialty: { fr: 'Urologie' },
    intervention: {
      fr: 'Cystoscopie seule (haut risque) / cystoscopie avec manipulation (biopsie transrectale, urétéroscopie, lithotritie)',
    },
    sfar: {
      fr: 'Biopsie transrectale: fosfomycine-trométamol 3 g per os (alternative ciprofloxacine 500 mg per os).',
    },
    upToDate: {
      fr: 'Ciprofloxacine 500 mg per os ou 400 mg IV OU triméthoprime-sulfaméthoxazole 160/800 mg per os (dose unique).',
    },
  },
  {
    specialty: { fr: 'Urologie' },
    intervention: { fr: 'Prostatectomie totale / biopsie trans-périnéale / lithotritie extracorporelle' },
    sfar: { fr: 'PAS D’ANTIBIOPROPHYLAXIE.' },
  },
];

function useUiText(lang: SupportedLang) {
  return UI_COPY[lang] ?? UI_COPY.fr;
}

export default function AntibioprophylaxieTable() {
  const { t, lang, resolveStr } = useLang();
  const ui = useUiText(lang);
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ROWS;

    return ROWS.filter((row) => {
      const searchable = [
        resolveStr(row.specialty),
        resolveStr(row.intervention),
        resolveStr(row.sfar),
        resolveStr(row.upToDate),
        row.specialty.fr ?? '',
        row.intervention.fr ?? '',
        row.sfar.fr ?? '',
        row.upToDate?.fr ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [resolveStr, search]);

  return (
    <div className="container space-y-4 py-6">
      <div className="space-y-2">
        <Link
          to="/guidelines"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{ui.title}</h1>
        <p className="text-sm text-muted-foreground">{ui.subtitle}</p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={SFAR_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {ui.sourceSfar}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href={UPTODATE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {ui.sourceUtd}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">{ui.important}</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={ui.search}
          className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card clinical-shadow">
        <table className="min-w-full table-auto text-left">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground">
                {ui.colSpecialty}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground">
                {ui.colIntervention}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground">
                {ui.colRegimen}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-sm text-muted-foreground">
                  {ui.noResults}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr key={`${resolveStr(row.intervention)}-${idx}`} className="border-b align-top last:border-b-0">
                  <td className="px-4 py-3 text-xs font-semibold text-card-foreground sm:text-sm">
                    {resolveStr(row.specialty)}
                  </td>
                  <td className="px-4 py-3 text-xs text-card-foreground sm:text-sm">
                    {resolveStr(row.intervention)}
                  </td>
                  <td className="space-y-2 px-4 py-3 text-xs text-card-foreground sm:text-sm">
                    <p>
                      <span className="font-semibold text-foreground">{ui.sfarLabel}: </span>
                      {resolveStr(row.sfar)}
                    </p>
                    {row.upToDate && (
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{ui.uptodateLabel}: </span>
                        {resolveStr(row.upToDate)}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
