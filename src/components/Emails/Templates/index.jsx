import React, { useEffect, useState, useMemo } from 'react';
import GenericPanel from '../../GenericPanel/GenericPanel';
import { getEmailsTemplates } from '../../../services/api/emails';
import { parseEmailTemplate, sampleData } from './utils';
import { Mail, Edit2, Eye } from 'lucide-react';
import TableA from '../../screens/components/TableA';
import ModalTooltip from '../../ModalTooltip/ModalTooltip';
import EditEmail from '../Edit/index';

const EmailsTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const pageCount = Math.ceil(templates.length / itemsPerPage);
    const paginatedTemplates = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return templates.slice(start, start + itemsPerPage);
    }, [templates, page]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await getEmailsTemplates();
                if (response?.success && response?.data) {
                    setTemplates(response.data);
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, [isDrawerOpen]); // Re-fetch when drawer closes to get updated data

    const columns = [
        {
            header: 'Tipo de Correo',
            render: (item) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={20} color="#0ea5e9" />
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item.typeEmail}</span>
                </div>
            )
        },
        {
            header: 'Última Actualización',
            render: (item) => new Date(item.update).toLocaleString('es-ES')
        },
        {
            header: 'Acciones',
            align: 'center',
            render: (item) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                        onClick={() => setSelectedTemplate(item)}
                        style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                    >
                        <ModalTooltip text="Vista Previa" position="top">
                            <Eye size={18} color="#0284c7" />
                        </ModalTooltip>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedTemplate(item);
                            setIsDrawerOpen(true);
                        }}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                    >
                        <ModalTooltip text="Editar Plantilla" position="top">
                            <Edit2 size={18} color="#64748b" />
                        </ModalTooltip>
                    </button>
                </div>
            )
        }
    ];

    return (
        <GenericPanel 
            title="Plantillas de Correo" 
            message="Gestiona y visualiza las plantillas de correo electrónico enviadas por el sistema."
            role="admin"
            menuTitle="Panel de Administración"
            showPagination={true}
            paginationCount={pageCount}
            paginationPage={page}
            onPaginationChange={(e, v) => setPage(v)}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <TableA 
                    columns={columns}
                    data={templates}
                    loading={loading}
                    keyExtractor={(item) => item.id}
                />

                {selectedTemplate && !isDrawerOpen && (
                    <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>
                                Vista Previa: {selectedTemplate.typeEmail}
                            </h3>
                            <button 
                                onClick={() => setSelectedTemplate(null)}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cerrar
                            </button>
                        </div>
                        <div style={{ padding: '30px', display: 'flex', justifyContent: 'center' }}>
                            <div 
                                style={{ width: '100%', maxWidth: '600px' }}
                                dangerouslySetInnerHTML={{ __html: parseEmailTemplate(selectedTemplate.htmlCode, sampleData) }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <EditEmail 
                isOpen={isDrawerOpen} 
                template={selectedTemplate} 
                onClose={() => setIsDrawerOpen(false)} 
                onSaveSuccess={() => setIsDrawerOpen(false)}
            />
        </GenericPanel>
    );
};

export default EmailsTemplates;
