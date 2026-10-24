import { connectDB } from '../config/db';
import { Theme } from '../models/theme.model';
import { User } from '../models/user.model';

const DEFAULT_THEME = {
  primaryColor: 'blue',
  mode: 'light',
  fontSize: 1,
};

const seedThemes = async (): Promise<void> => {
  await connectDB();
  if (Theme.db.readyState !== 1) {
    throw new Error('MongoDB is not connected; themes were not seeded.');
  }

  const users = await User.find({}, { userId: 1 }).lean();
  const userIds = users.map((user) => user.userId);
  userIds.push('__default__');

  const result = await Theme.bulkWrite(
    userIds.map((userId) => ({
      updateOne: {
        filter: { userId },
        update: { $setOnInsert: { userId, config: DEFAULT_THEME } },
        upsert: true,
      },
    }))
  );

  console.log(`Seeded default themes for ${result.upsertedCount} new records; existing preferences were preserved.`);
  await Theme.db.close();
};

seedThemes().catch(async (error: unknown) => {
  console.error('Theme seed failed:', error);
  await Theme.db.close();
  process.exitCode = 1;
});