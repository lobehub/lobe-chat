import {
  createApi,
  DefaultApiImpl,
  Post,
  RequestBody,
} from "@dongjak-extensions/http-client";
import * as commons from "@dongjak-public-types/commons";
import httpClient from "@/utils/axios";

export interface QueryForm {
  key: string;
  keyMatchStrategy?: string;
  username?: string;
}
interface HiPreferenceDto {
  id?: number; 
  key?: string;
  // Long 在 JavaScript/TypeScript 中通常被当作 number 处理
  namespace?: string;
  value?: string;
}
class PreferenceApi extends DefaultApiImpl {
  @Post("/api/preference")
  getPreference(
    @RequestBody() form: QueryForm,
  ): Promise<commons.JsonResponse<HiPreferenceDto[]>> {
    return Promise.resolve() as any;
  }
}

export const preferenceApi = createApi(PreferenceApi, httpClient);
