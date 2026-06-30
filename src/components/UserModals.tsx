import { useState, useRef, type ChangeEvent, useEffect, type FormEvent } from 'react';
import { X, Search, Upload, Eye, EyeOff } from 'lucide-react';
import { mockRoles, mockPermissions } from '../data';
import { userAPI } from '../api/userApi';
import { encryptPassword } from '../utils/crypto';
import { ConfirmModal } from './ConfirmModal';

interface CreateUserModalProps {
  onClose: (shouldRefresh?: boolean) => void;
}

interface EditUserModalProps {
  onClose: (shouldRefresh?: boolean) => void;
  user: import('../types').User;
}

interface SelectRoleModalProps {
  onClose: () => void;
  user?: import('../types').User;
}

interface UserPermissionModalProps {
  onClose: () => void;
  user?: import('../types').User;
}

interface ResetPasswordModalProps {
  onClose: () => void;
  user?: import('../types').User;
}

export function CreateUserModal({ onClose }: CreateUserModalProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    mobile: '',
    email: '',
    password: '',
    avatar: '',
  });
  const [passwordType, setPasswordType] = useState<'default' | 'custom'>('default');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    nickname: '',
    mobile: '',
    email: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证用户账号
  const validateUsername = (value: string): string => {
    if (!value.trim()) {
      return '用户账号不能为空';
    }
    if (value.length > 64) {
      return '用户账号最大长度64个字符';
    }
    // 只允许英文字母、数字或特殊符号
    if (!/^[a-zA-Z0-9_@.\\-]+$/.test(value)) {
      return '用户账号只允许英文字母、数字或特殊符号(_@.\\-)';
    }
    return '';
  };

  // 验证用户名称
  const validateNickname = (value: string): string => {
    if (!value.trim()) {
      return '用户名称不能为空';
    }
    if (value.length > 64) {
      return '用户名称最大长度64个字符';
    }
    return '';
  };

  // 验证手机号码
  const validateMobile = (value: string): string => {
    if (!value.trim()) {
      return '手机号码不能为空';
    }
    if (!/^1\d{10}$/.test(value)) {
      return '手机号码格式不正确，只允许填写11位数字';
    }
    return '';
  };

  // 验证邮箱
  const validateEmail = (value: string): string => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '电子邮箱格式不正确';
    }
    return '';
  };

  // 处理输入变化并实时验证
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 实时验证
    let error = '';
    switch (field) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'nickname':
        error = validateNickname(value);
        break;
      case 'mobile':
        error = validateMobile(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setFormData(prev => ({ ...prev, avatar: url }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 检查所有字段验证
    const usernameError = validateUsername(formData.username);
    const nicknameError = validateNickname(formData.nickname);
    const mobileError = validateMobile(formData.mobile);
    const emailError = validateEmail(formData.email);

    setFieldErrors({
      username: usernameError,
      nickname: nicknameError,
      mobile: mobileError,
      email: emailError,
    });

    // 如果有错误，阻止提交
    if (usernameError || nicknameError || mobileError || emailError) {
      setErrorMessage('请修正表单中的错误');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      // 如果是自定义密码，需要加密
      let encryptedPassword = '';
      if (passwordType === 'default') {
        encryptedPassword = await encryptPassword('123456'); // 默认密码
      } else if (formData.password) {
        encryptedPassword = await encryptPassword(formData.password);
      } else {
        encryptedPassword = await encryptPassword('123456');
      }

      await userAPI.createUser({
        username: formData.username,
        nickname: formData.nickname,
        password: encryptedPassword,
        mobile: formData.mobile || undefined,
        email: formData.email || undefined,
        avatar: formData.avatar || undefined,
      });

      onClose(true); // 关闭弹窗并刷新列表
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '创建用户失败');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">创建用户</h2>
          <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="mb-6 flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 border border-gray-200 group-hover:bg-gray-200 transition-colors">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">上传头像</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>用户账号
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-400 transition-all ${
                fieldErrors.username ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
              }`}
              maxLength={64}
            />
            {fieldErrors.username ? (
              <div className="mt-1.5 text-xs text-red-500">{fieldErrors.username}</div>
            ) : (
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">最大长度64个字符，允许英文字母、数字或特殊符号</span>
                <span className="text-xs text-gray-400">{formData.username.length}/64</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>用户名称
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className={`w-full border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-400 transition-all ${
                fieldErrors.nickname ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
              }`}
              maxLength={64}
            />
            {fieldErrors.nickname ? (
              <div className="mt-1.5 text-xs text-red-500">{fieldErrors.nickname}</div>
            ) : (
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
                <span className="text-xs text-gray-400">{formData.nickname.length}/64</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>手机号码
            </label>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              maxLength={11}
              className={`w-full border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-400 transition-all ${
                fieldErrors.mobile ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
              }`}
            />
            {fieldErrors.mobile ? (
              <div className="mt-1.5 text-xs text-red-500">{fieldErrors.mobile}</div>
            ) : (
              <div className="mt-1.5">
                <span className="text-xs text-gray-400">只允许填写11位数字</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              电子邮箱
            </label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-400 transition-all ${
                fieldErrors.email ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
              }`}
            />
            {fieldErrors.email ? (
              <div className="mt-1.5 text-xs text-red-500">{fieldErrors.email}</div>
            ) : (
              <div className="mt-1.5">
                <span className="text-xs text-gray-400">允许中文、英文字母、数字或特殊符号，请填写正确的电子邮箱</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>初始密码
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="passwordType"
                  value="default"
                  checked={passwordType === 'default'}
                  onChange={() => setPasswordType('default')}
                  className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">默认密码</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="passwordType"
                  value="custom"
                  checked={passwordType === 'custom'}
                  onChange={() => setPasswordType('custom')}
                  className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">自定义密码</span>
              </label>
            </div>
            {passwordType === 'custom' && (
              <div className="mt-3 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="请输入自定义密码"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '提交'}
          </button>
          <button
            type="button"
            onClick={() => onClose()}
            disabled={loading}
            className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>
      </div>

      {/* 错误提示弹框 */}
      <ConfirmModal
        isOpen={showErrorModal}
        title="提示"
        message={errorMessage}
        type="info"
        confirmText="知道了"
        cancelText="取消"
        onConfirm={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
      />
    </div>
  );
}

export function EditUserModal({ onClose, user }: EditUserModalProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [formData, setFormData] = useState({
    username: user.account,
    nickname: user.name,
    mobile: user.mobile || user.phone || '',
    email: user.email || '',
    avatar: user.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setFormData(prev => ({ ...prev, avatar: url }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!formData.username.trim()) {
      setErrorMessage('用户账号不能为空');
      setShowErrorModal(true);
      return;
    }
    if (formData.username.length > 64) {
      setErrorMessage('用户账号最大长度64个字符');
      setShowErrorModal(true);
      return;
    }
    if (!formData.nickname.trim()) {
      setErrorMessage('用户名称不能为空');
      setShowErrorModal(true);
      return;
    }
    if (formData.nickname.length > 64) {
      setErrorMessage('用户名称最大长度64个字符');
      setShowErrorModal(true);
      return;
    }
    if (formData.mobile && !/^1\d{10}$/.test(formData.mobile)) {
      setErrorMessage('手机号码格式不正确');
      setShowErrorModal(true);
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('电子邮箱格式不正确');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      await userAPI.updateUser(user.id, {
        username: formData.username,
        nickname: formData.nickname,
        mobile: formData.mobile || undefined,
        email: formData.email || undefined,
        avatar: formData.avatar || undefined,
      });

      onClose(true); // 关闭弹窗并刷新列表
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '更新用户失败');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">编辑用户基本信息</h2>
          <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="mb-6 flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-3xl font-semibold border border-blue-200 group-hover:bg-blue-200 transition-colors">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px]">修改头像</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>用户账号
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
              maxLength={64}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度64个字符，允许英文字母、数字或特殊符号</span>
              <span className="text-xs text-gray-400">{formData.username.length}/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>用户名称
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
              maxLength={64}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
              <span className="text-xs text-gray-400">{formData.nickname.length}/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>手机号码
            </label>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              maxLength={11}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
            <div className="mt-1.5">
              <span className="text-xs text-gray-400">只允许填写11位数字</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              电子邮箱
            </label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
            <div className="mt-1.5">
              <span className="text-xs text-gray-400">允许中文、英文字母、数字或特殊符号，请填写正确的电子邮箱</span>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '提交'}
          </button>
          <button
            type="button"
            onClick={() => onClose()}
            disabled={loading}
            className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>
      </div>

      {/* 错误提示弹框 */}
      <ConfirmModal
        isOpen={showErrorModal}
        title="提示"
        message={errorMessage}
        type="info"
        confirmText="知道了"
        cancelText="取消"
        onConfirm={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
      />
    </div>
  );
}

export function SelectRoleModal({ onClose, user }: SelectRoleModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">选择角色</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-sm mb-6 flex items-start">
            <div className="w-5 h-5 border border-amber-400 flex items-center justify-center mr-3 mt-0.5 shrink-0 bg-amber-100">
              <div className="w-3 h-3 border-b-2 border-r-2 border-amber-500 rotate-45 transform origin-center -translate-y-0.5"></div>
            </div>
            <span className="text-sm font-medium">用户加入到角色后，将拥有该角色的所有权限。</span>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>角色名称
            </label>
            <input
              type="text"
              disabled
              value={user?.name || ''}
              placeholder="角色名称"
              className="w-full border border-gray-200 bg-gray-50 rounded-sm px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              选择角色
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="请输入角色名称或角色说明"
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
              />
              <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-red-500 mb-2">请选择角色</div>

          <div className="border border-gray-200 rounded-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="p-3 w-12 text-center"></th>
                  <th className="p-3 font-medium text-center">角色名称</th>
                  <th className="p-3 font-medium text-center">角色说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockRoles.map((role, i) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" /></td>
                    <td className="p-3 text-center text-gray-700">{role.roleName}</td>
                    <td className="p-3 text-center text-gray-700">{role.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button onClick={onClose} className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">提交</button>
          <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">取消</button>
        </div>
      </div>
    </div>
  );
}

export function UserPermissionModal({ onClose, user }: UserPermissionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">添加权限</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>用户账号
            </label>
            <input
              type="text"
              disabled
              value={user?.account || ''}
              placeholder="用户账号"
              className="w-full border border-gray-200 bg-gray-50 rounded-sm px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              选择权限
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="请输入权限策略名称或说明"
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
              />
              <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-red-500 mb-2">请选择权限策略</div>

          <div className="border border-gray-200 rounded-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="p-3 w-12 text-center"></th>
                  <th className="p-3 font-medium text-center">权限名称</th>
                  <th className="p-3 font-medium text-center">权限说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockPermissions.map((permission, i) => (
                  <tr key={permission.id} className={`transition-colors ${permission.name === 'system1-msg-readaccess' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-3 text-center"><input type="checkbox" defaultChecked={permission.name === 'system1-msg-readaccess'} className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer" /></td>
                    <td className={`p-3 text-center ${permission.name === 'system1-msg-readaccess' ? 'text-blue-500' : 'text-gray-700'}`}>{permission.name}</td>
                    <td className="p-3 text-center text-gray-700">{permission.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button onClick={onClose} className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">提交</button>
          <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">取消</button>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordModal({ onClose, user }: ResetPasswordModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">重置密码</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <label className="block mb-3 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>重置登录密码
            </label>
            <div className="flex items-center space-x-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="resetType" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">默认密码</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="resetType" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">随机密码</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="resetType" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">自定义密码</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>密码生效时间
            </label>
            <div className="flex items-center space-x-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="effectiveTime" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">立即生效</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="effectiveTime" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">次日生效</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>通知用户新密码方式
            </label>
            <div className="flex items-center space-x-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="notifyMethod" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">短信通知</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="notifyMethod" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">邮箱通知</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="notifyMethod" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">其他方式</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>下次登录后是否要求修改密码
            </label>
            <div className="flex items-center space-x-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="requireChange" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">无需修改</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="requireChange" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">下次登录时必须修改密码</span>
              </label>
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button onClick={onClose} className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">提交</button>
          <button onClick={onClose} className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">取消</button>
        </div>
      </div>
    </div>
  );
}
