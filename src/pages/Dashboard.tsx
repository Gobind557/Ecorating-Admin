import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import { fetchOrders } from '../store/ordersSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state) => state.products);
  const { items: orders } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, products.length, orders.length]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'Active').length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const revenue = orders
      .filter(o => o.status === 'Completed')
      .reduce((sum, order) => sum + order.total, 0);

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      revenue: parseFloat(revenue.toFixed(2)),
    };
  }, [products, orders]);

  // Prepare orders per day data (last 14 days)
  const ordersPerDay = useMemo(() => {
    const days: { [key: string]: number } = {};
    const today = new Date();
    
    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days[dateStr] = 0;
    }

    // Count orders per day
    orders.forEach(order => {
      const orderDate = order.createdAt.split('T')[0];
      if (days[orderDate] !== undefined) {
        days[orderDate]++;
      }
    });

    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: count,
    }));
  }, [orders]);

  // Prepare order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Pending', value: statusCounts['Pending'] || 0 },
      { name: 'Completed', value: statusCounts['Completed'] || 0 },
      { name: 'Cancelled', value: statusCounts['Cancelled'] || 0 },
    ].filter(item => item.value > 0);
  }, [orders]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">${stats.revenue}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders per day chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders per Day (Last 14 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

