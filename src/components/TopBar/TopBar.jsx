import React from 'react';
import { BellPlus, Mail, Pencil, Settings } from 'lucide-react';
import Button from '../screens/components/Button';
import ModalTooltip from '../ModalTooltip/ModalTooltip';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import useNotifications from '../../hooks/useNotifications';
import useUnreadMessagesCount from '../../hooks/useUnreadMessagesCount';
import styles from './Index.module.css';

const TopBar = ({
  currentAvatar,
  currentUserName,
  displayRoleName,
  onEditProfileClick,
  extraActions = [] 
}) => {
  const { notifications } = useNotifications();
  const unreadNotifications = notifications?.filter(n => !(n.is_read || n.leida || n.read || n.isRead || n.completada || n.completed)) || [];
  const notificationsCount = unreadNotifications.length > 0 ? unreadNotifications.length : (notifications?.length || 0);
  const unreadMessagesCount = useUnreadMessagesCount();

  // Aquí puedes agregar fácilmente más iconos al TopBar
  const actionIcons = [
    {
      id: 'notifications',
      icon: <BellPlus size={18} />,
      tooltip: 'Notificaciones',
      count: notificationsCount,
      onClick: () => console.log('Abrir notificaciones')
    },
    {
      id: 'messages',
      icon: <Mail size={18} />,
      tooltip: 'Mensajes',
      count: unreadMessagesCount,
      onClick: () => console.log('Abrir mensajes')
    },
    // Ejemplo de cómo agregar uno nuevo fácilmente:
    {
      id: 'settings',
      icon: <Settings size={18} />,
      tooltip: 'Configuración',
      count: 0,
      onClick: () => console.log('Abrir ajustes')
    },
    ...extraActions 
  ];

  return (
    <header className={styles.topBar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Renderizado automático de los iconos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {actionIcons.map((action) => (
            <div key={action.id} className={styles.iconButtonWrap}>
              <Button
                variant={Button.VARIANTS.GHOST}
                style={{ minWidth: 0, padding: '8px', color: '#ffffff' }}
                aria-label={action.tooltip}
                onClick={action.onClick}
              >
                <ModalTooltip text={action.tooltip} position="bottom">
                  {action.icon}
                </ModalTooltip>
              </Button>
              {action.count > 0 && (
                <span className={styles.iconCountBadge}>
                  {action.count > 99 ? '99+' : action.count}
                </span>
              )}
            </div>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)' }} />

        {/* Info del Usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserAvatar
            src={currentAvatar}
            name={currentUserName}
            size={32}
            viewable={true}
          />
          <div className={styles.userBadge}>
            {currentUserName || displayRoleName}
          </div>
          <Button
            variant={Button.VARIANTS.GHOST}
            onClick={onEditProfileClick}
            style={{ minWidth: 0, padding: '4px', color: '#ffffff' }}
            aria-label="Editar perfil"
          >
             <ModalTooltip text="Editar Perfil" position="bottom">
                <Pencil size={14} />
             </ModalTooltip>
          </Button>
        </div>
        
      </div>
    </header>
  );
};

export default TopBar;