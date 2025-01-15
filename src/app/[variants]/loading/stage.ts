import { DatabaseLoadingState } from '@/types/clientDB';

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
  DatabaseLoadingState.Initializing,
  DatabaseLoadingState.LoadingDependencies,
  DatabaseLoadingState.LoadingWasm,
  DatabaseLoadingState.Migrating,
  DatabaseLoadingState.Finished,
  DatabaseLoadingState.Ready,
  AppLoadingStage.InitUser,
  AppLoadingStage.GoToChat,
] as string[];
