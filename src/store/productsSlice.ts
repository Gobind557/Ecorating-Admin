import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../types';
import { productsAPI } from '../mock/api';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async () => {
    return await productsAPI.getAll();
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await productsAPI.create(product);
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
    return await productsAPI.update(id, updates);
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { getState }) => {
    await productsAPI.delete(id);
    // Get current product status to determine soft vs hard delete
    const state = getState() as { products: ProductsState };
    const product = state.products.items.find(p => p.id === id);
    return { id, currentStatus: product?.status };
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Synchronous actions if needed
    toggleProductStatus: (state, action: PayloadAction<string>) => {
      const product = state.items.find(p => p.id === action.payload);
      if (product) {
        product.status = product.status === 'Active' ? 'Inactive' : 'Active';
        product.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Create product
      // New product is automatically persisted to localStorage via store.subscribe()
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        // State change triggers saveState() which persists to localStorage
      })
      // Update product
      // Update is automatically persisted to localStorage via store.subscribe()
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          // State change triggers saveState() which persists to localStorage
        }
      })
      // Delete product
      // If product is Active → Soft delete (mark as Inactive, keep in array)
      // If product is Inactive → Hard delete (remove from array completely)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const { id, currentStatus } = action.payload;
        const productIndex = state.items.findIndex(p => p.id === id);
        
        if (productIndex === -1) return;
        
        if (currentStatus === 'Active') {
          // Soft delete: mark as Inactive
          state.items[productIndex].status = 'Inactive';
          state.items[productIndex].updatedAt = new Date().toISOString();
          // Product stays in array, just marked inactive
        } else {
          // Hard delete: remove from array completely
          state.items.splice(productIndex, 1);
          // Product is removed from array and localStorage
        }
        // State change triggers saveState() which persists to localStorage
      });
  },
});

export const { toggleProductStatus } = productsSlice.actions;
export default productsSlice.reducer;

