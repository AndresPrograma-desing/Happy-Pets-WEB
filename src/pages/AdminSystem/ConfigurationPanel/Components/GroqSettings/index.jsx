import React, { useState, useEffect, useRef } from "react";
import TextField from "../../../../../components/screens/components/Material-UI/Components/TextField/Index";
import MultilinePlaceholder from "../../../../../components/screens/components/Material-UI/Components/MultilinePlaceholder/index";
import UserAvatar from "../../../../../components/screens/components/Profile/Avatar/Index.jsx";
import Button from "../../../../../components/screens/components/Button/index";
import ErrorMessage from "../../../../../components/Notification/Error/ErrorMessage";
import Loading from "../../../../../components/screens/components/Loading/Index.jsx";
import { getUsers, updateUserName, ChangeProfileAvatar } from "../../../../../services/api";

const GroqSettings = ({ onClose }) => {
  const [groqConfig, setGroqConfig] = useState({
    id: null,
    name: "Asistente GROQ (IA)",
    email: "ia@groq.com",
    avatar: null,
    rules: "1. Responder con tono profesional y empático.\n2. Si hay dudas médicas complejas, sugerir consultar con un veterinario.",
    knowledgeBase: "Happy Pets es una clínica veterinaria con servicios de consulta, vacunación y hospitalización. Contamos con médicos especialistas en caninos y felinos..."
  });

  const [dataLoading, setDataLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load GROQ user from database
  useEffect(() => {
    async function loadGroqUser() {
      try {
        setDataLoading(true);
        const res = await getUsers();
        const userList = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
        const found = userList.find(u => u.rol?.toLowerCase() === 'assistant' || u.email === 'groq@happy-pets.dev');
        if (found) {
          setGroqConfig(prev => ({
            ...prev,
            id: found.id,
            name: found.nombre || found.name || prev.name,
            email: found.email || prev.email,
            avatar: found.avatarUrl || found.avatar_url || found.avatar || prev.avatar
          }));
        }
      } catch (err) {
        console.error("Error loading GROQ user:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadGroqUser();
  }, []);

  const handleGroqChange = (e) => {
    setGroqConfig({ ...groqConfig, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_SIZE = 3 * 1024 * 1024; // 3MB
      if (file.size > MAX_SIZE) {
        setError("La imagen no debe superar los 3MB");
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      // 1. Update Name and Email
      if (groqConfig.id) {
        await updateUserName({
          idUser: Number(groqConfig.id),
          newUserName: groqConfig.name,
          newLastName: "",
          email: groqConfig.email
        });
      }

      // 2. Update Profile Avatar
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        formData.append('username', groqConfig.name);
        
        await ChangeProfileAvatar(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error("Error saving GROQ settings:", err);
      setError(err?.message || "Ocurrió un error al guardar la configuración.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Loading size="large" text="Cargando configuración de GROQ..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '10px 0' }}>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Foto de Perfil del Asistente</label>
        <UserAvatar
          src={avatarPreview || groqConfig.avatar}
          name={groqConfig.name}
          size={80}
          editable={true}
          onEditClick={handleAvatarClick}
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

      {error && (
        <ErrorMessage 
          message={error} 
          title="Error al guardar" 
          variant="danger" 
        />
      )}

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
