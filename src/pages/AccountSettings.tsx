import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Lock, Check, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import { useLang } from '@/contexts/LanguageContext';
import { useEntitlements } from '@/hooks/useEntitlements';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AccountSettingsNav from '@/components/anesia/AccountSettingsNav';

type UserProfileRow = {
  name?: string | null;
  email?: string | null;
};

type ProfileFormState = {
  name: string;
  email: string;
};

function formatDate(value: string | null | undefined, locale: 'fr' | 'en' | 'pt'): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(locale);
}

function getFallbackName(user: User | null): string {
  if (!user) return '';
  const metadata = user.user_metadata as Record<string, unknown> | null;
  const candidate =
    (typeof metadata?.full_name === 'string' && metadata.full_name) ||
    (typeof metadata?.name === 'string' && metadata.name) ||
    (typeof metadata?.username === 'string' && metadata.username) ||
    '';
  return candidate.trim();
}

export default function AccountSettings() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { isPro, plan } = useEntitlements();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({ name: '', email: '' });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    if (!user) {
      navigate('/auth?mode=signin');
    }
  }, [checkingAuth, navigate, user]);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name,email')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        toast.error(
          lang === 'fr'
            ? 'Impossible de charger le profil.'
            : lang === 'pt'
              ? 'Nao foi possivel carregar o perfil.'
              : 'Could not load profile.',
        );
        setLoadingProfile(false);
        return;
      }

      const row = (data ?? null) as UserProfileRow | null;
      const nextForm: ProfileFormState = {
        name: (row?.name || getFallbackName(user)).trim(),
        email: (user.email || row?.email || '').trim(),
      };

      setForm(nextForm);
      setLoadingProfile(false);
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [lang, user]);

  const copy = useMemo(() => {
    if (lang === 'fr') {
      return {
        title: 'Parametres du compte',
        subtitle: 'Mettez a jour vos informations utilisateur et verifiez votre type de compte.',
        fullName: 'Nom complet',
        email: 'Email',
        lockedHint: 'Ces champs sont verrouilles.',
        editParams: 'Modifier parametres',
        validate: 'Valider',
        accountType: 'Type de compte',
        accountTypeHelp: 'Le plan est gere par votre abonnement.',
        details: 'Informations utilisateur',
        userId: 'User ID',
        provider: 'Methode de connexion',
        createdAt: 'Compte cree le',
        lastLogin: 'Derniere connexion',
        personalizationCta: 'Ouvrir personnalisation',
        managePlan: 'Gerer abonnement',
        upgradePlan: 'Passer en Pro',
        emailConfirmation:
          'Email de confirmation envoye. Validez ce nouvel email pour finaliser la modification.',
        saveSuccess: 'Profil mis a jour.',
      };
    }
    if (lang === 'pt') {
      return {
        title: 'Definicoes da conta',
        subtitle: 'Atualize os dados do utilizador e confirme o tipo de conta.',
        fullName: 'Nome completo',
        email: 'Email',
        lockedHint: 'Estes campos estao bloqueados.',
        editParams: 'Modificar parametros',
        validate: 'Validar',
        accountType: 'Tipo de conta',
        accountTypeHelp: 'O plano e gerido pela subscricao.',
        details: 'Informacao do utilizador',
        userId: 'User ID',
        provider: 'Metodo de login',
        createdAt: 'Conta criada em',
        lastLogin: 'Ultimo login',
        personalizationCta: 'Abrir personalizacao',
        managePlan: 'Gerir subscricao',
        upgradePlan: 'Passar para Pro',
        emailConfirmation:
          'Email de confirmacao enviado. Valida esse novo endereco para concluir a alteracao.',
        saveSuccess: 'Perfil atualizado.',
      };
    }
    return {
      title: 'Account settings',
      subtitle: 'Update your user data and verify your account type.',
      fullName: 'Full name',
      email: 'Email',
      lockedHint: 'These fields are locked.',
      editParams: 'Edit details',
      validate: 'Validate',
      accountType: 'Account type',
      accountTypeHelp: 'Plan is managed by your subscription.',
      details: 'User information',
      userId: 'User ID',
      provider: 'Sign-in method',
      createdAt: 'Created at',
      lastLogin: 'Last login',
      personalizationCta: 'Open personalization',
      managePlan: 'Manage subscription',
      upgradePlan: 'Upgrade to Pro',
      emailConfirmation:
        'Confirmation email sent. Validate the new address to finalize the change.',
      saveSuccess: 'Profile updated.',
    };
  }, [lang]);

  const providerLabel = useMemo(() => {
    if (!user) return '-';
    const providers = user.app_metadata?.providers as string[] | undefined;
    if (Array.isArray(providers) && providers.length > 0) {
      return providers.join(', ');
    }
    const provider = user.app_metadata?.provider as string | undefined;
    return provider || 'email';
  }, [user]);

  async function handleValidateProfile() {
    if (!user) return;
    const nextName = form.name.trim();
    const nextEmail = form.email.trim().toLowerCase();

    if (!nextName || !nextEmail) {
      toast.error(
        lang === 'fr'
          ? 'Nom et email sont obligatoires.'
          : lang === 'pt'
            ? 'Nome e email sao obrigatorios.'
            : 'Name and email are required.',
      );
      return;
    }

    setSaving(true);
    try {
      const currentEmail = (user.email || '').trim().toLowerCase();
      const emailChanged = currentEmail !== nextEmail;

      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({ email: nextEmail });
        if (emailError) {
          throw emailError;
        }
      }

      const { error: profileError } = await supabase.from('user_profiles').upsert(
        {
          user_id: user.id,
          name: nextName,
          email: nextEmail,
        },
        { onConflict: 'user_id' },
      );
      if (profileError) {
        throw profileError;
      }

      setForm({ name: nextName, email: nextEmail });
      setIsEditing(false);
      toast.success(emailChanged ? copy.emailConfirmation : copy.saveSuccess);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container max-w-3xl space-y-5 py-6">
      <Link to="/account" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <AccountSettingsNav active="profile" />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="account-name">{copy.fullName}</Label>
              <Input
                id="account-name"
                value={form.name}
                disabled={!isEditing || loadingProfile || saving}
                readOnly={!isEditing}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="account-email">{copy.email}</Label>
              <Input
                id="account-email"
                type="email"
                value={form.email}
                disabled={!isEditing || loadingProfile || saving}
                readOnly={!isEditing}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <Button className="gap-2" onClick={() => void handleValidateProfile()} disabled={saving || loadingProfile}>
                <Check className="h-4 w-4" />
                {copy.validate}
              </Button>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{copy.lockedHint}</span>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsEditing(true)}
                  disabled={loadingProfile}
                >
                  <Pencil className="h-4 w-4" />
                  {copy.editParams}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{copy.accountType}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={isPro ? 'default' : 'secondary'} className="gap-1">
              {isPro && <Crown className="h-3.5 w-3.5" />}
              {plan === 'pro' ? t('plan_pro') : t('plan_free')}
            </Badge>
            <span className="text-sm text-muted-foreground">{copy.accountTypeHelp}</span>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/account">{isPro ? copy.managePlan : copy.upgradePlan}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{copy.details}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">{copy.userId}: </span>
            <span className="font-mono text-xs">{user?.id ?? '-'}</span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">{copy.provider}: </span>
            <span>{providerLabel}</span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">{copy.createdAt}: </span>
            <span>{formatDate(user?.created_at, lang)}</span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">{copy.lastLogin}: </span>
            <span>{formatDate(user?.last_sign_in_at, lang)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
