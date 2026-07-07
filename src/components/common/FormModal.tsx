/**
 * 通用表单模态框组件
 * 提供统一的表单布局、验证和提交逻辑
 */

import { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { ReactNode } from 'react';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  validation?: (value: any) => string | undefined;
}

interface FormModalProps {
  title: string;
  onClose: (saved?: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  fields: FormFieldConfig[];
  initialData?: Record<string, any>;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  widthClass?: string;
  renderCustomField?: (field: FormFieldConfig, value: any, onChange: (value: any) => void, error?: string) => ReactNode;
}

export function FormModal({
  title,
  onClose,
  onSubmit,
  fields,
  initialData = {},
  submitText = '提交',
  cancelText = '取消',
  loading = false,
  widthClass,
  renderCustomField,
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = {};
    fields.forEach(field => {
      data[field.name] = initialData[field.name] !== undefined ? initialData[field.name] : '';
    });
    return data;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];

      // 必填验证
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field.name] = `${field.label}不能为空`;
        return;
      }

      // 最大长度验证
      if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
        newErrors[field.name] = `${field.label}最大长度为${field.maxLength}个字符`;
        return;
      }

      // 自定义验证
      if (field.validation) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose(true); // 保存成功，关闭模态框
    } catch (error) {
      console.error('提交失败:', error);
      const errorMessage = error instanceof Error ? error.message : '提交失败';
      // 这里可以显示错误提示
    } finally {
      setSubmitting(false);
    }
  };

  // 更新字段值
  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 渲染字段
  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name];
    const error = errors[field.name];

    // 如果有自定义渲染函数，使用它
    if (renderCustomField) {
      return renderCustomField(field, value, (newValue) => updateField(field.name, newValue), error);
    }

    // 默认渲染逻辑
    switch (field.type) {
      case 'text':
        return (
          <div key={field.name}>
            <label className="block mb-2 text-sm font-normal text-gray-700">
              {field.required && <span className="text-red-500 mr-1">*</span>}
              {field.label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all ${error ? 'border-red-500' : ''}`}
              disabled={submitting || loading}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name}>
            <label className="block mb-2 text-sm font-normal text-gray-700">
              {field.required && <span className="text-red-500 mr-1">*</span>}
              {field.label}
            </label>
            <textarea
              value={value}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[100px] resize-y ${error ? 'border-red-500' : ''}`}
              disabled={submitting || loading}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name}>
            <label className="block mb-2 text-sm font-normal text-gray-700">
              {field.required && <span className="text-red-500 mr-1">*</span>}
              {field.label}
            </label>
            <select
              value={value}
              onChange={(e) => updateField(field.name, e.target.value)}
              className={`w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all ${error ? 'border-red-500' : ''}`}
              disabled={submitting || loading}
            >
              <option value="">请选择{field.label}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateField(field.name, e.target.checked)}
                className="sr-only peer"
                disabled={submitting || loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
            <span className="ml-2 text-sm text-gray-600">{value ? '启用' : '禁用'}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ModalWrapper title={title} onClose={() => onClose(false)} widthClass={widthClass}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex-1 flex flex-col">
        {/* 表单内容 */}
        <div className="p-8 flex-grow space-y-6">
          {fields.map(field => renderField(field))}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-50 bg-white flex justify-end space-x-3">
          <button
            type="submit"
            disabled={submitting || loading}
            className="bg-blue-500 text-white px-8 py-2 rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? '提交中...' : submitText}
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={submitting || loading}
            className="bg-white text-gray-600 border border-gray-300 px-8 py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
