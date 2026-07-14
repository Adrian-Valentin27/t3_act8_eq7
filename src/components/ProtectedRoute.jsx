import { Navigate } from 'react-router-dom';

// Este componente recibe la pantalla a la que queremos ir (children)
const ProtectedRoute = ({ children }) => {
  // 1. Revisamos si el usuario guardó sus datos al hacer login
  const user = localStorage.getItem('user');

  // 2. Si no hay usuario, lo pateamos de vuelta al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si sí hay usuario, lo dejamos pasar a la pantalla que pidió
  return children;
};

export default ProtectedRoute;