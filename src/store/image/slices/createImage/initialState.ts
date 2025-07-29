export interface CreateImageState {
  isCreating: boolean;
  isCreatingWithNewTopic: boolean;
}

export const initialCreateImageState: CreateImageState = {
  isCreating: false,
  isCreatingWithNewTopic: false,
};
