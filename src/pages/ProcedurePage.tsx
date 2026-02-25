import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Section, { BulletList } from '@/components/anesia/Section';
import DrugDoseRow from '@/components/anesia/DrugDoseRow';
import Disclaimer from '@/components/anesia/Disclaimer';

export default function ProcedurePage() {
  const { id } = useParams<{ id: string }>();
  const { t, resolve, resolveStr, lang } = useLang();
  const { getProcedure, getDrug, loading } = useData();
  const [mode, setMode] = useState<'court' | 'detail'>('court');
  const [weightKg, setWeightKg] = useState<string>('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('anesia-favorites', []);
  const [recents, setRecents] = useLocalStorage<string[]>('anesia-recents', []);

  const procedure = getProcedure(id || '');
  const isFav = id ? favorites.includes(id) : false;

  useEffect(() => {
    if (id && procedure) {
      setRecents(prev => {
        const filtered = prev.filter(r => r !== id);
        return [id, ...filtered].slice(0, 10);
      });
    }
  }, [id, procedure]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="container max-w-2xl py-8 text-center">
        <p className="text-muted-foreground">Procédure introuvable.</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">{t('back')}</Link>
      </div>
    );
  }

  const title = resolveStr(procedure.titles);
  const quick = resolve(procedure.quick);
  const deep = resolve(procedure.deep);
  const weight = parseFloat(weightKg) || null;

  const toggleFav = () => {
    if (!id) return;
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="container max-w-2xl space-y-5 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/" className="text-sm text-primary hover:underline">{t('back')}</Link>
          <h1 className="mt-1 font-heading text-xl font-bold text-foreground leading-tight">{title}</h1>
          <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {procedure.specialty}
          </span>
        </div>
        <button onClick={toggleFav} className="mt-1 p-1.5">
          <Star className={`h-6 w-6 ${isFav ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
        </button>
      </div>

      {/* Toggle */}
      <div className="flex rounded-xl bg-secondary p-1">
        <button
          onClick={() => setMode('court')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            mode === 'court' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('court')}
        </button>
        <button
          onClick={() => setMode('detail')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            mode === 'detail' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('detail')}
        </button>
      </div>

      {/* Quick sections */}
      {quick && (
        <div className="space-y-3">
          <Section title={t('preop')} variant="preop">
            <BulletList items={quick.preop} />
          </Section>
          <Section title={t('intraop')} variant="intraop">
            <BulletList items={quick.intraop} />
          </Section>
          <Section title={t('postop')} variant="postop">
            <BulletList items={quick.postop} />
          </Section>
          <Section title={t('red_flags')} variant="redflag">
            <BulletList items={quick.red_flags} />
          </Section>
        </div>
      )}

      {/* Deep sections */}
      {mode === 'detail' && deep && (
        <div className="space-y-3">
          <Section title={t('clinical_notes')} variant="info">
            <BulletList items={deep.clinical} />
          </Section>
          <Section title={t('pitfalls')} variant="redflag">
            <BulletList items={deep.pitfalls} />
          </Section>
          {deep.references.length > 0 && (
            <Section title={t('references_title')} variant="info">
              <ul className="space-y-2">
                {deep.references.map((ref, i) => (
                  <li key={i} className="text-xs text-card-foreground">
                    <span className="font-semibold">{ref.source}</span>
                    {ref.year && <span className="text-muted-foreground"> ({ref.year})</span>}
                    {ref.note && <span className="text-muted-foreground"> — {ref.note}</span>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* Drugs & Doses */}
      {quick && quick.drugs.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-base font-bold text-foreground">{t('drugs_doses')}</h2>

          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">{t('weight_kg')}</label>
            <input
              type="number"
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
              placeholder="70"
              min="1"
              max="300"
              className="w-24 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {!weight && (
              <span className="text-xs text-muted-foreground">{t('enter_weight')}</span>
            )}
          </div>

          <div className="space-y-2">
            {quick.drugs.map((drugRef, i) => {
              const drug = getDrug(drugRef.drug_id);
              if (!drug) return null;
              return (
                <DrugDoseRow
                  key={`${drugRef.drug_id}-${drugRef.indication_tag}-${i}`}
                  drug={drug}
                  indicationTag={drugRef.indication_tag}
                  weightKg={weight}
                />
              );
            })}
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
