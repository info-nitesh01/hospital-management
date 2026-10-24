import { connectDB } from '../config/db';
import { Client } from '../models/client.model';

interface ClientRecord {
  clientId: string;
  clientName: string;
  activeClient?: number;
}

const seedClientWorkspaces = async (): Promise<void> => {
  await connectDB();
  if (Client.db.readyState !== 1) {
    throw new Error('MongoDB is not connected; client workspaces were not imported.');
  }

  const clients = await Client.find({}, { clientId: 1, clientName: 1, activeClient: 1 }).lean() as unknown as ClientRecord[];
  if (clients.some((client) => !client.clientId || !client.clientName)) {
    throw new Error('Every client record must include clientId and clientName.');
  }

  const collection = Client.db.collection('client-workspace');
  const workspaceClients = clients.map((client) => ({
      clientId: client.clientId,
      clientName: client.clientName,
      clientLogo: null,
      clientSlogan: null,
      isActive: client.activeClient === 1,
    }));

  await collection.deleteMany({});
  if (workspaceClients.length > 0) {
    await collection.insertMany(workspaceClients);
  }

  console.log(`Imported ${workspaceClients.length} client workspaces.`);
  await Client.db.close();
};

seedClientWorkspaces().catch(async (error: unknown) => {
  console.error('Client workspace import failed:', error);
  await Client.db.close();
  process.exitCode = 1;
});