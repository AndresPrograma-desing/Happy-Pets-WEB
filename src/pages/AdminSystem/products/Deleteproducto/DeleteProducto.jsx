import React from 'react';
import ModalConfirmacion from '../../../../components/DeleteModal/DeleteModal';
import deleteProductoPorNombre from '../../../../hooks/DeleteProducto';
import HistoryTable from '../../../../components/HystoryTable/HistoryTable';
import Notification from '../../../../components/Notification/Notification';

export default function DeleteProducto({ onDeleted } = {}) {
  const [eliminados, setEliminados] = React.useState([]);

  const handleSuccess = (product) => {
    if (typeof onDeleted === 'function') onDeleted(product);
  };

  return (
    <ModalConfirmacion
      triggerText="Eliminar Producto"
      title="Eliminar Producto de Inventario"
      description="Ingrese el nombre exacto del producto para borrarlo:"
      onConfirm={async (name) => {
        const res = await deleteProductoPorNombre(name);
        if (res?.success) handleSuccess(res.product);
        return res;
      }}
    >
      {eliminados.map((producto, index) => (
        <Notification
          key={index}
          title="Producto Eliminado"
          message={`El producto "${producto}" ha sido eliminado correctamente.`}
          duration={3000}
        />
      ))}
    </ModalConfirmacion>
  );
}