import React, { useEffect } from 'react';
import { Mail, MailX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnchoredDropdown from '../AnchoredDropdown';
import Frame from '../../../screens/components/Frame/Index';
import EmptyState from '../../../screens/components/EmptyState';
import useMessagesPreview from '../../../../hooks/useMessagesPreview';
import { TOPBAR_TEXT } from '../../constants';
import styles from './index.module.css';

const MessagesBell = ({ isOpen, anchorStyle, panelRef, onRequestClose }) => {
  const navigate = useNavigate();
  const { messages, loading, error, load } = useMessagesPreview();
  const text = TOPBAR_TEXT.messages;

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const handleViewAll = () => {
    onRequestClose?.();
    navigate('/panel-mensajes');
  };

  return (
    <AnchoredDropdown isOpen={isOpen} anchorStyle={anchorStyle} panelRef={panelRef}>
      <Frame
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
    </AnchoredDropdown>
  );
};

export default MessagesBell;
