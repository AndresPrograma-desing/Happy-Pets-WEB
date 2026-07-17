import React from "react";
import GenericPanel from '../../../components/GenericPanel/GenericPanel';
import { useLocation } from 'react-router-dom';
import ProductList from '../../../components/ProductList/ProductList';
import ProductCreate from './Created/ProductCreate';

export default function Products() {
    const location = useLocation();
    const view = location.state?.view || 'list';

    if (view === 'manage') {
        return (
            <GenericPanel 
                title="Administrar Productos" 
                role="admin" 
                menuTitle="Panel de Administración"
                showPagination={true}
                paginationCount={10}
                paginationPage={1}
            >
                <ProductCreate hideHeader={true} />
            </GenericPanel>
        );
    }

    return (
        <ProductList />
    );
}