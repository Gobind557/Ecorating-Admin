import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import ordersReducer from './ordersSlice';

// Persistence helpers - only persist products and orders data, not loading/error states

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState);
    // Only restore persisted keys, filter out loading/error states
    return {
      products: {
        items: state.products?.items || [],
        loading: false,
        error: null,
      },
      orders: {
        items: state.orders?.items || [],
        loading: false,
        error: null,
      },
    };
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: RootState) => {
  try {
    // Only persist the data we care about, not loading/error states
    const stateToPersist = {
      products: {
        items: state.products.items,
      },
      orders: {
        items: state.orders.items,
      },
    };
    localStorage.setItem('reduxState', JSON.stringify(stateToPersist));
  } catch (err) {
    // Ignore write errors
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

