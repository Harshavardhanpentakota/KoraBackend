# Quick Start Guide - Updated Backend

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy and edit .env file
cp .env.example .env
```

**.env:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/kora-cafe-pos
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔑 Test Credentials

```
Admin:   admin@restaurant.com   / admin123
Cashier: cashier@restaurant.com / cashier123
Kitchen: kitchen@restaurant.com / kitchen123
Waiter:  waiter@restaurant.com  / waiter123
```

---

## 📌 Key API Endpoints

### Authentication
```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Tables
```http
GET  /api/tables
GET  /api/tables/:id
POST /api/tables           # Admin only
PUT  /api/tables/:id
```

### Menu/Inventory
```http
GET  /api/menu
GET  /api/menu/low-stock   # NEW - Inventory alerts
GET  /api/menu/:id
POST /api/menu             # Admin/Cashier
PUT  /api/menu/:id
```

### Orders
```http
GET  /api/orders
GET  /api/orders/table/:tableId  # NEW - Get order by table
GET  /api/orders/:id
POST /api/orders
PUT  /api/orders/:id/status
PUT  /api/orders/:id/pay         # NEW - Process payment
DELETE /api/orders/:id
```

### Analytics
```http
GET /api/admin/analytics/dashboard
GET /api/admin/analytics/complete
GET /api/admin/analytics/daily-sales
GET /api/admin/analytics/top-items-quantity
GET /api/admin/analytics/top-items-revenue
GET /api/admin/analytics/order-types
```

---

## 🆕 What's New

### Schema Updates
- ✅ **Table**: Now uses Number for `tableNumber`, added `name`, `seats`, `currentOrder`
- ✅ **Item**: Added `stock`, `threshold`, `isLowStock` (virtual)
- ✅ **Order**: Added payment tracking (`paymentMethod`, `paymentStatus`, `paidAt`)
- ✅ **User**: Added `username` field and `waiter` role
- ✅ **Transaction**: NEW model for payment tracking

### New APIs
- ✅ `GET /api/orders/table/:tableId` - Get active order for table
- ✅ `PUT /api/orders/:id/pay` - Process payment with transaction record
- ✅ `GET /api/menu/low-stock` - Get inventory alerts

### Enhanced Analytics
- ✅ Payment method breakdown
- ✅ Hourly revenue analysis
- ✅ Category-wise sales
- ✅ Date range support

---

## 📊 Sample Requests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier@restaurant.com",
    "password": "cashier123"
  }'
```

### Get Tables
```bash
curl http://localhost:5000/api/tables
```

### Get Low Stock Items
```bash
curl http://localhost:5000/api/menu/low-stock \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Process Payment
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "upi",
    "transactionId": "TXN123456789",
    "notes": "Paid via PhonePe"
  }'
```

### Get Analytics
```bash
curl http://localhost:5000/api/admin/analytics/complete?days=7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 Migration (If Upgrading)

### Backup First
```bash
mongodump --db kora-cafe-pos --out ./backup
```

### Run Seed to Recreate
```bash
npm run seed
```

### Or Manual Migration
See `SCHEMA_UPDATES_SUMMARY.md` for detailed migration scripts.

---

## 📚 Documentation

- **[KORA_POS_API_GUIDE.md](./KORA_POS_API_GUIDE.md)** - Complete API docs
- **[SCHEMA_UPDATES_SUMMARY.md](./SCHEMA_UPDATES_SUMMARY.md)** - All changes explained
- **[CASHIER_FRONTEND_GUIDE.md](./CASHIER_FRONTEND_GUIDE.md)** - Frontend integration
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in .env
- Verify network access (for MongoDB Atlas)

### JWT Errors
- Check JWT_SECRET in .env
- Verify token is being sent in Authorization header
- Ensure token hasn't expired

---

## 🎯 Common Workflows

### 1. Create Order → Pay → Complete
```
1. POST /api/orders → Create order
2. PUT /api/orders/:id/status → Accept order
3. PUT /api/orders/:id/pay → Process payment
4. Order status changes to 'paid', table freed
```

### 2. Check Inventory
```
1. GET /api/menu/low-stock → Get alerts
2. PUT /api/menu/:id → Update stock levels
```

### 3. Daily Analytics
```
1. GET /api/cashier/summary → Today's summary
2. GET /api/admin/analytics/complete → Detailed reports
```

---

## 📦 Package Scripts

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "seed": "node src/utils/seed.js"
}
```

---

## 🌐 CORS Configuration

Default: `http://localhost:5173`

To change, update `.env`:
```env
CORS_ORIGIN=http://your-frontend-url.com
```

---

**Happy Coding! 🚀**

For detailed API documentation, see [KORA_POS_API_GUIDE.md](./KORA_POS_API_GUIDE.md)
