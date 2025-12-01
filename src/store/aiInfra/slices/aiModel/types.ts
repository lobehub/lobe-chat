export interface ModelUpdateResult {
  /** Models that were added */
  added: string[];
  /** Models that were removed from remote but still exist in model-bank builtin list */
  removedButBuiltin: string[];
  /** Models that were actually removed */
  removedFromList: string[];
}
