import { LobeDocument } from '@/types/document';

export interface DocumentState {
  /**
   * Server documents fetched from document service
   */
  documents: LobeDocument[];
  /**
   * Loading state for document fetching
   */
  isDocumentListLoading: boolean;
  /**
   * Local optimistic document map for immediate UI updates
   */
  localDocumentMap: Map<string, LobeDocument>;
}

export const initialDocumentState: DocumentState = {
  documents: [],
  isDocumentListLoading: false,
  localDocumentMap: new Map(),
};
