const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load separate data files
function loadJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf-8'));
}

function loadDb() {
  return {
    users: loadJson('users.json'),
    vendors: loadJson('vendors.json'),
    columnConfigs: loadJson('column-configs.json'),
    clients: loadJson('clients.json'),
    graphData: loadJson('graph-data.json'),
    lookups: loadJson('lookups.json'),
  };
}

// ============================================
// JWT Helper
// ============================================
function createMockJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${encode(header)}.${encode(payload)}.mock-signature`;
}

// ============================================
// Wrapper for standard API responses
// ============================================
function apiResponse(content) {
  return { code: 200, content, currentFileId: null, currentAssessmentId: null };
}

// ============================================
// AUTH ROUTES (prefix: /api/Account/*)
// ============================================

// POST /api/Account/login
app.post('/api/Account/login', (req, res) => {
  const { email, password } = req.body;
  const db = loadDb();
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.json({
      userId: null,
      token: null,
      refreshToken: null,
      hash: null,
      message: 'Invalid credentials',
      status: 401,
      projectId: null,
    });
  }

  const tokenPayload = {
    sub: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    username: user.email.split('@')[0],
    vid: 'vendor-001',
    vlogo: '/logo.png',
    showworkspace: 'true',
    showvendor: 'true',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    iss: 'mock-identity-server',
    aud: 'client-portal',
  };

  const token = createMockJwt(tokenPayload);
  const refreshToken = createMockJwt({ ...tokenPayload, type: 'refresh' });

  console.log('[AUTH] Login successful for:', email);

  res.json({
    userId: user.userId,
    token,
    refreshToken,
    hash: 'mock-hash-value',
    message: 'Login successful',
    status: 200,
    projectId: null,
  });
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', (req, res) => {
  const db = loadDb();
  const user = db.users[0];

  const tokenPayload = {
    sub: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    username: user.email.split('@')[0],
    vid: 'vendor-001',
    vlogo: '/logo.png',
    showworkspace: 'true',
    showvendor: 'true',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    iss: 'mock-identity-server',
    aud: 'client-portal',
  };

  res.json({
    userId: user.userId,
    token: createMockJwt(tokenPayload),
    refreshToken: createMockJwt({ ...tokenPayload, type: 'refresh' }),
    hash: 'mock-hash-value',
    message: 'Token refreshed',
    status: 200,
    projectId: null,
  });
});

// GET /api/Account/getallvendor/:userId
app.get('/api/Account/getallvendor/:userId', (req, res) => {
  const db = loadDb();
  res.json(db.vendors);
});

// POST /api/Account/useractivevendor
app.post('/api/Account/useractivevendor', (req, res) => {
  console.log('[VENDOR] Set active vendor:', req.body);
  res.json({ status: 200 });
});

// ============================================
// Helper: filter clients by query params
// ============================================
function filterClients(clients, query) {
  let result = [...clients];
  const filterFields = [
    'clientName', 'clientShortName', 'clientStatus', 'clientType',
    'contactName', 'contactEmail', 'createdBy', 'modifiedBy',
  ];

  filterFields.forEach(field => {
    if (query[field]) {
      const values = query[field].split(',').map(v => v.trim().toLowerCase());
      result = result.filter(c =>
        c[field] && values.some(v => String(c[field]).toLowerCase().includes(v))
      );
    }
  });

  return result;
}

// Detail-only fields to strip from table list view
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

function stripDetailFields(client) {
  const row = { ...client };
  DETAIL_ONLY_FIELDS.forEach(f => delete row[f]);
  return row;
}

// ============================================
// CLIENTS ROUTES (prefix: /api/v1/Clients/*)
// ============================================

// GET /api/v1/Clients
app.get('/api/v1/Clients', (req, res) => {
  const db = loadDb();
  let clients = filterClients(db.clients, req.query);

  // Sort
  const sortBy = req.query.sortBy || 'desc';
  const sortDir = sortBy === 'asc' ? 1 : -1;
  clients.sort((a, b) => {
    const dateA = new Date(a.createdOn).getTime();
    const dateB = new Date(b.createdOn).getTime();
    return (dateA - dateB) * sortDir;
  });

  const total = clients.length;
  const pn = parseInt(req.query.pageNumber) || 1;
  const ps = parseInt(req.query.pageSize) || 15;
  const totalPages = Math.ceil(total / ps);
  const start = (pn - 1) * ps;
  const paged = clients.slice(start, start + ps);

  const Data = paged.map(c => ({
    ...stripDetailFields(c),
    totalRecords: total,
    noOfPages: totalPages,
    hasNextPage: pn < totalPages,
    hasPreviousPage: pn > 1,
  }));

  res.json({
    code: 200,
    content: { Data, ColumnConfigs: db.columnConfigs },
    currentFileId: null,
    currentAssessmentId: null,
  });
});

// GET /api/v1/Clients/GetClientCheckBoxes
app.get('/api/v1/Clients/GetClientCheckBoxes', (req, res) => {
  const db = loadDb();
  const clients = filterClients(db.clients, req.query);

  const content = clients.map(c => ({
    clientId: c.clientId,
    clientName: c.clientName,
    clientStatus: c.clientStatus,
    clientType: c.clientType,
    totalRecords: clients.length,
    noOfPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  }));

  res.json({ code: 200, content });
});

// GET /api/v1/Clients/GetClientById/:id
app.get('/api/v1/Clients/GetClientById/:id', (req, res) => {
  const db = loadDb();
  const client = db.clients.find(c => c.clientId === req.params.id);

  if (!client) {
    return res.status(404).json({ code: 404, content: null });
  }

  res.json(apiResponse(client));
});

// GET /api/v1/Clients/GetGraphData/:id
app.get('/api/v1/Clients/GetGraphData/:id', (req, res) => {
  const db = loadDb();
  const data = db.graphData[req.params.id] || [];
  res.json(apiResponse(data));
});

// POST /api/v1/Clients/AddClient
app.post('/api/v1/Clients/AddClient', (req, res) => {
  console.log('\n[ADD CLIENT] Submitted data:');
  console.log(JSON.stringify(req.body, null, 2));
  res.json({ code: 200, content: 'mock-new-client-' + Date.now() });
});

// POST /api/v1/Clients/UpdateClient
app.post('/api/v1/Clients/UpdateClient', (req, res) => {
  console.log('\n[UPDATE CLIENT] Submitted data:');
  console.log(JSON.stringify(req.body, null, 2));
  res.json({ code: 200, content: req.body.clientId || 'mock-id' });
});

// POST /api/v1/Clients/AddUpdateClientBillingMethod
app.post('/api/v1/Clients/AddUpdateClientBillingMethod', (req, res) => {
  console.log('\n[BILLING] Submitted data:');
  console.log(JSON.stringify(req.body, null, 2));
  res.json({ code: 200, content: 'billing-saved' });
});

// ============================================
// PRELOAD / LOOKUP ROUTES
// ============================================

app.get('/api/v1/AdvancedSearch/GetClientType', (req, res) => {
  res.json(apiResponse(loadDb().lookups.clientTypes));
});

app.get('/api/v1/Clients/GetStatesByClientId', (req, res) => {
  res.json(apiResponse(loadDb().lookups.states));
});

app.get('/api/v1/Clients/GetCityByClientId', (req, res) => {
  const db = loadDb();
  const stateCode = req.query.stateCode;
  const cities = stateCode && db.lookups.cities[stateCode]
    ? db.lookups.cities[stateCode]
    : Object.values(db.lookups.cities).flat();
  res.json(apiResponse(cities));
});

app.get('/api/v1/Clients/GetCountyByClientId', (req, res) => {
  const db = loadDb();
  const stateCode = req.query.stateCode;
  const counties = stateCode && db.lookups.counties[stateCode]
    ? db.lookups.counties[stateCode]
    : Object.values(db.lookups.counties).flat();
  res.json(apiResponse(counties));
});

app.get('/api/v1/Clients/GetZipByClientId', (req, res) => {
  res.json(apiResponse(loadDb().lookups.zipCodes));
});

app.get('/api/v1/Clients/GetClientManagerLookup', (req, res) => {
  res.json(apiResponse(loadDb().lookups.clientManagers));
});

app.get('/api/v1/Clients/GetSalesManagerLookup', (req, res) => {
  res.json(apiResponse(loadDb().lookups.salesManagers));
});

app.get('/api/v1/AdvancedSearch/GetContactType', (req, res) => {
  res.json(apiResponse(loadDb().lookups.contactTypes));
});

app.get('/api/v1/Clients/GetAdditionalFee', (req, res) => {
  res.json(apiResponse(loadDb().lookups.feeTypes));
});

// ============================================
// BILLING LOOKUP ROUTES
// ============================================

app.get('/api/v1/ColumnFilter/GetBillingMethod', (req, res) => {
  res.json(apiResponse(loadDb().lookups.billingMethods));
});

app.get('/api/v1/AdvancedSearch/GetAccountManagerLookup', (req, res) => {
  res.json(apiResponse(loadDb().lookups.accountManagers));
});

app.get('/api/v1/ColumnFilter/GetDefaultTaxRateSource', (req, res) => {
  res.json(apiResponse(loadDb().lookups.taxRateSources));
});

app.get('/api/v1/ColumnFilter/GetDefaultTaxRateType', (req, res) => {
  res.json(apiResponse(loadDb().lookups.taxRateTypes));
});

app.get('/api/v1/ColumnFilter/GetDefaultAssessment', (req, res) => {
  res.json(apiResponse(loadDb().lookups.assessments));
});

// ============================================
// COLUMN FILTER ROUTES
// ============================================

function columnFilterHandler(fieldExtractor) {
  return (req, res) => {
    const db = loadDb();
    const values = fieldExtractor(db);
    const from = parseInt(req.query.fromRange) || 0;
    const to = parseInt(req.query.toRange) || 50;

    // Find any search term (skip fromRange/toRange keys)
    const skipKeys = ['fromRange', 'toRange'];
    const searchKey = Object.keys(req.query).find(k => !skipKeys.includes(k));
    const searchTerm = searchKey ? req.query[searchKey] : '';

    let filtered = values;
    if (searchTerm) {
      filtered = values.filter(v => {
        const val = Object.values(v)[0];
        return val && String(val).toLowerCase().includes(String(searchTerm).toLowerCase());
      });
    }

    const paged = filtered.slice(from, from + to);
    res.json(apiResponse(paged));
  };
}

app.get('/api/v1/ColumnFilter/GetClientName', columnFilterHandler(
  db => [...new Set(db.clients.map(c => c.clientName))].map(n => ({ clientName: n }))
));

app.get('/api/v1/ColumnFilter/GetClientShortName', columnFilterHandler(
  db => [...new Set(db.clients.filter(c => c.clientShortName).map(c => c.clientShortName))].map(n => ({ clientShortName: n }))
));

app.get('/api/v1/ColumnFilter/GetClientStatus', columnFilterHandler(
  db => [...new Set(db.clients.map(c => c.clientStatus))].map(s => ({ clientStatus: s }))
));

app.get('/api/v1/ColumnFilter/GetClientType', columnFilterHandler(
  db => [...new Set(db.clients.filter(c => c.clientType).map(c => c.clientType))].map(t => ({ clientType: t }))
));

app.get('/api/v1/ColumnFilter/GetClientContactName', columnFilterHandler(
  db => [...new Set(db.clients.filter(c => c.contactName).map(c => c.contactName))].map(n => ({ contactName: n }))
));

app.get('/api/v1/ColumnFilter/GetClientContactEmail', columnFilterHandler(
  db => [...new Set(db.clients.filter(c => c.contactEmail).map(c => c.contactEmail))].map(e => ({ contactEmail: e }))
));

app.get('/api/v1/ColumnFilter/GetClientCreatedBy', columnFilterHandler(
  db => [...new Set(db.clients.filter(c => c.createdBy).map(c => c.createdBy))].map(n => ({ createdBy: n }))
));

app.get('/api/v1/ColumnFilter/GetClientModifiedBy', columnFilterHandler(
  db => [...new Set(db.clients.filter(c => c.modifiedBy).map(c => c.modifiedBy))].map(n => ({ modifiedBy: n }))
));

// ============================================
// QUICK SEARCH
// ============================================

app.get('/api/v1/ColumnFilter/GetClientQuickSearch/Client/ClientQuickSearch', (req, res) => {
  const db = loadDb();
  const search = (req.query.quicksearch || '').toLowerCase();

  if (!search) {
    return res.json(apiResponse([]));
  }

  const results = db.clients
    .filter(c =>
      c.clientName.toLowerCase().includes(search) ||
      (c.clientShortName && c.clientShortName.toLowerCase().includes(search))
    )
    .slice(0, 10)
    .map(c => ({
      key: c.clientId,
      description: c.clientName,
      quickSearchDescription: `${c.clientName} (${c.clientStatus})`,
    }));

  res.json(apiResponse(results));
});

// ============================================
// EXPORT (mock)
// ============================================

app.post('/api/v1/Export/Export/ExportToExcel', (req, res) => {
  console.log('[EXPORT] Export request:', req.query.screenName, req.body);
  const buffer = Buffer.from('mock-excel-data');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="export.xlsx"');
  res.send(buffer);
});

// ============================================
// START SERVER
// ============================================

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`\nMock API server running at http://localhost:${PORT}`);
  console.log(`  Clients API: http://localhost:${PORT}/api/v1`);
  console.log(`  Auth API:    http://localhost:${PORT}/api`);
  console.log(`\nLogin credentials: nitesh.s@datagainservices.com / 12345678\n`);
});
