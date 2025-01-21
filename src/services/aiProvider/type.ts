import {
  AiProviderRuntimeState,
  AiProviderSortMap,
  CreateAiProviderParams,
  UpdateAiProviderConfigParams,
} from '@/types/aiProvider';

export interface IAiProviderService {
  createAiProvider: (params: CreateAiProviderParams) => Promise<any>;

  deleteAiProvider: (id: string) => Promise<any>;

  getAiProviderById: (id: string) => Promise<any>;

  getAiProviderList: () => Promise<any>;

  getAiProviderRuntimeState: (isLogin?: boolean) => Promise<AiProviderRuntimeState>;

  toggleProviderEnabled: (id: string, enabled: boolean) => Promise<any>;

  updateAiProvider: (id: string, value: any) => Promise<any>;

  updateAiProviderConfig: (id: string, value: UpdateAiProviderConfigParams) => Promise<any>;

  updateAiProviderOrder: (items: AiProviderSortMap[]) => Promise<any>;
}
