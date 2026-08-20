import React, { useState, useEffect } from "react";
import MenuItem from "@mui/material/MenuItem";
import TableA from "../../../../../components/screens/components/TableA";
import DrawPanel from "../../../../../components/screens/components/DrawPanel/index";
import Button from "../../../../../components/screens/components/Button/index";
import Barnner from "../../../../../components/screens/components/Barnner/index";
import SwitchComponent from "../../../../../components/screens/components/Swich/Index";
import TextField from "../../../../../components/screens/components/Material-UI/Components/TextField/Index";
import { SlidersHorizontal, FileText, Receipt, Info } from "lucide-react";
import { getText } from "../../../../../constants";
import { getWorkerConfigs, updateWorkerConfig } from "../../../../../services/api";

const WorkerCenter = ({ descriptions = {} }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [editConfig, setEditConfig] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await getWorkerConfigs();
      setWorkers(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching workers:", err);
      setError("Error al obtener la configuración de los workers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const startConfigure = (row) => {
    setEditConfig({ ...row.raw });
    setSelectedWorkerId(row.id);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editConfig) return;
    setSaveLoading(true);
    try {
      const payload = {
        is_enabled: !!editConfig.is_enabled,
        interval_value: parseInt(editConfig.interval_value) || 0,
        interval_unit: editConfig.interval_unit || "minutes",
        retention_value: parseInt(editConfig.retention_value) || 0,
        retention_unit: editConfig.retention_unit || "days",
        generate_enabled: !!editConfig.generate_enabled,
      };
      await updateWorkerConfig(editConfig.worker_name, payload);
      await fetchWorkers();
      setSelectedWorkerId(null);
      setEditConfig(null);
    } catch (err) {
      console.error("Error updating worker config:", err);
      alert("Error al actualizar la configuración del worker.");
    } finally {
      setSaveLoading(false);
    }
  };

  const data = workers.map((w) => {
    const isReportsGen = w.worker_name === "AutoGenerateReportWorker";
    const isReportsDel = w.worker_name === "DeleteReportWorker";

    return {
      id: w.worker_name,
      name: isReportsGen
        ? "Generación de Reportes"
        : isReportsDel
        ? "Eliminación de Reportes"
        : w.worker_name.replace(/Worker$/, "").replace(/([A-Z])/g, " $1").trim(),
      description: isReportsGen
        ? "Generación automática periódica de reportes de actividad."
        : isReportsDel
        ? "Eliminación automática de reportes expirados del almacenamiento."
        : "Tarea de servicio en segundo plano del sistema.",
      status: w.is_enabled ? "Activo" : "Inactivo",
      icon: isReportsGen || isReportsDel ? FileText : Receipt,
      iconColor: isReportsGen ? "purple" : "red",
      raw: w,
    };
  });

  const columns = [
    {
      header: "WORKER",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "4px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: row.iconColor === "purple" ? "#faf5ff" : "#fef2f2",
              color: row.iconColor === "purple" ? "#9333ea" : "#dc2626",
            }}
          >
            <row.icon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem" }}>{row.name}</div>
            <div style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "2px" }}>{row.description}</div>
          </div>
        </div>
      ),
    },
    {
      header: "ESTADO",
      render: (row) => (
        <Barnner type={row.status === "Activo" ? "success" : "default"}>
          {row.status}
        </Barnner>
      ),
    },
    {
      header: "OPCIÓN",
      align: "center",
      render: (row) => (
        <Button
          variant="outline"
          size="small"
          icon={SlidersHorizontal}
          onClick={() => startConfigure(row)}
        >
          Configurar
        </Button>
      ),
    },
  ];

  return (
    <>
      <TableA
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={fetchWorkers}
        keyExtractor={(row) => row.id}
      />

      <DrawPanel
        isOpen={!!selectedWorkerId}
        onClose={() => {
          setSelectedWorkerId(null);
          setEditConfig(null);
        }}
        title={`Configuración de ${
          editConfig?.worker_name === "AutoGenerateReportWorker"
            ? "Generación de Reportes"
            : "Eliminación de Reportes"
        }`}
        description={descriptions[editConfig?.worker_name]}
        descriptionPosition="bottom"
        showActions={true}
        confirmText="Guardar Cambios"
        cancelText="Cancelar"
        formId="worker-edit-form"
        loading={saveLoading}
      >
        {editConfig && (
          <form
            id="worker-edit-form"
            onSubmit={handleFormSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "1.5rem 0" }}
          >


            {/* Habilitar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem" }}>Habilitar Tarea</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>Activar o desactivar la ejecución periódica.</div>
              </div>
              <SwitchComponent
                value={editConfig.is_enabled}
                onChange={(val) => setEditConfig((prev) => ({ ...prev, is_enabled: val }))}
              />
            </div>

            {/* Intervalo de ejecución y unidad */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ flex: 2 }}>
                <TextField
                  type="number"
                  label="Intervalo de Ejecución"
                  value={editConfig.interval_value ?? ""}
                  onChange={(e) =>
                    setEditConfig((prev) => ({ ...prev, interval_value: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
              <div style={{ flex: 1 }}>
                <TextField
                  select
                  label="Unidad"
                  value={editConfig.interval_unit ?? "minutes"}
                  onChange={(e) => setEditConfig((prev) => ({ ...prev, interval_unit: e.target.value }))}
                >
                  <MenuItem value="minutes">Minutos</MenuItem>
                  <MenuItem value="hours">Horas</MenuItem>
                  <MenuItem value="days">Días</MenuItem>
                </TextField>
              </div>
            </div>

            {/* generate_enabled (específico para AutoGenerateReportWorker) */}
            {editConfig.worker_name === "AutoGenerateReportWorker" && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem" }}>Generar Reporte</div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>Permitir la autogeneración en cada ciclo.</div>
                </div>
                <SwitchComponent
                  value={editConfig.generate_enabled}
                  onChange={(val) => setEditConfig((prev) => ({ ...prev, generate_enabled: val }))}
                />
              </div>
            )}

            {/* retention_value (específico para DeleteReportWorker) */}
            {editConfig.worker_name === "DeleteReportWorker" && (
              <TextField
                type="number"
                label="Días de Retención"
                value={editConfig.retention_value ?? ""}
                onChange={(e) =>
                  setEditConfig((prev) => ({ ...prev, retention_value: parseInt(e.target.value) || 0 }))
                }
                helperText="Los reportes antiguos se eliminarán automáticamente después de este período."
              />
            )}


          </form>
        )}
      </DrawPanel>
    </>
  );
};

export default WorkerCenter;
