import {
  Home,
  BookOpen,
  Target,
  Calculator,
  ClipboardCheck,
  Settings,
  Stethoscope,
} from 'lucide-react';

export interface NavItem {
  key: string;
  to: string;
  icon: typeof Home;
  quickAccess: boolean;
  order: number;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', to: '/', icon: Home, quickAccess: true, order: 1 },
  { key: 'guidelines', to: '/guidelines', icon: BookOpen, quickAccess: true, order: 2 },
  { key: 'alr', to: '/alr', icon: Target, quickAccess: true, order: 3 },
  { key: 'calculateurs', to: '/calculateurs', icon: Calculator, quickAccess: true, order: 4 },
  { key: 'protocoles', to: '/protocoles', icon: ClipboardCheck, quickAccess: true, order: 5 },
  { key: 'preanest', to: '/preanest', icon: Stethoscope, quickAccess: true, order: 6 },
  { key: 'admin', to: '/admin-content', icon: Settings, quickAccess: false, order: 7 },
];

export const HEADER_ITEMS = NAV_ITEMS;
export const QUICK_ACCESS_ITEMS = NAV_ITEMS.filter((i) => i.quickAccess).sort((a, b) => a.order - b.order);
