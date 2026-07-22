import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Popover from '@mui/material/Popover';

import { users, enableUser, disableUser, deleteUser } from "../../services/api";
import { Trash2, UserX, UserCheck, MoreVertical, Pencil } from "lucide-react";
import AlertModal from "../AlertModal/AlertModal";
import GenericPanel from "../GenericPanel/GenericPanel";
import TableA from "../screens/components/TableA";
import UserAvatar from "../screens/components/Profile/Avatar/Index";

// Asegúrate de que estas rutas coincidan con tu estructura de archivos
import Button from "../screens/components/Button/index";
import EditProfileForm from "../EditProfile/EditProfile"; 
import DrawPanel from "../screens/components/DrawPanel/index"; // Ruta a tu nuevo componente DrawPanel

const Users = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [showConfirm, setShowConfirm] = useState(false);  
  const [userToDelete, setUserToDelete] = useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  
  // Estados para el Popover y menú de acciones
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  
  // Estados para el panel lateral de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false); // Para deshabilitar botones al guardar

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const pageCount = Math.ceil(userList.length / itemsPerPage);
  
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return userList.slice(start, start + itemsPerPage);
  }, [userList, page]);

  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await users();
      setUserList(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setActiveUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleToggleStatusClick = () => {
    setUserToToggle({ ...activeUser, nextStatus: !activeUser.activo });
    setShowStatusConfirm(true);
    handleCloseMenu();
  };

  const handleDeleteClick = () => {
    if (activeUser?.rol === "Admin") {
      setAlertMessage("No se puede eliminar un usuario con rol de Admin");
      setAlertType("error");
      setShowAlert(true);
      handleCloseMenu();
      return;
    }
    setUserToDelete(activeUser);
    setShowConfirm(true);
    handleCloseMenu();
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    handleCloseMenu();
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    try {
      if (userToToggle.activo) {
        await disableUser(userToToggle.id);
      } else {
        await enableUser(userToToggle.id);
      }
      setUserList((prev) =>
        prev.map((user) =>
          user.id === userToToggle.id ? { ...user, activo: !userToToggle.activo } : user
        )
      );
      setAlertMessage(
        userToToggle.activo
          ? `Usuario ${userToToggle.nombre} ${userToToggle.apellido} deshabilitado correctamente`
          : `Usuario ${userToToggle.nombre} ${userToToggle.apellido} habilitado correctamente`
      );
      setAlertType("success");
    } catch (error) {
      setAlertMessage("Error al cambiar el estado del usuario");
      setAlertType("error");
    }
    setShowAlert(true);
    setShowStatusConfirm(false);
    setUserToToggle(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setUserList((prev) => prev.filter((user) => user.id !== userToDelete.id));
      setAlertMessage("Usuario eliminado correctamente");
      setAlertType("success");
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlertMessage("Error al eliminar el usuario");
      setAlertType("error");
    }
    setShowAlert(true);
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleEditSuccess = (finalName, finalAvatarUrl) => {
    setShowEditModal(false);
    setAlertMessage("Usuario actualizado correctamente");
    setAlertType("success");
    setShowAlert(true);
    fetchUsers(); 
  };

  const columns = [
    {
      header: 'Usuario',
      render: (user) => (
        <UserAvatar
          src={user.avatarUrl}
          name={user.nombre}
          size={28}
          editable={false}
        />
      )
    },
    {
      header: 'Nombre Completo',
      render: (user) => (
        <span style={{ fontWeight: 500 }}>{user.nombre} {user.apellido}</span>
      )
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Rol',
      render: (user) => (
        <span style={{ backgroundColor: '#ebf5ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {user.rol}
        </span>
      )
    },
    {
      header: 'Estado',
      render: (user) => (
        <span style={{ color: user.activo ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
          {user.activo ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      header: 'Acciones',
      align: 'center',
      render: (user) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="ghost"
            circle
            size="small"
            icon={MoreVertical}
            onClick={(e) => handleOpenMenu(e, user)}
            ToolTip="Opciones"
          />
        </div>
      )
    }
  ];

  return (
    <GenericPanel
      title="Gestión de Usuarios"
      message="Administra los usuarios del sistema, sus roles y estados."
      role="admin"
      menuTitle="Panel de Administración"
      showPagination={true}
      paginationCount={pageCount}
      paginationPage={page}
      onPaginationChange={(e, v) => setPage(v)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        
        <TableA
          columns={columns}
          data={paginatedUsers}
          loading={loading}
          keyExtractor={(user) => user.id}
        />

        {/* Popover de Opciones de Fila */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            style: { padding: '8px', borderRadius: '12px', minWidth: '160px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Button
              variant="ghost"
              icon={Pencil}
              onClick={handleEditClick}
              style={{ justifyContent: 'flex-start', fontWeight: 500 }}
              fullWidth
            >
              Editar usuario
            </Button>
            
            <Button
              variant="ghost"
              icon={activeUser?.activo ? UserX : UserCheck}
              color={activeUser?.activo ? "var(--color-warning, #f59e0b)" : "var(--color-success, #10b981)"}
              onClick={handleToggleStatusClick}
              style={{ justifyContent: 'flex-start', fontWeight: 500 }}
              fullWidth
            >
              {activeUser?.activo ? "Deshabilitar" : "Habilitar"}
            </Button>
            
            <Button
              variant="ghost"
              color="red"
              icon={Trash2}
              onClick={handleDeleteClick}
              style={{ justifyContent: 'flex-start', fontWeight: 500 }}
              fullWidth
            >
              Eliminar usuario
            </Button>
          </div>
        </Popover>

        {/* DrawPanel para Editar Usuario */}
        <DrawPanel
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Editar Usuario"
          width="400px"
          showActions={true}
          confirmText="Guardar Cambios"
          cancelText="Cancelar"
          formId="edit-user-form"
          loading={editLoading}
        >
          {activeUser && (
            <EditProfileForm
              formId="edit-user-form"
              userId={activeUser.id}
              currentName={`${activeUser.nombre || ''} ${activeUser.apellido || ''}`.trim()}
              currentAvatarUrl={activeUser.avatarUrl}
              onSaveStart={() => setEditLoading(true)}
              onSaveEnd={() => setEditLoading(false)}
              onSuccess={handleEditSuccess}
              onError={(err) => {
                setAlertMessage(err || "Error al actualizar el usuario");
                setAlertType("error");
                setShowAlert(true);
              }}
            />
          )}
        </DrawPanel>

        {/* Modales de Confirmación y Alertas */}
        {showAlert && (
          <AlertModal message={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />
        )}
        {showConfirm && userToDelete && (
          <AlertModal
            open={showConfirm}
            title="Confirmar eliminación"
            message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete.nombre} ${userToDelete.apellido}? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            onClose={() => { setShowConfirm(false); setUserToDelete(null); }}
            onConfirm={confirmDelete}
          />
        )}
        {showStatusConfirm && userToToggle && (
          <AlertModal
            open={showStatusConfirm}
            title={userToToggle.activo ? "Confirmar deshabilitación" : "Confirmar habilitación"}
            message={userToToggle.activo
              ? `¿Estás seguro de que deseas deshabilitar al usuario ${userToToggle.nombre} ${userToToggle.apellido}?`
              : `¿Estás seguro de que deseas habilitar al usuario ${userToToggle.nombre} ${userToToggle.apellido}?`}
            confirmText={userToToggle.activo ? "Deshabilitar" : "Habilitar"}
            cancelText="Cancelar"
            onClose={() => { setShowStatusConfirm(false); setUserToToggle(null); }}
            onConfirm={confirmToggleStatus}
          />
        )}
      </div>
    </GenericPanel>
  );
};

export default Users;