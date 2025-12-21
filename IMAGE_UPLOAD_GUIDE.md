# Image Upload Implementation Guide

## Overview
Image upload functionality has been implemented for menu items. Images are saved to `public/images/` folder and the file path is stored in the database.

## Implementation Details

### 1. Multer Configuration
- **File**: `src/middlewares/upload.js`
- **Storage**: `public/images/`
- **Allowed formats**: jpeg, jpg, png, gif, webp
- **Max file size**: 5MB
- **Filename format**: `item-{timestamp}-{random}-{extension}`

### 2. Updated Routes
- **POST** `/api/admin/menu` - Create item with image
- **PUT** `/api/admin/menu/:id` - Update item with image
- **DELETE** `/api/admin/menu/:id` - Delete item and associated image

### 3. Features
- ✅ Automatic image upload and storage
- ✅ Old image deletion when updating
- ✅ Image deletion when item is deleted
- ✅ Error handling with automatic cleanup
- ✅ File type validation
- ✅ File size validation (5MB limit)
- ✅ Static file serving for image access

## API Usage

### Creating Item with Image

**Endpoint**: `POST /api/admin/menu`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data**:
```
name: "Special Items"
description: "Kora Pos"
category: "69397fffe776aa39ba7ea1c7"
price: 200
isVeg: true
isAvailable: true
preparationTime: 5
image: (file upload)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Special Items",
    "description": "Kora Pos",
    "category": {
      "_id": "69397fffe776aa39ba7ea1c7",
      "name": "..."
    },
    "price": 200,
    "isVeg": true,
    "isAvailable": true,
    "preparationTime": 5,
    "image": "/images/item-1734567890123-123456789.jpg",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Updating Item with New Image

**Endpoint**: `PUT /api/admin/menu/:id`

**Form Data** (same as create, all fields optional):
```
name: "Updated Item"
image: (new file upload)
```

**Note**: When uploading a new image, the old image is automatically deleted.

### Accessing Images

Images are accessible via:
```
http://your-domain/images/item-1734567890123-123456789.jpg
```

Or in your frontend:
```javascript
const imageUrl = `${API_BASE_URL}${item.image}`;
// Example: http://localhost:5000/images/item-1734567890123-123456789.jpg
```

## Frontend Integration

### Using Axios (React Example)

```javascript
const createItem = async (formData) => {
  const data = new FormData();
  data.append('name', formData.name);
  data.append('description', formData.description);
  data.append('category', formData.category);
  data.append('price', formData.price);
  data.append('isVeg', formData.isVeg);
  data.append('isAvailable', formData.isAvailable);
  data.append('preparationTime', formData.preparationTime);
  
  // Image file from input
  if (formData.image) {
    data.append('image', formData.image);
  }

  const response = await axios.post('/api/admin/menu', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

### Using Fetch API

```javascript
const createItem = async (formData) => {
  const data = new FormData();
  data.append('name', formData.name);
  data.append('category', formData.category);
  data.append('price', formData.price);
  data.append('image', formData.imageFile); // File object from input

  const response = await fetch('http://localhost:5000/api/admin/menu', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type, browser will set it with boundary
    },
    body: data
  });

  return await response.json();
};
```

### HTML Form Example

```html
<form id="itemForm" enctype="multipart/form-data">
  <input type="text" name="name" required>
  <input type="text" name="description">
  <select name="category" required>
    <option value="69397fffe776aa39ba7ea1c7">Category 1</option>
  </select>
  <input type="number" name="price" required>
  <select name="isVeg">
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
  <input type="file" name="image" accept="image/*">
  <button type="submit">Create Item</button>
</form>
```

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Category is required",
      "path": "category",
      "location": "body"
    }
  ]
}
```

### File Upload Errors
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

### File Size Error
```json
{
  "success": false,
  "message": "File too large"
}
```

## Testing with Postman

1. Create new request: `POST http://localhost:5000/api/admin/menu`
2. Set Authorization: Bearer Token
3. Select Body → form-data
4. Add fields:
   - name (Text): "Special Items"
   - description (Text): "Kora Pos"
   - category (Text): "69397fffe776aa39ba7ea1c7"
   - price (Text): "200"
   - isVeg (Text): "true"
   - isAvailable (Text): "true"
   - preparationTime (Text): "5"
   - image (File): Select your image file
5. Send request

## Important Notes

1. **Image is optional** - Items can be created without images
2. **Old images are auto-deleted** - When updating with new image or deleting item
3. **Error cleanup** - If item creation fails, uploaded image is automatically deleted
4. **Static serving** - Images are served from `/images/` path
5. **Security** - Only authenticated admin/cashier users can upload images
6. **File validation** - Only image files under 5MB are accepted

## Troubleshooting

### Issue: Category validation error
**Solution**: Ensure category is a valid 24-character MongoDB ObjectId

### Issue: Image not uploading
**Solution**: 
- Check Content-Type is `multipart/form-data`
- Verify file field name is exactly `image`
- Check file size is under 5MB
- Verify file type is supported image format

### Issue: Can't access uploaded images
**Solution**:
- Ensure server is serving static files (already configured)
- Check image path in database starts with `/images/`
- Verify public/images folder exists and has write permissions

## File Structure
```
KoraBackend/
├── public/
│   └── images/                    # Uploaded images stored here
│       ├── .gitkeep              # Keeps directory in git
│       └── item-*.jpg/png/...    # Uploaded image files
├── src/
│   ├── controllers/
│   │   └── menuController.js     # Updated with image handling
│   ├── middlewares/
│   │   ├── upload.js             # New: Multer configuration
│   │   └── validation.js         # Updated validations
│   ├── routes/
│   │   └── menuRoutes.js         # Updated with upload middleware
│   └── server.js                 # Updated to serve static files
```
