# API Reference - CRM System
ADMIN TEST USER IN THE LIVE API:
Email:	admin@yoel.com
Password:	Admin1234
Role:	ADMIN
**Version:** 2.0.0
**Production URL:** `https://api.the-shul.com`
**Alternative URL:** `https://srv1156979.hstgr.cloud`
**Development URL:** `http://localhost:3000`
**Last Updated:** 2025-12-06 (HTTPS Deployment + Security Hardening)

🔒 **Security Update:** This version includes comprehensive security improvements including XSS protection, IDOR prevention, rate limiting, security headers, and full HTTPS encryption.

🌐 **HTTPS Enabled:** All production endpoints are now secured with SSL/TLS encryption via Let's Encrypt.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Codes](#error-codes)
4. [API Endpoints](#api-endpoints)
   - [Auth](#auth-endpoints)
   - [API Keys](#api-keys-endpoints)
   - [Customers](#customers-endpoints)
   - [Products](#products-endpoints)
   - [Orders](#orders-endpoints)
   - [Departments](#departments-endpoints)
   - [Workflows](#workflows-endpoints)
   - [Parameters](#parameters-endpoints)
   - [Tasks](#tasks-endpoints)
   - [Files](#files-endpoints)
   - [Analytics](#analytics-endpoints)

---

## HTTPS & Security

### Production Environment
All production requests **MUST** use HTTPS for security:
- ✅ **Use:** `https://api.the-shul.com` or `https://srv1156979.hstgr.cloud`
- ❌ **Don't use:** `http://` in production

### Security Features
- 🔒 **TLS 1.2/1.3** encryption for all traffic
- 🔒 **Let's Encrypt SSL certificate** (auto-renewed every 90 days)
- 🔒 **HSTS** (HTTP Strict Transport Security) enabled
- 🔒 **Automatic HTTP → HTTPS redirect**
- 🔒 **Content Security Policy (CSP)** headers

### Development Environment
For local development, you can use:
- `http://localhost:3000` (no SSL required)

**Note:** All code examples in this document use `https://api.the-shul.com` for production. Replace with `http://localhost:3000` for local development.

---

## Authentication

All endpoints (except registration and login) require authentication. The API supports two authentication methods:

### 1. JWT Authentication (Recommended for user sessions)

**Header:**
```
Authorization: Bearer <your-jwt-token>
```

**Getting a Token:**
```bash
# Production
curl -X POST https://api.the-shul.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yoel.com","password":"Admin1234"}'

# Development
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yoel.com","password":"Admin1234"}'
```

**Test Admin Account:**
| Field | Value |
|-------|-------|
| Email | `admin@yoel.com` |
| Password | `Admin1234` |
| Role | `ADMIN` |

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "ADMIN"
    }
  }
}
```

### 2. API Key Authentication (For integrations and automation)

**Header:**
```
X-API-Key: crm_live_your_64_character_api_key_here
```

API Keys are long-lived credentials that can be created and managed through the `/api-keys` endpoints. They support:
- Custom permissions per key
- Expiration dates
- Activity tracking (last used)
- Enable/disable functionality

**Example Usage:**
```bash
# Production
curl -H "X-API-Key: crm_live_abc123..." https://api.the-shul.com/customers

# Development
curl -H "X-API-Key: crm_live_abc123..." http://localhost:3000/customers
```

### 3. Google OAuth (Password-less login)

Users can authenticate using their Google account instead of creating a password. See [Auth Endpoints](#auth-endpoints) for OAuth flow details.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Additional details or validation errors"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed (Zod) |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `INVALID_API_KEY` | 401 | Invalid or expired API key |
| `FORBIDDEN` | 403 | Insufficient permissions or ownership |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource already exists (duplicate) |
| `INSUFFICIENT_STOCK` | 400 | Not enough inventory |
| `USER_HAS_NO_PASSWORD` | 400 | Account uses OAuth, password login not available |
| `EMAIL_NOT_VERIFIED` | 400 | Google email not verified |
| `GOOGLE_API_ERROR` | 502 | Failed to authenticate with Google |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests (100/minute) |
| `INTERNAL_ERROR` | 500 | Server error |

---

## API Endpoints

### Auth Endpoints

#### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE"
    }
  }
}
```

**Notes:**
- 🔒 **SECURITY:** Role field is NOT accepted - all new users are created as EMPLOYEE by default
- Password must be at least 6 characters
- Email must be unique
- Only ADMIN users can change roles after registration

---

#### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Response:** Same as register

---

#### Get Current User
```http
GET /auth/me
```

**Auth:** Required
**Description:** Returns the authenticated user's profile information

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE",
      "phone": "123-456-7890",
      "avatar": "https://example.com/avatar.jpg",
      "department": {
        "id": "uuid",
        "name": "Embroidery",
        "color": "#FF5733"
      }
    }
  }
}
```

---

#### Get Google OAuth URL
```http
GET /auth/google
```

**Auth:** Not required
**Description:** Returns the Google OAuth authorization URL to redirect users to

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=..."
  }
}
```

**Frontend Flow:**
1. Get OAuth URL from this endpoint
2. Redirect user to the URL
3. User authenticates with Google
4. Google redirects back to your callback URL with `code` parameter
5. Send code to `/auth/google/callback` endpoint

---

#### Google OAuth Callback
```http
GET /auth/google/callback?code=<authorization-code>
```

**Auth:** Not required
**Description:** Handles the Google OAuth callback and returns JWT token

**Query Parameters:**
- `code` (required): Authorization code from Google

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE",
      "avatar": "https://lh3.googleusercontent.com/...",
      "departmentId": null
    }
  }
}
```

**Notes:**
- If user doesn't exist, a new account is created with role EMPLOYEE
- If user exists with same email, the Google account is linked
- Google email must be verified
- Users who sign up via Google OAuth have `password: null` and cannot use password login

---

### API Keys Endpoints

API Keys provide a way to authenticate requests without JWT tokens, perfect for integrations, automation, and third-party services.

#### Create API Key
```http
POST /api-keys
```

**Auth:** Required (JWT)
**Description:** Creates a new API key for the authenticated user

**Body:**
```json
{
  "name": "Production Integration",
  "permissions": ["customers:read", "orders:read", "orders:write"],
  "expiresAt": "2025-12-31T23:59:59.000Z"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "uuid",
      "name": "Production Integration",
      "key": "crm_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
      "keyPrefix": "crm_live_a1b2c3d4",
      "permissions": ["customers:read", "orders:read", "orders:write"],
      "isActive": true,
      "expiresAt": "2025-12-31T23:59:59.000Z",
      "createdAt": "2025-12-03T10:00:00.000Z"
    },
    "warning": "Save this API key now. You won't be able to see it again!"
  }
}
```

**Notes:**
- The full API key is returned only once at creation
- Store it securely - it cannot be retrieved later
- Keys are hashed using bcrypt before storage
- Default permissions is an empty array (no access)
- Keys never expire if `expiresAt` is not provided

---

#### List API Keys
```http
GET /api-keys?page=1&limit=10&isActive=true
```

**Auth:** Required (JWT)
**Description:** Lists all API keys for the authenticated user

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "uuid",
        "name": "Production Integration",
        "keyPrefix": "crm_live_a1b2c3d4",
        "permissions": ["customers:read", "orders:read"],
        "isActive": true,
        "lastUsedAt": "2025-12-03T09:00:00.000Z",
        "expiresAt": "2025-12-31T23:59:59.000Z",
        "createdAt": "2025-12-03T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Notes:**
- Full API key is never returned after creation
- Only key prefix is shown for identification

---

#### Get API Key
```http
GET /api-keys/:id
```

**Auth:** Required (JWT)
**Description:** Get details of a specific API key

**Response:** Same structure as single item in list response

---

#### Update API Key
```http
PUT /api-keys/:id
```

**Auth:** Required (JWT)
**Description:** Update API key settings (cannot change the key itself)

**Body:**
```json
{
  "name": "Updated Name",
  "permissions": ["customers:read", "customers:write"],
  "isActive": false,
  "expiresAt": "2026-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "uuid",
      "name": "Updated Name",
      "keyPrefix": "crm_live_a1b2c3d4",
      "permissions": ["customers:read", "customers:write"],
      "isActive": false,
      "expiresAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2025-12-03T10:30:00.000Z"
    }
  }
}
```

**Notes:**
- All fields are optional
- Use `isActive: false` to temporarily disable a key
- Cannot update the actual key value

---

#### Delete API Key
```http
DELETE /api-keys/:id
```

**Auth:** Required (JWT)
**Description:** Permanently delete an API key

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "API key deleted successfully"
  }
}
```

**Notes:**
- Deletion is permanent and cannot be undone
- Any integrations using this key will immediately lose access

---

### Customers Endpoints

#### List Customers
```http
GET /customers?page=1&limit=10&status=ACTIVE&search=john
```

**Auth:** Required
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): ACTIVE | INACTIVE
- `search` (optional): Search by name or email (max: 255 characters)

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

#### Get Customer by ID
```http
GET /customers/:id
```

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "companyName": "Acme Corp",
    "status": "ACTIVE",
    "createdAt": "2025-12-03T10:00:00Z",
    "updatedAt": "2025-12-03T10:00:00Z"
  }
}
```

---

#### Create Customer
```http
POST /customers
```

**Auth:** Required
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "companyName": "Acme Corp",
  "status": "ACTIVE"
}
```

**Validation Rules:**
- 🔒 `name`: Min 2, max 255 characters, alphanumeric + Hebrew + spaces/hyphens/apostrophes only
- 🔒 `phone`: Max 20 characters, digits/spaces/hyphens/parentheses/plus sign only
- 🔒 `email`: Valid email format, automatically converted to lowercase
- 🔒 All inputs are sanitized to prevent XSS attacks

**Response:** Customer object

---

#### Update Customer
```http
PUT /customers/:id
```

**Auth:** Required
**Body:** Same as create (all fields optional)

**Notes:**
- 🔒 **SECURITY:** Users can only update their own customers (unless ADMIN/MANAGER)
- Returns 403 FORBIDDEN if user doesn't own the customer

---

#### Delete Customer
```http
DELETE /customers/:id
```

**Auth:** Required

**Notes:**
- 🔒 **SECURITY:** Users can only delete their own customers (unless ADMIN/MANAGER)
- ADMIN users can delete any customer
- Returns 403 FORBIDDEN if user doesn't own the customer

---

### Products Endpoints

#### List Products
```http
GET /products?page=1&limit=10&status=ACTIVE&category=RITUAL&search=parochet
```

**Auth:** Required
**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: ACTIVE | DISCONTINUED
- `category`: Product category
- `search`: Search by name or SKU

---

#### Get Product by ID
```http
GET /products/:id
```

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Parochet",
    "sku": "PAR-001",
    "description": "Torah ark curtain",
    "price": 200.00,
    "stockQuantity": 50,
    "category": "RITUAL",
    "status": "ACTIVE",
    "workflow": {
      "id": "uuid",
      "name": "Parochet Production"
    },
    "parameterAssignments": [...]
  }
}
```

---

#### Create Product
```http
POST /products
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "name": "Parochet",
  "sku": "PAR-001",
  "description": "Torah ark curtain",
  "price": 200.00,
  "stockQuantity": 50,
  "category": "RITUAL",
  "status": "ACTIVE"
}
```

---

#### Update Product
```http
PUT /products/:id
```

**Auth:** ADMIN or MANAGER
**Body:** Same as create (all fields optional)

---

#### Delete Product
```http
DELETE /products/:id
```

**Auth:** ADMIN only
**Description:** Deletes a product (soft delete - sets status to DISCONTINUED)

---

#### Update Stock
```http
POST /products/:id/stock
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "operation": "INCREMENT",  // INCREMENT | DECREMENT | SET
  "quantity": 10
}
```

---

### Orders Endpoints

#### List Orders
```http
GET /orders?page=1&limit=10&status=PENDING&customerId=uuid
```

**Auth:** Required
**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: PENDING | PROCESSING | COMPLETED | CANCELLED
- `customerId`: Filter by customer

---

#### Get Order by ID
```http
GET /orders/:id
```

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-20251203-001",
    "customerId": "uuid",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "PENDING",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "product": {
          "name": "Parochet",
          "sku": "PAR-001"
        },
        "quantity": 1,
        "unitPrice": 200.00,
        "selectedParameters": [
          {
            "parameterId": "uuid",
            "optionId": "uuid",
            "value": "Gold"
          }
        ]
      }
    ],
    "notes": "Customer notes",
    "createdAt": "2025-12-03T10:00:00Z"
  }
}
```

---

#### Create Order
```http
POST /orders
```

**Auth:** Required
**Body:**
```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 1,
      "unitPrice": 200.00,
      "selectedParameters": [
        {
          "parameterId": "uuid",
          "optionId": "uuid"
        }
      ]
    }
  ],
  "notes": "Special instructions"
}
```

**Important:** This will automatically reduce stock quantity!

---

#### Update Order
```http
PUT /orders/:id
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "status": "PROCESSING",
  "notes": "Updated notes"
}
```

---

#### Cancel Order
```http
POST /orders/:id/cancel
```

**Auth:** ADMIN only
**Note:** Restores stock quantities

---

### Departments Endpoints

#### List Departments
```http
GET /departments?page=1&limit=10
```

**Auth:** Required

---

#### Get Active Departments
```http
GET /departments/active
```

**Auth:** Required
**Response:** Array of active departments (no pagination)

---

#### Get Department by ID
```http
GET /departments/:id
```

**Auth:** Required

---

#### Create Department
```http
POST /departments
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "name": "Embroidery",
  "code": "EMBROIDER",
  "description": "Embroidery department",
  "color": "#FF5733"
}
```

---

#### Update Department
```http
PUT /departments/:id
```

**Auth:** ADMIN or MANAGER
**Body:** Same as create (all fields optional)

---

#### Delete Department
```http
DELETE /departments/:id
```

**Auth:** ADMIN only
**Description:** Deletes a department (cannot delete if has associated users or tasks)

---

### Workflows Endpoints

#### List Workflows
```http
GET /workflows?page=1&limit=10
```

**Auth:** Required

---

#### Get Active Workflows
```http
GET /workflows/active
```

**Auth:** Required
**Description:** Returns only active workflows (no pagination)

---

#### Get Workflow by ID
```http
GET /workflows/:id
```

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Parochet Production",
    "code": "PAROCHET_WF",
    "description": "Standard workflow",
    "isActive": true,
    "steps": [
      {
        "id": "uuid",
        "name": "Cut Fabric",
        "departmentId": "uuid",
        "department": {
          "name": "Cutting"
        },
        "estimatedDurationDays": 1,
        "sortOrder": 1
      }
    ]
  }
}
```

---

#### Create Workflow
```http
POST /workflows
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "name": "Parochet Production",
  "code": "PAROCHET_WF",
  "description": "Standard workflow"
}
```

---

#### Update Workflow
```http
PUT /workflows/:id
```

**Auth:** ADMIN or MANAGER
**Body:** Same as create (all fields optional)

---

#### Delete Workflow
```http
DELETE /workflows/:id
```

**Auth:** ADMIN only
**Description:** Deletes a workflow (cannot delete if linked to products)

---

#### Add Workflow Step
```http
POST /workflows/:workflowId/steps
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "name": "Cut Fabric",
  "departmentId": "uuid",
  "estimatedDurationDays": 1,
  "sortOrder": 1
}
```

---

#### Update Workflow Step
```http
PUT /workflows/steps/:stepId
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "name": "Updated Step Name",
  "departmentId": "uuid",
  "estimatedDurationDays": 2,
  "sortOrder": 1
}
```

---

#### Delete Workflow Step
```http
DELETE /workflows/steps/:stepId
```

**Auth:** ADMIN or MANAGER
**Description:** Removes a step from workflow

---

#### Reorder Workflow Steps
```http
PUT /workflows/:workflowId/reorder
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "stepIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Description:** Reorders workflow steps by providing array of step IDs in desired order

---

#### Link Workflow to Product
```http
POST /workflows/link-product
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "productId": "uuid",
  "workflowId": "uuid"
}
```

---

#### Unlink Workflow from Product
```http
DELETE /workflows/unlink-product/:productId
```

**Auth:** ADMIN or MANAGER
**Description:** Removes workflow assignment from a product

---

### Parameters Endpoints

#### List Parameters
```http
GET /parameters?page=1&limit=10&type=SELECT&isActive=true&search=color
```

**Auth:** Required
**Query Parameters:**
- `type`: TEXT | SELECT | COLOR | NUMBER | DATE
- `isActive`: true | false
- `search`: Search by name, code, description

---

#### Get Active Parameters
```http
GET /parameters/active
```

**Auth:** Required
**Description:** Returns only active parameters (no pagination)

---

#### Get Parameter by ID
```http
GET /parameters/:id
```

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Fabric Color",
    "code": "fabric_color",
    "type": "COLOR",
    "description": "Select fabric color",
    "isRequired": true,
    "isActive": true,
    "sortOrder": 1,
    "options": [
      {
        "id": "uuid",
        "value": "gold",
        "label": "Gold",
        "priceImpact": 50.00,
        "colorHex": "#FFD700",
        "sortOrder": 1,
        "isActive": true
      }
    ]
  }
}
```

---

#### Create Parameter
```http
POST /parameters
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "name": "Fabric Color",
  "code": "fabric_color",
  "type": "COLOR",
  "description": "Select fabric color",
  "isRequired": true,
  "options": [
    {
      "value": "gold",
      "label": "Gold",
      "priceImpact": 50.00,
      "colorHex": "#FFD700",
      "sortOrder": 1
    }
  ]
}
```

---

#### Update Parameter
```http
PUT /parameters/:id
```

**Auth:** ADMIN or MANAGER
**Body:** Same as create (all fields optional)

---

#### Delete Parameter
```http
DELETE /parameters/:id
```

**Auth:** ADMIN only
**Description:** Deletes a parameter (cannot delete if assigned to products)

---

#### Add Parameter Option
```http
POST /parameters/:parameterId/options
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "value": "silver",
  "label": "Silver",
  "priceImpact": 30.00,
  "colorHex": "#C0C0C0",
  "sortOrder": 2
}
```

---

#### Update Parameter Option
```http
PUT /parameters/options/:optionId
```

**Auth:** ADMIN or MANAGER
**Body:** Same as add option (all fields optional)

---

#### Delete Parameter Option
```http
DELETE /parameters/options/:optionId
```

**Auth:** ADMIN or MANAGER
**Description:** Removes an option from a parameter

---

#### Assign Parameter to Product
```http
POST /parameters/assign
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "productId": "uuid",
  "parameterId": "uuid",
  "sortOrder": 1
}
```

---

#### Unassign Parameter from Product
```http
DELETE /parameters/unassign/:productId/:parameterId
```

**Auth:** ADMIN or MANAGER
**Description:** Removes parameter assignment from a product

---

#### Get Product Parameters
```http
GET /products/:productId/parameters
```

**Auth:** Required
**Description:** Returns all parameters assigned to a specific product

---

#### Calculate Product Price
```http
POST /parameters/calculate-price
```

**Auth:** Required
**Body:**
```json
{
  "productId": "uuid",
  "selectedParameters": [
    {
      "parameterId": "uuid",
      "optionId": "uuid"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "uuid",
    "productName": "Parochet",
    "basePrice": "200.00",
    "finalPrice": "250.00",
    "breakdown": [
      {
        "type": "base",
        "name": "Base Price",
        "value": "200.00"
      },
      {
        "type": "option",
        "parameterName": "Fabric Color",
        "optionLabel": "Gold",
        "value": "50.00"
      }
    ]
  }
}
```

---

### Tasks Endpoints

#### List Tasks
```http
GET /tasks?page=1&limit=10&status=PENDING&departmentId=uuid&assignedToId=uuid&orderItemId=uuid
```

**Auth:** Required
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, **max: 100**)
- `status`: PENDING | IN_PROGRESS | COMPLETED | BLOCKED | CANCELLED
- `departmentId`: Filter by department
- `assignedToId`: Filter by assigned user
- `orderItemId`: Filter by order item

**⚠️ Note:** `limit` parameter has a maximum value of 100. Requests with `limit` > 100 will return a 500 error.

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "status": "PENDING",
        "sortOrder": 1,
        "notes": null,
        "completedAt": null,
        "workflowStep": {
          "name": "Cut Fabric"
        },
        "department": {
          "name": "Cutting"
        },
        "assignedTo": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

#### Get My Tasks
```http
GET /tasks/my?status=PENDING
```

**Auth:** Required
**Description:** Returns tasks assigned to the authenticated user

---

#### Get Task by ID
```http
GET /tasks/:id
```

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "sortOrder": 1,
    "notes": "Started cutting",
    "completedAt": null,
    "createdAt": "2025-12-03T10:00:00Z",
    "updatedAt": "2025-12-03T11:00:00Z",
    "workflowStep": {
      "id": "uuid",
      "name": "Cut Fabric",
      "estimatedDurationDays": 1
    },
    "department": {
      "id": "uuid",
      "name": "Cutting",
      "code": "CUTTING"
    },
    "assignedTo": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "orderItem": {
      "id": "uuid",
      "quantity": 1,
      "unitPrice": 200.00,
      "product": {
        "name": "Parochet",
        "sku": "PAR-001"
      },
      "order": {
        "orderNumber": "ORD-20251203-001",
        "customer": {
          "name": "Customer Name"
        }
      }
    }
  }
}
```

---

#### Get Tasks by Order Item
```http
GET /tasks/order-item/:orderItemId
```

**Auth:** Required
**Description:** Returns all tasks for a specific order item (full workflow)

---

#### Get Tasks by Department
```http
GET /tasks/department/:departmentId?status=PENDING
```

**Auth:** Required
**Description:** Returns all tasks for a department with optional status filter

---

#### Update Task
```http
PUT /tasks/:id
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "status": "IN_PROGRESS",
  "notes": "Started working on this task"
}
```

---

#### Assign Task
```http
POST /tasks/:id/assign
```

**Auth:** ADMIN or MANAGER
**Body:**
```json
{
  "assignedToId": "uuid"
}
```

**Validation:** User must belong to the task's department!

---

#### Unassign Task
```http
DELETE /tasks/:id/assign
```

**Auth:** ADMIN or MANAGER
**Description:** Removes task assignment

---

#### Complete Task
```http
POST /tasks/:id/complete
```

**Auth:** Required (all authenticated users)
**Description:** Marks task as completed with timestamp

---

#### Cancel Task
```http
POST /tasks/:id/cancel
```

**Auth:** ADMIN or MANAGER
**Description:** Cancels task (cannot cancel completed tasks)

---

### Files Endpoints

#### Upload File
```http
POST /files/upload
```

**Auth:** Required (all authenticated users)
**Content-Type:** `multipart/form-data`
**Body:**
- `file`: File to upload
- `entityType` (optional): CUSTOMER | PRODUCT | ORDER | TASK
- `entityId` (optional): UUID of the related entity

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalName": "document.pdf",
    "storagePath": "uploads/2025/12/03/file.pdf",
    "mimeType": "application/pdf",
    "size": 102400,
    "entityType": "ORDER",
    "entityId": "uuid",
    "uploadedBy": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "createdAt": "2025-12-03T10:00:00Z"
  }
}
```

**Notes:**
- Maximum file size: 10MB (configurable via MAX_FILE_SIZE env variable)
- Files are stored using Supabase Storage (if configured) or local filesystem

---

#### List Files
```http
GET /files?page=1&limit=10&entityType=ORDER&entityId=uuid
```

**Auth:** Required
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `entityType` (optional): Filter by entity type
- `entityId` (optional): Filter by entity ID

---

#### Get File by ID
```http
GET /files/:id
```

**Auth:** Required
**Description:** Returns file metadata (not the file itself)

---

#### Download File
```http
GET /files/:id/download
```

**Auth:** Required
**Description:** Downloads the actual file

---

#### Get Signed URL
```http
GET /files/:id/signed-url
```

**Auth:** Required
**Description:** Generates a temporary signed URL for file access (when using Supabase)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://supabase-storage-url/signed-token",
    "expiresIn": 3600
  }
}
```

---

#### Delete File
```http
DELETE /files/:id
```

**Auth:** ADMIN or MANAGER
**Description:** Deletes file from storage and database

---

### Analytics Endpoints

All analytics endpoints are prefixed with `/analytics` and require authentication.

#### Dashboard Overview
```http
GET /analytics/dashboard
```

**Auth:** Required
**Description:** Returns high-level overview statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 50000.00,
    "totalOrders": 150,
    "totalCustomers": 45,
    "activeTasks": 23,
    "pendingOrders": 12,
    "completedOrdersThisMonth": 38
  }
}
```

---

#### Sales Analytics
```http
GET /analytics/sales?startDate=2025-01-01&endDate=2025-12-31
```

**Auth:** Required
**Query Parameters:**
- `startDate` (optional): Start date for analysis
- `endDate` (optional): End date for analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": 50000.00,
    "orderCount": 150,
    "averageOrderValue": 333.33,
    "salesByStatus": {
      "COMPLETED": 45000.00,
      "PROCESSING": 5000.00
    }
  }
}
```

---

#### Revenue Trends
```http
GET /analytics/revenue-trends?period=monthly&year=2025
```

**Auth:** Required
**Query Parameters:**
- `period`: daily | weekly | monthly | yearly
- `year` (optional): Year for analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2025-01",
        "revenue": 4200.00,
        "orderCount": 12
      },
      {
        "period": "2025-02",
        "revenue": 5800.00,
        "orderCount": 15
      }
    ]
  }
}
```

---

#### Customer Analytics
```http
GET /analytics/customers
```

**Auth:** Required
**Description:** Returns customer-related analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 45,
    "activeCustomers": 38,
    "inactiveCustomers": 7,
    "topCustomers": [
      {
        "id": "uuid",
        "name": "John Doe",
        "totalOrders": 15,
        "totalSpent": 5000.00
      }
    ]
  }
}
```

---

#### Product Analytics
```http
GET /analytics/products
```

**Auth:** Required
**Description:** Returns product-related analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 120,
    "activeProducts": 105,
    "discontinuedProducts": 15,
    "lowStockProducts": 8,
    "topSellingProducts": [
      {
        "id": "uuid",
        "name": "Parochet",
        "orderCount": 45,
        "revenue": 9000.00
      }
    ]
  }
}
```

---

#### Task Analytics
```http
GET /analytics/tasks?departmentId=uuid
```

**Auth:** Required
**Query Parameters:**
- `departmentId` (optional): Filter by department

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 200,
    "tasksByStatus": {
      "PENDING": 50,
      "IN_PROGRESS": 30,
      "COMPLETED": 110,
      "CANCELLED": 10
    },
    "averageCompletionTime": 2.5,
    "tasksByDepartment": [
      {
        "departmentId": "uuid",
        "departmentName": "Cutting",
        "taskCount": 45
      }
    ]
  }
}
```

---

## Rate Limiting

🔒 **SECURITY:** Rate limiting is enabled globally across all endpoints.

**Limits:**
- **100 requests per minute** per IP address
- Applies to all endpoints (global)
- Separate counters for different IP addresses

**Rate Limit Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

**HTTP Status:** 429 Too Many Requests

**Best Practices:**
- Implement exponential backoff in your client
- Cache responses when possible
- Use webhooks instead of polling
- Contact support if you need higher limits

---

## Versioning

API version is included in package.json. Breaking changes will increment major version.

---

## Support

For issues or questions:
- GitHub Issues: [Repository Issues](https://github.com/dudu1111685/yoel/issues)
- Email: sh0526342871@gmail.com

---

## Production Infrastructure

### Servers
- **Primary:** https://api.the-shul.com (Custom domain)
- **Secondary:** https://srv1156979.hstgr.cloud (Hostinger domain)
- **IP Address:** 72.61.189.144

### SSL Certificate
- **Provider:** Let's Encrypt
- **Renewal:** Automatic (every 90 days)
- **Contact:** sh0526342871@gmail.com

### Architecture
```
Internet → Nginx (Reverse Proxy + SSL Termination)
          ↓
       Docker Container (Backend API on port 3000)
          ↓
       PostgreSQL Database (Docker Container)
```

### Uptime & Monitoring
- Health Check: `https://api.the-shul.com/health`
- Expected Response: `{"success":true,"data":{"status":"OK"}}`
