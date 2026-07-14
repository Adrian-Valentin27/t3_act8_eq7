const BASE_URL = 'https://dummyjson.com/products';

// 1. Obtener productos con paginación y búsqueda
export const getProductsAPI = async (limit = 10, skip = 0, search = '') => {
  try {
    // Si hay texto en el buscador, usamos el endpoint de búsqueda, si no, el normal
    const url = search 
      ? `${BASE_URL}/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`
      : `${BASE_URL}?limit=${limit}&skip=${skip}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener los productos');
    const data = await response.json();
    return data; // Retorna: { products: [...], total, skip, limit }
  } catch (error) {
    throw error;
  }
};

// 2. Obtener lista de categorías para el filtro
export const getCategoriesAPI = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error('Error al obtener categorías');
    const data = await response.json();
    return data; // Retorna un arreglo de objetos o strings con las categorías
  } catch (error) {
    throw error;
  }
};

// 3. Obtener productos filtrados por categoría (también con paginación)
export const getProductsByCategoryAPI = async (category, limit = 10, skip = 0) => {
  try {
    const response = await fetch(`${BASE_URL}/category/${category}?limit=${limit}&skip=${skip}`);
    if (!response.ok) throw new Error('Error al obtener productos por categoría');
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// 4. Crear un nuevo producto (Simulación POST)
export const createProductAPI = async (newProduct) => {
  try {
    const response = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    if (!response.ok) throw new Error('Error al crear el producto');
    const data = await response.json();
    return data; // Devuelve el producto con un nuevo ID simulado
  } catch (error) {
    throw error;
  }
};

// 5. Editar un producto existente (Simulación PUT)
export const updateProductAPI = async (id, updatedData) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) throw new Error('Error al actualizar el producto');
    const data = await response.json();
    return data; // Devuelve el producto modificado
  } catch (error) {
    throw error;
  }
};

// 6. Eliminar un producto (Simulación DELETE)
export const deleteProductAPI = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el producto');
    const data = await response.json();
    return data; // Devuelve el producto eliminado y isDeleted: true
  } catch (error) {
    throw error;
  }
};