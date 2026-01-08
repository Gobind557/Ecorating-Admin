import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import ordersReducer from './ordersSlice';

/**
 * Persistence helpers - only persist products and orders data, not loading/error states
 * 
 * IMPORTANT: 
 * - Only data (items arrays) are persisted to localStorage
 * - Loading flags and error states are NOT persisted (reset on reload)
 * - On app start, state is rehydrated from localStorage if available
 * - Soft deletes (status change to Inactive) ARE persisted - product stays in array
 */

// Check if we have persisted state in localStorage
export const hasPersistedState = (): boolean => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    return serializedState !== null;
  } catch {
    return false;
  }
};

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState);
    // Only restore persisted keys, filter out loading/error states
    // This ensures loading flags and transient UI state are NOT persisted
    return {
      products: {
        items: state.products?.items || [],
        loading: false, // Always reset loading state on reload
        error: null,    // Always reset error state on reload
      },
      orders: {
        items: state.orders?.items || [],
        loading: false, // Always reset loading state on reload
        error: null,   // Always reset error state on reload
      },
    };
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

export const saveState = (state: RootState) => {
  try {
    // Only persist the data we care about, not loading/error states
    // This ensures transient UI state is NOT persisted
    const stateToPersist = {
      products: {
        items: state.products.items, // Only persist data, not loading/error
      },
      orders: {
        items: state.orders.items, // Only persist data, not loading/error
      },
    };
    localStorage.setItem('reduxState', JSON.stringify(stateToPersist));
    // Note: Soft deletes (status: 'Inactive') ARE persisted - product stays in array
    // This is by design - soft delete means mark as inactive, not remove
  } catch (err) {
    console.error('Error saving state:', err);
    // Ignore write errors (e.g., localStorage quota exceeded)
  }
};

export const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
  },
  preloadedState: loadState(),
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

