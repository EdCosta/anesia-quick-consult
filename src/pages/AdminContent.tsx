import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import Disclaimer from '@/components/anesia/Disclaimer';

export default function AdminContent() {
  const { t } = useLang();

  return (
    <div className="container max-w-2xl space-y-6 py-6">
      <div>
        <Link to="/" className="text-sm text-primary hover:underline">
          {t('back')}
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-foreground">{t('admin_title')}</h1>
      </div>

      {/* File locations */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          📁 Fichiers de données
        </h2>
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="text-sm text-card-foreground">
            Les données sont dans des fichiers JSON statiques :
          </p>
          <ul className="space-y-1 text-sm text-card-foreground">
            <li>
              •{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                public/data/procedures.v3.json
              </code>{' '}
              — Procédures chirurgicales
            </li>
            <li>
              •{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                public/data/drugs.v1.json
              </code>{' '}
              — Bibliothèque de médicaments
            </li>
          </ul>
        </div>
      </section>

      {/* Add procedure */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          ➕ Ajouter une nouvelle chirurgie
        </h2>
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <p className="text-sm text-card-foreground">
            Ouvrir{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              procedures.v3.json
            </code>{' '}
            et ajouter un objet dans le tableau :
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-card-foreground leading-relaxed">
            {`{
  "id": "nouveau_id_unique",
  "specialty": "Spécialité",
  "titles": {
    "fr": "Titre FR",
    "pt": "Título PT",
    "en": "Title EN"
  },
  "synonyms": {
    "fr": ["syn1", "syn2"]
  },
  "quick": {
    "fr": {
      "preop": ["Item 1", "Item 2"],
      "intraop": ["Item 1"],
      "postop": ["Item 1"],
      "red_flags": ["Item 1"],
      "drugs": [
        { "drug_id": "paracetamol", "indication_tag": "analgésie" }
      ]
    }
  },
  "deep": {
    "fr": {
      "clinical": ["Note 1"],
      "pitfalls": ["Piège 1"],
      "references": [
        { "source": "Source", "year": 2024, "note": "..." }
      ]
    }
  }
}`}
          </pre>
        </div>
      </section>

      {/* Add drug */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          💊 Ajouter un nouveau médicament
        </h2>
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <p className="text-sm text-card-foreground">
            Ouvrir{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">drugs.v1.json</code>{' '}
            et ajouter :
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-card-foreground leading-relaxed">
            {`{
  "id": "nom_medicament",
  "name": { "fr": "Nom FR", "pt": "Nome PT", "en": "Name EN" },
  "dose_rules": [
    {
      "indication_tag": "analgésie",
      "route": "IV",
      "mg_per_kg": 10,
      "max_mg": 500,
      "notes": ["Note importante"]
    }
  ],
  "concentrations": [
    { "label": "10 mg/mL", "mg_per_ml": 10 }
  ],
  "contraindications_notes": ["CI 1"],
  "renal_hepatic_notes": ["Ajustement si IRC"]
}`}
          </pre>
        </div>
      </section>

      {/* Link drug to procedure */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          🔗 Relier un médicament à une chirurgie
        </h2>
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <p className="text-sm text-card-foreground">
            Dans la procédure, ajouter une entrée dans{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">quick.fr.drugs</code>{' '}
            :
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-card-foreground leading-relaxed">
            {`{
  "drug_id": "nom_medicament",
  "indication_tag": "analgésie"
}`}
          </pre>
          <p className="text-sm text-card-foreground">
            Le{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">indication_tag</code>{' '}
            doit correspondre à un{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">indication_tag</code>{' '}
            dans les{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">dose_rules</code> du
            médicament.
          </p>
        </div>
      </section>

      {/* Rules */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          📐 Règles de calcul de dose
        </h2>
        <div className="rounded-lg border bg-card p-4 space-y-2 text-sm text-card-foreground">
          <p>
            <strong>
              Si <code>mg_per_kg</code> existe :
            </strong>
          </p>
          <ul className="space-y-1 ml-4">
            <li>
              • <code>dose = mg_per_kg × poids</code>
            </li>
            <li>
              • <code>dose_finale = min(dose, max_mg)</code>
            </li>
            <li>
              • <code>volume = dose_finale / mg_per_ml</code> (si concentration disponible)
            </li>
          </ul>
          <p className="mt-2">
            <strong>
              Si <code>mg_per_kg = null</code> :
            </strong>
          </p>
          <ul className="ml-4">
            <li>• Afficher « À définir selon protocole local »</li>
            <li>
              • Utiliser <code>unit_override</code> pour indiquer l'unité (ex: µg, MAC)
            </li>
            <li>
              • Les <code>notes</code> contiennent les indications posologiques textuelles
            </li>
          </ul>
        </div>
      </section>

      {/* i18n */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">🌐 Multilangue</h2>
        <div className="rounded-lg border bg-card p-4 space-y-2 text-sm text-card-foreground">
          <p>
            Pour ajouter PT ou EN à une procédure, dupliquer la structure <code>quick.fr</code> dans{' '}
            <code>quick.pt</code> ou <code>quick.en</code>.
          </p>
          <p>Fallback automatique : si la langue sélectionnée n'existe pas → FR → PT → EN.</p>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
