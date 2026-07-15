import { useState } from "react";
import { genarateReport } from "../../../../../services/api";
import style from "../../settings.module.css";
import { 
    FileSpreadsheet, 
    Loader2, 
    CheckCircle,
    Info
} from "lucide-react";
import Files from "./files";
import { getText } from "../../../../../constants/index";
import { REPORT_TEXTS } from "./constants";

const Report = () => {
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleGenerate = async () => {
        setStatus({ type: 'info', msg: getText("reportes.setReportStatusGenerating") });
        setLoading(true);
        try {
            await genarateReport("Administrador");
            setStatus({ type: 'success', msg: getText("reportes.setReportStatus") });
            setRefreshTrigger(prev => prev + 1);
            setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
        } catch (error) {
            console.error("Error generando reporte:", error);
            setStatus({ type: 'error', msg: REPORT_TEXTS.serverConnectionError });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.reportDrawerContainer}>
            <button 
                onClick={handleGenerate}
                className={style.cardButton}
                data-variant="primary"
                disabled={loading}
            >
                <div className={style.content}>
                    <div className={style.iconBox}>
                        {loading ? <Loader2 className={style.spin} /> : <FileSpreadsheet />}
                    </div>
                    <div className={style.text}>
                        <span className={style.title}>{getText("reportes.generateReportButton")}</span>
                        <span className={style.subtitle}>{REPORT_TEXTS.excelFormat}</span>
                    </div>
                </div>
            </button>

            {status.msg && (
                <div className={`${style.statusToast} ${style[status.type]}`}>
                    {status.type === 'success' ? <CheckCircle size={14}/> : <Info size={14}/>}
                    {status.msg}
                </div>
            )}

            <hr className={style.reportDivider} />

            <div className={style.historySection}>
                <Files refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
};

export default Report;