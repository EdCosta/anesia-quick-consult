import { useEffect } from 'react';

interface UsePageMetaInput {
  title: string;
  description?: string;
}

const DEFAULT_TITLE = "AnesIA - Consultation rapide d'anesthesie";
const DEFAULT_DESCRIPTION =
  'Support educatif pour consultation rapide d anesthesie par type de chirurgie';

export function usePageMeta({ title, description }: UsePageMetaInput) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionElement = document.querySelector('meta[name="description"]');
    const ogTitleElement = document.querySelector('meta[property="og:title"]');
    const ogDescriptionElement = document.querySelector('meta[property="og:description"]');
    const previousDescription = descriptionElement?.getAttribute('content') || DEFAULT_DESCRIPTION;
    const nextTitle = title || DEFAULT_TITLE;
    const nextDescription = description || DEFAULT_DESCRIPTION;

    document.title = nextTitle;
    descriptionElement?.setAttribute('content', nextDescription);
    ogTitleElement?.setAttribute('content', nextTitle);
    ogDescriptionElement?.setAttribute('content', nextDescription);

    return () => {
      document.title = previousTitle || DEFAULT_TITLE;
      descriptionElement?.setAttribute('content', previousDescription);
      ogTitleElement?.setAttribute('content', previousTitle || DEFAULT_TITLE);
      ogDescriptionElement?.setAttribute('content', previousDescription);
    };
  }, [description, title]);
}
