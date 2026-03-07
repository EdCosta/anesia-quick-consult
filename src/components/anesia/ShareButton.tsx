import { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useLang } from '@/contexts/LanguageContext';

interface ShareButtonProps {
  url?: string;
  title?: string;
  variant?: 'default' | 'icon';
}

export default function ShareButton({ url, title, variant = 'default' }: ShareButtonProps) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  const resolvedUrl = url
    ? url.startsWith('http')
      ? url
      : `${window.location.origin}${url}`
    : window.location.href;

  const label = lang === 'fr' ? 'Partager' : lang === 'pt' ? 'Partilhar' : 'Share';
  const copiedLabel = lang === 'fr' ? 'Copie !' : lang === 'pt' ? 'Copiado!' : 'Copied!';

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || document.title, url: resolvedUrl });
      } catch {
        // user cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      toast.success(copiedLabel);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(lang === 'fr' ? 'Impossible de copier le lien' : 'Could not copy link');
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
        title={label}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      </button>
    );
  }

  return (
    <Button variant="outline" onClick={handleShare} className="gap-2">
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
