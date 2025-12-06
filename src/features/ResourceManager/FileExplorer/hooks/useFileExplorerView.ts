import { useCallback, useEffect, useState } from 'react';

import { useGlobalStore } from '@/store/global';
import { FilesTabs } from '@/types/files';

import type { ViewMode } from '../ToolBar/ViewSwitcher';

export const useFileExplorerView = (category?: string) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMasonryReady, setIsMasonryReady] = useState(false);

  const storedViewMode = useGlobalStore((s) => s.status.fileManagerViewMode);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  // Always use masonry for Images category
  const viewMode = (
    category === FilesTabs.Images ? 'masonry' : storedViewMode || 'list'
  ) as ViewMode;

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setIsTransitioning(true);
      if (mode === 'masonry') {
        setIsMasonryReady(false);
      }
      updateSystemStatus({ fileManagerViewMode: mode });
    },
    [updateSystemStatus],
  );

  // Handle transition completion
  useEffect(() => {
    if (isTransitioning) {
      requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
        return () => clearTimeout(timer);
      });
    }
  }, [isTransitioning]);

  // Handle masonry ready state
  useEffect(() => {
    if (viewMode === 'masonry' && !isTransitioning) {
      const timer = setTimeout(() => {
        setIsMasonryReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (viewMode === 'list') {
      setIsMasonryReady(false);
    }
  }, [viewMode, isTransitioning]);

  return {
    isMasonryReady,
    isTransitioning,
    setViewMode,
    viewMode,
  };
};
