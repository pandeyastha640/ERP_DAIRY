import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const SESSION_COOKIE_NAME = 'dairyos_session';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  rawBody?: Buffer;
}

type AuthEnvironment = {
  JWT_SECRET?: string;
  NODE_ENV?: string;
  DEMO_AUTH_ENABLED?: string;
};

export function validateAuthConfiguration(env: AuthEnvironment = process.env) {
  const secret = env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters before the API starts.');
  }

  if (env.NODE_ENV === 'production' && /replace|change.?me|example|dairyos|password|secret/i.test(secret)) {
    throw new Error('JWT_SECRET must be a unique production secret, not a sample or placeholder value.');
  }
}

export function isDemoAuthEnabled(env: AuthEnvironment = process.env) {
  return env.NODE_ENV !== 'production' && env.DEMO_AUTH_ENABLED === 'true';
}

function getJwtSecret() {
  validateAuthConfiguration();
  return process.env.JWT_SECRET!;
}

export function setSessionCookie(res: Response, user: AuthenticatedUser) {
  const token = jwt.sign(user, getJwtSecret(), { expiresIn: '8h' });
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/api/v1',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1',
  });
}

function readSessionCookie(req: Request) {
  const prefix = `${SESSION_COOKIE_NAME}=`;
  const value = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);

  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  const token = bearerToken || readSessionCookie(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (
      typeof decoded === 'string' ||
      typeof decoded.id !== 'string' ||
      typeof decoded.email !== 'string' ||
      typeof decoded.name !== 'string' ||
      typeof decoded.role !== 'string'
    ) {
      return res.status(401).json({ success: false, message: 'Invalid session token.' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session.',
    });
  }
};

const LEADERSHIP = ['CEO', 'COO', 'Admin', 'Administrator', 'Operations Manager'];
const PROCUREMENT = [...LEADERSHIP, 'Procurement Manager'];
const PLANT = [...LEADERSHIP, 'Plant Manager'];
const FINANCE = [...LEADERSHIP, 'Finance Manager'];
const COLLECTION = [...LEADERSHIP, 'Procurement Manager', 'Collection Operator', 'Field Staff'];

const API_ACCESS: Array<{
  path: string;
  read: string[];
  write: string[];
}> = [
  { path: '/farmers', read: [...PROCUREMENT, 'Finance Manager', 'Field Staff', 'Collection Operator'], write: PROCUREMENT },
  { path: '/cattle', read: PROCUREMENT, write: PROCUREMENT },
  { path: '/collections', read: [...COLLECTION, 'Finance Manager'], write: COLLECTION },
  { path: '/chilling', read: PLANT, write: PLANT },
  { path: '/processing', read: PLANT, write: PLANT },
  { path: '/sales', read: [...LEADERSHIP, 'Finance Manager', 'Plant Manager'], write: [...LEADERSHIP, 'Finance Manager'] },
  { path: '/payments', read: [...FINANCE, 'Procurement Manager'], write: FINANCE },
  { path: '/quality', read: [...PROCUREMENT, 'Plant Manager', 'Field Staff', 'Collection Operator'], write: [...PROCUREMENT, 'Plant Manager', 'Collection Operator'] },
  { path: '/metrics', read: [...LEADERSHIP, 'Plant Manager', 'Procurement Manager', 'Finance Manager'], write: [] },
  { path: '/iot', read: [...PLANT, 'Field Staff', 'Collection Operator'], write: [...PLANT, 'Collection Operator'] },
  // AI POST endpoints calculate reports and do not mutate business records.
  { path: '/ai', read: [...LEADERSHIP, 'Plant Manager', 'Procurement Manager'], write: [] },
  { path: '/notifications', read: [...PROCUREMENT, 'Field Staff', 'Collection Operator'], write: [...PROCUREMENT, 'Field Staff', 'Collection Operator'] },
  { path: '/federation', read: [...LEADERSHIP, 'Procurement Manager'], write: [] },
];

export const authorizeApiRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const pathname = req.originalUrl.split('?')[0].replace(/^\/api\/v1/, '') || '/';
  const policy = API_ACCESS.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
  if (!policy) {
    return res.status(403).json({ success: false, message: 'No access policy is configured for this API route.' });
  }

  const isReadOnlyAiRequest = pathname.startsWith('/ai/');
  const isFieldIntake = ['/iot/lactoscan', '/iot/scale-reading'].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isRead = ['GET', 'HEAD'].includes(req.method) || isReadOnlyAiRequest;
  const allowedRoles = isFieldIntake ? COLLECTION : isRead ? policy.read : policy.write;
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Your role is not authorized for this API operation.' });
  }

  return next();
};
