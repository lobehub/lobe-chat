import {
  createApi,
  DefaultApiImpl,
  Get,
  RequestHeader,
} from "@dongjak-extensions/http-client";
import * as commons from "@dongjak-public-types/commons";
import httpClient from "@/utils/axios";

class UserApi extends DefaultApiImpl {
  @Get("/api/user/subscriptions")
  getUserSubscriptions(
    @RequestHeader("Authorization") token: string,
  ): Promise<commons.JsonResponse<User>> {
    return Promise.resolve() as any;
  }
}

interface Subscription {
  apiSecret: ApiSecret;
  endTime: string;
  plan: Plan;
  startTime: string;
}

interface Plan {
  duration: number;
  features: Feature[];
  name: string;
  trialPeriodDays: number;
}

interface Feature {
  dailyDosage: number;
  dosageUnit: string;
  maxDosage: number;
  name: string;
}

interface ApiSecret {
  endpoint: string;
  name: string;
  secret: string;
}

export interface User {
  phoneNumber: string;
  subscriptions: Subscription[];
}

export const userApi = createApi(UserApi, httpClient);
