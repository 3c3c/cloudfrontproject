import { X } from 'lucide-react';
import { Permission } from '../types';

interface PermissionModalProps {
  onClose: () => void;
  permission?: Permission;
}

export function PermissionModal({ onClose, permission }: PermissionModalProps) {
  const isEdit = !!permission;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[680px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">{isEdit ? '编辑权限' : '新增权限'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-grow overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>权限名称
            </label>
            <input
              type="text"
              defaultValue={permission?.name || ''}
              placeholder="输入权限名称"
              disabled={isEdit}
              className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all ${
                isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
              }`}
              maxLength={64}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>最大长度64个字符，允许中文、英文字母、数字或特殊符号</span>
              <span>0/64</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              权限说明
            </label>
            <textarea
              defaultValue={permission?.description || ''}
              placeholder="输入权限说明，便于记忆哦"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[100px] resize-y"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-normal text-gray-700">
              <span className="text-red-500 mr-1">*</span>产品服务
            </label>
            <select className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-600 appearance-none bg-white">
              <option value="">请选择产品服务</option>
            </select>
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
