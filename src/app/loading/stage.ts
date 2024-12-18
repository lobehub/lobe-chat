export enum AppLoadingStage {
  GoToChat = 'goToChat',
  Idle = 'appIdle',
  InitAuth = 'initAuth',
  InitUser = 'initUser',
  Initializing = 'appInitializing',
}

export const SERVER_LOADING_STAGES = [
  AppLoadingStage.Idle,
  AppLoadingStage.Initializing,
  AppLoadingStage.InitAuth,
  AppLoadingStage.InitUser,
  AppLoadingStage.GoToChat,
];

export const CLIENT_LOADING_STAGES = [
  AppLoadingStage.Idle,
  AppLoadingStage.Initializing,
  AppLoadingStage.InitUser,
  AppLoadingStage.GoToChat,
] as string[];
