import { useMemo } from 'react';

type SortField<T> = keyof T;
type SortDirection = 'asc' | 'desc';

interface SortOptions<T> {
  field: SortField<T> | null;
  direction: SortDirection;
}

/**
 * Custom hook for sorting data
 * @param data - Array of items to sort
 * @param sortOptions - Sort field and direction
 * @returns Sorted data array
 */
export function useSort<T>(data: T[], sortOptions: SortOptions<T>) {
  return useMemo(() => {
    if (!sortOptions.field) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortOptions.field!];
      const bValue = b[sortOptions.field!];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle date strings (ISO format)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        if (!isNaN(aDate) && !isNaN(bDate)) {
          if (aDate < bDate) {
            return sortOptions.direction === 'asc' ? -1 : 1;
          }
          if (aDate > bDate) {
            return sortOptions.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      }

      // Compare values
      if (aValue < bValue) {
        return sortOptions.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOptions.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortOptions.field, sortOptions.direction]);
}

