import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Disclaimer from '@/components/anesia/Disclaimer';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface HospitalProfileOption {
  id: string;
  name: string;
}

interface DrugOption {
  id: string;
  label: string;
}

interface PresentationOption {
  id: string;
  drug_id: string;
  label: string;
}

interface DilutionOption {
  id: string;
  drug_id: string;
  label: string;
}

interface AvailabilityEntry {
  hospital_id: string;
  drug_id: string;
  is_available: boolean;
  preferred_presentation_id: string | null;
  preferred_dilution_id: string | null;
  alternative_drug_id: string | null;
  local_note: string | null;
}

const EMPTY_FORM = {
  is_available: true,
  preferred_presentation_id: '',
  preferred_dilution_id: '',
  alternative_drug_id: '',
  local_note: '',
};

export default function AdminContent() {
  const { t } = useLang();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<HospitalProfileOption[]>([]);
  const [drugs, setDrugs] = useState<DrugOption[]>([]);
  const [presentations, setPresentations] = useState<PresentationOption[]>([]);
  const [dilutions, setDilutions] = useState<DilutionOption[]>([]);
  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, drugsRes, presentationsRes, dilutionsRes, entriesRes] = await Promise.all([
        supabase.from('hospital_profiles' as any).select('id,name').order('name'),
        supabase.from('drugs' as any).select('id,names').order('id'),
        supabase.from('drug_presentations' as any).select('id,drug_id,label').order('label'),
        supabase.from('standard_dilutions' as any).select('id,drug_id,label').order('label'),
        supabase
          .from('hospital_drug_availability' as any)
          .select(
            'hospital_id,drug_id,is_available,preferred_presentation_id,preferred_dilution_id,alternative_drug_id,local_note',
          )
          .order('hospital_id')
          .order('drug_id'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (drugsRes.error) throw drugsRes.error;
      if (presentationsRes.error) throw presentationsRes.error;
      if (dilutionsRes.error) throw dilutionsRes.error;
      if (entriesRes.error) throw entriesRes.error;

      const profileOptions = ((profilesRes.data as any[]) || []).map((item) => ({
        id: item.id,
        name: item.name,
      }));
      const drugOptions = ((drugsRes.data as any[]) || [])
        .map((item) => ({
          id: item.id,
          label: item.names?.pt || item.names?.fr || item.names?.en || item.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setProfiles(profileOptions);
      setDrugs(drugOptions);
      setPresentations((presentationsRes.data as PresentationOption[]) || []);
      setDilutions((dilutionsRes.data as DilutionOption[]) || []);
      setEntries((entriesRes.data as AvailabilityEntry[]) || []);

      if (profileOptions[0]) {
        setSelectedHospitalId((current) => current || profileOptions[0].id);
      }
      if (drugOptions[0]) {
        setSelectedDrugId((current) => current || drugOptions[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Load failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void loadData();
  }, [isAdmin, loadData]);

  const hospitalEntries = useMemo(() => {
    return entries.filter((entry) => entry.hospital_id === selectedHospitalId);
  }, [entries, selectedHospitalId]);

  const selectedEntry = useMemo(() => {
    return (
      entries.find(
        (entry) => entry.hospital_id === selectedHospitalId && entry.drug_id === selectedDrugId,
      ) || null
    );
  }, [entries, selectedDrugId, selectedHospitalId]);

  const drugPresentations = useMemo(() => {
    return presentations.filter((item) => item.drug_id === selectedDrugId);
  }, [presentations, selectedDrugId]);

  const drugDilutions = useMemo(() => {
    return dilutions.filter((item) => item.drug_id === selectedDrugId);
  }, [dilutions, selectedDrugId]);

  useEffect(() => {
    if (selectedEntry) {
      setForm({
        is_available: selectedEntry.is_available,
        preferred_presentation_id: selectedEntry.preferred_presentation_id || '',
        preferred_dilution_id: selectedEntry.preferred_dilution_id || '',
        alternative_drug_id: selectedEntry.alternative_drug_id || '',
        local_note: selectedEntry.local_note || '',
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [selectedEntry]);

  async function handleSave() {
    if (!selectedHospitalId || !selectedDrugId) {
      toast.error('Select a hospital and a drug');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        hospital_id: selectedHospitalId,
        drug_id: selectedDrugId,
        is_available: form.is_available,
        preferred_presentation_id: form.preferred_presentation_id || null,
        preferred_dilution_id: form.preferred_dilution_id || null,
        alternative_drug_id: form.alternative_drug_id || null,
        local_note: form.local_note.trim() || null,
      };

      const { error } = await supabase
        .from('hospital_drug_availability' as any)
        .upsert(payload, { onConflict: 'hospital_id,drug_id' });

      if (error) throw error;
      toast.success(t('availability_saved'));
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedEntry) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('hospital_drug_availability' as any)
        .delete()
        .eq('hospital_id', selectedEntry.hospital_id)
        .eq('drug_id', selectedEntry.drug_id);

      if (error) throw error;
      toast.success(t('availability_deleted'));
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (adminLoading) {
    return (
      <div className="container max-w-3xl py-6">
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-3xl space-y-4 py-6">
        <Link to="/" className="text-sm text-primary hover:underline">
          {t('back')}
        </Link>
        <div className="rounded-lg border bg-card p-4">
          <h1 className="font-heading text-xl font-bold text-foreground">{t('admin_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('admin_only')}</p>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30';

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <div>
        <Link to="/" className="text-sm text-primary hover:underline">
          {t('back')}
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-foreground">{t('admin_title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin_availability_help')}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {t('hospital_profile')}
          </h2>
          <select
            value={selectedHospitalId}
            onChange={(event) => setSelectedHospitalId(event.target.value)}
            className={inputClass}
            disabled={loading || profiles.length === 0}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>

          <h2 className="font-heading text-lg font-semibold text-foreground">{t('select_drug')}</h2>
          <select
            value={selectedDrugId}
            onChange={(event) => setSelectedDrugId(event.target.value)}
            className={inputClass}
            disabled={loading || drugs.length === 0}
          >
            {drugs.map((drug) => (
              <option key={drug.id} value={drug.id}>
                {drug.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {t('hospital_overrides')}
            </h2>
            <span className="text-xs text-muted-foreground">
              {hospitalEntries.length} {t('entries_count')}
            </span>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {hospitalEntries.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('no_availability_entries')}</p>
            )}
            {hospitalEntries.map((entry) => {
              const drug = drugs.find((item) => item.id === entry.drug_id);
              return (
                <button
                  key={`${entry.hospital_id}-${entry.drug_id}`}
                  onClick={() => setSelectedDrugId(entry.drug_id)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    selectedDrugId === entry.drug_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="font-medium text-foreground">{drug?.label || entry.drug_id}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.is_available ? t('available_locally') : t('stockout_badge')}
                    {entry.alternative_drug_id
                      ? ` · ${t('alternative_drug')}: ${
                          drugs.find((item) => item.id === entry.alternative_drug_id)?.label ||
                          entry.alternative_drug_id
                        }`
                      : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {t('availability_editor')}
          </h2>
          {selectedEntry && (
            <span className="text-xs text-muted-foreground">{t('existing_override')}</span>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-card-foreground">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(event) => setForm((current) => ({ ...current, is_available: event.target.checked }))}
          />
          {t('available_locally')}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('preferred_presentation')}
            </label>
            <select
              value={form.preferred_presentation_id}
              onChange={(event) =>
                setForm((current) => ({ ...current, preferred_presentation_id: event.target.value }))
              }
              className={inputClass}
            >
              <option value="">{t('none_option')}</option>
              {drugPresentations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('preferred_dilution')}
            </label>
            <select
              value={form.preferred_dilution_id}
              onChange={(event) =>
                setForm((current) => ({ ...current, preferred_dilution_id: event.target.value }))
              }
              className={inputClass}
            >
              <option value="">{t('none_option')}</option>
              {drugDilutions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {t('alternative_drug')}
          </label>
          <select
            value={form.alternative_drug_id}
            onChange={(event) =>
              setForm((current) => ({ ...current, alternative_drug_id: event.target.value }))
            }
            className={inputClass}
          >
            <option value="">{t('none_option')}</option>
            {drugs
              .filter((drug) => drug.id !== selectedDrugId)
              .map((drug) => (
                <option key={drug.id} value={drug.id}>
                  {drug.label}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {t('local_note')}
          </label>
          <textarea
            value={form.local_note}
            onChange={(event) => setForm((current) => ({ ...current, local_note: event.target.value }))}
            className={`${inputClass} min-h-24`}
            placeholder={t('local_note_placeholder')}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? t('saving') : t('save_changes')}
          </button>
          <button
            onClick={() => setForm(EMPTY_FORM)}
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            {t('clear')}
          </button>
          {selectedEntry && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="rounded-md border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 disabled:opacity-50"
            >
              {t('delete_override')}
            </button>
          )}
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
