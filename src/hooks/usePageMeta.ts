import { useEffect } from 'react';

interface UsePageMetaInput {
  title: string;
  description?: string;
  canonicalPath?: string;
  type?: string;
}

const DEFAULT_TITLE = "AnesIA - Consultation rapide d'anesthesie";
const DEFAULT_DESCRIPTION =
  'Support educatif pour consultation rapide d anesthesie par type de chirurgie';

export function usePageMeta({ title, description, canonicalPath, type }: UsePageMetaInput) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionElement = document.querySelector('meta[name="description"]');
    const ogTitleElement = document.querySelector('meta[property="og:title"]');
    const ogDescriptionElement = document.querySelector('meta[property="og:description"]');
    const ogTypeElement = document.querySelector('meta[property="og:type"]');
    const ogUrlElement = document.querySelector('meta[property="og:url"]');
    const canonicalElement = document.querySelector('link[rel="canonical"]');
    const previousDescription = descriptionElement?.getAttribute('content') || DEFAULT_DESCRIPTION;
    const previousCanonical = canonicalElement?.getAttribute('href') || null;
    const previousOgType = ogTypeElement?.getAttribute('content') || 'website';
    const previousOgUrl = ogUrlElement?.getAttribute('content') || null;
    const nextTitle = title || DEFAULT_TITLE;
    const nextDescription = description || DEFAULT_DESCRIPTION;
    const nextType = type || 'website';
    const nextCanonical =
      canonicalPath && typeof window !== 'undefined'
        ? new URL(canonicalPath, window.location.origin).toString()
        : null;

    document.title = nextTitle;
    descriptionElement?.setAttribute('content', nextDescription);
    ogTitleElement?.setAttribute('content', nextTitle);
    ogDescriptionElement?.setAttribute('content', nextDescription);
    ogTypeElement?.setAttribute('content', nextType);
    if (ogUrlElement && nextCanonical) {
      ogUrlElement.setAttribute('content', nextCanonical);
    }
    if (canonicalElement && nextCanonical) {
      canonicalElement.setAttribute('href', nextCanonical);
    }

    return () => {
      document.title = previousTitle || DEFAULT_TITLE;
      descriptionElement?.setAttribute('content', previousDescription);
      ogTitleElement?.setAttribute('content', previousTitle || DEFAULT_TITLE);
      ogDescriptionElement?.setAttribute('content', previousDescription);
      ogTypeElement?.setAttribute('content', previousOgType);
      if (ogUrlElement) {
        if (previousOgUrl) ogUrlElement.setAttribute('content', previousOgUrl);
        else ogUrlElement.removeAttribute('content');
      }
      if (canonicalElement) {
        if (previousCanonical) canonicalElement.setAttribute('href', previousCanonical);
        else canonicalElement.removeAttribute('href');
      }
    };
  }, [canonicalPath, description, title, type]);
}
