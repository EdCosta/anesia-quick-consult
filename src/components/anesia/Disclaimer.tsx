import { useLang } from '@/contexts/LanguageContext';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  const { t } = useLang();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3">
      <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
      <p className="text-xs font-medium text-accent-foreground">{t('disclaimer')}</p>
    </div>
  );
}
