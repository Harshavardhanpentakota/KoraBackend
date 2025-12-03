# Restaurant Management System - Backend

A complete backend solution for restaurant management with role-based access control, menu management, order processing, and kitchen display system.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Role Management**: Admin, Cashier, Kitchen, and Public access
- **Menu Management**: Complete CRUD operations for categories and menu items
- **Table Management**: Table status tracking with QR code support
- **Order Management**: Full order lifecycle from creation to completion
- **Kitchen Display System**: Real-time order status updates for kitchen staff
- **Payment Processing**: Cashier billing and payment tracking

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Default Credentials (after seeding)

- **Admin**: admin@restaurant.com / admin123
- **Cashier**: cashier@restaurant.com / cashier123
- **Kitchen**: kitchen@restaurant.com / kitchen123

## API Documentation

See `API_EXAMPLES.md` for detailed API endpoints and request/response examples.

## Project Structure

```
src/
├── config/           # Database and app configuration
├── controllers/      # Request handlers
├── middlewares/      # Custom middleware (auth, validation, error handling)
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper functions and utilities
└── server.js        # Application entry point
```

## License

ISC
