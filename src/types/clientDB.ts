// 定义加载状态类型
export enum DatabaseLoadingState {
  Error = 'error',
  Finished = 'finished',
  Idle = 'idle',
  Initializing = 'initializing',
  LoadingDependencies = 'loadingDependencies',
  LoadingWasm = 'loadingWasm',
  Migrating = 'migrating',
  Ready = 'ready',
}

export const ClientDatabaseInitStages = [
  DatabaseLoadingState.Idle,
  DatabaseLoadingState.Initializing,
  DatabaseLoadingState.LoadingDependencies,
  DatabaseLoadingState.LoadingWasm,
  DatabaseLoadingState.Migrating,
  DatabaseLoadingState.Finished,
];

// 定义进度回调接口
export interface ClientDBLoadingProgress {
  costTime?: number;
  phase: 'wasm' | 'dependencies';
  progress: number;
}

export type OnStageChange = (state: DatabaseLoadingState) => void;
