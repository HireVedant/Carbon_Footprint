/**
 * Application routes — single source of truth for all paths.
 *
 * @module constants/routes
 */

export const ROUTES = {
  HOME: '/',
  LANDING: '/landing',
  LOGIN: '/login',
  REGISTER: '/register',
  ASSESSMENT: '/assessment',
  DASHBOARD: '/dashboard',
  COMMUNITY: '/community',
  HISTORY: '/history',
  ABOUT: '/about',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];