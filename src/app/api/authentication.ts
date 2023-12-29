import {
  DefaultApiImpl,
  createApi,
  Get,
  Query,
} from "@dongjak-extensions/http-client";
import * as commons from "@dongjak-public-types/commons";
import httpClient from "@/utils/axios";

class AuthenticationApi extends DefaultApiImpl {
  // @Post('/rest/:entity/getPage')
  // getPage<T>(@Path("entity") entity: string, @RequestBody() queryPayload: commons.IQueryPayload): Promise<commons.JsonResponse<commons.IPage<T>>> {
  //   return Promise.resolve() as any
  // }
  //
  // @Post('/rest/:entity/getAll')
  // getAll<T>(@Path("entity") entity: string, @RequestBody() queryPayload: commons.IQueryPayload): Promise<commons.JsonResponse<T[]>> {
  //   return Promise.resolve() as any
  // }

  // @Post('/rest/:entity/saveOrUpdate')
  // saveOrUpdate<T>(@Path("entity") entity: string, @RequestBody() data: T): Promise<commons.JsonResponse<boolean>> {
  //   return Promise.resolve() as any
  // }

  @Get("/authentication/sendVerificationCode")
  sendCode(
    @Query("phoneNumber") phoneNumber: string,
  ): Promise<commons.JsonResponse<any>> {
    return Promise.resolve() as any;
  }
  //
  // @Post('/rest/:entity/deleteRows')
  // deleteRows(@Path("entity") entity: string, @RequestBody() rowIds: number[]): Promise<commons.JsonResponse<boolean>> {
  //   return Promise.resolve() as any
  // }
}
export const authenticationApi = createApi(AuthenticationApi, httpClient);
