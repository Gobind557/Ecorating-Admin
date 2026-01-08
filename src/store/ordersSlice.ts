import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Order } from '../types';
import { ordersAPI } from '../mock/api';

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async () => {
    return await ordersAPI.getAll();
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (order: Omit<Order, 'id' | 'createdAt'>) => {
    return await ordersAPI.create(order);
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }: { id: string; status: Order['status'] }, { getState }) => {
    // For mock API, we need to handle both:
    // 1. Orders from JSON files (original seed data)
    // 2. Newly created orders (only in Redux state)
    // 
    // Try to update via API first (for orders from JSON)
    // If order not found in JSON, it's a newly created order
    // In that case, we'll handle it directly in the reducer
    try {
      return await ordersAPI.update(id, { status });
    } catch (error) {
      // Order not found in JSON - it's a newly created order
      // Return the update data so reducer can handle it
      const state = getState() as { orders: OrdersState };
      const order = state.orders.items.find((o: Order) => o.id === id);
      if (!order) {
        throw new Error('Order not found');
      }
      // Return updated order for reducer to handle
      return {
        ...order,
        status,
      };
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Create order
      // New order is automatically persisted to localStorage via store.subscribe()
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.push(action.payload);
        // State change triggers saveState() which persists to localStorage
      })
      // Update order status
      // Handles both orders from JSON and newly created orders
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          // State change will trigger saveState() to persist to localStorage
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update order status';
      });
  },
});

export default ordersSlice.reducer;

