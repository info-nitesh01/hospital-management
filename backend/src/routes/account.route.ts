import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { User } from '../models/user.model';

const router = Router();

const createToken = (user: {
  userId: string;
  email: string;
  name: string;
  role: string;
  activeClientId?: string | null;
}, type: 'access' | 'refresh') =>
  jwt.sign(
    {
      sub: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      cid: user.activeClientId ?? null,
      username: user.email.split('@')[0],
      vid: 'vendor-001',
      vlogo: '/logo.png',
      showworkspace: 'true',
      showvendor: 'true',
      type,
    },
    env.JWT_SECRET,
    {
      expiresIn: (type === 'refresh' ? '30d' : env.JWT_EXPIRES_IN) as SignOptions['expiresIn'],
      issuer: 'node-backend',
      audience: 'docu',
    }
  );

router.post('/Account/login', async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  const passwordMatches = user?.passwordHash
    ? await bcrypt.compare(String(password ?? ''), user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    return res.status(401).json({
      userId: null,
      token: null,
      refreshToken: null,
      hash: null,
      message: 'Invalid credentials',
      status: 401,
      projectId: null,
    });
  }

  const token = createToken(user, 'access');
  const refreshToken = createToken(user, 'refresh');

  return res.status(200).json({
    userId: user.userId,
    token,
    refreshToken,
    hash: 'node-backend-hash',
    message: 'Login successful',
    status: 200,
    projectId: null,
  });
});

router.post('/auth/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken !== 'string') {
    return res.status(401).json({ message: 'Invalid refresh token', status: 401 });
  }

  let decoded: jwt.JwtPayload;
  try {
    const verified = jwt.verify(refreshToken, env.JWT_SECRET, {
      issuer: 'node-backend',
      audience: 'docu',
    });
    if (typeof verified === 'string' || verified.type !== 'refresh' || typeof verified.sub !== 'string') {
      return res.status(401).json({ message: 'Invalid refresh token', status: 401 });
    }
    decoded = verified;
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token', status: 401 });
  }

  const user = await User.findOne({ userId: decoded.sub });
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token', status: 401 });
  }

  return res.status(200).json({
    userId: user.userId,
    token: createToken(user, 'access'),
    refreshToken: createToken(user, 'refresh'),
    hash: 'node-backend-hash',
    message: 'Token refreshed',
    status: 200,
    projectId: null,
  });
});

router.get('/users/me', async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'node-backend',
      audience: 'docu',
    });
    if (typeof decoded === 'string' || decoded.type !== 'access' || typeof decoded.sub !== 'string') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    userId = decoded.sub;
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    username: user.email.split('@')[0],
    clientId: user.activeClientId ?? null,
  });
});

const getAuthenticatedUser = async (req: Request) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: 'node-backend', audience: 'docu' });
    if (typeof decoded === 'string' || decoded.type !== 'access' || typeof decoded.sub !== 'string') return null;
    return User.findOne({ userId: decoded.sub });
  } catch {
    return null;
  }
};

router.get('/users', async (req: Request, res: Response) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: 'Authentication required' });
  if (user.role !== 'Admin') return res.status(403).json({ message: 'Admin access required' });

  const users = await User.find({}, {
    _id: 0,
    userId: 1,
    name: 1,
    email: 1,
    role: 1,
    activeClientId: 1,
    createdAt: 1,
  }).sort({ name: 1 }).lean();

  return res.status(200).json({
    code: 200,
    content: {
      Data: users,
      ColumnConfigs: [
        { dataIndex: 'name', title: 'Name', isGridVisible: true, isFormVisible: false, sortOrder: 1, isReadOnly: true, isMandatory: true, hidden: false, sorter: true, showSorterTooltip: true, width: 180, key: 'name', columnType: 'text' },
        { dataIndex: 'email', title: 'Email', isGridVisible: true, isFormVisible: false, sortOrder: 2, isReadOnly: true, isMandatory: true, hidden: false, sorter: true, showSorterTooltip: true, width: 240, key: 'email', columnType: 'email' },
        { dataIndex: 'role', title: 'Role', isGridVisible: true, isFormVisible: false, sortOrder: 3, isReadOnly: true, isMandatory: true, hidden: false, sorter: true, showSorterTooltip: true, width: 120, key: 'role', columnType: 'text' },
        { dataIndex: 'activeClientId', title: 'Active Client', isGridVisible: true, isFormVisible: false, sortOrder: 4, isReadOnly: true, isMandatory: false, hidden: false, sorter: true, showSorterTooltip: true, width: 180, key: 'activeClientId', columnType: 'text' },
        { dataIndex: 'createdAt', title: 'Created', isGridVisible: true, isFormVisible: false, sortOrder: 5, isReadOnly: true, isMandatory: false, hidden: false, sorter: true, showSorterTooltip: true, width: 140, key: 'createdAt', columnType: 'date' },
      ],
    },
    currentFileId: null,
    currentAssessmentId: null,
  });
});

router.get('/Account/getallclientworkspace/:userId', async (req: Request, res: Response) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: 'Authentication required' });
  if (user.userId !== req.params.userId) return res.status(403).json({ message: 'Forbidden' });

  const workspaceCollection = User.db.collection('client-workspace');
  const clients = await workspaceCollection.find({}, {
    projection: { _id: 0, clientId: 1, clientName: 1, clientLogo: 1, clientSlogan: 1, isActive: 1 },
  }).sort({ clientName: 1 }).toArray();
  if (!user.activeClientId && clients.length > 0) {
    user.activeClientId = String(clients[0].clientId);
    await user.save();
  }

  return res.status(200).json(clients.map(({ _id, ...client }) => ({
    ...client,
    isActive: String(client.clientId) === user.activeClientId,
  })));
});

router.post('/Account/useractiveclient', async (req: Request, res: Response) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: 'Authentication required' });

  const { clientId } = req.body ?? {};
  if (typeof clientId !== 'string' || !clientId) {
    return res.status(400).json({ message: 'clientId is required' });
  }

  const client = await User.db.collection('client-workspace').findOne({ clientId });
  if (!client) return res.status(404).json({ message: 'Client workspace not found' });

  user.activeClientId = clientId;
  await user.save();
  return res.status(200).json({ code: 200, clientId });
});

export default router;
