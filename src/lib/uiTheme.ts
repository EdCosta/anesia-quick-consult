export type UIThemeKey =
  | 'clinical-blue'
  | 'emerald-care'
  | 'amber-focus'
  | 'rose-signal'
  | 'slate-pro';

type LocalizedText = {
  fr: string;
  en: string;
  pt: string;
};

export type UIThemeDefinition = {
  key: UIThemeKey;
  label: LocalizedText;
  description: LocalizedText;
  swatches: [string, string, string];
  variables: Record<string, string>;
};

export const UI_THEME_STORAGE_KEY = 'anesia-ui-theme';
export const DEFAULT_UI_THEME: UIThemeKey = 'clinical-blue';

export const UI_THEMES: UIThemeDefinition[] = [
  {
    key: 'clinical-blue',
    label: {
      fr: 'Bleu Clinique',
      en: 'Clinical Blue',
      pt: 'Azul Clinico',
    },
    description: {
      fr: 'Palette clinique equilibree.',
      en: 'Balanced clinical palette.',
      pt: 'Paleta clinica equilibrada.',
    },
    swatches: ['#1E4A80', '#1FA68B', '#EAF3FF'],
    variables: {
      '--primary': '210 62% 31%',
      '--ring': '210 62% 31%',
      '--accent': '171 68% 39%',
      '--accent-foreground': '171 80% 12%',
      '--sidebar-primary': '171 68% 39%',
    },
  },
  {
    key: 'emerald-care',
    label: {
      fr: 'Soin Emeraude',
      en: 'Emerald Care',
      pt: 'Cuidado Esmeralda',
    },
    description: {
      fr: 'Vert hospitalier avec contraste eleve.',
      en: 'Hospital green with high contrast.',
      pt: 'Verde hospitalar com alto contraste.',
    },
    swatches: ['#0F5132', '#1E7F5A', '#EAF8F0'],
    variables: {
      '--primary': '153 67% 22%',
      '--ring': '153 67% 22%',
      '--accent': '160 60% 36%',
      '--accent-foreground': '160 80% 11%',
      '--sidebar-primary': '160 60% 36%',
    },
  },
  {
    key: 'amber-focus',
    label: {
      fr: 'Focus Ambre',
      en: 'Amber Focus',
      pt: 'Foco Ambar',
    },
    description: {
      fr: 'Ton chaud pour mettre en avant les actions.',
      en: 'Warm tone to highlight actions.',
      pt: 'Tom quente para destacar acoes.',
    },
    swatches: ['#7C4A03', '#B46B08', '#FFF7E8'],
    variables: {
      '--primary': '33 93% 24%',
      '--ring': '33 93% 24%',
      '--accent': '38 92% 44%',
      '--accent-foreground': '36 80% 12%',
      '--sidebar-primary': '38 92% 44%',
    },
  },
  {
    key: 'rose-signal',
    label: {
      fr: 'Signal Rose',
      en: 'Rose Signal',
      pt: 'Sinal Rosa',
    },
    description: {
      fr: 'Rose fonce pour une identite forte.',
      en: 'Deep rose for a strong identity.',
      pt: 'Rosa escuro para identidade forte.',
    },
    swatches: ['#7A1F45', '#A43164', '#FFF0F6'],
    variables: {
      '--primary': '334 60% 30%',
      '--ring': '334 60% 30%',
      '--accent': '339 63% 46%',
      '--accent-foreground': '339 80% 13%',
      '--sidebar-primary': '339 63% 46%',
    },
  },
  {
    key: 'slate-pro',
    label: {
      fr: 'Ardoise Pro',
      en: 'Slate Pro',
      pt: 'Ardosia Pro',
    },
    description: {
      fr: 'Rendu neutre et professionnel.',
      en: 'Neutral professional rendering.',
      pt: 'Visual neutro e profissional.',
    },
    swatches: ['#253041', '#3D5A80', '#EDF2F7'],
    variables: {
      '--primary': '216 27% 20%',
      '--ring': '216 27% 20%',
      '--accent': '214 35% 37%',
      '--accent-foreground': '214 80% 94%',
      '--sidebar-primary': '214 35% 37%',
    },
  },
];

export function resolveUIThemeKey(value: string | null | undefined): UIThemeKey {
  if (!value) return DEFAULT_UI_THEME;
  const found = UI_THEMES.find((theme) => theme.key === value);
  return found ? found.key : DEFAULT_UI_THEME;
}

export function getUIThemeDefinition(themeKey: UIThemeKey): UIThemeDefinition {
  return UI_THEMES.find((theme) => theme.key === themeKey) ?? UI_THEMES[0];
}

export function readStoredUIThemeKey(): UIThemeKey {
  if (typeof window === 'undefined') return DEFAULT_UI_THEME;
  const stored = localStorage.getItem(UI_THEME_STORAGE_KEY);
  return resolveUIThemeKey(stored);
}

export function persistUIThemeKey(themeKey: UIThemeKey): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(UI_THEME_STORAGE_KEY, themeKey);
}

export function applyUITheme(themeKey: UIThemeKey): void {
  if (typeof document === 'undefined') return;
  const definition = getUIThemeDefinition(themeKey);
  const rootStyle = document.documentElement.style;

  Object.entries(definition.variables).forEach(([variable, value]) => {
    rootStyle.setProperty(variable, value);
  });
}

export function initializeUITheme(): UIThemeKey {
  const initialTheme = readStoredUIThemeKey();
  applyUITheme(initialTheme);
  return initialTheme;
}
