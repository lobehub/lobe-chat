export interface RAGEvalState {
  activeDatasetId: number | null;
  initDatasetList: boolean;
}

export const initialDatasetState: RAGEvalState = {
  activeDatasetId: null,
  initDatasetList: false,
};
