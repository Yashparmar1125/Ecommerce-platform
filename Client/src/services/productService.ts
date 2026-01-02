import type { Product } from '../types'

// Mock product data using actual assets
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Deluxe Steel Tail Casual T-Shirt',
    description: 'Premium cotton blend t-shirt with a relaxed fit. Perfect for everyday wear.',
    price: 18.00,
    originalPrice: 20.00,
    images: [
      '/assets/images/products/clothes-1.jpg',
      '/assets/images/products/clothes-2.jpg',
    ],
    category: 'Fashion',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Pink', 'White', 'Black'],
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Running & Training Shoes',
    description: 'High-performance running shoes with superior cushioning and support.',
    price: 100.00,
    originalPrice: 120.00,
    images: [
      '/assets/images/products/shoe-1.jpg',
      '/assets/images/products/shoe-2.jpg',
    ],
    category: 'Sports & Outdoors',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black', 'Grey'],
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Black Leather Women\'s Jacket',
    description: 'Stylish black leather jacket with modern design. Perfect for any occasion.',
    price: 70.00,
    originalPrice: 80.00,
    images: [
      '/assets/images/products/jacket-1.jpg',
      '/assets/images/products/jacket-2.jpg',
    ],
    category: 'Fashion',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown'],
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Women\'s Party Wear Shoes',
    description: 'Elegant high heels perfect for parties and special occasions.',
    price: 40.00,
    originalPrice: 50.00,
    images: [
      '/assets/images/products/party-wear-1.jpg',
      '/assets/images/products/party-wear-2.jpg',
    ],
    category: 'Fashion',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['Beige', 'Black', 'Red'],
    inStock: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Men\'s Winter Warm Hoodies',
    description: 'Cozy winter hoodie with premium fleece lining. Perfect for cold weather.',
    price: 80.00,
    originalPrice: 90.00,
    images: [
      '/assets/images/products/jacket-3.jpg',
      '/assets/images/products/jacket-4.jpg',
    ],
    category: 'Fashion',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Black', 'Grey'],
    inStock: true,
    featured: true,
  },
  {
    id: '6',
    name: 'Sports & Skate Winter Shoes',
    description: 'Durable skate shoes designed for performance and style.',
    price: 60.00,
    originalPrice: 70.00,
    images: [
      '/assets/images/products/sports-1.jpg',
      '/assets/images/products/sports-2.jpg',
    ],
    category: 'Sports & Outdoors',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Black', 'White'],
    inStock: true,
    featured: true,
  },
  {
    id: '7',
    name: 'Fashionable Leather Pouch',
    description: 'Elegant leather pouch with premium craftsmanship.',
    price: 80.00,
    originalPrice: 100.00,
    images: [
      '/assets/images/products/watch-1.jpg',
      '/assets/images/products/watch-2.jpg',
    ],
    category: 'Fashion',
    sizes: ['One Size'],
    colors: ['Brown', 'Black'],
    inStock: true,
  },
  {
    id: '8',
    name: 'Silver Stone Heart Necklace',
    description: 'Beautiful silver necklace with heart pendant. Perfect gift.',
    price: 30.00,
    originalPrice: 40.00,
    images: [
      '/assets/images/products/jewellery-1.jpg',
      '/assets/images/products/jewellery-2.jpg',
    ],
    category: 'Fashion',
    sizes: ['One Size'],
    colors: ['Silver', 'Gold'],
    inStock: true,
  },
  {
    id: '9',
    name: 'Luxury Women\'s Perfume',
    description: 'Elegant fragrance with floral and woody notes.',
    price: 45.00,
    originalPrice: 50.00,
    images: [
      '/assets/images/products/perfume.jpg',
      '/assets/images/products/perfume.jpg',
    ],
    category: 'Health & Beauty',
    sizes: ['50ml', '100ml'],
    colors: ['One Color'],
    inStock: true,
  },
  {
    id: '10',
    name: 'Black Leather Women\'s Wallet',
    description: 'Compact wallet with multiple card slots and coin pocket.',
    price: 24.00,
    originalPrice: 30.00,
    images: [
      '/assets/images/products/belt.jpg',
      '/assets/images/products/belt.jpg',
    ],
    category: 'Fashion',
    sizes: ['One Size'],
    colors: ['Black', 'Brown'],
    inStock: true,
  },
  {
    id: '11',
    name: 'Men\'s Winter Jacket, Cotton',
    description: 'Warm and stylish winter jacket made from premium cotton.',
    price: 100.00,
    originalPrice: 120.00,
    images: [
      '/assets/images/products/jacket-5.jpg',
      '/assets/images/products/jacket-6.jpg',
    ],
    category: 'Fashion',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Grey', 'Brown', 'Navy'],
    inStock: true,
    featured: true,
  },
  {
    id: '12',
    name: 'Men\'s Fashion New Casual Shirt',
    description: 'Modern casual shirt with contemporary design.',
    price: 40.00,
    originalPrice: 50.00,
    images: [
      '/assets/images/products/shirt-1.jpg',
      '/assets/images/products/shirt-2.jpg',
    ],
    category: 'Fashion',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'White', 'Grey'],
    inStock: true,
    featured: true,
  },
]

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve(mockProducts), 500))
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    return mockProducts.find(p => p.id === id)
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    return mockProducts.filter(p => p.featured)
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    return mockProducts.filter(p => p.category === category)
  },
}
