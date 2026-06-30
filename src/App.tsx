/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RoleList } from './components/RoleList';
import { RoleDetail } from './components/RoleDetail';
import { UserList } from './components/UserList';
import { UserDetail } from './components/UserDetail';
import { PermissionList } from './components/PermissionList';
import { LogList } from './components/LogList';
import { CreateRoleModal, EditRoleModal, RoleMemberModal, RolePermissionModal } from './components/RoleModals';
import { CreateUserModal, EditUserModal, SelectRoleModal, UserPermissionModal, ResetPasswordModal } from './components/UserModals';
import { PermissionModal, BatchAuthorizeModal } from './components/PermissionModals';
import { Auth } from './components/Auth';
import { ViewState, ModalState, Role, User, Permission } from './types';
import { mockRoles, mockUsers, mockPermissions, mockLogs } from './data';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function MainApp() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [viewState, setViewState] = useState<ViewState>({ type: 'roles' });
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const handleOpenModal = (type: ModalState['type'], data?: Role | User | Permission) => {
    if (type === 'none' || type === 'createRole' || type === 'createUser' || type === 'createPermission') {
      setModalState({ type } as ModalState);
    } else if (type === 'editUser' && data) {
      setModalState({ type, user: data as User } as ModalState);
    } else if ((type === 'selectRole' || type === 'userPermission' || type === 'resetPassword') && data) {
      setModalState({ type, user: data as User } as ModalState);
    } else if ((type === 'editPermission' || type === 'batchAuthorize') && data) {
      setModalState({ type, permission: data as Permission } as ModalState);
    } else if (data) {
      setModalState({ type, role: data as Role } as ModalState);
    }
  };

  const handleCloseModal = (shouldRefresh = false) => {
    const currentType = modalState.type;
    setModalState({ type: 'none' });

    // 只有在明确需要刷新时才刷新列表（如创建、编辑成功后）
    if (shouldRefresh && ['createRole', 'editRole', 'roleMember', 'rolePermission', 'createUser', 'editUser', 'selectRole', 'userPermission', 'resetPassword'].includes(currentType)) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const currentUser = user ? {
    id: user.id,
    account: user.username,
    name: user.username,
    avatar: user.avatar,
    authorities: user.authorities,
  } as User : null;

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <Sidebar
        currentNav={viewState.type === 'roleDetail' ? 'roles' : (viewState.type === 'userDetail' ? 'users' : viewState.type)}
        onNavChange={(nav) => setViewState({ type: nav as 'roles' | 'users' | 'permissions' | 'logs' })}
        onLogout={logout}
        currentUser={currentUser || undefined}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {viewState.type === 'roles' && (
          <RoleList
            refreshKey={refreshKey}
            onViewDetail={(role) => setViewState({ type: 'roleDetail', role })}
            openModal={handleOpenModal}
          />
        )}

        {viewState.type === 'roleDetail' && (
          <RoleDetail
            role={viewState.role}
            onBack={() => setViewState({ type: 'roles' })}
            openModal={handleOpenModal}
          />
        )}

        {viewState.type === 'users' && (
          <UserList
            refreshKey={refreshKey}
            onViewDetail={(user) => setViewState({ type: 'userDetail', user })}
            openModal={handleOpenModal}
          />
        )}

        {viewState.type === 'userDetail' && (
          <UserDetail
            user={viewState.user}
            onBack={() => setViewState({ type: 'users' })}
            openModal={handleOpenModal}
          />
        )}

        {viewState.type === 'permissions' && (
          <PermissionList permissions={mockPermissions} openModal={handleOpenModal} />
        )}

        {viewState.type === 'logs' && (
          <LogList logs={mockLogs} />
        )}
      </main>

      {modalState.type === 'createRole' && <CreateRoleModal onClose={handleCloseModal} />}
      {modalState.type === 'editRole' && <EditRoleModal onClose={handleCloseModal} role={modalState.role} />}
      {modalState.type === 'roleMember' && <RoleMemberModal onClose={handleCloseModal} role={modalState.role} />}
      {modalState.type === 'rolePermission' && <RolePermissionModal onClose={handleCloseModal} role={modalState.role} />}
      {modalState.type === 'createUser' && <CreateUserModal onClose={handleCloseModal} />}
      {modalState.type === 'editUser' && <EditUserModal onClose={handleCloseModal} user={modalState.user} />}
      {modalState.type === 'selectRole' && <SelectRoleModal onClose={handleCloseModal} user={modalState.user} />}
      {modalState.type === 'userPermission' && <UserPermissionModal onClose={handleCloseModal} user={modalState.user} />}
      {modalState.type === 'resetPassword' && <ResetPasswordModal onClose={handleCloseModal} user={modalState.user} />}
      {modalState.type === 'createPermission' && <PermissionModal onClose={handleCloseModal} />}
      {modalState.type === 'editPermission' && <PermissionModal onClose={handleCloseModal} permission={modalState.permission} />}
      {modalState.type === 'batchAuthorize' && <BatchAuthorizeModal onClose={handleCloseModal} permission={modalState.permission} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
