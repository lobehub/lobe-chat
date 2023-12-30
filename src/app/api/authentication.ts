import {
  DefaultApiImpl,
  createApi,
  Get,
  Query,
  Post,
  RequestBody,
} from "@dongjak-extensions/http-client";
import * as commons from "@dongjak-public-types/commons";
import httpClient from "@/utils/axios";

class AuthenticationApi extends DefaultApiImpl {
  @Get("/authentication/sendVerificationCode")
  sendCode(
    @Query("phoneNumber") phoneNumber: string,
  ): Promise<commons.JsonResponse<any>> {
    return Promise.resolve() as any;
  }

  @Post("/authentication/login")
  login(@RequestBody() form: LoginForm): Promise<commons.JsonResponse<string>> {
    return Promise.resolve() as any;
  }
}

export interface LoginForm {
  credentials: string;
  principal: string;
}

export const authenticationApi = createApi(AuthenticationApi, httpClient);
