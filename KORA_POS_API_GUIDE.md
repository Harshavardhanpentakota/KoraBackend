# Kora Cafe POS Backend API Documentation

Complete API documentation for the enhanced Kora Cafe POS system with inventory management, transaction tracking, and comprehensive analytics.

---

## 📋 Table of Contents

1. [Base Configuration](#base-configuration)
2. [Updated Schemas](#updated-schemas)
3. [Authentication APIs](#authentication-apis)
4. [Table Management APIs](#table-management-apis)
5. [Menu/Inventory APIs](#menu-inventory-apis)
6. [Order Management APIs](#order-management-apis)
7. [Analytics APIs](#analytics-apis)
8. [Migration Guide](#migration-guide)

---

## Base Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/kora-cafe-pos
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
```
Authorization: Bearer <your_jwt_token>
```

---

## Updated Schemas

### 1. User Schema (Enhanced)
```javascript
{
  name: String (required),
  username: String (unique, auto-generated from name),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum['admin', 'cashier', 'kitchen', 'waiter'], // Added 'waiter'
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Table Schema (Enhanced)
```javascript
{
  tableNumber: Number (required, unique), // Changed from String to Number
  name: String (required),                // NEW
  seats: Number (required, default: 4),   // NEW
  capacity: Number (synced with seats),
  status: Enum['free', 'available', 'occupied', 'reserved', 'maintenance', 'waiting'], // Enhanced
  currentOrder: ObjectId (ref: Order),    // NEW
  qrCode: String,
  location: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. MenuItem/Item Schema (Enhanced)
```javascript
{
  name: String (required),
  description: String,
  category: ObjectId (ref: Category, required),
  price: Number (required, min: 0),
  stock: Number (required, default: 0),    // NEW
  threshold: Number (required, default: 10), // NEW
  image: String,
  isAvailable: Boolean (default: true),
  isVeg: Boolean (default: true),
  preparationTime: Number (default: 15),
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  
  // Virtual field
  isLowStock: Boolean (computed: stock <= threshold)
}
```

### 4. Order Schema (Enhanced)
```javascript
{
  orderNumber: String (unique, auto-generated),
  table: ObjectId (ref: Table),
  tableNumber: Number,                     // NEW - snapshot
  customerName: String (default: 'Guest'),
  customerPhone: String,
  orderType: Enum['dine-in', 'takeaway', 'delivery'],
  isTakeaway: Boolean (default: false),    // NEW
  status: Enum['pending', 'accepted', 'preparing', 'ready', 'completed', 'paid', 'cancelled'], // Added 'paid'
  subtotal: Number (required, default: 0),
  tax: Number (default: 0),
  discount: Number (default: 0),
  total: Number (required, default: 0),
  paymentMethod: Enum['cash', 'card', 'upi', 'wallet', 'pending'], // NEW
  paymentStatus: Enum['pending', 'paid', 'refunded'], // NEW
  paidAt: Date,                            // NEW
  notes: String,
  createdBy: ObjectId (ref: User),         // NEW
  acceptedBy: ObjectId (ref: User),
  acceptedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Transaction Schema (NEW)
```javascript
{
  order: ObjectId (ref: Order, required),
  orderNumber: String (required),
  amount: Number (required, min: 0),
  paymentMethod: Enum['cash', 'card', 'upi', 'wallet'] (required),
  type: Enum['sale', 'refund'] (default: 'sale'),
  status: Enum['completed', 'pending', 'failed'] (default: 'completed'),
  transactionId: String,
  processedBy: ObjectId (ref: User),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication APIs

### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@koracafe.com",
  "password": "password123",
  "role": "waiter"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@koracafe.com",
      "role": "waiter"
    },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "admin@koracafe.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin User",
      "username": "admin",
      "email": "admin@koracafe.com",
      "role": "admin"
    },
    "token": "jwt_token_here"
  }
}
```

---

## Table Management APIs

### Get All Tables
```http
GET /api/tables
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "...",
      "tableNumber": 1,
      "name": "Table 1",
      "seats": 4,
      "capacity": 4,
      "status": "free",
      "currentOrder": null,
      "location": "Window side",
      "qrCode": "data:image/png;base64,...",
      "isActive": true,
      "createdAt": "2025-12-10T10:00:00Z"
    }
  ]
}
```

### Create Table
```http
POST /api/tables
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "tableNumber": 13,
  "name": "Table 13",
  "seats": 6,
  "location": "Garden area"
}
```

### Update Table
```http
PUT /api/tables/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "occupied",
  "currentOrder": "order_id_here"
}
```

---

## Menu/Inventory APIs

### Get All Menu Items
```http
GET /api/menu
GET /api/menu?category=<category_id>
GET /api/menu?isVeg=true
GET /api/menu?search=cappuccino
GET /api/menu?isAvailable=true
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "...",
      "name": "Espresso",
      "description": "Rich Italian coffee",
      "category": {
        "_id": "...",
        "name": "Coffee"
      },
      "price": 120,
      "stock": 50,
      "threshold": 10,
      "isAvailable": true,
      "isLowStock": false,
      "image": "",
      "preparationTime": 5,
      "tags": ["popular", "hot"]
    }
  ]
}
```

### Get Low Stock Items (NEW)
```http
GET /api/menu/low-stock
Authorization: Bearer <cashier_or_admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "name": "Sugar",
      "stock": 5,
      "threshold": 10,
      "isLowStock": true,
      "category": {
        "_id": "...",
        "name": "Supplies"
      }
    }
  ]
}
```

### Create Menu Item
```http
POST /api/menu
Authorization: Bearer <admin_or_cashier_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Cappuccino",
  "description": "Classic Italian coffee",
  "category": "category_id",
  "price": 150,
  "stock": 100,
  "threshold": 15,
  "isAvailable": true,
  "preparationTime": 5
}
```

### Update Menu Item
```http
PUT /api/menu/:id
Authorization: Bearer <admin_or_cashier_token>
Content-Type: application/json
```

**Request:**
```json
{
  "price": 160,
  "stock": 80,
  "isAvailable": false
}
```

---

## Order Management APIs

### Get All Orders
```http
GET /api/orders
GET /api/orders?status=pending
GET /api/orders?isTakeaway=true
GET /api/orders?startDate=2025-12-01&endDate=2025-12-10
Authorization: Bearer <cashier_or_admin_token>
```

**Query Parameters:**
- `status` - Filter by order status
- `orderType` - Filter by order type (dine-in, takeaway, delivery)
- `isTakeaway` - Filter takeaway orders (true/false)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "...",
      "orderNumber": "ORD-20251210-0001",
      "table": {
        "_id": "...",
        "tableNumber": 5
      },
      "tableNumber": 5,
      "customerName": "Guest",
      "orderType": "dine-in",
      "isTakeaway": false,
      "status": "pending",
      "subtotal": 240,
      "tax": 12,
      "total": 252,
      "paymentMethod": "pending",
      "paymentStatus": "pending",
      "createdAt": "2025-12-10T10:30:00Z"
    }
  ]
}
```

### Get Order by Table (NEW)
```http
GET /api/orders/table/:tableId
Authorization: Bearer <waiter_cashier_or_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20251210-0001",
      "table": {
        "_id": "...",
        "tableNumber": 5,
        "name": "Table 5",
        "seats": 4
      },
      "status": "pending",
      "total": 252
    },
    "items": [
      {
        "_id": "...",
        "item": {
          "_id": "...",
          "name": "Espresso",
          "price": 120,
          "category": "Coffee"
        },
        "quantity": 2,
        "status": "pending"
      }
    ]
  }
}
```

### Create Order
```http
POST /api/orders
Content-Type: application/json
```

**Request:**
```json
{
  "items": [
    {
      "item": "menu_item_id",
      "quantity": 2,
      "notes": "Extra hot"
    }
  ],
  "table": "table_id",
  "tableNumber": 5,
  "customerName": "John Doe",
  "orderType": "dine-in",
  "isTakeaway": false,
  "notes": "No sugar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20251210-0001",
      "tableNumber": 5,
      "subtotal": 240,
      "tax": 12,
      "total": 252,
      "status": "pending",
      "paymentMethod": "pending",
      "paymentStatus": "pending"
    },
    "items": [
      {
        "_id": "...",
        "item": {
          "_id": "...",
          "name": "Espresso",
          "price": 120
        },
        "quantity": 2,
        "price": 120,
        "status": "pending"
      }
    ]
  }
}
```

### Process Payment (NEW)
```http
PUT /api/orders/:id/pay
Authorization: Bearer <cashier_or_admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "paymentMethod": "upi",
  "transactionId": "TXN123456789",
  "notes": "Paid via PhonePe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20251210-0001",
      "status": "paid",
      "paymentMethod": "upi",
      "paymentStatus": "paid",
      "paidAt": "2025-12-10T11:00:00Z",
      "total": 252
    },
    "transaction": {
      "_id": "...",
      "orderNumber": "ORD-20251210-0001",
      "amount": 252,
      "paymentMethod": "upi",
      "type": "sale",
      "status": "completed",
      "transactionId": "TXN123456789",
      "processedBy": {
        "_id": "...",
        "name": "Cashier User",
        "email": "cashier@koracafe.com"
      },
      "createdAt": "2025-12-10T11:00:00Z"
    }
  }
}
```

### Update Order Status
```http
PUT /api/orders/:id/status
Authorization: Bearer <cashier_or_admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "preparing"
}
```

**Valid Statuses:** `pending`, `accepted`, `preparing`, `ready`, `completed`, `paid`, `cancelled`

---

## Analytics APIs

### Dashboard Analytics
```http
GET /api/admin/analytics/dashboard
GET /api/admin/analytics/dashboard?days=7
Authorization: Bearer <cashier_or_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mostSoldProduct": {
      "name": "Cappuccino",
      "quantity": 145
    },
    "highestRevenueDay": {
      "date": "2025-12-08",
      "amount": 18750.50
    },
    "totalRevenue7Days": 98500.00,
    "mostPopularOrderType": "dine-in",
    "totalOrders": 342
  }
}
```

### Complete Analytics (Enhanced)
```http
GET /api/admin/analytics/complete
GET /api/admin/analytics/complete?days=30
GET /api/admin/analytics/complete?startDate=2025-12-01&endDate=2025-12-10
Authorization: Bearer <cashier_or_admin_token>
```

**Query Parameters:**
- `days` - Number of days to analyze (default: 7)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "keyInsights": {
      "mostSoldProduct": {
        "name": "Cappuccino",
        "quantity": 145
      },
      "highestRevenueDay": {
        "date": "2025-12-08",
        "amount": 18750.50
      },
      "totalRevenue7Days": 98500.00,
      "mostPopularOrderType": "dine-in",
      "totalOrders": 342
    },
    "dailySales": [
      {
        "date": "2025-12-03",
        "revenue": 12500.00,
        "orderCount": 38
      }
    ],
    "topItemsByQuantity": [
      {
        "name": "Cappuccino",
        "quantity": 145
      }
    ],
    "topItemsByRevenue": [
      {
        "name": "Specialty Latte",
        "revenue": 28500.00
      }
    ],
    "orderTypesDistribution": [
      {
        "type": "dine-in",
        "count": 245,
        "percentage": "71.64"
      }
    ],
    "paymentMethodBreakdown": [
      {
        "_id": "upi",
        "count": 850,
        "amount": 250000
      },
      {
        "_id": "cash",
        "count": 650,
        "amount": 180000
      }
    ],
    "hourlyRevenue": [
      {
        "hour": 8,
        "revenue": 5000,
        "orders": 15
      }
    ],
    "categoryWiseSales": [
      {
        "_id": "Coffee",
        "totalSales": 150000,
        "count": 800
      }
    ]
  }
}
```

---

## Migration Guide

### Database Migration Steps

1. **Backup Existing Data**
```bash
mongodump --db kora-cafe-pos --out ./backup
```

2. **Update User Documents**
```javascript
// Add username field to existing users
db.users.find({ username: { $exists: false } }).forEach(user => {
  db.users.updateOne(
    { _id: user._id },
    { $set: { username: user.name.toLowerCase().replace(/\s+/g, '') } }
  );
});
```

3. **Update Table Documents**
```javascript
// Convert tableNumber from String to Number and add new fields
db.tables.find().forEach(table => {
  const updates = {
    tableNumber: parseInt(table.tableNumber.replace(/[^\d]/g, '')),
    name: table.tableNumber,
    seats: table.capacity || 4,
    currentOrder: null
  };
  
  // Convert 'available' to 'free' for consistency
  if (table.status === 'available') {
    updates.status = 'free';
  }
  
  db.tables.updateOne({ _id: table._id }, { $set: updates });
});
```

4. **Update Item/Menu Documents**
```javascript
// Add stock and threshold fields to existing items
db.items.updateMany(
  { stock: { $exists: false } },
  {
    $set: {
      stock: 100,
      threshold: 10
    }
  }
);
```

5. **Update Order Documents**
```javascript
// Add new payment fields to existing orders
db.orders.find().forEach(order => {
  const updates = {
    isTakeaway: order.orderType !== 'dine-in',
    paymentMethod: 'pending',
    paymentStatus: order.status === 'completed' ? 'paid' : 'pending'
  };
  
  if (order.table) {
    const table = db.tables.findOne({ _id: order.table });
    if (table) {
      updates.tableNumber = table.tableNumber;
    }
  }
  
  db.orders.updateOne({ _id: order._id }, { $set: updates });
});
```

6. **Restart Backend Server**
```bash
npm run dev
```

### Code Changes Required

#### Update API Service Calls

**Old:**
```javascript
// Old table structure
const table = {
  tableNumber: "T1",  // String
  capacity: 4
};
```

**New:**
```javascript
// New table structure
const table = {
  tableNumber: 1,     // Number
  name: "Table 1",
  seats: 4,
  capacity: 4
};
```

#### Update Order Creation

**Old:**
```javascript
const orderData = {
  items: [...],
  table: tableId,
  orderType: 'dine-in'
};
```

**New:**
```javascript
const orderData = {
  items: [...],
  table: tableId,
  tableNumber: 5,
  orderType: 'dine-in',
  isTakeaway: false
};
```

#### Add Payment Processing

**New Feature:**
```javascript
// Process payment
const paymentData = {
  paymentMethod: 'upi',
  transactionId: 'TXN123456789',
  notes: 'Paid via PhonePe'
};

const response = await fetch(`/api/orders/${orderId}/pay`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(paymentData)
});
```

---

## Testing

### Sample Test Credentials

```javascript
// Admin
email: 'admin@koracafe.com'
password: 'admin123'

// Cashier
email: 'cashier@koracafe.com'
password: 'cashier123'

// Waiter
email: 'waiter@koracafe.com'
password: 'waiter123'
```

### Test Workflow

1. **Login** → Get JWT token
2. **Get Tables** → View available tables
3. **Create Order** → Place order for table
4. **Get Order by Table** → Verify order exists
5. **Process Payment** → Complete transaction
6. **Get Analytics** → View dashboard stats
7. **Check Low Stock** → View inventory alerts

---

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Additional Resources

- [CASHIER_FRONTEND_GUIDE.md](./CASHIER_FRONTEND_GUIDE.md) - Complete cashier interface guide
- [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) - Original API guide
- [API_EXAMPLES.md](./API_EXAMPLES.md) - More API examples
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Backend setup instructions

---

**Last Updated:** December 10, 2025
**Version:** 2.0.0
