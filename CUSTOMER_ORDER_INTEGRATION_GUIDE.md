# Frontend Integration Guide - Customer Order Interface

## Overview
Complete guide for integrating the customer-facing order interface with real-time status tracking and order management.

---

## 1. Order Creation Flow

### Step 1: Scan QR Code & Get Table Info
```javascript
// User scans QR code with tableId in URL
// Example: https://yourapp.com/order?table=69397fffe776aa39ba7ea21f

const tableId = new URLSearchParams(window.location.search).get('table');

// Fetch table details
const getTableInfo = async (tableId) => {
  const response = await fetch(`http://localhost:5000/api/tables/${tableId}`);
  const data = await response.json();
  
  if (data.success) {
    return {
      tableNumber: data.data.tableNumber,
      tableName: data.data.name,
      capacity: data.data.capacity,
      location: data.data.location
    };
  }
  throw new Error('Table not found');
};
```

### Step 2: Fetch Menu Items
```javascript
const getMenuItems = async () => {
  const response = await fetch('http://localhost:5000/api/menu');
  const data = await response.json();
  
  if (data.success) {
    return data.data; // Array of menu items with categories
  }
  return [];
};

// Get items by category
const getItemsByCategory = async (categoryId) => {
  const response = await fetch(`http://localhost:5000/api/menu?category=${categoryId}`);
  const data = await response.json();
  return data.success ? data.data : [];
};
```

### Step 3: Create Order (Customer)
```javascript
const createCustomerOrder = async (orderData) => {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [
        { item: '692b3dd54f37a4fed104b269', quantity: 2, notes: '' },
        { item: '692b3dd54f37a4fed104b26a', quantity: 1, notes: 'No sugar' }
      ],
      table: '69397fffe776aa39ba7ea21f',
      orderType: 'dine-in',
      orderSource: 'customer', // ← Important: marks as customer order
      customerName: 'John Doe',
      customerPhone: '1234567890',
      notes: 'Please serve hot'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save order ID for later reference
    localStorage.setItem('currentOrderId', data.data.order._id);
    localStorage.setItem('orderNumber', data.data.order.orderNumber);
    
    return {
      orderId: data.data.order._id,
      orderNumber: data.data.order.orderNumber,
      total: data.data.order.total,
      items: data.data.items
    };
  }
  
  throw new Error(data.message || 'Order creation failed');
};
```

### Step 4: Process Payment Immediately
```javascript
const processCustomerPayment = async (orderId, paymentMethod) => {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentMethod: paymentMethod, // 'upi', 'card', 'cash', 'wallet'
      transactionId: `TXN-${Date.now()}`, // Optional: your transaction ID
      amount: 0, // Optional: for validation
      notes: ''
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    return {
      paid: true,
      transaction: data.data.transaction,
      order: data.data.order
    };
  }
  
  throw new Error(data.message || 'Payment failed');
};
```

---

## 2. Order Status Tracking

### Real-time Status Updates
```javascript
// Poll for order status every 10 seconds
const startOrderTracking = (orderId) => {
  const intervalId = setInterval(async () => {
    try {
      const order = await getOrderStatus(orderId);
      updateOrderUI(order);
      
      // Stop polling if order is completed
      if (order.status === 'completed' || order.status === 'cancelled') {
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
    }
  }, 10000); // Poll every 10 seconds
  
  return intervalId; // Save to clear later if needed
};

const getOrderStatus = async (orderId) => {
  const response = await fetch(`http://localhost:5000/api/orders/status/${orderId}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  }
  throw new Error('Failed to fetch order status');
};
```

### Display Order Status
```javascript
const updateOrderUI = (order) => {
  const statusMap = {
    pending: { label: 'Order Received', icon: '📝', color: '#FFA500' },
    accepted: { label: 'Order Accepted', icon: '✅', color: '#4CAF50' },
    preparing: { label: 'Preparing Your Food', icon: '👨‍🍳', color: '#2196F3' },
    ready: { label: 'Order Ready!', icon: '🔔', color: '#4CAF50' },
    completed: { label: 'Order Completed', icon: '✅', color: '#4CAF50' },
    cancelled: { label: 'Order Cancelled', icon: '❌', color: '#F44336' }
  };
  
  const status = statusMap[order.status];
  
  // Update your UI elements
  document.getElementById('status-label').textContent = status.label;
  document.getElementById('status-icon').textContent = status.icon;
  document.getElementById('status-container').style.backgroundColor = status.color;
  
  // Show estimated time based on status
  if (order.status === 'preparing') {
    document.getElementById('estimated-time').textContent = 'Estimated: 15-20 minutes';
  } else if (order.status === 'ready') {
    document.getElementById('estimated-time').textContent = 'Your order is ready for pickup!';
  }
};
```

---

## 3. New API Endpoint: Get Order Status by ID

Let me add a dedicated endpoint for checking order status:

```javascript
// Backend: src/controllers/orderController.js

// @desc    Get order status by ID or order number
// @route   GET /api/orders/status/:id
// @access  Public
const getOrderStatus = async (req, res, next) => {
  try {
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id })
        .select('orderNumber status paymentStatus total subtotal tax tableNumber orderType createdAt updatedAt paidAt acceptedAt completedAt orderSource')
        .populate('table', 'tableNumber name location');
    } else {
      order = await Order.findById(req.params.id)
        .select('orderNumber status paymentStatus total subtotal tax tableNumber orderType createdAt updatedAt paidAt acceptedAt completedAt orderSource')
        .populate('table', 'tableNumber name location');
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items with item details
    const items = await OrderItem.find({ order: order._id })
      .populate('item', 'name price category image')
      .select('quantity price notes status');

    res.json({
      success: true,
      data: {
        order,
        items,
        itemCount: items.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add to exports
module.exports = {
  // ... existing exports
  getOrderStatus
};
```

---

## 4. Complete React/Vue Example

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const CustomerOrder = () => {
  const [tableInfo, setTableInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  
  // Get table ID from URL
  const tableId = new URLSearchParams(window.location.search).get('table');
  
  useEffect(() => {
    loadTableAndMenu();
    
    // Check if there's an active order
    const savedOrderId = localStorage.getItem('currentOrderId');
    if (savedOrderId) {
      loadOrderStatus(savedOrderId);
    }
  }, []);
  
  const loadTableAndMenu = async () => {
    try {
      // Load table info
      const tableRes = await fetch(`http://localhost:5000/api/tables/${tableId}`);
      const tableData = await tableRes.json();
      if (tableData.success) setTableInfo(tableData.data);
      
      // Load menu
      const menuRes = await fetch('http://localhost:5000/api/menu');
      const menuData = await menuRes.json();
      if (menuData.success) setMenuItems(menuData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  const loadOrderStatus = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/status/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setOrderStatus(data.data);
        
        // Start polling if order is not completed
        if (!['completed', 'cancelled'].includes(data.data.order.status)) {
          startStatusPolling(orderId);
        }
      }
    } catch (error) {
      console.error('Error loading order status:', error);
    }
  };
  
  const startStatusPolling = (orderId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/status/${orderId}`);
        const data = await response.json();
        if (data.success) {
          setOrderStatus(data.data);
          
          // Stop polling if completed
          if (['completed', 'cancelled'].includes(data.data.order.status)) {
            clearInterval(interval);
            localStorage.removeItem('currentOrderId');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds
  };
  
  const addToCart = (item) => {
    const existing = cart.find(i => i.item === item._id);
    if (existing) {
      setCart(cart.map(i => 
        i.item === item._id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { item: item._id, quantity: 1, price: item.price, name: item.name }]);
    }
  };
  
  const placeOrder = async () => {
    try {
      // Create order
      const orderRes = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ item: i.item, quantity: i.quantity })),
          table: tableId,
          orderType: 'dine-in',
          orderSource: 'customer',
          customerName: 'Guest',
          customerPhone: ''
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message);
      
      setOrder(orderData.data);
      
      // Process payment
      const paymentRes = await fetch(
        `http://localhost:5000/api/orders/${orderData.data.order._id}/payment/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'upi',
            transactionId: `TXN-${Date.now()}`
          })
        }
      );
      
      const paymentData = await paymentRes.json();
      if (!paymentData.success) throw new Error(paymentData.message);
      
      // Save and start tracking
      localStorage.setItem('currentOrderId', orderData.data.order._id);
      loadOrderStatus(orderData.data.order._id);
      
      alert('Order placed successfully! Payment completed.');
      setCart([]);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
  
  return (
    <div className="customer-order">
      {/* Header */}
      <header>
        <h1>Order from {tableInfo?.name}</h1>
        <p>Table #{tableInfo?.tableNumber} • {tableInfo?.location}</p>
      </header>
      
      {/* Order Status */}
      {orderStatus && (
        <div className="order-status">
          <h2>Your Order Status</h2>
          <p>Order #{orderStatus.order.orderNumber}</p>
          <div className="status-badge">{orderStatus.order.status}</div>
          <p>Items: {orderStatus.itemCount}</p>
          <p>Total: ₹{orderStatus.order.total}</p>
        </div>
      )}
      
      {/* Menu */}
      {!orderStatus && (
        <>
          <div className="menu">
            <h2>Menu</h2>
            {menuItems.map(item => (
              <div key={item._id} className="menu-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p>₹{item.price}</p>
                </div>
                <button onClick={() => addToCart(item)}>Add</button>
              </div>
            ))}
          </div>
          
          {/* Cart */}
          {cart.length > 0 && (
            <div className="cart">
              <h2>Your Cart</h2>
              {cart.map(item => (
                <div key={item.item}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <button onClick={placeOrder}>Place Order & Pay</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerOrder;
```

---

## 5. API Endpoints Summary

### Customer Order Flow APIs

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/tables/:id` | Get table info | No |
| GET | `/api/menu` | Get all menu items | No |
| GET | `/api/menu?category=:id` | Get items by category | No |
| POST | `/api/orders` | Create order | No |
| POST | `/api/orders/:id/payment/create` | Pay for order | No |
| GET | `/api/orders/status/:id` | Get order status | No |
| GET | `/api/orders/:id` | Get full order details | Yes (Admin/Cashier) |
| PUT | `/api/orders/:id` | Update order | No |
| DELETE | `/api/orders/:id` | Cancel order | No |

### Query Parameters for Orders
```
GET /api/orders?orderSource=customer&status=pending,preparing,ready
GET /api/orders?orderSource=customer&table=tableId
GET /api/orders?orderSource=customer&isTakeaway=true
```

---

## 6. Mobile-Friendly Features

### Progressive Web App (PWA) Integration
```javascript
// Check if order exists on page load
window.addEventListener('load', () => {
  const orderId = localStorage.getItem('currentOrderId');
  if (orderId) {
    // Redirect to order tracking page
    window.location.href = `/track-order?id=${orderId}`;
  }
});

// Clear order when completed
const clearCompletedOrder = () => {
  localStorage.removeItem('currentOrderId');
  localStorage.removeItem('orderNumber');
};
```

### Push Notifications (Optional)
```javascript
// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Show notification when order status changes
const notifyStatusChange = (status) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Order Update', {
      body: `Your order is now ${status}`,
      icon: '/icon.png'
    });
  }
};
```

---

## 7. Error Handling

```javascript
const handleOrderError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  
  const errorMessages = {
    'Order not found': 'This order does not exist or has been removed.',
    'Table not found': 'Invalid table. Please scan the QR code again.',
    'Order already paid': 'This order has already been paid.',
    'Item not available': 'Some items are currently unavailable.'
  };
  
  const message = errorMessages[error.message] || 'An error occurred. Please try again.';
  
  // Show user-friendly error
  alert(message);
};
```

---

## 8. Testing Checklist

- [ ] QR code scanning works
- [ ] Table info displays correctly
- [ ] Menu items load and display
- [ ] Cart functionality (add/remove items)
- [ ] Order creation succeeds
- [ ] Payment processing works
- [ ] Order status updates in real-time
- [ ] Status polling stops when order completed
- [ ] LocalStorage persists order across refreshes
- [ ] Error handling works for all scenarios
- [ ] Works on mobile devices
- [ ] Network errors handled gracefully

---

## Next Steps

1. Implement the new `/api/orders/status/:id` endpoint (code provided above)
2. Add the endpoint to your routes file
3. Build your frontend using the examples above
4. Test the complete flow from QR scan to order completion
5. Add analytics tracking for customer orders

---

## Support

For issues or questions about the API integration, refer to:
- `KORA_POS_API_GUIDE.md` - Complete API documentation
- `ORDER_SOURCE_GUIDE.md` - Customer vs Cashier order differences
- `API_EXAMPLES.md` - More code examples
