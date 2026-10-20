import React, { useState } from 'react';
// import styles from '../../Index.module.css';
import DrawPanel from '../../../src/components/screens/components/DrawPanel';
import ToggleCard from '../../../src/components/screens/components/ToggleCard/index';
import Input from '../../../src/components/screens/components/Input/Index';
import Button from '../../../src/components/screens/components/Button/index';
import Barnner from '../../../src/components/screens/components/Barnner';

// Icons
import { Phone, Mail, MapPin, Clock, AlertTriangle, Send } from 'lucide-react';
import { TEXT_PORTAL } from '../../Constants';

export default function ContactsPanel({ isOpen, onClose }) {
  // Email form state
  const [emailForm, setEmailForm] = useState({ email: '', cedula: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.cedula || !emailForm.message) return;
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      setEmailSent(true);
      setEmailForm({ email: '', cedula: '', message: '' });
      setTimeout(() => setEmailSent(false), 4000); // clear success message after 4s
    }, 2000);
  };

  return (
      <DrawPanel 
        isOpen={isOpen} 
        title={TEXT_PORTAL.contacts.panelTitle}
        onClose={onClose}
        showActions={false}
        width="450px"
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <ToggleCard
            title="Teléfono"
            description={TEXT_PORTAL.contacts.phone}
            icon={Phone}
          />

          <ToggleCard
            title="Correo Electrónico"
            description={TEXT_PORTAL.contacts.email}
            icon={Mail}
          />

          <ToggleCard
            title="Dirección"
            description={TEXT_PORTAL.contacts.address}
            icon={MapPin}
          />

          <ToggleCard
            title="Horario de Atención"
            description={TEXT_PORTAL.contacts.hours}
            icon={Clock}
          />

          <ToggleCard
            title="Urgencias Veterinarias"
            description={TEXT_PORTAL.contacts.emergency}
            icon={AlertTriangle}
          />

          <ToggleCard
            title={TEXT_PORTAL.contacts.emailForm.title}
            description={TEXT_PORTAL.contacts.emailForm.description}
            icon={Send}
          >
            {emailSent ? (
              <Barnner type="success">
                {TEXT_PORTAL.contacts.emailForm.successMessage}
              </Barnner>
            ) : (
              <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1rem 0' }}>
                <Input 
                  type="email" 
                  required 
                  label={TEXT_PORTAL.contacts.emailForm.emailLabel}
                  placeholder={TEXT_PORTAL.contacts.emailForm.emailPlaceholder}
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                />
                <Input 
                  type="text" 
                  required 
                  label={TEXT_PORTAL.contacts.emailForm.cedulaLabel}
                  placeholder={TEXT_PORTAL.contacts.emailForm.cedulaPlaceholder}
                  value={emailForm.cedula}
                  onChange={(e) => setEmailForm({...emailForm, cedula: e.target.value})}
                />
                <Input 
                  required 
                  multiline
                  rows={4}
                  label={TEXT_PORTAL.contacts.emailForm.messageLabel}
                  placeholder={TEXT_PORTAL.contacts.emailForm.messagePlaceholder}
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                />
                <Button 
                  type="submit" 
                  variant={Button.VARIANTS.PRIMARY}
                  color={Button.COLORS.GREEN}
                  icon={Send}
                  disabled={sendingEmail}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {sendingEmail ? TEXT_PORTAL.contacts.emailForm.sending : TEXT_PORTAL.contacts.emailForm.sendButton}
                </Button>
              </form>
            )}
          </ToggleCard>

        </div>
      </DrawPanel>
  );
}
