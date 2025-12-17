# Order Source Management - Customer vs Cashier Orders

## Overview
The system now distinguishes between **customer self-service orders** and **cashier-managed orders** to prevent conflicts in table management and payment flow.

---

## Order Sources

### 1. **Customer Orders** (`orderSource: 'customer'`)
**Created by:** Customer interface (self-service kiosks, mobile app, QR code ordering)

**Characteristics:**
- ✅ Payment required UPFRONT via `/payment/create`
- ✅ Shows table number for reference
- ❌ Does NOT lock the table
- ❌ Does NOT set `table.currentOrder`
- ❌ Does NOT change table status
- 📝 Order status: `pending` → `preparing` → `ready` → `completed`
- 💰 Payment status: `paid` (from creation)

**Use Case:** Customer scans QR code, orders food, pays immediately, waits for order

---

### 2. **Cashier Orders** (`orderSource: 'cashier'`)
**Created by:** POS system/cashier interface

**Characteristics:**
- ✅ Payment at END via `/pay`
- ✅ LOCKS the table (sets `table.currentOrder`)
- ✅ Changes table status to `occupied`
- ✅ Prevents other orders on same table
- 📝 Order status: `pending` → ... → `completed` → `paid`
- 💰 Payment status: `pending` until payment

**Use Case:** Waiter takes order, kitchen prepares, customer pays before leaving

---

## API Usage

### Creating Orders

#### Customer Order (Self-Service)
```json
POST /api/orders
{
  "items": [...],
  "table": "tableId",
  "orderType": "dine-in",
  "orderSource": "customer",  // ← Key field
  "customerName": "John Doe"
}
```

**Result:**
- Order created with `paymentStatus: 'pending'`
- Table NOT locked (can still be used by cashier)
- Table number saved for reference

#### Cashier Order (POS)
```json
POST /api/orders
{
  "items": [...],
  "table": "tableId",
  "orderType": "dine-in",
  "orderSource": "cashier",  // ← Key field
  "customerName": "Jane Smith"
}
```

**Result:**
- Order created with `paymentStatus: 'pending'`
- Table LOCKED (`table.currentOrder` set, `status: 'occupied'`)
- Table cannot be used for other orders

---

## Payment Flow

### Customer Payment Flow

**Step 1: Create Order**
```json
POST /api/orders
{ "orderSource": "customer", "items": [...], "table": "tableId" }
```
→ Order created, table number recorded, table NOT locked

**Step 2: Pay Immediately**
```json
POST /api/orders/:orderId/payment/create
{ "paymentMethod": "upi" }
```
→ `paymentStatus: 'paid'`, order status unchanged, table still free

**Step 3: Kitchen prepares**
→ Order moves through: `pending` → `preparing` → `ready`

**Step 4: Customer collects**
→ Order marked as `completed` by staff

---

### Cashier Payment Flow

**Step 1: Create Order**
```json
POST /api/orders
{ "orderSource": "cashier", "items": [...], "table": "tableId" }
```
→ Order created, table LOCKED

**Step 2: Kitchen prepares**
→ Order moves through statuses while table remains locked

**Step 3: Customer pays at end**
```json
PUT /api/orders/:orderId/pay
{ "paymentMethod": "cash" }
```
→ Order completed, table FREED (`status: 'free'`, `currentOrder: null`)

---

## Table Management

### Customer Orders
```
Table 5 Status: free
Current Order: null
```
Customer order on Table 5 exists but table shows as free.
Cashier can create NEW order on same table if needed.

### Cashier Orders
```
Table 5 Status: occupied
Current Order: ORDER_ID_123
```
Table is LOCKED. Cannot create another order until:
- Payment completed via `/pay`
- Order cancelled
- Order manually freed

---

## Preventing Double Payment

### Problem Solved
**Before:** Customer pays via app → Cashier sees order → Tries to collect payment again

**After:** 
1. Customer order has `orderSource: 'customer'` and `paymentStatus: 'paid'`
2. Cashier sees order with payment already completed
3. Cannot charge again (payment status check)

### Check Payment Status
```json
GET /api/orders/:orderId
{
  "orderSource": "customer",
  "paymentStatus": "paid",
  "paymentMethod": "upi",
  "paidAt": "2025-12-16T10:30:00.000Z"
}
```

---

## Query Orders by Source

### Get only customer orders
```
GET /api/orders?orderSource=customer
```

### Get only cashier orders
```
GET /api/orders?orderSource=cashier
```

### Get customer orders for a table
```
GET /api/orders?orderSource=customer&table=tableId
```

---

## Migration Notes

### Existing Orders
All existing orders will have `orderSource: 'customer'` by default.

To mark existing POS orders as cashier orders:
```javascript
// MongoDB update
db.orders.updateMany(
  { createdBy: { $exists: true } },  // Has staff user
  { $set: { orderSource: 'cashier' } }
);
```

---

## Frontend Implementation

### Customer Interface
```javascript
// Always set orderSource to 'customer'
const order = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: [...],
    table: tableId,
    orderSource: 'customer'  // ← Important!
  })
});

// Pay immediately after order
await fetch(`/api/orders/${orderId}/payment/create`, {
  method: 'POST',
  body: JSON.stringify({ paymentMethod: 'upi' })
});
```

### Cashier Interface
```javascript
// Set orderSource to 'cashier'
const order = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: [...],
    table: tableId,
    orderSource: 'cashier'  // ← Important!
  })
});

// Pay at the end when customer leaves
await fetch(`/api/orders/${orderId}/pay`, {
  method: 'PUT',
  body: JSON.stringify({ paymentMethod: 'cash' })
});
```

---

## Benefits

✅ **No table conflicts** - Customer orders don't block tables  
✅ **No double payment** - Clear payment status tracking  
✅ **Flexible workflows** - Different flows for different use cases  
✅ **Better reporting** - Separate customer vs cashier order analytics  
✅ **Table availability** - Tables show as free even with customer orders  
✅ **Prevent errors** - Cannot repay already paid orders

---

## Summary

| Feature | Customer Order | Cashier Order |
|---------|---------------|---------------|
| **orderSource** | `customer` | `cashier` |
| **Payment timing** | Upfront | At end |
| **Table locking** | ❌ No | ✅ Yes |
| **Payment endpoint** | `/payment/create` | `/pay` |
| **Table status** | Unchanged | `occupied` |
| **Use case** | Self-service | Full service |
