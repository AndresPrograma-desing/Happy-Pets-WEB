import React from "react";
import styles from "./SendFactura.module.css";
import { getIcon } from "../../assets/icons/ExportIcon/Index";

export default function SendFactura() {
    return (
    <div className={styles.container}>
            <h2 className={styles.title}>Factura Generada</h2>  
            <p className={styles.message}></p>
            <img src={getIcon("send")} alt="" className={styles.icon} />
    </div>
    );
}