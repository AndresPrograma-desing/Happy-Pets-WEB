import React, { useState } from 'react';
import { BellPlus, Mail, Pencil, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../screens/components/Button';
import ModalTooltip from '../ModalTooltip/ModalTooltip';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import useNotificationsContext from '../../hooks/useNotificationsContext';
import useUnreadMessagesCount from '../../hooks/useUnreadMessagesCount';
import { getUserRole } from '../GenericPanel/Routes';
import styles from './Index.module.css';
import MenuPopover from '../screens/components/Material-UI/Components/MenuPopover/index';
import NowGrod from '../External/Components/NowGrodKIT/NowGrod';

const TopBar = ({
  currentAvatar,
  currentUserName,
  displayRoleName,
  onEditProfileClick,
  extraActions = [],
  role
}) => {
  const navigate = useNavigate();
  const { notifications } = useNotificationsContext();
  const unreadNotifications = notifications?.filter(n => !(n.is_read || n.leida || n.read || n.isRead || n.completada || n.completed)) || [];
  const notificationsCount = unreadNotifications.length > 0 ? unreadNotifications.length : (notifications?.length || 0);
  const unreadMessagesCount = useUnreadMessagesCount();
  
  const userRole = role || getUserRole();
  const isAdmin = userRole === 'admin';
  const isClient = userRole === 'client';

  // NowGrod holds its redirection states locally

  if (isClient) {
    return (
      <header className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.userBadge} style={{ fontWeight: '600', color: '#0ea5e9', fontSize: '0.95rem' }}>
            Portal de Clientes
          </div>
        </div>
      </header>
    );
  }

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
    ...extraActions 
  ];

  return (
    <>
      <header className={styles.topBar}>
        <div className={styles.topBarContent}>
        
        {/* Renderizado automático de los iconos */}
        <div className={styles.actionsContainer}>
          {actionIcons.map((action) => (
            <div key={action.id} className={styles.iconButtonWrap}>
              <Button
                variant={Button.VARIANTS.GHOST}
                className={styles.actionIconButton}
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

          {/* Chatbot Popover */}
          <div className={styles.iconButtonWrap}>
            <NowGrod />
          </div>

          {isAdmin && (
            <>
              <div className={styles.separator} />
              <div className={styles.iconButtonWrap}>
                <Button
                  variant={Button.VARIANTS.GHOST}
                  className={styles.actionIconButton}
                  aria-label="Ajustes."
                  onClick={() => navigate('/AdminSystem/settings')}
                >
                  <ModalTooltip text="Ajustes del Sistema" position="bottom">
                    <Settings size={18} />
                  </ModalTooltip>
                </Button>
              </div>
            </>
          )}
        </div>

        <div className={styles.mainSeparator} />

        {/* Info del Usuario */}
        <div className={styles.userInfoContainer}>
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
            className={styles.profileButton}
            aria-label="Editar perfil"
          >
             <ModalTooltip text="Editar Perfil" position="bottom">
                <Pencil size={14} />
             </ModalTooltip>
          </Button>
        </div>
        
      </div>
      </header>

      {/* Redirection modal is managed inside NowGrod component */}
    </>
  );

};

export default TopBar;
