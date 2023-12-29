import axios from "axios";
import { JsonResponse } from "@dongjak-public-types/commons";

const httpClient = axios.create({
  baseURL: "http://localhost:8084",
  timeout: 1000 * 10,
  responseType: "json",
});
httpClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(
  //@ts-ignore
  (response): Promise<JsonResponse<any>> => {
    const jsonResponse = new JsonResponse(
      response.data.code,
      response.data.message,
      response.data.data,
    );
    if (jsonResponse.isSuccessful()) return Promise.resolve(jsonResponse);
    else return Promise.reject(jsonResponse); // 错误继续返回给到具体页面
  },
  (error) => {
    return Promise.reject(error); // 错误继续返回给到具体页面
  },
);
export default httpClient;
