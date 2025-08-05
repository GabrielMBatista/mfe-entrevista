import { useState, useCallback } from 'react';
import { FilterValues } from '@/components/dashboard/InterviewFilters';

export const useInterviewFilters = (initialFilters: FilterValues = {}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const handleFilterChange = useCallback((key: keyof FilterValues, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback((key: keyof FilterValues) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    filters,
    handleFilterChange,
    resetFilters,
    clearFilter,
    setFilters
  };
};
