import { Router, type Request, type Response } from 'express';

import { Dashboard } from '../models/dashboard.model';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const dashboard = await Dashboard.findOne({ dashboardId: 'main' }).select('data -_id').lean();

  if (!dashboard) {
    return res.status(404).json({
      code: 404,
      message: 'Dashboard data has not been imported.',
      content: null,
    });
  }

  return res.status(200).json({
    code: 200,
    content: dashboard.data,
  });
});

export default router;