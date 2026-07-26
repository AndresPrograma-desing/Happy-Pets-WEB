import React from "react";
import { useLocation } from 'react-router-dom';
import ProductList from '../../../components/ProductList/ProductList';
import ProductCreate from './Created/ProductCreate';

export default function Products() {
    const location = useLocation();
    const view = location.state?.view || 'list';

    if (view === 'manage') {
        return (
            <ProductCreate hideHeader={true} />
        );
    }

    return (
        <ProductList />
    );
}