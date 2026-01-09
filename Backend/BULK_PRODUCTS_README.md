# Bulk Product Creation Script

This Django management command allows you to bulk create products from a JSON file.

## Usage

### Basic Usage

```bash
python manage.py bulk_create_products --file products.json
```

### Dry Run (Validate without creating)

```bash
python manage.py bulk_create_products --file products.json --dry-run
```

### Update Existing Products

```bash
python manage.py bulk_create_products --file products.json --update-existing
```

### Skip Errors and Continue

```bash
python manage.py bulk_create_products --file products.json --skip-errors
```

## JSON File Format

The JSON file can contain either:
- A single product object
- An array of product objects

### Product Object Structure

```json
{
  "name": "Product Name",
  "summary": "Short product summary",
  "description": "Detailed product description",
  "category": "Category Name",
  "cover": "https://example.com/cover-image.jpg",
  "original_price": 99.99,
  "featured": true,
  "in_stock": true,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "skus": [
    {
      "sku": "PROD-001",
      "price": 99.99,
      "quantity": 50,
      "size": "Large",
      "color": "Red"
    }
  ]
}
```

### Required Fields
- `name` - Product name
- `summary` - Product summary (max 500 chars)
- `description` - Product description

### Optional Fields
- `category` - Category name (will be created if doesn't exist)
- `cover` - Cover image URL
- `original_price` - Original price (decimal)
- `featured` - Whether product is featured (boolean, default: false)
- `in_stock` - Whether product is in stock (boolean, default: true)
- `images` - Array of image URLs
- `skus` - Array of SKU objects

### SKU Object Structure
- `sku` - SKU code (required, must be unique)
- `price` - Price (required, decimal)
- `quantity` - Quantity in stock (required, integer)
- `size` - Size attribute (optional, will create if doesn't exist)
- `color` - Color attribute (optional, will create if doesn't exist)

## Examples

### Example 1: Simple Product

```json
{
  "name": "Basic T-Shirt",
  "summary": "A simple t-shirt",
  "description": "Comfortable cotton t-shirt",
  "category": "Clothing",
  "original_price": 19.99,
  "in_stock": true
}
```

### Example 2: Product with Images and SKUs

```json
{
  "name": "Premium Headphones",
  "summary": "High-quality wireless headphones",
  "description": "Premium wireless headphones with noise cancellation",
  "category": "Electronics",
  "cover": "https://example.com/headphones.jpg",
  "original_price": 199.99,
  "featured": true,
  "in_stock": true,
  "images": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "skus": [
    {
      "sku": "HP-001",
      "price": 199.99,
      "quantity": 25,
      "color": "Black"
    },
    {
      "sku": "HP-002",
      "price": 199.99,
      "quantity": 20,
      "color": "White"
    }
  ]
}
```

## Features

- ✅ Bulk create products from JSON
- ✅ Automatic category creation
- ✅ Product images support
- ✅ SKU management with size/color attributes
- ✅ Dry-run mode for validation
- ✅ Update existing products
- ✅ Error handling with detailed messages
- ✅ Skip errors option for batch processing
- ✅ Transaction support (all or nothing)

## Sample File

A sample JSON file (`products_sample.json`) is included in the Backend directory for reference.

## Notes

- Categories are automatically created if they don't exist
- Size and Color attributes are automatically created if they don't exist
- SKU codes must be unique across all products
- When using `--update-existing`, products are matched by name
- All operations are wrapped in transactions for data integrity








