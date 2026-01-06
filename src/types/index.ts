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

export interface CartItem {
  product: Product;
  quantity: number;
}

