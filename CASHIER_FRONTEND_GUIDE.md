# Cashier Frontend Integration Guide

Complete guide for building cashier interface with table management, order management, inventory, and analytics features.

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Cashier Dashboard](#2-cashier-dashboard)
3. [Table Management](#3-table-management)
4. [Order Management](#4-order-management)
5. [Inventory (Menu Items)](#5-inventory-menu-items)
6. [Analytics & Reports](#6-analytics--reports)
7. [Frontend Implementation Examples](#7-frontend-implementation-examples)
8. [Complete Workflows](#8-complete-workflows)

---

## 1. Authentication

### Login as Cashier
```http
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "cashier@restaurant.com",
  "password": "cashier123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Cashier User",
    "email": "cashier@restaurant.com",
    "role": "cashier",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Store the token:**
```javascript
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data));
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Cashier User",
    "email": "cashier@restaurant.com",
    "role": "cashier",
    "isActive": true
  }
}
```

---

## 2. Cashier Dashboard

### Get Daily Sales Summary
```http
GET /api/cashier/summary
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

**Use Case:**
- Display daily summary on cashier dashboard
- Show payment method breakdown
- Track pending vs completed orders

---

## 3. Table Management

### Get All Tables
```http
GET /api/tables
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
      "status": "occupied",
      "location": "Window side",
      "qrCode": "data:image/png;base64,...",
      "isActive": true,
      "createdAt": "2023-11-20T10:00:00.000Z"
    },
    {
      "_id": "64abc790...",
      "tableNumber": "T2",
      "capacity": 4,
      "status": "available",
      "location": "Center area",
      "qrCode": "data:image/png;base64,...",
      "isActive": true
    }
  ]
}
```

**Table Status Values:**
- `available` - Table is free and ready for customers
- `occupied` - Table has active orders
- `reserved` - Table is reserved (future feature)
- `maintenance` - Table is temporarily unavailable

### Get Single Table Details
```http
GET /api/tables/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc789...",
    "tableNumber": "T1",
    "capacity": 2,
    "status": "occupied",
    "location": "Window side",
    "qrCode": "data:image/png;base64,...",
    "isActive": true
  }
}
```

### Update Table Status
```http
PUT /api/tables/:id
Content-Type: application/json
```

**Request:**
```json
{
  "status": "available"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc789...",
    "tableNumber": "T1",
    "status": "available"
  }
}
```

### Get Table QR Code
```http
GET /api/tables/:id/qr
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

**Use Case:**
- Display QR code for customers to scan
- Print QR codes for table tents
- Share digital menu links

---

## 4. Order Management

### Get All Orders (Cashier View)
```http
GET /api/cashier/orders
GET /api/cashier/orders?status=ready
GET /api/cashier/orders?status=pending
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
      "orderNumber": "ORD-20251209-0001",
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
      "createdAt": "2023-12-09T10:30:00.000Z",
      "updatedAt": "2023-12-09T10:45:00.000Z"
    }
  ]
}
```

**Order Status Flow:**
```
pending → accepted → preparing → ready → completed
                 ↓
              cancelled
```

### Get Order Details with Items
```http
GET /api/cashier/orders/:id
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64abc999...",
      "orderNumber": "ORD-20251209-0001",
      "table": {
        "_id": "64abc789...",
        "tableNumber": "T1",
        "location": "Window side"
      },
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "orderType": "dine-in",
      "status": "ready",
      "subtotal": 300,
      "tax": 15,
      "discount": 0,
      "total": 315,
      "notes": "Extra napkins please",
      "createdAt": "2023-12-09T10:30:00.000Z"
    },
    "items": [
      {
        "_id": "64abcaaa...",
        "item": {
          "_id": "64abc123...",
          "name": "Cappuccino",
          "price": 150,
          "image": "",
          "category": "Hot Coffee"
        },
        "quantity": 2,
        "price": 150,
        "status": "ready",
        "notes": "Extra hot"
      }
    ],
    "payments": []
  }
}
```

### Update Order Status
```http
PUT /api/orders/:id/status
Authorization: Bearer <cashier_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "accepted"
}
```

**Valid statuses:** `pending`, `accepted`, `preparing`, `ready`, `completed`, `cancelled`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc999...",
    "orderNumber": "ORD-20251209-0001",
    "status": "accepted",
    "updatedAt": "2023-12-09T10:35:00.000Z"
  }
}
```

### Process Payment
```http
POST /api/cashier/orders/:id/pay
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

**Payment Methods:**
- `cash` - Cash payment
- `card` - Credit/Debit card
- `upi` - UPI payment
- `wallet` - Digital wallet

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
    "notes": "Paid via Visa card",
    "createdAt": "2023-12-09T11:00:00.000Z"
  }
}
```

### Close Order (Mark as Completed)
```http
POST /api/cashier/orders/:id/close
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc999...",
    "orderNumber": "ORD-20251209-0001",
    "status": "completed",
    "completedAt": "2023-12-09T11:05:00.000Z"
  }
}
```

**Note:** Closing an order automatically updates the table status to `available` if it was a dine-in order.

### Cancel Order
```http
DELETE /api/orders/:id
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## 5. Inventory (Menu Items)

### Get All Menu Items
```http
GET /api/menu
GET /api/menu?category=64abc123...
GET /api/menu?isVeg=true
GET /api/menu?search=cappuccino
GET /api/menu?isAvailable=true
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
      "image": "",
      "createdAt": "2023-11-20T10:00:00.000Z"
    }
  ]
}
```

### Get Single Menu Item
```http
GET /api/menu/:id
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

### Get All Categories
```http
GET /api/categories
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

### Update Menu Item Availability (Admin Only)
```http
PUT /api/admin/menu/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "isAvailable": false
}
```

**Use Case:**
- Mark items as unavailable when out of stock
- Temporarily disable items during rush hours
- Enable/disable seasonal items

---

## 6. Analytics & Reports

### Dashboard Analytics (Key Insights)
```http
GET /api/admin/analytics/dashboard
GET /api/admin/analytics/dashboard?days=7
Authorization: Bearer <cashier_token>
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
      "date": "2023-12-08",
      "amount": 18750.50
    },
    "totalRevenue7Days": 98500.00,
    "mostPopularOrderType": "dine-in",
    "totalOrders": 342
  }
}
```

### Daily Sales Chart Data
```http
GET /api/admin/analytics/daily-sales
GET /api/admin/analytics/daily-sales?days=30
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2023-12-03",
      "revenue": 12500.00,
      "orderCount": 38
    },
    {
      "date": "2023-12-04",
      "revenue": 15800.50,
      "orderCount": 45
    },
    {
      "date": "2023-12-05",
      "revenue": 13200.00,
      "orderCount": 40
    }
  ]
}
```

### Top Items by Quantity Sold
```http
GET /api/admin/analytics/top-items-quantity
GET /api/admin/analytics/top-items-quantity?days=7&limit=10
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Cappuccino",
      "quantity": 145
    },
    {
      "name": "Latte",
      "quantity": 132
    },
    {
      "name": "Americano",
      "quantity": 98
    }
  ]
}
```

### Top Items by Revenue
```http
GET /api/admin/analytics/top-items-revenue
GET /api/admin/analytics/top-items-revenue?days=7&limit=10
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Specialty Latte",
      "revenue": 28500.00
    },
    {
      "name": "Cappuccino",
      "revenue": 21750.00
    },
    {
      "name": "Cold Brew",
      "revenue": 18900.00
    }
  ]
}
```

### Order Types Distribution
```http
GET /api/admin/analytics/order-types
GET /api/admin/analytics/order-types?days=7
Authorization: Bearer <cashier_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "dine-in",
      "count": 245,
      "percentage": "71.64"
    },
    {
      "type": "takeaway",
      "count": 78,
      "percentage": "22.81"
    },
    {
      "type": "delivery",
      "count": 19,
      "percentage": "5.56"
    }
  ]
}
```

### Complete Analytics (All Data in One Call)
```http
GET /api/admin/analytics/complete
GET /api/admin/analytics/complete?days=7
Authorization: Bearer <cashier_token>
```

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
        "date": "2023-12-08",
        "amount": 18750.50
      },
      "totalRevenue7Days": 98500.00,
      "mostPopularOrderType": "dine-in",
      "totalOrders": 342
    },
    "dailySales": [
      {
        "date": "2023-12-03",
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
    ]
  }
}
```

---

## 7. Frontend Implementation Examples

### React/JavaScript Implementation

#### 1. Authentication Service
```javascript
// services/authService.js
const API_URL = 'http://localhost:5000/api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    return data;
  },

  // Get current user
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get token
  getToken: () => localStorage.getItem('token')
};
```

#### 2. Table Management Service
```javascript
// services/tableService.js
const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const tableService = {
  // Get all tables
  getAllTables: async () => {
    const response = await fetch(`${API_URL}/tables`);
    return await response.json();
  },

  // Get single table
  getTable: async (id) => {
    const response = await fetch(`${API_URL}/tables/${id}`);
    return await response.json();
  },

  // Update table status
  updateTableStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/tables/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await response.json();
  },

  // Get table QR code
  getTableQR: async (id) => {
    const response = await fetch(`${API_URL}/tables/${id}/qr`);
    return await response.json();
  }
};
```

#### 3. Order Management Service
```javascript
// services/orderService.js
const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const orderService = {
  // Get cashier orders
  getCashierOrders: async (status = '') => {
    const url = status 
      ? `${API_URL}/cashier/orders?status=${status}`
      : `${API_URL}/cashier/orders`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    const response = await fetch(`${API_URL}/cashier/orders/${orderId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await response.json();
  },

  // Process payment
  processPayment: async (orderId, paymentData) => {
    const response = await fetch(`${API_URL}/cashier/orders/${orderId}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    return await response.json();
  },

  // Close order
  closeOrder: async (orderId) => {
    const response = await fetch(`${API_URL}/cashier/orders/${orderId}/close`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await response.json();
  }
};
```

#### 4. Menu/Inventory Service
```javascript
// services/menuService.js
const API_URL = 'http://localhost:5000/api';

export const menuService = {
  // Get all menu items
  getMenuItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/menu?${params}`);
    return await response.json();
  },

  // Get menu item by ID
  getMenuItem: async (id) => {
    const response = await fetch(`${API_URL}/menu/${id}`);
    return await response.json();
  },

  // Get all categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`);
    return await response.json();
  },

  // Filter available items
  getAvailableItems: async () => {
    const response = await fetch(`${API_URL}/menu?isAvailable=true`);
    return await response.json();
  }
};
```

#### 5. Analytics Service
```javascript
// services/analyticsService.js
const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const analyticsService = {
  // Get dashboard analytics
  getDashboard: async (days = 7) => {
    const response = await fetch(
      `${API_URL}/admin/analytics/dashboard?days=${days}`,
      { headers: getAuthHeaders() }
    );
    return await response.json();
  },

  // Get daily sales
  getDailySales: async (days = 7) => {
    const response = await fetch(
      `${API_URL}/admin/analytics/daily-sales?days=${days}`,
      { headers: getAuthHeaders() }
    );
    return await response.json();
  },

  // Get top items by quantity
  getTopItemsByQuantity: async (days = 7, limit = 8) => {
    const response = await fetch(
      `${API_URL}/admin/analytics/top-items-quantity?days=${days}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return await response.json();
  },

  // Get top items by revenue
  getTopItemsByRevenue: async (days = 7, limit = 8) => {
    const response = await fetch(
      `${API_URL}/admin/analytics/top-items-revenue?days=${days}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return await response.json();
  },

  // Get order types distribution
  getOrderTypes: async (days = 7) => {
    const response = await fetch(
      `${API_URL}/admin/analytics/order-types?days=${days}`,
      { headers: getAuthHeaders() }
    );
    return await response.json();
  },

  // Get complete analytics
  getCompleteAnalytics: async (days = 7) => {
    const response = await fetch(
      `${API_URL}/admin/analytics/complete?days=${days}`,
      { headers: getAuthHeaders() }
    );
    return await response.json();
  },

  // Get daily summary
  getDailySummary: async () => {
    const response = await fetch(
      `${API_URL}/cashier/summary`,
      { headers: getAuthHeaders() }
    );
    return await response.json();
  }
};
```

#### 6. React Component Examples

**Cashier Dashboard Component:**
```javascript
// components/CashierDashboard.jsx
import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

const CashierDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailySummary();
  }, []);

  const loadDailySummary = async () => {
    try {
      const response = await analyticsService.getDailySummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Daily Summary</h1>
      <div className="summary-cards">
        <div className="card">
          <h3>Total Sales</h3>
          <p>₹{summary.totalSales.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Orders</h3>
          <p>{summary.totalOrders}</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p>{summary.completedOrders}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p>{summary.pendingOrders}</p>
        </div>
      </div>

      <div className="payment-breakdown">
        <h2>Payment Breakdown</h2>
        <ul>
          <li>Cash: ₹{summary.paymentBreakdown.cash}</li>
          <li>Card: ₹{summary.paymentBreakdown.card}</li>
          <li>UPI: ₹{summary.paymentBreakdown.upi}</li>
          <li>Wallet: ₹{summary.paymentBreakdown.wallet}</li>
        </ul>
      </div>
    </div>
  );
};

export default CashierDashboard;
```

**Table View Component:**
```javascript
// components/TableView.jsx
import React, { useState, useEffect } from 'react';
import { tableService } from '../services/tableService';

const TableView = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
    // Refresh every 30 seconds
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTables = async () => {
    try {
      const response = await tableService.getAllTables();
      if (response.success) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'green',
      'occupied': 'red',
      'reserved': 'orange',
      'maintenance': 'gray'
    };
    return colors[status] || 'gray';
  };

  if (loading) return <div>Loading tables...</div>;

  return (
    <div className="table-view">
      <h1>Table Status</h1>
      <div className="table-grid">
        {tables.map(table => (
          <div 
            key={table._id} 
            className={`table-card ${table.status}`}
            style={{ borderColor: getStatusColor(table.status) }}
          >
            <h3>{table.tableNumber}</h3>
            <p>Capacity: {table.capacity}</p>
            <p>Status: <span className="status">{table.status}</span></p>
            <p className="location">{table.location}</p>
            {table.qrCode && (
              <img 
                src={table.qrCode} 
                alt={`QR Code for ${table.tableNumber}`}
                className="qr-code"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableView;
```

**Order List Component:**
```javascript
// components/OrderList.jsx
import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadOrders = async () => {
    try {
      const response = await orderService.getCashierOrders(filter);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders(); // Refresh list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePayment = async (orderId, paymentMethod) => {
    const order = orders.find(o => o._id === orderId);
    try {
      await orderService.processPayment(orderId, {
        paymentMethod,
        amount: order.total,
        transactionId: `TXN${Date.now()}`,
        notes: `Paid via ${paymentMethod}`
      });
      loadOrders();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="order-list">
      <h1>Orders</h1>
      
      <div className="filters">
        <button onClick={() => setFilter('')}>All</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={() => setFilter('ready')}>Ready</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>

      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="orders">
          {orders.map(order => (
            <div key={order._id} className={`order-card status-${order.status}`}>
              <div className="order-header">
                <h3>{order.orderNumber}</h3>
                <span className={`badge ${order.status}`}>{order.status}</span>
              </div>
              
              <div className="order-details">
                <p><strong>Table:</strong> {order.table?.tableNumber || 'N/A'}</p>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Type:</strong> {order.orderType}</p>
                <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>

              <div className="order-actions">
                {order.status === 'pending' && (
                  <button onClick={() => handleStatusChange(order._id, 'accepted')}>
                    Accept
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <>
                    <button onClick={() => handlePayment(order._id, 'cash')}>
                      Cash
                    </button>
                    <button onClick={() => handlePayment(order._id, 'card')}>
                      Card
                    </button>
                    <button onClick={() => handlePayment(order._id, 'upi')}>
                      UPI
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
```

**Analytics Dashboard Component:**
```javascript
// components/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsService.getCompleteAnalytics(days);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-dashboard">
      <div className="header">
        <h1>Analytics Dashboard</h1>
        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Key Insights */}
      <div className="key-insights">
        <div className="insight-card">
          <h3>Total Revenue</h3>
          <p className="big-number">₹{analytics.keyInsights.totalRevenue7Days.toFixed(2)}</p>
        </div>
        <div className="insight-card">
          <h3>Total Orders</h3>
          <p className="big-number">{analytics.keyInsights.totalOrders}</p>
        </div>
        <div className="insight-card">
          <h3>Most Sold Product</h3>
          <p>{analytics.keyInsights.mostSoldProduct.name}</p>
          <small>{analytics.keyInsights.mostSoldProduct.quantity} sold</small>
        </div>
        <div className="insight-card">
          <h3>Top Order Type</h3>
          <p>{analytics.keyInsights.mostPopularOrderType}</p>
        </div>
      </div>

      {/* Top Items by Quantity */}
      <div className="top-items">
        <h2>Top Items by Quantity</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity Sold</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topItemsByQuantity.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Items by Revenue */}
      <div className="top-items">
        <h2>Top Items by Revenue</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topItemsByRevenue.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>₹{item.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Types Distribution */}
      <div className="order-types">
        <h2>Order Types Distribution</h2>
        <div className="distribution-chart">
          {analytics.orderTypesDistribution.map((type, index) => (
            <div key={index} className="type-bar">
              <span className="type-label">{type.type}</span>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ width: `${type.percentage}%` }}
                >
                  {type.percentage}%
                </div>
              </div>
              <span className="type-count">{type.count} orders</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Sales Chart - You can use Chart.js or Recharts here */}
      <div className="daily-sales">
        <h2>Daily Sales Trend</h2>
        {/* Implement chart using your preferred library */}
        <div className="chart-placeholder">
          {analytics.dailySales.map((day, index) => (
            <div key={index} className="day-summary">
              <span>{day.date}</span>
              <span>₹{day.revenue.toFixed(2)}</span>
              <span>({day.orderCount} orders)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
```

---

## 8. Complete Workflows

### Workflow 1: Cashier Start of Day
```
1. Login → POST /api/auth/login
2. View Dashboard → GET /api/cashier/summary
3. Check Table Status → GET /api/tables
4. View Pending Orders → GET /api/cashier/orders?status=pending
```

### Workflow 2: Processing an Order
```
1. Customer places order (from public interface)
2. Cashier sees new order → GET /api/cashier/orders?status=pending
3. Cashier accepts order → PUT /api/orders/:id/status (status: "accepted")
4. Kitchen prepares order
5. Order ready → GET /api/cashier/orders?status=ready
6. Process payment → POST /api/cashier/orders/:id/pay
7. Close order → POST /api/cashier/orders/:id/close
8. Table automatically becomes available
```

### Workflow 3: Table Management
```
1. View all tables → GET /api/tables
2. Customer arrives, assign table → Update frontend state
3. Customer places order → Table status changes to "occupied"
4. Order completed → POST /api/cashier/orders/:id/close
   (Table automatically set to "available")
5. If table needs cleaning/maintenance → PUT /api/tables/:id (status: "maintenance")
6. Table ready again → PUT /api/tables/:id (status: "available")
```

### Workflow 4: Inventory Management
```
1. View all menu items → GET /api/menu
2. Check item availability → GET /api/menu?isAvailable=true
3. If item out of stock:
   Admin: PUT /api/admin/menu/:id (isAvailable: false)
4. View items by category → GET /api/menu?category=:categoryId
5. Search specific item → GET /api/menu?search=cappuccino
```

### Workflow 5: End of Day Analytics
```
1. View daily summary → GET /api/cashier/summary
2. View complete analytics → GET /api/admin/analytics/complete
3. Check top selling items → GET /api/admin/analytics/top-items-quantity
4. Check revenue trends → GET /api/admin/analytics/daily-sales
5. Review order types → GET /api/admin/analytics/order-types
```

### Workflow 6: Payment Processing
```
1. Order ready → GET /api/cashier/orders/:id
2. Review order items and total
3. Customer chooses payment method
4. Process payment → POST /api/cashier/orders/:id/pay
   {
     "paymentMethod": "card",
     "amount": 315,
     "transactionId": "TXN123",
     "notes": "Paid via Visa"
   }
5. Close order → POST /api/cashier/orders/:id/close
6. Print receipt (frontend logic)
```

---

## 9. Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Error Handling Example:**
```javascript
const handleApiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('API Error:', error);
    // Show user-friendly error message
    alert(error.message || 'Something went wrong');
    return null;
  }
};
```

---

## 10. Best Practices

### Security
- Always store tokens securely (localStorage or httpOnly cookies)
- Include Authorization header in all protected requests
- Implement token refresh mechanism for long sessions
- Clear tokens on logout

### Performance
- Implement caching for menu items and categories
- Use polling (auto-refresh) for order lists (every 10-30 seconds)
- Debounce search inputs
- Implement pagination for large order lists

### User Experience
- Show loading states during API calls
- Display error messages clearly
- Implement optimistic updates where appropriate
- Auto-refresh critical data (orders, table status)
- Show real-time notifications for new orders

### Data Management
- Validate all inputs before sending to API
- Format currency consistently (2 decimal places)
- Handle timezone conversions properly
- Cache user preferences locally

---

## 11. Testing Credentials

After running `npm run seed`:

| Role    | Email                      | Password   |
|---------|----------------------------|------------|
| Admin   | admin@restaurant.com       | admin123   |
| Cashier | cashier@restaurant.com     | cashier123 |
| Kitchen | kitchen@restaurant.com     | kitchen123 |

---

## 12. Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Key Endpoints Summary

**Authentication:**
- Login: `POST /auth/login`
- Get Profile: `GET /auth/me`
- Logout: `POST /auth/logout`

**Tables:**
- Get All: `GET /tables`
- Get One: `GET /tables/:id`
- Update: `PUT /tables/:id`
- QR Code: `GET /tables/:id/qr`

**Orders (Cashier):**
- List: `GET /cashier/orders`
- Details: `GET /cashier/orders/:id`
- Accept: `PUT /orders/:id/status`
- Payment: `POST /cashier/orders/:id/pay`
- Close: `POST /cashier/orders/:id/close`
- Summary: `GET /cashier/summary`

**Menu/Inventory:**
- Get Items: `GET /menu`
- Get Item: `GET /menu/:id`
- Categories: `GET /categories`

**Analytics:**
- Dashboard: `GET /admin/analytics/dashboard`
- Daily Sales: `GET /admin/analytics/daily-sales`
- Top Items (Qty): `GET /admin/analytics/top-items-quantity`
- Top Items (Rev): `GET /admin/analytics/top-items-revenue`
- Order Types: `GET /admin/analytics/order-types`
- Complete: `GET /admin/analytics/complete`

---

**Need more help?**
- Check `FRONTEND_API_GUIDE.md` for complete API documentation
- Check `API_EXAMPLES.md` for detailed examples
- Check `SETUP_GUIDE.md` for backend setup

---

**Happy Coding! 🚀**
