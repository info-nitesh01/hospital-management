import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';

import accountRouter from './routes/account.route';
import clientsRouter from './routes/clients.route';
import dashboardRouter from './routes/dashboard.route';
import healthRouter from './routes/health.route';
import themeRouter from './routes/theme.route';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Docu API',
    status: 'running',
  });
});

app.use('/api', accountRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/theme', themeRouter);
app.use('/api/v1', clientsRouter);
app.use('/api/health', healthRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server-error]', error);

  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
  });
});

export default app;
