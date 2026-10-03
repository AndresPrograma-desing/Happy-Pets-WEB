import React, { useEffect, useRef, useState } from 'react';
import { Mail, MailX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../screens/components/Button';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import Frame from '../../../screens/components/Frame/Index';
import EmptyState from '../../../screens/components/EmptyState';
import useUnreadMessagesCount from '../../../../hooks/useUnreadMessagesCount';
import useMessagesPreview from '../../../../hooks/useMessagesPreview';
import { TOPBAR_TEXT } from '../../constants';
import topBarStyles from '../../Index.module.css';
import styles from './index.module.css';

const MessagesBell = () => {
  const navigate = useNavigate();
  const unreadCount = useUnreadMessagesCount();
  const { messages, loading, error, load } = useMessagesPreview();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const text = TOPBAR_TEXT.messages;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) load();
      return next;
    });
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/panel-mensajes');
  };

  return (
    <div className={topBarStyles.iconButtonWrap} ref={containerRef}>
      <Button
        variant={Button.VARIANTS.GHOST}
        className={topBarStyles.actionIconButton}
        aria-label={text.title}
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <ModalTooltip text={text.title} position="bottom">
          <Mail size={18} />
        </ModalTooltip>
      </Button>

      {unreadCount > 0 && (
        <span className={topBarStyles.iconCountBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}

      {isOpen && (
        <Frame
          className={styles.anchoredFrame}
          title={text.title}
          icon={<Mail size={18} />}
          isLoading={loading}
          error={error ? text.errorText : ''}
          LoadingSize='small'
        >
          <div className={styles.list}>
            {!loading && !error && messages.length === 0 && (
              <EmptyState icon={MailX} text={text.emptyText} />
            )}
            {!loading && !error && messages.map((message) => (
              <button key={message.id} type="button" className={styles.item} onClick={handleViewAll}>
                {text.itemPrefix} <strong>{message.sender?.name || text.unknownSender}</strong>
              </button>
            ))}
          </div>
        </Frame>
      )}
    </div>
  );
};

export default MessagesBell;
