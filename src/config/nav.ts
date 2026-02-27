import {
  Home,
  BookOpen,
  Target,
  Calculator,
  ClipboardCheck,
  Settings,
  Stethoscope,
  Activity,
  Star,
  Clock,
  Eraser,
} from 'lucide-react';

export interface NavItem {
  key: string;
  to: string;
  icon: typeof Home;
  quickAccess: boolean;
  order: number;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', to: '/', icon: Home, quickAccess: false, order: 1 },
  { key: 'guidelines', to: '/guidelines', icon: BookOpen, quickAccess: false, order: 2 },
  { key: 'alr', to: '/alr', icon: Target, quickAccess: false, order: 3 },
  { key: 'calculateurs', to: '/calculateurs', icon: Calculator, quickAccess: false, order: 4 },
  { key: 'protocoles', to: '/protocoles', icon: ClipboardCheck, quickAccess: false, order: 5 },
  { key: 'preanest', to: '/preanest', icon: Stethoscope, quickAccess: false, order: 6 },
  { key: 'admin', to: '/admin-content', icon: Settings, quickAccess: false, order: 7 },
];

export const HEADER_ITEMS = NAV_ITEMS.filter((i) => i.key !== 'admin');

export type QuickAccessAction =
  | 'scroll_procedures'
  | 'toggle_favorites'
  | 'scroll_recents'
  | 'navigate'
  | 'clear_filters';

export interface QuickAccessItem {
  key: string;
  icon: typeof Home;
  action: QuickAccessAction;
  to?: string;
  order: number;
}

export const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  { key: 'all_procedures', icon: Activity, action: 'scroll_procedures', order: 1 },
  { key: 'only_favorites', icon: Star, action: 'toggle_favorites', order: 2 },
  { key: 'recents', icon: Clock, action: 'scroll_recents', order: 3 },
  { key: 'ett_calculator', icon: Calculator, action: 'navigate', to: '/calculateurs', order: 4 },
  { key: 'preanest', icon: Stethoscope, action: 'navigate', to: '/preanest', order: 5 },
  { key: 'clear_filters', icon: Eraser, action: 'clear_filters', order: 6 },
];
