# Customer Order APIs - Quick Reference

## Base URL
```
http://localhost:5000/api
```

---

## 1. Get Table Information
```http
GET /api/tables/:tableId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "69397fffe776aa39ba7ea21f",
    "tableNumber": 5,
    "name": "Table 5",
    "capacity": 4,
    "location": "Window side",
    "status": "free"
  }
}
```

---

## 2. Get Menu Items
```http
GET /api/menu
GET /api/menu?category=categoryId
```

**Response:**
```json
{
  "success": true,
  "count": 38,
  "data": [
    {
      "_id": "692b3dd54f37a4fed104b269",
      "name": "Cold Brew Coffee",
      "description": "Smooth cold-brewed coffee",
      "price": 160,
      "category": "Cold Coffee",
      "image": "/images/cold-brew.jpg",
      "isAvailable": true,
      "isLowStock": false
    }
  ]
}
```

---

## 3. Create Order (Customer)
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "item": "692b3dd54f37a4fed104b269",
      "quantity": 2,
      "notes": ""
    }
  ],
  "table": "69397fffe776aa39ba7ea21f",
  "orderType": "dine-in",
  "orderSource": "customer",
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "notes": ""
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "6940982933ca55bb2ba0c44c",
      "orderNumber": "ORD-20251216-0010",
      "table": "69397fffe776aa39ba7ea21f",
      "tableNumber": 1,
      "orderType": "dine-in",
      "orderSource": "customer",
      "status": "pending",
      "paymentStatus": "pending",
      "subtotal": 320,
      "tax": 16,
      "total": 336,
      "createdAt": "2025-12-16T10:30:00.000Z"
    },
    "items": [
      {
        "_id": "6940982933ca55bb2ba0c44d",
        "item": {
          "_id": "692b3dd54f37a4fed104b269",
          "name": "Cold Brew Coffee",
          "price": 160
        },
        "quantity": 2,
        "price": 160
      }
    ]
  }
}
```

---

## 4. Process Payment
```http
POST /api/orders/:orderId/payment/create
Content-Type: application/json

{
  "paymentMethod": "upi",
  "transactionId": "TXN-1234567890",
  "amount": 336
}
```

**Payment Methods:** `cash`, `card`, `upi`, `wallet`

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "order": {
      "_id": "6940982933ca55bb2ba0c44c",
      "orderNumber": "ORD-20251216-0010",
      "status": "pending",
      "paymentStatus": "paid",
      "paymentMethod": "upi",
      "paidAt": "2025-12-16T10:31:00.000Z"
    },
    "transaction": {
      "_id": "6940983133ca55bb2ba0c463",
      "transactionId": "TXN-1234567890",
      "amount": 336,
      "status": "completed"
    }
  }
}
```

---

## 5. Get Order Status (NEW!)
```http
GET /api/orders/status/:orderId
GET /api/orders/status/ORD-20251216-0010
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "6940982933ca55bb2ba0c44c",
      "orderNumber": "ORD-20251216-0010",
      "status": "preparing",
      "paymentStatus": "paid",
      "paymentMethod": "upi",
      "total": 336,
      "subtotal": 320,
      "tax": 16,
      "tableNumber": 1,
      "orderType": "dine-in",
      "orderSource": "customer",
      "createdAt": "2025-12-16T10:30:00.000Z",
      "paidAt": "2025-12-16T10:31:00.000Z",
      "acceptedAt": "2025-12-16T10:32:00.000Z",
      "table": {
        "tableNumber": 1,
        "name": "Table 1",
        "location": "Window side"
      }
    },
    "items": [
      {
        "_id": "6940982933ca55bb2ba0c44d",
        "quantity": 2,
        "price": 160,
        "notes": "",
        "status": "pending",
        "item": {
          "_id": "692b3dd54f37a4fed104b269",
          "name": "Cold Brew Coffee",
          "price": 160,
          "category": "Cold Coffee",
          "image": "/images/cold-brew.jpg"
        }
      }
    ],
    "itemCount": 1,
    "totalQuantity": 2
  }
}
```

---

## 6. Get All Orders (with filters)
```http
GET /api/orders?orderSource=customer
GET /api/orders?orderSource=customer&status=pending,preparing,ready
GET /api/orders?orderSource=customer&table=tableId
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "6940982933ca55bb2ba0c44c",
      "orderNumber": "ORD-20251216-0010",
      "status": "preparing",
      "paymentStatus": "paid",
      "total": 336,
      "tableNumber": 1
    }
  ]
}
```

---

## 7. Update Order (before payment)
```http
PUT /api/orders/:orderId
Content-Type: application/json

{
  "items": [
    {
      "item": "692b3dd54f37a4fed104b269",
      "quantity": 3
    }
  ],
  "notes": "Updated order"
}
```

---

## 8. Cancel Order
```http
DELETE /api/orders/:orderId
DELETE /api/orders/ORD-20251216-0010
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "6940982933ca55bb2ba0c44c",
    "status": "cancelled"
  }
}
```

---

## Order Status Flow

```
Customer Order Lifecycle:

pending → [payment] → paid (paymentStatus)
   ↓
accepted → (kitchen accepts)
   ↓
preparing → (kitchen preparing)
   ↓
ready → (order ready for pickup)
   ↓
completed → (customer collected)
```

---

## Status Codes

| Status | Meaning |
|--------|---------|
| `pending` | Order placed, awaiting acceptance |
| `accepted` | Kitchen accepted the order |
| `preparing` | Food is being prepared |
| `ready` | Order is ready for pickup |
| `completed` | Order has been delivered/collected |
| `cancelled` | Order was cancelled |
| `paid` | Order completed and paid (cashier only) |

---

## Payment Status

| Status | Meaning |
|--------|---------|
| `pending` | Payment not yet made |
| `paid` | Payment completed |
| `refunded` | Payment was refunded |

---

## Error Responses

```json
{
  "success": false,
  "message": "Order not found"
}
```

```json
{
  "success": false,
  "message": "Order ID is required"
}
```

```json
{
  "success": false,
  "message": "Order already paid"
}
```

---

## Example: Complete Customer Flow

```javascript
// 1. Get table info
const table = await fetch('/api/tables/69397fffe776aa39ba7ea21f');

// 2. Get menu
const menu = await fetch('/api/menu');

// 3. Create order
const order = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: [{ item: 'itemId', quantity: 2 }],
    table: 'tableId',
    orderSource: 'customer'
  })
});

// 4. Pay immediately
const payment = await fetch(`/api/orders/${orderId}/payment/create`, {
  method: 'POST',
  body: JSON.stringify({ paymentMethod: 'upi' })
});

// 5. Track status (poll every 10 seconds)
setInterval(async () => {
  const status = await fetch(`/api/orders/status/${orderId}`);
  console.log(status.data.order.status);
}, 10000);
```

---

## Notes

✅ All customer-facing endpoints are **public** (no auth required)  
✅ Use `orderSource: 'customer'` to prevent table locking  
✅ Payment is required upfront for customer orders  
✅ Order status updates automatically as kitchen processes  
✅ Use order number or MongoDB ID interchangeably  
