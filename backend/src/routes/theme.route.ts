import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { Theme } from '../models/theme.model';
import { User } from '../models/user.model';

const router = Router();
const THEME_COLORS = ['blue', 'green', 'yellow', 'red', 'purple'];
const THEME_MODES = ['light', 'dark'];

interface ThemeConfig {
  primaryColor: string;
  customColor?: string;
  buttonPrimaryColor?: string;
  customButtonColor?: string;
  mode: string;
  fontSize: number;
}

const getAuthenticatedUserId = async (req: Request): Promise<string | null> => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'node-backend',
      audience: 'docu',
    });
    if (typeof decoded === 'string' || decoded.type !== 'access' || typeof decoded.sub !== 'string') {
      return null;
    }

    const user = await User.findOne({ userId: decoded.sub }).select('userId').lean();
    return user?.userId ?? null;
  } catch {
    return null;
  }
};

const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

const isValidThemeConfig = (value: unknown): value is ThemeConfig => {
  if (!value || typeof value !== 'object') return false;
  const config = value as Record<string, unknown>;

  return (
    typeof config.primaryColor === 'string' && THEME_COLORS.includes(config.primaryColor) &&
    typeof config.mode === 'string' && THEME_MODES.includes(config.mode) &&
    typeof config.fontSize === 'number' && Number.isFinite(config.fontSize) && config.fontSize >= 0.75 && config.fontSize <= 1.5 &&
    (config.customColor === undefined || isHexColor(config.customColor)) &&
    (config.buttonPrimaryColor === undefined || (typeof config.buttonPrimaryColor === 'string' && THEME_COLORS.includes(config.buttonPrimaryColor))) &&
    (config.customButtonColor === undefined || isHexColor(config.customButtonColor))
  );
};

router.get('/', async (req: Request, res: Response) => {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Authentication required' });
  }

  const [userTheme, defaultTheme] = await Promise.all([
    Theme.findOne({ userId }).select('config -_id').lean(),
    Theme.findOne({ userId: '__default__' }).select('config -_id').lean(),
  ]);

  return res.status(200).json({
    code: 200,
    content: userTheme?.config ?? defaultTheme?.config ?? {
      primaryColor: 'blue',
      mode: 'light',
      fontSize: 1,
    },
  });
});

router.put('/', async (req: Request, res: Response) => {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Authentication required' });
  }

  const config = req.body?.config;
  if (!isValidThemeConfig(config)) {
    return res.status(400).json({ code: 400, message: 'Invalid theme configuration' });
  }

  await Theme.findOneAndUpdate(
    { userId },
    { $set: { config } },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  return res.status(200).json({ code: 200, content: config });
});

export default router;