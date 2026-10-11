import { useMemo } from 'react';

import { useClientDataSWR } from '@/libs/swr';
import {
  type AgentDocumentListItem,
  agentDocumentService,
  agentDocumentSWRKeys,
} from '@/services/agentDocument';
import { useAgentStore } from '@/store/agent';

export type AgentDocumentLookup = (ref?: string | null) => AgentDocumentListItem | undefined;

/**
 * Resolve the document ids a tool call carries (either the row `id` or the
 * `docs_…` documentId) to the rows the user knows by title. Reads the active
 * agent's document list under the sidebar's SWR key, so it adds no request
 * while the documents panel is mounted.
 */
export const useAgentDocumentLookup = (): { isLoading: boolean; lookup: AgentDocumentLookup } => {
  const agentId = useAgentStore((s) => s.activeAgentId);
  const { data, isLoading } = useClientDataSWR(
    agentId ? agentDocumentSWRKeys.documentsList(agentId) : null,
    () => agentDocumentService.listDocuments({ agentId: agentId! }),
  );

  const lookup = useMemo<AgentDocumentLookup>(() => {
    const byRef = new Map<string, AgentDocumentListItem>();
    for (const doc of data ?? []) {
      byRef.set(doc.id, doc);
      byRef.set(doc.documentId, doc);
    }
    return (ref) => (ref ? byRef.get(ref) : undefined);
  }, [data]);

  return { isLoading, lookup };
};
