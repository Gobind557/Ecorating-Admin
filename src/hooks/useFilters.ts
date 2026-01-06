import { useMemo } from 'react';
import type { Product } from '../types';

interface FilterOptions {
  search?: string;
  category?: string;
  status?: 'Active' | 'Inactive' | 'All';
}

/**
 * Custom hook for filtering products
 * @param products - Array of products to filter
 * @param filters - Filter options (search, category, status)
 * @returns Filtered products array
 */
export function useFilters(products: Product[], filters: FilterOptions) {
  return useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!product.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filters.category && filters.category !== 'All') {
        if (product.category !== filters.category) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status !== 'All') {
        if (product.status !== filters.status) {
          return false;
        }
      }

      return true;
    });
  }, [products, filters.search, filters.category, filters.status]);
}

