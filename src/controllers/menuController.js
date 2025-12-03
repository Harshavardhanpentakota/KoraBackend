const Item = require('../models/Item');

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
    const item = await Item.create(req.body);
    await item.populate('category', 'name');
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/admin/menu/:id
// @access  Private/Admin
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
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

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted successfully'
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
  deleteItem
};
