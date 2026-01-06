import productsData from './products.json';
import ordersData from './orders.json';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: 'Active' | 'Inactive';
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  createdAt: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = () => delay(Math.floor(Math.random() * 500) + 300); // 300-800ms

// Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    await randomDelay();
    return JSON.parse(JSON.stringify(productsData)) as Product[];
  },

  getById: async (id: string): Promise<Product | null> => {
    await randomDelay();
    const products = JSON.parse(JSON.stringify(productsData)) as Product[];
    return products.find(p => p.id === id) || null;
  },

  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    await randomDelay();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newProduct;
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    await randomDelay();
    const products = JSON.parse(JSON.stringify(productsData)) as Product[];
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    
    return {
      ...product,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
  },

  delete: async (_id: string): Promise<void> => {
    await randomDelay();
    // Soft delete - just return success
    return Promise.resolve();
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    await randomDelay();
    return JSON.parse(JSON.stringify(ordersData)) as Order[];
  },

  getById: async (id: string): Promise<Order | null> => {
    await randomDelay();
    const orders = JSON.parse(JSON.stringify(ordersData)) as Order[];
    return orders.find(o => o.id === id) || null;
  },

  create: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    await randomDelay();
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return newOrder;
  },

  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    await randomDelay();
    const orders = JSON.parse(JSON.stringify(ordersData)) as Order[];
    const order = orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    
    return {
      ...order,
      ...updates,
      id,
    };
  },
};

