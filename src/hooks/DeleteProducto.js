import { getProducts, adminDeleteProduct } from '../services/api';

/**
 * Busca un producto por nombre, localiza su ID y ejecuta la eliminación.
 */
export default async function deleteProductoPorNombre(nombreArg) {
  // 1. Validación inicial
  if (!nombreArg || nombreArg.trim() === "") {
    return { success: false, message: 'Por favor, ingresa el nombre del producto.' };
  }

  try {
    // 2. Obtener lista de productos desde el servidor
    const response = await getProducts();
    
    // Normalización: .NET suele envolver las listas o enviarlas directo. 
    // Esto cubre todos los casos posibles de tu API.
    const list = Array.isArray(response) 
      ? response 
      : (response?.data || response?.productos || response?.products || []);

    // 3. Buscar el producto (Case Insensitive y sin espacios extra)
    const nombreBusqueda = nombreArg.toLowerCase().trim();
    
    const productoEncontrado = list.find(p => {
      const nombreActual = (p.nombre || p.name || "").toString().toLowerCase().trim();
      return nombreActual === nombreBusqueda;
    });

    if (!productoEncontrado) {
      return { success: false, message: `No se encontró el producto "${nombreArg}" en el inventario.` };
    }

    // 4. Extraer un ID válido para el endpoint /Products/delete/{id}
    // Solo aceptamos llaves de id (no codigo), y preferimos un valor entero.
    const idDetectado = findProductIdDeep(productoEncontrado);
    const idParaEliminar = normalizeId(idDetectado);

    if (idParaEliminar === null) {
      const keys = Object.keys(productoEncontrado || {}).join(', ');
      return { 
        success: false, 
        message: `Se encontró el producto, pero no tiene un ID válido para eliminar. Campos disponibles: ${keys || '(sin campos)'}` 
      };
    }

    // 5. Llamada al API pasándole el ID
    // Esto llama a: DELETE /Products/delete/{id}
    await adminDeleteProduct(idParaEliminar);

    return { 
      success: true, 
      message: `El producto "${productoEncontrado.nombre || nombreArg}" fue eliminado con éxito.`,
      id: idParaEliminar 
    };

  } catch (error) {
    console.error('Error en deleteProductoPorNombre:', error);
    
    // Capturamos el mensaje que configuramos en el BadRequest del Backend
    const errorServer =
      error?.body?.message ||
      error?.body?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'Error de comunicación con el servidor';
    
    return { 
      success: false, 
      message: errorServer 
    };
  }
}

function findProductIdDeep(obj) {
  if (!obj || typeof obj !== 'object') return null;

  // Campos candidatos válidos para id de producto (sin incluir codigo/code)
  const idKeys = ['id', 'Id', '_id', 'productId', 'productoId', 'producto_id'];
  for (const key of idKeys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      const found = findProductIdDeep(value);
      if (found !== null) return found;
    }
  }

  return null;
}

function normalizeId(value) {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Si viene como entero en string, convertirlo para enviar /delete/{id} limpio.
  if (/^\d+$/.test(raw)) return Number(raw);

  // Si no es entero, todavía puede ser válido para ciertos backends; se envía tal cual.
  // En este proyecto, el backend suele validar entero. Si falla, el mensaje del servidor lo indicará.
  return raw;
}