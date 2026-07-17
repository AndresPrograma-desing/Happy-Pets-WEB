import React, { useState, useEffect } from "react";
import EditProfileForm from "../../../../../components/EditProfile/EditProfile";
import MultilinePlaceholder from "../../../../../components/screens/components/Material-UI/Components/MultilinePlaceholder/index";
import Button from "../../../../../components/screens/components/Button/index";
import ErrorMessage from "../../../../../components/Notification/Error/ErrorMessage";
import { TEXTS } from './Contants.js'
import { saveIaConocimiento } from "../../../../../services/api";

const GroqSettings = ({ onClose }) => {
  const [rules, setRules] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [category, setCategory] = useState("general");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: "general", label: "General" },
    { value: "servicios", label: "Servicios y Tarifas" },
    { value: "clinica", label: "Políticas de la Clínica" },
    { value: "faq", label: "Preguntas Frecuentes" }
  ];

  const selectorProps = {
    label: "Categoría de Base de Conocimiento",
    value: category,
    onChange: (e) => setCategory(e.target.value),
    options: categories,
    placeholder: "Selecciona una categoría"
  };

  const handleSuccess = async (finalName, finalAvatarUrl) => {
    setLoading(true);
    try {
      await saveIaConocimiento({
        categoria: category,
        reglas_respuesta: rules,
        base_conocimiento: knowledgeBase
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error("Error al guardar la configuración de la IA:", err);
      setError(err?.message || TEXTS.ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
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
        selectorProps={selectorProps}
        additionalFields={
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '1.2rem', width: '100%' }}>
              <MultilinePlaceholder
                label={TEXTS.RULES_LABEL}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={5}
                placeholder={TEXTS.RULES_PLACEHOLDER}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '1.2rem', width: '100%' }}>
              <MultilinePlaceholder
                label={TEXTS.KNOWLEDGE_BASE_LABEL}
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                rows={6}
                placeholder={TEXTS.KNOWLEDGE_BASE_PLACEHOLDER}
              />
            </div>
            {error && (
              <ErrorMessage 
                message={error} 
                title={TEXTS.ERROR_MESSAGES.ERROR_SAVE_TITLE} 
                variant="danger" 
                style={{ marginTop: '1rem' }}
              />
            )}
            {success && (
              <ErrorMessage 
                message={TEXTS.SUCCESS_MESSAGES.SUCCESS_SAVE_MESSAGE} 
                title={TEXTS.SUCCESS_MESSAGES.SUCCESS_SAVE_TITLE} 
                variant="success" 
                style={{ marginTop: '1rem' }}
              />
            )}
          </>
        }
        actionButtons={
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
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
        }
      />
    </div>
  );
};

export default GroqSettings;
