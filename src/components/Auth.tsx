/**
 * 认证组件 - 登录和注册界面
 * 集成真实的认证API调用
 */

import { useState, type FormEvent } from 'react';
import { User, Lock, Mail, ChevronRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { encryptPassword } from '../utils/crypto';

interface AuthProps {
  onLoginSuccess?: () => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
  const { login, register, loading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单验证
  const validateLoginForm = () => {
    if (!username.trim()) {
      setError('请输入用户名');
      return false;
    }
    if (!password) {
      setError('请输入密码');
      return false;
    }
    if (password.length < 6) {
      setError('密码长度不能少于6位');
      return false;
    }
    return true;
  };

  const validateRegisterForm = () => {
    if (!username.trim()) {
      setError('请输入用户名');
      return false;
    }
    if (username.length < 3 || username.length > 50) {
      setError('用户名长度应在3-50个字符之间');
      return false;
    }
    if (!nickname.trim()) {
      setError('请输入昵称');
      return false;
    }
    if (!password) {
      setError('请输入密码');
      return false;
    }
    if (password.length < 6 || password.length > 20) {
      setError('密码长度应在6-20个字符之间');
      return false;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    if (mobile && !/^1[3-9]\d{9}$/.test(mobile)) {
      setError('请输入有效的手机号码');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateLoginForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // 加密密码
      let encryptedPassword = '';
      try {
        encryptedPassword = await encryptPassword(password);
      } catch (encryptError) {
        setError('密码加密失败，请检查网络连接');
        setIsSubmitting(false);
        return;
      }

      await login({ username, password: encryptedPassword });
      setSuccess('登录成功！');
      onLoginSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateRegisterForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // 加密密码
      let encryptedPassword = '';
      try {
        encryptedPassword = await encryptPassword(password);
      } catch (encryptError) {
        setError('密码加密失败，请检查网络连接');
        setIsSubmitting(false);
        return;
      }

      const userId = await register({
        username,
        nickname,
        password: encryptedPassword,
        mobile: mobile || undefined,
        email: email || undefined,
      });
      setSuccess(`注册成功！用户ID: ${userId}`);

      // 注册成功后自动切换到登录页面
      setTimeout(() => {
        setIsLogin(true);
        setError('');
        setSuccess('');
        // 清空表单
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setNickname('');
        setEmail('');
        setMobile('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="px-8 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {isLogin ? '欢迎登录' : '注册账号'}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isLogin ? '请输入您的账号和密码' : '填写以下信息创建新账号'}
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                用户名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={isLogin ? '请输入用户名' : '3-50个字符'}
                  minLength={isLogin ? undefined : 3}
                  maxLength={50}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    昵称 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="请输入昵称"
                      maxLength={50}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    邮箱
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="请输入邮箱地址（可选）"
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    手机号
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="请输入手机号（可选）"
                      maxLength={20}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  密码 <span className="text-red-500">*</span>
                </label>
                {isLogin && (
                  <a href="#" className="text-xs text-blue-600 hover:text-blue-500" onClick={(e) => e.preventDefault()}>
                    忘记密码?
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={isLogin ? '请输入密码' : '6-20个字符'}
                  minLength={isLogin ? undefined : 6}
                  maxLength={20}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="请再次输入密码"
                    minLength={6}
                    maxLength={20}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLogin ? '登录中...' : '注册中...'}
                </>
              ) : (
                <>
                  {isLogin ? '登录' : '注册'}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 安全提示 */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="h-3.5 w-3.5 text-green-600" />
            <span>密码采用 RSA 加密传输，保障您的账户安全</span>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '还没有账号?' : '已有账号?'}
              <button
                onClick={switchMode}
                disabled={isSubmitting}
                className="ml-1 text-blue-600 hover:text-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? '立即注册' : '返回登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
