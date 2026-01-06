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
  async ({ id, status }: { id: string; status: Order['status'] }) => {
    return await ordersAPI.update(id, { status });
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
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default ordersSlice.reducer;

