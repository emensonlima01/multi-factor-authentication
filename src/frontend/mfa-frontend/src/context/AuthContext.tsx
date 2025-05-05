import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import type { AuthResponse, User } from '../types/auth';

interface AuthContextProps {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthResponse>;
    verifyOtp: (email: string, otpCode: string, token: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, confirmPassword: string) => Promise<AuthResponse>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se o usuário está autenticado ao carregar a página
        const checkAuth = () => {
            const isAuthenticated = authService.isAuthenticated();
            if (isAuthenticated) {
                // Aqui você pode implementar a lógica para obter as informações do usuário
                // Por enquanto, vamos apenas definir um usuário genérico
                setUser({ name: 'Usuário Autenticado', email: 'usuario@exemplo.com' });
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await authService.login({ email, password });

            // Se não exigir MFA e tiver um usuário, autenticar diretamente
            if (!response.requiresMfa && response.user) {
                setUser(response.user);
            }

            setLoading(false);
            return response;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const verifyOtp = async (email: string, otpCode: string, token: string) => {
        setLoading(true);
        try {
            console.log('AuthContext: Verificando OTP', { email, otpCode });
            const response = await authService.verifyOtp({ email, otpCode, token });

            if (response.user) {
                console.log('AuthContext: Usuário autenticado com sucesso', response.user);
                setUser(response.user);
            } else {
                console.warn('AuthContext: Resposta sem dados do usuário', response);
            }

            setLoading(false);
            return true;
        } catch (error: any) {
            setLoading(false);
            console.error('AuthContext: Erro ao verificar OTP', error);

            // Retornar false em vez de lançar uma exceção para permitir tratamento de erro mais flexível
            if (error.response?.status === 401 || error.response?.status === 400) {
                console.log('AuthContext: Erro de verificação OTP', error.response?.data);
                return false;
            }

            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, confirmPassword: string) => {
        setLoading(true);
        try {
            const response = await authService.register({ name, email, password, confirmPassword });
            setLoading(false);
            return response;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const contextValue: AuthContextProps = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        verifyOtp,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
