# Backend Features Summary

## New Models Created

### 1. ProductDetail (`apps/products/models.py`)
- Stores additional product information:
  - `material`: Product material composition
  - `care_instructions`: Care and washing instructions
  - `fit`: Fit type (e.g., Regular Fit, Slim Fit)
  - `brand`: Product brand name
- One-to-one relationship with Product

### 2. ProductReview (`apps/products/models.py`)
- Stores product reviews and ratings:
  - `product`: Foreign key to Product
  - `user`: Foreign key to User
  - `rating`: Integer from 1 to 5
  - `title`: Optional review title
  - `comment`: Review text
  - `is_verified_purchase`: Boolean flag for verified purchases
  - `helpful_count`: Number of users who found review helpful
- Unique constraint: One review per user per product

### 3. Coupon (`apps/products/models.py`)
- Stores discount coupons:
  - `code`: Unique coupon code
  - `description`: Coupon description
  - `discount_type`: 'percentage' or 'fixed'
  - `discount_value`: Discount amount/percentage
  - `min_purchase_amount`: Minimum purchase required
  - `max_discount_amount`: Maximum discount (for percentage)
  - `is_active`: Active status
  - `valid_from` / `valid_until`: Validity period
  - `usage_limit`: Maximum usage count (null = unlimited)
  - `used_count`: Current usage count
- Methods:
  - `is_valid()`: Check if coupon is currently valid
  - `calculate_discount(amount)`: Calculate discount for given amount

### 4. CouponUsage (`apps/products/models.py`)
- Tracks coupon usage by users:
  - `coupon`: Foreign key to Coupon
  - `user`: Foreign key to User
  - `order`: Foreign key to Order (optional)
  - `discount_amount`: Discount applied
  - `used_at`: Timestamp

## New API Endpoints

### Product Reviews

1. **GET `/api/v1/products/<product_id>/reviews/`**
   - List all reviews for a product
   - Public endpoint (no authentication required)
   - Returns: `{ "count": number, "data": [...] }`

2. **POST `/api/v1/products/<product_id>/reviews/create/`**
   - Create a new review
   - Requires authentication
   - Request body: `{ "rating": 1-5, "title": "...", "comment": "..." }`
   - Automatically checks if user purchased product (verified purchase badge)
   - Returns: `{ "data": {...}, "message": "..." }`

3. **POST `/api/v1/products/reviews/<review_id>/helpful/`**
   - Mark a review as helpful
   - Requires authentication
   - Increments helpful_count
   - Returns: `{ "data": {...}, "message": "..." }`

### Coupons

1. **GET `/api/v1/products/coupons/`**
   - List all active and valid coupons
   - Public endpoint
   - Returns: `{ "count": number, "data": [...] }`

2. **POST `/api/v1/products/coupons/validate/`**
   - Validate and calculate discount for a coupon
   - Requires authentication
   - Request body: `{ "code": "...", "amount": decimal }`
   - Returns: `{ "data": { "coupon": {...}, "discount_amount": decimal, "message": "..." } }`

## Updated Endpoints

### Product Detail (`GET /api/v1/products/<product_id>/`)
- Now includes:
  - `details`: ProductDetail data (material, care, fit, brand)
  - `review_summary`: Average rating, total ratings/reviews, rating breakdown
  - `recent_reviews`: Top 5 most helpful reviews

## Serializers

### ProductReviewSerializer
- Includes user name (masked email for privacy)
- Fields: id, user, user_name, user_email, rating, title, comment, is_verified_purchase, helpful_count, created_at, updated_at

### ProductReviewCreateSerializer
- Validates rating (1-5)
- Automatically sets user from request context

### CouponSerializer
- Includes `is_valid` computed field
- All coupon fields

### CouponValidateSerializer
- Validates coupon code
- Checks validity, expiry, usage limits
- Calculates discount amount

### Updated ProductSerializer
- Added `details` field (ProductDetailSerializer)
- Added `review_summary` field (computed statistics)

## Admin Interface

All new models are registered in Django admin:
- ProductDetail
- ProductReview
- Coupon
- CouponUsage

## Database Migrations

Run the following commands to create and apply migrations:

```bash
cd Backend
python manage.py makemigrations products
python manage.py migrate
```

## Usage Examples

### Creating a Review
```python
POST /api/v1/products/1/reviews/create/
Headers: Authorization: Bearer <token>
Body: {
    "rating": 5,
    "title": "Great product!",
    "comment": "Perfectly matched with image. Great quality!"
}
```

### Validating a Coupon
```python
POST /api/v1/products/coupons/validate/
Headers: Authorization: Bearer <token>
Body: {
    "code": "NFLAT10",
    "amount": 1000.00
}
Response: {
    "data": {
        "coupon": {...},
        "discount_amount": 100.00,
        "message": "Coupon applied successfully"
    }
}
```

## Notes

- Reviews are automatically marked as "verified purchase" if user has ordered the product
- Coupon validation checks:
  - Code exists and is active
  - Current date is within validity period
  - Usage limit not exceeded
  - Purchase amount meets minimum requirement
- Product review summary is computed on-the-fly for performance
- Email addresses in reviews are masked for privacy (e.g., j***n@example.com)




