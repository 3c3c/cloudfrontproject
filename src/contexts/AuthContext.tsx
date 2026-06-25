/**
 * 认证上下文
 * 提供认证状态、用户信息和 token 管理功能
 * 支持 token 过期自动刷新
 */

import { createContext, useContext, useState, useEffect, ReactNode, ComponentType } from 'react';
import { authAPI, LoginRequest, RegisterRequest, LoginResponse } from '../api/authApi';

// Token 过期时间（提前5分钟刷新，单位：毫秒）
const TOKEN_REFRESH_ADVANCE = 5 * 60 * 1000;

export interface AuthUser {
  id: string;
  username: string;
  avatar?: string;
  authorities: string[];
  mustChangePassword: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (params: LoginRequest) => Promise<void>;
  register: (params: RegisterRequest) => Promise<string>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 从 localStorage 加载 token 和用户信息
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        const tokenExpireTime = localStorage.getItem('auth_token_expire');

        if (savedToken && savedUser && tokenExpireTime) {
          const expireTime = parseInt(tokenExpireTime);
          const now = Date.now();

          // 检查 token 是否过期
          if (expireTime > now) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);

            // 设置定时器在过期前刷新 token
            const refreshDelay = expireTime - now - TOKEN_REFRESH_ADVANCE;
            if (refreshDelay > 0) {
              setTimeout(() => {
                refreshToken(savedToken);
              }, refreshDelay);
            } else {
              // 如果已经接近过期时间，立即刷新
              refreshToken(savedToken);
            }
          } else {
            // Token 已过期，清理数据
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('加载认证状态失败:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // 刷新 token
  const refreshToken = async (currentToken: string) => {
    try {
      const response = await authAPI.refreshToken(currentToken);
      const fullToken = response.tokenHead + response.token;

      setToken(fullToken);
      setUser({
        id: response.userId,
        username: response.username,
        avatar: response.avatar,
        authorities: response.authorities,
        mustChangePassword: response.mustChangePassword,
      });

      // 保存到 localStorage（假设 token 有效期为 24 小时）
      const expireTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('auth_token', fullToken);
      localStorage.setItem('auth_token_expire', expireTime.toString());
      localStorage.setItem('auth_user', JSON.stringify({
        id: response.userId,
        username: response.username,
        avatar: response.avatar,
        authorities: response.authorities,
        mustChangePassword: response.mustChangePassword,
      }));

      // 设置下一次刷新定时器
      setTimeout(() => {
        refreshToken(fullToken);
      }, 24 * 60 * 60 * 1000 - TOKEN_REFRESH_ADVANCE);

    } catch (error) {
      console.error('刷新 token 失败:', error);
      // 刷新失败，清理认证状态
      clearAuthData();
    }
  };

  // 清理认证数据
  const clearAuthData = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expire');
    localStorage.removeItem('auth_user');
  };

  // 登录
  const login = async (params: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authAPI.login(params);
      const fullToken = response.tokenHead + response.token;

      setToken(fullToken);
      setUser({
        id: response.userId,
        username: response.username,
        avatar: response.avatar,
        authorities: response.authorities,
        mustChangePassword: response.mustChangePassword,
      });
      setIsAuthenticated(true);

      // 保存到 localStorage（假设 token 有效期为 24 小时）
      const expireTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('auth_token', fullToken);
      localStorage.setItem('auth_token_expire', expireTime.toString());
      localStorage.setItem('auth_user', JSON.stringify({
        id: response.userId,
        username: response.username,
        avatar: response.avatar,
        authorities: response.authorities,
        mustChangePassword: response.mustChangePassword,
      }));

      // 设置自动刷新定时器（在过期前 5 分钟刷新）
      setTimeout(() => {
        refreshToken(fullToken);
      }, 24 * 60 * 60 * 1000 - TOKEN_REFRESH_ADVANCE);

    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const register = async (params: RegisterRequest): Promise<string> => {
    try {
      setLoading(true);
      const userId = await authAPI.register(params);
      return userId;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      clearAuthData();
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 自定义 hook 用于使用认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}

// HOC 用于保护需要认证的路由
export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">请先登录</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
