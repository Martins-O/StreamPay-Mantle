import { lazy } from 'react';

export interface AppRoute {
  path: string;
  Component: React.LazyExoticComponent<() => JSX.Element>;
  label?: string;
  showInNav?: boolean;
  requiresWallet?: boolean;
}

const route = (
  path: string,
  component: () => Promise<{ default: () => JSX.Element }>,
  options?: Pick<AppRoute, 'label' | 'showInNav' | 'requiresWallet'>
): AppRoute => ({
  path,
  Component: lazy(component),
  label: options?.label,
  showInNav: options?.showInNav ?? false,
  requiresWallet: options?.requiresWallet ?? false,
});

export const appRoutes: AppRoute[] = [
  // Public routes (informational)
  route('/', () => import('@/pages/Index'), { label: 'Home', showInNav: true }),
  route('/how-it-works', () => import('@/pages/HowItWorks'), { label: 'How It Works', showInNav: true }),
  route('/about', () => import('@/pages/About'), { label: 'About', showInNav: true }),
  route('/docs', () => import('@/pages/Docs'), { label: 'Docs', showInNav: true }),

  // Protected routes (require wallet connection)
  route('/dashboard', () => import('@/pages/Dashboard'), { label: 'Dashboard', showInNav: true, requiresWallet: true }),
  route('/business', () => import('@/pages/Business'), { label: 'Business', showInNav: true, requiresWallet: true }),
  route('/investor', () => import('@/pages/Investor'), { label: 'Investor', showInNav: true, requiresWallet: true }),
  route('/legacy-console', () => import('@/pages/LegacyConsole'), { label: 'Console', showInNav: true, requiresWallet: true }),
];

export const fallbackRoute = route('*', () => import('@/pages/NotFound'));

export const publicRoutes = appRoutes.filter((r) => !r.requiresWallet && r.showInNav && r.label);
export const protectedRoutes = appRoutes.filter((r) => r.requiresWallet && r.showInNav && r.label);
export const navRoutes = appRoutes.filter((r) => r.showInNav && r.label);
