import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Section, { BulletList } from '@/components/anesia/Section';
import DrugDoseRow from '@/components/anesia/DrugDoseRow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProcedurePage() {
  const { id } = useParams<{ id: string }>();
  const { t, resolve, resolveStr } = useLang();
  const { getProcedure, getDrug, loading } = useData();
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
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">{t('back')}</Link>
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
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Link>
          <h1 className="mt-2 text-xl font-bold text-foreground leading-tight">{title}</h1>
          <Badge variant="secondary" className="mt-1.5">{procedure.specialty}</Badge>
        </div>
        <button onClick={toggleFav} className="mt-1 p-1.5">
          <Star className={`h-6 w-6 ${isFav ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
        </button>
      </div>

      {/* Key Points card */}
      {quick && quick.preop.length > 0 && (
        <Card className="border-l-4 border-l-accent clinical-shadow">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">{t('preop')}</h3>
            <BulletList items={quick.preop.slice(0, 3)} />
          </CardContent>
        </Card>
      )}

      {/* Risk Alerts card */}
      {quick && quick.red_flags.length > 0 && (
        <Card className="border-l-4 border-l-clinical-danger clinical-shadow">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-clinical-danger">{t('red_flags')}</h3>
            <BulletList items={quick.red_flags} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {quick && (
        <Tabs defaultValue="preop" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="preop" className="text-xs">{t('preop')}</TabsTrigger>
            <TabsTrigger value="intraop" className="text-xs">{t('intraop')}</TabsTrigger>
            <TabsTrigger value="postop" className="text-xs">{t('postop')}</TabsTrigger>
            <TabsTrigger value="detail" className="text-xs">{t('detail')}</TabsTrigger>
          </TabsList>

          <TabsContent value="preop" className="mt-3">
            <Card className="clinical-shadow">
              <CardContent className="p-4">
                <Section title={t('preop')} variant="preop">
                  <BulletList items={quick.preop} />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intraop" className="mt-3">
            <Card className="clinical-shadow">
              <CardContent className="p-4">
                <Section title={t('intraop')} variant="intraop">
                  <BulletList items={quick.intraop} />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="postop" className="mt-3">
            <Card className="clinical-shadow">
              <CardContent className="p-4">
                <Section title={t('postop')} variant="postop">
                  <BulletList items={quick.postop} />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail" className="mt-3 space-y-3">
            {deep && (
              <>
                <Card className="clinical-shadow">
                  <CardContent className="p-4">
                    <Section title={t('clinical_notes')} variant="info">
                      <BulletList items={deep.clinical} />
                    </Section>
                  </CardContent>
                </Card>
                <Card className="clinical-shadow">
                  <CardContent className="p-4">
                    <Section title={t('pitfalls')} variant="redflag">
                      <BulletList items={deep.pitfalls} />
                    </Section>
                  </CardContent>
                </Card>
                {deep.references.length > 0 && (
                  <Card className="clinical-shadow">
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Drugs & Doses */}
      {quick && quick.drugs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">{t('drugs_doses')}</h2>

          <Card className="clinical-shadow">
            <CardContent className="flex items-center gap-3 p-3">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">{t('weight_kg')}</label>
              <input
                type="number"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                placeholder="70"
                min="1"
                max="300"
                className="w-24 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              {!weight && (
                <span className="text-xs text-muted-foreground">{t('enter_weight')}</span>
              )}
            </CardContent>
          </Card>

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
    </div>
  );
}
