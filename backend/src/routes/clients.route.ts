import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Client } from '../models/client.model';

const router = Router();

const loadJson = (filename: string) => {
  const filePath = path.resolve(__dirname, '../../../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const REQUIRED_CLIENT_NAME_COLUMN_CONFIG = {
  dataIndex: 'clientName',
  title: 'Client Name',
  isGridVisible: true,
  isFormVisible: true,
  sortOrder: 1,
  isReadOnly: false,
  isMandatory: true,
  hidden: false,
  sorter: true,
  showSorterTooltip: true,
  width: 200,
  key: 'clientName',
  columnType: 'text',
};

const getClientColumnConfigs = () => {
  const configuredColumns = loadJson('column-configs.json') as Array<Record<string, unknown>>;
  return [
    REQUIRED_CLIENT_NAME_COLUMN_CONFIG,
    ...configuredColumns.filter((column) => column.dataIndex !== 'clientName'),
  ];
};

const DETAIL_ONLY_FIELDS = [
  'clientContacts', 'billingSettings', 'billingId', 'billingMethod',
  'billingInternalNotes', 'billingClientNotes', 'billingManager', 'billingManagerName',
  'contingency', 'contingencyPercentage', 'additionalFees', 'discount',
  'maximumCap', 'minimumBilling', 'additionalSettingsId', 'defaultTaxRateSource',
  'defaultTaxRateType', 'defaultAssessment', 'state', 'city', 'county', 'zip',
  'address', 'notes', 'industry', 'primaryContactEmail', 'billingContactEmail',
  'clientManager', 'clientManagerName', 'salesManager', 'salesManagerName',
  'clientSource', 'contractStatus', 'clientDescription', 'fairMarketValue',
  'taxableValue', 'finalSavings', 'lattitude', 'longitude', 'updatedByName',
  'createdByName', 'updateOn',
];

const stripDetailFields = (client: Record<string, unknown>) => {
  const row = { ...client };
  DETAIL_ONLY_FIELDS.forEach((field) => delete row[field]);
  return row;
};

const FILTER_FIELDS = ['clientName', 'clientShortName', 'clientStatus', 'clientType', 'contactName', 'contactEmail', 'createdBy', 'modifiedBy'];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (query: Record<string, string | undefined>) => {
  const filter: Record<string, unknown> = {};
  FILTER_FIELDS.forEach((field) => {
    const value = query[field];
    if (!value) return;

    const alternatives = value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => ({ [field]: { $regex: escapeRegex(entry), $options: 'i' } }));

    if (alternatives.length === 1) {
      filter[field] = alternatives[0][field];
    } else if (alternatives.length > 1) {
      filter.$or = [...((filter.$or as unknown[]) ?? []), ...alternatives];
    }
  });

  return filter;
};

const parsePositiveInt = (value: string | undefined, fallback: number, max: number) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

const syncClientWorkspace = async (client: Record<string, unknown>) => {
  const clientId = String(client.clientId);
  await Client.db.collection('client-workspace').updateOne(
    { clientId },
    {
      $set: {
        clientId,
        clientName: String(client.clientName ?? ''),
        clientLogo: client.clientLogo ?? null,
        clientSlogan: client.clientSlogan ?? null,
        isActive: client.activeClient === 1,
      },
    },
    { upsert: true }
  );
};

const buildClientDocument = (payload: Record<string, unknown>, clientId: string) => {
  const contacts = Array.isArray(payload.contacts) ? payload.contacts as Array<Record<string, unknown>> : [];
  const clientContacts = contacts.map((contact) => ({
    contactId: typeof contact.contactId === 'string' ? contact.contactId : randomUUID(),
    contactType: String(contact.contactType ?? ''),
    contactName: String(contact.contactName ?? ''),
    contactPhone: String(contact.contactPhone ?? ''),
    contactEmail: String(contact.contactEmail ?? ''),
    createdBy: String(contact.createdBy ?? 'Docu'),
    createdOn: String(contact.createdOn ?? new Date().toISOString()),
    clientId,
  }));
  const primaryContact = clientContacts[0];
  const clientStatus = String(payload.clientStatus ?? 'Active');

  return {
    ...payload,
    clientId,
    clientName: String(payload.clientName ?? '').trim(),
    clientShortName: String(payload.clientShortName ?? ''),
    clientType: String(payload.clientType ?? ''),
    clientStatus,
    vendorId: String(payload.vendorId ?? 'vendor-001'),
    activeClient: clientStatus.toLowerCase() === 'active' ? 1 : 0,
    pendingClient: clientStatus.toLowerCase() === 'pending' ? 1 : 0,
    contactName: primaryContact?.contactName ?? String(payload.contactName ?? ''),
    contactPhone: primaryContact?.contactPhone ?? String(payload.contactPhone ?? ''),
    contactEmail: primaryContact?.contactEmail ?? String(payload.contactEmail ?? ''),
    primaryContactEmail: primaryContact?.contactEmail ?? String(payload.primaryContactEmail ?? ''),
    clientContacts,
    createdOn: String(payload.createdOn ?? new Date().toISOString()),
    createdBy: String(payload.createdBy ?? 'Docu'),
    modifiedOn: payload.modifiedOn ?? null,
    modifiedBy: payload.modifiedBy ?? null,
  };
};

router.post('/Clients/AddClient', async (req: Request, res: Response) => {
  const payload = req.body as Record<string, unknown> | undefined;
  const clientName = typeof payload?.clientName === 'string' ? payload.clientName.trim() : '';
  if (!clientName) {
    return res.status(400).json({ code: 400, message: 'clientName is required' });
  }

  const clientId = randomUUID();
  const client = buildClientDocument({ ...payload, clientName }, clientId);
  await Client.create(client);
  await syncClientWorkspace(client);

  return res.status(201).json({ code: 201, content: clientId });
});

router.post('/Clients/UpdateClient', async (req: Request, res: Response) => {
  const payload = req.body as Record<string, unknown> | undefined;
  const clientId = typeof payload?.clientId === 'string' ? payload.clientId : '';
  const clientName = typeof payload?.clientName === 'string' ? payload.clientName.trim() : '';
  if (!clientId || !clientName) {
    return res.status(400).json({ code: 400, message: 'clientId and clientName are required' });
  }

  const existing = await Client.findOne({ clientId }).lean();
  if (!existing) {
    return res.status(404).json({ code: 404, message: 'Client not found' });
  }

  const existingRecord = existing as Record<string, unknown>;
  const client = {
    ...existingRecord,
    ...buildClientDocument({ ...existingRecord, ...payload, clientName }, clientId),
    createdOn: existingRecord.createdOn,
    createdBy: existingRecord.createdBy,
    modifiedOn: new Date().toISOString(),
  };
  await Client.replaceOne({ clientId }, client);
  await syncClientWorkspace(client as Record<string, unknown>);

  return res.status(200).json({ code: 200, content: clientId });
});

router.get('/Clients', async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const sortDirection = query.sortBy === 'asc' ? 1 : -1;
  const pageNumber = parsePositiveInt(query.pageNumber, 1, 1_000_000);
  const pageSize = parsePositiveInt(query.pageSize, 15, 1_000);
  const filter = buildFilter(query);
  const [paged, total] = await Promise.all([
    Client.find(filter)
      .sort({ createdOn: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Client.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / pageSize) || 1;

  const data = paged.map((client) => ({
    ...stripDetailFields(client as Record<string, unknown>),
    totalRecords: total,
    noOfPages: totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1,
  }));

  return res.status(200).json({
    code: 200,
    content: {
      Data: data,
      ColumnConfigs: getClientColumnConfigs(),
    },
    currentFileId: null,
    currentAssessmentId: null,
  });
});

router.get('/Clients/GetClientCheckBoxes', async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const pageNumber = parsePositiveInt(query.pageNumber, 1, 1_000_000);
  const pageSize = parsePositiveInt(query.pageSize, 10_000, 10_000);
  const clients = await Client.find(buildFilter(query))
    .select('clientId clientName clientStatus activeClient')
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const data = clients.map((client) => {
    const record = client as Record<string, unknown>;
    return {
      clientId: record.clientId,
      clientName: record.clientName,
      clientStatus: record.clientStatus,
      activeClient: record.activeClient,
    };
  });

  res.status(200).json({
    code: 200,
    content: data,
  });
});

router.get('/Clients/GetClientById/:clientId', async (req: Request, res: Response) => {
  const client = await Client.findOne({ clientId: req.params.clientId }).lean();

  if (!client) {
    return res.status(404).json({
      code: 404,
      content: null,
    });
  }

  const record = client as Record<string, unknown>;
  const existingContacts = Array.isArray(record.clientContacts) ? record.clientContacts : [];
  const hasPrimaryContact = Boolean(record.contactName || record.contactEmail || record.contactPhone);
  const clientContacts = existingContacts.length > 0
    ? existingContacts
    : hasPrimaryContact
      ? [{
          contactId: `primary-${String(record.clientId)}`,
          contactType: 'Primary',
          contactName: record.contactName ?? '',
          contactPhone: record.contactPhone ?? '',
          contactEmail: record.contactEmail ?? '',
          createdBy: record.createdBy ?? '',
          createdOn: record.createdOn ?? new Date().toISOString(),
          clientId: record.clientId,
        }]
      : [];

  return res.status(200).json({
    code: 200,
    content: {
      ...record,
      primaryContactEmail: record.primaryContactEmail ?? record.contactEmail ?? null,
      clientContacts,
    },
  });
});

router.get('/Clients/GetGraphData/:clientId', (req: Request, res: Response) => {
  const graphData = loadJson('graph-data.json') as Record<string, unknown>;
  const clientId = Array.isArray(req.params.clientId) ? req.params.clientId[0] : req.params.clientId;
  const items = graphData[clientId] ?? [];

  return res.status(200).json({
    code: 200,
    content: items,
  });
});

export default router;
