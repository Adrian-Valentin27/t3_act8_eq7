import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../api/auth'; 
import { FaWhatsapp, FaTiktok, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.trim() === '' || password.trim() === '') {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const userData = await loginAPI(username, password);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <header className="login-header" style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '40px' }}>
        
        {/* 1. Lado Izquierdo (Empuja el logo hacia el centro) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: '25px' }}>
          <img 
            src="/logo.png" 
            alt="Connect & Play Logo" 
            style={{ 
              height: '88px', 
              width: 'auto',
              transform: 'scale(1.5)',
              transformOrigin: 'right center' 
            }} 
          /> 
        </div>

        <div style={{ flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', lineHeight: '1.1', textAlign: 'left', color: '#fff' }}>
            Connect<br/>& Play.
          </h1>
        </div>
        <div style={{ flex: 1.2 }}></div>

      </header>

      <main className="login-main">
        <div className="login-box">
        {/* Logo centrado en el formulario */}
        <div style={{ textAlign: 'center', marginBottom: '0px' }}>
          <img 
            src="/logo.png" 
            alt="Logo Pequeño" 
            style={{ 
              height: '75px', 
              width: 'auto',
              transform: 'scale(1.3)' 
            }} 
          />
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>¡Bienvenido!</h2>
        
        {/* ... Aquí sigue tu formulario de correo y contraseña ... */}
          <p>Inicia sesión para continuar. Si es la primera vez, crea una cuenta en segundos.</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-message">{error}</p>}

            <input 
              type="text" 
              placeholder="Usuario (Ej. emilys)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            
            <input 
              type="password" 
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <div className="button-group">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
              <button type="button" className="btn-secondary" disabled={isLoading}>
                Recuperar acceso
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        <div className="footer-links">
          <span>Soporte</span> | <span>Políticas de Privacidad</span> | <span>Términos del Servicio</span> | <span>Cookies</span>
        </div>
        
        <div className="footer-register">
          <p>¿No estás registrado?</p>
          <button className="btn-outline">Crea una cuenta</button>
          <p className="free-text">¡Es totalmente gratis!<br/>No lo pienses más, únete a Connect & Play.</p>
        </div>

        <div className="footer-socials">
          <p>Contáctanos:</p>
          <div className="social-icons">
             <div className="icon-circle"><FaWhatsapp /></div>
             <div className="icon-circle"><FaTiktok /></div>
             <div className="icon-circle"><FaInstagram /></div>
             <div className="icon-circle"><FaFacebookF /></div>
             <div className="icon-circle"><FaXTwitter /></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Login;