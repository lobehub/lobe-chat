'use client';

import React, { memo, useCallback } from 'react';

import { SkeletonList, VirtualizedList } from '@/features/Conversation';
import { useChatGroupStore } from '@/store/chatGroup';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import ThreadChatItem from './ThreadChatItem';

const ThreadChatList = memo(() => {
    const [isCurrentChatLoaded] = useChatStore((s) => [chatSelectors.isCurrentChatLoaded(s)]);
    const activeThreadAgentId = useChatGroupStore((s) => s.activeThreadAgentId);

    // Get agent info for better empty state
    const agents = useSessionStore(sessionSelectors.currentGroupAgents);
    const currentAgent = agents?.find(agent => agent.id === activeThreadAgentId);
    const agentTitle = currentAgent?.title || 'this agent';

    // Get thread message IDs using the chat selector with the active agent ID
    const data = useChatStore(chatSelectors.getThreadMessageIDs(activeThreadAgentId));

    const itemContent = useCallback(
        (index: number, id: string) => <ThreadChatItem id={id} index={index} />,
        [],
    );

    if (!isCurrentChatLoaded) return <SkeletonList />;

    if (data.length === 0) {
        return (
            <div
                style={{
                    color: '#999',
                    fontSize: '14px',
                    padding: '32px 16px',
                    textAlign: 'center',
                }}
            >
                No messages yet with {agentTitle}.
                <br />
                Start a conversation in the main chat!
            </div>
        );
    }

    return <VirtualizedList dataSource={data} itemContent={itemContent} />;
});

export default ThreadChatList;
