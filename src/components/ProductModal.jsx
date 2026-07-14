import { useState, useEffect } from 'react';
import './ProductModal.css';

function ProductModal({ isOpen, onClose, onSubmit, initialData, categories }) {
  // Estados para los campos del producto
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');

  // Este useEffect revisa: ¿estamos editando o creando uno nuevo?
  // Reemplaza el useEffect con esto:
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      
      // FIX: Usamos !== undefined para que el 0 sea aceptado como número válido
      setPrice(initialData.price !== undefined ? initialData.price : '');
      
      const catValue = typeof initialData.category === 'object' ? initialData.category.slug : initialData.category;
      setCategory(catValue || 'laptops');
      
      // FIX: Igual aquí con el stock
      setStock(initialData.stock !== undefined ? initialData.stock : '');
    } else {
      setTitle('');
      setPrice('');
      const firstCat = categories[0];
      const defaultCat = typeof firstCat === 'object' ? firstCat.slug : firstCat;
      setCategory(defaultCat || 'laptops');
      setStock('');
    }
  }, [initialData, isOpen, categories]);

  // Si el modal está cerrado, no renderizamos nada en la pantalla
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // REQUISITO DE LA TAREA: Confirmación antes de editar
  

    // Armamos el objeto con los datos limpios y convertimos números
    const productData = {
      title,
      price: Number(price),
      category,
      stock: Number(stock)
    };

    // Enviamos los datos al Dashboard (al padre)
    onSubmit(productData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{initialData ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto'}</h3>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre del producto:</label>
            <input 
              type="text" 
              placeholder="Ej. iPhone 15, Laptop..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Precio ($):</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Categoría:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map((cat, index) => {
                // Soportamos si DummyJSON manda categorías como texto o como objeto
                const catName = typeof cat === 'object' ? cat.name : cat;
                const catSlug = typeof cat === 'object' ? cat.slug : cat;
                return (
                  <option key={index} value={catSlug}>
                    {catName}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Stock (Cantidad en inventario):</label>
            <input 
              type="number" 
              placeholder="Ej. 50" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              required 
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              {initialData ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;