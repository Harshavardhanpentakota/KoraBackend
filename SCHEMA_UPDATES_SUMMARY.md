# Backend Schema Updates - Summary

## ✅ Completed Updates

All backend schemas and APIs have been successfully updated to align with the Kora Cafe POS frontend requirements.

---

## 📝 Schema Changes

### 1. **User Model** (`src/models/User.js`)
**Added:**
- `username` - String, unique, auto-generated from name if not provided
- `role` enum updated to include `'waiter'`
- `comparePassword` method alias for compatibility

**Usage:**
```javascript
{
  name: "John Doe",
  username: "johndoe",  // NEW
  email: "john@koracafe.com",
  password: "hashed_password",
  role: "waiter",        // NEW ROLE
  isActive: true
}
```

---

### 2. **Table Model** (`src/models/Table.js`)
**Changed:**
- `tableNumber` - Changed from String to **Number** (required, unique)

**Added:**
- `name` - String (required) - e.g., "Table 1"
- `seats` - Number (required, default: 4)
- `currentOrder` - ObjectId ref to Order
- `status` enum expanded: `['free', 'available', 'occupied', 'reserved', 'maintenance', 'waiting']`

**Pre-save Hook:**
- Auto-syncs `capacity` with `seats` if not provided

**Usage:**
```javascript
{
  tableNumber: 5,        // Number, not String!
  name: "Table 5",       // NEW
  seats: 4,              // NEW
  capacity: 4,
  status: "free",        // 'free' instead of 'available'
  currentOrder: null,    // NEW
  location: "Window side",
  qrCode: "data:image/...",
  isActive: true
}
```

---

### 3. **Item Model** (`src/models/Item.js`)
**Added:**
- `stock` - Number (required, default: 0)
- `threshold` - Number (required, default: 10)
- `isLowStock` - Virtual field (computed: stock <= threshold)

**Schema Options:**
- Added `toJSON: { virtuals: true }` and `toObject: { virtuals: true }`

**Usage:**
```javascript
{
  name: "Espresso",
  category: ObjectId,
  price: 120,
  stock: 50,             // NEW
  threshold: 10,         // NEW
  isAvailable: true,
  isLowStock: false,     // NEW (virtual, computed)
  preparationTime: 5
}
```

---

### 4. **Order Model** (`src/models/Order.js`)
**Added:**
- `tableNumber` - Number (snapshot for reference)
- `isTakeaway` - Boolean (default: false, auto-synced with orderType)
- `status` enum expanded to include `'paid'`
- `paymentMethod` - Enum `['cash', 'card', 'upi', 'wallet', 'pending']`
- `paymentStatus` - Enum `['pending', 'paid', 'refunded']`
- `paidAt` - Date (timestamp when payment completed)
- `createdBy` - ObjectId ref to User

**Pre-save Hooks:**
1. Syncs `isTakeaway` with `orderType`
2. Auto-generates `orderNumber` in format: `ORD-YYYYMMDD-####`

**Usage:**
```javascript
{
  orderNumber: "ORD-20251210-0001",
  table: ObjectId,
  tableNumber: 5,              // NEW
  orderType: "dine-in",
  isTakeaway: false,           // NEW
  status: "paid",              // NEW status option
  subtotal: 300,
  tax: 15,
  total: 315,
  paymentMethod: "upi",        // NEW
  paymentStatus: "paid",       // NEW
  paidAt: Date,                // NEW
  createdBy: ObjectId          // NEW
}
```

---

### 5. **Transaction Model** (`src/models/Transaction.js`) - **NEW**
Complete new model for tracking payments and transactions.

**Schema:**
```javascript
{
  order: ObjectId (ref: Order, required),
  orderNumber: String (required),
  amount: Number (required, min: 0),
  paymentMethod: Enum['cash', 'card', 'upi', 'wallet'] (required),
  type: Enum['sale', 'refund'] (default: 'sale'),
  status: Enum['completed', 'pending', 'failed'],
  transactionId: String,
  processedBy: ObjectId (ref: User),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `createdAt` (descending)
- `order`
- `paymentMethod`
- `type`

---

## 🔌 New API Endpoints

### 1. **Get Order by Table**
```http
GET /api/orders/table/:tableId
Authorization: Bearer <token>
```

Returns active order for a specific table.

**Response:**
```json
{
  "success": true,
  "data": {
    "order": { ... },
    "items": [ ... ]
  }
}
```

---

### 2. **Process Payment**
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
    "order": { ... },
    "transaction": { ... }
  }
}
```

**Actions performed:**
- Updates order payment fields
- Creates transaction record
- Changes order status to 'paid'
- Frees table if dine-in order

---

### 3. **Get Low Stock Items**
```http
GET /api/menu/low-stock
Authorization: Bearer <cashier_or_admin_token>
```

Returns items where `stock <= threshold`.

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
      "category": { ... }
    }
  ]
}
```

---

### 4. **Enhanced Analytics - Complete Dashboard**
```http
GET /api/admin/analytics/complete
GET /api/admin/analytics/complete?days=30
GET /api/admin/analytics/complete?startDate=2025-12-01&endDate=2025-12-10
Authorization: Bearer <token>
```

**New additions to response:**
- `paymentMethodBreakdown` - Revenue and count per payment method
- `hourlyRevenue` - Sales by hour of day
- `categoryWiseSales` - Revenue breakdown by category

**Query Parameters:**
- `days` - Number of days (default: 7)
- `startDate` - ISO date string
- `endDate` - ISO date string

---

## 📂 File Changes

### Modified Files:
1. `src/models/User.js` - Added username, waiter role
2. `src/models/Table.js` - Restructured with Number tableNumber, name, seats
3. `src/models/Item.js` - Added stock, threshold, isLowStock virtual
4. `src/models/Order.js` - Added payment fields, tableNumber, isTakeaway
5. `src/controllers/orderController.js` - Added getOrderByTable, processOrderPayment
6. `src/routes/orderRoutes.js` - Added new routes
7. `src/controllers/menuController.js` - Added getLowStockItems
8. `src/routes/menuRoutes.js` - Added /low-stock route
9. `src/controllers/analyticsController.js` - Enhanced complete analytics
10. `src/utils/seed.js` - Updated with new schema fields

### New Files:
1. `src/models/Transaction.js` - New transaction tracking model
2. `KORA_POS_API_GUIDE.md` - Complete API documentation
3. `CASHIER_FRONTEND_GUIDE.md` - Frontend integration guide (already existed)

---

## 🔄 Migration Steps

### For Existing Database:

#### 1. Update Users (Add Username)
```javascript
db.users.find({ username: { $exists: false } }).forEach(user => {
  db.users.updateOne(
    { _id: user._id },
    { $set: { username: user.name.toLowerCase().replace(/\s+/g, '') } }
  );
});
```

#### 2. Update Tables (String to Number tableNumber)
```javascript
db.tables.find().forEach(table => {
  const tableNum = parseInt(table.tableNumber.replace(/[^\d]/g, ''));
  db.tables.updateOne(
    { _id: table._id },
    { 
      $set: {
        tableNumber: tableNum,
        name: `Table ${tableNum}`,
        seats: table.capacity || 4,
        currentOrder: null,
        status: table.status === 'available' ? 'free' : table.status
      }
    }
  );
});
```

#### 3. Update Items (Add Stock Fields)
```javascript
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

#### 4. Update Orders (Add Payment Fields)
```javascript
db.orders.find().forEach(order => {
  const updates = {
    isTakeaway: order.orderType !== 'dine-in',
    paymentMethod: order.status === 'completed' ? 'cash' : 'pending',
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

---

## 🧪 Testing

### Seed Database
```bash
npm run seed
```

This will create:
- 4 users (admin, cashier, kitchen, waiter)
- 6 categories
- 38+ menu items with stock/threshold
- 12 tables with proper numbering

### Test Credentials
```
Admin:   admin@restaurant.com / admin123
Cashier: cashier@restaurant.com / cashier123
Kitchen: kitchen@restaurant.com / kitchen123
Waiter:  waiter@restaurant.com / waiter123
```

---

## 📊 Benefits of Updates

1. **Inventory Management** - Track stock levels, low stock alerts
2. **Transaction Tracking** - Complete payment history with Transaction model
3. **Better Table Management** - Numeric IDs, seat counts, current order tracking
4. **Enhanced Analytics** - Payment methods, hourly revenue, category sales
5. **Multi-role Support** - Added waiter role for frontend integration
6. **Payment Processing** - Complete payment workflow with status tracking
7. **Improved Data Integrity** - Snapshots (tableNumber, item prices) for historical accuracy

---

## 🚀 Next Steps

1. **Run Migration** - If upgrading existing database
2. **Test APIs** - Use Postman/Thunder Client
3. **Update Frontend** - Integrate with new API structure
4. **Deploy** - Update production environment

---

## 📚 Documentation

- **[KORA_POS_API_GUIDE.md](./KORA_POS_API_GUIDE.md)** - Complete API reference
- **[CASHIER_FRONTEND_GUIDE.md](./CASHIER_FRONTEND_GUIDE.md)** - Frontend integration guide
- **[FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md)** - Original API guide
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Request/response examples

---

## ⚠️ Breaking Changes

1. **Table.tableNumber** - Now Number instead of String
2. **Table.status** - 'available' changed to 'free' (both still work)
3. **Order.status** - Added 'paid' status
4. **Item schema** - stock and threshold are now required (defaults: 0 and 10)

---

**Last Updated:** December 10, 2025
**Version:** 2.0.0
