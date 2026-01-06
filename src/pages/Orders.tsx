import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import { fetchOrders, createOrder, updateOrderStatus } from '../store/ordersSlice';
import type { Product, Order, CartItem } from '../types';

export default function Orders() {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state) => state.products);
  const { items: orders, loading } = useAppSelector((state) => state.orders);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, products.length, orders.length]);

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  // Get active products for cart
  const activeProducts = useMemo(() => {
    return products.filter(p => p.status === 'Active');
  }, [products]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    await dispatch(createOrder({
      customerName: customerName.trim(),
      items: orderItems,
      total: cartTotal,
      status: 'Pending',
    }));

    setCart([]);
    setCustomerName('');
    alert('Order placed successfully!');
  }, [dispatch, cart, customerName, cartTotal]);

  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: 'Completed' | 'Cancelled') => {
    await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
  }, [dispatch]);

  const handleViewDetails = useCallback((order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Orders</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded border flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded border flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="ml-auto font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || !customerName.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Order
              </button>
            </div>
          </div>

          {/* Products List for Cart */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Add Products</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activeProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Orders</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No orders found</div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                        <p className="font-semibold mt-2">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                      {order.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'Completed')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                  selectedOrder.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : selectedOrder.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total:</td>
                        <td className="px-4 py-2 font-semibold">${selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

