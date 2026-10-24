import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

import { connectDB } from '../config/db';
import { User } from '../models/user.model';

interface SeedUser {
  userId: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

const seedUsers = async (): Promise<void> => {
  const sourcePath = path.resolve(__dirname, '../../../data/users.json');
  const users = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as SeedUser[];

  await connectDB();

  if (User.db.readyState !== 1) {
    throw new Error('MongoDB is not connected; users were not seeded.');
  }

  for (const user of users) {
    const email = user.email.trim().toLowerCase();
    const existing = await User.findOne({ email }).select('+passwordHash +password');

    if (existing?.passwordHash) {
      if (existing.password) {
        await User.collection.updateOne({ email }, { $unset: { password: 1 } });
      }
      console.log(`Skipped existing user: ${email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 12);
    await User.collection.updateOne(
      { email },
      {
        $set: {
          userId: user.userId,
          email,
          passwordHash,
          name: user.name,
          role: user.role,
        },
        $unset: { password: 1 },
      },
      { upsert: true }
    );
    console.log(`Seeded user: ${email}`);
  }

  await User.db.close();
};

seedUsers().catch(async (error: unknown) => {
  console.error('User seed failed:', error);
  await User.db.close();
  process.exitCode = 1;
});