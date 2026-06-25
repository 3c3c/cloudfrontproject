import { useState, useRef } from 'react';
import { X, Search, Upload } from 'lucide-react';
import { mockRoles, mockPermissions } from '../data';

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">创建用户</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
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
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
              maxLength={64}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度64个字符，允许英文字母、数字或特殊符号</span>
              <span className="text-xs text-gray-400">0/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>用户名称
            </label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
              maxLength={64}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
              <span className="text-xs text-gray-400">0/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>手机号码
            </label>
            <input 
              type="text" 
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
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
            />
            <div className="mt-1.5">
              <span className="text-xs text-gray-400">允许中文、英文字母、数字或特殊符号，请填写正确的电子邮箱</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>初始密码
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="passwordType" value="default" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">默认密码</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="passwordType" value="custom" className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">自定义密码</span>
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

export function EditUserModal({ onClose, user }: { onClose: () => void; user: import('../types').User }) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">编辑用户基本信息</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
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
              defaultValue={user.account}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
              maxLength={64}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度64个字符，允许英文字母、数字或特殊符号</span>
              <span className="text-xs text-gray-400">{user.account.length}/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>用户名称
            </label>
            <input 
              type="text" 
              defaultValue={user.name}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
              maxLength={64}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
              <span className="text-xs text-gray-400">{user.name.length}/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>手机号码
            </label>
            <input 
              type="text" 
              defaultValue={user.phone}
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
              defaultValue={user.email}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all" 
            />
            <div className="mt-1.5">
              <span className="text-xs text-gray-400">允许中文、英文字母、数字或特殊符号，请填写正确的电子邮箱</span>
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

export function SelectRoleModal({ onClose, user }: { onClose: () => void; user?: import('../types').User }) {
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
                    <td className="p-3 text-center text-gray-700">{role.name}</td>
                    <td className="p-3 text-center text-gray-700">{role.description}</td>
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

export function UserPermissionModal({ onClose, user }: { onClose: () => void; user?: import('../types').User }) {
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

export function ResetPasswordModal({ onClose, user }: { onClose: () => void; user?: import('../types').User }) {
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
