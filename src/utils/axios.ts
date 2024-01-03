import axios from "axios";
import { JsonResponse } from "@dongjak-public-types/commons";
import { useAuthenticationStore } from "@/store/authentication";

/*
const fetchAdapter = (config: InternalAxiosRequestConfig) => {
  // 将 Axios 配置转换为 Fetch API 配置
  const fetchConfig = {
    method: config.method?.toUpperCase(),
    headers: config.headers,
    body: config.data,
    mode: "cors", // 根据需要设置模式
    credentials: config.withCredentials ? "include" : "omit", // 处理跨域请求的凭据
  }; //as RequestInit;

  // 处理请求超时
  /!*  const timeoutPromise = new Promise(function (resolve, reject) {
      if (config.timeout) {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, config.timeout);
      }
    });*!/

  // 发送请求并返回一个 Promise

  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    /!*Promise.race([
      fetch(`${config.baseURL}${config.url}`, fetchConfig)
        .then(response => {
          // 检查响应状态
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          // 根据 Axios 的配置解析响应数据
          const responseDataPromise = config.responseType === 'json'
            ? response.json()
            : response.text();
          responseDataPromise.then(data => {

            resolve({
              data,
              status: response.status,
              statusText: response.statusText,
              // headers: response.headers as AxiosResponseHeaders,
              config,
              request: response,
            } as AxiosResponse)
          });
        }),
      timeoutPromise
    ])
      .catch(error => {
        // 包装错误信息
        reject({
          message: error.message,
          config,
          request: error.request,
        })
      });*!/
    //@ts-ignore
    fetch(`${config.baseURL}${config.url}`, fetchConfig).then((response) => {
      // 检查响应状态
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      // 根据 Axios 的配置解析响应数据
      const responseDataPromise =
        config.responseType === "json" ? response.json() : response.text();
      responseDataPromise.then((data) => {
        resolve({
          data,
          status: response.status,
          statusText: response.statusText,
          // headers: response.headers as AxiosResponseHeaders,
          config,
          request: response,
        } as AxiosResponse);
      });
    });
  });
};
*/

export const JAVA_URL = "http://localhost:8084";
const httpClient = axios.create({
  baseURL: JAVA_URL,
  timeout: 1000 * 10,
  responseType: "json",
  // withCredentials: true,
  // adapter: fetchAdapter,
});
httpClient.interceptors.request.use(
  (config) => {
    const token = useAuthenticationStore.getState().token;
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    /* const unsub1 = useAuthenticationStore.subscribe(state => {
  })
  unsub1()*/
    // const  a= localStorage.getItem("AILoveWorld_Authentication")

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
