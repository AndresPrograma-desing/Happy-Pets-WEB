import { createContext } from 'react';

// Contexto que expone el nodo DOM del footer real de DrawPanel a descendientes lejanos
// (ej. WizardActions), para que puedan hacer portal de sus botones ahí en vez de
// dibujar un footer propio dentro del área con scroll. Solo se llena cuando el
// consumidor pide `dynamicFooter`; en el resto de usos de DrawPanel queda en null.
export const DrawPanelFooterContext = createContext(null);
