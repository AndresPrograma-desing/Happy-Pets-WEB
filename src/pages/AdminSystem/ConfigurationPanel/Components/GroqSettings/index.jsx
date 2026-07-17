import React, { useState } from "react";
import TextField from "../../../../../components/screens/components/Material-UI/Components/TextField/Index";
import MultilinePlaceholder from "../../../../../components/screens/components/Material-UI/Components/MultilinePlaceholder/index";
import UserAvatar from "../../../../../components/screens/components/Profile/Avatar/Index.jsx";
import Button from "../../../../../components/screens/components/Button/index";
import ErrorMessage from "../../../../../components/Notification/Error/ErrorMessage";

const GroqSettings = ({ onClose }) => {
  const [groqConfig, setGroqConfig] = useState({
    name: "Asistente GROQ (IA)",
    email: "ia@groq.com",
    avatar: null,
    rules: "1. Responder con tono profesional y empático.\n2. Si hay dudas médicas complejas, sugerir consultar con un veterinario.",
    knowledgeBase: "Happy Pets es una clínica veterinaria con servicios de consulta, vacunación y hospitalización. Contamos con médicos especialistas en caninos y felinos..."
  });
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGroqChange = (e) => {
    setGroqConfig({ ...groqConfig, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    // Simulate save delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '10px 0' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Foto de Perfil del Asistente</label>
        <UserAvatar
          src={groqConfig.avatar}
          name={groqConfig.name}
          size={80}
          editable={true}
          onChange={(newAvatar) => setGroqConfig({ ...groqConfig, avatar: newAvatar })}
        />
      </div>

      <TextField
        label="Nombre del Asistente"
        name="name"
        value={groqConfig.name}
        onChange={handleGroqChange}
        placeholder="Ej: Asistente GROQ"
        required
      />

      <TextField
        label="Correo Electrónico"
        name="email"
        type="email"
        value={groqConfig.email}
        onChange={handleGroqChange}
        placeholder="ia@groq.com"
        required
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <MultilinePlaceholder
          label="Reglas de Respuesta"
          name="rules"
          value={groqConfig.rules}
          onChange={(e) => setGroqConfig({ ...groqConfig, rules: e.target.value })}
          rows={5}
          placeholder="Indica las reglas que la IA debe seguir al responder..."
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <MultilinePlaceholder
          label="Base de Conocimientos"
          name="knowledgeBase"
          value={groqConfig.knowledgeBase}
          onChange={(e) => setGroqConfig({ ...groqConfig, knowledgeBase: e.target.value })}
          rows={6}
          placeholder="Escribe la información del sistema para darle contexto al asistente..."
        />
      </div>

      {success && (
        <ErrorMessage 
          message="¡Configuración de GROQ guardada correctamente!" 
          title="Operación Exitosa" 
          variant="success" 
        />
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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

    </form>
  );
};

export default GroqSettings;
