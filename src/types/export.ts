export interface ExportDatabaseData {
  data: any;
  schemaHash?: string;
  url?: string;
}

export interface ExportPgDataStructure {
  data: object;
  mode: 'pglite' | 'postgres';
  schemaHash: string;
}
