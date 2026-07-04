import React from 'react';
import { Support_text } from "./Index.js";
import styles from "./Support.module.css";
import { Headset, MessageCircle, Mail } from 'lucide-react';
import { FloatingWidget } from '../common/FloatingWidget/FloatingWidget.jsx';

export function SupportComponent() {
    return (
        <FloatingWidget 
            icon={Headset} 
            title="Soporte Técnico" 
            position="top-right"
            buttonTitle="Soporte Técnico"
        >
            <div className={styles.errorMessage}>
                {Support_text.error}
            </div>

            <a 
                href="https://wa.me/1234567890" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.supportLink}
            >
                <div className={styles.linkIcon}>
                    <MessageCircle size={22} />
                </div>
                <div className={styles.linkText}>
                    WhatsApp
                    <span className={styles.linkSubtext}>Respuesta rápida</span>
                </div>
            </a>

            <a 
                href="mailto:soporte@happypets.com" 
                className={styles.supportLink}
            >
                <div className={styles.linkIcon}>
                    <Mail size={22} />
                </div>
                <div className={styles.linkText}>
                    Correo Electrónico
                    <span className={styles.linkSubtext}>soporte@happypets.com</span>
                </div>
            </a>
        </FloatingWidget>
    );
}
