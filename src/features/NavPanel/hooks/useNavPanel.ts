'use client';

import { type DraggableSideNavProps } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { useCallback, useState } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const useNavPanel = () => {
  const [expand, sessionsWidth, sessionExpandable, updatePreference] = useGlobalStore((s) => [
    systemStatusSelectors.showSessionPanel(s),
    systemStatusSelectors.sessionWidth(s),
    systemStatusSelectors.showSessionPanel(s),
    s.updateSystemStatus,
  ]);

  const [tmpWidth, setWidth] = useState(sessionsWidth);

  if (tmpWidth !== sessionsWidth) setWidth(sessionsWidth);

  const handleExpand = useCallback(
    (expand: boolean) => {
      if (isEqual(expand, sessionExpandable)) return;
      updatePreference({ showSessionPanel: expand });
    },
    [sessionExpandable, updatePreference],
  );

  const handleSizeChange: DraggableSideNavProps['onWidthChange'] = useCallback(
    (_: any, width: number) => {
      if (!sessionExpandable || !width || width < 64) return;
      if (isEqual(width, sessionsWidth)) return;
      setWidth(width);
      updatePreference({ sessionsWidth: width });
    },
    [sessionExpandable, sessionsWidth, updatePreference],
  );

  const togglePanel = useCallback(() => {
    handleExpand(!expand);
  }, [expand, handleExpand]);

  const openPanel = useCallback(() => {
    handleExpand(true);
  }, [handleExpand]);

  const closePanel = useCallback(() => {
    handleExpand(false);
  }, [handleExpand]);

  return {
    closePanel,
    defaultWidth: tmpWidth,
    expand,
    handleExpand,
    handleSizeChange,
    openPanel,
    togglePanel,
    width: sessionsWidth,
  };
};
