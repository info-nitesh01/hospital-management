# API Layer

Simplified API structure with only authentication and clients API.

## Structure

```
lib/api/
├── client.ts          # HTTP client, TokenManager, error handling
├── config.ts          # API URLs from .env, endpoints
├── types.ts           # TypeScript interfaces
└── services/
    ├── clients.ts     # Client API calls (getClients, etc.)
    └── index.ts       # Services export

hooks/api/
├── useAuth.ts         # Authentication hooks (login, logout)
└── index.ts           # Hooks export
```

## Usage

### Authentication (Login/Logout)

```tsx
import { useLogin, useLogout } from "@/hooks/api";

const { mutate: login } = useLogin();
const { mutate: logout } = useLogout();

login({ email: "user@example.com", password: "password" });
logout();
```

### Clients API

```tsx
import { useQuery } from "@tanstack/react-query";
import * as clientsApi from "@/lib/api/services/clients";

// Fetch clients
const { data, isLoading } = useQuery({
  queryKey: ["clients", page, pageSize],
  queryFn: () => clientsApi.getClients(page, pageSize, "desc"),
});

// Available functions:
// - getClients(pageNumber, pageSize, sortBy)
// - getClientById(clientId)
// - createClient(clientData)
// - updateClient(clientId, clientData)
// - deleteClient(clientId)
```

## Environment Variables

API URLs are configured in `.env`:

```env
NEXT_PUBLIC_BASE_URL=https://clientonboardingdevapi.datagainservices.com/api/v1
NEXT_PUBLIC_IDENTITY_BASE_URL=https://identityserverqa.datagainservices.com/api
```

## Key Features

- ✅ Automatic token management
- ✅ Bearer token authentication
- ✅ Error handling with axios
- ✅ TypeScript support
- ✅ TanStack Query integration
- ✅ Environment-based configuration
- ✅ Common error handler with toast integration

---

## Error Handling

### Common Error Handler (`errorHandler.ts`)

The common error handler automatically extracts and displays error messages from API responses in toast notifications.

#### Basic Usage

Instead of using static error messages:

```typescript
// ❌ Before (static message)
try {
  await apiCall();
} catch (error) {
  toast.error("Failed to load data");
}
```

Use the error handler to show the actual API error message:

```typescript
// ✅ After (dynamic message from API)
import { showErrorToast } from "@/lib/api/errorHandler";

try {
  await apiCall();
} catch (error) {
  showErrorToast(error, {
    title: "Failed to load data",
  });
}
```

#### Available Functions

**`showErrorToast(error, options?)`**
```typescript
showErrorToast(error, {
  title: "Custom Title",
  showRetry: true,
  onRetry: () => refetch(),
  duration: 5000,
});
```

**`showSuccessToast(message, description?)`**
```typescript
showSuccessToast("Client created successfully", "You can now view the client details");
```

**`showWarningToast(message, options?)`**
```typescript
showWarningToast("Delete client?", {
  description: "This action cannot be undone",
  action: { label: "Delete", onClick: () => deleteClient() },
  cancel: { label: "Cancel", onClick: () => {} },
});
```

**`getErrorMessage(error)`**
```typescript
const errorMessage = getErrorMessage(error);
// Returns user-friendly error message
```

#### Error Message Priority

1. **API Error Message**: `error.message` from the API response
2. **HTTP Status Code**: Maps to user-friendly messages (400, 401, 403, 404, 500, etc.)
3. **Error Code**: Handles `NETWORK_ERROR`, `REQUEST_ERROR`
4. **Validation Errors**: Formats field-level errors from `error.errors`
5. **Fallback**: Generic "Something went wrong" message

#### HTTP Status Messages

- **400**: Invalid request. Please check your input and try again.
- **401**: Your session has expired. Please log in again.
- **403**: You don't have permission to perform this action.
- **404**: The requested resource was not found.
- **500**: Internal server error. Please try again later.
- **503**: Service unavailable. Please try again later.

#### Examples

**React Query Error Handling:**
```typescript
const { data, isError, error } = useQuery({
  queryKey: ["clients"],
  queryFn: getClients,
});

React.useEffect(() => {
  if (isError && error) {
    showErrorToast(error, { title: "Failed to load clients" });
  }
}, [isError, error]);
```

**Try-Catch Error Handling:**
```typescript
try {
  const data = await getClientById(id);
} catch (error) {
  showErrorToast(error, { title: "Failed to load client details" });
}
```

#### Integrated Files

- ✅ [app/clients2/page.tsx](../../app/clients2/page.tsx)
- ✅ [app/clients2/[id]/page.tsx](../../app/clients2/[id]/page.tsx)
- ✅ [hooks/api/useAuth.ts](../../hooks/api/useAuth.ts)
- ✅ [components/clients/AddClientModal.tsx](../../components/clients/AddClientModal.tsx)
