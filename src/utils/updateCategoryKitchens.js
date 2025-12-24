const mongoose = require('mongoose');
const Category = require('../models/Category');
const Item = require('../models/Item');
require('dotenv').config();

// Update categories to assign them to appropriate kitchens
const updateCategoryKitchens = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('Updating categories with kitchen assignments...\n');

    // Exact category names for coffee-vendor
    const coffeeVendorCategoryNames = ['Hot Coffee', 'Cold Coffee', 'Tea'];
    
    // Update coffee-vendor categories by exact name match
    for (const catName of coffeeVendorCategoryNames) {
      const result = await Category.updateMany(
        { name: catName },
        { $set: { belongsTo: 'coffee-vendor' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✓ Updated category "${catName}" to coffee-vendor`);
      } else {
        console.log(`- Category "${catName}" already updated or not found`);
      }
    }

    // Set all other categories to normal-kitchen if not already set
    const normalKitchenResult = await Category.updateMany(
      { 
        belongsTo: { $exists: false },
        name: { $nin: coffeeVendorCategoryNames }
      },
      { $set: { belongsTo: 'normal-kitchen' } }
    );
    console.log(`✓ Set ${normalKitchenResult.modifiedCount} remaining category(ies) to normal-kitchen`);

    // Display summary
    console.log('\n=== Category Summary ===');
    
    const categories = await Category.find({}).select('name belongsTo');
    
    const coffeeVendorCats = categories.filter(c => c.belongsTo === 'coffee-vendor');
    const normalKitchenCats = categories.filter(c => c.belongsTo === 'normal-kitchen');
    const barCats = categories.filter(c => c.belongsTo === 'bar');
    const bakeryCats = categories.filter(c => c.belongsTo === 'bakery');

    console.log('\nCoffee Vendor (' + coffeeVendorCats.length + '):');
    coffeeVendorCats.forEach(c => console.log(`  - ${c.name}`));
    
    console.log('\nNormal Kitchen (' + normalKitchenCats.length + '):');
    normalKitchenCats.forEach(c => console.log(`  - ${c.name}`));
    
    if (barCats.length > 0) {
      console.log('\nBar (' + barCats.length + '):');
      barCats.forEach(c => console.log(`  - ${c.name}`));
    }
    
    if (bakeryCats.length > 0) {
      console.log('\nBakery (' + bakeryCats.length + '):');
      bakeryCats.forEach(c => console.log(`  - ${c.name}`));
    }

    console.log('\n✓ Categories updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
};

updateCategoryKitchens();
