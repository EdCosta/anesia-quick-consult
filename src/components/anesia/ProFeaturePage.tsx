import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useViewMode } from '@/hooks/useViewMode';

interface ProFeaturePageProps {
  title: string;
  description: string;
}

export default function ProFeaturePage({ title, description }: ProFeaturePageProps) {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isPro, isProView, setViewMode } = useViewMode();
  const isPreviewLocked = isPro && !isProView;

  return (
    <div className="container max-w-2xl py-8">
      <div className="rounded-2xl border border-border bg-card p-6 text-center clinical-shadow">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Crown className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 rounded-xl border-2 border-dashed border-border px-4 py-5">
          <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">
            {isPreviewLocked ? t('switch_mode') : t('pro_feature')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isPreviewLocked ? t('mode_pro') : t('pro_feature_desc')}
          </p>
        </div>
        <button
          onClick={() => {
            if (isPreviewLocked) {
              setViewMode('pro');
              return;
            }
            navigate('/account');
          }}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isPreviewLocked ? t('mode_pro') : t('upgrade_pro')}
        </button>
      </div>
    </div>
  );
}
