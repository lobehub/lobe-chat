import { AppState, AppStateStatus } from 'react-native';
import { useUserStore } from '@/store/user';
import { TokenStorage } from './tokenStorage';

export class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: any = null;
  private isRefreshing = false;

  // 刷新间隔（毫秒）- 默认每30分钟检查一次
  private static readonly REFRESH_INTERVAL = 30 * 60 * 1000;
  // 提前刷新时间（秒）- 令牌过期前5分钟开始刷新
  private static readonly REFRESH_THRESHOLD = 5 * 60;

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  /**
   * 启动令牌刷新管理器
   */
  start(): void {
    this.stop(); // 先停止现有的管理器

    // 启动定期检查
    this.startPeriodicRefresh();

    // 监听应用状态变化
    this.setupAppStateListener();

    console.log('Token refresh manager started');
  }

  /**
   * 停止令牌刷新管理器
   */
  stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    console.log('Token refresh manager stopped');
  }

  /**
   * 启动定期刷新
   */
  private startPeriodicRefresh(): void {
    this.refreshInterval = setInterval(async () => {
      await this.checkAndRefreshToken();
    }, TokenRefreshManager.REFRESH_INTERVAL);
  }

  /**
   * 设置应用状态监听器
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this),
    );
  }

  /**
   * 处理应用状态变化
   */
  private async handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
    if (nextAppState === 'active') {
      // 应用进入前台时检查令牌
      await this.checkAndRefreshToken();
    }
  }

  /**
   * 检查并刷新令牌
   */
  private async checkAndRefreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return; // 避免重复刷新
    }

    try {
      this.isRefreshing = true;

      const { isAuthenticated } = useUserStore.getState();
      if (!isAuthenticated) {
        return;
      }

      // 检查是否需要刷新
      const needsRefresh = await this.shouldRefreshToken();
      if (!needsRefresh) {
        return;
      }

      // 检查刷新令牌是否过期
      const isRefreshTokenExpired = await TokenStorage.isRefreshTokenExpired();
      if (isRefreshTokenExpired) {
        console.log('Refresh token expired, logging out');
        await useUserStore.getState().logout();
        return;
      }

      // 刷新令牌
      console.log('Refreshing access token...');
      await useUserStore.getState().refreshToken();
      console.log('Access token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);

      // 刷新失败，可能需要重新登录
      if (error instanceof Error && error.message.includes('refresh_token')) {
        console.log('Refresh token invalid, logging out');
        await useUserStore.getState().logout();
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 检查是否需要刷新令牌
   */
  private async shouldRefreshToken(): Promise<boolean> {
    try {
      const token = await TokenStorage.getToken();
      if (!token) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = token.expiresAt - now;

      // 如果令牌在阈值时间内过期，则需要刷新
      return timeUntilExpiry <= TokenRefreshManager.REFRESH_THRESHOLD;
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return false;
    }
  }

  /**
   * 手动刷新令牌
   */
  async refreshTokenManually(): Promise<void> {
    await this.checkAndRefreshToken();
  }

  /**
   * 获取令牌剩余时间（秒）
   */
  async getTokenRemainingTime(): Promise<number> {
    try {
      const token = await TokenStorage.getToken();
      if (!token) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, token.expiresAt - now);
    } catch (error) {
      console.error('Failed to get token remaining time:', error);
      return 0;
    }
  }

  /**
   * 获取刷新令牌剩余时间（秒）
   */
  async getRefreshTokenRemainingTime(): Promise<number> {
    try {
      const token = await TokenStorage.getToken();
      if (!token) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, token.refreshExpiresAt - now);
    } catch (error) {
      console.error('Failed to get refresh token remaining time:', error);
      return 0;
    }
  }
}

// 导出单例实例
export const tokenRefreshManager = TokenRefreshManager.getInstance();
