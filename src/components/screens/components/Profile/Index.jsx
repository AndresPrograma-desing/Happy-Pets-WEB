import React from 'react';
import UserAvatar from './Avatar/Index';
import { Pencil } from 'lucide-react';

export default function UserProfileHeader({ username, avatarUrl, onEditClick }) {
  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '12px',
      height: '100%',
      verticalAlign: 'middle'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <UserAvatar 
          src={avatarUrl} 
          name={username} 
          size={35} 
        />
      </div>
      
      <span style={{ 
        color: '#ffffff', 
        fontWeight: 700, 
        fontSize: '15px',
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none'
      }}>
        {username}
      </span>
      
      <button
        onClick={onEditClick}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0', 
          color: '#ffffff',
          opacity: 0.85,
          transition: 'opacity 0.2s',
          height: '16px',
          width: '16px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
        aria-label="Editar nombre"
      >
        <Pencil size={15} style={{ display: 'block' }} />
      </button>
    </div>
  );
}