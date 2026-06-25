import { Search, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Log } from '../types';

interface LogListProps {
  logs: Log[];
}

export function LogList({ logs }: LogListProps) {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="flex items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mr-3">日志管理</h2>
        <div className="group relative w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer">
          i
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-normal">
            记录系统中的操作日志，支持按操作人或操作内容进行检索。
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="请输入操作人或操作内容"
              className="border border-gray-300 rounded-full pl-4 pr-10 py-2 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button className="text-blue-500 hover:text-blue-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200 flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></th>
                <th className="p-4 font-medium text-center">操作时间</th>
                <th className="p-4 font-medium text-center">操作人</th>
                <th className="p-4 font-medium text-center">操作模块</th>
                <th className="p-4 font-medium text-center">操作内容</th>
                <th className="p-4 font-medium text-center">IP地址</th>
                <th className="p-4 font-medium text-center">操作状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-blue-50/50">
                  <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" /></td>
                  <td className="p-4 text-center text-gray-700">{log.time}</td>
                  <td className="p-4 text-center text-gray-700">{log.user}</td>
                  <td className="p-4 text-center text-gray-700">{log.module}</td>
                  <td className="p-4 text-center text-gray-700">{log.action}</td>
                  <td className="p-4 text-center text-gray-700">{log.ip}</td>
                  <td className="p-4 text-center">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center text-emerald-500 text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> 成功
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-500 text-sm">
                        <XCircle className="w-4 h-4 mr-1" /> 失败
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 p-4 bg-white flex justify-between items-center shrink-0">
          <span className="text-sm text-gray-400">共 {logs.length} 条记录</span>
          <div className="flex space-x-1 items-center">
            <button className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm">3</button>
            <button className="p-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
