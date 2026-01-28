# API Documentation
## Sistem POS Multi-Tenant SaaS - MVP Version 1.0

**Version:** 1.0.0  
**Date:** 2026-01-18  
**Base URL:** `https://api.posapp.com/v1`  
**Protocol:** HTTPS only  

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [API Endpoints](#2-api-endpoints)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [Pagination](#5-pagination)
6. [OpenAPI Specification](#6-openapi-specification)

---

## 1. Authentication

### 1.1 Authentication Flow

**JWT Token-Based Authentication** dengan RS256 signing.

**Flow:**
1. Login → Receive Access Token (15 min) + Refresh Token (7 days)
2. Attach Access Token ke setiap request: `Authorization: Bearer <token>`
3. When Access Token expired → Use Refresh Token untuk get new Access Token
4. Logout → Invalidate Refresh Token

### 1.2 Token Structure

**Access Token Payload:**
```json
{
  "user_id": "uuid-123",
  "company_id": "uuid-456",
  "outlet_id": "uuid-789",
  "role": "cashier",
  "exp": 1737205200,
  "iat": 1737204300
}
```

---

## 2. API Endpoints

### 2.1 Authentication Endpoints

#### POST /auth/register
**Description:** Register company baru (onboarding)

**Request Body:**
```json
{
  "company_name": "Kopi Kenangan",
  "business_type": "f&b",
  "owner_name": "Budi Santoso",
  "owner_email": "budi@kopiken.com",
  "phone": "081234567890",
  "password": "SecurePass123!",
  "subscription_plan": "trial"
}
```

**Response 201:**
```json
{
  "data": {
    "company_id": "uuid-abc",
    "owner_id": "uuid-def",
    "default_outlet_id": "uuid-ghi",
    "trial_ends_at": "2026-02-01T23:59:59Z"
  },
  "message": "Company registered successfully. Welcome email sent."
}
```

---

#### POST /auth/login
**Description:** Login user

**Request Body:**
```json
{
  "email": "kasir@kopiken.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900,
    "user": {
      "id": "uuid-user",
      "full_name": "Andi Wijaya",
      "email": "kasir@kopiken.com",
      "role": "cashier",
      "company_id": "uuid-company",
      "outlet_id": "uuid-outlet"
    }
  }
}
```

---

#### POST /auth/refresh
**Description:** Refresh access token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response 200:**
```json
{
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900
  }
}
```

---

#### POST /auth/logout
**Description:** Logout user (invalidate refresh token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response 204:** No Content

---

### 2.2 Product Endpoints

#### GET /products
**Description:** Get all products untuk company

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 100)
- `category_id` (uuid, optional)
- `status` (string, optional: active|inactive)
- `search` (string, optional)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid-prod-1",
      "sku": "KOP-001",
      "product_name": "Kopi Latte",
      "category": {
        "id": "uuid-cat",
        "category_name": "Beverages"
      },
      "selling_price": 25000,
      "cost_price": 15000,
      "barcode": "1234567890123",
      "image_url": "https://cdn.posapp.com/products/kopi-latte.jpg",
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

#### POST /products
**Description:** Create product baru

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** Owner, Manager

**Request Body:**
```json
{
  "sku": "KOP-002",
  "product_name": "Kopi Americano",
  "category_id": "uuid-cat",
  "selling_price": 20000,
  "cost_price": 12000,
  "barcode": "1234567890124",
  "description": "Kopi hitam tanpa gula",
  "minimum_stock": 10
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid-prod-2",
    "sku": "KOP-002",
    "product_name": "Kopi Americano",
    "selling_price": 20000,
    "created_at": "2026-01-18T14:30:00Z"
  }
}
```

---

#### GET /products/{id}
**Description:** Get product detail

**Response 200:**
```json
{
  "data": {
    "id": "uuid-prod-1",
    "sku": "KOP-001",
    "product_name": "Kopi Latte",
    "category": { "id": "uuid", "category_name": "Beverages" },
    "selling_price": 25000,
    "cost_price": 15000,
    "inventory": [
      {
        "outlet_id": "uuid-outlet-1",
        "outlet_name": "Cabang Senayan",
        "quantity_on_hand": 50,
        "minimum_stock": 10,
        "status": "OK"
      },
      {
        "outlet_id": "uuid-outlet-2",
        "outlet_name": "Cabang BSD",
        "quantity_on_hand": 8,
        "minimum_stock": 10,
        "status": "Low Stock"
      }
    ]
  }
}
```

---

#### PATCH /products/{id}
**Description:** Update product

**Permissions:** Owner, Manager

**Request Body:**
```json
{
  "selling_price": 27000,
  "status": "active"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "uuid-prod-1",
    "product_name": "Kopi Latte",
    "selling_price": 27000,
    "updated_at": "2026-01-18T15:00:00Z"
  }
}
```

---

#### DELETE /products/{id}
**Description:** Soft delete product

**Permissions:** Owner

**Response 204:** No Content

---

### 2.3 Inventory Endpoints

#### GET /inventory
**Description:** Get inventory untuk outlet (filtered by JWT outlet_id untuk cashier/manager)

**Query Parameters:**
- `outlet_id` (uuid, optional - hanya untuk Owner)
- `low_stock` (boolean, optional)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid-inv-1",
      "product": {
        "id": "uuid-prod",
        "sku": "KOP-001",
        "product_name": "Kopi Latte"
      },
      "outlet": {
        "id": "uuid-outlet",
        "outlet_name": "Cabang Senayan"
      },
      "quantity_on_hand": 50,
      "minimum_stock": 10,
      "status": "OK",
      "last_restocked_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

#### POST /inventory/restock
**Description:** Tambah stok produk

**Permissions:** Owner, Manager

**Request Body:**
```json
{
  "product_id": "uuid-prod-1",
  "outlet_id": "uuid-outlet-1",
  "quantity": 50,
  "notes": "Restock dari supplier ABC"
}
```

**Response 200:**
```json
{
  "data": {
    "inventory_id": "uuid-inv-1",
    "product_name": "Kopi Latte",
    "previous_stock": 10,
    "added_quantity": 50,
    "new_stock": 60,
    "movement_id": "uuid-movement"
  }
}
```

---

#### POST /inventory/adjust
**Description:** Manual adjustment stok (koreksi)

**Permissions:** Manager (approval required untuk adjustment > 10 items)

**Request Body:**
```json
{
  "product_id": "uuid-prod-1",
  "outlet_id": "uuid-outlet-1",
  "quantity": -5,
  "notes": "Produk rusak/expired",
  "reason": "damaged"
}
```

**Response 200:**
```json
{
  "data": {
    "inventory_id": "uuid-inv-1",
    "previous_stock": 60,
    "adjustment": -5,
    "new_stock": 55
  }
}
```

---

### 2.4 Transaction Endpoints

#### POST /transactions
**Description:** Create transaksi penjualan

**Permissions:** Owner, Manager, Cashier

**Request Body:**
```json
{
  "outlet_id": "uuid-outlet-1",
  "items": [
    {
      "product_id": "uuid-prod-1",
      "quantity": 2
    },
    {
      "product_id": "uuid-prod-2",
      "quantity": 1
    }
  ],
  "payment_method": "cash",
  "payment_amount": 100000,
  "notes": "Customer request: extra ice"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid-trx",
    "invoice_number": "INV-SEN-20260118-0001",
    "transaction_date": "2026-01-18T14:30:00Z",
    "items": [
      {
        "product_name": "Kopi Latte",
        "sku": "KOP-001",
        "quantity": 2,
        "unit_price": 25000,
        "subtotal": 50000
      },
      {
        "product_name": "Kopi Americano",
        "sku": "KOP-002",
        "quantity": 1,
        "unit_price": 20000,
        "subtotal": 20000
      }
    ],
    "subtotal": 70000,
    "tax_amount": 7000,
    "discount_amount": 0,
    "total_amount": 77000,
    "payment_method": "cash",
    "payment_amount": 100000,
    "change_amount": 23000,
    "status": "completed",
    "receipt_url": "https://api.posapp.com/v1/transactions/uuid-trx/receipt"
  }
}
```

---

#### POST /transactions/{id}/pay
**Description:** Process payment untuk pending transaction (untuk QRIS flow)

**Request Body:**
```json
{
  "payment_method": "qris"
}
```

**Response 200:**
```json
{
  "data": {
    "transaction_id": "uuid-trx",
    "payment_method": "qris",
    "qris_code": "00020101021226...",
    "qris_image_url": "https://api.midtrans.com/qr/uuid-payment.png",
    "amount": 77000,
    "expires_at": "2026-01-18T14:35:00Z",
    "status": "pending_payment"
  }
}
```

---

#### GET /transactions
**Description:** Get transaction history

**Query Parameters:**
- `outlet_id` (uuid, optional - untuk Owner)
- `date_from` (date, format: YYYY-MM-DD)
- `date_to` (date)
- `payment_method` (string)
- `status` (string)
- `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid-trx",
      "invoice_number": "INV-SEN-20260118-0001",
      "transaction_date": "2026-01-18T14:30:00Z",
      "outlet_name": "Cabang Senayan",
      "cashier_name": "Andi Wijaya",
      "total_amount": 77000,
      "payment_method": "cash",
      "status": "completed"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 500
  }
}
```

---

#### GET /transactions/{id}
**Description:** Get transaction detail

**Response 200:**
```json
{
  "data": {
    "id": "uuid-trx",
    "invoice_number": "INV-SEN-20260118-0001",
    "transaction_date": "2026-01-18T14:30:00Z",
    "outlet": {
      "id": "uuid-outlet",
      "outlet_name": "Cabang Senayan",
      "address": "Jl. Senayan No. 1"
    },
    "cashier": {
      "id": "uuid-user",
      "full_name": "Andi Wijaya"
    },
    "items": [...],
    "subtotal": 70000,
    "tax_amount": 7000,
    "total_amount": 77000,
    "payment_method": "cash",
    "status": "completed"
  }
}
```

---

#### GET /transactions/{id}/receipt
**Description:** Get receipt (HTML/PDF)

**Query Parameters:**
- `format` (string: html|pdf, default: html)

**Response 200 (HTML):**
```html
<!DOCTYPE html>
<html>
<head><title>Receipt - INV-SEN-20260118-0001</title></head>
<body>
  <div class="receipt">
    <h2>Kopi Kenangan</h2>
    <p>Cabang Senayan</p>
    <hr>
    <p>Invoice: INV-SEN-20260118-0001</p>
    <p>Date: 18 Jan 2026 14:30</p>
    <table>
      <tr><td>Kopi Latte x2</td><td>Rp 50,000</td></tr>
      <tr><td>Kopi Americano x1</td><td>Rp 20,000</td></tr>
    </table>
    <hr>
    <p>Total: Rp 77,000</p>
    <p>Thank you!</p>
  </div>
</body>
</html>
```

---

### 2.5 Reporting Endpoints

#### GET /reports/sales/daily
**Description:** Daily sales report

**Permissions:** Owner, Manager

**Query Parameters:**
- `date` (date, required)
- `outlet_id` (uuid, optional)

**Response 200:**
```json
{
  "data": {
    "date": "2026-01-18",
    "outlets": [
      {
        "outlet_id": "uuid-outlet-1",
        "outlet_name": "Cabang Senayan",
        "total_transactions": 45,
        "gross_sales": 3250000,
        "tax": 325000,
        "net_sales": 3575000,
        "payment_breakdown": {
          "cash": { "count": 30, "amount": 2000000 },
          "qris": { "count": 15, "amount": 1575000 }
        },
        "top_products": [
          {
            "product_name": "Kopi Latte",
            "quantity_sold": 50,
            "revenue": 1250000
          }
        ]
      }
    ],
    "summary": {
      "total_transactions": 45,
      "total_revenue": 3575000
    }
  }
}
```

---

#### GET /reports/inventory
**Description:** Inventory report

**Query Parameters:**
- `outlet_id` (uuid)
- `status` (string: all|low_stock)

**Response 200:**
```json
{
  "data": {
    "outlet": {
      "id": "uuid-outlet",
      "outlet_name": "Cabang Senayan"
    },
    "products": [
      {
        "product_name": "Kopi Latte",
        "sku": "KOP-001",
        "quantity_on_hand": 50,
        "minimum_stock": 10,
        "status": "OK",
        "stock_value": 750000
      },
      {
        "product_name": "Kopi Americano",
        "sku": "KOP-002",
        "quantity_on_hand": 8,
        "minimum_stock": 10,
        "status": "Low Stock",
        "stock_value": 96000
      }
    ],
    "summary": {
      "total_products": 150,
      "low_stock_count": 5,
      "total_stock_value": 15000000
    }
  }
}
```

---

## 3. Error Handling

### 3.1 Error Response Format (RFC 7807)

```json
{
  "type": "https://api.posapp.com/errors/insufficient-stock",
  "title": "Insufficient Stock",
  "status": 400,
  "detail": "Product 'Kopi Latte' has only 2 units available, but 5 requested",
  "instance": "/v1/transactions",
  "trace_id": "abc123xyz",
  "timestamp": "2026-01-18T14:30:00Z",
  "errors": [
    {
      "field": "items[0].quantity",
      "message": "Insufficient stock"
    }
  ]
}
```

### 3.2 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource tidak ada |
| 409 | Conflict | Business rule conflict (e.g., duplicate SKU) |
| 422 | Unprocessable Entity | Semantic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance/overload |

---

## 4. Rate Limiting

**Limits:**
- 1000 requests per minute per tenant
- 100 requests per minute per user untuk authentication endpoints
- 5 login attempts per 15 minutes per IP

**Response Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1737205200
```

**Error Response (429):**
```json
{
  "type": "https://api.posapp.com/errors/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "You have exceeded 1000 requests per minute",
  "retry_after": 42
}
```

---

## 5. Pagination

**Query Parameters:**
- `page` (int, default: 1, min: 1)
- `limit` (int, default: 20, min: 1, max: 100)
- `sort` (string, format: `field:direction`, e.g., `created_at:desc`)

**Response Meta:**
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  },
  "links": {
    "first": "/v1/products?page=1&limit=20",
    "prev": null,
    "next": "/v1/products?page=2&limit=20",
    "last": "/v1/products?page=8&limit=20"
  }
}
```

---

## 6. OpenAPI Specification

**Simplified OpenAPI 3.0 Spec:**

```yaml
openapi: 3.0.0
info:
  title: POS Multi-Tenant API
  version: 1.0.0
  description: RESTful API untuk Sistem POS SaaS
  contact:
    email: dev@posapp.com

servers:
  - url: https://api.posapp.com/v1
    description: Production
  - url: https://staging-api.posapp.com/v1
    description: Staging

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        trace_id:
          type: string

    Product:
      type: object
      properties:
        id:
          type: string
          format: uuid
        sku:
          type: string
        product_name:
          type: string
        selling_price:
          type: number
          format: decimal
        status:
          type: string
          enum: [active, inactive]

security:
  - BearerAuth: []

paths:
  /auth/login:
    post:
      summary: User login
      tags:
        - Authentication
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Login successful
        '401':
          description: Invalid credentials

  /products:
    get:
      summary: Get all products
      tags:
        - Products
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
```

---

**Document End**