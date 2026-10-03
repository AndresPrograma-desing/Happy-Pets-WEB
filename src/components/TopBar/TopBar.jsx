import React from 'react';
import { Pencil, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../screens/components/Button';
import ModalTooltip from '../ModalTooltip/ModalTooltip';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import { getUserRole } from '../GenericPanel/Routes';
import styles from './Index.module.css';
import NowGrod from '../External/Components/NowGrodKIT/NowGrod';
import NotificationsBell from './components/NotificationsBell';
import MessagesBell from './components/MessagesBell';

const TopBar = ({
  currentAvatar,
  currentUserName,
  displayRoleName,
  onEditProfileClick,
  extraActions = [],
  role
}) => {
  const navigate = useNavigate();

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

  return (
    <>
      <header className={styles.topBar}>
        <div className={styles.topBarContent}>

        {/* Renderizado automático de los iconos */}
        <div className={styles.actionsContainer}>
          <NotificationsBell />
          <MessagesBell />

          {extraActions.map((action) => (
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
            {/* <NowGrod /> */}
          </div>

          {isAdmin && (
            <>
              <div className={styles.separator} />
              <div className={styles.iconButtonWrap}>
                <Button
                  variant={Button.VARIANTS.GHOST}
                  className={styles.actionIconButton}
                  aria-label="Ajustes."
                  onClick={() => navigate('/administracion/configuracion')}
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
