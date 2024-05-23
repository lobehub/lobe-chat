export interface CommonState {
  isUserCanEnableTrace: boolean;
  isUserStateInit: boolean;
}

export const initialCommonState: CommonState = {
  isUserCanEnableTrace: false,
  isUserStateInit: false,
};
