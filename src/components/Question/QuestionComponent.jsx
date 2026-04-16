import React, { useState, useRef, useEffect } from "react";
import styles from "./Question.module.css";
import { getIcon } from "../../assets/icons/ExportIcon/Index";

export default function QuestionComponent({ info }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // Cierra el popover si se hace click fuera
    useEffect(() => {
        if (!open) return;
        function handle(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [open]);

    return (
        <div className={styles.container} ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <img
                src={getIcon("help")}
                alt="Ayuda"
                className={styles.icon}
                style={{ cursor: 'pointer' }}
                onClick={() => setOpen((v) => !v)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(v => !v); }}
            />
            {open && (
                <div className={styles.popover} style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 10, minWidth: 220 }}>
                    <div className={styles.question}>
                        <h2 className={styles.title}>{info.title}</h2>
                    </div>
                </div>
            )}
        </div>
    );
}