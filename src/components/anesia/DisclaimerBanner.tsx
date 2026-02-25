import { AlertTriangle } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function DisclaimerBanner() {
  const { t } = useLang();

  return (
    <div className="border-b border-disclaimer-border bg-disclaimer-bg">
      <div className="container flex items-center gap-2 py-1.5">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-disclaimer-text" />
        <p className="text-xs font-medium text-disclaimer-text">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
