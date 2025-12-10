const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get completed orders from last 7 days
    const orders = await Order.find({
      status: 'completed',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Calculate total revenue for 7 days
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Get all order items for completed orders
    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({
      order: { $in: orderIds }
    }).populate('item', 'name');

    // 1. Most Sold Product (by quantity)
    const itemQuantities = {};
    orderItems.forEach(orderItem => {
      const itemId = orderItem.item._id.toString();
      const itemName = orderItem.item.name;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = {
          name: itemName,
          quantity: 0
        };
      }
      itemQuantities[itemId].quantity += orderItem.quantity;
    });

    const mostSoldProduct = Object.values(itemQuantities).sort((a, b) => b.quantity - a.quantity)[0] || { name: 'N/A', quantity: 0 };

    // 2. Highest Revenue Day
    const dailyRevenue = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += (order.total || 0);
    });

    const highestRevenueDay = Object.entries(dailyRevenue).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

    // 3. Most Popular Order Type
    const orderTypes = {};
    orders.forEach(order => {
      const type = order.orderType || 'dine-in';
      orderTypes[type] = (orderTypes[type] || 0) + 1;
    });

    const mostPopularOrderType = Object.entries(orderTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'dine-in';

    res.json({
      success: true,
      data: {
        mostSoldProduct: {
          name: mostSoldProduct.name,
          quantity: mostSoldProduct.quantity
        },
        highestRevenueDay: {
          date: highestRevenueDay[0],
          amount: highestRevenueDay[1]
        },
        totalRevenue7Days: totalRevenue,
        mostPopularOrderType: mostPopularOrderType,
        totalOrders: orders.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily sales data for chart
// @route   GET /api/admin/analytics/daily-sales
// @access  Private/Admin
const getDailySales = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    daysAgo.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      status: 'completed',
      createdAt: { $gte: daysAgo }
    });

    // Group by date
    const dailyData = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          revenue: 0,
          orderCount: 0
        };
      }
      dailyData[date].revenue += (order.total || 0);
      dailyData[date].orderCount += 1;
    });

    // Convert to array and sort by date
    const salesData = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top items by quantity sold
// @route   GET /api/admin/analytics/top-items-quantity
// @access  Private/Admin
const getTopItemsByQuantity = async (req, res, next) => {
  try {
    const { days = 7, limit = 8 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    daysAgo.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      status: 'completed',
      createdAt: { $gte: daysAgo }
    });

    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({
      order: { $in: orderIds }
    }).populate('item', 'name');

    // Aggregate quantities
    const itemQuantities = {};
    orderItems.forEach(orderItem => {
      const itemId = orderItem.item._id.toString();
      const itemName = orderItem.item.name;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = {
          name: itemName,
          quantity: 0
        };
      }
      itemQuantities[itemId].quantity += orderItem.quantity;
    });

    // Sort and limit
    const topItems = Object.values(itemQuantities)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top items by revenue
// @route   GET /api/admin/analytics/top-items-revenue
// @access  Private/Admin
const getTopItemsByRevenue = async (req, res, next) => {
  try {
    const { days = 7, limit = 8 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    daysAgo.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      status: 'completed',
      createdAt: { $gte: daysAgo }
    });

    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({
      order: { $in: orderIds }
    }).populate('item', 'name');

    // Aggregate revenue
    const itemRevenue = {};
    orderItems.forEach(orderItem => {
      const itemId = orderItem.item._id.toString();
      const itemName = orderItem.item.name;
      if (!itemRevenue[itemId]) {
        itemRevenue[itemId] = {
          name: itemName,
          revenue: 0
        };
      }
      itemRevenue[itemId].revenue += orderItem.price * orderItem.quantity;
    });

    // Sort and limit
    const topItems = Object.values(itemRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order types distribution
// @route   GET /api/admin/analytics/order-types
// @access  Private/Admin
const getOrderTypesDistribution = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    daysAgo.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      status: 'completed',
      createdAt: { $gte: daysAgo }
    });

    // Count by order type
    const orderTypes = {};
    orders.forEach(order => {
      const type = order.orderType || 'dine-in';
      orderTypes[type] = (orderTypes[type] || 0) + 1;
    });

    // Convert to array format
    const distribution = Object.entries(orderTypes).map(([type, count]) => ({
      type: type,
      count: count,
      percentage: ((count / orders.length) * 100).toFixed(2)
    }));

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete analytics (all in one)
// @route   GET /api/admin/analytics/complete
// @access  Private/Admin
const getCompleteAnalytics = async (req, res, next) => {
  try {
    const { days = 7, startDate, endDate } = req.query;
    
    let dateQuery = {};
    
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      daysAgo.setHours(0, 0, 0, 0);
      dateQuery = { $gte: daysAgo };
    }

    // Get completed orders
    const orders = await Order.find({
      status: { $in: ['completed', 'paid'] },
      createdAt: dateQuery
    });

    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({
      order: { $in: orderIds }
    }).populate('item', 'name');

    // 1. Key Insights
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    const itemQuantities = {};
    const itemRevenue = {};
    orderItems.forEach(orderItem => {
      const itemId = orderItem.item._id.toString();
      const itemName = orderItem.item.name;
      
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = { name: itemName, quantity: 0 };
      }
      itemQuantities[itemId].quantity += orderItem.quantity;

      if (!itemRevenue[itemId]) {
        itemRevenue[itemId] = { name: itemName, revenue: 0 };
      }
      itemRevenue[itemId].revenue += orderItem.price * orderItem.quantity;
    });

    const mostSoldProduct = Object.values(itemQuantities).sort((a, b) => b.quantity - a.quantity)[0] || { name: 'N/A', quantity: 0 };

    const dailyRevenue = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += (order.total || 0);
    });
    const highestRevenueDay = Object.entries(dailyRevenue).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

    const orderTypes = {};
    orders.forEach(order => {
      const type = order.orderType || 'dine-in';
      orderTypes[type] = (orderTypes[type] || 0) + 1;
    });
    const mostPopularOrderType = Object.entries(orderTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'dine-in';

    // 2. Daily Sales
    const dailyData = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date: date, revenue: 0, orderCount: 0 };
      }
      dailyData[date].revenue += (order.total || 0);
      dailyData[date].orderCount += 1;
    });
    const dailySales = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 3. Top items by quantity
    const topItemsByQuantity = Object.values(itemQuantities)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // 4. Top items by revenue
    const topItemsByRevenue = Object.values(itemRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // 5. Order types distribution
    const orderTypesDistribution = Object.entries(orderTypes).map(([type, count]) => ({
      type: type,
      count: count,
      percentage: ((count / orders.length) * 100).toFixed(2)
    }));

    // 6. Payment method breakdown
    const paymentBreakdown = {};
    orders.forEach(order => {
      if (order.paymentMethod && order.paymentMethod !== 'pending') {
        if (!paymentBreakdown[order.paymentMethod]) {
          paymentBreakdown[order.paymentMethod] = { count: 0, amount: 0 };
        }
        paymentBreakdown[order.paymentMethod].count += 1;
        paymentBreakdown[order.paymentMethod].amount += order.total;
      }
    });

    const paymentMethodBreakdown = Object.entries(paymentBreakdown).map(([method, data]) => ({
      _id: method,
      count: data.count,
      amount: data.amount
    }));

    // 7. Hourly revenue (for today or latest day)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const todayOrders = orders.filter(order => new Date(order.createdAt) >= startOfToday);
    
    const hourlyData = {};
    todayOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { hour, revenue: 0, orders: 0 };
      }
      hourlyData[hour].revenue += order.total;
      hourlyData[hour].orders += 1;
    });
    const hourlyRevenue = Object.values(hourlyData).sort((a, b) => a.hour - b.hour);

    // 8. Category-wise sales
    const categoryItems = await OrderItem.find({
      order: { $in: orderIds }
    }).populate({
      path: 'item',
      select: 'name category',
      populate: { path: 'category', select: 'name' }
    });

    const categorySales = {};
    categoryItems.forEach(orderItem => {
      if (orderItem.item && orderItem.item.category) {
        const categoryName = orderItem.item.category.name || 'Uncategorized';
        if (!categorySales[categoryName]) {
          categorySales[categoryName] = { totalSales: 0, count: 0 };
        }
        categorySales[categoryName].totalSales += orderItem.price * orderItem.quantity;
        categorySales[categoryName].count += orderItem.quantity;
      }
    });

    const categoryWiseSales = Object.entries(categorySales).map(([category, data]) => ({
      _id: category,
      totalSales: data.totalSales,
      count: data.count
    }));

    res.json({
      success: true,
      data: {
        keyInsights: {
          mostSoldProduct: {
            name: mostSoldProduct.name,
            quantity: mostSoldProduct.quantity
          },
          highestRevenueDay: {
            date: highestRevenueDay[0],
            amount: highestRevenueDay[1]
          },
          totalRevenue7Days: totalRevenue,
          mostPopularOrderType: mostPopularOrderType,
          totalOrders: orders.length
        },
        dailySales: dailySales,
        topItemsByQuantity: topItemsByQuantity,
        topItemsByRevenue: topItemsByRevenue,
        orderTypesDistribution: orderTypesDistribution,
        paymentMethodBreakdown: paymentMethodBreakdown,
        hourlyRevenue: hourlyRevenue,
        categoryWiseSales: categoryWiseSales
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getDailySales,
  getTopItemsByQuantity,
  getTopItemsByRevenue,
  getOrderTypesDistribution,
  getCompleteAnalytics
};
