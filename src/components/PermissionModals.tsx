import { X, ChevronDown } from 'lucide-react';
import { Permission } from '../types';
import { useState, useEffect } from 'react';

interface PermissionModalProps {
  onClose: () => void;
  permission?: Permission;
  parentPermission?: Permission;
  onSubmit: (data: any) => void;
  allPermissions?: Permission[];
}

export function PermissionModal({
  onClose,
  permission,
  parentPermission,
  onSubmit,
  allPermissions = [],
}: PermissionModalProps) {
  const isEdit = !!permission;
  const isChild = !!parentPermission;

  // 用于排序输入的临时状态
  const [sortInput, setSortInput] = useState<string>(() => {
    const initialSort = permission?.sort || 0;
    return initialSort === 0 ? '' : String(initialSort);
  });

  // 获取默认权限类型
  const getDefaultType = () => {
    if (permission?.type) return permission.type; // 编辑时保持原类型
    if (isChild) return 3; // 新增子项默认为按钮
    return 1; // 新增根权限默认为目录
  };

  const [formData, setFormData] = useState({
    permCode: permission?.permCode || '',
    permName: permission?.permName || '',
    type: getDefaultType(),
    parentId: permission?.parentId || parentPermission?.id || 0,
    icon: permission?.icon || '',
    path: permission?.path || '',
    component: permission?.component || '',
    visible: permission?.visible ?? 1,
    enabled: permission?.enabled ?? 1,
    serviceCode: permission?.serviceCode || '',
    sort: permission?.sort || 0,
    remark: permission?.remark || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.permCode.trim()) {
      newErrors.permCode = '请输入权限码';
    } else if (!/^[a-zA-Z0-9:_-]+$/.test(formData.permCode)) {
      newErrors.permCode = '权限码只能包含字母、数字、冒号、下划线和连字符';
    }

    if (!formData.permName.trim()) {
      newErrors.permName = '请输入权限名称';
    }

    if (!formData.type) {
      newErrors.type = '请选择权限类型';
    }

    // 目录和菜单类型必须填写路由地址
    if (formData.type === 1 || formData.type === 2) {
      if (!formData.path.trim()) {
        newErrors.path = '请输入路由地址';
      }
    }

    // 菜单类型必须填写组件路径
    if (formData.type === 2) {
      if (!formData.component.trim()) {
        newErrors.component = '请输入组件路径';
      }
    }

    // 按钮类型不需要路由和组件，清空它们
    if (formData.type === 3) {
      setFormData(prev => ({ ...prev, path: '', component: '' }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // 提交前处理数据
      const submitData = { ...formData };

      // 按钮类型自动清空路由和组件
      if (submitData.type === 3) {
        submitData.path = '';
        submitData.component = '';
      }

      // 目录类型保留路由地址，但清空组件路径
      if (submitData.type === 1) {
        submitData.component = '';
      }

      onSubmit(submitData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[600px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">
            {isChild ? '新增子项' : isEdit ? '编辑权限' : '新增权限'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            {/* 左列 */}
            <div className="space-y-4">
              {/* 权限码 */}
              <div>
                <label className="block mb-2 text-sm font-normal text-gray-700">
                  <span className="text-red-500 mr-1">*</span>权限码
                </label>
                <input
                  type="text"
                  value={formData.permCode}
                  onChange={(e) => setFormData({ ...formData, permCode: e.target.value })}
                  placeholder="如: system:user:add"
                  disabled={isEdit}
                  className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all ${
                    isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                  } ${errors.permCode ? 'border-red-500' : ''}`}
                />
                {errors.permCode && <p className="mt-1 text-xs text-red-500">{errors.permCode}</p>}
              </div>

              {/* 权限名称 */}
              <div>
                <label className="block mb-2 text-sm font-normal text-gray-700">
                  <span className="text-red-500 mr-1">*</span>权限名称
                </label>
                <input
                  type="text"
                  value={formData.permName}
                  onChange={(e) => setFormData({ ...formData, permName: e.target.value })}
                  placeholder="输入权限名称"
                  className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.permName ? 'border-red-500' : ''}`}
                  maxLength={50}
                />
                {errors.permName && <p className="mt-1 text-xs text-red-500">{errors.permName}</p>}
              </div>

              {/* 权限类型 */}
              <div>
                <label className="block mb-2 text-sm font-normal text-gray-700">
                  <span className="text-red-500 mr-1">*</span>权限类型
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: Number(e.target.value) })}
                    className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none bg-white pr-10 ${errors.type ? 'border-red-500' : ''}`}
                  >
                    <option value="1">目录</option>
                    <option value="2">菜单</option>
                    <option value="3">按钮</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
              </div>

              {/* 图标 */}
              <div>
                <label className="block mb-2 text-sm font-normal text-gray-700">图标</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="如: user, setting"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  maxLength={100}
                />
              </div>

              {/* 路由地址 */}
              {formData.type !== 3 && (
                <div>
                  <label className="block mb-2 text-sm font-normal text-gray-700">
                    <span className="text-red-500 mr-1">*</span>路由地址
                  </label>
                  <input
                    type="text"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    placeholder="如: /system"
                    className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.path ? 'border-red-500' : ''}`}
                    maxLength={200}
                  />
                  {errors.path && <p className="mt-1 text-xs text-red-500">{errors.path}</p>}
                </div>
              )}

              {/* 组件路径 */}
              {formData.type === 2 && (
                <div>
                  <label className="block mb-2 text-sm font-normal text-gray-700">
                    <span className="text-red-500 mr-1">*</span>组件路径
                  </label>
                  <input
                    type="text"
                    value={formData.component}
                    onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                    placeholder="如: views/system/user/index"
                    className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all ${errors.component ? 'border-red-500' : ''}`}
                    maxLength={200}
                  />
                  {errors.component && <p className="mt-1 text-xs text-red-500">{errors.component}</p>}
                </div>
              )}
            </div>

            {/* 右列 */}
            <div className="space-y-4">
              {/* 产品服务 */}
              <div>
                <label className="block mb-2 text-sm font-normal text-gray-700">产品服务</label>
                <input
                  type="text"
                  value={formData.serviceCode}
                  onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                  placeholder="如: system"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  maxLength={50}
                />
              </div>

              {/* 状态：仅新增子项时显示 */}
              {isChild && (
                <>
                  {/* 可见性 */}
                  <div>
                    <label className="block mb-2 text-sm font-normal text-gray-700">可见性</label>
                    <div className="relative">
                      <select
                        value={formData.visible}
                        onChange={(e) => setFormData({ ...formData, visible: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none bg-white pr-10"
                      >
                        <option value={1}>显示</option>
                        <option value={0}>隐藏</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* 状态 */}
                  <div>
                    <label className="block mb-2 text-sm font-normal text-gray-700">状态</label>
                    <div className="relative">
                      <select
                        value={formData.enabled}
                        onChange={(e) => setFormData({ ...formData, enabled: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none bg-white pr-10"
                      >
                        <option value={1}>启用</option>
                        <option value={0}>禁用</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 排序 */}
              <div>
                <label className="block mb-2 text-sm font-normal text-gray-700">排序</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={sortInput}
                  onChange={(e) => {
                    const rawValue = e.target.value;

                    // 允许清空输入
                    if (rawValue === '') {
                      setSortInput('');
                      setFormData({ ...formData, sort: 0 });
                      return;
                    }

                    // 移除前导零（但保留单个0）
                    let value = rawValue;
                    if (value.length > 1 && value.startsWith('0')) {
                      value = value.replace(/^0+/, '');
                      // 如果移除后为空，说明全是0，保留一个
                      if (value === '') {
                        value = '0';
                      }
                    }

                    // 验证：只允许数字
                    if (/^\d+$/.test(value)) {
                      const num = Number(value);
                      if (num >= 0 && num <= 9999) {
                        setSortInput(value);
                        setFormData({ ...formData, sort: num });
                      }
                    }
                  }}
                  placeholder="请输入排序数字"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
                />
              </div>

              {/* 说明 */}
              <div>
                <label className="block mb-2 text-sm font-normal text-gray-700">说明</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="输入权限说明"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[100px] resize-y"
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            提交
          </button>
          <button
            onClick={onClose}
            className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
