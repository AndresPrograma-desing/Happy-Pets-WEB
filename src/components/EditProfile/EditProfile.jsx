import React, { useState, useRef } from 'react';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import styles from './Index.module.css';
import InputWithIcon from '../screens/components/Material-UI/Components/InputWithIcon/Index';
import { Pencil } from 'lucide-react';
import Loading from '../screens/components/Loading/Index';
import { ChangeProfileAvatar, updateUserName } from '../../services/api';
import { getUserId } from '../../context/LocalStorage';

export default function EditProfileForm({ 
  currentName, 
  currentAvatarUrl, 
  onSuccess, 
  formId 
}) {
  const [name, setName] = useState(currentName || '');
  const [avatarPreview, setAvatarPreview] = useState(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState(false);
  const fileInputRef = useRef(null);

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
      let finalName = currentName;
      let finalAvatarUrl = currentAvatarUrl;

      // 1. Si el nombre cambió, lo actualizamos usando la estructura del DTO de la API .NET
      if (name !== currentName) {
        const idUser = getUserId();
        await updateUserName({ 
          idUser: Number(idUser),
          newUserName: name 
        }); 
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

  return (
    <form 
      id={formId} 
      onSubmit={handleSubmit} 
      className={styles.formContainer}
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
          placeholder="Nombre de usuario" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          disabled={loading} 
          fullWidth 
        />
      </div>
    </form>
  );
}