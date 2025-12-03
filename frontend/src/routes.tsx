import { lazy } from 'react';

export interface AppRoute {
  path: string;
  Component: React.LazyExoticComponent<() => JSX.Element>;
  label?: string;
  showInNav?: boolean;
}

const route = (path: string, component: () => Promise<{ default: () => JSX.Element }>, options?: Pick<AppRoute, 'label' | 'showInNav'>): AppRoute => ({
  path,
  Component: lazy(component),
  label: options?.label,
  showInNav: options?.showInNav ?? false,
});

export const appRoutes: AppRoute[] = [
  route('/', () => import('@/pages/Index'), { label: 'Home', showInNav: true }),
  route('/dashboard', () => import('@/pages/Dashboard'), { label: 'Dashboard', showInNav: true }),
  route('/business', () => import('@/pages/Business')),
  route('/investor', () => import('@/pages/Investor')),
  route('/legacy-console', () => import('@/pages/LegacyConsole'), { label: 'Legacy console', showInNav: true }),
  route('/docs', () => import('@/pages/Docs')),
  route('/how-it-works', () => import('@/pages/HowItWorks')),
  route('/about', () => import('@/pages/About')),
];

export const fallbackRoute = route('*', () => import('@/pages/NotFound'));

export const navRoutes = appRoutes.filter((r) => r.showInNav && r.label);
