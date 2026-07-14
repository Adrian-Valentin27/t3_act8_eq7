import { useEffect, useState } from 'react';
import './DsxModal.css';

const DsxModal = ({ config, onClose }) => {
  // Estado para manejar la animación de entrada
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (config.isOpen) {
      // Pequeño delay para que la clase CSS aplique la transición
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [config.isOpen]);

  if (!config.isOpen) return null;

  return (
    <div className={`dsx-modal-fondo ${isVisible ? 'dsx-activo' : ''}`} onClick={(e) => {
      if (e.target.classList.contains('dsx-modal-fondo') && config.cerrable !== false) onClose();
    }}>
      <div className="dsx-modal-caja">
        {config.cerrable !== false && (
          <button className="dsx-modal-cerrar" onClick={onClose}>&times;</button>
        )}
        
        {config.etiqueta && <div className="dsx-modal-etiqueta">{config.etiqueta}</div>}
        
        {config.icono && (
          <div className="dsx-modal-icono" style={{ 
            color: `var(--dsx-${config.tipo === 'advertencia' ? 'warning' : config.tipo})` 
          }}>
            {config.icono}
          </div>
        )}
        
        {config.titulo && <h3 className="dsx-modal-titulo">{config.titulo}</h3>}
        {config.mensaje && <p className="dsx-modal-mensaje">{config.mensaje}</p>}
        
        {config.badge && (
          <span className={`dsx-badge dsx-${config.badge.tipo || 'info'}`}>
            {config.badge.texto}
          </span>
        )}

        {config.botones && config.botones.length > 0 && (
          <div className="dsx-modal-botones">
            {config.botones.map((btn, index) => (
              <button
                key={index}
                className={`dsx-boton dsx-boton-${btn.tipo || 'primario'}`}
                onClick={() => btn.onClick(onClose)}
              >
                {btn.texto}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DsxModal;