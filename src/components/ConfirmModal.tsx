/**
 * 确认弹框组件
 * 与现有系统风格保持一致
 */

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

type ConfirmType = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  details?: string[];
}

const typeConfig = {
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    buttonBgColor: 'bg-amber-500',
    buttonHoverColor: 'hover:bg-amber-600',
  },
  danger: {
    icon: <AlertCircle className="w-6 h-6 text-red-500" />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    buttonBgColor: 'bg-red-500',
    buttonHoverColor: 'hover:bg-red-600',
  },
  info: {
    icon: <Info className="w-6 h-6 text-blue-500" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    buttonBgColor: 'bg-blue-500',
    buttonHoverColor: 'hover:bg-blue-600',
  },
  success: {
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    buttonBgColor: 'bg-green-500',
    buttonHoverColor: 'hover:bg-green-600',
  },
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  details = [],
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[500px] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className={`flex items-start gap-3 ${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
            <div className="flex-shrink-0 mt-0.5">
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${config.textColor} mb-2`}>{message}</p>
              {details.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1 mt-3">
                  {details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="flex-1">{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="bg-white text-gray-600 border border-gray-300 px-6 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${config.buttonBgColor} ${config.buttonHoverColor} text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}