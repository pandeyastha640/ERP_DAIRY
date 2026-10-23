import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../prisma';
import {
  authenticate,
  AuthenticatedRequest,
  clearSessionCookie,
  isDemoAuthEnabled,
  setSessionCookie,
} from '../middleware/auth';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.email.endsWith('@dairyos.enterprise') && !isDemoAuthEnabled()) {
      return res.status(403).json({ success: false, message: 'Sample accounts are disabled. Use an organization-provisioned account.' });
    }

    const isMatch = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    setSessionCookie(res, sessionUser);

    return res.json({
      success: true,
      message: 'Login successful',
      user: sessionUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: error.message,
    });
  }
});

// POST /api/v1/auth/demo-switch
// Instant switch for demo/evaluation mode
authRouter.post('/demo-switch', async (req: Request, res: Response) => {
  if (!isDemoAuthEnabled()) {
    return res.status(404).json({ success: false, message: 'Demo authentication is disabled.' });
  }

  try {
    const { role } = req.body;
    const demoRoles = ['CEO', 'COO', 'Operations Manager', 'Admin', 'Plant Manager', 'Procurement Manager', 'Finance Manager', 'Field Staff'];
    if (typeof role !== 'string' || !demoRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Role parameter required' });
    }

    let user = await prisma.user.findFirst({
      where: { role },
    });

    if (!user) {
      // Create user if not yet present
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const randomPasswordHash = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: {
          email: `${role.toLowerCase().replace(/\s+/g, '.')}@dairyos.enterprise`,
          name: `${role} Officer`,
          role,
          passwordHash: randomPasswordHash,
        },
      });
    }

    setSessionCookie(res, { id: user.id, email: user.email, name: user.name, role: user.role });
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error switching demo user',
      error: error.message,
    });
  }
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  return res.json({ success: true, message: 'Session cleared.' });
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
});
