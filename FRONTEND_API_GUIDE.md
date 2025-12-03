# Frontend Integration API Guide

Complete API documentation for integrating frontend interfaces with the Cafe Management System backend.

---

## Base URL
```
http://localhost:5000/api
```

## Authentication Header
For protected routes, include JWT token:
```
Authorization: Bearer <your_jwt_token>
```

---

# 1. AUTHENTICATION APIs

## Login
```http
POST /auth/login
Content-Type: application/json
```

**Request:**
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

## Get Current User Profile
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
    "isActive": true,
    "createdAt": "2023-11-20T10:00:00.000Z"
  }
}
```

## Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

# 2. PUBLIC USER INTERFACE APIs

These APIs are accessible without authentication for customer-facing applications.

## Get All Menu Items
```http
GET /menu
GET /menu?category=64abc123...
GET /menu?isVeg=true
GET /menu?search=cappuccino
```

**Response:**
```json
{
  "success": true,
  "count": 38,
  "data": [
    {
      "_id": "64abc123...",
      "name": "Cappuccino",
      "description": "Perfect blend of espresso, steamed milk, and foam",
      "category": {
        "_id": "64abc456...",
        "name": "Hot Coffee"
      },
      "price": 150,
      "isVeg": true,
      "isAvailable": true,
      "preparationTime": 5,
      "tags": ["popular", "creamy", "classic"],
      "image": ""
    }
  ]
}
```

## Get Single Menu Item
```http
GET /menu/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Cappuccino",
    "description": "Perfect blend of espresso, steamed milk, and foam",
    "category": {
      "_id": "64abc456...",
      "name": "Hot Coffee"
    },
    "price": 150,
    "isVeg": true,
    "isAvailable": true,
    "preparationTime": 5,
    "tags": ["popular", "creamy", "classic"]
  }
}
```

## Get All Categories
```http
GET /categories
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "64abc456...",
      "name": "Hot Coffee",
      "description": "Freshly brewed hot coffee beverages",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

## Create Order (Public)
```http
POST /orders
Content-Type: application/json
```

**Request:**
```json
{
  "items": [
    {
      "item": "64abc123...",
      "quantity": 2,
      "notes": "Extra hot"
    },
    {
      "item": "64abc456...",
      "quantity": 1,
      "notes": ""
    }
  ],
  "table": "64abc789...",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "orderType": "dine-in",
  "notes": "Please serve quickly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251130-0001",
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "orderType": "dine-in",
      "status": "pending",
      "subtotal": 300,
      "tax": 15,
      "total": 315,
      "notes": "Please serve quickly",
      "createdAt": "2023-11-30T10:30:00.000Z"
    },
    "items": [
      {
        "_id": "64abcaaa...",
        "item": {
          "_id": "64abc123...",
          "name": "Cappuccino",
          "price": 150
        },
        "quantity": 2,
        "price": 150,
        "status": "pending",
        "notes": "Extra hot"
      }
    ]
  }
}
```

---

# 3. ADMIN INTERFACE APIs

All admin routes require: `Authorization: Bearer <admin_token>`

## User Management

### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64abc123...",
      "name": "Admin User",
      "email": "admin@restaurant.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-11-20T10:00:00.000Z"
    }
  ]
}
```

### Create User
```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Cashier",
  "email": "cashier2@restaurant.com",
  "password": "password123",
  "role": "cashier"
}
```

### Update User
```http
PUT /admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Name",
  "email": "updated@restaurant.com",
  "role": "kitchen",
  "isActive": true
}
```

### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Category Management

### Get All Categories
```http
GET /categories
```

### Create Category
```http
POST /admin/categories
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Special Drinks",
  "description": "Limited edition beverages",
  "displayOrder": 7
}
```

### Update Category
```http
PUT /admin/categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Category Name",
  "isActive": false
}
```

### Delete Category
```http
DELETE /admin/categories/:id
Authorization: Bearer <admin_token>
```

## Menu Item Management

### Create Menu Item
```http
POST /admin/menu
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Hazelnut Latte",
  "description": "Espresso with hazelnut syrup and steamed milk",
  "category": "64abc123...",
  "price": 180,
  "isVeg": true,
  "isAvailable": true,
  "preparationTime": 5,
  "tags": ["nutty", "sweet", "coffee"]
}
```

### Update Menu Item
```http
PUT /admin/menu/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "price": 200,
  "isAvailable": false,
  "tags": ["nutty", "sweet", "coffee", "popular"]
}
```

### Delete Menu Item
```http
DELETE /admin/menu/:id
Authorization: Bearer <admin_token>
```

## Table Management

### Get All Tables
```http
GET /admin/tables
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "64abc789...",
      "tableNumber": "T1",
      "capacity": 2,
      "status": "available",
      "location": "Window side",
      "qrCode": "data:image/png;base64,...",
      "isActive": true
    }
  ]
}
```

### Create Table
```http
POST /admin/tables
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "tableNumber": "T11",
  "capacity": 4,
  "location": "Garden area",
  "status": "available"
}
```

### Update Table
```http
PUT /admin/tables/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "maintenance",
  "isActive": false
}
```

### Delete Table
```http
DELETE /admin/tables/:id
Authorization: Bearer <admin_token>
```

### Generate Table QR Code
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

## Order Management

### Get All Orders
```http
GET /orders
GET /orders?status=pending
GET /orders?orderType=dine-in
GET /orders?startDate=2023-11-01&endDate=2023-11-30
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251130-0001",
      "customerName": "John Doe",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "orderType": "dine-in",
      "status": "pending",
      "subtotal": 300,
      "tax": 15,
      "total": 315,
      "createdAt": "2023-11-30T10:30:00.000Z"
    }
  ]
}
```

### Get Single Order
```http
GET /orders/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251130-0001",
      "customerName": "John Doe",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "status": "pending",
      "total": 315
    },
    "items": [
      {
        "_id": "64abcaaa...",
        "item": {
          "_id": "64abc123...",
          "name": "Cappuccino",
          "price": 150,
          "image": ""
        },
        "quantity": 2,
        "price": 150,
        "status": "pending",
        "notes": "Extra hot"
      }
    ]
  }
}
```

### Update Order Status
```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "accepted"
}
```

**Valid statuses:** `pending`, `accepted`, `preparing`, `ready`, `completed`, `cancelled`

### Cancel Order
```http
DELETE /orders/:id
Authorization: Bearer <admin_token>
```

---

# 4. CASHIER INTERFACE APIs

All cashier routes require: `Authorization: Bearer <cashier_token>`

## Get Orders for Cashier
```http
GET /cashier/orders
GET /cashier/orders?status=ready
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251130-0001",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "orderType": "dine-in",
      "status": "ready",
      "subtotal": 300,
      "tax": 15,
      "discount": 0,
      "total": 315,
      "createdAt": "2023-11-30T10:30:00.000Z"
    }
  ]
}
```

## Get Order Details
```http
GET /cashier/orders/:id
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251130-0001",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "customerName": "John Doe",
      "status": "ready",
      "total": 315
    },
    "items": [
      {
        "_id": "64abcaaa...",
        "item": {
          "_id": "64abc123...",
          "name": "Cappuccino",
          "price": 150,
          "image": ""
        },
        "quantity": 2,
        "status": "ready"
      }
    ],
    "payments": []
  }
}
```

## Process Payment
```http
POST /cashier/orders/:id/pay
Authorization: Bearer <cashier_token>
Content-Type: application/json
```

**Request:**
```json
{
  "paymentMethod": "card",
  "amount": 315,
  "transactionId": "TXN123456789",
  "notes": "Paid via Visa card"
}
```

**Payment Methods:** `cash`, `card`, `upi`, `wallet`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abcbbb...",
    "order": "64abc999...",
    "amount": 315,
    "paymentMethod": "card",
    "transactionId": "TXN123456789",
    "status": "completed",
    "processedBy": {
      "_id": "64abc222...",
      "name": "Cashier User",
      "email": "cashier@restaurant.com"
    },
    "createdAt": "2023-11-30T11:00:00.000Z"
  }
}
```

## Close Order
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
    "orderNumber": "ORD-20251130-0001",
    "status": "completed",
    "completedAt": "2023-11-30T11:05:00.000Z"
  }
}
```

## Get Daily Sales Summary
```http
GET /cashier/summary
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2023-11-30",
    "totalOrders": 45,
    "completedOrders": 42,
    "pendingOrders": 3,
    "totalSales": 12580.50,
    "totalTax": 629.03,
    "totalDiscount": 200.00,
    "paymentBreakdown": {
      "cash": 4000,
      "card": 6580.50,
      "upi": 1800,
      "wallet": 200
    }
  }
}
```

---

# 5. KITCHEN INTERFACE APIs

All kitchen routes require: `Authorization: Bearer <kitchen_token>`

## Get Kitchen Orders
```http
GET /kitchen/orders
GET /kitchen/orders?status=accepted
Authorization: Bearer <kitchen_token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251130-0001",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1"
      },
      "orderType": "dine-in",
      "status": "accepted",
      "createdAt": "2023-11-30T10:30:00.000Z",
      "items": [
        {
          "_id": "64abcaaa...",
          "item": {
            "_id": "64abc123...",
            "name": "Cappuccino",
            "preparationTime": 5
          },
          "quantity": 2,
          "status": "pending",
          "notes": "Extra hot"
        }
      ]
    }
  ]
}
```

## Get Kitchen Order Items (Detailed View)
```http
GET /kitchen/order-items
GET /kitchen/order-items?status=preparing
Authorization: Bearer <kitchen_token>
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "64abcaaa...",
      "order": {
        "_id": "64abc999...",
        "orderNumber": "ORD-20251130-0001",
        "orderType": "dine-in",
        "table": {
          "_id": "64abc789...",
          "tableNumber": "T1"
        }
      },
      "item": {
        "_id": "64abc123...",
        "name": "Cappuccino",
        "preparationTime": 5
      },
      "quantity": 2,
      "price": 150,
      "status": "pending",
      "notes": "Extra hot",
      "createdAt": "2023-11-30T10:30:00.000Z"
    }
  ]
}
```

## Update Order Item Status
```http
PUT /kitchen/order-items/:id/status
Authorization: Bearer <kitchen_token>
Content-Type: application/json
```

**Request:**
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
      "name": "Cappuccino"
    },
    "order": {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251130-0001"
    },
    "quantity": 2,
    "status": "preparing",
    "updatedAt": "2023-11-30T10:35:00.000Z"
  }
}
```

## Get Kitchen Statistics
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

# 6. ERROR RESPONSES

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

## Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

# 7. FRONTEND INTEGRATION EXAMPLES

## React/JavaScript Example

### Login and Store Token
```javascript
// Login function
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Fetch Menu Items
```javascript
const getMenuItems = async (category = '') => {
  try {
    const url = category 
      ? `http://localhost:5000/api/menu?category=${category}`
      : 'http://localhost:5000/api/menu';
      
    const response = await fetch(url);
    const data = await response.json();
    
    return data.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
};
```

### Create Order
```javascript
const createOrder = async (orderData) => {
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
  }
};
```

### Protected Request (Admin/Cashier/Kitchen)
```javascript
const getProtectedData = async (endpoint) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage examples:
// Admin: getProtectedData('/admin/users')
// Cashier: getProtectedData('/cashier/orders')
// Kitchen: getProtectedData('/kitchen/order-items')
```

### Logout
```javascript
const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

---

# 8. WORKFLOW EXAMPLES

## Customer Order Flow
1. Customer browses menu: `GET /menu`
2. Customer adds items to cart (frontend)
3. Customer places order: `POST /orders`
4. Order created with status: `pending`

## Cashier Order Flow
1. View pending/ready orders: `GET /cashier/orders`
2. View order details: `GET /cashier/orders/:id`
3. Accept order: `PUT /orders/:id/status` (status: "accepted")
4. Process payment: `POST /cashier/orders/:id/pay`
5. Close order: `POST /cashier/orders/:id/close`
6. View daily summary: `GET /cashier/summary`

## Kitchen Order Flow
1. View active orders: `GET /kitchen/orders`
2. View all pending items: `GET /kitchen/order-items?status=pending`
3. Start preparing: `PUT /kitchen/order-items/:id/status` (status: "preparing")
4. Mark as ready: `PUT /kitchen/order-items/:id/status` (status: "ready")
5. Check statistics: `GET /kitchen/stats`

## Admin Management Flow
1. Manage users: `GET /admin/users`, `POST /admin/users`, `PUT /admin/users/:id`
2. Manage menu: `POST /admin/menu`, `PUT /admin/menu/:id`
3. Manage categories: `POST /admin/categories`, `PUT /admin/categories/:id`
4. Manage tables: `GET /admin/tables`, `POST /admin/tables`
5. View all orders: `GET /orders`

---

# 9. ORDER STATUS FLOW

```
pending → accepted → preparing → ready → completed
                 ↓
              cancelled
```

## Order Item Status Flow

```
pending → preparing → ready → served
```

---

# 10. TESTING CREDENTIALS

After running `npm run seed`:

| Role    | Email                      | Password   |
|---------|----------------------------|------------|
| Admin   | admin@restaurant.com       | admin123   |
| Cashier | cashier@restaurant.com     | cashier123 |
| Kitchen | kitchen@restaurant.com     | kitchen123 |

---

# 11. CORS CONFIGURATION

The backend is configured with CORS enabled. For production, update CORS settings in `src/server.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

# 12. RATE LIMITING & SECURITY

For production, consider adding:
- Rate limiting middleware
- Helmet.js for security headers
- Input sanitization
- HTTPS only
- Refresh token mechanism

---

**Need help?** Check the main `API_EXAMPLES.md` for more detailed examples or `SETUP_GUIDE.md` for setup instructions.
