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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>({ type: 'roles' });
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  if (!isAuthenticated) {
    return <Auth onLogin={() => { setIsAuthenticated(true); setCurrentUser(mockUsers[0]); }} />;
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

  const handleCloseModal = () => {
    setModalState({ type: 'none' });
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <Sidebar 
        currentNav={viewState.type === 'roleDetail' ? 'roles' : (viewState.type === 'userDetail' ? 'users' : viewState.type)} 
        onNavChange={(nav) => setViewState({ type: nav as 'roles' | 'users' | 'permissions' | 'logs' })}
        onLogout={() => setIsAuthenticated(false)}
        currentUser={currentUser || undefined}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {viewState.type === 'roles' && (
          <RoleList 
            roles={mockRoles} 
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
            users={mockUsers} 
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

      {/* Modals */}
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
