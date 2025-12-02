import { LobeDocument } from '@/types/document';

export interface DocumentState {
  /**
   * Server documents fetched from document service
   */
  documents: LobeDocument[];
  /**
   * Whether currently creating a new document
   */
  isCreatingNew: boolean;
  /**
   * Loading state for document fetching
   */
  isDocumentListLoading: boolean;
  /**
   * Local optimistic document map for immediate UI updates
   */
  localDocumentMap: Map<string, LobeDocument>;
  /**
   * Page agent ID, initialized by useInitPageAgent hook
   */
  pageAgentId: string | null;
  /**
   * ID of the page being renamed (null if none)
   */
  renamingPageId: string | null;
  /**
   * Search keywords for filtering pages
   */
  searchKeywords: string;
  /**
   * Currently selected page ID
   */
  selectedPageId: string | null;
}

export const initialDocumentState: DocumentState = {
  documents: [],
  isCreatingNew: false,
  isDocumentListLoading: false,
  localDocumentMap: new Map(),
  pageAgentId: null,
  renamingPageId: null,
  searchKeywords: '',
  selectedPageId: null,
};
