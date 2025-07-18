import React, { useCallback, useState, useRef, useEffect } from 'react';
import { type ActionIconGroupEvent } from '@lobehub/ui';

interface ContextMenuState {
  position: { x: number; y: number };
  selectedText?: string;
  visible: boolean;
}

interface UseChatItemContextMenuProps {
  id: string;
  onActionClick: (action: ActionIconGroupEvent) => void;
}

export const useChatItemContextMenu = ({ onActionClick }: Omit<UseChatItemContextMenuProps, 'id'>) => {
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    position: { x: 0, y: 0 },
    visible: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Get selected text
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    setContextMenuState({
      position: { x: event.clientX, y: event.clientY },
      selectedText,
      visible: true,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenuState(prev => ({ ...prev, visible: false }));
  }, []);

  const handleMenuClick = useCallback((action: ActionIconGroupEvent) => {
    if (action.key === 'quote' && contextMenuState.selectedText) {
      // Handle quote action - this will be integrated with ChatInput
      onActionClick({
        ...action,
        selectedText: contextMenuState.selectedText,
      } as ActionIconGroupEvent & { selectedText: string });
    } else {
      onActionClick(action);
    }
    hideContextMenu();
  }, [contextMenuState.selectedText, onActionClick, hideContextMenu]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuState.visible) {
        hideContextMenu();
      }
    };

    const handleScroll = () => {
      if (contextMenuState.visible) {
        hideContextMenu();
      }
    };

    if (contextMenuState.visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [contextMenuState.visible, hideContextMenu]);

  return {
    containerRef,
    contextMenuState,
    handleContextMenu,
    handleMenuClick,
    hideContextMenu,
  };
};