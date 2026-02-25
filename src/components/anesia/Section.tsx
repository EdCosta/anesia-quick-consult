import { ReactNode } from 'react';

type SectionVariant = 'preop' | 'intraop' | 'postop' | 'redflag' | 'info';

const VARIANT_STYLES: Record<SectionVariant, string> = {
  preop: 'border-l-section-preop bg-section-preop-bg',
  intraop: 'border-l-section-intraop bg-section-intraop-bg',
  postop: 'border-l-section-postop bg-section-postop-bg',
  redflag: 'border-l-section-redflag bg-section-redflag-bg',
  info: 'border-l-primary bg-primary/5',
};

interface SectionProps {
  title: string;
  variant: SectionVariant;
  children: ReactNode;
}

export default function Section({ title, variant, children }: SectionProps) {
  return (
    <div className={`rounded-r-lg border-l-4 p-4 ${VARIANT_STYLES[variant]} animate-fade-in`}>
      <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-foreground/80">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-card-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
