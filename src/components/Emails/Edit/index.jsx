import React, { useState, useEffect } from 'react';
import DrawPanel from '../../screens/components/DrawPanel';
import { Code, Save, Eye } from 'lucide-react';
import { updateEmailTemplate } from '../../../services/api/emails';
import AlertModal from '../../AlertModal/AlertModal';
import { sampleData, parseEmailTemplate } from '../Templates/utils';
import Button from '../../screens/components/Button/index';
import CodeEditor from './CodeEditor';
import styles from './index.module.css';

export default function EditEmail({ template, isOpen, onClose, onSaveSuccess }) {
  const [htmlCode, setHtmlCode] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (template) {
      setHtmlCode(template.htmlCode);
      setActiveTab('editor');
    }
  }, [template]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...template, htmlCode };
      const response = await updateEmailTemplate(template.id, payload);
      setAlert({ type: 'success', message: 'Plantilla guardada exitosamente.' });
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al guardar la plantilla.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DrawPanel
        isOpen={isOpen}
        onClose={onClose}
        title={`Editando: ${template?.typeEmail || ''}`}
        width="800px"
      >
        <div className={styles.container}>
          <div className={styles.header}>
             <div className={styles.tabs} style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  variant={Button.VARIANTS.TAB}
                  active={activeTab === 'editor'}
                  onClick={() => setActiveTab('editor')}
                  icon={Code}
                >
                  Editor HTML
                </Button>
                <Button 
                  variant={Button.VARIANTS.TAB}
                  active={activeTab === 'preview'}
                  onClick={() => setActiveTab('preview')}
                  icon={Eye}
                >
                  Vista Previa
                </Button>
             </div>
             
            <Button 
              variant={Button.VARIANTS.PRIMARY}
              onClick={handleSave} 
              disabled={saving}
              icon={Save}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>

          <div className={styles.content}>
            {activeTab === 'editor' && (
              <div className={styles.editorWrapper}>
                <p className={styles.instructions}>
                  Edita el código HTML a continuación. <strong>NO</strong> elimines ni modifiques las etiquetas entre llaves <code>{'{{variable}}'}</code>.
                </p>
                <div style={{ flex: 1, display: 'flex' }}>
                  <CodeEditor 
                    value={htmlCode}
                    onChange={(val) => setHtmlCode(val)}
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'preview' && (
              <div className={styles.previewWrapper}>
                <div 
                  className={styles.previewContent}
                  dangerouslySetInnerHTML={{ __html: parseEmailTemplate(htmlCode, sampleData) }}
                />
              </div>
            )}
          </div>
        </div>
      </DrawPanel>

      {alert && (
        <AlertModal 
          open={!!alert} 
          title={alert.type === 'success' ? 'Éxito' : 'Error'} 
          message={alert.message}
          type={alert.type}
          onClose={() => {
            setAlert(null);
            if (alert.type === 'success') onClose();
          }}
        />
      )}
    </>
  );
}
