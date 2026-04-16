import React from "react";
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import styles from './LoginInfo.module.css';

const defaultTitle = 'Información de Inicio de Sesión';
const defaultParagraphs = [
  'Para iniciar sesión se necesita una contraseña mayor a 8 caracteres.',
  'El correo debe ser válido y registrado en el sistema.',
  'El rol debe ser seleccionado de la lista desplegable.',
  'Si tienes problemas para iniciar sesión, contacta al administrador del sistema.',
  'Recuerda mantener tu información de inicio de sesión segura y no compartirla con nadie.',
  'Si perdió el acceso a todos sus datos de login, contáctese con el equipo de desarrollo.'
];

export default function LoginInfo({
  className = "",
  title = defaultTitle,
  paragraphs = defaultParagraphs,
  contactEmail = 'soporte@vetsystem.com',
  icon = 'terminal',
  children,
}) {
  // Si el consumidor proporciona children, renderizarlos tal cual (mayor flexibilidad)
  if (children) return <div className={className}>{children}</div>;

  return (
    <div className={className}>
      <h2 id="login-help-title">{title}</h2>
      {Array.isArray(paragraphs) && paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <a href={`mailto:${contactEmail}`} className={styles.contactLink}>
        Contactar al equipo de desarrollo
        <img src={getIcon(icon)} alt="Ayuda" className={styles.terminalIcon} />
      </a>
    </div>
  );
}