import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, loading } = useAuth();

    // Se ainda está carregando a autenticação, pode mostrar um spinner ou tela de carregamento
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Redireciona para a página de login se o usuário não estiver autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Renderiza o componente filho se o usuário estiver autenticado
    return <>{children}</>;
};

export default ProtectedRoute;
