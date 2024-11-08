import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      timeout: 30_000, // 30 seconds timeout
      ...config,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 在这里可以添加通用的请求头等
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        // 统一的错误处理
        return Promise.reject(this.handleError(error));
      },
    );
  }

  // GET 请求
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, { ...config, params });
  }

  // POST 请求
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  // PUT 请求
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  // DELETE 请求
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }

  // 统一的错误处理方法
  private handleError(error: any): Error {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      return new Error(`Request failed with status ${status}: ${JSON.stringify(data)}`);
    } else if (error.request) {
      // 请求发送成功但没有收到响应
      return new Error('No response received from server');
    } else {
      // 请求配置出错
      return new Error('Request configuration error');
    }
  }
}

// 使用示例：
// const api = new ApiClient('https://api.example.com');
// const data = await api.get<ResponseType>('/endpoint');
