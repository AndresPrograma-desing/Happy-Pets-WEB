import { useState } from "react";
import { genarateReport } from "../../../../../services/api";
import style from "../../settings.module.css"; // Usa un CSS específico si puedes
import AlertModal from "../../../../../components/AlertModal/AlertModal";
import { 
    FileSpreadsheet, 
    History, 
    Loader2, 
    ChevronRight,
    CheckCircle,
    Info
} from "lucide-react";
import Files from "./files";
import { getText } from "../../../../../constants/index";


const Report = () => {
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [showModal, setShowModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleGenerate = async () => {
        setStatus({ type: 'info', msg: getText("reportes.setReportStatusGenerating") });
        setLoading(true);
        try {
            await genarateReport("Administrador");
            setStatus({ type: 'success', msg: getText("reportes.setReportStatus") });
            setShowModal(true);
            setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
        } catch (error) {
            console.error("Error generando reporte:", error);
            setStatus({ type: 'error', msg: "Error en la conexión con el servidor" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.container}>
            <div className={style.grid}>
                {/* Botón Generar - Enfoque en Datos */}
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
                            <span className={style.subtitle}>Formato Excel (.xlsx)</span>
                        </div>
                    </div>
                    <ChevronRight className={style.arrow} size={18} />
                </button>

                {/* Botón Ver Historial - Enfoque en Consulta */}
                <button 
                    onClick={() => setShowHistory(true)}
                    className={style.cardButton}
                    data-variant="secondary"
                >
                    <div className={style.content}>
                        <div className={style.iconBox}>
                            <History />
                        </div>
                        <div className={style.text}>
                            <span className={style.title}>Consultar Historial</span>
                            <span className={style.subtitle}>Ver archivos generados</span>
                        </div>
                    </div>
                    <ChevronRight className={style.arrow} size={18} />
                </button>
            </div>
            {status.msg && (
                <div className={`${style.statusToast} ${style[status.type]}`}>
                    {status.type === 'success' ? <CheckCircle size={14}/> : <Info size={14}/>}
                    {status.msg}
                </div>
            )}

            {/* Modales */}
            <AlertModal open={showModal} onClose={() => setShowModal(false)} title="Reporte Listo" message="El archivo se ha procesado exitosamente." />
            <AlertModal open={showHistory} onClose={() => setShowHistory(false)} title="Archivos Recientes">
                <div className={style.historyScroll}><Files /></div>
            </AlertModal>
        </div>
    );
};

export default Report;