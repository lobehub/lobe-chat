import { useCallback, useEffect, useState } from 'react';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import { FileListItem } from '@/types/files';

export const useFileExplorerSelection = (data: FileListItem[] | undefined) => {
  const [selectFileIds, setSelectedFileIds] = useResourceManagerStore((s) => [
    s.selectedFileIds,
    s.setSelectedFileIds,
  ]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Handle selection with shift key support for range selection
  const handleSelectionChange = useCallback(
    (id: string, checked: boolean, shiftKey: boolean, clickedIndex: number) => {
      if (shiftKey && lastSelectedIndex !== null && selectFileIds.length > 0 && data) {
        const start = Math.min(lastSelectedIndex, clickedIndex);
        const end = Math.max(lastSelectedIndex, clickedIndex);
        const rangeIds = data.slice(start, end + 1).map((item) => item.id);

        const prevSet = new Set(selectFileIds);
        rangeIds.forEach((rangeId) => prevSet.add(rangeId));
        setSelectedFileIds(Array.from(prevSet));
      } else {
        if (checked) {
          setSelectedFileIds([...selectFileIds, id]);
        } else {
          setSelectedFileIds(selectFileIds.filter((item) => item !== id));
        }
      }
      setLastSelectedIndex(clickedIndex);
    },
    [lastSelectedIndex, selectFileIds, data, setSelectedFileIds],
  );

  // Validate selections against current data
  useEffect(() => {
    if (data && selectFileIds.length > 0) {
      const validFileIds = new Set(data.map((item) => item?.id).filter(Boolean));
      const filteredSelection = selectFileIds.filter((id) => validFileIds.has(id));
      if (filteredSelection.length !== selectFileIds.length) {
        setSelectedFileIds(filteredSelection);
      }
    }
  }, [data]);

  // Reset last selected index when selection is cleared
  useEffect(() => {
    if (selectFileIds.length === 0) {
      setLastSelectedIndex(null);
    }
  }, [selectFileIds.length]);

  return {
    handleSelectionChange,
    selectFileIds,
    setSelectedFileIds,
  };
};
