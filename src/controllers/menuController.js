const Item = require('../models/Item');
const path = require('path');
const fs = require('fs');

// @desc    Get all items
// @route   GET /api/menu
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const { category, isVeg, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await Item.find(query).populate('category', 'name');
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/menu/:id
// @access  Public
const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('category', 'name');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create item
// @route   POST /api/admin/menu
// @access  Private/Admin
const createItem = async (req, res, next) => {
  try {
    const itemData = { ...req.body };
    
    // If image was uploaded, add the image path
    if (req.file) {
      itemData.image = `/images/${req.file.filename}`;
    }
    
    const item = await Item.create(itemData);
    await item.populate('category', 'name');
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(__dirname, '../../public/images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/admin/menu/:id
// @access  Private/Admin
const updateItem = async (req, res, next) => {
  try {
    const existingItem = await Item.findById(req.params.id);
    
    if (!existingItem) {
      // If item not found and file was uploaded, delete it
      if (req.file) {
        const filePath = path.join(__dirname, '../../public/images', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    const updateData = { ...req.body };
    
    // If new image was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (existingItem.image) {
        const oldImagePath = path.join(__dirname, '../../public', existingItem.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Set new image path
      updateData.image = `/images/${req.file.filename}`;
    }
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(__dirname, '../../public/images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/admin/menu/:id
// @access  Private/Admin
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Delete associated image if it exists
    if (item.image) {
      const imagePath = path.join(__dirname, '../../public', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock items
// @route   GET /api/menu/low-stock
// @access  Private/Admin/Cashier
const getLowStockItems = async (req, res, next) => {
  try {
    // Find items where stock is less than or equal to threshold
    const items = await Item.find({
      $expr: { $lte: ['$stock', '$threshold'] }
    })
      .populate('category', 'name')
      .sort('stock');

    // Add isLowStock virtual to each item
    const itemsWithLowStock = items.map(item => {
      const itemObj = item.toObject({ virtuals: true });
      return itemObj;
    });

    res.json({
      success: true,
      count: itemsWithLowStock.length,
      data: itemsWithLowStock
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems
};
