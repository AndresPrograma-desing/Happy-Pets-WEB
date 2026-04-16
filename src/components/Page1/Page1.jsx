import React from "react";
import styles from './Page1.module.css'
import { Navigate } from "react-router-dom";
import { getIcon } from "../../assets/icons/ExportIcon/Index";

function Page1({ url }) {
  return (
    <div className={styles.boton}>
        <button className={styles.button} onClick={() => window.open(url, '_blank')}>
            <img src={getIcon("house")} alt="Home Icon" />
            Volver a la pagina principal</button>
    </div>
  );
}

export default Page1;