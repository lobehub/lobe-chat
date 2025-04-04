export interface FilesSearchDispatchEvents {
  readFiles: (paths: string[]) => any[];
  searchFiles: (query: string) => void;
}
