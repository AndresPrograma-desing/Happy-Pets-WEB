import { useEffect, useRef, useState } from 'react';

// Shared open/anchor/click-outside state machine for TopBar dropdowns
// (notifications, messages, etc.) anchored to the action button that opened them.
export default function useAnchoredPanel() {
  const [openKey, setOpenKey] = useState(null);
  const [anchorStyle, setAnchorStyle] = useState(null);
  const anchorElRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!openKey) return undefined;
    const handleClickOutside = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      if (anchorElRef.current?.contains(event.target)) return;
      setOpenKey(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openKey]);

  const toggle = (key) => (event) => {
    anchorElRef.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchorStyle({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setOpenKey((prev) => (prev === key ? null : key));
  };

  const close = () => setOpenKey(null);

  return { openKey, anchorStyle, panelRef, toggle, close };
}
