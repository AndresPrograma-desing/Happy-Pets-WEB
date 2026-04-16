import React from "react";
import style from "./InDevelopment.module.css";
import { getIcon } from "../../assets/icons/ExportIcon/Index";
const InDevelopment = () => {

    return (
        <footer className={style.footer} aria-hidden="true">
            <p className={style.text}>
                <span className={style.icon}>
                    <img src={getIcon('engranaje')} alt="Icono de engranaje" />
                </span>
                El sistema aun esta en desarrollo, podras encontrar funcionalidades limitadas o errores.
            </p>
        </footer>
    );
};

export default InDevelopment;