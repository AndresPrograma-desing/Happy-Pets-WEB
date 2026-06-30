import React from "react";
import { useNavigate } from "react-router-dom";

import { users, enableUser, disableUser, deleteUser} from "../../services/api";
import { UserCircle, Trash2, UserX, UserCheck, Users2, UserCheck2Icon} from "lucide-react";
import AlertModal from "../AlertModal/AlertModal";
import ModalTooltip from "../ModalTooltip/ModalTooltip";
import GenericPanel from "../GenericPanel/GenericPanel";
import TableA from "../screens/components/TableA";

const Users = () => {
  const [userList, setUserList] = React.useState([]);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState("success");
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = React.useState(false);
  const [userToToggle, setUserToToggle] = React.useState(null);
 
  const navigate = useNavigate();



  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await users();
        setUserList(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = (id, currentStatus) => {
    const user = userList.find((u) => u.id === id);
    setUserToToggle({ ...user, nextStatus: !currentStatus });
    setShowStatusConfirm(true);
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

  const handleDelete = async (id) => {
    const user = userList.find((u) => u.id === id);
    if (user?.rol === "Admin") {
      setAlertMessage("No se puede eliminar un usuario con rol de Admin");
      setAlertType("error");
      setShowAlert(true);
      return;
    }
    setUserToDelete(user);
    setShowConfirm(true);
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


  const columns = [
    {
      header: 'Usuario',
      render: (user) => (
        <UserCircle size={28} color={user.activo ? "#10b981" : "#ef4444"} />
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
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => handleToggleStatus(user.id, user.activo)}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
          >
            {user.activo ? (
              <ModalTooltip text="Deshabilitar usuario" position="top">
                <UserCheck size={18} color="#10b981" />
              </ModalTooltip> 
            ) : (
              <ModalTooltip text="Habilitar usuario" position="top">
                <UserX size={18} color="#f59e0b" />
              </ModalTooltip>
            )}
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
          >
            <ModalTooltip text="Eliminar usuario" position="top">
              <Trash2 size={18} color="#ef4444" />
            </ModalTooltip>
          </button>
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
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        
        </div>

        <TableA 
          columns={columns}
          data={userList}
          keyExtractor={(user) => user.id}
        />
        {showAlert && (
          <AlertModal
            message={alertMessage}
            type={alertType}
            onClose={() => setShowAlert(false)}
          />
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