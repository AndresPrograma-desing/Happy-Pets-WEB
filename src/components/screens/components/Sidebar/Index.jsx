import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Pin, PinOff, GripVertical, Users } from 'lucide-react';
import Button from '../Button/index';
import Skeleton from '../Skeleton/Index';
import styles from './Index.module.css';
import { TEXTS } from './constants';
import { getBadgeClass, getInitial, isSidebarToggleShortcut, toggleSidebarCollapsed } from './utils';

import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import { renderIcon } from '../../../hook/RenderIcon';
import MenuPopover from '../Material-UI/Components/MenuPopover/index';

export const ProSidebar = ({
  groups,
  activeId,
  onSelect,
  collapsible = true,
  loading = false,
  skeletonItems = 10,
  className = '',
  headerContent,
  footerContent,
  user,
  userMenuItems = [],
  onItemEdit,
  onItemDelete,
  onItemPin,
  onItemCollaborators,
  onReorderItems,
  useSubItemsPopover = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [expandedItemIds, setExpandedItemIds] = useState(() => new Set());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userMenuPosition, setUserMenuPosition] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const userFooterButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const contextMenuRef = useRef(null);

  const canShowItemContextMenu = Boolean(onItemEdit || onItemDelete || onItemPin);
  const canReorder = Boolean(onReorderItems);

  const handleDragStart = (event, item) => {
    event.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(item.id);
  };

  const handleDragOver = (event, item) => {
    event.preventDefault();
    if (item.id !== draggedItemId) setDragOverItemId(item.id);
  };

  const handleDragLeave = (item) => {
    setDragOverItemId((prev) => (prev === item.id ? null : prev));
  };

  const handleDrop = (event, groupItems, targetItem) => {
    event.preventDefault();
    setDragOverItemId(null);
    if (!draggedItemId || draggedItemId === targetItem.id) return;

    const fromIndex = groupItems.findIndex((it) => it.id === draggedItemId);
    const toIndex = groupItems.findIndex((it) => it.id === targetItem.id);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = groupItems.map((it) => it.id);
    const [movedId] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedId);

    onReorderItems && onReorderItems(reordered);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const toggleExpandedItem = (id) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (useSubItemsPopover || !groups) return;
    groups.forEach((group) => {
      group.items?.forEach((item) => {
        if (item.subItems?.some((sub) => sub.id === activeId)) {
          setExpandedItemIds((prev) => (prev.has(item.id) ? prev : new Set(prev).add(item.id)));
        }
      });
    });
  }, [activeId, groups, useSubItemsPopover]);

  useLayoutEffect(() => {
    if (!isUserMenuOpen || !userFooterButtonRef.current) return;
    const rect = userFooterButtonRef.current.getBoundingClientRect();
    setUserMenuPosition({
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: isCollapsed ? 220 : rect.width,
    });
  }, [isUserMenuOpen, isCollapsed]);

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;
    // The menu is rendered in a portal to document.body, so it sits outside
    // the sidebar's DOM subtree (and outside the app's root container).
    // Relying on synthetic-event bubbling/stopPropagation across that
    // boundary is unreliable, so this checks real DOM containment via refs
    // instead — mousedown fires before the menu item's own click, so its
    // early return here (when the ref *does* contain the target) is what
    // lets that click go on to fire normally.
    const handlePointerDown = (event) => {
      const target = event.target;
      if (userMenuRef.current?.contains(target)) return;
      if (userFooterButtonRef.current?.contains(target)) return;
      setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!collapsible) return undefined;
    const handleToggleShortcut = (event) => {
      if (!isSidebarToggleShortcut(event)) return;
      event.preventDefault();
      setIsCollapsed(toggleSidebarCollapsed);
    };
    document.addEventListener('keydown', handleToggleShortcut);
    return () => document.removeEventListener('keydown', handleToggleShortcut);
  }, [collapsible]);

  useEffect(() => {
    if (!contextMenu) return undefined;
    const handlePointerDown = (event) => {
      if (contextMenuRef.current?.contains(event.target)) return;
      setContextMenu(null);
    };
    const closeMenu = () => setContextMenu(null);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('contextmenu', handlePointerDown);
    document.addEventListener('scroll', closeMenu, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('contextmenu', handlePointerDown);
      document.removeEventListener('scroll', closeMenu, true);
    };
  }, [contextMenu]);

  const handleItemContextMenu = (event, item) => {
    if (!canShowItemContextMenu) return;
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, item });
  };

  const renderLeftContent = (item) => {
    return renderIcon(item.icon, styles.icon);
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${className}`}>
      {(headerContent || collapsible) && (
        <div className={styles.sidebarHeader}>
          {!isCollapsed && headerContent && (
            <div className={styles.headerContent}>{headerContent}</div>
          )}

          {collapsible && (
            <Button
              circle
              size="small"
              variant={Button.VARIANTS.GHOST}
              className={styles.toggleBtn}
              onClick={() => setIsCollapsed(toggleSidebarCollapsed)}
              color="transparent"
            >
              <ModalTooltip
                key={isCollapsed}
                text={isCollapsed ? TEXTS.openMenu : TEXTS.closeMenu}
                position="bottom"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </ModalTooltip>
            </Button>
          )}
        </div>
      )}

      <div className={styles.navContainer}>
        {loading ? (
          <div className={styles.menuGroup}>
            <div className={styles.buttonList}>
              {Array.from({ length: skeletonItems }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className={styles.sidebarItemBtn} style={{ cursor: 'default' }}>
                  <div className={styles.btnLayout}>
                    <div className={styles.leftPart}>
                      <Skeleton circle width={20} height={20} />
                      {!isCollapsed && <Skeleton width={`${60 + (idx % 3) * 15}%`} height="12px" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : groups && groups.map((group, gIdx) => (
          <div key={gIdx} className={styles.menuGroup}>
            {group.title && !isCollapsed && (
              <span className={styles.groupTitle}>{group.title}</span>
            )}

            <div className={styles.buttonList}>
              {group.items && group.items.map((item) => {
                const isActive = activeId === item.id;
                const isDragging = draggedItemId === item.id;
                const isDragOver = canReorder && dragOverItemId === item.id && !isDragging;
                const hasSubItems = item.subItems && item.subItems.length > 0;

                if (hasSubItems) {
                  // El acordeón inline necesita espacio para mostrar la lista de subItems;
                  // en modo colapsado (rail de solo iconos) siempre usamos el popover flotante.
                  const showAsPopover = useSubItemsPopover || isCollapsed;

                  if (showAsPopover) {
                    return (
                      <div key={item.id} style={{ width: '100%' }}>
                        <MenuPopover
                          item={item}
                          styles={{ navItem: `${styles.sidebarItemBtn} ${isActive ? styles.activeBtn : ''}`, icon: styles.icon }}
                          renderIcon={renderIcon}
                          onNavigate={onSelect}
                          isCollapsed={isCollapsed}
                          placement={isCollapsed ? 'right' : 'bottom'}
                        />
                      </div>
                    );
                  }

                  const isExpanded = expandedItemIds.has(item.id);
                  const isParentActive = isActive || item.subItems.some((sub) => sub.id === activeId);

                  return (
                    <div key={item.id} style={{ width: '100%' }}>
                      <Button
                        fullWidth
                        color="transparent"
                        active={isParentActive}
                        onClick={() => toggleExpandedItem(item.id)}
                        className={`${styles.sidebarItemBtn} ${isParentActive ? styles.activeBtn : ''}`}
                      >
                        <div className={styles.btnLayout}>
                          <div className={styles.leftPart}>
                            {renderLeftContent(item)}
                            <span className={styles.label}>{item.label}</span>
                          </div>
                          <ChevronRight
                            size={14}
                            className={styles.expandChevron}
                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                          />
                        </div>
                      </Button>

                      {isExpanded && (
                        <div className={styles.subItemsList}>
                          {item.subItems.map((sub) => (
                            <Button
                              key={sub.id}
                              fullWidth
                              color="transparent"
                              active={activeId === sub.id}
                              onClick={() => onSelect && onSelect(sub)}
                              className={`${styles.subItemBtn} ${activeId === sub.id ? styles.activeBtn : ''}`}
                            >
                              <span className={styles.label}>{sub.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Button
                    key={item.id}
                    fullWidth
                    color="transparent"
                    active={isActive}
                    draggable={canReorder}
                    onDragStart={canReorder ? (event) => handleDragStart(event, item) : undefined}
                    onDragOver={canReorder ? (event) => handleDragOver(event, item) : undefined}
                    onDragLeave={canReorder ? () => handleDragLeave(item) : undefined}
                    onDrop={canReorder ? (event) => handleDrop(event, group.items, item) : undefined}
                    onDragEnd={canReorder ? handleDragEnd : undefined}
                    onClick={() => onSelect && onSelect(item)}
                    onContextMenu={(event) => handleItemContextMenu(event, item)}
                    className={`${styles.sidebarItemBtn} ${isActive ? styles.activeBtn : ''} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
                    ToolTip={isCollapsed ? item.label : undefined}
                  >
                    <div className={styles.btnLayout}>
                      <div className={styles.leftPart}>
                        {canReorder && !isCollapsed && (
                          <span className={styles.dragHandle}><GripVertical size={14} /></span>
                        )}
                        {renderLeftContent(item)}
                        {!isCollapsed && <span className={styles.label}>{item.label}</span>}
                        {!isCollapsed && item.pinned && (
                          <Pin size={12} className={styles.pinnedIcon} />
                        )}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`${styles.badge} ${getBadgeClass(styles, item.badgeType)}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {(footerContent || user?.email) && (
        <div className={styles.footerGroup}>
          {footerContent && !isCollapsed && (
            <div className={styles.footerContent}>{footerContent}</div>
          )}

          {user?.email && (
            <div className={styles.userFooter}>
              <button
                type="button"
                ref={userFooterButtonRef}
                className={styles.userFooterButton}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
              >
                <span className={styles.avatar}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.email} className={styles.avatarImg} />
                  ) : (
                    getInitial(user.email)
                  )}
                </span>
                {!isCollapsed && <span className={styles.userEmail}>{user.email}</span>}
              </button>
            </div>
          )}
        </div>
      )}

      {isUserMenuOpen && userMenuPosition && user?.email && createPortal(
        <div
          ref={userMenuRef}
          className={styles.userMenu}
          style={{ bottom: userMenuPosition.bottom, left: userMenuPosition.left, width: userMenuPosition.width }}
        >
          <div className={styles.userMenuEmail}>{user.email}</div>
          {userMenuItems.map((menuItem) => {
            const Icon = menuItem.icon;
            return (
              <button
                key={menuItem.id ?? menuItem.label}
                type="button"
                className={`${styles.userMenuItem} ${menuItem.variant === 'danger' ? styles.userMenuItemDanger : ''}`}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  menuItem.onClick && menuItem.onClick();
                }}
              >
                {Icon && <Icon size={16} />}
                <span>{menuItem.label}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )}

      {contextMenu && createPortal(
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {onItemEdit && contextMenu.item.isOwner !== false && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => {
                onItemEdit(contextMenu.item);
                setContextMenu(null);
              }}
            >
              <Pencil size={14} />
              <span>{TEXTS.editItem}</span>
            </button>
          )}
          {onItemCollaborators && contextMenu.item.isOwner !== false && contextMenu.item.isShared && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => {
                onItemCollaborators(contextMenu.item);
                setContextMenu(null);
              }}
            >
              <Users size={14} />
              <span>{TEXTS.collaboratorsItem}</span>
            </button>
          )}
          {onItemPin && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => {
                onItemPin(contextMenu.item);
                setContextMenu(null);
              }}
            >
              {contextMenu.item.pinned ? <PinOff size={14} /> : <Pin size={14} />}
              <span>{contextMenu.item.pinned ? TEXTS.unpinItem : TEXTS.pinItem}</span>
            </button>
          )}
          {onItemDelete && (
            <button
              type="button"
              className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
              onClick={() => {
                onItemDelete(contextMenu.item);
                setContextMenu(null);
              }}
            >
              <Trash2 size={14} />
              <span>{contextMenu.item.isOwner === false ? TEXTS.leaveItem : TEXTS.deleteItem}</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </aside>
  );
};

export default ProSidebar;
