import { Role } from '../types/dairy';

export type PermissionAction =
  | 'collection'
  | 'quality'
  | 'processing'
  | 'sales'
  | 'payment'
  | 'cattle'
  | 'farmer'
  | 'feed'
  | 'packaging'
  | 'inventory'
  | 'route'
  | 'product'
  | 'customer'
  | 'vehicle';

const FULL_ACCESS_ROLES: Role[] = ['CEO', 'CEO / Owner', 'COO', 'Admin'];

const MODULES_BY_ROLE: Record<Role, readonly string[]> = {
  CEO: ['*'],
  'CEO / Owner': ['*'],
  COO: ['*'],
  Admin: ['*'],
  'Operations Manager': [
    'dashboard', 'milk-ops', 'milk-collection', 'quality', 'chilling', 'processing',
    'cattle', 'farmers', 'feed', 'products', 'packaging', 'inventory', 'distribution',
    'sales', 'reports', 'ai-intelligence', 'control-tower',
  ],
  'Plant Manager': [
    'dashboard', 'milk-ops', 'quality', 'chilling', 'processing', 'packaging',
    'inventory', 'distribution', 'reports', 'control-tower',
  ],
  'Procurement Manager': [
    'dashboard', 'milk-ops', 'milk-collection', 'quality', 'cattle', 'farmers',
    'feed', 'reports', 'control-tower',
  ],
  'Finance Manager': ['dashboard', 'sales', 'payments', 'finance', 'reports'],
  'Field Staff': ['milk-collection', 'quality', 'farmers', 'cattle'],
};

const ACTIONS_BY_ROLE: Record<Role, readonly PermissionAction[]> = {
  CEO: ['collection', 'quality', 'processing', 'sales', 'payment', 'cattle', 'farmer', 'feed', 'packaging', 'inventory', 'route', 'product', 'customer', 'vehicle'],
  'CEO / Owner': ['collection', 'quality', 'processing', 'sales', 'payment', 'cattle', 'farmer', 'feed', 'packaging', 'inventory', 'route', 'product', 'customer', 'vehicle'],
  COO: ['collection', 'quality', 'processing', 'sales', 'payment', 'cattle', 'farmer', 'feed', 'packaging', 'inventory', 'route', 'product', 'customer', 'vehicle'],
  Admin: ['collection', 'quality', 'processing', 'sales', 'payment', 'cattle', 'farmer', 'feed', 'packaging', 'inventory', 'route', 'product', 'customer', 'vehicle'],
  'Operations Manager': ['collection', 'quality', 'processing', 'sales', 'cattle', 'farmer', 'feed', 'packaging', 'inventory', 'route', 'product', 'customer', 'vehicle'],
  'Plant Manager': ['quality', 'processing', 'packaging', 'inventory', 'route', 'vehicle'],
  'Procurement Manager': ['collection', 'quality', 'cattle', 'farmer', 'feed'],
  'Finance Manager': ['sales', 'payment', 'customer'],
  'Field Staff': ['collection', 'quality'],
};

export function canAccessModule(role: Role, moduleId: string): boolean {
  const allowedModules = MODULES_BY_ROLE[role];
  return allowedModules.includes('*') || allowedModules.includes(moduleId);
}

export function canPerformAction(role: Role, action: PermissionAction): boolean {
  return ACTIONS_BY_ROLE[role].includes(action);
}

export function getDefaultModuleForRole(role: Role): string {
  if (role === 'Finance Manager') return 'finance';
  if (role === 'Plant Manager') return 'processing';
  if (role === 'Field Staff') return 'milk-collection';
  return 'dashboard';
}

export function permissionError(role: Role): string {
  return `The ${role} role does not have permission to record this transaction.`;
}

export function isFullAccessRole(role: Role): boolean {
  return FULL_ACCESS_ROLES.includes(role);
}