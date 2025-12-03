require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Table = require('../models/Table');
const Settings = require('../models/Settings');
const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Category.deleteMany();
    await Item.deleteMany();
    await Table.deleteMany();
    await Settings.deleteMany();

    // Create users
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@restaurant.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      },
      {
        name: 'Cashier User',
        email: 'cashier@restaurant.com',
        password: 'cashier123',
        role: 'cashier'
      },
      {
        name: 'Kitchen User',
        email: 'kitchen@restaurant.com',
        password: 'kitchen123',
        role: 'kitchen'
      }
    ]);

    console.log('Users created:', users.length);

    // Create categories
    console.log('Creating categories...');
    const categories = await Category.create([
      {
        name: 'Hot Coffee',
        description: 'Freshly brewed hot coffee beverages',
        displayOrder: 1
      },
      {
        name: 'Cold Coffee',
        description: 'Refreshing iced coffee drinks',
        displayOrder: 2
      },
      {
        name: 'Tea',
        description: 'Premium tea selections',
        displayOrder: 3
      },
      {
        name: 'Pastries & Bakery',
        description: 'Fresh baked goods and pastries',
        displayOrder: 4
      },
      {
        name: 'Smoothies & Shakes',
        description: 'Healthy smoothies and delicious shakes',
        displayOrder: 5
      },
      {
        name: 'Snacks',
        description: 'Light bites and snacks',
        displayOrder: 6
      }
    ]);

    console.log('Categories created:', categories.length);

    // Create items
    console.log('Creating menu items...');
    const items = await Item.create([
      // Hot Coffee
      {
        name: 'Espresso',
        description: 'Rich and bold single shot of Italian espresso',
        category: categories[0]._id,
        price: 80,
        isVeg: true,
        preparationTime: 3,
        tags: ['popular', 'strong', 'classic']
      },
      {
        name: 'Double Espresso',
        description: 'Double shot of intense espresso',
        category: categories[0]._id,
        price: 120,
        isVeg: true,
        preparationTime: 3,
        tags: ['strong', 'intense']
      },
      {
        name: 'Cappuccino',
        description: 'Perfect blend of espresso, steamed milk, and foam',
        category: categories[0]._id,
        price: 150,
        isVeg: true,
        preparationTime: 5,
        tags: ['popular', 'creamy', 'classic']
      },
      {
        name: 'Cafe Latte',
        description: 'Smooth espresso with steamed milk and light foam',
        category: categories[0]._id,
        price: 160,
        isVeg: true,
        preparationTime: 5,
        tags: ['popular', 'smooth', 'mild']
      },
      {
        name: 'Flat White',
        description: 'Velvety microfoam over double espresso',
        category: categories[0]._id,
        price: 170,
        isVeg: true,
        preparationTime: 5,
        tags: ['creamy', 'strong']
      },
      {
        name: 'Caramel Macchiato',
        description: 'Espresso with vanilla, steamed milk, and caramel drizzle',
        category: categories[0]._id,
        price: 190,
        isVeg: true,
        preparationTime: 6,
        tags: ['sweet', 'popular', 'caramel']
      },
      {
        name: 'Mocha',
        description: 'Rich chocolate and espresso with steamed milk',
        category: categories[0]._id,
        price: 180,
        isVeg: true,
        preparationTime: 6,
        tags: ['chocolate', 'sweet', 'popular']
      },
      {
        name: 'Americano',
        description: 'Espresso diluted with hot water',
        category: categories[0]._id,
        price: 110,
        isVeg: true,
        preparationTime: 4,
        tags: ['classic', 'bold']
      },
      
      // Cold Coffee
      {
        name: 'Iced Latte',
        description: 'Chilled espresso with cold milk over ice',
        category: categories[1]._id,
        price: 170,
        isVeg: true,
        preparationTime: 5,
        tags: ['popular', 'refreshing', 'cold']
      },
      {
        name: 'Iced Americano',
        description: 'Espresso and cold water over ice',
        category: categories[1]._id,
        price: 120,
        isVeg: true,
        preparationTime: 4,
        tags: ['refreshing', 'strong']
      },
      {
        name: 'Cold Brew Coffee',
        description: 'Smooth cold-steeped coffee served over ice',
        category: categories[1]._id,
        price: 160,
        isVeg: true,
        preparationTime: 4,
        tags: ['smooth', 'popular', 'cold']
      },
      {
        name: 'Iced Caramel Macchiato',
        description: 'Iced version with caramel drizzle',
        category: categories[1]._id,
        price: 200,
        isVeg: true,
        preparationTime: 6,
        tags: ['sweet', 'caramel', 'popular']
      },
      {
        name: 'Vanilla Frappuccino',
        description: 'Blended iced coffee with vanilla and whipped cream',
        category: categories[1]._id,
        price: 220,
        isVeg: true,
        preparationTime: 6,
        tags: ['blended', 'sweet', 'popular']
      },
      {
        name: 'Mocha Frappuccino',
        description: 'Blended chocolate and coffee with whipped cream',
        category: categories[1]._id,
        price: 230,
        isVeg: true,
        preparationTime: 6,
        tags: ['chocolate', 'blended', 'sweet']
      },
      
      // Tea
      {
        name: 'Classic Chai',
        description: 'Traditional Indian spiced tea with milk',
        category: categories[2]._id,
        price: 60,
        isVeg: true,
        preparationTime: 5,
        tags: ['hot', 'spiced', 'traditional']
      },
      {
        name: 'Green Tea',
        description: 'Premium Japanese green tea',
        category: categories[2]._id,
        price: 80,
        isVeg: true,
        preparationTime: 4,
        tags: ['healthy', 'antioxidant']
      },
      {
        name: 'English Breakfast Tea',
        description: 'Classic black tea blend',
        category: categories[2]._id,
        price: 70,
        isVeg: true,
        preparationTime: 4,
        tags: ['classic', 'strong']
      },
      {
        name: 'Chamomile Tea',
        description: 'Soothing herbal tea',
        category: categories[2]._id,
        price: 90,
        isVeg: true,
        preparationTime: 5,
        tags: ['herbal', 'relaxing']
      },
      {
        name: 'Iced Tea',
        description: 'Refreshing cold tea with lemon',
        category: categories[2]._id,
        price: 80,
        isVeg: true,
        preparationTime: 4,
        tags: ['cold', 'refreshing']
      },
      
      // Pastries & Bakery
      {
        name: 'Chocolate Croissant',
        description: 'Buttery croissant filled with rich chocolate',
        category: categories[3]._id,
        price: 120,
        isVeg: true,
        preparationTime: 2,
        tags: ['popular', 'chocolate', 'flaky']
      },
      {
        name: 'Plain Croissant',
        description: 'Classic French butter croissant',
        category: categories[3]._id,
        price: 90,
        isVeg: true,
        preparationTime: 2,
        tags: ['classic', 'buttery']
      },
      {
        name: 'Blueberry Muffin',
        description: 'Fresh baked muffin with blueberries',
        category: categories[3]._id,
        price: 100,
        isVeg: true,
        preparationTime: 2,
        tags: ['popular', 'fruity', 'moist']
      },
      {
        name: 'Chocolate Chip Muffin',
        description: 'Soft muffin loaded with chocolate chips',
        category: categories[3]._id,
        price: 110,
        isVeg: true,
        preparationTime: 2,
        tags: ['chocolate', 'sweet']
      },
      {
        name: 'Cinnamon Roll',
        description: 'Warm cinnamon roll with cream cheese frosting',
        category: categories[3]._id,
        price: 130,
        isVeg: true,
        preparationTime: 3,
        tags: ['sweet', 'popular', 'cinnamon']
      },
      {
        name: 'Banana Bread',
        description: 'Moist homemade banana bread slice',
        category: categories[3]._id,
        price: 90,
        isVeg: true,
        preparationTime: 2,
        tags: ['homemade', 'moist']
      },
      {
        name: 'Chocolate Brownie',
        description: 'Fudgy chocolate brownie',
        category: categories[3]._id,
        price: 110,
        isVeg: true,
        preparationTime: 2,
        tags: ['chocolate', 'fudgy', 'popular']
      },
      {
        name: 'Cheesecake Slice',
        description: 'Creamy New York style cheesecake',
        category: categories[3]._id,
        price: 180,
        isVeg: true,
        preparationTime: 3,
        tags: ['creamy', 'premium', 'popular']
      },
      
      // Smoothies & Shakes
      {
        name: 'Mango Smoothie',
        description: 'Fresh mango blended with yogurt and honey',
        category: categories[4]._id,
        price: 150,
        isVeg: true,
        preparationTime: 5,
        tags: ['fruity', 'healthy', 'refreshing']
      },
      {
        name: 'Berry Blast Smoothie',
        description: 'Mixed berries with banana and yogurt',
        category: categories[4]._id,
        price: 160,
        isVeg: true,
        preparationTime: 5,
        tags: ['berries', 'healthy', 'antioxidant']
      },
      {
        name: 'Green Detox Smoothie',
        description: 'Spinach, apple, cucumber, and lime',
        category: categories[4]._id,
        price: 170,
        isVeg: true,
        preparationTime: 5,
        tags: ['healthy', 'detox', 'green']
      },
      {
        name: 'Chocolate Milkshake',
        description: 'Rich chocolate ice cream shake',
        category: categories[4]._id,
        price: 180,
        isVeg: true,
        preparationTime: 5,
        tags: ['chocolate', 'creamy', 'popular']
      },
      {
        name: 'Vanilla Milkshake',
        description: 'Classic vanilla ice cream shake',
        category: categories[4]._id,
        price: 170,
        isVeg: true,
        preparationTime: 5,
        tags: ['classic', 'creamy', 'vanilla']
      },
      {
        name: 'Oreo Milkshake',
        description: 'Vanilla shake blended with Oreo cookies',
        category: categories[4]._id,
        price: 200,
        isVeg: true,
        preparationTime: 5,
        tags: ['popular', 'cookies', 'creamy']
      },
      
      // Snacks
      {
        name: 'Veggie Sandwich',
        description: 'Fresh vegetables with pesto on whole grain bread',
        category: categories[5]._id,
        price: 140,
        isVeg: true,
        preparationTime: 8,
        tags: ['healthy', 'fresh', 'sandwich']
      },
      {
        name: 'Grilled Cheese Sandwich',
        description: 'Classic grilled cheese on sourdough',
        category: categories[5]._id,
        price: 130,
        isVeg: true,
        preparationTime: 8,
        tags: ['classic', 'cheesy', 'comfort']
      },
      {
        name: 'Club Sandwich',
        description: 'Triple decker with chicken, bacon, lettuce, and tomato',
        category: categories[5]._id,
        price: 220,
        isVeg: false,
        preparationTime: 10,
        tags: ['hearty', 'popular', 'filling']
      },
      {
        name: 'Bagel with Cream Cheese',
        description: 'Toasted bagel with cream cheese spread',
        category: categories[5]._id,
        price: 100,
        isVeg: true,
        preparationTime: 5,
        tags: ['classic', 'simple']
      },
      {
        name: 'Cookies (3 pcs)',
        description: 'Assorted fresh baked cookies',
        category: categories[5]._id,
        price: 90,
        isVeg: true,
        preparationTime: 1,
        tags: ['sweet', 'snack']
      }
    ]);

    console.log('Menu items created:', items.length);

    // Create tables
    console.log('Creating tables...');
    const tables = await Table.create([
      { tableNumber: 'T1', capacity: 2, location: 'Window side' },
      { tableNumber: 'T2', capacity: 4, location: 'Center' },
      { tableNumber: 'T3', capacity: 4, location: 'Corner' },
      { tableNumber: 'T4', capacity: 6, location: 'Private room' },
      { tableNumber: 'T5', capacity: 2, location: 'Bar area' },
      { tableNumber: 'T6', capacity: 4, location: 'Patio' },
      { tableNumber: 'T7', capacity: 8, location: 'Family section' },
      { tableNumber: 'T8', capacity: 2, location: 'Window side' },
      { tableNumber: 'T9', capacity: 4, location: 'Center' },
      { tableNumber: 'T10', capacity: 6, location: 'VIP section' }
    ]);

    console.log('Tables created:', tables.length);

    console.log('\n=================================');
    console.log('Database seeded successfully!');
    console.log('=================================');
    console.log('\nDefault Login Credentials:');
    console.log('Admin:   admin@restaurant.com / admin123');
    console.log('Cashier: cashier@restaurant.com / cashier123');
    console.log('Kitchen: kitchen@restaurant.com / kitchen123');
    console.log('=================================\n');

    // Create default settings
    console.log('Creating default settings...');
    await Settings.create({
      cafeName: 'My Café',
      address: '123 Main Street, City, State 12345',
      phone: '+91 9876543210',
      email: 'info@mycafe.com',
      businessHours: {
        openingTime: '08:00',
        closingTime: '22:00'
      },
      tax: {
        gstRate: 5
      },
      currency: 'INR',
      currencySymbol: '₹',
      isInitialized: true
    });

    console.log('Default settings created');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
