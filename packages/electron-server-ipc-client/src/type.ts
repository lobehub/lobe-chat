export const ElectronIPCMethods = {
  GET_DATABASE_PATH: 'GET_DATABASE_PATH',
  GET_USER_DATA_PATH: 'GET_USER_DATA_PATH',
} as const;

export type IElectronIPCMethods = keyof typeof ElectronIPCMethods;
