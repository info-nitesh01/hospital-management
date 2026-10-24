import fs from 'fs';
import path from 'path';

import { connectDB } from '../config/db';
import { Client } from '../models/client.model';

interface SeedClient {
  clientId: string;
  [field: string]: unknown;
}

const seedClients = async (): Promise<void> => {
  const sourcePath = path.resolve(__dirname, '../../../data/hospitals.json');
  const clients = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as SeedClient[];

  if (clients.some((client) => !client.clientId)) {
    throw new Error('Every client record must include a clientId.');
  }

  await connectDB();
  if (Client.db.readyState !== 1) {
    throw new Error('MongoDB is not connected; clients were not imported.');
  }

  const result = await Client.bulkWrite(
    clients.map((client) => ({
      replaceOne: {
        filter: { clientId: client.clientId },
        replacement: client,
        upsert: true,
      },
    }))
  );

  console.log(
    `Imported ${clients.length} clients (${result.upsertedCount} inserted, ${result.modifiedCount} updated).`
  );
  await Client.db.close();
};

seedClients().catch(async (error: unknown) => {
  console.error('Client import failed:', error);
  await Client.db.close();
  process.exitCode = 1;
});