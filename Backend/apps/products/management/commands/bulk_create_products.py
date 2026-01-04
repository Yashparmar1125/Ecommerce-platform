"""
Django management command to bulk create products from JSON file.

Usage:
    python manage.py bulk_create_products --file products.json
    python manage.py bulk_create_products --file products.json --dry-run
    python manage.py bulk_create_products --file products.json --update-existing
"""

import json
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.products.models import (
    Product, Category, ProductImage, ProductSKU, ProductAttribute
)


class Command(BaseCommand):
    help = 'Bulk create products from a JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            required=True,
            help='Path to JSON file containing products data'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Validate data without creating products'
        )
        parser.add_argument(
            '--update-existing',
            action='store_true',
            help='Update existing products if they already exist (by name)'
        )
        parser.add_argument(
            '--skip-errors',
            action='store_true',
            help='Continue processing even if some products fail'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        dry_run = options['dry_run']
        update_existing = options['update_existing']
        skip_errors = options['skip_errors']

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except json.JSONDecodeError as e:
            raise CommandError(f'Invalid JSON file: {e}')

        # Support both single product object and array of products
        if isinstance(data, dict):
            products_data = [data]
        elif isinstance(data, list):
            products_data = data
        else:
            raise CommandError('JSON file must contain either a single product object or an array of products')

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No products will be created'))

        created_count = 0
        updated_count = 0
        error_count = 0
        errors = []

        for idx, product_data in enumerate(products_data, 1):
            try:
                if dry_run:
                    self.validate_product_data(product_data)
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Product {idx}: {product_data.get("name", "Unknown")} - Valid')
                    )
                else:
                    product, was_created = self.create_or_update_product(
                        product_data, update_existing
                    )
                    if was_created:
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'✓ Created: {product.name}')
                        )
                    else:
                        updated_count += 1
                        self.stdout.write(
                            self.style.WARNING(f'↻ Updated: {product.name}')
                        )
            except Exception as e:
                error_count += 1
                error_msg = f'Product {idx} ({product_data.get("name", "Unknown")}): {str(e)}'
                errors.append(error_msg)
                
                if skip_errors:
                    self.stdout.write(
                        self.style.ERROR(f'✗ {error_msg}')
                    )
                else:
                    raise CommandError(error_msg)

        # Summary
        self.stdout.write('\n' + '=' * 50)
        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'Validation complete: {len(products_data)} products validated'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Created: {created_count} products'))
            if update_existing:
                self.stdout.write(self.style.WARNING(f'Updated: {updated_count} products'))
            self.stdout.write(self.style.ERROR(f'Errors: {error_count} products'))
        
        if errors and skip_errors:
            self.stdout.write('\nErrors encountered:')
            for error in errors:
                self.stdout.write(self.style.ERROR(f'  - {error}'))

    def validate_product_data(self, product_data):
        """Validate product data structure"""
        required_fields = ['name', 'summary', 'description']
        for field in required_fields:
            if field not in product_data or not product_data[field]:
                raise ValueError(f'Missing required field: {field}')

    @transaction.atomic
    def create_or_update_product(self, product_data, update_existing=False):
        """Create or update a product with all related data"""
        # Get or create category
        category = None
        if product_data.get('category'):
            category_name = product_data['category']
            if isinstance(category_name, dict):
                category_name = category_name.get('name', category_name.get('id'))
            
            category, _ = Category.objects.get_or_create(
                name=category_name,
                defaults={
                    'description': product_data.get('category_description', '')
                }
            )

        # Check if product exists
        product = None
        was_created = True
        
        if update_existing:
            try:
                product = Product.objects.get(name=product_data['name'])
                was_created = False
            except Product.DoesNotExist:
                pass

        # Create or update product
        product_data_dict = {
            'name': product_data['name'],
            'summary': product_data['summary'],
            'description': product_data['description'],
            'category': category,
            'cover': product_data.get('cover', ''),
            'original_price': Decimal(product_data['original_price']) if product_data.get('original_price') else None,
            'featured': product_data.get('featured', False),
            'in_stock': product_data.get('in_stock', True),
        }

        if was_created:
            product = Product.objects.create(**product_data_dict)
        else:
            for key, value in product_data_dict.items():
                setattr(product, key, value)
            product.save()

        # Handle images
        if product_data.get('images'):
            if not update_existing or was_created:
                # Delete existing images only if creating new product
                ProductImage.objects.filter(product=product).delete()
            
            for idx, image_url in enumerate(product_data.get('images', [])):
                ProductImage.objects.create(
                    product=product,
                    image_url=image_url,
                    order=idx
                )

        # Handle SKUs
        if product_data.get('skus'):
            if not update_existing or was_created:
                # Delete existing SKUs only if creating new product
                ProductSKU.objects.filter(product=product).delete()
            
            for sku_data in product_data.get('skus', []):
                size_attr = None
                color_attr = None

                # Get or create size attribute
                if sku_data.get('size'):
                    size_attr, _ = ProductAttribute.objects.get_or_create(
                        type=ProductAttribute.SIZE,
                        value=sku_data['size']
                    )

                # Get or create color attribute
                if sku_data.get('color'):
                    color_attr, _ = ProductAttribute.objects.get_or_create(
                        type=ProductAttribute.COLOR,
                        value=sku_data['color']
                    )

                ProductSKU.objects.create(
                    product=product,
                    sku=sku_data['sku'],
                    price=Decimal(str(sku_data['price'])),
                    quantity=sku_data.get('quantity', 0),
                    size_attribute=size_attr,
                    color_attribute=color_attr,
                )

        return product, was_created



