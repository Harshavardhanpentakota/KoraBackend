const Table = require('../models/Table');
const QRCode = require('qrcode');

// @desc    Get single table (public)
// @route   GET /api/tables/:id
// @access  Public
const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    if (!table.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Table is not active'
      });
    }

    res.json({
      success: true,
      data: {
        _id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        location: table.location
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find()
      .populate({
        path: 'currentOrder',
        select: 'orderNumber status total orderType customerName'
      })
      .sort('tableNumber');
    
    res.json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Public
const getTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate({
        path: 'currentOrder',
        select: 'orderNumber status total orderType customerName subtotal tax discount notes createdAt'
      });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create table
// @route   POST /api/admin/tables
// @access  Private/Admin
const createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);
    
    // Generate QR code with frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    const qrData = `${frontendUrl}/table/${table._id}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    table.qrCode = qrCodeDataURL;
    await table.save();
    
    res.status(201).json({
      success: true,
      data: table
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update table
// @route   PUT /api/admin/tables/:id
// @access  Private/Admin
const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table
// @route   DELETE /api/admin/tables/:id
// @access  Private/Admin
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    await table.deleteOne();

    res.json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate QR code for table
// @route   GET /api/admin/tables/:id/qr
// @access  Private/Admin
const generateTableQR = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Generate QR code with frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    const qrData = `${frontendUrl}/table/${table._id}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    table.qrCode = qrCodeDataURL;
    await table.save();

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        url: qrData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTables,
  getTable,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  generateTableQR
};
