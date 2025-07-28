export interface DatabaseDispatchEvents {
  getDatabaseSchemaHash: () => string | undefined;
  setDatabaseSchemaHash: (hash: string) => void;
}
