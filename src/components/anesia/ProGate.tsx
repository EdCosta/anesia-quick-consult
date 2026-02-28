import { ReactNode } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useEntitlements } from '@/hooks/useEntitlements';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProGate({ children, fallback }: ProGateProps) {
  const { isPro, loading } = useEntitlements();
  const { t } = useLang();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (isPro) return <>{children}</>;

  return (
    <>
      <div onClick={() => setShowModal(true)} className="cursor-pointer">
        {fallback || (
          <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">{t('pro_feature')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('pro_feature_desc')}</p>
          </div>
        )}
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              {t('pro_feature')}
            </DialogTitle>
            <DialogDescription>{t('pro_feature_desc')}</DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setShowModal(false);
              navigate('/account');
            }}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('upgrade_pro')}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
