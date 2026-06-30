import { useState } from "react";
import { FileText, ChevronDown, ChevronRight } from "lucide-react";
import Report from "./Report"; // Tu componente con los botones
import { getText } from "../constants/getText";
import style from "./Settings.module.css";

const SettingsReportSection = () => {
  const [showReportOptions, setShowReportOptions] = useState(false);

  return (
    <>
      {/* Fila Clicable: Igual a la de Password */}
      <div 
        className={style.settingRow} 
        onClick={() => setShowReportOptions(!showReportOptions)}
      >
        <div className={style.settingInfo}>
          <div className={`${style.iconWrapper} ${style.green}`}>
            <FileText size={20} />
          </div>
          <div>
            <h3>{getText("setting.report")}</h3>
            <p>{getText("reportes.download")}</p>
          </div>
        </div>
        
        {/* Cambiamos el icono según esté abierto o cerrado */}
        {showReportOptions ? (
          <ChevronDown size={20} className={style.arrow} />
        ) : (
          <ChevronRight size={20} className={style.arrow} />
        )}
      </div>

      {/* Despliegue de Botones: Solo si showReportOptions es true */}
      {showReportOptions && (
        <div className={style.reportExpandableContent}>
          <Report />
        </div>
      )}
    </>
  );
};

export default SettingsReportSection;