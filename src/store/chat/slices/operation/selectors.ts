import type { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

import type { Operation, OperationType } from './types';

/**
 * Operation Selectors
 */
export const operationSelectors = {
  

  
  /**
   * Check if can send message (no blocking operations running)
   */
canSendMessage: (s: ChatStore): boolean => {
    // Cannot send if there's any running operation in current context
    const currentOps = operationSelectors.getCurrentContextOperations(s);
    const hasRunningOp = currentOps.some((op) => op.status === 'running');

    return !hasRunningOp;
  },

  
  


// === Basic Queries ===
/**
   * Get all operations
   */
getAllOperations: (s: ChatStore): Operation[] => {
    return Object.values(s.operations);
  },

  
  





/**
   * Check if can interrupt (has running operations that can be cancelled)
   */
canInterrupt: (s: ChatStore): boolean => {
    const currentOps = operationSelectors.getCurrentContextOperations(s);
    return currentOps.some((op) => op.status === 'running');
  },

  
  





/**
   * Get operations for current context (active session and topic)
   */
getCurrentContextOperations: (s: ChatStore): Operation[] => {
    const { activeId, activeTopicId } = s;
    if (!activeId) return [];

    const contextKey = messageMapKey(activeId, activeTopicId);
    const operationIds = s.operationsByContext[contextKey] || [];
    return operationIds.map((id) => s.operations[id]).filter(Boolean);
  },

  
  






// === UI Helpers ===
/**
   * Get active operation types (for debugging/display)
   */
getActiveOperationTypes: (s: ChatStore): OperationType[] => {
    const runningOps = operationSelectors.getRunningOperations(s);
    const types = new Set(runningOps.map((op) => op.type));
    return Array.from(types);
  },

  
  







/**
   * Get operation by ID
   */
getOperationById: (operationId: string) => (s: ChatStore): Operation | undefined => {
    return s.operations[operationId];
  },

  
  






/**
   * Get current operation label for UI display
   * Returns the label of the most recent running operation in current context
   */
getCurrentOperationLabel: (s: ChatStore): string => {
    const currentOps = operationSelectors.getCurrentContextOperations(s);
    const runningOps = currentOps.filter((op) => op.status === 'running');

    if (runningOps.length === 0) return '';

    // Get the most recent running operation
    const latestOp = runningOps.reduce((latest, op) => {
      return op.metadata.startTime > latest.metadata.startTime ? op : latest;
    });

    return latestOp.label || latestOp.type;
  },

  

  
  







/**
   * Get operation context from message ID
   * Useful for automatic context retrieval
   */
getOperationContextFromMessage:
    (messageId: string) => (s: ChatStore): Operation['context'] | undefined => {
      const operationId = s.messageOperationMap[messageId];
      if (!operationId) return undefined;

      const operation = s.operations[operationId];
      return operation?.context;
    },

  
  









/**
   * Get current operation progress
   * Returns the progress of the most recent running operation with progress info
   */
getCurrentOperationProgress: (s: ChatStore): number | undefined => {
    const currentOps = operationSelectors.getCurrentContextOperations(s);
    const runningOps = currentOps.filter((op) => op.status === 'running');

    if (runningOps.length === 0) return undefined;

    // Find the most recent operation with progress
    const opsWithProgress = runningOps.filter((op) => op.metadata.progress);

    if (opsWithProgress.length === 0) return undefined;

    const latestOp = opsWithProgress.reduce((latest, op) => {
      return op.metadata.startTime > latest.metadata.startTime ? op : latest;
    });

    return latestOp.metadata.progress?.percentage;
  },

  
  









/**
   * Get operations by message ID
   */
getOperationsByMessage: (messageId: string) => (s: ChatStore): Operation[] => {
    const operationIds = s.operationsByMessage[messageId] || [];
    return operationIds.map((id) => s.operations[id]).filter(Boolean);
  },

  
  







/**
   * Get operations by type
   */
getOperationsByType: (type: OperationType) => (s: ChatStore): Operation[] => {
    const operationIds = s.operationsByType[type] || [];
    return operationIds.map((id) => s.operations[id]).filter(Boolean);
  },

  

  
  




/**
   * Get all running operations
   */
getRunningOperations: (s: ChatStore): Operation[] => {
    return Object.values(s.operations).filter((op) => op.status === 'running');
  },

  
  

// === Status Checks ===
/**
   * Check if there's any running operation
   */
hasAnyRunningOperation: (s: ChatStore): boolean => {
    return Object.values(s.operations).some((op) => op.status === 'running');
  },

  
  /**
   * Check if there's a running operation of specific type
   */
hasRunningOperationType: (type: OperationType) => (s: ChatStore): boolean => {
    const operationIds = s.operationsByType[type] || [];
    return operationIds.some((id) => {
      const op = s.operations[id];
      return op && op.status === 'running';
    });
  },

  
  // === Backward Compatibility ===
/**
   * Check if AI is generating (for backward compatibility)
   * Equivalent to: hasRunningOperationType('generateAI')
   */
isAIGenerating: (s: ChatStore): boolean => {
    return operationSelectors.hasRunningOperationType('generateAI')(s);
  },

  

  
  

/**
   * Check if continuing (for backward compatibility)
   */
isContinuing: (s: ChatStore): boolean => {
    return operationSelectors.hasRunningOperationType('continue')(s);
  },

  
  



/**
   * Check if in RAG flow (for backward compatibility)
   */
isInRAGFlow: (s: ChatStore): boolean => {
    return operationSelectors.hasRunningOperationType('rag')(s);
  },

  
  



/**
   * Check if in search workflow (for backward compatibility)
   */
isInSearchWorkflow: (s: ChatStore): boolean => {
    return operationSelectors.hasRunningOperationType('searchWorkflow')(s);
  },

  
  

/**
   * Check if a specific message is being processed
   */
isMessageProcessing: (messageId: string) => (s: ChatStore): boolean => {
    const operations = operationSelectors.getOperationsByMessage(messageId)(s);
    return operations.some((op) => op.status === 'running');
  },

  
  

/**
   * Check if regenerating (for backward compatibility)
   */
isRegenerating: (s: ChatStore): boolean => {
    return operationSelectors.hasRunningOperationType('regenerate')(s);
  },

  
  
/**
   * Check if sending message (for backward compatibility)
   * Equivalent to: hasRunningOperationType('sendMessage')
   */
isSendingMessage: (s: ChatStore): boolean => {
    return operationSelectors.hasRunningOperationType('sendMessage')(s);
  },
};
