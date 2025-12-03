# Restaurant Management System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

## Installation Steps

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- express-validator
- qrcode
- nodemon (dev dependency)

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Admin Default Credentials (for seeding)
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=admin123
```

**Important:** Change the `JWT_SECRET` to a strong random string in production!

### 3. Start MongoDB

Make sure MongoDB is running on your system.

**Windows:**
```powershell
# If MongoDB is installed as a service, it should start automatically
# Otherwise, run:
mongod
```

**Alternative:** You can use MongoDB Atlas (cloud) and update the `MONGODB_URI` in `.env`

### 4. Seed the Database

Populate the database with sample data:

```powershell
npm run seed
```

This will create:
- **3 Users** (admin, cashier, kitchen)
- **5 Categories** (Appetizers, Main Course, Desserts, Beverages, Pizza)
- **17 Menu Items** (various dishes and drinks)
- **10 Tables** (different capacities and locations)

**Default Login Credentials:**
- Admin: `admin@restaurant.com` / `admin123`
- Cashier: `cashier@restaurant.com` / `cashier123`
- Kitchen: `kitchen@restaurant.com` / `kitchen123`

### 5. Start the Server

**Development mode (with auto-restart):**
```powershell
npm run dev
```

**Production mode:**
```powershell
npm start
```

The server will start on `http://localhost:5000`

### 6. Verify Installation

Open your browser or API client (Postman, Thunder Client, etc.) and visit:

```
http://localhost:5000
```

You should see:
```json
{
  "success": true,
  "message": "Restaurant Management System API",
  "version": "1.0.0"
}
```

## Testing the API

### 1. Login as Admin

**Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

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
    "_id": "...",
    "name": "Admin User",
    "email": "admin@restaurant.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Copy the `token` value for subsequent requests.

### 2. Get Menu Items (Public)

**Request:**
```http
GET http://localhost:5000/api/menu
```

### 3. Create an Order (Public)

First, get item IDs from the menu, then create an order:

**Request:**
```http
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "items": [
    {
      "item": "ITEM_ID_HERE",
      "quantity": 2
    }
  ],
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "orderType": "dine-in"
}
```

### 4. Access Protected Routes

For protected routes, include the token in the Authorization header:

**Request:**
```http
GET http://localhost:5000/api/admin/users
Authorization: Bearer YOUR_TOKEN_HERE
```

## Project Structure

```
KoraBackend/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   ├── categoryController.js # Category management
│   │   ├── menuController.js     # Menu item management
│   │   ├── tableController.js    # Table management
│   │   ├── orderController.js    # Order management
│   │   ├── cashierController.js  # Cashier operations
│   │   └── kitchenController.js  # Kitchen operations
│   ├── middlewares/
│   │   ├── auth.js               # JWT authentication
│   │   ├── roleCheck.js          # Role-based access control
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validation.js         # Request validation
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Category.js           # Category schema
│   │   ├── Item.js               # Menu item schema
│   │   ├── Table.js              # Table schema
│   │   ├── Order.js              # Order schema
│   │   ├── OrderItem.js          # Order item schema
│   │   └── Payment.js            # Payment schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── userRoutes.js         # User endpoints
│   │   ├── categoryRoutes.js     # Category endpoints
│   │   ├── menuRoutes.js         # Menu endpoints
│   │   ├── tableRoutes.js        # Table endpoints
│   │   ├── orderRoutes.js        # Order endpoints
│   │   ├── cashierRoutes.js      # Cashier endpoints
│   │   └── kitchenRoutes.js      # Kitchen endpoints
│   ├── utils/
│   │   └── seed.js               # Database seeding script
│   └── server.js                 # Application entry point
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Project dependencies
├── README.md                     # Project overview
└── API_EXAMPLES.md               # API documentation
```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm run seed` - Seed the database with sample data

## Common Issues & Solutions

### Issue: MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Ensure MongoDB is running
2. Check if the MONGODB_URI in `.env` is correct
3. Try running: `mongod` in a separate terminal

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change the PORT in `.env` to a different value (e.g., 5001)
2. Or stop the process using port 5000:
   ```powershell
   # Find the process
   Get-NetTCPConnection -LocalPort 5000
   # Kill the process (replace PID with actual process ID)
   Stop-Process -Id PID -Force
   ```

### Issue: JWT Token Invalid

**Solution:**
1. Make sure you're including the token in the Authorization header
2. Format: `Authorization: Bearer <token>`
3. Check if the token hasn't expired (default: 7 days)
4. Login again to get a new token

## API Testing Tools

### Recommended Tools:
1. **Postman** - [Download](https://www.postman.com/downloads/)
2. **Thunder Client** (VS Code Extension)
3. **Insomnia** - [Download](https://insomnia.rest/download)
4. **cURL** (Command line)

### Example cURL Commands:

**Login:**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@restaurant.com","password":"admin123"}'
```

**Get Menu:**
```powershell
curl http://localhost:5000/api/menu
```

**Create Order:**
```powershell
curl -X POST http://localhost:5000/api/orders `
  -H "Content-Type: application/json" `
  -d '{"items":[{"item":"ITEM_ID","quantity":2}],"customerName":"John Doe","orderType":"dine-in"}'
```

## Next Steps

1. **Explore the API** - Check `API_EXAMPLES.md` for detailed endpoint documentation
2. **Test Different Roles** - Login as admin, cashier, and kitchen to test role-based access
3. **Create Orders** - Test the complete order flow from creation to completion
4. **Customize** - Modify models, add new features, or adjust business logic

## Production Deployment

Before deploying to production:

1. **Update Environment Variables:**
   - Set `NODE_ENV=production`
   - Use a strong `JWT_SECRET`
   - Use MongoDB Atlas or a production database

2. **Security:**
   - Enable HTTPS
   - Add rate limiting
   - Implement proper CORS configuration
   - Add helmet.js for security headers

3. **Performance:**
   - Enable compression
   - Add caching where appropriate
   - Use PM2 for process management

4. **Monitoring:**
   - Add logging (Winston, Morgan)
   - Set up error tracking (Sentry)
   - Monitor database performance

## Support & Documentation

- **API Documentation:** See `API_EXAMPLES.md`
- **Project Overview:** See `README.md`
- **MongoDB Documentation:** https://docs.mongodb.com/
- **Express Documentation:** https://expressjs.com/
- **Mongoose Documentation:** https://mongoosejs.com/

## License

ISC
