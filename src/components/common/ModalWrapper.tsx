/**
 * 通用模态框包装组件
 * 提供统一的模态框布局和交互逻辑
 */

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalWrapperProps {
  children: ReactNode;
  title: string;
  onClose: () => void;
  widthClass?: string;
  showCloseButton?: boolean;
}

export function ModalWrapper({
  children,
  title,
  onClose,
  widthClass = 'max-w-[680px]',
  showCloseButton = true,
}: ModalWrapperProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`bg-white w-full ${widthClass} rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 内容区域 */}
        {children}
      </div>
    </div>
  );
}
