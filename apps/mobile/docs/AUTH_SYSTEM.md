# LobeChat React Native 认证系统

## 概述

本项目实现了基于 OAuth 2.0 OIDC 的认证系统，支持 PKCE（Proof Key for Code Exchange）流程，确保移动端应用的安全性。

## 架构设计

### 核心组件

1. **类型定义** (`types/user.ts`)
   - User: 用户信息类型
   - Token: 认证令牌类型
   - AuthState: 认证状态类型
   - PKCE: PKCE 参数类型

2. **安全存储** (`services/auth/tokenStorage.ts`)
   - 使用 `expo-secure-store` 安全存储敏感信息
   - 自动检查令牌有效性
   - 支持令牌过期检查

3. **PKCE 工具** (`services/auth/pkce.ts`)
   - 生成 code_verifier 和 code_challenge
   - 使用 SHA256 + Base64URL 编码
   - 支持 state 和 nonce 参数

4. **认证服务** (`services/auth/authService.ts`)
   - 实现完整的 OAuth 2.0 OIDC 流程
   - 支持授权码交换令牌
   - 自动刷新令牌机制

5. **状态管理** (`store/user/index.ts`)
   - 使用 Zustand 管理认证状态
   - 支持持久化存储
   - 提供选择器和操作函数

6. **请求拦截器** (`services/auth/interceptor.ts`)
   - 自动添加认证头
   - 处理 401 错误和令牌刷新
   - 支持重试机制

7. **后台刷新** (`services/auth/tokenRefresh.ts`)
   - 定时检查令牌有效性
   - 应用状态变化时自动刷新
   - 防止重复刷新

## 使用方法

### 1. 环境配置

在 `.env.local` 文件中配置以下变量：

```env
EXPO_PUBLIC_OAUTH_CLIENT_ID=your-client-id
EXPO_PUBLIC_OAUTH_ISSUER=https://auth.lobehub.com
EXPO_PUBLIC_OAUTH_REDIRECT_URI=lobe-chat-mobile://auth/callback
```

### 2. 基本使用

#### 保护需要认证的路由

```typescript
import AuthGuard from '@/components/auth/AuthGuard';

const ProtectedScreen = () => {
  return (
    <AuthGuard>
      <MyProtectedContent />
    </AuthGuard>
  );
};
```

#### 使用认证的 API 请求

```typescript
import { authenticatedFetch } from '@/services/auth/interceptor';

const fetchUserData = async () => {
  const response = await authenticatedFetch('/api/user');
  return response.json();
};
```

### 3. 组件使用

#### 登录页面

```typescript
import LoginScreen from '@/components/auth/LoginScreen';

const LoginPage = () => {
  return <LoginScreen />;
};
```

#### 用户信息展示

```typescript
import UserProfile from '@/components/auth/UserProfile';

const ProfilePage = () => {
  return <UserProfile />;
};
```

### 4. 高级功能

#### 手动刷新令牌

```typescript
import { tokenRefreshManager } from '@/services/auth/tokenRefresh';

const refreshToken = async () => {
  await tokenRefreshManager.refreshTokenManually();
};
```

#### 检查令牌状态

```typescript
import { TokenStorage } from '@/services/auth/tokenStorage';

const checkTokenStatus = async () => {
  const hasValidToken = await TokenStorage.hasValidToken();
  const isExpired = await TokenStorage.isAccessTokenExpired();
  const remainingTime = await tokenRefreshManager.getTokenRemainingTime();
};
```

#### 带认证的函数装饰器

```typescript
import { withAuth } from '@/services/auth/interceptor';

const protectedFunction = withAuth(async (param: string) => {
  // 这个函数会自动检查认证状态
  const result = await someApiCall(param);
  return result;
});
```

## 安全特性

### 1. PKCE 支持

- 强制使用 PKCE 流程
- 生成高强度的 code_verifier
- 使用 SHA256 + Base64URL 编码

### 2. 安全存储

- 使用 expo-secure-store 存储敏感信息
- 支持设备级别的加密
- 自动清理过期令牌

### 3. 令牌管理

- 短期访问令牌（1 小时）
- 长期刷新令牌（30 天）
- 自动刷新机制
- 防止重复刷新

### 4. 错误处理

- 自动处理 401 错误
- 令牌刷新失败时自动登出
- 网络错误重试机制

## 测试

项目包含了一个测试页面用于验证认证流程：

```
/app/playground/auth-test.tsx
```

该页面提供了以下功能：

- 登录 / 登出测试
- 令牌信息查看
- 手动刷新令牌
- 存储清理
- 状态监控

## 故障排除

### 1. 认证失败

- 检查环境变量配置
- 确认客户端 ID 正确
- 验证重定向 URI 配置

### 2. 令牌刷新失败

- 检查刷新令牌是否过期
- 验证网络连接
- 查看控制台错误日志

### 3. 存储问题

- 清理应用数据
- 检查设备安全存储权限
- 验证 expo-secure-store 配置

## 最佳实践

1. **错误处理**: 始终处理认证相关的错误
2. **状态管理**: 使用提供的选择器避免不必要的重渲染
3. **安全性**: 不要在日志中记录敏感信息
4. **性能**: 使用 AuthGuard 组件延迟加载认证内容
5. **用户体验**: 提供清晰的加载和错误状态

## 扩展功能

### 自定义认证流程

可以通过继承 `OAuthService` 类来实现自定义认证流程：

```typescript
import { OAuthService } from '@/services/auth/authService';

class CustomAuthService extends OAuthService {
  async customLogin() {
    // 自定义登录逻辑
  }
}
```

### 添加额外的认证提供商

可以通过修改配置文件来支持多个认证提供商：

```typescript
const authProviders = {
  lobehub: {
    clientId: 'lobehub-client-id',
    issuer: 'https://auth.lobehub.com',
  },
  google: {
    clientId: 'google-client-id',
    issuer: 'https://accounts.google.com',
  },
};
```

## 注意事项

1. **平台差异**: Web 和移动端的重定向 URI 处理不同
2. **深度链接**: 需要正确配置应用的 URL Scheme
3. **状态同步**: 多个 store 之间的状态同步需要注意
4. **内存管理**: 及时清理不再需要的认证状态

## 版本兼容性

- React Native: 0.76.6+
- Expo: 52.0.5+
- TypeScript: 5.0+
- Zustand: 4.0+

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 发起 Pull Request

## 许可证

MIT License
