import { useState } from 'react';
import { ShieldCheck, Users, Key, ChevronDown, Menu, LogOut, FolderLock, Settings, ScrollText } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentNav?: string;
  onNavChange?: (nav: string) => void;
  onLogout?: () => void;
  currentUser?: User;
}

export function Sidebar({ currentNav = 'roles', onNavChange, onLogout, currentUser }: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full z-10 relative transition-all duration-300 ease-in-out`}>
      <div className={`p-6 border-b border-gray-100 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} h-[72px]`}>
        {isSidebarOpen && <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap overflow-hidden transition-opacity duration-300">系统管理后台</h1>}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100 shrink-0"
          title={isSidebarOpen ? "收起菜单栏" : "展开菜单栏"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <div className="relative group/parent">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-6 py-2' : 'justify-center flex-col py-2.5 px-1'} text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:bg-gray-50 transition-colors cursor-pointer`}
            title={!isSidebarOpen ? "权限管理" : ""}
          >
            {isSidebarOpen ? (
              <>
                <span className="whitespace-nowrap">权限管理</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isMenuOpen ? '' : '-rotate-90'}`} />
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-0.5">
                  <FolderLock className="w-5 h-5 text-gray-600 group-hover/parent:text-blue-500 transition-colors" />
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isMenuOpen ? '' : '-rotate-90'}`} />
                </div>
                <span className="text-[10px] text-gray-500 font-medium mt-1 scale-90 tracking-tighter whitespace-nowrap">权限管理</span>
              </div>
            )}
          </button>

          {!isSidebarOpen && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 opacity-0 invisible group-hover/parent:opacity-100 group-hover/parent:visible transition-all duration-200 z-50">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 flex items-center justify-between">
                <span>权限管理</span>
                <span className="text-[10px] font-normal text-gray-400">分级菜单</span>
              </div>
              <ul className="space-y-1">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('roles'); }} className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-colors ${currentNav === 'roles' ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <ShieldCheck className="w-4 h-4 mr-2.5 shrink-0" />
                    <span>角色管理</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('users'); }} className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-colors ${currentNav === 'users' ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Users className="w-4 h-4 mr-2.5 shrink-0" />
                    <span>用户管理</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('permissions'); }} className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-colors ${currentNav === 'permissions' ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Key className="w-4 h-4 mr-2.5 shrink-0" />
                    <span>权限管理</span>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className={`transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <ul className="space-y-1">
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('roles'); }} className={`flex items-center ${isSidebarOpen ? 'px-6 py-3' : 'justify-center flex-col py-2.5 px-1'} transition-colors relative ${currentNav === 'roles' ? 'bg-blue-50 text-blue-500 border-r-4 border-blue-500 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title={!isSidebarOpen ? "角色管理" : ""}>
                <ShieldCheck className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : 'mb-1'} shrink-0`} />
                {isSidebarOpen ? (
                  <span className="whitespace-nowrap">角色管理</span>
                ) : (
                  <span className="text-[10px] scale-90 tracking-tighter text-center truncate max-w-[72px]">角色管理</span>
                )}
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('users'); }} className={`flex items-center ${isSidebarOpen ? 'px-6 py-3' : 'justify-center flex-col py-2.5 px-1'} transition-colors relative ${currentNav === 'users' ? 'bg-blue-50 text-blue-500 border-r-4 border-blue-500 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title={!isSidebarOpen ? "用户管理" : ""}>
                <Users className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : 'mb-1'} shrink-0`} />
                {isSidebarOpen ? (
                  <span className="whitespace-nowrap">用户管理</span>
                ) : (
                  <span className="text-[10px] scale-90 tracking-tighter text-center truncate max-w-[72px]">用户管理</span>
                )}
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('permissions'); }} className={`flex items-center ${isSidebarOpen ? 'px-6 py-3' : 'justify-center flex-col py-2.5 px-1'} transition-colors relative ${currentNav === 'permissions' ? 'bg-blue-50 text-blue-500 border-r-4 border-blue-500 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title={!isSidebarOpen ? "权限管理" : ""}>
                <Key className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : 'mb-1'} shrink-0`} />
                {isSidebarOpen ? (
                  <span className="whitespace-nowrap">权限管理</span>
                ) : (
                  <span className="text-[10px] scale-90 tracking-tighter text-center truncate max-w-[72px]">权限管理</span>
                )}
              </a>
            </li>
          </ul>
        </div>

        <div className="relative group/system">
          <button
            onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-6 py-2' : 'justify-center flex-col py-2.5 px-1'} text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:bg-gray-50 transition-colors cursor-pointer`}
            title={!isSidebarOpen ? "系统管理" : ""}
          >
            {isSidebarOpen ? (
              <>
                <span className="whitespace-nowrap">系统管理</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isSystemMenuOpen ? '' : '-rotate-90'}`} />
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-0.5">
                  <Settings className="w-5 h-5 text-gray-600 group-hover/system:text-blue-500 transition-colors" />
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isSystemMenuOpen ? '' : '-rotate-90'}`} />
                </div>
                <span className="text-[10px] text-gray-500 font-medium mt-1 scale-90 tracking-tighter whitespace-nowrap">系统管理</span>
              </div>
            )}
          </button>

          {!isSidebarOpen && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 opacity-0 invisible group-hover/system:opacity-100 group-hover/system:visible transition-all duration-200 z-50">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 flex items-center justify-between">
                <span>系统管理</span>
                <span className="text-[10px] font-normal text-gray-400">分级菜单</span>
              </div>
              <ul className="space-y-1">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('logs'); }} className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-colors ${currentNav === 'logs' ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <ScrollText className="w-4 h-4 mr-2.5 shrink-0" />
                    <span>日志管理</span>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className={`transition-all duration-300 ease-in-out ${isSystemMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <ul className="space-y-1">
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavChange?.('logs'); }} className={`flex items-center ${isSidebarOpen ? 'px-6 py-3' : 'justify-center flex-col py-2.5 px-1'} transition-colors relative ${currentNav === 'logs' ? 'bg-blue-50 text-blue-500 border-r-4 border-blue-500 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} title={!isSidebarOpen ? "日志管理" : ""}>
                <ScrollText className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : 'mb-1'} shrink-0`} />
                {isSidebarOpen ? (
                  <span className="whitespace-nowrap">日志管理</span>
                ) : (
                  <span className="text-[10px] scale-90 tracking-tighter text-center truncate max-w-[72px]">日志管理</span>
                )}
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <div className="border-t border-gray-100 p-4">
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between px-2' : 'flex-col-reverse gap-4'}`}>
          <button 
            onClick={onLogout}
            className={`flex items-center text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors`}
            title="退出登录"
          >
            <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'mr-2' : ''} shrink-0`} />
            {isSidebarOpen && <span className="whitespace-nowrap font-medium text-sm">退出登录</span>}
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold border border-blue-200 shrink-0 overflow-hidden" title="当前用户">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="User avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
