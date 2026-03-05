import { Fragment } from 'react';

import { cn } from '@/lib/utils';

type ListTone = 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

interface StructuredContentListProps {
  items: string[];
  ordered?: boolean;
  tone?: ListTone;
  className?: string;
}

interface ParsedItem {
  label: string | null;
  body: string;
  number: string | null;
  isAlertLabel: boolean;
  isSectionLabel: boolean;
}

const TONE_STYLES: Record<
  ListTone,
  { marker: string; label: string; section: string; emphasis: string }
> = {
  accent: {
    marker: 'text-accent',
    label: 'text-foreground',
    section: 'text-accent decoration-accent/60',
    emphasis: 'text-accent',
  },
  info: {
    marker: 'text-clinical-info',
    label: 'text-foreground',
    section: 'text-clinical-info decoration-clinical-info/60',
    emphasis: 'text-clinical-info',
  },
  success: {
    marker: 'text-clinical-success',
    label: 'text-foreground',
    section: 'text-clinical-success decoration-clinical-success/60',
    emphasis: 'text-clinical-success',
  },
  warning: {
    marker: 'text-clinical-warning',
    label: 'text-foreground',
    section: 'text-foreground decoration-clinical-warning/70',
    emphasis: 'text-foreground',
  },
  danger: {
    marker: 'text-clinical-danger',
    label: 'text-clinical-danger',
    section: 'text-clinical-danger decoration-clinical-danger/60',
    emphasis: 'text-clinical-danger',
  },
  neutral: {
    marker: 'text-muted-foreground',
    label: 'text-foreground',
    section: 'text-foreground decoration-border',
    emphasis: 'text-foreground',
  },
};

const ALERT_LABEL_RE =
  /^(attention|aten[cç][aã]o|warning|alerta|caution|careful|note|nota|risco|risk|warning sign)$/i;
const SECTION_LABEL_RE = /^(sign in|time out|sign out|plan [abc]|plano [abc])\b/i;
const VALUE_EMPHASIS_RE =
  /(\b\d+(?:[.,]\d+)?(?:-\d+(?:[.,]\d+)?)?\s?(?:mg\/kg|mg|mcg|ug|µg|mL\/h|mL|cm|mm|°C|%|h|min)\b|[<>≤≥]\s?\d+(?:[.,]\d+)?\s?(?:mg\/kg|mg|mcg|ug|µg|mL|cm|mm|°C|%)?)/gu;

function isMostlyUppercase(input: string) {
  const letters = input.replace(/[^A-Za-z]/g, '');
  if (letters.length < 4) return false;
  return letters === letters.toUpperCase();
}

function parseItem(rawItem: string, ordered: boolean, index: number): ParsedItem {
  const trimmed = rawItem.trim();
  const numberMatch = ordered ? trimmed.match(/^(\d+)\.\s*(.+)$/) : null;
  const number = numberMatch?.[1] ?? (ordered ? String(index + 1) : null);
  const text = (numberMatch?.[2] ?? trimmed).trim();

  const separatorIndex = text.indexOf(':');
  const maybeLabel = separatorIndex > 1 ? text.slice(0, separatorIndex).trim() : '';
  const maybeBody = separatorIndex > 1 ? text.slice(separatorIndex + 1).trim() : '';

  const hasStructuredLabel = Boolean(maybeLabel && maybeBody && maybeLabel.length <= 52);
  const label = hasStructuredLabel ? maybeLabel : null;
  const body = hasStructuredLabel ? maybeBody : text;
  const isSectionLabel = Boolean(label && (SECTION_LABEL_RE.test(label) || isMostlyUppercase(label)));
  const isAlertLabel = Boolean(label && ALERT_LABEL_RE.test(label));

  return {
    label,
    body,
    number,
    isAlertLabel,
    isSectionLabel,
  };
}

function renderEmphasizedText(text: string, emphasisClass: string) {
  return text.split(VALUE_EMPHASIS_RE).map((part, index) => {
    if (!part) return null;
    if (index % 2 === 1) {
      return (
        <strong key={`${part}-${index}`} className={cn('font-semibold', emphasisClass)}>
          {part}
        </strong>
      );
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

export default function StructuredContentList({
  items,
  ordered = false,
  tone = 'accent',
  className,
}: StructuredContentListProps) {
  const styles = TONE_STYLES[tone];

  return (
    <ul className={cn('space-y-1.5', className)}>
      {items.map((item, index) => {
        const parsed = parseItem(item, ordered, index);

        return (
          <li key={`${parsed.number ?? 'item'}-${index}`} className="flex gap-2">
            {ordered ? (
              <span className={cn('w-5 shrink-0 pt-0.5 text-right text-xs font-semibold', styles.marker)}>
                {parsed.number}.
              </span>
            ) : (
              <span className={cn('shrink-0 pt-[3px] text-sm leading-none', styles.marker)}>•</span>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs leading-[1.45] text-card-foreground sm:text-sm">
                {parsed.isSectionLabel && parsed.label && (
                  <span
                    className={cn(
                      'font-bold uppercase underline underline-offset-2',
                      parsed.isAlertLabel ? TONE_STYLES.danger.section : styles.section,
                    )}
                  >
                    {parsed.label}:&nbsp;
                  </span>
                )}
                {!parsed.isSectionLabel && parsed.label && (
                  <span
                    className={cn(
                      'font-semibold underline underline-offset-2',
                      parsed.isAlertLabel ? TONE_STYLES.danger.label : styles.label,
                    )}
                  >
                    {parsed.label}:&nbsp;
                  </span>
                )}
                <span className={parsed.isAlertLabel ? 'italic' : undefined}>
                  {renderEmphasizedText(
                    parsed.body,
                    parsed.isAlertLabel ? TONE_STYLES.danger.emphasis : styles.emphasis,
                  )}
                </span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
