import React, { useState, useEffect, useRef } from 'react';
import UserAvatar from '../screens/components/Profile/Avatar/Index';
import styles from './Index.module.css';
import InputWithIcon from '../screens/components/Material-UI/Components/InputWithIcon/Index';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';
import { Pencil, Mail, Phone } from 'lucide-react'; // Agregado el icono Phone
import Loading from '../screens/components/Loading/Index';
import { 
  ChangeProfileAvatar, 
  updateUserName, 
  getUserFirstNameFromLoginSession, 
  getUserLastNameFromLoginSession, 
  getProfile, 
  getUserEmailFromLoginSession, 
  syncStorageProfileData, 
  getUsers 
} from '../../services/api';
import { getUserId } from '../../context/LocalStorage';

const extractList = (res) => {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.result ?? [];
};

export default function EditProfileForm({ 
  currentName, 
  currentAvatarUrl, 
  onSuccess, 
  formId,
  isGroq = false,
  userId = null,
  additionalFields = null,
  onSaveStart = null,
  onSaveEnd = null,
  onError = null,
  selectorProps = null,
  actionButtons = null
}) {
  const [name, setName] = useState(() => {
    if (isGroq) return 'Asistente GROQ (IA)';
    const storedFirst = getUserFirstNameFromLoginSession();
    if (storedFirst) return storedFirst;
    if (currentName) return currentName.trim().split(/\s+/)[0] || '';
    return '';
  });
  const [lastName, setLastName] = useState(() => {
    if (isGroq) return '';
    const storedLast = getUserLastNameFromLoginSession();
    if (storedLast) return storedLast;
    if (currentName) {
      const parts = currentName.trim().split(/\s+/);
      if (parts.length > 1) return parts.slice(1).join(' ');
    }
    return '';
  });
  const [email, setEmail] = useState(() => {
    if (isGroq) return 'ia@groq.com';
    return getUserEmailFromLoginSession() || '';
  });
  
  // Nuevo estado para el teléfono
  const [phone, setPhone] = useState('');
  
  const [avatarPreview, setAvatarPreview] = useState(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [targetUserId, setTargetUserId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let data = null;
        if (isGroq) {
          const res = await getUsers();
          const userList = extractList(res);
          data = userList.find(u => u.rol?.toLowerCase() === 'assistant' || u.email === 'groq@happy-pets.dev');
        } else if (userId) {
          const res = await getUsers();
          const userList = extractList(res);
          data = userList.find(u => String(u.id) === String(userId));
        } else {
          const profile = await getProfile();
          data = profile?.data || profile?.user || profile;
        }

        if (!mounted) return;
        if (data) {
          setTargetUserId(data.id);
          
          let firstName = data.nombre || data.firstName || data.first_name || '';
          let lastNameVal = data.apellido || data.lastName || data.last_name || '';
          let emailVal = data.email || data.correo || '';
          let phoneVal = data.telefono || data.phone || data.numero || ''; // Obtener el teléfono
          
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
          if (phoneVal) setPhone(phoneVal); // Setear el teléfono
          
          if (data.avatarUrl || data.avatar_url || data.avatar) {
            setAvatarPreview(data.avatarUrl || data.avatar_url || data.avatar);
          }
        }
      } catch (err) {
        console.error("Error fetching profile on mount:", err);
      } finally {
        if (mounted) setDataLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isGroq, userId]);

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
    if (onSaveStart) onSaveStart();
    try {
      let finalName = name;
      let finalAvatarUrl = avatarPreview;

      const initialFirstName = getUserFirstNameFromLoginSession() || currentName || '';
      const initialLastName = getUserLastNameFromLoginSession() || '';
      const initialEmail = getUserEmailFromLoginSession() || '';

      const activeUserId = targetUserId || userId || getUserId();
      const isSelf = !isGroq && !userId;
      
      // Siempre ejecutamos la actualización si no es IA, para asegurar que el teléfono se guarde
      // incluso si nombre/apellido/correo no cambiaron pero el teléfono sí.
      if (!isGroq) {
        await updateUserName({ 
          idUser: Number(activeUserId),
          newUserName: name,
          newLastName: lastName,
          email: email,
          newPhone: phone // Enviamos el nuevo teléfono según tu DTO
        }); 
        
        if (isSelf) {
          // Si tienes una función para sincronizar el teléfono en localStorage, deberías agregarla aquí.
          syncStorageProfileData(name, lastName, email);
        }
        finalName = name;
      }

      // 2. Update Profile Avatar
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        formData.append('username', finalName);
        if (!isSelf) {
          formData.append('userId', activeUserId);
        }

        const avatarResponse = await ChangeProfileAvatar(formData);
        if (avatarResponse && avatarResponse.success) {
          finalAvatarUrl = avatarResponse.data?.avatar_url || avatarResponse.data?.avatarUrl;
        }
      }

      if (isGroq) {
        if (finalAvatarUrl) localStorage.setItem('hp_assistant_avatar_url', finalAvatarUrl);
        localStorage.setItem('hp_assistant_name', finalName);
      }

      if (onSuccess) {
        await onSuccess(finalName, finalAvatarUrl);
      }

    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      if (onError) onError(error?.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
      if (onSaveEnd) onSaveEnd();
    }
  };

  if (dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', width: '100%' }}>
        <Loading 
          size="large" 
          variant=''
          text="Cargando perfil..." />
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
            <Loading 
            size="large" />
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
      
      {!isGroq && (
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
      )}

      <div className={styles.inputWrapper}>
        <InputWithIcon 
          icon={Mail} 
          placeholder="Correo Electrónico" 
          type="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} 
          fullWidth 
        />
      </div>

      {/* Nuevo campo de teléfono (oculto para Groq) */}
      {!isGroq && (
        <div className={styles.inputWrapper}>
          <InputWithIcon 
            icon={Phone} 
            placeholder="Teléfono" 
            type="tel"
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading} 
            fullWidth 
          />
        </div>
      )}

      {additionalFields}

      {selectorProps && (
        <div className={styles.inputWrapper} style={{ marginTop: '1.2rem' }}>
          <Selector {...selectorProps} />
        </div>
      )}

      {actionButtons}
    </form>
  );
}
