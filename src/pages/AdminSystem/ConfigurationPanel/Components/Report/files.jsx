import { useState, useEffect } from "react";
import { files } from "../../../../../services/api"; 
import style from "../../settings.module.css";
import { Download, FileSpreadsheet, RefreshCw, AlertCircle } from "lucide-react";
import ModalTooltip from "../../../../../components/ModalTooltip/ModalTooltip";
import { getText } from "../../../../../constants";
import Loading from "../../../../../components/screens/components/Loading/Index";

const Files = () => {
    const [reportList, setReportList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
 
    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await files();
 
            setReportList(Array.isArray(data) ? data : [data]);

        } catch (err) {
            setError(getText("configReport.configReportMassages.chargingReportErrror"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDownload = (url) => {
        if (url) {
            window.open(url);
        }
    };
    
    if (loading) {
        return (
            <div className={style.centerSection}>
                <Loading size="large" />
            </div>
        );
    }

    return (
        <div className={style.filesContainer}>
            <div className={style.filesHeader}>
                <h3><FileSpreadsheet size={20} /> {getText("configReport.historyReport")}</h3>
                <ModalTooltip text={getText("configReport.updateReportHistory")} position="top">
                    <button onClick={fetchReports} className={style.btnRefresh} >
                        <RefreshCw size={16} />
                    </button>
                </ModalTooltip>
            </div>

            {error && (
                <div className={style.errorBox}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className={style.reportGrid}>
                {reportList.length === 0 ? (
                    <p className={style.emptyMsg}>{getText("configReport.notReports")}</p>
                ) : (
                    reportList.map((report) => (
                        <div key={report.id} className={style.reportCard}>
                            <div className={style.reportInfo}>
                                <span className={style.reportId}>#{report.id}</span>
                                <span className={style.reportDate}>
                                    {new Date(report.fecha).toLocaleString('es-VE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleDownload(report.url)} 
                                className={style.downloadBtnSmall}
                            >
                                <Download size={16} /> {getText("configReport.downloadReport")}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Files;