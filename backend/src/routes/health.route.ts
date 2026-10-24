import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
