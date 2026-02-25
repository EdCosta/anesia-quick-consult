import { useLang } from '@/contexts/LanguageContext';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  const { t } = useLang();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-disclaimer-border bg-disclaimer-bg p-3">
      <AlertTriangle className="h-4 w-4 shrink-0 text-disclaimer-text" />
      <p className="text-xs font-medium text-disclaimer-text">{t('disclaimer')}</p>
    </div>
  );
}
