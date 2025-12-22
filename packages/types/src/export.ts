export interface ExportDatabaseData {
  data: Record<string, object[]>;
  schemaHash?: string;
  url?: string;
}

export interface ImportPgDataStructure {
  data: Record<string, object[]>;
  mode: 'pglite' | 'postgres';
  schemaHash: string;
}

// ===== Topic Export Types =====

/**
 * Export mode for topic JSON export
 * - simple: OpenAI compatible format (only role and content)
 * - full: Lossless backup format (includes all metadata)
 */
export type TopicExportMode = 'simple' | 'full';

/**
 * Complete lossless export format for a topic
 * Messages are exported as-is from UIChatMessage with timestamps converted to ISO strings
 */
export interface ExportedTopic {
  /** ISO timestamp when the export was created */
  exportedAt: string;
  /** All messages in the topic (UIChatMessage with cleaned null/undefined values) */
  messages: Record<string, any>[];
  /** Topic title (optional, not present for non-topic exports) */
  title?: string;
  /** Export format version for forward compatibility */
  version: '2.0';
}
