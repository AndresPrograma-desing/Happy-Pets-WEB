import React from 'react';
import styles from '../GenericPanel.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AlertModal from '../../AlertModal/AlertModal';
import { logout } from '../../../services/api';
import { getIcon } from '../../../assets/icons/ExportIcon/Index';
import Button from '../../screens/components/Button';

export function SidebarLayout({ menuTitle = "ADMIN", children }) {
	return (
		<aside className={styles.sidebar}>
			<div className={styles.sidebarHeader}>
				<div className={styles.logoContainer}>
					<span className={styles.brandText}>{menuTitle}</span>
				</div>
			</div>
			<nav className={styles.sidebarNav}>
				<div className={styles.navGroup}>
					<span className={styles.groupLabel}>Navegación</span>
					<div className={styles.customActions}>{children}</div>
				</div>
			</nav>
			<div className={styles.sidebarFooter}>{/* Aquí puedes poner acciones extra */}</div>
		</aside>
	);
}

export function SidebarLogic({ menuTitle = "ADMIN", children }) {
	const [loggedOut, setLoggedOut] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const confirmLogout = () => {
		logout();
		setLoggedOut(true);
	};

	if (loggedOut) return <Navigate to="/Home" replace />;

	return (
		<aside className={styles.sidebar}>
			<div className={styles.sidebarHeader}>
				<div className={styles.logoContainer}>
					<span className={styles.brandText}>{menuTitle}</span>
				</div>
			</div>
			<nav className={styles.sidebarNav}>
				<div className={styles.navGroup}>
					<span className={styles.groupLabel}>Navegación</span>
					<div className={styles.customActions}>{children}</div>
				</div>
			</nav>
			<div className={styles.sidebarFooter}>
				<Button
					variant={Button.VARIANTS.DANGER}
					color={Button.COLORS.TRANSPARENT}
					borderColor="var(--SW-red)"
					icon={LogOutIcon}
					onClick={() => setShowLogoutModal(true)}>
					Cerrar seccion
				</Button>
			</div>
			<AlertModal
				open={showLogoutModal}
				title="¿Cerrar sesión?"
				message="¿Estás seguro de que deseas salir del sistema?"
				onClose={() => setShowLogoutModal(false)}
				onConfirm={confirmLogout}
			/>
		</aside>
	);
}