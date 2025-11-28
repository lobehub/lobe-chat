'use client';

import { App } from 'antd';
import { Split } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  ActionsBarConfig,
  MessageActionFactory,
  MessageActionItem,
} from '@/features/Conversation/types';
import { useChatStore } from '@/store/chat';

/**
 * Hook to create a branching action factory function.
 * The factory function takes a message id and returns the branching action
 * with proper ChatStore integration.
 */
export const useBranchingActionFactory = (): MessageActionFactory => {
  const { t } = useTranslation('common');
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const openThreadCreator = useChatStore((s) => s.openThreadCreator);
  const threadMaps = useChatStore((s) => s.threadMaps);

  return useCallback(
    (id: string): MessageActionItem | null => {
      // Check if message already has a thread
      const hasThread = Object.values(threadMaps).some((threads) =>
        threads?.some((thread) => thread.sourceMessageId === id),
      );

      if (hasThread) return null;

      return {
        handleClick: () => {
          if (!topic) {
            message.warning(t('branchingRequiresSavedTopic'));
            return;
          }
          openThreadCreator(id);
        },
        icon: Split,
        key: 'branching',
        label: t('branching'),
      };
    },
    [topic, openThreadCreator, threadMaps, message, t],
  );
};

/**
 * Hook to generate actionsBar configuration with branching support.
 * This creates the complete actionsBar config to be passed to ChatList.
 */
export const useActionsBarConfig = (): ActionsBarConfig => {
  const branchingFactory = useBranchingActionFactory();

  return useMemo(
    () => ({
      assistant: {
        extraBarActions: [branchingFactory],
      },
      user: {
        extraBarActions: [branchingFactory],
      },
    }),
    [branchingFactory],
  );
};
