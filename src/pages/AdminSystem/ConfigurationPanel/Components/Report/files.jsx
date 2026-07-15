import { useState, useEffect } from "react";
import { files } from "../../../../../services/api";
import style from "../../settings.module.css";
import { Download, FileSpreadsheet, RefreshCw, AlertCircle } from "lucide-react";
import ModalTooltip from "../../../../../components/ModalTooltip/ModalTooltip";
import { getText } from "../../../../../constants";
import Loading from "../../../../../components/screens/components/Loading/Index";
import { formatReportDate } from "./utils";
import Button from "../../../../../components/screens/components/Button/index";
import ToggleCard from "../../../../../components/screens/components/ToggleCard/index";

const Files = ({ refreshTrigger }) => {
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
    }, [refreshTrigger]);

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
                    <Button variant={Button.VARIANTS.DANGER}
                        color={Button.COLORS.TRANSPARENT}
                        onClick={fetchReports}
                        circle
                        aria-label="Cerrar panel">
                        <RefreshCw size={20} color={Button.COLORS.BLACK} />
                    </Button>
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
                        <ToggleCard
                            key={report.id}
                            title={`Reporte #${report.id}`}
                            description={formatReportDate(report.fecha)}
                            icon={FileSpreadsheet}
                            action={
                                <Button
                                    onClick={() => handleDownload(report.url)}
                                    variant={Button.VARIANTS.DANGER}
                                    color={Button.COLORS.TRANSPARENT}
                                    borderColor="var(--border-gray-low)"
                                    className={style.downloadBtnSmall}
                                >
                                    <Download size={16} /> {getText("configReport.downloadReport")}
                                </Button>
                            }
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Files;
