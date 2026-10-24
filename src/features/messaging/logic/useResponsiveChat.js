import { useState, useEffect, useCallback } from 'react';

export function useResponsiveChat() {
  const [isMobile, setIsMobile] = useState(false);
  const [showContactsList, setShowContactsList] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectConversation = useCallback((onSelect) => (userId) => {
    onSelect(userId);
    if (isMobile) setShowContactsList(false);
  }, [isMobile]);

  const handleBackToList = useCallback(() => {
    setShowContactsList(true);
  }, []);

  return { isMobile, showContactsList, handleSelectConversation, handleBackToList };
}
