import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const PORT = env.PORT;

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

startServer();
