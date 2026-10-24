import fs from 'fs';
import path from 'path';

import { connectDB } from '../config/db';
import { Dashboard } from '../models/dashboard.model';

const seedDashboard = async (): Promise<void> => {
  const sourcePath = path.resolve(__dirname, '../../../data/dashboard-data.json');
  const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as Record<string, unknown>;

  await connectDB();
  if (Dashboard.db.readyState !== 1) {
    throw new Error('MongoDB is not connected; dashboard data was not imported.');
  }

  await Dashboard.findOneAndUpdate(
    { dashboardId: 'main' },
    { $set: { data } },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  console.log('Imported the complete dashboard dataset into the dashboard collection.');
  await Dashboard.db.close();
};

seedDashboard().catch(async (error: unknown) => {
  console.error('Dashboard import failed:', error);
  await Dashboard.db.close();
  process.exitCode = 1;
});