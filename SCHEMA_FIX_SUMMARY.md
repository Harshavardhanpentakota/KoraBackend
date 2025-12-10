# Schema Fixes - December 10, 2025

## Issues Fixed

### 1. Order `tableNumber` Field Not Populated
**Problem:** When creating orders, the `tableNumber` field was returning `null` even when a table was associated with the order.

**Root Cause:** The Order model had a `tableNumber` field for historical tracking, but it wasn't being automatically populated from the referenced table document.

**Solution:** Added logic to the Order model's pre-save hook to automatically fetch and populate `tableNumber` from the referenced table:

```javascript
// Populate tableNumber from table reference if table is provided
if (this.table && this.isModified('table')) {
  try {
    const Table = mongoose.model('Table');
    const table = await Table.findById(this.table);
    if (table) {
      this.tableNumber = table.tableNumber;
    }
  } catch (error) {
    console.error('Error populating tableNumber:', error);
  }
}
```

**Files Modified:**
- `src/models/Order.js` - Updated pre-save hook

---

### 2. Redundant `seats` Field in Table Schema
**Problem:** The Table schema had both `seats` and `capacity` fields serving the same purpose, causing confusion and redundant data.

**Example of redundancy:**
```json
{
  "seats": 4,
  "capacity": 4,
  "_id": "692b3dd54f37a4fed104b2ab"
}
```

**Solution:** 
1. Removed the `seats` field from the Table schema
2. Made `capacity` the primary field with proper validation and default value
3. Updated seed data to only use `capacity`
4. Removed the pre-save hook that synced seats to capacity

**Files Modified:**
- `src/models/Table.js` - Removed `seats` field, updated pre-save hook
- `src/utils/seed.js` - Removed `seats` from table seed data

---

## Updated Table Schema

```javascript
{
  tableNumber: Number (required, unique),
  name: String (required),
  capacity: Number (required, min: 1, default: 4),  // Single field for seating capacity
  status: String (enum: free, available, occupied, reserved, maintenance, waiting),
  currentOrder: ObjectId (ref: 'Order'),
  qrCode: String,
  location: String,
  isActive: Boolean
}
```

---

## Updated Order Schema Behavior

When creating an order with a table reference:

**Before:**
```json
{
  "table": "692b3dd54f37a4fed104b2ac",
  "tableNumber": null  // ❌ Not populated
}
```

**After:**
```json
{
  "table": "692b3dd54f37a4fed104b2ac",
  "tableNumber": 3  // ✅ Automatically populated from table.tableNumber
}
```

---

## API Response Changes

### GET /api/tables

**Before:**
```json
{
  "seats": 4,
  "capacity": 4,
  "tableNumber": 3
}
```

**After:**
```json
{
  "capacity": 4,
  "tableNumber": 3
}
```

### POST /api/orders (Response)

**Before:**
```json
{
  "tableNumber": null,
  "table": "692b3dd54f37a4fed104b2ac"
}
```

**After:**
```json
{
  "tableNumber": 3,
  "table": "692b3dd54f37a4fed104b2ac"
}
```

---

## Migration Notes

### For Existing Databases

If you have existing table records with the `seats` field, they will be ignored. The schema now only recognizes `capacity`.

**To clean up existing data:**

```javascript
// MongoDB shell or script
db.tables.updateMany(
  {},
  { $unset: { seats: "" } }
);
```

### For Frontend Integration

Update your frontend code to:
1. Remove references to `table.seats`
2. Use `table.capacity` instead
3. Expect `order.tableNumber` to be populated automatically when a table is assigned

---

## Testing

Database has been reseeded with the updated schema. All tables now only have the `capacity` field, and new orders will automatically populate the `tableNumber` field.

**Test Commands:**
```bash
# Reseed database (already done)
node src/utils/seed.js

# Test order creation with table
# POST /api/orders
# Body: { "table": "<tableId>", "items": [...], ... }
# Response should include populated tableNumber
```

---

## Summary

✅ **Fixed:** `tableNumber` now automatically populates from referenced table  
✅ **Removed:** Redundant `seats` field from Table schema  
✅ **Simplified:** Single `capacity` field for table seating  
✅ **Updated:** Seed data to reflect schema changes  
✅ **Database:** Reseeded successfully with corrected structure
