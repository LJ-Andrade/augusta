import { useState, useCallback } from 'react';

export function useBulkSelect(items = []) {
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(item => item.id));
    }
  }, [items, isAllSelected]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    isAllSelected,
    isEmpty: selectedIds.length === 0,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
  };
}
