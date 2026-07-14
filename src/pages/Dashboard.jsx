import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaBars, FaHome, FaSearch, FaUserAlt, FaSignOutAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { 
  getProductsAPI, 
  getCategoriesAPI, 
  getProductsByCategoryAPI, 
  createProductAPI, 
  updateProductAPI, 
  deleteProductAPI 
} from '../api/products';
import ProductModal from '../components/ProductModal';
import './Dashboard.css';
import DsxModal from '../components/DsxModal';
import Logo from '../assets/logo.png';

function Dashboard() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // MANEJO DE URL 
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Leemos la URL: si dice ?page=2, tomamos el 2. Si no dice nada, por defecto es página 1
  const currentPage = Number(searchParams.get('page')) || 1;
  // Leemos el límite
  const limit = Number(searchParams.get('limit')) || 10;

  // 2. ESTADOS DE LA APLICACIÓN
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  
  //Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
const [dsxConfig, setDsxConfig] = useState({ isOpen: false });
const closeDsxModal = () => setDsxConfig({ ...dsxConfig, isOpen: false });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
const [selectedCategory, setSelectedCategory] = useState('smartphones');

  // Estados para el menú lateral y el Modal CRUD
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Si es null, estamos creando; si tiene datos, estamos editando

  // 3. CARGAR CATEGORÍAS
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategoriesAPI();
        setCategorias(cats);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategories();
  }, []);

  // 4. CARGAR PRODUCTOS 
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // skip = (página actual - 1) * límite
        const skip = (currentPage - 1) * limit;
        let data;

        if (selectedCategory) {
          // Si el usuario eligió una categoría en el select, traemos por categoría
          data = await getProductsByCategoryAPI(selectedCategory, limit, skip);
        } else {
          // Si no, traemos normales o por búsqueda de texto
          data = await getProductsAPI(limit, skip, searchTerm);
        }

        setProductos(data.products || []);
        setTotalRecords(data.total || 0);
      } catch (err) {
        setError('No se pudieron cargar los datos de la API. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, limit, selectedCategory]); // Se dispara automáticamente si cambias de página o filtro

  // 5. FUNCIONES PARA CAMBIAR PARÁMETROS DE LA URL
  const handlePageChange = (newPage) => {
    // Actualizamos la URL preservando el límite actual
    setSearchParams({ page: newPage, limit: limit });
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    // Si cambiamos cuántos ver por página, regresamos a la página 1 en la URL para no quedar en una página vacía
    setSearchParams({ page: 1, limit: newLimit });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Al buscar por texto, reiniciamos la categoría y regresamos a la página 1
    setSelectedCategory('');
    setSearchParams({ page: 1, limit: limit });
    
    // Forzamos la recarga llamando a la API con el texto del input
    setIsLoading(true);
    getProductsAPI(limit, 0, searchTerm)
      .then(data => {
        setProductos(data.products || []);
        setTotalRecords(data.total || 0);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Error al buscar productos');
        setIsLoading(false);
      });
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSearchTerm(''); // Limpiamos el buscador de texto
    setSearchParams({ page: 1, limit: limit });
  };

  // Simulación en API + Actualización Visual en React
  
  // Abrir modal para CREAR
  const handleOpenCreate = () => {
    setEditingProduct(null); // Limpiamos para indicar creación
    setIsModalOpen(true);
  };

  // Abrir modal para EDITAR
  const handleOpenEdit = (producto) => {
    setEditingProduct(producto); // Pasamos los datos del producto a editar
    setIsModalOpen(true);
  };

  // Le agregamos el parámetro "isConfirmed" que por defecto es false
  const handleSaveModal = async (productData, isConfirmed = false) => {
    
    // INTERCEPTOR: Si hay un cero y el usuario no ha confirmado, lanzamos la alerta
    if ((productData.stock === 0 || productData.price === 0) && !isConfirmed) {
      setDsxConfig({
        isOpen: true, 
        tipo: 'advertencia', 
        icono: '⚠️', 
        etiqueta: 'Revisión Manual',
        titulo: '¿Valores en cero?', 
        mensaje: 'Estás a punto de guardar este producto con un precio o stock en 0. ¿Es un artículo gratuito/agotado o fue un error de dedo?',
        badge: { texto: 'Precaución', tipo: 'advertencia' },
        botones: [
          { texto: 'Corregir datos', tipo: 'secundario', onClick: (cerrar) => cerrar() },
          { 
            texto: 'Sí, guardar en 0', 
            tipo: 'primario', 
            onClick: (cerrar) => {
              cerrar(); // Cerramos la advertencia
              handleSaveModal(productData, true); // Volvemos a disparar el guardado, pero ahora saltando la alerta
            }
          }
        ]
      });
      return; // Detenemos la ejecución aquí para que no guarde nada en la API todavía
    }

    // Si ya confirmó o si no había ceros, el flujo sigue normal hacia la API:
    try {
      if (editingProduct) {
        const updatedFromAPI = await updateProductAPI(editingProduct.id, productData);
        setProductos(productos.map(prod => 
  prod.id === editingProduct.id ? { ...prod, ...updatedFromAPI, ...productData } : prod
));
        
        setDsxConfig({
          isOpen: true, tipo: 'exito', icono: '✓', etiqueta: 'Resultado',
          titulo: 'Verificación completa', mensaje: 'Producto modificado con éxito en el sistema.',
          badge: { texto: 'Guardado', tipo: 'exito' },
          botones: [{ texto: 'Aceptar', tipo: 'primario', onClick: (cerrar) => cerrar() }]
        });
      } else {
        const createdFromAPI = await createProductAPI(productData);
        setProductos([createdFromAPI, ...productos]);
        setTotalRecords(prev => prev + 1);
        
        setDsxConfig({
          isOpen: true, tipo: 'exito', icono: '🎉', etiqueta: 'Inventario',
          titulo: 'Producto Agregado', mensaje: 'El nuevo artículo ya está disponible en la base de datos.',
          badge: { texto: 'Nuevo Registro', tipo: 'exito' },
          botones: [{ texto: 'Genial', tipo: 'primario', onClick: (cerrar) => cerrar() }]
        });
      }
      setIsModalOpen(false); // Por fin cerramos el formulario de edición
    } catch (err) {
      setDsxConfig({
        isOpen: true, tipo: 'error', icono: '✕', etiqueta: 'Error',
        titulo: 'No se pudo procesar', mensaje: err.message,
        badge: { texto: 'Fallo de API', tipo: 'error' },
        botones: [{ texto: 'Aceptar', tipo: 'primario', onClick: (cerrar) => cerrar() }]
      });
    }
  };
  // ELIMINAR con confirmación previa
  const handleDelete = (id, title) => {
    // Levantamos el modal de ADVERTENCIA
    setDsxConfig({
      isOpen: true, tipo: 'advertencia', icono: '⚠️', etiqueta: 'Peligro',
      titulo: '¿Eliminar producto?',
      mensaje: `¿Estás seguro de que deseas eliminar "${title}"? Esta acción no se puede deshacer.`,
      badge: { texto: 'Borrado permanente', tipo: 'advertencia' },
      botones: [
        { texto: 'Cancelar', tipo: 'secundario', onClick: (cerrar) => cerrar() },
        { texto: 'Sí, Eliminar', tipo: 'error', onClick: async (cerrar) => {
            cerrar(); // Cerramos el modal primero
            // Aquí va la lógica real de borrado
            try {
              await deleteProductAPI(id);
              setProductos(prev => prev.filter(prod => prod.id !== id));
              setTotalRecords(prev => prev - 1);
            } catch (err) {
              console.error(err);
            }
          }
        }
      ]
    });
  };

  // 7. FUNCIONES DE NAVEGACIÓN Y MENU
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFocusSearch = () => {
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return (
    <div className="dashboard-layout">
      {/* Menú Lateral (Sidebar) */}
      <aside className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-item" onClick={toggleSidebar} title="Menú">
          <span className="sidebar-icon"><FaBars /></span>
          <span className="sidebar-text">Menú</span>
        </div>
        <div className="sidebar-item" onClick={handleLogout} title="Inicio">
          <span className="sidebar-icon"><FaHome /></span>
          <span className="sidebar-text">Inicio</span>
        </div>
        <div className="sidebar-item" onClick={handleFocusSearch} title="Buscar">
          <span className="sidebar-icon"><FaSearch /></span>
          <span className="sidebar-text">Buscar</span>
        </div>
        <div className="sidebar-item bottom" onClick={() => alert('Perfil')} title="Perfil">
          <span className="sidebar-icon"><FaUserAlt /></span>
          <span className="sidebar-text">Perfil</span>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
  <img 
    src="/logo.png" 
    alt="Connect & Play Logo" 
    style={{ 
      height: '55px', 
      objectFit: 'contain',
      transform: 'scale(1.7)', 
      transformOrigin: 'left center',
      marginRight: '10px'
    }} 
  />
  <h2 style={{ margin: 0, fontSize: '1.3rem', lineHeight: '1.1', textAlign: 'left' }}>
    Connect<br/>& Play.
  </h2>
</div>
          
          <nav className="topbar-nav">
            <button className="nav-btn active">INVENTARIO</button>
            <button className="nav-btn" onClick={() => alert('Info en desarrollo')}>INFORMACIÓN</button>
          </nav>

          <div className="topbar-user">
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
              Hola, {user?.firstName || user?.username || 'Admin'}
            </span>
            <img src={user?.image || 'https://via.placeholder.com/40'} alt="Avatar" className="avatar" />
            <button onClick={handleLogout} className="logout-btn" title="Cerrar sesión">
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        <section className="dashboard-body">
          <h1 className="page-title" style={{ marginBottom: '25px' }}>
            Hardware & Recompensas Gamer.
          </h1>

          <div className="controls-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
            
            {/* 1. Filtro por Texto */}
            <form onSubmit={handleSearchSubmit} className="search-box" style={{ display: 'flex', gap: '5px' }}>
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" style={{ padding: '8px 15px', borderRadius: '6px', background: '#6c5ce7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Buscar
              </button>
            </form>

            {/* 2. Filtro por Categoría */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc' }}>
              <label>Categoría:</label>
              <select 
                value={selectedCategory} 
                onChange={handleCategoryChange}
                style={{ padding: '8px 12px', borderRadius: '6px', background: '#2a2a3c', color: 'white', border: '1px solid #444', outline: 'none' }}
              >
                <option value="">-- Todas --</option>
                {categorias.map((cat, idx) => {
                  const catName = typeof cat === 'object' ? cat.name : cat;
                  const catSlug = typeof cat === 'object' ? cat.slug : cat;
                  return <option key={idx} value={catSlug}>{catName}</option>;
                })}
              </select>
            </div>

            {/* 3. Selector de Registros por Página */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc' }}>
              <label>Mostrar:</label>
              <select 
                value={limit} 
                onChange={handleLimitChange}
                style={{ padding: '8px', borderRadius: '6px', background: '#2a2a3c', color: 'white', border: '1px solid #444', outline: 'none' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* 4. BOTÓN NUEVO PRODUCTO */}
            <button 
              onClick={handleOpenCreate} 
              style={{
                background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', 
                color: 'white', 
                border: 'none', 
                padding: '9px 18px',
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                display: 'flex',
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '0.95rem',
                marginLeft: 'auto',
                boxShadow: '0 4px 10px rgba(108, 92, 231, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FaPlus /> Nuevo Producto
            </button>

          </div>

          {/* INDICADOR DE CARGANDO Y MENSAJES DE ERROR */}
          {isLoading && (
            <div style={{ text: 'center', padding: '40px', fontSize: '1.2rem', color: '#00cec9' }}>
              ⏳ Cargando datos desde la API...
            </div>
          )}

          {error && (
            <div style={{ text: 'center', padding: '20px', background: 'rgba(255, 118, 117, 0.2)', color: '#ff7675', borderRadius: '8px', margin: '20px 0' }}>
              ⚠️ {error}
            </div>
          )}

          {/* TABLA DE PRODUCTOS */}
          {!isLoading && !error && (
            <div className="table-container" style={{ marginTop: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length > 0 ? (
                    productos.map((prod) => (
                      <tr key={prod.id}>
                        <td>#{prod.id}</td>
                        <td style={{ fontWeight: 'bold' }}>{prod.title}</td>
                        <td>
                          <span style={{ background: '#2d3436', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                            {prod.category}
                          </span>
                        </td>
                        <td style={{ color: '#00b894', fontWeight: 'bold' }}>${prod.price}</td>
                        
                          
                          
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap', // Evita que el texto se rompa en varias líneas
                            background: prod.stock > 20 ? 'rgba(0, 184, 148, 0.2)' : 'rgba(255, 118, 117, 0.2)',
                            color: prod.stock > 20 ? '#00b894' : '#ff7675',
                            border: `1px solid ${prod.stock > 20 ? '#00b894' : '#ff7675'}`
                          }}>
                            {prod.stock} unids.
                          </span>
                        </td>
                        
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => handleOpenEdit(prod)} 
                            title="Editar"
                            style={{ background: 'transparent', border: 'none', color: '#74b9ff', cursor: 'pointer', fontSize: '1.1rem', marginRight: '15px' }}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(prod.id, prod.title)} 
                            title="Eliminar"
                            style={{ background: 'transparent', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '1.1rem' }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                        No se encontraron productos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* CONTROLES DE PAGINACIÓN */}
          {!isLoading && totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span>Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (Total: {totalRecords} ítems)</span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{ padding: '8px 15px', borderRadius: '6px', background: currentPage <= 1 ? '#333' : '#6c5ce7', color: 'white', border: 'none', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  ◀ Anterior
                </button>

                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{ padding: '8px 15px', borderRadius: '6px', background: currentPage >= totalPages ? '#333' : '#6c5ce7', color: 'white', border: 'none', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente ▶
                </button>
              </div>
            </div>
          )}

        </section>
      </div>

      {/* RENDERIZADO DEL MODAL */}
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveModal}
        initialData={editingProduct}
        categories={categorias}
      />
      <DsxModal config={dsxConfig} onClose={closeDsxModal} />
    </div>
  );
}

export default Dashboard;