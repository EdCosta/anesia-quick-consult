import { ClipboardCheck, ListChecks, ShieldAlert, HeartPulse } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

const PROTOCOLS = [
  { icon: ListChecks, label: { fr: 'Checklist pré-op OMS', pt: 'Checklist pré-op OMS', en: 'WHO pre-op checklist' } },
  { icon: ShieldAlert, label: { fr: 'Protocole PONV', pt: 'Protocolo NVPO', en: 'PONV protocol' } },
  { icon: HeartPulse, label: { fr: 'Protocole hémorragie massive', pt: 'Protocolo hemorragia maciça', en: 'Massive hemorrhage protocol' } },
  { icon: ClipboardCheck, label: { fr: 'Checklist sécurité bloc', pt: 'Checklist segurança bloco', en: 'OR safety checklist' } },
];

export default function Protocoles() {
  const { t, resolveStr } = useLang();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-accent" />
          {t('protocoles')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('protocoles_desc')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROTOCOLS.map((proto, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 clinical-shadow hover:clinical-shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <proto.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{resolveStr(proto.label)}</h3>
            </div>
            <Badge variant="secondary" className="text-xs">{t('coming_soon')}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
