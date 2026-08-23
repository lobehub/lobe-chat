export interface QuickNoteAnnotation {
  content: string;
  divedAt?: number;
}

export interface QuickNoteItem {
  annotation?: QuickNoteAnnotation;
  collection?: string;
  content: string;
  createdAt: number;
  documentId?: string;
  editorData?: Record<string, unknown>;
  id: string;
  location?: string;
  run?: {
    kind: 'discovery' | 'dive' | 'signal_enrichment';
    operationId?: string | null;
    status: 'canceled' | 'completed' | 'failed' | 'pending' | 'running' | 'superseded';
    threadId?: string | null;
  };
  tags: string[];
  topicId?: string;
  updatedAt: number;
}
