import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import Button from '../screens/components/Button';
import { DrawPanelFooterContext } from '../screens/components/DrawPanel/FooterContext';
import styles from './UserWizard.module.css';

// Fila de botones compartida por los pasos del wizard de usuario (crear/editar):
// izquierda = volver un paso o cancelar todo, derecha = avanzar o confirmar.
// confirmType="submit" delega el submit al <form id={formId}> del paso actual;
// confirmType="button" (default) llama a onConfirm directamente.
// Si se renderiza dentro de un DrawPanel con `dynamicFooter`, los botones se
// portan al footer real del panel en vez de dibujar uno propio dentro del área
// con scroll (evita el "footer" desalineado visualmente).
export default function WizardActions({
  backLabel = 'Cancelar',
  onBack,
  confirmLabel = 'Siguiente',
  onConfirm,
  confirmType = 'button',
  formId,
  loading = false
}) {
  const footerNode = useContext(DrawPanelFooterContext);

  const buttons = (
    <>
      <Button type="button" border={Button.COLORS.RED} onClick={onBack} disabled={loading} fullWidth>
        {backLabel}
      </Button>
      <Button
        type={confirmType}
        form={confirmType === 'submit' ? formId : undefined}
        variant="primary"
        onClick={confirmType === 'button' ? onConfirm : undefined}
        loading={loading}
        fullWidth
      >
        {confirmLabel}
      </Button>
    </>
  );

  if (footerNode) return createPortal(buttons, footerNode);

  return <div className={styles.actions}>{buttons}</div>;
}
