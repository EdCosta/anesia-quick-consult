import { Link } from 'react-router-dom';
import { UserRound, Palette } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

interface AccountSettingsNavProps {
  active: 'profile' | 'personalization';
}

export default function AccountSettingsNav({ active }: AccountSettingsNavProps) {
  const { lang } = useLang();
  const profileLabel =
    lang === 'fr' ? 'Donnees du compte' : lang === 'pt' ? 'Dados da conta' : 'Account details';
  const personalizationLabel =
    lang === 'fr' ? 'Personnalisation' : lang === 'pt' ? 'Personalizacao' : 'Personalization';

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Link
        to="/account/settings"
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
          active === 'profile'
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
        }`}
      >
        <UserRound className="h-4 w-4" />
        {profileLabel}
      </Link>
      <Link
        to="/account/settings/personalization"
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
          active === 'personalization'
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
        }`}
      >
        <Palette className="h-4 w-4" />
        {personalizationLabel}
      </Link>
    </div>
  );
}
