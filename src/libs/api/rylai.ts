import { ApiClient } from './api';

if (!process.env.RYLAI_API_URL || !process.env.RYLAI_API_KEY) {
  throw new Error('Missing required environment variables');
}

const AppId = 'lobe';

// 创建实例
const api = new ApiClient(process.env.RYLAI_API_URL, {
  headers: {
    Authorization: `${process.env.RYLAI_API_KEY}`,
  },
});

export interface UserSubscription {
  is_subscribed?: number;
  oneai_base_url?: string;
  oneai_token?: string;
  plan_id?: number;
  user_subscription_id?: number;
  valid_until?: string;
}

// 查询用户订阅
export const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
  try {
    const response = await api.get<{ code: number; data: UserSubscription; message: string }>(
      '/v1/admin/user-subscriptions/app-plan',
      {
        app_id: AppId,
        sso_user_id: userId,
      },
    );
    const { data, code, message } = response;
    if (code === 0) {
      return data;
    } else {
      throw new Error(message || 'Unknown error');
    }
  } catch (error) {
    console.error('Failed to get user subscription:', error);
    return {};
  }
};

// POST 请求
// const createData = async () => {
//   try {
//     const response = await api.post<{ id: number }>('/users', {
//       name: 'John',
//       email: 'john@example.com'
//     });
//     console.log(response);
//   } catch (error) {
//     console.error(error);
//   }
// };
