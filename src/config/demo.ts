export const IS_STATIC_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const STATIC_DEMO_VERSION = 1;
export const STATIC_DEMO_STORAGE_PREFIX = 'dairyos-static-demo-v1-data:';
export const STATIC_DEMO_ROLE_KEY = 'dairyos-static-demo-v1-role';
export const STATIC_DEMO_LANGUAGE_KEY = 'dairyos-static-demo-v1-language';

export const STATIC_DEMO_DISCLOSURE =
  'This demonstration uses sample data. Changes are saved only in this browser and do not affect real dairy records.';

export function unsupportedStaticDemoAction(action: string): Error {
  return new Error(`${action} is unavailable in this browser-only demo. No backend or external service was contacted.`);
}
