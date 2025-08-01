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
