import React, { useState } from 'react';
import { ProfileAvatar } from 'anteriority-ui';
import useImagePicker from '../../../src/hooks/useImagePicker';
import { uploadMyPetImage } from '../../../src/services/api';

export default function PetAvatarCell({ pet, onUploaded }) {
  const [petImage, setPetImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const picker = useImagePicker(petImage, setPetImage);

  const handleSelect = async (e) => {
    picker.handleSelect(e);
  };

  React.useEffect(() => {
    if (!petImage) return;
    let active = true;
    (async () => {
      setUploading(true);
      setError('');
      try {
        const res = await uploadMyPetImage(pet.id, petImage);
        if (active && res?.image_url) {
          onUploaded?.(pet.id, res.image_url);
        }
      } catch (err) {
        if (active) setError(err?.message || 'No se pudo subir la foto.');
      } finally {
        if (active) {
          setUploading(false);
          picker.clear();
        }
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petImage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <input
        type="file"
        ref={picker.inputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleSelect}
      />
      <ProfileAvatar
        src={picker.preview || pet.imageUrl}
        name={pet.nombre || 'Mascota'}
        size={40}
        editable={!uploading}
        onEditClick={picker.openPicker}
      />
      {error && (
        <span style={{ fontSize: '0.7rem', color: '#d32f2f', maxWidth: 90, textAlign: 'center' }}>{error}</span>
      )}
    </div>
  );
}
