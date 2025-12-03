# API Documentation - Restaurant Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Register User (Admin Only in Production)
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "cashier"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "cashier",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Admin User",
    "email": "admin@restaurant.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Admin User",
    "email": "admin@restaurant.com",
    "role": "admin",
    "isActive": true
  }
}
```

---

## 2. Public Menu Endpoints

### Get All Menu Items
```http
GET /menu
GET /menu?category=64abc123...
GET /menu?isVeg=true
GET /menu?search=pizza
```

**Response:**
```json
{
  "success": true,
  "count": 17,
  "data": [
    {
      "_id": "64abc123...",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato sauce, mozzarella, and basil",
      "category": {
        "_id": "64abc456...",
        "name": "Pizza"
      },
      "price": 250,
      "isVeg": true,
      "isAvailable": true,
      "preparationTime": 18,
      "tags": ["popular", "classic"]
    }
  ]
}
```

### Get Single Menu Item
```http
GET /menu/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and basil",
    "category": {
      "_id": "64abc456...",
      "name": "Pizza"
    },
    "price": 250,
    "isVeg": true,
    "isAvailable": true,
    "preparationTime": 18,
    "tags": ["popular", "classic"]
  }
}
```

---

## 3. Order Endpoints (Public)

### Create Order
```http
POST /orders
```

**Request Body:**
```json
{
  "items": [
    {
      "item": "64abc123...",
      "quantity": 2,
      "notes": "Extra cheese"
    },
    {
      "item": "64abc456...",
      "quantity": 1
    }
  ],
  "table": "64abc789...",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "orderType": "dine-in",
  "notes": "Please serve hot"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64abc999...",
      "orderNumber": "ORD-20231120-0001",
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "orderType": "dine-in",
      "status": "pending",
      "subtotal": 550,
      "tax": 27.5,
      "total": 577.5,
      "notes": "Please serve hot",
      "createdAt": "2023-11-20T10:30:00.000Z"
    },
    "items": [
      {
        "_id": "64abcaaa...",
        "item": {
          "_id": "64abc123...",
          "name": "Margherita Pizza",
          "price": 250
        },
        "quantity": 2,
        "price": 250,
        "status": "pending",
        "notes": "Extra cheese"
      }
    ]
  }
}
```

---

## 4. Admin Endpoints

### User Management

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin_token>
```

#### Create User
```http
POST /admin/users
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Cashier",
  "email": "cashier2@restaurant.com",
  "password": "cashier123",
  "role": "cashier"
}
```

#### Update User
```http
PUT /admin/users/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@restaurant.com",
  "role": "kitchen",
  "isActive": true
}
```

#### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>
```

### Category Management

#### Create Category
```http
POST /admin/categories
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Salads",
  "description": "Fresh and healthy salads",
  "displayOrder": 6
}
```

#### Update Category
```http
PUT /admin/categories/:id
Authorization: Bearer <admin_token>
```

#### Delete Category
```http
DELETE /admin/categories/:id
Authorization: Bearer <admin_token>
```

### Menu Item Management

#### Create Menu Item
```http
POST /admin/menu
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Caesar Salad",
  "description": "Fresh romaine lettuce with Caesar dressing",
  "category": "64abc123...",
  "price": 180,
  "isVeg": true,
  "isAvailable": true,
  "preparationTime": 10,
  "tags": ["healthy", "fresh"]
}
```

#### Update Menu Item
```http
PUT /admin/menu/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "price": 200,
  "isAvailable": false
}
```

#### Delete Menu Item
```http
DELETE /admin/menu/:id
Authorization: Bearer <admin_token>
```

### Table Management

#### Get All Tables
```http
GET /admin/tables
Authorization: Bearer <admin_token>
```

#### Create Table
```http
POST /admin/tables
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "tableNumber": "T11",
  "capacity": 4,
  "location": "Garden area",
  "status": "available"
}
```

#### Update Table
```http
PUT /admin/tables/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "maintenance",
  "isActive": false
}
```

#### Delete Table
```http
DELETE /admin/tables/:id
Authorization: Bearer <admin_token>
```

#### Generate Table QR Code
```http
GET /admin/tables/:id/qr
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### Order Management

#### Get All Orders
```http
GET /orders
GET /orders?status=pending
GET /orders?orderType=dine-in
GET /orders?startDate=2023-11-01&endDate=2023-11-30
Authorization: Bearer <admin_token>
```

#### Update Order Status
```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "accepted"
}
```

#### Cancel Order
```http
DELETE /orders/:id
Authorization: Bearer <admin_token>
```

---

## 5. Cashier Endpoints

### Get Cashier Orders
```http
GET /cashier/orders
GET /cashier/orders?status=ready
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64abc999...",
      "orderNumber": "ORD-20231120-0001",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "customerName": "John Doe",
      "status": "ready",
      "total": 577.5,
      "createdAt": "2023-11-20T10:30:00.000Z"
    }
  ]
}
```

### Get Order Details
```http
GET /cashier/orders/:id
Authorization: Bearer <cashier_token>
```

### Process Payment
```http
POST /cashier/orders/:id/pay
Authorization: Bearer <cashier_token>
```

**Request Body:**
```json
{
  "paymentMethod": "card",
  "amount": 577.5,
  "transactionId": "TXN123456",
  "notes": "Paid via Visa"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abcbbb...",
    "order": "64abc999...",
    "amount": 577.5,
    "paymentMethod": "card",
    "transactionId": "TXN123456",
    "status": "completed",
    "processedBy": {
      "_id": "64abc222...",
      "name": "Cashier User",
      "email": "cashier@restaurant.com"
    },
    "createdAt": "2023-11-20T11:00:00.000Z"
  }
}
```

### Close Order
```http
POST /cashier/orders/:id/close
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc999...",
    "orderNumber": "ORD-20231120-0001",
    "status": "completed",
    "completedAt": "2023-11-20T11:05:00.000Z"
  }
}
```

### Get Daily Summary
```http
GET /cashier/summary
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2023-11-20",
    "totalOrders": 45,
    "completedOrders": 42,
    "pendingOrders": 3,
    "totalSales": 25430.50,
    "totalTax": 1271.53,
    "totalDiscount": 500.00,
    "paymentBreakdown": {
      "cash": 10000,
      "card": 12430.50,
      "upi": 2500,
      "wallet": 500
    }
  }
}
```

---

## 6. Kitchen Endpoints

### Get Kitchen Orders
```http
GET /kitchen/orders
GET /kitchen/orders?status=accepted
Authorization: Bearer <kitchen_token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64abc999...",
      "orderNumber": "ORD-20231120-0001",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "orderType": "dine-in",
      "status": "accepted",
      "createdAt": "2023-11-20T10:30:00.000Z",
      "items": [
        {
          "_id": "64abcaaa...",
          "item": {
            "_id": "64abc123...",
            "name": "Margherita Pizza",
            "preparationTime": 18
          },
          "quantity": 2,
          "status": "pending"
        }
      ]
    }
  ]
}
```

### Get Kitchen Order Items
```http
GET /kitchen/order-items
GET /kitchen/order-items?status=preparing
Authorization: Bearer <kitchen_token>
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "64abcaaa...",
      "order": {
        "_id": "64abc999...",
        "orderNumber": "ORD-20231120-0001",
        "orderType": "dine-in",
        "table": {
          "_id": "64abc789...",
          "tableNumber": "T1"
        }
      },
      "item": {
        "_id": "64abc123...",
        "name": "Margherita Pizza",
        "preparationTime": 18
      },
      "quantity": 2,
      "price": 250,
      "status": "pending",
      "notes": "Extra cheese",
      "createdAt": "2023-11-20T10:30:00.000Z"
    }
  ]
}
```

### Update Order Item Status
```http
PUT /kitchen/order-items/:id/status
Authorization: Bearer <kitchen_token>
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Valid statuses:** `pending`, `preparing`, `ready`, `served`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abcaaa...",
    "item": {
      "_id": "64abc123...",
      "name": "Margherita Pizza"
    },
    "order": {
      "_id": "64abc999...",
      "orderNumber": "ORD-20231120-0001"
    },
    "quantity": 2,
    "status": "preparing",
    "updatedAt": "2023-11-20T10:35:00.000Z"
  }
}
```

### Get Kitchen Statistics
```http
GET /kitchen/stats
Authorization: Bearer <kitchen_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activeOrders": 5,
    "pendingItems": 8,
    "preparingItems": 12,
    "readyItems": 3,
    "completedToday": 145
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common Error Codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Order Status Flow

1. **pending** - Order created by customer
2. **accepted** - Order accepted by cashier/admin
3. **preparing** - Kitchen started preparing items
4. **ready** - All items are ready
5. **completed** - Payment processed and order closed
6. **cancelled** - Order cancelled by admin

## Order Item Status Flow

1. **pending** - Item waiting to be prepared
2. **preparing** - Kitchen is preparing the item
3. **ready** - Item is ready to be served
4. **served** - Item has been served to customer

---

## Payment Methods

- `cash`
- `card`
- `upi`
- `wallet`

## Order Types

- `dine-in`
- `takeaway`
- `delivery`

## User Roles

- `admin` - Full access to all endpoints
- `cashier` - Order management and payment processing
- `kitchen` - View orders and update item statuses
