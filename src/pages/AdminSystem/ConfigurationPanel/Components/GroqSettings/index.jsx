import React, { useState } from "react";
import EditProfileForm from "../../../../../components/EditProfile/EditProfile";
import MultilinePlaceholder from "../../../../../components/screens/components/Material-UI/Components/MultilinePlaceholder/index";
import Button from "../../../../../components/screens/components/Button/index";
import ErrorMessage from "../../../../../components/Notification/Error/ErrorMessage";

const GroqSettings = ({ onClose }) => {
  const [rules, setRules] = useState("1. Responder con tono profesional y empático.\n2. Si hay dudas médicas complejas, sugerir consultar con un veterinario.");
  const [knowledgeBase, setKnowledgeBase] = useState("Happy Pets es una clínica veterinaria con servicios de consulta, vacunación y hospitalización. Contamos con médicos especialistas en caninos y felinos...");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = (finalName, finalAvatarUrl) => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div>
      <EditProfileForm
        isGroq={true}
        onSuccess={handleSuccess}
        formId="groq-profile-form"
        onError={(err) => setError(err)}
        onSaveStart={() => {
          setLoading(true);
          setError(null);
        }}
        onSaveEnd={() => setLoading(false)}
        additionalFields={
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '1.2rem' }}>
              <MultilinePlaceholder
                label="Reglas de Respuesta"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={5}
                placeholder="Indica las reglas que la IA debe seguir al responder..."
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '1.2rem' }}>
              <MultilinePlaceholder
                label="Base de Conocimientos"
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                rows={6}
                placeholder="Escribe la información del sistema para darle contexto al asistente..."
              />
            </div>
            {error && (
              <ErrorMessage 
                message={error} 
                title="Error al guardar" 
                variant="danger" 
                style={{ marginTop: '1rem' }}
              />
            )}
            {success && (
              <ErrorMessage 
                message="¡Configuración de GROQ guardada correctamente!" 
                title="Operación Exitosa" 
                variant="success" 
                style={{ marginTop: '1rem' }}
              />
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Button
                fullWidth
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
                color={Button.COLORS.PRIMARY}
              >
                Guardar Cambios
              </Button>
            </div>
          </>
        }
      />
    </div>
  );
};

export default GroqSettings;
