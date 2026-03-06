import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { trackEvent } from '@/lib/analytics';

interface PublicPageSection {
  title: string;
  body: ReactNode;
}

interface PublicPageProps {
  eyebrow?: string;
  title: string;
  description: string;
  sections: PublicPageSection[];
}

export default function PublicPage({
  eyebrow,
  title,
  description,
  sections,
}: PublicPageProps) {
  usePageMeta({ title: `${title} | AnesIA`, description });

  useEffect(() => {
    trackEvent('public_page_view', { title });
  }, [title]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-4xl space-y-8 py-10">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 clinical-shadow sm:p-8">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </section>

        <div className="grid gap-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 clinical-shadow sm:p-6"
            >
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
