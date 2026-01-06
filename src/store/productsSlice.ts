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
  async (id: string) => {
    await productsAPI.delete(id);
    return id;
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
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete product (soft delete)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const product = state.items.find(p => p.id === action.payload);
        if (product) {
          product.status = 'Inactive';
          product.updatedAt = new Date().toISOString();
        }
      });
  },
});

export const { toggleProductStatus } = productsSlice.actions;
export default productsSlice.reducer;

