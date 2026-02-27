import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useLang } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null,
  );

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const mode = useMemo<AuthMode>(() => {
    return searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  }, [searchParams]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !checking) navigate('/');
  }, [user, checking, navigate]);

  function updateMode(nextMode: AuthMode) {
    setSearchParams({ mode: nextMode });
    setFeedback(null);
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setFeedback(null);
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setFeedback({ type: 'error', message: error.message });
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail.trim(),
      password: signInPassword,
    });

    if (error) {
      setFeedback({ type: 'error', message: error.message });
      setLoading(false);
      return;
    }

    setFeedback({ type: 'success', message: t('auth_sign_in_success') });
    setLoading(false);
    navigate('/');
  };

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!signUpUsername.trim()) {
      setFeedback({ type: 'error', message: t('auth_username_required') });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: signUpEmail.trim(),
      password: signUpPassword,
      options: {
        data: {
          username: signUpUsername.trim(),
          name: signUpUsername.trim(),
        },
      },
    });

    if (error) {
      setFeedback({ type: 'error', message: error.message });
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      await supabase.from('user_profiles' as any).upsert(
        {
          user_id: data.user.id,
          email: signUpEmail.trim(),
          name: signUpUsername.trim(),
        } as any,
        { onConflict: 'user_id' },
      );
    }

    setFeedback({ type: 'success', message: t('auth_sign_up_success') });
    setLoading(false);

    if (data.session) {
      navigate('/');
    } else {
      setSearchParams({ mode: 'signin' });
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-accent">Anes</span>
              <span className="text-foreground">IA</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('tagline')}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-left clinical-shadow">
            <h2 className="text-base font-semibold text-foreground">
              {mode === 'signup' ? t('auth_create_account') : t('auth_sign_in_title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'signup' ? t('auth_register_subtitle') : t('auth_login_subtitle')}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 clinical-shadow">
          <Tabs value={mode} onValueChange={(value) => updateMode(value as AuthMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('sign_in')}</TabsTrigger>
              <TabsTrigger value="signup">{t('sign_up')}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 pt-2">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="sign-in-email">{t('auth_email')}</Label>
                  <Input
                    id="sign-in-email"
                    type="email"
                    autoComplete="email"
                    value={signInEmail}
                    onChange={(event) => setSignInEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="sign-in-password">{t('auth_password')}</Label>
                  <Input
                    id="sign-in-password"
                    type="password"
                    autoComplete="current-password"
                    value={signInPassword}
                    onChange={(event) => setSignInPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {t('auth_sign_in_cta')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 pt-2">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="sign-up-username">{t('auth_username')}</Label>
                  <Input
                    id="sign-up-username"
                    type="text"
                    autoComplete="username"
                    value={signUpUsername}
                    onChange={(event) => setSignUpUsername(event.target.value)}
                    placeholder={t('auth_username_placeholder')}
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="sign-up-email">{t('auth_email')}</Label>
                  <Input
                    id="sign-up-email"
                    type="email"
                    autoComplete="email"
                    value={signUpEmail}
                    onChange={(event) => setSignUpEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="sign-up-password">{t('auth_password')}</Label>
                  <Input
                    id="sign-up-password"
                    type="password"
                    autoComplete="new-password"
                    value={signUpPassword}
                    onChange={(event) => setSignUpPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {t('auth_sign_up_cta')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('auth_or_continue')}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button onClick={handleGoogleSignIn} disabled={loading} className="w-full gap-2" size="lg">
            <LogIn className="h-4 w-4" />
            {t('sign_in_google')}
          </Button>

          {feedback && (
            <div
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                feedback.type === 'error'
                  ? 'border-destructive/30 bg-destructive/5 text-destructive'
                  : 'border-primary/30 bg-primary/5 text-primary'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
