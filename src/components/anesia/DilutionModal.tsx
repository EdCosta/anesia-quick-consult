import { useState, useMemo } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { calculateDilution } from '@/lib/dilution';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DilutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drugName: string;
  initialStockMgPerMl?: number;
}

const SYRINGE_SIZES = [5, 10, 20, 50];

export default function DilutionModal({
  open,
  onOpenChange,
  drugName,
  initialStockMgPerMl,
}: DilutionModalProps) {
  const { t } = useLang();

  const [stockConc, setStockConc] = useState<string>(initialStockMgPerMl?.toString() ?? '');
  const [finalVolume, setFinalVolume] = useState<string>('');
  const [syringeSize, setSyringeSize] = useState<number | null>(null);
  const [targetConc, setTargetConc] = useState<string>('');
  const [desiredDose, setDesiredDose] = useState<string>('');

  const result = useMemo(() => {
    const stock = parseFloat(stockConc);
    if (!stock || stock <= 0) return null;

    const fv = parseFloat(finalVolume) || undefined;
    const tc = parseFloat(targetConc) || undefined;
    const dd = parseFloat(desiredDose) || undefined;

    if (!fv && !syringeSize) return null;
    if (!tc && !dd) return null;

    return calculateDilution({
      stockConcentration_mg_per_ml: stock,
      targetConcentration_mg_per_ml: tc,
      finalVolume_ml: fv,
      syringeVolume_ml: syringeSize ?? undefined,
      desiredDose_mg: dd,
    });
  }, [stockConc, finalVolume, syringeSize, targetConc, desiredDose]);

  const handleSyringeClick = (size: number) => {
    if (syringeSize === size) {
      setSyringeSize(null);
    } else {
      setSyringeSize(size);
      if (!finalVolume) {
        setFinalVolume(size.toString());
      }
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {t('dilution_title')} — {drugName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stock concentration */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t('stock_concentration')}
            </label>
            <input
              type="number"
              value={stockConc}
              onChange={(e) => setStockConc(e.target.value)}
              className={inputClass}
              min="0"
              step="any"
            />
          </div>

          {/* Final volume */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('final_volume')}</label>
            <input
              type="number"
              value={finalVolume}
              onChange={(e) => setFinalVolume(e.target.value)}
              className={inputClass}
              min="0"
              step="any"
            />
          </div>

          {/* Syringe size buttons */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('syringe_size')}</label>
            <div className="mt-1 flex gap-2">
              {SYRINGE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSyringeClick(size)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    syringeSize === size
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {size} mL
                </button>
              ))}
            </div>
          </div>

          {/* Target concentration */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t('target_concentration')}
            </label>
            <input
              type="number"
              value={targetConc}
              onChange={(e) => setTargetConc(e.target.value)}
              className={inputClass}
              min="0"
              step="any"
            />
          </div>

          {/* Or separator */}
          <div className="text-center text-xs text-muted-foreground">— {t('or')} —</div>

          {/* Desired dose */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t('desired_dose')}</label>
            <input
              type="number"
              value={desiredDose}
              onChange={(e) => setDesiredDose(e.target.value)}
              className={inputClass}
              min="0"
              step="any"
            />
          </div>

          {/* Result */}
          {result && result.volumeDrug_ml !== null && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-1">
              <p className="text-xs font-semibold text-accent">{t('dilution_result_label')}</p>
              <p className="text-sm text-foreground">
                {t('dilution_draw')}{' '}
                <span className="font-bold text-primary">{result.volumeDrug_ml} mL</span>{' '}
                {t('dilution_of_drug')} +{' '}
                <span className="font-bold text-primary">{result.volumeDiluent_ml} mL</span>{' '}
                {t('dilution_add_diluent')}
              </p>
              {result.finalConcentration_mg_per_ml !== null && (
                <p className="text-xs text-muted-foreground">
                  = {(result.volumeDrug_ml! + result.volumeDiluent_ml!).toFixed(1)} mL{' '}
                  {t('dilution_at_conc')} {result.finalConcentration_mg_per_ml} mg/mL
                </p>
              )}
            </div>
          )}

          {/* Warnings */}
          {result && result.warnings.length > 0 && (
            <div className="space-y-1">
              {result.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{t(w)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
