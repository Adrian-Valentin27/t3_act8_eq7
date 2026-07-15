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
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  // 2. ESTADOS DE LA APLICACIÓN
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  
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
  const [editingProduct, setEditingProduct] = useState(null); 

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
        const skip = (currentPage - 1) * limit;
        let data;

        if (selectedCategory) {
          data = await getProductsByCategoryAPI(selectedCategory, limit, skip);
        } else {
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
  }, [currentPage, limit, selectedCategory]); 

  // 5. FUNCIONES PARA CAMBIAR PARÁMETROS DE LA URL
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, limit: limit });
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setSearchParams({ page: 1, limit: newLimit });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedCategory('');
    setSearchParams({ page: 1, limit: limit });
    
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
    setSearchTerm(''); 
    setSearchParams({ page: 1, limit: limit });
  };

  const handleOpenCreate = () => {
    setEditingProduct(null); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (producto) => {
    setEditingProduct(producto); 
    setIsModalOpen(true);
  };

  const handleSaveModal = async (productData, isConfirmed = false) => {
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
              cerrar(); 
              handleSaveModal(productData, true); 
            }
          }
        ]
      });
      return; 
    }

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
      setIsModalOpen(false); 
    } catch (err) {
      setDsxConfig({
        isOpen: true, tipo: 'error', icono: '✕', etiqueta: 'Error',
        titulo: 'No se pudo procesar', mensaje: err.message,
        badge: { texto: 'Fallo de API', tipo: 'error' },
        botones: [{ texto: 'Aceptar', tipo: 'primario', onClick: (cerrar) => cerrar() }]
      });
    }
  };

  const handleDelete = (id, title) => {
    setDsxConfig({
      isOpen: true, tipo: 'advertencia', icono: '⚠️', etiqueta: 'Peligro',
      titulo: '¿Eliminar producto?',
      mensaje: `¿Estás seguro de que deseas eliminar "${title}"? Esta acción no se puede deshacer.`,
      badge: { texto: 'Borrado permanente', tipo: 'advertencia' },
      botones: [
        { texto: 'Cancelar', tipo: 'secundario', onClick: (cerrar) => cerrar() },
        { texto: 'Sí, Eliminar', tipo: 'error', onClick: async (cerrar) => {
            cerrar(); 
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
        
        {/* 🚀 HEADER CORREGIDO: Flex wrap para adaptarse a pantallas móviles sin encimarse */}
        <header className="topbar" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '15px',
          padding: '10px 15px'
        }}>
          <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={Logo || "/logo.png"} 
              alt="Connect & Play Logo" 
              style={{ 
                height: '45px', 
                objectFit: 'contain'
              }} 
            />
            <h2 style={{ margin: 0, fontSize: '1.2rem', lineHeight: '1.1', textAlign: 'left', whiteSpace: 'nowrap' }}>
              Connect<br/>& Play.
            </h2>
          </div>
          
          <nav className="topbar-nav" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button className="nav-btn active" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>INVENTARIO</button>
            <button className="nav-btn" onClick={() => alert('Info en desarrollo')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>INFORMACIÓN</button>
          </nav>

          <div className="topbar-user" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              Hola, {user?.firstName || user?.username || 'Admin'}
            </span>
            <img src={user?.image || 'https://via.placeholder.com/40'} alt="Avatar" className="avatar" style={{ width: '35px', height: '35px', borderRadius: '50%' }} />
            <button onClick={handleLogout} className="logout-btn" title="Cerrar sesión" style={{ background: 'transparent', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '1.2rem', display: 'flex' }}>
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        <section className="dashboard-body" style={{ padding: '15px' }}>
          <h1 className="page-title" style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
            Hardware & Recompensas Gamer.
          </h1>

          {/* 🚀 CONTROLES CORREGIDOS: Se acomodan en bloque o en línea según el espacio */}
          <div className="controls-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
            
            {/* 1. Filtro por Texto */}
            <form onSubmit={handleSearchSubmit} className="search-box" style={{ display: 'flex', gap: '5px', flex: '1 1 250px' }}>
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: '#2a2a3c', color: 'white', border: '1px solid #444', outline: 'none' }}
              />
              <button type="submit" style={{ padding: '8px 15px', borderRadius: '6px', background: '#6c5ce7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Buscar
              </button>
            </form>

            {/* 2. Filtro por Categoría */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', flexWrap: 'nowrap' }}>
              <label style={{ whiteSpace: 'nowrap' }}>Categoría:</label>
              <select 
                value={selectedCategory} 
                onChange={handleCategoryChange}
                style={{ padding: '8px 12px', borderRadius: '6px', background: '#2a2a3c', color: 'white', border: '1px solid #444', outline: 'none', maxWidth: '160px' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', flexWrap: 'nowrap' }}>
              <label style={{ whiteSpace: 'nowrap' }}>Mostrar:</label>
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
                transition: 'transform 0.2s',
                whiteSpace: 'nowrap'
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

          {/* 🚀 TABLA CORREGIDA: Envuelta en un contenedor con overflow-x: auto para el scroll horizontal en teléfonos */}
          {!isLoading && !error && (
            <div className="table-container" style={{ marginTop: '20px', width: '100%', overflowX: 'auto', borderRadius: '8px', border: '1px solid #333' }}>
              <table className="data-table" style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1e1e2d', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Producto</th>
                    <th style={{ padding: '12px' }}>Categoría</th>
                    <th style={{ padding: '12px' }}>Precio</th>
                    <th style={{ padding: '12px' }}>Stock</th>
                    <th style={{ textAlign: 'center', padding: '12px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length > 0 ? (
                    productos.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #2a2a3c' }}>
                        <td style={{ padding: '12px' }}>#{prod.id}</td>
                        <td style={{ fontWeight: 'bold', padding: '12px' }}>{prod.title}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#2d3436', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                            {prod.category}
                          </span>
                        </td>
                        <td style={{ color: '#00b894', fontWeight: 'bold', padding: '12px' }}>${prod.price}</td>
                        
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap', 
                            background: prod.stock > 20 ? 'rgba(0, 184, 148, 0.2)' : 'rgba(255, 118, 117, 0.2)',
                            color: prod.stock > 20 ? '#00b894' : '#ff7675',
                            border: `1px solid ${prod.stock > 20 ? '#00b894' : '#ff7675'}`
                          }}>
                            {prod.stock} unids.
                          </span>
                        </td>
                        
                        <td style={{ textAlign: 'center', padding: '12px', whiteSpace: 'nowrap' }}>
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
            <div className="pagination" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (Total: {totalRecords} ítems)</span>
              
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