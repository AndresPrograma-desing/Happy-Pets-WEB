import React, { useState, useEffect, useRef } from 'react';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import styles from './Index.module.css';
import InputWithIcon from '../screens/components/Material-UI/Components/InputWithIcon/Index';
import { Pencil, Mail } from 'lucide-react';
import Loading from '../screens/components/Loading/Index';
import { ChangeProfileAvatar, updateUserName, getUserFirstNameFromLoginSession, getUserLastNameFromLoginSession, syncStorageNameAndLastName, getProfile, getUserEmailFromLoginSession, syncStorageProfileData } from '../../services/api';
import { getUserId } from '../../context/LocalStorage';

export default function EditProfileForm({ 
  currentName, 
  currentAvatarUrl, 
  onSuccess, 
  formId 
}) {
  const [name, setName] = useState(() => {
    const storedFirst = getUserFirstNameFromLoginSession();
    if (storedFirst) return storedFirst;
    if (currentName) return currentName.trim().split(/\s+/)[0] || '';
    return '';
  });
  const [lastName, setLastName] = useState(() => {
    const storedLast = getUserLastNameFromLoginSession();
    if (storedLast) return storedLast;
    if (currentName) {
      const parts = currentName.trim().split(/\s+/);
      if (parts.length > 1) return parts.slice(1).join(' ');
    }
    return '';
  });
  const [email, setEmail] = useState(() => getUserEmailFromLoginSession() || '');
  const [avatarPreview, setAvatarPreview] = useState(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await getProfile();
        if (!mounted) return;
        const data = profile?.data || profile?.user || profile;
        if (data) {
          let firstName = data.nombre || data.firstName || data.first_name || '';
          let lastNameVal = data.apellido || data.lastName || data.last_name || '';
          let emailVal = data.email || data.correo || '';
          
          if (!firstName && data.name) {
            const parts = data.name.trim().split(/\s+/);
            firstName = parts[0] || '';
            if (parts.length > 1) {
              lastNameVal = parts.slice(1).join(' ');
            }
          }
          if (firstName) setName(firstName);
          if (lastNameVal) setLastName(lastNameVal);
          if (emailVal) setEmail(emailVal);
        }
      } catch (err) {
        console.error("Error fetching profile on mount:", err);
      } finally {
        if (mounted) setDataLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const MAX_FILE_SIZE = 3 * 1024 * 1024;

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(true);
        setSelectedFile(null);
      } else {
        setFileError(false);
        setSelectedFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError || loading) return;
    
    setLoading(true);
    try {
      let finalName = name;
      let finalAvatarUrl = currentAvatarUrl;

      const initialFirstName = getUserFirstNameFromLoginSession() || currentName || '';
      const initialLastName = getUserLastNameFromLoginSession() || '';
      const initialEmail = getUserEmailFromLoginSession() || '';

      // 1. Si el nombre, apellido o email cambiaron, los actualizamos usando la estructura del DTO de la API .NET
      if (name !== initialFirstName || lastName !== initialLastName || email !== initialEmail) {
        const idUser = getUserId();
        await updateUserName({ 
          idUser: Number(idUser),
          newUserName: name,
          newLastName: lastName,
          email: email
        }); 
        
        syncStorageProfileData(name, lastName, email);
        finalName = name;
      }

      // 2. Si se seleccionó una foto, la subimos (el backend espera la clave 'avatar')
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        formData.append('username', finalName);

        const avatarResponse = await ChangeProfileAvatar(formData);
        if (avatarResponse && avatarResponse.success) {
          finalAvatarUrl = avatarResponse.data.avatar_url;
        }
      }

      // Devolvemos ambos valores actualizados al panel principal
      onSuccess(finalName, finalAvatarUrl);

    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', width: '100%' }}>
        <Loading size="large" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <form 
      id={formId} 
      onSubmit={handleSubmit} 
      className={styles.formContainer}
      noValidate
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={loading}
      />
      
      <div className={styles.avatarGroup}>
        {loading ? (
          <div style={{ height: 85, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loading size="large" />
          </div>
        ) : (
          <UserAvatar 
            src={avatarPreview} 
            name={name} 
            size={85} 
            editable={!loading} 
            onEditClick={handleAvatarClick} 
          />
        )}
        
        <span className={`${styles.helperText} ${fileError ? styles.errorText : styles.normalText}`}>
          {fileError ? (
            <>El archivo supera el límite de <span className={styles.boldTextError}>3 MB</span></>
          ) : (
            <>Haz clic en la imagen para cambiarla. Máximo: <span className={styles.boldText}>3 MB</span></>
          )}
        </span>
      </div>
      
      <div className={styles.inputWrapper}>
        <InputWithIcon 
          icon={Pencil} 
          placeholder="Nombre" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          disabled={loading} 
          fullWidth 
        />
      </div>
      
      <div className={styles.inputWrapper}>
        <InputWithIcon 
          icon={Pencil} 
          placeholder="Apellido" 
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading} 
          fullWidth 
        />
      </div>

      <div className={styles.inputWrapper}>
        <InputWithIcon 
          icon={Mail} 
          placeholder="Correo Electrónico" 
          type="text"
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} 
          fullWidth 
        />
      </div>
    </form>
  );
}